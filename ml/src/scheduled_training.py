import os
import pandas as pd
import joblib
import numpy as np
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment
root_dir = Path(__file__).parent.parent.parent
dotenv_path = root_dir / ".env"
load_dotenv(dotenv_path=dotenv_path)

model_path = "data/export/random_forest_model.pkl"

# Load model
model = joblib.load(model_path)

# Get expected features (if available)
if hasattr(model, 'feature_names_in_'):
    expected_features = model.feature_names_in_.tolist()
else:
    raise ValueError("Model does not have 'feature_names_in_' attribute.")

# Connect to Supabase
url = os.getenv("VITE_SUPABASE_DEV_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE")
supabase: Client = create_client(url, key)

# 1. Determine target season (e.g., current season or season with no predictions yet)
# Here we'll get the latest season
# response = supabase.table("seasons").select("id").order("start_date", desc=True).limit(1).execute()
# if not response.data:
#     print("No seasons found")
#     exit()
# target_season_id = response.data[0]["id"]
target_season_id = 24
print(f"Target season ID: {target_season_id}")

# 2. Fetch data from flattened view for this season, excluding records that already have harvest records (or not)
# We want fields that have no harvest data but have other activities.
# The flattened view returns one row per field-season, so we can filter on harvest_date IS NULL.
query = supabase.from_("flattened_field_data")\
    .select("*")\
    .eq("season_id", target_season_id)\
    .is_("harvest_date", "null")\
    .execute()

data = query.data
if not data:
    print("No fields to predict for this season")
    exit()

df_raw = pd.DataFrame(data)
print(f"Fetched {len(df_raw)} rows for prediction")

# 3. Build a DataFrame with all expected features, initialized to 0
X = pd.DataFrame(0, index=df_raw.index, columns=expected_features)

# 4. Fill numeric features directly
numeric_features = [
    'total_field_area_ha',
    'seedling_age_at_transplanting',
    'distance_between_plant_row_1',
    'distance_between_plant_row_2',
    'distance_between_plant_row_3',
    'distance_within_plant_row_1',
    'distance_within_plant_row_2',
    'distance_within_plant_row_3',
    'seeding_rate_kg_ha',
    'num_plants_1',
    'num_plants_2',
    'num_plants_3',
    'average_number_of_plants',
    'monitoring_field_area_sqm',
    'applied_area_sqm',
    'nitrogen_content_pct_1',
    'phosphorus_content_pct_1',
    'potassium_content_pct_1',
    'amount_applied_1',
    'amount_applied_2',
    'amount_applied_3',
]
for col in numeric_features:
    if col in expected_features and col in df_raw.columns:
        X[col] = df_raw[col].fillna(0)
    else:
        # Derived feature – skip for now
        pass

# 5. Fill one-hot encoded categorical columns
# Build mapping from column name to (prefix, value)
prefix_value = {}
for col in expected_features:
    if '_' in col:
        parts = col.split('_', 1)
        prefix = parts[0]
        value = parts[1]
        prefix_value[col] = (prefix, value)

# Categorical fields present in the data
categorical_fields = [
    'barangay',
    'municity',
    'province',
    'rice_variety',
    'seed_class',
    'ecosystem',
    'current_field_condition',
    'crop_status',
    'cause',
    'fertilizer_type_1',
    'fertilizer_type_2',
    'fertilizer_type_3',
    'crop_stage_on_application_1',
    'crop_stage_on_application_2',
    'crop_stage_on_application_3',
    'type_of_irrigation',
    'source_of_irrigation',
    'crop_planted',
    'soil_type',
    'est_crop_establishment_method',
    'actual_crop_establishment_method',
    'direct_seeding_method',
    'harvesting_method',
    'irrigation_supply',
    'gender'
]

# For each categorical field, set the one-hot column to 1 where the actual value matches
for field in categorical_fields:
    mask = df_raw[field].notna()
    values = df_raw.loc[mask, field].astype(str)
    for idx, value in values.items():
        col_name = f"{field}_{value}"
        if col_name in expected_features:
            X.loc[idx, col_name] = 1

# 6. Fill boolean features
if 'is_transplanted' in expected_features:
    X['is_transplanted'] = (df_raw['actual_crop_establishment_method'].str.contains('transplant', case=False, na=False)).astype(int)
if 'has_damage' in expected_features:
    X['has_damage'] = (df_raw['cause'].notna()).astype(int)

# 7. Fill any remaining missing values with 0 (simple imputation)
X = X.fillna(0)

# 8. Predict
predictions = model.predict(X)

# 9. Upsert predictions into predicted_yields table
records = []
for i, row in df_raw.iterrows():
    records.append({
        "mfid_id": row["mfid_id"],
        "season_id": target_season_id,
        "predicted_yield_t_ha": float(predictions[i]) / 1000,
    })

# Upsert in batches
batch_size = 500
for i in range(0, len(records), batch_size):
    batch = records[i:i+batch_size]
    try:
        result = supabase.table("predicted_yields").upsert(batch, on_conflict="mfid_id,season_id").execute()
        print(f"Upserted batch {i//batch_size + 1}")
    except Exception as e:
        print(f"Error upserting batch {i//batch_size + 1}: {e}")

print(f"Stored {len(records)} predictions for season {target_season_id}.")

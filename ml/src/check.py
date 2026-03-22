import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------
DATA_PATH = "data/merged.csv"
TARGET = "yield_t_per_ha"               # target variable
RANDOM_STATE = 42
TEST_SIZE = 0.2                       # for splitting; adjust as needed

# ------------------------------------------------------------
# Load and clean data
# ------------------------------------------------------------
df = pd.read_csv(DATA_PATH)

# Rename conflicting column
df = df.rename(columns={'soil_type.1': 'm6_soil_type'})

# Drop columns that are not features (IDs, personal info, collection metadata)
drop_cols = [
    'mfid', 'first_name', 'last_name', 'date_of_birth', 'gender', 'cellphone_no',
    'gps_latitude', 'gps_longitude', 'average_number_of_plants',
    'm1_collected_at', 'm1_collected_by', 'm2_collected_at', 'm2_collected_by',
    'm3_collected_at', 'm3_collected_by', 'm4_collected_at', 'm4_collected_by',
    'm6_collected_at', 'm6_collected_by', 'rice_variety_no', 'source_of_good_seeds',
        'collected_at_m1', 'collected_by_m1',
        'collected_at_m2', 'collected_by_m2',
        'collected_at_m3', 'collected_by_m3',
        'collected_at_m4', 'collected_by_m4',
        'collected_at_m6', 'collected_by_m6',
        'production_t',
        'yield_kg_per_ha_t_per_ha',
        'synced_at_x',
        'synced_at_y',
        'synced_at',

]
df = df.drop(columns=drop_cols, errors='ignore')

# ------------------------------------------------------------
# Convert date columns to datetime
# ------------------------------------------------------------
date_cols = [
    'land_preparation_start_date',
    'est_crop_establishment_date',
    'actual_crop_establishment_date',
    'sowing_date',
    'harvest_date'
]
for col in date_cols:
    df[col] = pd.to_datetime(df[col].astype(str).str.strip(), errors='coerce')

# Convert other numeric columns
if 'monitoring_field_area_sqm' in df.columns:
    df['monitoring_field_area_sqm'] = pd.to_numeric(df['monitoring_field_area_sqm'], errors='coerce')

if 'rice_variety_maturity_duration' in df.columns:
    df['rice_variety_maturity_duration'] = pd.to_numeric(df['rice_variety_maturity_duration'], errors='coerce')

# ------------------------------------------------------------
# Create target variable
# ------------------------------------------------------------
df['bags_harvested'] = pd.to_numeric(df['bags_harvested'], errors='coerce')
df['avg_bag_weight_kg'] = pd.to_numeric(df['avg_bag_weight_kg'], errors='coerce')
df['area_harvested_ha'] = pd.to_numeric(df['area_harvested_ha'], errors='coerce')
df['total_yield_kg'] = df['bags_harvested'] * df['avg_bag_weight_kg']
df[TARGET] = df['total_yield_kg'] / df['area_harvested_ha']
df = df[df[TARGET].notna()].copy()


# ------------------------------------------------------------
# 1. Temporal features (growing duration)
# ------------------------------------------------------------
df['days_land_prep_to_est_estab'] = (df['est_crop_establishment_date'] - df['land_preparation_start_date']).dt.days
df['days_land_prep_to_actual_estab'] = (df['actual_crop_establishment_date'] - df['land_preparation_start_date']).dt.days
df['days_est_to_actual_estab'] = (df['actual_crop_establishment_date'] - df['est_crop_establishment_date']).dt.days
df['days_estab_to_harvest'] = (df['harvest_date'] - df['actual_crop_establishment_date']).dt.days
df['total_growing_days'] = (df['harvest_date'] - df['land_preparation_start_date']).dt.days
df = df[df['total_growing_days'] >= 0]
df = df[df['total_field_area_ha'] <= 2.0]

# df = df[df['municity'] != "New Washington"]

# Seasonal features
df['planting_month'] = df['actual_crop_establishment_date'].dt.month
# df['harvest_month'] = df['harvest_date'].dt.month

# Drop original date columns (they are no longer needed)
df = df.drop(columns=date_cols, errors='ignore')

df = df.drop(columns=[ 'harvest_date', 'harvesting_method', 'avg_bag_weight_kg', 'bags_harvested', 'irrigation_supply', 'area_harvested_ha', 'total_yield_kg', 'total_field_area_ha'], errors='ignore')

# ------------------------------------------------------------
# 2. Planting method specific fields
# ------------------------------------------------------------
df['is_transplanted'] = (df['actual_crop_establishment_method'] == 'transplanted').astype(int)

if 'seedling_age_at_transplanting' in df.columns:
    df['seedling_age_at_transplanting'] = pd.to_numeric(df['seedling_age_at_transplanting'], errors='coerce').fillna(0)

row_cols = ['distance_between_plant_row_1', 'distance_between_plant_row_2', 'distance_between_plant_row_3']
if all(c in df.columns for c in row_cols):
    for c in row_cols:
        df[c] = pd.to_numeric(df[c], errors='coerce')
    df['avg_row_spacing'] = df[row_cols].mean(axis=1, skipna=True).fillna(0)

within_cols = ['distance_within_plant_row_1', 'distance_within_plant_row_2', 'distance_within_plant_row_3']
if all(c in df.columns for c in within_cols):
    for c in within_cols:
        df[c] = pd.to_numeric(df[c], errors='coerce')
    df['avg_within_spacing'] = df[within_cols].mean(axis=1, skipna=True).fillna(0)

if 'seeding_rate_kg_ha' in df.columns:
    df['seeding_rate_kg_ha'] = pd.to_numeric(df['seeding_rate_kg_ha'], errors='coerce').fillna(0)
if 'direct_seeding_method' in df.columns:
    df = pd.get_dummies(df, columns=['direct_seeding_method'], prefix='ds_method', drop_first=True)

plant_cols = ['num_plants_1', 'num_plants_2', 'num_plants_3']
if all(c in df.columns for c in plant_cols):
    for c in plant_cols:
        df[c] = pd.to_numeric(df[c], errors='coerce')
    df['avg_num_plants'] = df[plant_cols].mean(axis=1, skipna=True).fillna(0)

drop_spacing = row_cols + within_cols + plant_cols
df = df.drop(columns=[c for c in drop_spacing if c in df.columns], errors='ignore')

# ------------------------------------------------------------
# 3. Fertilizer applications (aggregation)
# ------------------------------------------------------------
app1 = ['brand_1', 'nitrogen_content_pct_1', 'phosphorus_content_pct_1', 'potassium_content_pct_1',
        'amount_applied_1', 'amount_unit_1', 'crop_stage_on_application_1', 'fertilizer_type_1']
app2 = ['brand_2', 'nitrogen_content_pct_2', 'phosphorus_content_pct_2', 'potassium_content_pct_2',
        'amount_applied_2', 'amount_unit_2', 'crop_stage_on_application_2', 'fertilizer_type_2']
app3 = ['brand_3', 'nitrogen_content_pct_3', 'phosphorus_content_pct_3', 'potassium_content_pct_3',
        'amount_applied_3', 'amount_unit_3', 'crop_stage_on_application_3', 'fertilizer_type_3']

def convert_amount(row, amount_col, unit_col):
    amt = row[amount_col]
    if pd.isna(amt):
        return np.nan
    unit = row[unit_col]
    if pd.isna(unit):
        return amt
    unit = unit.lower().strip()
    if unit == 'kg':
        return amt
    elif unit == 'sack':
        return amt * 50
    else:
        return amt

for i, apps in enumerate([app1, app2, app3], 1):
    for col in ['nitrogen_content_pct', 'phosphorus_content_pct', 'potassium_content_pct', 'amount_applied']:
        col_name = f'{col}_{i}'
        if col_name in df.columns:
            df[col_name] = pd.to_numeric(df[col_name], errors='coerce')
    amount_col = f'amount_applied_{i}'
    unit_col = f'amount_unit_{i}'
    if amount_col in df.columns and unit_col in df.columns:
        df[f'amount_kg_{i}'] = df.apply(lambda r: convert_amount(r, amount_col, unit_col), axis=1)
        df[f'N_kg_{i}'] = df[f'amount_kg_{i}'] * (df[f'nitrogen_content_pct_{i}'] / 100)
        df[f'P_kg_{i}'] = df[f'amount_kg_{i}'] * (df[f'phosphorus_content_pct_{i}'] / 100)
        df[f'K_kg_{i}'] = df[f'amount_kg_{i}'] * (df[f'potassium_content_pct_{i}'] / 100)

n_apps = [f'N_kg_{i}' for i in range(1,4) if f'N_kg_{i}' in df.columns]
p_apps = [f'P_kg_{i}' for i in range(1,4) if f'P_kg_{i}' in df.columns]
k_apps = [f'K_kg_{i}' for i in range(1,4) if f'K_kg_{i}' in df.columns]
if n_apps:
    df['total_N_kg'] = df[n_apps].sum(axis=1, min_count=1)
if p_apps:
    df['total_P_kg'] = df[p_apps].sum(axis=1, min_count=1)
if k_apps:
    df['total_K_kg'] = df[k_apps].sum(axis=1, min_count=1)
df['num_fert_apps'] = df[[f'amount_kg_{i}' for i in range(1,4) if f'amount_kg_{i}' in df.columns]].notna().sum(axis=1)

stage_cols = [f'crop_stage_on_application_{i}' for i in range(1,4) if f'crop_stage_on_application_{i}' in df.columns]
if stage_cols:
    stages = df[stage_cols].stack().dropna().unique()
    for stage in stages:
        df[f'fert_stage_{stage}'] = df[stage_cols].eq(stage).any(axis=1).astype(int)

fert_type_cols = [f'fertilizer_type_{i}' for i in range(1,4) if f'fertilizer_type_{i}' in df.columns]
if fert_type_cols:
    fert_types = df[fert_type_cols].stack().dropna().unique()
    for ft in fert_types:
        df[f'fert_type_{ft}'] = df[fert_type_cols].eq(ft).any(axis=1).astype(int)

fert_cols = [c for i in range(1,4) for c in [f'brand_{i}', f'nitrogen_content_pct_{i}', f'phosphorus_content_pct_{i}',
             f'potassium_content_pct_{i}', f'amount_applied_{i}', f'amount_unit_{i}',
             f'crop_stage_on_application_{i}', f'fertilizer_type_{i}'] if c in df.columns]
df = df.drop(columns=fert_cols, errors='ignore')

# ------------------------------------------------------------
# 4. Damage assessment
# ------------------------------------------------------------
df['has_damage'] = (~df['cause'].isna()).astype(int)
if 'cause' in df.columns:
    df = pd.get_dummies(df, columns=['cause'], prefix='damage_cause', drop_first=True)
if 'severity' in df.columns:
    df = pd.get_dummies(df, columns=['severity'], prefix='damage_severity', drop_first=True)
if 'crop_stage' in df.columns:
    df = pd.get_dummies(df, columns=['crop_stage'], prefix='damage_stage', drop_first=True)
damage_cols = ['cause', 'severity', 'm6_soil_type', 'crop_stage', 'affected_area_ha', 'observed_pest']
df = df.drop(columns=[c for c in damage_cols if c in df.columns], errors='ignore')

# ------------------------------------------------------------
# 5. Additional derived features
# ------------------------------------------------------------
if 'applied_area_sqm' in df.columns:
    df['applied_area_sqm'] = pd.to_numeric(df['applied_area_sqm'], errors='coerce')
    # df['applied_area_ratio'] = df['applied_area_sqm'] / (df['total_field_area_ha'] * 10000)
    # df['applied_area_ratio'] = df['applied_area_ratio'].clip(0, 1)
    df = df.drop(columns=['applied_area_sqm'], errors='ignore')

# ------------------------------------------------------------
# 6. Handle remaining numeric missing values
# ------------------------------------------------------------
numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
numeric_cols = [c for c in numeric_cols if c != TARGET]
for col in numeric_cols:
    if df[col].isnull().any():
        df[col] = df[col].fillna(df[col].median())

# ------------------------------------------------------------
# 7. Split and encode categorical variables
# ------------------------------------------------------------


X = df.drop(columns=[TARGET])
y = df[TARGET]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
)

cat_cols = X_train.select_dtypes(include=['object']).columns.tolist()
if cat_cols:
    X_train = pd.get_dummies(X_train, columns=cat_cols, drop_first=True)
    X_test = pd.get_dummies(X_test, columns=cat_cols, drop_first=True)

    # Align columns
    missing_cols = set(X_train.columns) - set(X_test.columns)
    for col in missing_cols:
        X_test[col] = 0
    missing_cols = set(X_test.columns) - set(X_train.columns)
    for col in missing_cols:
        X_train[col] = 0
    X_train = X_train[X_train.columns.intersection(X_test.columns).union(X_test.columns)]
    X_test = X_test[X_train.columns]

# ------------------------------------------------------------
# 8. Save processed data
# ------------------------------------------------------------
X_train.to_csv("data/export/X_train.csv", index=False)
X_test.to_csv("data/export/X_test.csv", index=False)
y_train.to_csv("data/export/y_train.csv", index=False)
y_test.to_csv("data/export/y_test.csv", index=False)

df_processed = pd.concat([X_train, y_train], axis=1)
df_processed.to_csv("data/export/df_processed_train.csv", index=False)
df_processed_test = pd.concat([X_test, y_test], axis=1)
df_processed_test.to_csv("data/export/df_processed_test.csv", index=False)

print("Feature engineering completed. Data saved in data/export/")

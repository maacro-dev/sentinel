import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from sklearn.preprocessing import OrdinalEncoder, OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import warnings
warnings.filterwarnings('ignore')

df1 = pd.read_csv('data/metadata1.csv')
df2 = pd.read_csv('data/metadata2.csv')
df3 = pd.read_csv('data/metadata3.csv')
df4 = pd.read_csv('data/metadata4.csv')
df5 = pd.read_csv('data/metadata6.csv')

cols_to_drop = ['first_name', 'last_name', 'cellphone_no', 'collected_at', 'synced_at', 'collected_by',
                'gps_latitude', 'gps_longitude', 'date_of_birth', 'land_preparation_start_date',
                'est_crop_establishment_date', 'crop_planted', 'crop_status', 'harvest_date',
                'harvesting_method', 'avg_bag_weight_kg', 'bags_harvested', 'production_t',
                'area_harvested_ha', 'sowing_date', 'actual_crop_establishment_date',
                'distance_between_plant_row_1', 'distance_between_plant_row_2',
                'distance_between_plant_row_3', 'distance_within_plant_row_1',
                'distance_within_plant_row_2',
                'distance_within_plant_row_3',
                'num_plants_1', 'num_plants_2', 'num_plants_3', 'source_of_good_seeds',
                'rice_variety_no', 'observed_pest']

df1.drop(columns=[c for c in cols_to_drop if c in df1.columns], inplace=True, errors='ignore')
df2.drop(columns=[c for c in cols_to_drop if c in df2.columns], inplace=True, errors='ignore')
df3.drop(columns=[c for c in cols_to_drop if c in df3.columns], inplace=True, errors='ignore')
df4.drop(columns=[c for c in cols_to_drop if c in df4.columns] + ['yield_kg_per_ha_t_per_ha'], inplace=True, errors='ignore')  # target separate
df5.drop(columns=[c for c in cols_to_drop if c in df5.columns], inplace=True, errors='ignore')

# Keep target in df4_target
df4_target = pd.read_csv('data/metadata4.csv')[['mfid', 'yield_kg_per_ha_t_per_ha']]

# Define common location columns to avoid duplicates
location_cols = ['province', 'municity', 'barangay']

# Drop location columns from df1, df2, df3, df5 before merging,
# as they will already be present from df4 after the first merge
df1.drop(columns=[c for c in location_cols if c in df1.columns], inplace=True, errors='ignore')
df2.drop(columns=[c for c in location_cols if c in df2.columns], inplace=True, errors='ignore')
df3.drop(columns=[c for c in location_cols if c in df3.columns], inplace=True, errors='ignore')
df5.drop(columns=[c for c in location_cols if c in df5.columns], inplace=True, errors='ignore')

# Merge starting from df4_target
merged = df4_target.merge(df4, on='mfid', how='left')  # add irrigation_supply from Metadata 4
merged = merged.merge(df1, on='mfid', how='left')
merged = merged.merge(df2, on='mfid', how='left')
merged = merged.merge(df3, on='mfid', how='left')
merged = merged.merge(df5, on='mfid', how='left')


# for c in merged.columns:
#     print(c)


# Separate features and target
X = merged.drop(columns=['mfid', 'yield_kg_per_ha_t_per_ha'])
y = merged['yield_kg_per_ha_t_per_ha']

# Identify column types
numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()
categorical_cols = X.select_dtypes(include=['object']).columns.tolist()

# For ordinal severity, we map manually
severity_map = {'Low': 1, 'Medium': 2, 'High': 3}
if 'severity' in X.columns:
    X['severity'] = X['severity'].map(severity_map)
    # Move to numeric
    numeric_cols.append('severity')
    categorical_cols.remove('severity')

# Also handle 'irrigation_supply' which is ordinal? Actually it's categorical but we can treat as ordinal if order exists.
# We'll leave as categorical for now.

# Create preprocessing pipelines
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_cols),
        ('cat', categorical_transformer, categorical_cols)
    ])

# Combine with Random Forest
rf = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
pipeline = Pipeline(steps=[('preprocessor', preprocessor),
                           ('regressor', rf)])

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train
pipeline.fit(X_train, y_train)

# Predict
y_pred = pipeline.predict(X_test)


for c in X_test.columns:
    print(c)

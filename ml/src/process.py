import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer

pd.set_option("display.max_rows", None)
pd.set_option("display.max_columns", None)
pd.set_option("display.width", None)
pd.set_option("display.max_colwidth", None)

def print_columns(df):
    to_print = pd.DataFrame({"column": df.columns, "dtype": [df[c].dtype for c in df.columns]})
    print(to_print)

def variety_group(var):
    if pd.isna(var):
        return 'unknown'
    var_low = var.lower()
    if 'nsic' in var_low:
        return 'nsic'
    elif 'psb' in var_low:
        return 'psb'
    else:
        return 'others'

def main():
    df = pd.read_csv("data/merged.csv")

    # Drop identifiers, metadata, and leakage columns
    cols_to_drop = [
        'mfid', 'first_name', 'last_name', 'date_of_birth', 'gender', 'cellphone_no',
        'collected_at_m1', 'collected_by_m1',
        'collected_at_m2', 'collected_by_m2',
        'collected_at_m3', 'collected_by_m3',
        'collected_at_m4', 'collected_by_m4',
        'collected_at_m6', 'collected_by_m6',
        'production_t',                 # total production – leakage
        'yield_kg_per_ha_t_per_ha',    # already derived
        'synced_at_x',                  # sync timestamps – metadata
        'synced_at_y',
        'synced_at',                    # if present, drop
    ]
    df.drop(columns=cols_to_drop, inplace=True, errors='ignore')

    # --- Location handling ---
    # GPS coordinates are already present. Dropping administrative boundaries
    # avoids high‑cardinality issues. If you later want to experiment with them,
    # replace the next line with frequency encoding (commented below).
    df.drop(columns=['municity', 'barangay'], inplace=True, errors='ignore')
    #
    # Alternative frequency encoding (uncomment if you want to keep them):
    # for col in ['municity', 'barangay']:
    #     if col in df.columns:
    #         df[f'{col}_freq'] = df.groupby(col)[col].transform('count')
    #         df.drop(columns=[col], inplace=True)

    # Convert date columns
    date_cols = [
        'land_preparation_start_date',
        'est_crop_establishment_date',
        'actual_crop_establishment_date',
        'sowing_date',
        'harvest_date'
    ]
    for col in date_cols:
        df[col] = pd.to_datetime(df[col].astype(str).str.strip(), errors='coerce')

    # Compute date‑derived features
    df['planning_gap_days'] = (df['est_crop_establishment_date'] - df['land_preparation_start_date']).dt.days
    df['delay_days'] = (df['actual_crop_establishment_date'] - df['est_crop_establishment_date']).dt.days
    df['growing_days'] = (df['harvest_date'] - df['actual_crop_establishment_date']).dt.days
    df['nursery_days'] = (df['actual_crop_establishment_date'] - df['sowing_date']).dt.days

    # Drop original date columns
    df.drop(columns=date_cols, inplace=True, errors='ignore')

    # Compute target: yield in tonnes per hectare
    df['bags_harvested'] = pd.to_numeric(df['bags_harvested'], errors='coerce')
    df['avg_bag_weight_kg'] = pd.to_numeric(df['avg_bag_weight_kg'], errors='coerce')
    df['area_harvested_ha'] = pd.to_numeric(df['area_harvested_ha'], errors='coerce')
    df['yield_t_per_ha'] = (df['bags_harvested'] * df['avg_bag_weight_kg'] / 1000) / df['area_harvested_ha']

    # Remove rows with invalid yield
    df = df[df['area_harvested_ha'] > 0].copy()
    df = df[df['yield_t_per_ha'].notna()].copy()

    # Drop harvest‑related columns to avoid leakage
    harvest_cols = ['bags_harvested', 'avg_bag_weight_kg', 'area_harvested_ha']
    df.drop(columns=harvest_cols, inplace=True, errors='ignore')

    # --- Damage assessment ---
    df['damage_occurred'] = df['cause'].notna().astype(int)
    df['cause'] = df['cause'].fillna('No Damage')

    severity_map = {'Mild': 1, 'Moderate': 2, 'Severe': 3}
    df['severity_code'] = df['severity'].map(severity_map).fillna(0)

    df['affected_area_ha'] = pd.to_numeric(df['affected_area_ha'], errors='coerce').fillna(0)
    df['affected_ratio'] = df['affected_area_ha'] / df['total_field_area_ha']
    df['affected_ratio'] = df['affected_ratio'].fillna(0)

    df['pest_present'] = df['observed_pest'].notna().astype(int)

    # --- Fertilizer aggregation ---
    df['total_n'] = 0.0
    df['total_p'] = 0.0
    df['total_k'] = 0.0
    df['num_applications'] = 0
    df['total_amount'] = 0.0

    for i in range(1, 4):
        n_col = f'nitrogen_content_pct_{i}'
        p_col = f'phosphorus_content_pct_{i}'
        k_col = f'potassium_content_pct_{i}'
        amt_col = f'amount_applied_{i}'

        for col in [n_col, p_col, k_col, amt_col]:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors='coerce')

        applied = df[amt_col].notna() & (df[amt_col] > 0) if amt_col in df.columns else pd.Series(False, index=df.index)
        if applied.any():
            df.loc[applied, 'total_n'] += df.loc[applied, n_col] * df.loc[applied, amt_col] / 100
            df.loc[applied, 'total_p'] += df.loc[applied, p_col] * df.loc[applied, amt_col] / 100
            df.loc[applied, 'total_k'] += df.loc[applied, k_col] * df.loc[applied, amt_col] / 100
            df.loc[applied, 'total_amount'] += df.loc[applied, amt_col]
            df.loc[applied, 'num_applications'] += 1

    # Drop original fertilizer detail columns
    fert_detail_cols = [col for col in df.columns if any(f'_{i}' in col for i in range(1,4))]
    df.drop(columns=fert_detail_cols, inplace=True, errors='ignore')

    # --- Categorical encoding ---
    df['variety_group'] = df['rice_variety'].apply(variety_group)

    categorical_small = [
        'province',
        'soil_type_x',
        'current_field_condition',
        'crop_planted',
        'crop_status',
        'est_crop_establishment_method',
        'actual_crop_establishment_method',
        'direct_seeding_method',
        'seed_class',
        'ecosystem',
        'source_of_irrigation',
        'harvesting_method',
        'irrigation_supply',
        'cause',
        'crop_stage',
        'severity',
        # Add missing categorical columns
        'soil_problem',
        'type_of_irrigation',
        'source_of_good_seeds',
        'soil_type_y',
    ]
    categorical_small = [c for c in categorical_small if c in df.columns]

    df = pd.get_dummies(df, columns=categorical_small, drop_first=True)
    df = pd.get_dummies(df, columns=['variety_group'], drop_first=True)

    # Drop leftover string columns (original categoricals are already removed by get_dummies)
    df.drop(columns=['severity', 'rice_variety', 'observed_pest'], inplace=True, errors='ignore')

    # --- Ensure numeric columns are properly typed ---
    numeric_features = [
        'total_field_area_ha',
        'seedling_age_at_transplanting',
        'seeding_rate_kg_ha',
        'average_number_of_plants',
        'monitoring_field_area_sqm',
        'rice_variety_maturity_duration',
        'gps_latitude',
        'gps_longitude',
        'applied_area_sqm',
        'planning_gap_days',
        'delay_days',
        'growing_days',
        'nursery_days',
        'damage_occurred',
        'severity_code',
        'affected_ratio',
        'pest_present',
        'total_n', 'total_p', 'total_k', 'num_applications', 'total_amount'
    ]
    for col in numeric_features:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # --- Handle missing values ---
    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if 'yield_t_per_ha' in num_cols:
        num_cols.remove('yield_t_per_ha')

    # Drop columns that are completely empty
    all_null_cols = [col for col in num_cols if df[col].isnull().all()]
    if all_null_cols:
        print(f"Dropping columns with all nulls: {all_null_cols}")
        df.drop(columns=all_null_cols, inplace=True)
        num_cols = [col for col in num_cols if col not in all_null_cols]

    # Impute remaining numeric columns with median
    if num_cols:  # only if there are columns to impute
        imputer = SimpleImputer(strategy='median')
        df[num_cols] = imputer.fit_transform(df[num_cols])

    object_cols = df.select_dtypes(include=['object']).columns.tolist()
    if object_cols:
        print(f"Dropping remaining object columns: {object_cols}")
        df.drop(columns=object_cols, inplace=True)

    # Final check
    print_columns(df)
    # print(f"Target distribution: min={df['yield_t_per_ha'].min():.2f}, max={df['yield_t_per_ha'].max():.2f}, mean={df['yield_t_per_ha'].mean():.2f}")

    # # Save processed data
    # df.to_csv("data/processed.csv", index=False)

if __name__ == "__main__":
    main()






import pandas as pd

m1 = pd.read_csv("data/metadata1.csv")
m2 = pd.read_csv("data/metadata2.csv")
m3 = pd.read_csv("data/metadata3.csv")
m4 = pd.read_csv("data/metadata4.csv")

m6 = pd.read_csv("data/metadata6.csv")

common_cols = ["province", "municity", "barangay", "first_name", "last_name"]

m2 = m2.drop(columns=common_cols, errors="ignore")
m3 = m3.drop(columns=common_cols, errors="ignore")
m4 = m4.drop(columns=common_cols, errors="ignore")
m6 = m6.drop(columns=common_cols, errors="ignore")

m1 = m1.rename(columns={ "collected_at": "collected_at_m1", "collected_by": "collected_by_m1" })
m2 = m2.rename(columns={ "collected_at": "collected_at_m2", "collected_by": "collected_by_m2" })
m3 = m3.rename(columns={ "collected_at": "collected_at_m3", "collected_by": "collected_by_m3" })
m4 = m4.rename(columns={ "collected_at": "collected_at_m4", "collected_by": "collected_by_m4" })
m6 = m6.rename(columns={ "collected_at": "collected_at_m6", "collected_by": "collected_by_m6" })

df = (
    m1
    .merge(m2, on="mfid", how="left")
    .merge(m3, on="mfid", how="left")
    .merge(m4, on="mfid", how="left")
    .merge(m6, on="mfid", how="left")
)

df.to_csv("data/merged.csv", index=False)




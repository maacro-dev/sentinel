
import pandas as pd

df = pd.read_csv("data/merged.csv")

df["total_tonnes"] = (
    df["avg_bag_weight_kg"] * df["bags_harvested"]
) / 1000

avg_yield_tpha = df["total_tonnes"].sum() / df["area_harvested_ha"].sum()

print(avg_yield_tpha)

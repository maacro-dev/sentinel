

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

df = pd.read_csv("data/processed.csv")

X = df.drop(columns=['yield_t_per_ha'])
y = df['yield_t_per_ha']

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train
model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)


# mse = mean_squared_error(y_test, y_pred)
# rmse = mse ** 0.5
# r2 = r2_score(y_test, y_pred)
# print(f'RMSE: {rmse:.3f} t/ha, R²: {r2:.3f}')

# # Save model
# joblib.dump(model, 'yield_model.pkl')

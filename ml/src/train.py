
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.model_selection import RandomizedSearchCV
import joblib
import os

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------
DATA_DIR = "data/export/"
MODEL_SAVE_PATH = "data/export/random_forest_model.pkl"
RANDOM_STATE = 42
N_ITER = 20          # Number of hyperparameter combinations for randomized search
CV = 3               # Number of cross-validation folds

# ------------------------------------------------------------
# Load data
# ------------------------------------------------------------
print("Loading processed data...")
X_train = pd.read_csv(os.path.join(DATA_DIR, "X_train.csv"))
X_test = pd.read_csv(os.path.join(DATA_DIR, "X_test.csv"))
y_train = pd.read_csv(os.path.join(DATA_DIR, "y_train.csv")).values.ravel()
y_test = pd.read_csv(os.path.join(DATA_DIR, "y_test.csv")).values.ravel()

print(f"Training set: {X_train.shape[0]} samples, {X_train.shape[1]} features")
print(f"Test set: {X_test.shape[0]} samples")

# ------------------------------------------------------------
# Define base model and hyperparameter grid
# ------------------------------------------------------------
rf = RandomForestRegressor(random_state=RANDOM_STATE, n_jobs=-1)

# Parameter grid (adjust based on your data size and needs)
param_grid = {
    'n_estimators': [100, 200, 300, 500],
    'max_depth': [10, 20, 30, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'max_features': ['sqrt', 'log2', None]
}

# ------------------------------------------------------------
# Hyperparameter tuning with RandomizedSearchCV
# ------------------------------------------------------------
print("\nPerforming hyperparameter tuning (RandomizedSearchCV)...")
random_search = RandomizedSearchCV(
    estimator=rf,
    param_distributions=param_grid,
    n_iter=N_ITER,
    cv=CV,
    verbose=2,
    random_state=RANDOM_STATE,
    n_jobs=-1,
    scoring='neg_mean_squared_error'   # minimize MSE
)
random_search.fit(X_train, y_train)

best_model = random_search.best_estimator_
print(f"\nBest parameters: {random_search.best_params_}")
print(f"Best CV score (neg MSE): {random_search.best_score_:.4f}")

# ------------------------------------------------------------
# Evaluate on test set
# ------------------------------------------------------------
print("\nEvaluating on test set...")
y_pred = best_model.predict(X_test)

mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Test RMSE: {rmse:.4f}")
print(f"Test MAE: {mae:.4f}")
print(f"Test R²: {r2:.4f}")

comparison = pd.DataFrame({
    "Actual_Yield": y_test,
    "Predicted_Yield": y_pred
})

print(comparison.head(20))


# ------------------------------------------------------------
# Save the model
# ------------------------------------------------------------
joblib.dump(best_model, MODEL_SAVE_PATH)
print(f"\nModel saved to {MODEL_SAVE_PATH}")

# ------------------------------------------------------------
# Optional: Feature importance
# ------------------------------------------------------------
importances = best_model.feature_importances_
feature_names = X_train.columns
feature_importance_df = pd.DataFrame({
    'feature': feature_names,
    'importance': importances
}).sort_values('importance', ascending=False)

print("\nTop 10 most important features:")
print(feature_importance_df.head(10).to_string(index=False))

# Save feature importance
feature_importance_df.to_csv(os.path.join(DATA_DIR, "feature_importance.csv"), index=False)
print("\nFeature importance saved to data/export/feature_importance.csv")

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import os
import joblib

# ------------------------------------------------------------
# Paths
# ------------------------------------------------------------
DATA_DIR = "data/export/"
MODEL_PATH = os.path.join(DATA_DIR, "random_forest_model.pkl")

# ------------------------------------------------------------
# Load data
# ------------------------------------------------------------
X_train = pd.read_csv(os.path.join(DATA_DIR, "X_train.csv"))
X_test = pd.read_csv(os.path.join(DATA_DIR, "X_test.csv"))
y_train = pd.read_csv(os.path.join(DATA_DIR, "y_train.csv")).squeeze()  # returns Series
y_test = pd.read_csv(os.path.join(DATA_DIR, "y_test.csv")).squeeze()

print("Train set: {} samples, {} features".format(len(y_train), X_train.shape[1]))
print("Test set: {} samples".format(len(y_test)))

# ------------------------------------------------------------
# 1. Target distribution
# ------------------------------------------------------------
plt.figure(figsize=(10, 4))
plt.subplot(1, 2, 1)
plt.hist(y_train, bins=30, edgecolor='black')
plt.title('Training Yield Distribution')
plt.xlabel('Yield per ha')
plt.ylabel('Frequency')

plt.subplot(1, 2, 2)
plt.boxplot(y_train, vert=False)
plt.title('Boxplot of Training Yield')
plt.xlabel('Yield per ha')
plt.tight_layout()
plt.savefig(os.path.join(DATA_DIR, "yield_distribution.png"), dpi=150)
print("Saved yield distribution plot to data/export/yield_distribution.png")

print("\nTraining yield statistics:")
print(y_train.describe())

# ------------------------------------------------------------
# 2. Feature distributions (optional: only first few features)
# ------------------------------------------------------------
plt.figure(figsize=(12, 8))
# Show histogram of first 9 numeric features
num_cols = X_train.select_dtypes(include=[np.number]).columns[:9]
for i, col in enumerate(num_cols, 1):
    plt.subplot(3, 3, i)
    plt.hist(X_train[col], bins=30, edgecolor='black')
    plt.title(col)
plt.tight_layout()
plt.savefig(os.path.join(DATA_DIR, "feature_distributions.png"), dpi=150)
print("Saved feature distributions to data/export/feature_distributions.png")

# ------------------------------------------------------------
# 3. If a trained model exists, load and evaluate
# ------------------------------------------------------------
if os.path.exists(MODEL_PATH):
    print("\nLoading trained model from", MODEL_PATH)
    model = joblib.load(MODEL_PATH)

    # Predict on test set
    y_pred = model.predict(X_test)

    # Compute residuals
    residuals = y_test - y_pred

    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1)
    plt.scatter(y_pred, residuals, alpha=0.5)
    plt.axhline(y=0, color='r', linestyle='--')
    plt.xlabel('Predicted')
    plt.ylabel('Residual')
    plt.title('Residuals vs Predicted')

    plt.subplot(1, 2, 2)
    plt.hist(residuals, bins=20, edgecolor='black')
    plt.xlabel('Residual')
    plt.ylabel('Frequency')
    plt.title('Residual Distribution')
    plt.tight_layout()
    plt.savefig(os.path.join(DATA_DIR, "residuals.png"), dpi=150)
    print("Saved residuals plot to data/export/residuals.png")

    # Compute metrics
    from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)

    print(f"\nTest R²: {r2:.4f}")
    print(f"Test RMSE: {rmse:.4f}")
    print(f"Test MAE: {mae:.4f}")

    # Feature importance (if model supports it)
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        feat_imp = pd.DataFrame({'feature': X_train.columns, 'importance': importances})
        feat_imp = feat_imp.sort_values('importance', ascending=False)
        print("\nTop 10 most important features:")
        print(feat_imp.head(10).to_string(index=False))
        feat_imp.to_csv(os.path.join(DATA_DIR, "feature_importance.csv"), index=False)
        print("Saved feature importance to data/export/feature_importance.csv")
else:
    print("\nNo trained model found at", MODEL_PATH)

print("\nDiagnostic plots and statistics saved to data/export/")

import sys
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'rf_model.joblib')

# Usage: python train_model.py <csv_path>
def main():
    if len(sys.argv) < 2:
        print('Usage: python train_model.py <csv_path>')
        sys.exit(1)
    csv_path = sys.argv[1]

    # Read only first 1000 rows for demo speed
    df = pd.read_csv(csv_path, nrows=1000)

    # Basic preprocessing: drop rows with missing values
    df = df.dropna()

    # Assume last column is label, first column is customer name (optional)
    feature_cols = df.columns[1:-1]
    X = df[feature_cols]
    y = df[df.columns[-1]]

    # Encode categorical features if any
    X = pd.get_dummies(X)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    # Reduce n_estimators for faster training
    clf = RandomForestClassifier(n_estimators=10, random_state=42)
    clf.fit(X_train, y_train)

    # Save model
    joblib.dump({'model': clf, 'features': list(X.columns)}, MODEL_PATH)

    # Print metrics for demo
    y_pred = clf.predict(X_test)
    print('Training complete!')
    print(classification_report(y_test, y_pred))
    print(f'Model saved to {MODEL_PATH}')

if __name__ == '__main__':
    main()

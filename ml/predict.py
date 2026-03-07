import sys
import pandas as pd
import numpy as np
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'rf_model.joblib')

def load_model():
    return joblib.load(MODEL_PATH)

def predict_single(input_dict):
    data = pd.DataFrame([input_dict])
    model_bundle = load_model()
    model = model_bundle['model']
    features = model_bundle['features']
    # Ensure all features are present
    data = pd.get_dummies(data)
    for col in features:
        if col not in data.columns:
            data[col] = 0
    data = data[features]
    proba = model.predict_proba(data)[0][1]
    pred = model.predict(data)[0]
    return int(pred), float(proba)

def predict_batch(csv_path):
    df = pd.read_csv(csv_path)
    names = df.iloc[:,0].tolist()
    X = df.iloc[:,1:]
    model_bundle = load_model()
    model = model_bundle['model']
    features = model_bundle['features']
    X = pd.get_dummies(X)
    for col in features:
        if col not in X.columns:
            X[col] = 0
    X = X[features]
    probas = model.predict_proba(X)[:,1]
    preds = model.predict(X)
    return list(zip(names, preds, probas))

def main():
    import json
    if len(sys.argv) == 2 and sys.argv[1].endswith('.json'):
        # Single prediction from JSON file
        with open(sys.argv[1], 'r') as f:
            input_dict = json.load(f)
        pred, proba = predict_single(input_dict)
        print(json.dumps({'prediction': pred, 'probability': proba}))
    elif len(sys.argv) == 2 and sys.argv[1].endswith('.csv'):
        # Batch prediction from CSV
        results = predict_batch(sys.argv[1])
        for name, pred, proba in results:
            print(f'{name},{pred},{proba}')
    else:
        print('Usage: python predict.py <input.json|input.csv>')
        sys.exit(1)

if __name__ == '__main__':
    main()

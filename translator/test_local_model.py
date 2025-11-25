import tensorflow as tf
from tensorflow import keras
import pickle
import numpy as np

# Test loading the Kumaoni accent analyzer model
try:
    print("Loading model...")
    MODEL_PATH = "models/this_is_model.h5"
    SCALER_PATH = "models/scaler.pkl"
    ENCODER_PATH = "models/label_encoder.pkl"
    
    # Try to load the model with compile=False to avoid compatibility issues
    model = keras.models.load_model(MODEL_PATH, compile=False)
    print("Model loaded successfully!")
    print(f"Model type: {type(model)}")
    
    # Load supporting files
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)
    print("Scaler loaded!")
    
    with open(ENCODER_PATH, "rb") as f:
        label_encoder = pickle.load(f)
    print("Label Encoder loaded!")
    print(f"Classes: {label_encoder.classes_}")
    
    # Test prediction with dummy data
    dummy_features = np.random.rand(1, 127)  # 127 features as expected
    X_scaled = scaler.transform(dummy_features)
    print("Features scaled successfully!")
    
    # Try to make a prediction
    prediction = model.predict(X_scaled)
    print(f"Prediction successful! Shape: {prediction.shape}")
    print(f"Prediction value: {prediction[0][0]}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
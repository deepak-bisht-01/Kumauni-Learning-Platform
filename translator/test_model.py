from transformers import AutoModelForAudioClassification, AutoFeatureExtractor
import torch

# Test loading the Kumaoni accent analyzer model
try:
    print("Loading model...")
    accent_model_name = "kanwalkamlesh/kumaoni_accent_analyzer"
    
    model = AutoModelForAudioClassification.from_pretrained(accent_model_name)
    feature_extractor = AutoFeatureExtractor.from_pretrained(accent_model_name)
    
    print("Model loaded successfully!")
    print(f"Model type: {type(model)}")
    print(f"Feature extractor type: {type(feature_extractor)}")
    
    # Check if the model has labels
    if hasattr(model.config, 'id2label'):
        print(f"Labels: {model.config.id2label}")
    else:
        print("No labels found in model config")
        
except Exception as e:
    print(f"Error loading model: {e}")
    import traceback
    traceback.print_exc()
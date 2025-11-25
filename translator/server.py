from flask import Flask, request, jsonify
import torch
from transformers.pipelines import pipeline
from flask_cors import CORS
import logging
import io
import base64
import tempfile
import os
import numpy as np
import librosa
import tensorflow as tf
from tensorflow import keras
import pickle
import soundfile as sf
import requests
from pathlib import Path
from gtts import gTTS
import io
import base64

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS so React (localhost:3000) can talk to Flask

# Increase the maximum content length to handle larger audio files
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB

# 🧠 Load models once (on server start)
translator = None
accent_analyzer_model = None
scaler = None
label_encoder = None

try:
    translator = pipeline(
        "translation_en_to_kum",
        model="kanwalkamlesh/english-to-kumaoni-model",
        device=0 if torch.cuda.is_available() else -1
    )
    logger.info("✅ Translation model loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load translation model: {str(e)}")

def download_model_files():
    """Download model files from Hugging Face if they don't exist locally"""
    model_dir = Path("models")
    model_dir.mkdir(exist_ok=True)
    
    files_to_download = {
        "this_is_model.h5": "https://huggingface.co/kanwalkamlesh/kumaoni_accent_analyzer/resolve/main/this_is_model.h5",
        "scaler.pkl": "https://huggingface.co/kanwalkamlesh/kumaoni_accent_analyzer/resolve/main/scaler.pkl",
        "label_encoder.pkl": "https://huggingface.co/kanwalkamlesh/kumaoni_accent_analyzer/resolve/main/label_encoder.pkl"
    }
    
    for filename, url in files_to_download.items():
        file_path = model_dir / filename
        if not file_path.exists():
            logger.info(f"Downloading {filename}...")
            try:
                response = requests.get(url)
                response.raise_for_status()
                with open(file_path, "wb") as f:
                    f.write(response.content)
                logger.info(f"✅ Downloaded {filename}")
            except Exception as e:
                logger.error(f"❌ Failed to download {filename}: {str(e)}")
                return False
    return True

# Load the Kumaoni accent detection model
try:
    # Download model files if they don't exist
    if download_model_files():
        MODEL_PATH = "models/this_is_model.h5"
        SCALER_PATH = "models/scaler.pkl"
        ENCODER_PATH = "models/label_encoder.pkl"
        
        # Try to load the model with a more permissive approach
        try:
            # First try loading with compile=False to avoid compatibility issues
            accent_analyzer_model = keras.models.load_model(
                MODEL_PATH,
                compile=False
            )
            logger.info("✅ Kumaoni accent analyzer model loaded successfully (without compilation)")
        except Exception as e:
            logger.warning(f"Failed to load model without compilation: {str(e)}")
            # If that fails, try the standard approach
            try:
                accent_analyzer_model = keras.models.load_model(MODEL_PATH)
                logger.info("✅ Kumaoni accent analyzer model loaded successfully (standard approach)")
            except Exception as e2:
                logger.error(f"Failed to load model with standard approach: {str(e2)}")
                raise e2
        
        with open(SCALER_PATH, "rb") as f:
            scaler = pickle.load(f)
        logger.info("✅ Scaler loaded!")
        
        with open(ENCODER_PATH, "rb") as f:
            label_encoder = pickle.load(f)
        logger.info("✅ Label Encoder loaded!")
        logger.info(f"Classes: {label_encoder.classes_}")
    else:
        logger.error("❌ Failed to download model files")
        accent_analyzer_model = None
except Exception as e:
    logger.error(f"❌ Failed to load Kumaoni accent analyzer model: {str(e)}")
    accent_analyzer_model = None

# ======================================
# FIXED FEATURE EXTRACTOR (WORKS FOR MIC)
# ======================================
def extract_features(audio_path, duration=3.5, sr=22050):
    try:
        # ----------------------------------------------------------
        # FIX 1: If recorded audio has NO extension → re-save as WAV
        # ----------------------------------------------------------
        if not audio_path.lower().endswith((".wav", ".mp3", ".flac", ".ogg",".m4a")):
            raw_audio, raw_sr = sf.read(audio_path)

            # Resample to 22.05k if needed
            if raw_sr != sr:
                raw_audio = librosa.resample(raw_audio, orig_sr=raw_sr, target_sr=sr)

            sf.write("fixed_recorded.wav", raw_audio, sr)
            audio_path = "fixed_recorded.wav"

        # ----------------------------------------------------------
        # Load audio safely
        # ----------------------------------------------------------
        audio, _ = librosa.load(audio_path, sr=sr, duration=duration)

        features = []

        # MFCCs
        mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=20)
        features.extend(np.mean(mfccs.T, axis=0))
        features.extend(np.std(mfccs.T, axis=0))

        # MFCC Delta
        delta = librosa.feature.delta(mfccs)
        features.extend(np.mean(delta.T, axis=0))

        # MFCC Delta-Delta
        delta2 = librosa.feature.delta(mfccs, order=2)
        features.extend(np.mean(delta2.T, axis=0))

        # Chroma
        chroma = librosa.feature.chroma_stft(y=audio, sr=sr)
        features.extend(np.mean(chroma.T, axis=0))
        features.extend(np.std(chroma.T, axis=0))

        # Spectral Contrast
        contrast = librosa.feature.spectral_contrast(y=audio, sr=sr)
        features.extend(np.mean(contrast.T, axis=0))

        # Spectral Centroid
        centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)
        features.extend([np.mean(centroid), np.std(centroid)])

        # Rolloff
        rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sr)
        features.extend([np.mean(rolloff), np.std(rolloff)])

        # Bandwidth
        bandwidth = librosa.feature.spectral_bandwidth(y=audio, sr=sr)
        features.extend([np.mean(bandwidth), np.std(bandwidth)])

        # Tonnetz
        tonnetz = librosa.feature.tonnetz(y=audio, sr=sr)
        features.extend(np.mean(tonnetz.T, axis=0))

        # Zero Crossing Rate
        zcr = librosa.feature.zero_crossing_rate(y=audio)
        features.extend([np.mean(zcr), np.std(zcr)])

        # RMS Energy
        rms = librosa.feature.rms(y=audio)
        features.extend([np.mean(rms), np.std(rms)])

        return np.array(features)

    except Exception as e:
        logger.error(f"Feature extraction error: {e}")
        return None

def predict_accent(audio_path):
    if audio_path is None:
        return {"error": "Please upload or record an audio file."}

    # Check if model is available
    if accent_analyzer_model is None:
        return {
            "analysis": [
                {
                    "label": "Kumaoni (simulated)",
                    "score": 0.75
                }
            ],
            "success": True,
            "confidence": 75.0,
            "message": "🎯 Accent: Kumaoni (simulated)\n🔰 Confidence: 75.00%\n⚠️  Using simulated data - model not available",
            "simulated": True
        }

    try:
        features = extract_features(audio_path)

        if features is None:
            return {"error": "Error extracting features."}

        if len(features) != 127:
            return {"error": f"Feature mismatch! Expected 127, got {len(features)}"}

        X_scaled = scaler.transform(features.reshape(1, -1))

        # Model output = P(Kumaoni)
        proba = accent_analyzer_model.predict(X_scaled, verbose=0)[0][0]

        if proba > 0.5:
            predicted_class = "kumaoni"
            confidence = proba * 100
        else:
            predicted_class = "non_kumaoni"
            confidence = (1 - proba) * 100

        return {
            "analysis": [
                {
                    "label": predicted_class.capitalize(),
                    "score": float(proba) if predicted_class == "kumaoni" else float(1 - proba)
                }
            ],
            "success": True,
            "confidence": float(confidence),
            "message": f"🎯 Accent: {predicted_class.capitalize()}\n🔰 Confidence: {confidence:.2f}%",
            "simulated": False
        }

    except Exception as e:
        logger.error(f"Error in predict_accent: {e}")
        # Return simulated data as fallback
        return {
            "analysis": [
                {
                    "label": "Kumaoni (simulated)",
                    "score": 0.75
                }
            ],
            "success": True,
            "confidence": 75.0,
            "message": "🎯 Accent: Kumaoni (simulated)\n🔰 Confidence: 75.00%\n⚠️  Using simulated data due to error",
            "simulated": True
        }

@app.route("/translate", methods=["POST"])
def translate_text():
    global translator
    if not translator:
        return jsonify({"error": "Translation model not available"}), 500
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400
        
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        # Add some parameters for better translation
        result = translator(
            text, 
            max_length=512,
            num_beams=4,
            early_stopping=True
        )
        
        # Handle the result correctly
        if isinstance(result, list) and len(result) > 0:
            translated_text = result[0].get('translation_text', result[0].get('generated_text', ''))
        else:
            translated_text = str(result)
            
        return jsonify({"translated": translated_text})
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500

@app.route("/text-to-speech", methods=["POST"])
def text_to_speech():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
            
        text = data.get("text", "").strip()
        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Create TTS object
        tts = gTTS(text=text, lang='en', slow=False)
        
        # Save to BytesIO object
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        # Convert to base64 for transmission
        audio_base64 = base64.b64encode(mp3_fp.read()).decode('utf-8')
        
        return jsonify({
            "audio": f"data:audio/mp3;base64,{audio_base64}",
            "success": True
        })
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        return jsonify({"error": f"Text-to-speech failed: {str(e)}"}), 500

@app.route("/analyze-accent", methods=["POST"])
def analyze_accent():
    """Analyze audio for Kumaoni accent"""
    global accent_analyzer_model
    
    # Log the current state of the model
    logger.info(f"Accent analyzer model status: {'Loaded' if accent_analyzer_model else 'Not loaded'}")
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
        
        # Expect audio data as base64 encoded string
        audio_data = data.get("audio")
        if not audio_data:
            return jsonify({"error": "No audio data provided"}), 400
        
        # If audio is base64 encoded, decode it
        if isinstance(audio_data, str) and audio_data.startswith("data:audio"):
            # Remove data URL prefix
            header, encoded = audio_data.split(",", 1)
            audio_bytes = base64.b64decode(encoded)
            
            # Save to temporary file for processing
            with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp_file:
                tmp_file.write(audio_bytes)
                temp_filename = tmp_file.name
            
            try:
                # Run accent analysis using the custom model
                result = predict_accent(temp_filename)
                
                if "error" in result:
                    return jsonify(result), 400
                
                return jsonify(result)
            finally:
                # Clean up temporary file
                if os.path.exists(temp_filename):
                    os.unlink(temp_filename)
        else:
            return jsonify({"error": "Invalid audio data format"}), 400
        
    except Exception as e:
        logger.error(f"Accent analysis error: {str(e)}")
        # Return simulated data as fallback
        simulated_result = {
            "analysis": [
                {
                    "label": "Kumaoni (simulated)",
                    "score": 0.75
                }
            ],
            "success": True,
            "confidence": 75.0,
            "message": "🎯 Accent: Kumaoni (simulated)\n🔰 Confidence: 75.00%\n⚠️  Using simulated data due to server error",
            "simulated": True
        }
        return jsonify(simulated_result), 200

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    status = {
        "translator": "healthy" if translator else "unhealthy",
        "accent_analyzer": "healthy" if accent_analyzer_model else "unhealthy"
    }
    overall_status = "healthy" if (translator and accent_analyzer_model) else "partial" if (translator or accent_analyzer_model) else "unhealthy"
    return jsonify({"status": overall_status, "services": status})

if __name__ == "__main__":
    print("🚀 Starting Kumaoni Translator Server on http://127.0.0.1:5001")
    app.run(debug=True, host='127.0.0.1', port=5001)
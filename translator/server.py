from flask import Flask, request, jsonify
from transformers.pipelines import pipeline
import torch
from flask_cors import CORS
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS so React (localhost:3000) can talk to Flask

# 🧠 Load model once (on server start)
translator = None
try:
    translator = pipeline(
        "translation_en_to_kum",
        model="kanwalkamlesh/english-to-kumaoni-model",
        device=0 if torch.cuda.is_available() else -1
    )
    logger.info("✅ Model loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load model: {str(e)}")

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

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    status = "healthy" if translator else "unhealthy"
    return jsonify({"status": status})

if __name__ == "__main__":
    print("🚀 Starting Kumaoni Translator Server on http://127.0.0.1:5001")
    app.run(debug=True, host='127.0.0.1', port=5001)
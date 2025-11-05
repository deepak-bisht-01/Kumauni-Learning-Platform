from flask import Flask, request, jsonify
from transformers import pipeline
import torch
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS so React (localhost:3000) can talk to Flask

# 🧠 Load model once (on server start)
translator = pipeline(
    "text2text-generation",
    model="kanwalkamlesh/english-to-kumaoni-model",
    device=0 if torch.cuda.is_available() else -1
)

@app.route("/translate", methods=["POST"])
def translate_text():
    data = request.get_json()
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        result = translator(text)[0]['generated_text']
        return jsonify({"translated": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 Starting Kumaoni Translator Server on http://127.0.0.1:5000")
    app.run(debug=True, port=5001)
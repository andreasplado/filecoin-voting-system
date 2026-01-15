import os
from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

# This downloads a small model (GPT-2) to run locally inside the container
# Note: For better results, use 'meta-llama/Llama-3-8B' (requires high RAM)
pipe = pipeline("text-generation", model="gpt2")

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    prompt = data.get("prompt")
    
    # Generate response locally without any API key
    result = pipe(prompt, max_length=50, num_return_sequences=1)
    return jsonify({"reply": result[0]['generated_text']})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
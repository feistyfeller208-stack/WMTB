from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from database import db
from parser import parser

app = Flask(__name__)
CORS(app)  # Allow frontend to connect

@app.route('/')
def home():
    return "WMTB Backend is running!"

@app.route('/api/parse', methods=['POST'])
def parse_transaction():
    data = request.json
    text = data.get('text', '')
    
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    parsed = parser.parse(text)
    return jsonify(parsed)

@app.route('/api/transaction', methods=['POST'])
def add_transaction():
    data = request.json
    user_id = data.get('user_id')
    text = data.get('text', '')
    
    if not user_id or not text:
        return jsonify({"error": "Missing user_id or text"}), 400
    
    # Parse the text
    parsed = parser.parse(text)
    
    # Add to database
    transaction = db.add_transaction(
        user_id=user_id,
        amount=parsed['amount'],
        description=parsed['description'],
        category=parsed['category'],
        trans_type=parsed['type'],
        raw_text=text
    )
    
    # Calculate new balance
    balance = db.get_user_balance(user_id)
    
    return jsonify({
        "success": True,
        "transaction": transaction,
        "balance": balance,
        "message": f"✅ {parsed['category'].title()}: TZS {parsed['amount']:,.0f}"
    })

@app.route('/api/balance/<user_id>', methods=['GET'])
def get_balance(user_id):
    balance = db.get_user_balance(user_id)
    return jsonify({"balance": balance})

@app.route('/api/transactions/<user_id>', methods=['GET'])
def get_transactions(user_id):
    limit = request.args.get('limit', 50, type=int)
    transactions = db.get_recent_transactions(user_id, limit)
    return jsonify({"transactions": transactions})

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "WMTB Backend"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

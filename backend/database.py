import os
from supabase import create_client, Client
from datetime import datetime
import json

class WMTBDatabase:
    def __init__(self):
        # Get from environment or use defaults for testing
        self.url = os.environ.get("SUPABASE_URL", "")
        self.key = os.environ.get("SUPABASE_KEY", "")
        
        # If no environment vars, try to load from .env file
        if not self.url or not self.key:
            try:
                from dotenv import load_dotenv
                load_dotenv()
                self.url = os.environ.get("SUPABASE_URL", "")
                self.key = os.environ.get("SUPABASE_KEY", "")
            except:
                pass
        
        # Still no credentials? Use a dummy client
        if not self.url or not self.key:
            print("⚠️ WARNING: No Supabase credentials found.")
            print("⚠️ Running in local mode (data won't be saved to cloud).")
            self.supabase = None
            return
        
        print(f"✅ Connecting to Supabase at: {self.url[:30]}...")
        try:
            self.supabase: Client = create_client(self.url, self.key)
            print("✅ Supabase connection successful!")
        except Exception as e:
            print(f"❌ Supabase connection failed: {e}")
            self.supabase = None
    
    def create_tables(self):
        # SQL to run in Supabase SQL editor
        sql = """
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            phone TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT NOW(),
            currency TEXT DEFAULT 'TZS'
        );
        
        -- Transactions table
        CREATE TABLE IF NOT EXISTS transactions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id),
            amount DECIMAL(12,2),
            description TEXT,
            category TEXT,
            type TEXT CHECK (type IN ('income', 'expense', 'transfer')),
            payment_method TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            raw_text TEXT
        );
        
        -- Accounts table (cash, mpesa, bank)
        CREATE TABLE IF NOT EXISTS accounts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id),
            name TEXT,
            type TEXT,
            balance DECIMAL(12,2) DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE
        );
        
        -- Rules table
        CREATE TABLE IF NOT EXISTS rules (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES users(id),
            condition TEXT,
            action TEXT,
            is_active BOOLEAN DEFAULT TRUE
        );
        """
        print("Run this SQL in Supabase SQL editor")
        return sql
    
    def add_transaction(self, user_id, amount, description, category, trans_type, raw_text=""):
        # Handle local mode
        if self.supabase is None:
            print(f"LOCAL MODE: Would add transaction: {description} - {amount}")
            return {"id": "local", "amount": amount, "description": description}
        
        data = {
            "user_id": user_id,
            "amount": float(amount),
            "description": description,
            "category": category,
            "type": trans_type,
            "raw_text": raw_text,
            "created_at": datetime.utcnow().isoformat()
        }
        
        try:
            result = self.supabase.table("transactions").insert(data).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error adding transaction: {e}")
            return None
    
    def get_user_balance(self, user_id):
        # Handle local mode
        if self.supabase is None:
            return 100000.0  # Dummy balance for testing
        
        # Sum of all transactions
        try:
            result = self.supabase.table("transactions")\
                .select("amount, type")\
                .eq("user_id", user_id)\
                .execute()
            
            balance = 0
            for tx in result.data:
                if tx["type"] == "income":
                    balance += tx["amount"]
                else:
                    balance -= tx["amount"]
            
            return balance
        except Exception as e:
            print(f"Error getting balance: {e}")
            return 0.0
    
    def get_recent_transactions(self, user_id, limit=50):
        # Handle local mode
        if self.supabase is None:
            return [
                {"id": "1", "amount": 15000, "description": "Lunch", "category": "food", "type": "expense"},
                {"id": "2", "amount": 50000, "description": "M-Pesa received", "category": "income", "type": "income"}
            ]
        
        try:
            result = self.supabase.table("transactions")\
                .select("*")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data
        except Exception as e:
            print(f"Error getting transactions: {e}")
            return []

db = WMTBDatabase()

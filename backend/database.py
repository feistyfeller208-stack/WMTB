import os
from supabase import create_client, Client
from datetime import datetime
import json

class WMTBDatabase:
    def __init__(self):
        # You'll need to get these from supabase.com
        self.url = os.environ.get("SUPABASE_URL", "")
        self.key = os.environ.get("SUPABASE_KEY", "")
        self.supabase: Client = create_client(self.url, self.key)
    
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
        data = {
            "user_id": user_id,
            "amount": float(amount),
            "description": description,
            "category": category,
            "type": trans_type,
            "raw_text": raw_text,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = self.supabase.table("transactions").insert(data).execute()
        return result.data[0] if result.data else None
    
    def get_user_balance(self, user_id):
        # Sum of all transactions
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
    
    def get_recent_transactions(self, user_id, limit=50):
        result = self.supabase.table("transactions")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data

db = WMTBDatabase()

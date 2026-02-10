import re
from datetime import datetime

class TransactionParser:
    def __init__(self):
        self.categories = {
            'food': ['lunch', 'dinner', 'breakfast', 'chakula', 'cafe', 'restaurant'],
            'transport': ['fuel', 'petrol', 'gas', 'transport', 'uber', 'bolt', 'taxi'],
            'bills': ['bill', 'electricity', 'water', 'internet', 'tv', 'subscription'],
            'shopping': ['shop', 'buy', 'purchase', 'market'],
            'income': ['salary', 'paid', 'received', 'income', 'mpesa received'],
            'business': ['inventory', 'wholesale', 'stock', 'supplies'],
            'family': ['school', 'medical', 'hospital', 'family', 'mom', 'dad']
        }
    
    def parse(self, text):
        """Parse natural language into transaction data"""
        text_lower = text.lower().strip()
        
        # Try to extract amount (TZS 15,000 or 15000 or 15k)
        amount = self._extract_amount(text_lower)
        
        # Determine type (income/expense)
        trans_type = self._determine_type(text_lower)
        
        # Determine category
        category = self._determine_category(text_lower)
        
        # Clean description
        description = self._clean_description(text)
        
        return {
            "amount": amount,
            "type": trans_type,
            "category": category,
            "description": description,
            "raw_text": text
        }
    
    def _extract_amount(self, text):
        # Patterns for Tanzanian amounts
        patterns = [
            r'tzs\s*([\d,]+(?:\.\d{2})?)',  # TZS 15,000
            r'([\d,]+(?:\.\d{2})?)\s*tzs',  # 15,000 TZS
            r'(\d+)\s*k',  # 15k
            r'(\d+(?:,\d+)*(?:\.\d{2})?)',  # 15000 or 15,000.00
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    return float(amount_str)
                except:
                    pass
        
        return 0.0
    
    def _determine_type(self, text):
        income_words = ['received', 'paid', 'salary', 'income', 'deposit', 'sold']
        expense_words = ['spent', 'bought', 'purchased', 'paid for', 'lunch', 'fuel']
        
        if any(word in text for word in income_words):
            return 'income'
        elif any(word in text for word in expense_words):
            return 'expense'
        
        # Default to expense (most common)
        return 'expense'
    
    def _determine_category(self, text):
        text_lower = text.lower()
        
        for category, keywords in self.categories.items():
            if any(keyword in text_lower for keyword in keywords):
                return category
        
        return 'other'
    
    def _clean_description(self, text):
        # Remove amount patterns
        text = re.sub(r'tzs\s*[\d,]+(?:\.\d{2})?', '', text, flags=re.IGNORECASE)
        text = re.sub(r'[\d,]+(?:\.\d{2})?\s*tzs', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\d+\s*k', '', text, flags=re.IGNORECASE)
        
        # Clean up
        text = text.strip()
        if not text:
            return "Transaction"
        
        return text.capitalize()

parser = TransactionParser()

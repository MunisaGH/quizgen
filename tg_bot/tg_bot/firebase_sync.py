import os
import logging
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Base directory for the bot
BASE_DIR = Path(__file__).resolve().parent

def init_firebase():
    """Initializes Firebase Admin SDK if serviceAccountKey.json exists."""
    cert_path = BASE_DIR / "serviceAccountKey.json"
    if not cert_path.exists():
        logger.warning("Firebase sync disabled: serviceAccountKey.json not found in %s", cert_path)
        return False
    
    try:
        cred = credentials.Certificate(str(cert_path))
        firebase_admin.initialize_app(cred)
        return True
    except Exception as e:
        logger.error("Failed to initialize Firebase Admin: %s", e)
        return False

_db = None

def get_db():
    global _db
    if _db is None:
        try:
            _db = firestore.client()
        except Exception as e:
            logger.error("Firestore client error: %s", e)
    return _db

async def sync_premium_to_firestore(firebase_uid: str, days: int):
    """Updates the user's premium status in Firestore."""
    db = get_db()
    if not db:
        return False
    
    try:
        user_ref = db.collection('users').document(firebase_uid)
        
        # Calculate new premium date
        now = datetime.utcnow()
        doc = user_ref.get()
        
        base_date = now
        if doc.exists:
            data = doc.to_dict()
            current_until = data.get('premiumUntil')
            if current_until:
                # Firestore returns datetime objects
                if isinstance(current_until, datetime):
                    if current_until > now:
                        base_date = current_until
        
        new_until = base_date + timedelta(days=days)
        
        user_ref.update({
            'isPremium': True,
            'premiumUntil': new_until
        })
        logger.info("Synced premium to Firestore for user %s: %s", firebase_uid, new_until)
        return True
    except Exception as e:
        logger.error("Failed to sync premium to Firestore: %s", e)
        return False

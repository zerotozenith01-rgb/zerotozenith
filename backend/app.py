"""
Affordable Medicine Access Platform - Backend API
Flask server providing medicine search, alternatives, pharmacy, price comparison, and reviews APIs.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import math
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# ============================================================
# MEDICINE DATABASE
# ============================================================

MEDICINES = [
    # --- Paracetamol group ---
    {"id": 1, "brand_name": "Crocin Advance", "generic_name": "Paracetamol", "salt_composition": "Paracetamol 500mg", "category": "Pain Relief", "manufacturer": "GSK Pharmaceuticals", "price": 30.50, "price_per_unit": 3.05, "dosage_form": "Tablet", "strength": "500mg", "pack_size": "10 tablets", "is_verified": True, "rating": 4.5, "review_count": 1280, "description": "Used for fever and mild to moderate pain relief."},
    {"id": 2, "brand_name": "Dolo 650", "generic_name": "Paracetamol", "salt_composition": "Paracetamol 650mg", "category": "Pain Relief", "manufacturer": "Micro Labs Ltd", "price": 28.56, "price_per_unit": 1.90, "dosage_form": "Tablet", "strength": "650mg", "pack_size": "15 tablets", "is_verified": True, "rating": 4.6, "review_count": 2450, "description": "Effective antipyretic and analgesic for fever and pain."},
    {"id": 3, "brand_name": "Calpol", "generic_name": "Paracetamol", "salt_composition": "Paracetamol 500mg", "category": "Pain Relief", "manufacturer": "GSK Pharmaceuticals", "price": 18.90, "price_per_unit": 1.89, "dosage_form": "Tablet", "strength": "500mg", "pack_size": "10 tablets", "is_verified": True, "rating": 4.3, "review_count": 890, "description": "Trusted paracetamol for fever and body ache relief."},
    {"id": 4, "brand_name": "Pacimol", "generic_name": "Paracetamol", "salt_composition": "Paracetamol 500mg", "category": "Pain Relief", "manufacturer": "Ipca Laboratories", "price": 11.20, "price_per_unit": 1.12, "dosage_form": "Tablet", "strength": "500mg", "pack_size": "10 tablets", "is_verified": True, "rating": 4.1, "review_count": 560, "description": "Affordable paracetamol tablet for pain and fever."},
    {"id": 5, "brand_name": "P-500", "generic_name": "Paracetamol", "salt_composition": "Paracetamol 500mg", "category": "Pain Relief", "manufacturer": "Cipla Ltd", "price": 9.50, "price_per_unit": 0.95, "dosage_form": "Tablet", "strength": "500mg", "pack_size": "10 tablets", "is_verified": True, "rating": 4.0, "review_count": 340, "description": "Generic paracetamol at an affordable price."},

    # --- Ibuprofen + Paracetamol group ---
    {"id": 6, "brand_name": "Combiflam", "generic_name": "Ibuprofen + Paracetamol", "salt_composition": "Ibuprofen 400mg + Paracetamol 325mg", "category": "Pain Relief", "manufacturer": "Sanofi India Ltd", "price": 42.80, "price_per_unit": 2.14, "dosage_form": "Tablet", "strength": "400mg+325mg", "pack_size": "20 tablets", "is_verified": True, "rating": 4.4, "review_count": 1890, "description": "Dual-action pain relief with anti-inflammatory properties."},
    {"id": 7, "brand_name": "Brufen Plus", "generic_name": "Ibuprofen + Paracetamol", "salt_composition": "Ibuprofen 400mg + Paracetamol 325mg", "category": "Pain Relief", "manufacturer": "Abbott India", "price": 36.00, "price_per_unit": 3.60, "dosage_form": "Tablet", "strength": "400mg+325mg", "pack_size": "10 tablets", "is_verified": True, "rating": 4.2, "review_count": 920, "description": "Combines ibuprofen and paracetamol for effective pain relief."},
    {"id": 8, "brand_name": "Ibugesic Plus", "generic_name": "Ibuprofen + Paracetamol", "salt_composition": "Ibuprofen 400mg + Paracetamol 325mg", "category": "Pain Relief", "manufacturer": "Cipla Ltd", "price": 28.50, "price_per_unit": 2.85, "dosage_form": "Tablet", "strength": "400mg+325mg", "pack_size": "10 tablets", "is_verified": True, "rating": 4.3, "review_count": 670, "description": "Affordable combination of ibuprofen and paracetamol."},

    # --- Azithromycin group ---
    {"id": 9, "brand_name": "Azithral 500", "generic_name": "Azithromycin", "salt_composition": "Azithromycin 500mg", "category": "Antibiotic", "manufacturer": "Alembic Pharmaceuticals", "price": 107.50, "price_per_unit": 35.83, "dosage_form": "Tablet", "strength": "500mg", "pack_size": "3 tablets", "is_verified": True, "rating": 4.5, "review_count": 1450, "description": "Broad-spectrum antibiotic for bacterial infections."},
    {"id": 10, "brand_name": "Azee 500", "generic_name": "Azithromycin", "salt_composition": "Azithromycin 500mg", "category": "Antibiotic", "manufacturer": "Cipla Ltd", "price": 89.00, "price_per_unit": 29.67, "dosage_form": "Tablet", "strength": "500mg", "pack_size": "3 tablets", "is_verified": True, "rating": 4.4, "review_count": 1230, "description": "Effective macrolide antibiotic for respiratory and skin infections."},
    {"id": 11, "brand_name": "Azicip 500", "generic_name": "Azithromycin", "salt_composition": "Azithromycin 500mg", "category": "Antibiotic", "manufacturer": "Cipla Ltd", "price": 72.40, "price_per_unit": 24.13, "dosage_form": "Tablet", "strength": "500mg", "pack_size": "3 tablets", "is_verified": True, "rating": 4.2, "review_count": 780, "description": "Cost-effective azithromycin for bacterial infections."},
    {"id": 12, "brand_name": "Zithromax", "generic_name": "Azithromycin", "salt_composition": "Azithromycin 500mg", "category": "Antibiotic", "manufacturer": "Pfizer Ltd", "price": 145.00, "price_per_unit": 48.33, "dosage_form": "Tablet", "strength": "500mg", "pack_size": "3 tablets", "is_verified": True, "rating": 4.6, "review_count": 560, "description": "Original azithromycin brand for various infections."},

    # --- Pantoprazole group ---
    {"id": 13, "brand_name": "Pantocid", "generic_name": "Pantoprazole", "salt_composition": "Pantoprazole 40mg", "category": "Gastro", "manufacturer": "Sun Pharma", "price": 120.00, "price_per_unit": 8.00, "dosage_form": "Tablet", "strength": "40mg", "pack_size": "15 tablets", "is_verified": True, "rating": 4.4, "review_count": 1670, "description": "Proton pump inhibitor for acid reflux and ulcers."},
    {"id": 14, "brand_name": "Pan 40", "generic_name": "Pantoprazole", "salt_composition": "Pantoprazole 40mg", "category": "Gastro", "manufacturer": "Alkem Laboratories", "price": 85.00, "price_per_unit": 5.67, "dosage_form": "Tablet", "strength": "40mg", "pack_size": "15 tablets", "is_verified": True, "rating": 4.3, "review_count": 980, "description": "Affordable pantoprazole for gastric acid control."},
    {"id": 15, "brand_name": "Pantop 40", "generic_name": "Pantoprazole", "salt_composition": "Pantoprazole 40mg", "category": "Gastro", "manufacturer": "Aristo Pharmaceuticals", "price": 62.00, "price_per_unit": 4.13, "dosage_form": "Tablet", "strength": "40mg", "pack_size": "15 tablets", "is_verified": True, "rating": 4.1, "review_count": 540, "description": "Generic pantoprazole at a competitive price."},

    # --- Metformin group ---
    {"id": 16, "brand_name": "Glycomet GP", "generic_name": "Metformin + Glimepiride", "salt_composition": "Metformin 500mg + Glimepiride 1mg", "category": "Diabetes", "manufacturer": "USV Pvt Ltd", "price": 135.00, "price_per_unit": 4.50, "dosage_form": "Tablet", "strength": "500mg+1mg", "pack_size": "30 tablets", "is_verified": True, "rating": 4.5, "review_count": 2100, "description": "Combination therapy for type 2 diabetes management."},
    {"id": 17, "brand_name": "Amaryl M", "generic_name": "Metformin + Glimepiride", "salt_composition": "Metformin 500mg + Glimepiride 1mg", "category": "Diabetes", "manufacturer": "Sanofi India Ltd", "price": 180.50, "price_per_unit": 6.02, "dosage_form": "Tablet", "strength": "500mg+1mg", "pack_size": "30 tablets", "is_verified": True, "rating": 4.6, "review_count": 1560, "description": "Trusted brand for diabetes control with dual action."},
    {"id": 18, "brand_name": "Glimy M", "generic_name": "Metformin + Glimepiride", "salt_composition": "Metformin 500mg + Glimepiride 1mg", "category": "Diabetes", "manufacturer": "Cipla Ltd", "price": 95.00, "price_per_unit": 3.17, "dosage_form": "Tablet", "strength": "500mg+1mg", "pack_size": "30 tablets", "is_verified": True, "rating": 4.2, "review_count": 890, "description": "Affordable diabetes management with metformin and glimepiride."},

    # --- Atorvastatin group ---
    {"id": 19, "brand_name": "Atorva 10", "generic_name": "Atorvastatin", "salt_composition": "Atorvastatin 10mg", "category": "Cardiac", "manufacturer": "Zydus Lifesciences", "price": 92.00, "price_per_unit": 6.13, "dosage_form": "Tablet", "strength": "10mg", "pack_size": "15 tablets", "is_verified": True, "rating": 4.4, "review_count": 1340, "description": "Statin medication for cholesterol management."},
    {"id": 20, "brand_name": "Lipitor", "generic_name": "Atorvastatin", "salt_composition": "Atorvastatin 10mg", "category": "Cardiac", "manufacturer": "Pfizer Ltd", "price": 185.00, "price_per_unit": 12.33, "dosage_form": "Tablet", "strength": "10mg", "pack_size": "15 tablets", "is_verified": True, "rating": 4.7, "review_count": 890, "description": "Original atorvastatin brand for cholesterol reduction."},
    {"id": 21, "brand_name": "Tonact 10", "generic_name": "Atorvastatin", "salt_composition": "Atorvastatin 10mg", "category": "Cardiac", "manufacturer": "Lupin Ltd", "price": 68.00, "price_per_unit": 4.53, "dosage_form": "Tablet", "strength": "10mg", "pack_size": "15 tablets", "is_verified": True, "rating": 4.3, "review_count": 670, "description": "Affordable atorvastatin for lipid management."},

    # --- Telmisartan group ---
    {"id": 22, "brand_name": "Telma 40", "generic_name": "Telmisartan", "salt_composition": "Telmisartan 40mg", "category": "Cardiac", "manufacturer": "Glenmark Pharmaceuticals", "price": 110.00, "price_per_unit": 3.67, "dosage_form": "Tablet", "strength": "40mg", "pack_size": "30 tablets", "is_verified": True, "rating": 4.5, "review_count": 1780, "description": "ARB medication for hypertension management."},
    {"id": 23, "brand_name": "Telmikind 40", "generic_name": "Telmisartan", "salt_composition": "Telmisartan 40mg", "category": "Cardiac", "manufacturer": "Mankind Pharma", "price": 78.00, "price_per_unit": 2.60, "dosage_form": "Tablet", "strength": "40mg", "pack_size": "30 tablets", "is_verified": True, "rating": 4.2, "review_count": 890, "description": "Cost-effective telmisartan for blood pressure control."},
    {"id": 24, "brand_name": "Sartel 40", "generic_name": "Telmisartan", "salt_composition": "Telmisartan 40mg", "category": "Cardiac", "manufacturer": "Sun Pharma", "price": 65.00, "price_per_unit": 2.17, "dosage_form": "Tablet", "strength": "40mg", "pack_size": "30 tablets", "is_verified": True, "rating": 4.1, "review_count": 450, "description": "Affordable telmisartan for hypertension management."},

    # --- Cetirizine group ---
    {"id": 25, "brand_name": "Alerid", "generic_name": "Cetirizine", "salt_composition": "Cetirizine 10mg", "category": "Allergy", "manufacturer": "Cipla Ltd", "price": 35.00, "price_per_unit": 3.50, "dosage_form": "Tablet", "strength": "10mg", "pack_size": "10 tablets", "is_verified": True, "rating": 4.3, "review_count": 1230, "description": "Antihistamine for allergy relief."},
    {"id": 26, "brand_name": "Zyrtec", "generic_name": "Cetirizine", "salt_composition": "Cetirizine 10mg", "category": "Allergy", "manufacturer": "UCB India Pvt Ltd", "price": 52.00, "price_per_unit": 5.20, "dosage_form": "Tablet", "strength": "10mg", "pack_size": "10 tablets", "is_verified": True, "rating": 4.5, "review_count": 980, "description": "Original cetirizine brand for allergy symptoms."},
    {"id": 27, "brand_name": "Okacet", "generic_name": "Cetirizine", "salt_composition": "Cetirizine 10mg", "category": "Allergy", "manufacturer": "Cipla Ltd", "price": 22.00, "price_per_unit": 2.20, "dosage_form": "Tablet", "strength": "10mg", "pack_size": "10 tablets", "is_verified": True, "rating": 4.1, "review_count": 670, "description": "Affordable cetirizine for allergic conditions."},

    # --- Amoxicillin group ---
    {"id": 28, "brand_name": "Augmentin 625", "generic_name": "Amoxicillin + Clavulanate", "salt_composition": "Amoxicillin 500mg + Clavulanic Acid 125mg", "category": "Antibiotic", "manufacturer": "GSK Pharmaceuticals", "price": 220.50, "price_per_unit": 36.75, "dosage_form": "Tablet", "strength": "625mg", "pack_size": "6 tablets", "is_verified": True, "rating": 4.6, "review_count": 2340, "description": "Broad-spectrum antibiotic with beta-lactamase inhibitor."},
    {"id": 29, "brand_name": "Clavam 625", "generic_name": "Amoxicillin + Clavulanate", "salt_composition": "Amoxicillin 500mg + Clavulanic Acid 125mg", "category": "Antibiotic", "manufacturer": "Alkem Laboratories", "price": 168.00, "price_per_unit": 28.00, "dosage_form": "Tablet", "strength": "625mg", "pack_size": "6 tablets", "is_verified": True, "rating": 4.4, "review_count": 1120, "description": "Effective amoxicillin-clavulanate combination antibiotic."},
    {"id": 30, "brand_name": "Moxikind CV", "generic_name": "Amoxicillin + Clavulanate", "salt_composition": "Amoxicillin 500mg + Clavulanic Acid 125mg", "category": "Antibiotic", "manufacturer": "Mankind Pharma", "price": 132.00, "price_per_unit": 22.00, "dosage_form": "Tablet", "strength": "625mg", "pack_size": "6 tablets", "is_verified": True, "rating": 4.2, "review_count": 890, "description": "Affordable amoxicillin-clavulanate for infections."},

    # --- Montelukast group ---
    {"id": 31, "brand_name": "Montair LC", "generic_name": "Montelukast + Levocetirizine", "salt_composition": "Montelukast 10mg + Levocetirizine 5mg", "category": "Respiratory", "manufacturer": "Cipla Ltd", "price": 185.00, "price_per_unit": 6.17, "dosage_form": "Tablet", "strength": "10mg+5mg", "pack_size": "30 tablets", "is_verified": True, "rating": 4.5, "review_count": 1890, "description": "Combination for allergic rhinitis and asthma management."},
    {"id": 32, "brand_name": "Montek LC", "generic_name": "Montelukast + Levocetirizine", "salt_composition": "Montelukast 10mg + Levocetirizine 5mg", "category": "Respiratory", "manufacturer": "Sun Pharma", "price": 165.00, "price_per_unit": 5.50, "dosage_form": "Tablet", "strength": "10mg+5mg", "pack_size": "30 tablets", "is_verified": True, "rating": 4.4, "review_count": 1450, "description": "Dual-action allergy and asthma medication."},
    {"id": 33, "brand_name": "Romilast L", "generic_name": "Montelukast + Levocetirizine", "salt_composition": "Montelukast 10mg + Levocetirizine 5mg", "category": "Respiratory", "manufacturer": "Ranbaxy Laboratories", "price": 120.00, "price_per_unit": 4.00, "dosage_form": "Tablet", "strength": "10mg+5mg", "pack_size": "30 tablets", "is_verified": True, "rating": 4.1, "review_count": 670, "description": "Affordable montelukast-levocetirizine for allergies."},

    # --- Omeprazole group ---
    {"id": 34, "brand_name": "Omez 20", "generic_name": "Omeprazole", "salt_composition": "Omeprazole 20mg", "category": "Gastro", "manufacturer": "Dr. Reddy's Laboratories", "price": 78.00, "price_per_unit": 5.20, "dosage_form": "Capsule", "strength": "20mg", "pack_size": "15 capsules", "is_verified": True, "rating": 4.4, "review_count": 1670, "description": "Proton pump inhibitor for acid-related disorders."},
    {"id": 35, "brand_name": "Ocid 20", "generic_name": "Omeprazole", "salt_composition": "Omeprazole 20mg", "category": "Gastro", "manufacturer": "Zydus Lifesciences", "price": 55.00, "price_per_unit": 3.67, "dosage_form": "Capsule", "strength": "20mg", "pack_size": "15 capsules", "is_verified": True, "rating": 4.2, "review_count": 890, "description": "Cost-effective omeprazole for GERD and ulcers."},

    # --- Aspirin group ---
    {"id": 36, "brand_name": "Ecosprin 75", "generic_name": "Aspirin", "salt_composition": "Aspirin 75mg", "category": "Cardiac", "manufacturer": "USV Pvt Ltd", "price": 15.50, "price_per_unit": 0.52, "dosage_form": "Tablet", "strength": "75mg", "pack_size": "30 tablets", "is_verified": True, "rating": 4.5, "review_count": 2340, "description": "Low-dose aspirin for cardiovascular protection."},
    {"id": 37, "brand_name": "Disprin", "generic_name": "Aspirin", "salt_composition": "Aspirin 350mg", "category": "Pain Relief", "manufacturer": "Reckitt Benckiser", "price": 12.80, "price_per_unit": 1.28, "dosage_form": "Tablet", "strength": "350mg", "pack_size": "10 tablets", "is_verified": True, "rating": 4.2, "review_count": 980, "description": "Soluble aspirin for headache and pain relief."},

    # --- Calcium + Vitamin D3 group ---
    {"id": 38, "brand_name": "Shelcal 500", "generic_name": "Calcium + Vitamin D3", "salt_composition": "Calcium 500mg + Vitamin D3 250IU", "category": "Supplements", "manufacturer": "Torrent Pharmaceuticals", "price": 145.00, "price_per_unit": 4.83, "dosage_form": "Tablet", "strength": "500mg+250IU", "pack_size": "30 tablets", "is_verified": True, "rating": 4.4, "review_count": 1560, "description": "Calcium and vitamin D supplement for bone health."},
    {"id": 39, "brand_name": "Calcimax", "generic_name": "Calcium + Vitamin D3", "salt_composition": "Calcium 500mg + Vitamin D3 250IU", "category": "Supplements", "manufacturer": "Meyer Organics", "price": 110.00, "price_per_unit": 3.67, "dosage_form": "Tablet", "strength": "500mg+250IU", "pack_size": "30 tablets", "is_verified": True, "rating": 4.3, "review_count": 890, "description": "Calcium supplement with vitamin D3 for strong bones."},
    {"id": 40, "brand_name": "Gemcal", "generic_name": "Calcium + Vitamin D3", "salt_composition": "Calcium 500mg + Vitamin D3 250IU", "category": "Supplements", "manufacturer": "Cachet Pharmaceuticals", "price": 78.00, "price_per_unit": 2.60, "dosage_form": "Tablet", "strength": "500mg+250IU", "pack_size": "30 tablets", "is_verified": True, "rating": 4.0, "review_count": 340, "description": "Affordable calcium-vitamin D3 supplement."},
]

# ============================================================
# PHARMACY DATABASE
# ============================================================

PHARMACIES = [
    {"id": 1, "name": "Apollo Pharmacy", "address": "MG Road, Sector 14, Gurugram", "lat": 28.4595, "lng": 77.0266, "phone": "+91 9876543210", "open_time": "8:00 AM - 10:00 PM", "rating": 4.5},
    {"id": 2, "name": "MedPlus Health", "address": "DLF Phase 3, Gurugram", "lat": 28.4945, "lng": 77.0949, "phone": "+91 9876543211", "open_time": "9:00 AM - 9:00 PM", "rating": 4.3},
    {"id": 3, "name": "Netmeds Store", "address": "Sohna Road, Gurugram", "lat": 28.4132, "lng": 77.0438, "phone": "+91 9876543212", "open_time": "8:30 AM - 10:30 PM", "rating": 4.4},
    {"id": 4, "name": "Wellness Forever", "address": "Cyber Hub, Gurugram", "lat": 28.4940, "lng": 77.0882, "phone": "+91 9876543213", "open_time": "10:00 AM - 11:00 PM", "rating": 4.6},
    {"id": 5, "name": "Frank Ross Pharmacy", "address": "Golf Course Road, Gurugram", "lat": 28.4475, "lng": 77.0618, "phone": "+91 9876543214", "open_time": "9:00 AM - 9:30 PM", "rating": 4.2},
    {"id": 6, "name": "Guardian Pharmacy", "address": "Sector 29, Gurugram", "lat": 28.4613, "lng": 77.0641, "phone": "+91 9876543215", "open_time": "8:00 AM - 11:00 PM", "rating": 4.7},
    {"id": 7, "name": "Sanjivani Medical", "address": "Huda Market, Sector 15, Gurugram", "lat": 28.4658, "lng": 77.0382, "phone": "+91 9876543216", "open_time": "7:30 AM - 10:00 PM", "rating": 4.1},
    {"id": 8, "name": "LifeCare Pharmacy", "address": "South City 1, Gurugram", "lat": 28.4391, "lng": 77.0506, "phone": "+91 9876543217", "open_time": "9:00 AM - 10:00 PM", "rating": 4.4},
]

# ============================================================
# REVIEWS DATABASE (in-memory)
# ============================================================

REVIEWS = [
    {"id": 1, "medicine_id": 1, "user_name": "Rajesh Kumar", "rating": 5, "comment": "Very effective for fever. Works within 30 minutes. Have been using it for years.", "date": "2026-04-01", "verified_purchase": True},
    {"id": 2, "medicine_id": 1, "user_name": "Priya Sharma", "rating": 4, "comment": "Good for mild headaches. No side effects noticed.", "date": "2026-03-28", "verified_purchase": True},
    {"id": 3, "medicine_id": 2, "user_name": "Amit Patel", "rating": 5, "comment": "Dolo 650 is my go-to for fever. Works quickly and reliably.", "date": "2026-04-05", "verified_purchase": True},
    {"id": 4, "medicine_id": 2, "user_name": "Sneha Gupta", "rating": 4, "comment": "Doctor recommended for COVID fever. Worked well.", "date": "2026-03-20", "verified_purchase": False},
    {"id": 5, "medicine_id": 6, "user_name": "Vikram Singh", "rating": 5, "comment": "Best combination for body pain. Quick relief from muscle ache.", "date": "2026-04-03", "verified_purchase": True},
    {"id": 6, "medicine_id": 6, "user_name": "Ananya Reddy", "rating": 4, "comment": "Effective but can cause slight stomach discomfort. Take after food.", "date": "2026-03-25", "verified_purchase": True},
    {"id": 7, "medicine_id": 9, "user_name": "Dr. Meena Iyer", "rating": 5, "comment": "Reliable azithromycin. Prescribed for respiratory infections frequently.", "date": "2026-04-02", "verified_purchase": True},
    {"id": 8, "medicine_id": 13, "user_name": "Suresh Nair", "rating": 4, "comment": "Works well for acidity. Take 30 minutes before food for best results.", "date": "2026-03-30", "verified_purchase": True},
    {"id": 9, "medicine_id": 16, "user_name": "Ramesh Joshi", "rating": 5, "comment": "Effective for sugar control. Been using for 2 years with good HbA1c results.", "date": "2026-04-04", "verified_purchase": True},
    {"id": 10, "medicine_id": 22, "user_name": "Kavita Menon", "rating": 4, "comment": "Keeps BP stable. Doctor changed me from amlodipine to this and results are better.", "date": "2026-03-22", "verified_purchase": True},
    {"id": 11, "medicine_id": 28, "user_name": "Arun Pillai", "rating": 5, "comment": "Strong antibiotic. Cleared my throat infection in 5 days.", "date": "2026-04-06", "verified_purchase": True},
    {"id": 12, "medicine_id": 31, "user_name": "Deepa Krishnan", "rating": 4, "comment": "Relief from allergic rhinitis. Less drowsiness than older medications.", "date": "2026-03-18", "verified_purchase": True},
    {"id": 13, "medicine_id": 38, "user_name": "Sunita Devi", "rating": 5, "comment": "Good calcium supplement. My bone density improved after 6 months.", "date": "2026-04-07", "verified_purchase": True},
    {"id": 14, "medicine_id": 25, "user_name": "Manoj Tiwari", "rating": 4, "comment": "Takes effect within an hour. Good for seasonal allergies.", "date": "2026-04-08", "verified_purchase": True},
    {"id": 15, "medicine_id": 36, "user_name": "Dr. Sanjay Mishra", "rating": 5, "comment": "Essential for cardiac patients. Reliable brand with consistent quality.", "date": "2026-03-15", "verified_purchase": True},
]

# Track next review ID
_next_review_id = len(REVIEWS) + 1

# User search history (in-memory for demo)
SEARCH_HISTORY = []

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def calculate_distance(lat1, lng1, lat2, lng2):
    """Calculate approximate distance in km between two coordinates."""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return round(R * c, 1)


def get_pharmacy_stock(pharmacy_id, medicine_id):
    """Simulate pharmacy stock and pricing."""
    random.seed(pharmacy_id * 100 + medicine_id)
    in_stock = random.random() > 0.25  # 75% chance of being in stock
    medicine = next((m for m in MEDICINES if m["id"] == medicine_id), None)
    if not medicine:
        return {"in_stock": False, "price": 0}
    # Pharmacies have slight price variations
    price_variation = random.uniform(0.85, 1.10)
    return {
        "in_stock": in_stock,
        "price": round(medicine["price"] * price_variation, 2)
    }


# ============================================================
# API ROUTES
# ============================================================

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})


@app.route("/api/medicines/search", methods=["GET"])
def search_medicines():
    """Search medicines by name, generic name, or salt composition."""
    query = request.args.get("q", "").lower().strip()
    category = request.args.get("category", "").strip()

    if not query and not category:
        return jsonify({"medicines": MEDICINES[:10], "total": len(MEDICINES[:10])})

    results = []
    for med in MEDICINES:
        match = False
        if query:
            if (query in med["brand_name"].lower() or
                query in med["generic_name"].lower() or
                query in med["salt_composition"].lower() or
                query in med["category"].lower()):
                match = True
        if category and med["category"].lower() == category.lower():
            match = True if not query else match
        if match:
            results.append(med)

    # Track search history
    if query:
        SEARCH_HISTORY.append({
            "query": query,
            "timestamp": datetime.now().isoformat(),
            "results_count": len(results)
        })

    return jsonify({"medicines": results, "total": len(results)})


@app.route("/api/medicines/<int:medicine_id>", methods=["GET"])
def get_medicine(medicine_id):
    """Get detailed information about a specific medicine."""
    medicine = next((m for m in MEDICINES if m["id"] == medicine_id), None)
    if not medicine:
        return jsonify({"error": "Medicine not found"}), 404
    return jsonify(medicine)


@app.route("/api/medicines/<int:medicine_id>/alternatives", methods=["GET"])
def get_alternatives(medicine_id):
    """Get alternative medicines with the same salt composition."""
    medicine = next((m for m in MEDICINES if m["id"] == medicine_id), None)
    if not medicine:
        return jsonify({"error": "Medicine not found"}), 404

    # Find exact composition matches
    exact_matches = [
        m for m in MEDICINES
        if m["salt_composition"] == medicine["salt_composition"] and m["id"] != medicine_id
    ]

    # Find similar composition matches (same generic name but different strength)
    similar_matches = [
        m for m in MEDICINES
        if m["generic_name"] == medicine["generic_name"]
        and m["salt_composition"] != medicine["salt_composition"]
        and m["id"] != medicine_id
        and m not in exact_matches
    ]

    # Calculate savings for each alternative
    for alt in exact_matches:
        alt["composition_match"] = "exact"
        alt["savings_percent"] = round(max(0, (medicine["price"] - alt["price"]) / medicine["price"] * 100), 1)
        alt["safe_substitute"] = True

    for alt in similar_matches:
        alt["composition_match"] = "similar"
        alt["savings_percent"] = round(max(0, (medicine["price"] - alt["price"]) / medicine["price"] * 100), 1)
        alt["safe_substitute"] = False

    return jsonify({
        "original": medicine,
        "exact_matches": exact_matches,
        "similar_matches": similar_matches,
        "total_alternatives": len(exact_matches) + len(similar_matches)
    })


@app.route("/api/pharmacies/nearby", methods=["GET"])
def get_nearby_pharmacies():
    """Get nearby pharmacies with stock information for a specific medicine."""
    medicine_id = request.args.get("medicine_id", type=int)
    lat = request.args.get("lat", 28.4595, type=float)
    lng = request.args.get("lng", 77.0266, type=float)

    results = []
    for pharmacy in PHARMACIES:
        distance = calculate_distance(lat, lng, pharmacy["lat"], pharmacy["lng"])
        stock = get_pharmacy_stock(pharmacy["id"], medicine_id) if medicine_id else {"in_stock": True, "price": 0}

        results.append({
            **pharmacy,
            "distance": f"{distance} km",
            "distance_value": distance,
            "in_stock": stock["in_stock"],
            "medicine_price": stock["price"]
        })

    results.sort(key=lambda x: x["distance_value"])
    return jsonify({"pharmacies": results, "total": len(results)})


@app.route("/api/prices/compare", methods=["GET"])
def compare_prices():
    """Compare prices of a medicine across alternatives and pharmacies."""
    medicine_id = request.args.get("medicine_id", type=int)
    if not medicine_id:
        return jsonify({"error": "medicine_id is required"}), 400

    medicine = next((m for m in MEDICINES if m["id"] == medicine_id), None)
    if not medicine:
        return jsonify({"error": "Medicine not found"}), 404

    # Get all alternatives for comparison
    alternatives = [m for m in MEDICINES if m["salt_composition"] == medicine["salt_composition"]]

    # Price data for charts
    price_chart_data = []
    for alt in alternatives:
        price_chart_data.append({
            "name": alt["brand_name"],
            "price": alt["price"],
            "type": "original" if alt["id"] == medicine_id else ("generic" if alt["price"] < medicine["price"] * 0.7 else "alternative"),
            "manufacturer": alt["manufacturer"],
            "price_per_unit": alt["price_per_unit"]
        })

    # Sort by price
    price_chart_data.sort(key=lambda x: x["price"])

    # Pharmacy prices
    pharmacy_prices = []
    for pharmacy in PHARMACIES[:5]:
        stock = get_pharmacy_stock(pharmacy["id"], medicine_id)
        if stock["in_stock"]:
            pharmacy_prices.append({
                "pharmacy_name": pharmacy["name"],
                "price": stock["price"],
                "address": pharmacy["address"]
            })

    return jsonify({
        "medicine": medicine,
        "alternatives_comparison": price_chart_data,
        "pharmacy_prices": pharmacy_prices,
        "cheapest": min(price_chart_data, key=lambda x: x["price"]) if price_chart_data else None,
        "most_expensive": max(price_chart_data, key=lambda x: x["price"]) if price_chart_data else None,
        "potential_savings": round(max(0, medicine["price"] - min(a["price"] for a in alternatives)), 2) if alternatives else 0
    })


@app.route("/api/reviews/<int:medicine_id>", methods=["GET"])
def get_reviews(medicine_id):
    """Get reviews for a specific medicine."""
    medicine_reviews = [r for r in REVIEWS if r["medicine_id"] == medicine_id]
    medicine_reviews.sort(key=lambda x: x["date"], reverse=True)

    avg_rating = 0
    if medicine_reviews:
        avg_rating = round(sum(r["rating"] for r in medicine_reviews) / len(medicine_reviews), 1)

    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in medicine_reviews:
        rating_distribution[r["rating"]] += 1

    return jsonify({
        "reviews": medicine_reviews,
        "total": len(medicine_reviews),
        "average_rating": avg_rating,
        "rating_distribution": rating_distribution
    })


@app.route("/api/reviews", methods=["POST"])
def add_review():
    """Add a new review for a medicine."""
    global _next_review_id
    data = request.get_json()

    if not data or not all(k in data for k in ["medicine_id", "user_name", "rating", "comment"]):
        return jsonify({"error": "Missing required fields"}), 400

    review = {
        "id": _next_review_id,
        "medicine_id": data["medicine_id"],
        "user_name": data["user_name"],
        "rating": min(5, max(1, data["rating"])),
        "comment": data["comment"],
        "date": datetime.now().strftime("%Y-%m-%d"),
        "verified_purchase": False
    }

    REVIEWS.append(review)
    _next_review_id += 1

    return jsonify({"message": "Review added successfully", "review": review}), 201


@app.route("/api/upload/prescription", methods=["POST"])
def upload_prescription():
    """Simulate prescription upload and OCR. Returns detected medicines."""
    # Simulate OCR processing
    detected_medicines = random.sample(MEDICINES[:10], min(3, len(MEDICINES[:10])))
    return jsonify({
        "message": "Prescription processed successfully",
        "detected_medicines": [
            {"name": m["brand_name"], "generic_name": m["generic_name"], "id": m["id"]}
            for m in detected_medicines
        ]
    })


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Get all medicine categories."""
    categories = list(set(m["category"] for m in MEDICINES))
    category_data = []
    for cat in sorted(categories):
        count = sum(1 for m in MEDICINES if m["category"] == cat)
        category_data.append({"name": cat, "count": count})
    return jsonify({"categories": category_data})


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Get platform statistics for the dashboard."""
    total_medicines = len(MEDICINES)
    total_brands = len(set(m["brand_name"] for m in MEDICINES))
    total_generics = len(set(m["generic_name"] for m in MEDICINES))
    categories = list(set(m["category"] for m in MEDICINES))
    avg_savings = round(sum(
        max(0, max(m2["price"] for m2 in MEDICINES if m2["salt_composition"] == m["salt_composition"]) - m["price"])
        / max(m2["price"] for m2 in MEDICINES if m2["salt_composition"] == m["salt_composition"]) * 100
        for m in MEDICINES
        if any(m2 for m2 in MEDICINES if m2["salt_composition"] == m["salt_composition"] and m2["id"] != m["id"])
    ) / max(1, total_medicines), 1)

    # Category distribution
    category_stats = []
    for cat in categories:
        meds = [m for m in MEDICINES if m["category"] == cat]
        category_stats.append({
            "name": cat,
            "count": len(meds),
            "avg_price": round(sum(m["price"] for m in meds) / len(meds), 2)
        })

    # Recent searches
    recent_searches = SEARCH_HISTORY[-5:] if SEARCH_HISTORY else [
        {"query": "paracetamol", "timestamp": "2026-04-10T10:30:00", "results_count": 5},
        {"query": "azithromycin", "timestamp": "2026-04-10T09:15:00", "results_count": 4},
        {"query": "pantoprazole", "timestamp": "2026-04-09T14:20:00", "results_count": 3},
    ]

    # Top savings medicines
    top_savings = []
    processed_salts = set()
    for med in MEDICINES:
        if med["salt_composition"] in processed_salts:
            continue
        same_salt = [m for m in MEDICINES if m["salt_composition"] == med["salt_composition"]]
        if len(same_salt) > 1:
            prices = [m["price"] for m in same_salt]
            max_price = max(prices)
            min_price = min(prices)
            savings_pct = round((max_price - min_price) / max_price * 100, 1)
            if savings_pct > 0:
                expensive = next(m for m in same_salt if m["price"] == max_price)
                cheapest = next(m for m in same_salt if m["price"] == min_price)
                top_savings.append({
                    "expensive_brand": expensive["brand_name"],
                    "cheapest_brand": cheapest["brand_name"],
                    "savings_percent": savings_pct,
                    "savings_amount": round(max_price - min_price, 2),
                    "salt_composition": med["salt_composition"]
                })
            processed_salts.add(med["salt_composition"])

    top_savings.sort(key=lambda x: x["savings_percent"], reverse=True)

    return jsonify({
        "total_medicines": total_medicines,
        "total_brands": total_brands,
        "total_generics": total_generics,
        "total_pharmacies": len(PHARMACIES),
        "total_reviews": len(REVIEWS),
        "average_savings": avg_savings,
        "categories": category_stats,
        "recent_searches": recent_searches,
        "top_savings": top_savings[:5]
    })


@app.route("/api/shopkeeper/request", methods=["POST"])
def shopkeeper_request():
    """Send a stock request to a pharmacy (simulated)."""
    data = request.get_json()
    if not data or not all(k in data for k in ["pharmacy_id", "medicine_id"]):
        return jsonify({"error": "Missing required fields"}), 400

    pharmacy = next((p for p in PHARMACIES if p["id"] == data["pharmacy_id"]), None)
    medicine = next((m for m in MEDICINES if m["id"] == data["medicine_id"]), None)

    if not pharmacy or not medicine:
        return jsonify({"error": "Pharmacy or medicine not found"}), 404

    # Simulate response
    return jsonify({
        "message": f"Stock request sent to {pharmacy['name']}",
        "pharmacy": pharmacy["name"],
        "medicine": medicine["brand_name"],
        "estimated_response": "5-10 minutes",
        "status": "pending"
    })


if __name__ == "__main__":
    print("[*] Medicine Platform API starting on http://localhost:5000")
    print(f"[*] Loaded {len(MEDICINES)} medicines, {len(PHARMACIES)} pharmacies, {len(REVIEWS)} reviews")
    app.run(debug=True, port=5000)

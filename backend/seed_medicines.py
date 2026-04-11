import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))
from supabase import create_client

s = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

# Get existing salt IDs
salts = s.table('salts').select('id, salt_name').execute().data
salt_map = {x['salt_name']: x['id'] for x in salts}

medicines = [
    ("Crocin 650", "GSK", "Tablet", 30, "Paracetamol", 650),
    ("Dolo 650", "Micro Labs", "Tablet", 28, "Paracetamol", 650),
    ("Calpol 500", "GSK", "Tablet", 22, "Paracetamol", 500),
    ("Combiflam", "Sanofi", "Tablet", 42, "Ibuprofen", 400),
    ("Brufen 400", "Abbott", "Tablet", 35, "Ibuprofen", 400),
    ("Mox 500", "Cipla", "Capsule", 75, "Amoxicillin", 500),
    ("Augmentin 625", "GSK", "Tablet", 220, "Amoxicillin", 500),
    ("Azithral 500", "Alembic", "Tablet", 95, "Azithromycin", 500),
    ("Zithromax 500", "Pfizer", "Tablet", 180, "Azithromycin", 500),
    ("Ciplox 500", "Cipla", "Tablet", 65, "Ciprofloxacin", 500),
    ("Glycomet 500", "USV", "Tablet", 30, "Metformin", 500),
    ("Glycomet 1000", "USV", "Tablet", 55, "Metformin", 1000),
    ("Telma 40", "Glenmark", "Tablet", 120, "Telmisartan", 40),
    ("Pan 40", "Alkem", "Tablet", 85, "Pantoprazole", 40),
    ("Pantocid 40", "Sun Pharma", "Tablet", 110, "Pantoprazole", 40),
    ("Cetirizine 10", "Cipla", "Tablet", 15, "Cetirizine", 10),
    ("Allegra 120", "Sanofi", "Tablet", 185, "Fexofenadine", 120),
    ("Montair LC", "Cipla", "Tablet", 165, "Montelukast", 10),
    ("Shelcal 500", "Torrent", "Tablet", 140, "Calcium", 500),
]

count = 0
for brand, mfr, form, price, salt_name, strength in medicines:
    # Get or create salt
    sid = salt_map.get(salt_name)
    if not sid:
        sr = s.table('salts').insert({'salt_name': salt_name}).execute()
        sid = sr.data[0]['id']
        salt_map[salt_name] = sid

    # Check if medicine already exists
    existing = s.table('medicines').select('id').ilike('brand_name', brand).execute()
    if existing.data:
        print(f"  SKIP {brand} (already exists)")
        continue

    # Insert medicine
    mr = s.table('medicines').insert({
        'brand_name': brand,
        'manufacturer': mfr,
        'form': form,
        'cdsco_approved': True,
    }).execute()
    mid = mr.data[0]['id']

    # Set price
    try:
        s.table('medicines').update({'price': price}).eq('id', mid).execute()
    except Exception:
        pass

    # Link composition
    s.table('medicine_composition').insert({
        'medicine_id': mid,
        'salt_id': sid,
        'strength_mg': strength,
    }).execute()

    count += 1
    print(f"  OK {brand} ({salt_name} {strength}mg) = Rs.{price}")

print(f"\nDone! Inserted {count} medicines.")

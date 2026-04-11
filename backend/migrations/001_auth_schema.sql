-- ============================================================
--  SmartMeds – Auth Schema Additions
--  Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Add password_hash column to users table (for simple auth)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. Add phone, location, allergies, blood_group for profile
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS allergies TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5) DEFAULT '';

-- 3. Create medical history tables
CREATE TABLE IF NOT EXISTS user_treatments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    condition VARCHAR(255) NOT NULL,
    doctor VARCHAR(255) DEFAULT '',
    treatment_date DATE,
    medicines_used TEXT[] DEFAULT '{}',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_current_medicines (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) DEFAULT '',
    frequency VARCHAR(100) DEFAULT 'Once daily',
    since DATE,
    prescribed_by VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Enable RLS (optional, for production)
-- ALTER TABLE user_treatments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_current_medicines ENABLE ROW LEVEL SECURITY;

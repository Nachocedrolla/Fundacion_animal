-- supabase/migrations/001_initial_schema.sql

-- Tabla animales
CREATE TABLE IF NOT EXISTS animales (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text NOT NULL,
  especie    text NOT NULL CHECK (especie IN ('perro','gato','otro')),
  edad       text,
  historia   text,
  foto_url   text,
  adoptado   boolean DEFAULT false,
  destacado  boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tabla testimonios
CREATE TABLE IF NOT EXISTS testimonios (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre     text NOT NULL,
  tipo       text NOT NULL CHECK (tipo IN ('adoptante','voluntario','donante')),
  texto      text NOT NULL,
  foto_url   text,
  destacado  boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS animales
ALTER TABLE animales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_animales" ON animales FOR SELECT USING (true);
CREATE POLICY "admin_all_animales"     ON animales FOR ALL   USING (auth.role() = 'authenticated');

-- RLS testimonios
ALTER TABLE testimonios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_select_testimonios" ON testimonios FOR SELECT USING (true);
CREATE POLICY "admin_all_testimonios"     ON testimonios FOR ALL   USING (auth.role() = 'authenticated');

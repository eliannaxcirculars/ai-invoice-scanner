-- ============================================================
-- AI Invoice Scanner — Schema SQL
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Tabla principal de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number   TEXT NOT NULL,
  issue_date       TEXT NOT NULL,
  due_date         TEXT,
  vendor_name      TEXT NOT NULL,
  vendor_tax_id    TEXT,
  vendor_address   TEXT,
  vendor_email     TEXT,
  customer_name    TEXT NOT NULL,
  customer_tax_id  TEXT,
  customer_address TEXT,
  customer_email   TEXT,
  items            JSONB NOT NULL DEFAULT '[]',
  subtotal         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_rate         NUMERIC(5, 2)  NOT NULL DEFAULT 0,
  tax_amount       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total            NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency         TEXT NOT NULL DEFAULT 'USD',
  notes            TEXT,
  file_url         TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de líneas de factura (relacional)
CREATE TABLE IF NOT EXISTS invoice_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- ============================================================
-- Supabase Storage: crear bucket "invoices" (acceso público)
-- Ejecutar desde Dashboard > Storage o con la API de admin
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('invoices', 'invoices', true)
-- ON CONFLICT (id) DO NOTHING;

# AI Invoice Scanner

Aplicación web que permite subir una factura (imagen o PDF), procesarla con IA a través de un flujo automatizado en n8n y mostrar la información estructurada al usuario.

**Demo:** [URL de Netlify aquí]

---

## Flujo completo

```
Usuario sube factura
      ↓
Frontend (React)
      ↓
Supabase Storage  ← guarda el archivo, devuelve URL pública
      ↓
n8n Webhook       ← recibe { fileUrl, fileName, mimeType }
      ↓
Claude API        ← analiza la imagen/PDF con visión IA
      ↓
JSON estructurado ← { vendor_name, invoice_number, total, items… }
      ↓
Supabase DB       ← guarda en `invoices` + `invoice_items`
      ↓
Frontend          ← muestra los datos extraídos al usuario
```

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite 5 |
| Deploy | Netlify |
| Storage | Supabase Storage (bucket `invoices`) |
| Base de datos | Supabase PostgreSQL |
| Automatización | n8n |
| IA | Claude (Anthropic) via API |
| MCP | Model Context Protocol server (query a BD) |

---

## Cómo funciona n8n

El workflow en n8n consta de estos nodos:

1. **Webhook** — Escucha POST en `/webhook/scan-invoice`. Recibe `fileUrl`, `fileName`, `mimeType`.
2. **HTTP Request** — Descarga el archivo desde la URL de Supabase Storage.
3. **Claude (Anthropic node o HTTP)** — Envía el archivo con el prompt:
   ```
   Analiza esta factura y extrae la información en JSON con este formato exacto:
   {
     "vendor_name": "",
     "invoice_number": "",
     "invoice_date": "",
     "total": "",
     "items": [{ "name": "", "quantity": "", "price": "" }]
   }
   Responde SOLO con el JSON, sin texto adicional.
   ```
4. **Code node** — Parsea el JSON de Claude y construye el objeto `invoice`.
5. **Respond to Webhook** — Devuelve `{ success: true, invoice: { … } }` al frontend.

---

## Cómo se integra la IA

- Claude recibe la URL pública del archivo desde Supabase Storage.
- El nodo de IA en n8n usa la API de Anthropic con el modelo `claude-opus-4-6` o `claude-sonnet-4-6`.
- El prompt fuerza una respuesta en JSON estricto para facilitar el parsing.
- El frontend valida que la respuesta contenga `{ success: true, invoice }` antes de guardar.

---

## MCP (Model Context Protocol)

El proyecto incluye un servidor MCP (`mcp-server/`) que expone herramientas para que Claude pueda consultar las facturas almacenadas:

| Tool | Descripción |
|------|-------------|
| `list_invoices` | Lista las N facturas más recientes |
| `get_invoice` | Obtiene una factura completa por ID |
| `search_invoices` | Busca por número de factura o nombre del vendor |

Esto permite que Claude Code, dentro de Claude Desktop u otro cliente MCP, consulte y analice el historial de facturas directamente desde la base de datos.

---

## Base de datos

Dos tablas en Supabase PostgreSQL:

- **`invoices`** — datos generales de la factura (vendor, customer, totales, URL del archivo)
- **`invoice_items`** — líneas de detalle con FK a `invoices`

El schema completo está en [`schema.sql`](./schema.sql).

---

## Instrucciones para correr el proyecto

### 1. Requisitos previos
- Node.js 20+
- Cuenta en [Supabase](https://supabase.com)
- Instancia de n8n (local o cloud)
- API Key de Anthropic (Claude)

### 2. Supabase — configurar BD y Storage

```sql
-- En Supabase > SQL Editor, ejecutar schema.sql
```

Crear bucket de Storage:
- Ir a **Storage** en Supabase Dashboard
- Crear bucket llamado `invoices` con acceso **público**

### 3. n8n — importar workflow

- Importar el JSON del workflow (carpeta `n8n-workflow/` si incluido) o recrear los nodos descritos arriba
- Activar el workflow y copiar la URL del webhook

### 4. Variables de entorno

Crear `frontend/.env` con:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_N8N_WEBHOOK_URL=https://tu-n8n.host/webhook/scan-invoice
```

### 5. Correr en desarrollo

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 6. Build para producción

```bash
cd frontend
npm run build
# output en frontend/dist/
```

### 7. Deploy en Netlify

Conectar el repositorio en Netlify. El archivo `netlify.toml` ya configura:
- **Base directory:** `frontend`
- **Build command:** `npm run build`
- **Publish directory:** `dist`

Agregar las variables de entorno en **Netlify > Site settings > Environment variables**.

---

## MCP Server (local)

```bash
cd mcp-server
npm install
```

Configurar `.mcp.json` en la raíz con las credenciales de Supabase. El servidor se activa automáticamente al abrir Claude Code en este directorio.

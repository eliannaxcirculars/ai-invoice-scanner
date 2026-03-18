/**
 * MCP Server — AI Invoice Scanner
 *
 * Expone herramientas para que Claude pueda consultar y analizar
 * las facturas almacenadas en Supabase.
 *
 * Herramientas disponibles:
 *  - list_invoices   : lista las últimas N facturas
 *  - get_invoice     : obtiene una factura por ID
 *  - search_invoices : busca facturas por número o proveedor
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { createClient } from '@supabase/supabase-js'

// ── Supabase client ──────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Error: SUPABASE_URL y SUPABASE_ANON_KEY son requeridas.\n' +
    'Configúralas en .mcp.json o como variables de entorno.'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Mapea una fila snake_case de Supabase al dominio camelCase */
function mapRow(row) {
  return {
    id:            row.id,
    invoiceNumber: row.invoice_number,
    issueDate:     row.issue_date,
    dueDate:       row.due_date,
    vendor: {
      name:    row.vendor_name,
      taxId:   row.vendor_tax_id,
      address: row.vendor_address,
      email:   row.vendor_email,
    },
    customer: {
      name:    row.customer_name,
      taxId:   row.customer_tax_id,
      address: row.customer_address,
      email:   row.customer_email,
    },
    items:     row.items ?? [],
    subtotal:  row.subtotal,
    taxRate:   row.tax_rate,
    taxAmount: row.tax_amount,
    total:     row.total,
    currency:  row.currency,
    notes:     row.notes,
    fileUrl:   row.file_url,
    createdAt: row.created_at,
  }
}

function textResult(content) {
  return { content: [{ type: 'text', text: content }] }
}

// ── MCP Server ───────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'invoice-scanner', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

// ── Tool definitions ─────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_invoices',
      description:
        'Lista las últimas facturas procesadas por el escáner IA. ' +
        'Devuelve número de factura, fechas, emisor, receptor y totales.',
      inputSchema: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Número máximo de facturas a devolver (por defecto 10, máximo 50)',
          },
        },
      },
    },
    {
      name: 'get_invoice',
      description: 'Obtiene el detalle completo de una factura por su ID de Supabase.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'UUID de la factura en Supabase',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'search_invoices',
      description:
        'Busca facturas por número de factura o nombre del proveedor/emisor. ' +
        'La búsqueda es parcial e insensible a mayúsculas.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Texto a buscar en número de factura o nombre del proveedor',
          },
        },
        required: ['query'],
      },
    },
  ],
}))

// ── Tool handlers ────────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  switch (name) {
    // ── list_invoices ────────────────────────────────────────────────────────
    case 'list_invoices': {
      const limit = Math.min(Number(args?.limit) || 10, 50)
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return textResult(`Error al consultar facturas: ${error.message}`)
      }

      if (!data || data.length === 0) {
        return textResult('No hay facturas almacenadas todavía.')
      }

      const invoices = data.map(mapRow)
      const summary = invoices
        .map(
          (inv) =>
            `• [${inv.invoiceNumber}] ${inv.vendor.name} → ${inv.customer.name} | ` +
            `${inv.total} ${inv.currency} | ${inv.issueDate} | ID: ${inv.id}`
        )
        .join('\n')

      return textResult(`Se encontraron ${invoices.length} factura(s):\n\n${summary}`)
    }

    // ── get_invoice ──────────────────────────────────────────────────────────
    case 'get_invoice': {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', args.id)
        .single()

      if (error || !data) {
        return textResult(`Factura no encontrada: ${error?.message ?? 'ID inválido'}`)
      }

      const inv = mapRow(data)
      const detail = JSON.stringify(inv, null, 2)
      return textResult(`Factura encontrada:\n\n\`\`\`json\n${detail}\n\`\`\``)
    }

    // ── search_invoices ──────────────────────────────────────────────────────
    case 'search_invoices': {
      const q = String(args.query).trim()
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .or(`invoice_number.ilike.%${q}%,vendor_name.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        return textResult(`Error en la búsqueda: ${error.message}`)
      }

      if (!data || data.length === 0) {
        return textResult(`No se encontraron facturas para: "${q}"`)
      }

      const invoices = data.map(mapRow)
      const summary = invoices
        .map(
          (inv) =>
            `• [${inv.invoiceNumber}] ${inv.vendor.name} → ${inv.customer.name} | ` +
            `${inv.total} ${inv.currency} | ID: ${inv.id}`
        )
        .join('\n')

      return textResult(`${invoices.length} resultado(s) para "${q}":\n\n${summary}`)
    }

    default:
      return textResult(`Herramienta desconocida: ${name}`)
  }
})

// ── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport()
await server.connect(transport)

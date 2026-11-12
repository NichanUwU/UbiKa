import { createClient } from '@supabase/supabase-js'
import type { ProductCategory } from '../types'

interface BusinessRow {
  id: string
  name: string
  category: ProductCategory
  address: string
  phone_whatsapp: string
  zone: string
  shelf_photos: string[]
  created_at: string
}

interface ProductRow {
  id: string
  name: string
  category: ProductCategory
  tags: string[]
  price: number | null
  business_id: string
  in_stock: boolean
  image_url: string
}

interface WhatsappAnalyticsRow {
  id: string
  product_id: string | null
  business_id: string
  type: 'direct_contact' | 'quote_list'
  created_at: string
}

interface MerchantSubmissionRow {
  id: string
  request_type: 'new_business' | 'update_business'
  name: string
  category: ProductCategory
  address: string
  phone_whatsapp: string
  zone: string
  shelf_photos: string[]
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

type TableDefinition<Row, Insert, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      businesses: TableDefinition<
        BusinessRow,
        Omit<BusinessRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
      >
      products: TableDefinition<
        ProductRow,
        Omit<ProductRow, 'id'> & { id?: string }
      >
      whatsapp_analytics: TableDefinition<
        WhatsappAnalyticsRow,
        Omit<WhatsappAnalyticsRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
      >
      merchant_submissions: TableDefinition<
        MerchantSubmissionRow,
        Omit<MerchantSubmissionRow, 'id' | 'created_at'> & { id?: string; created_at?: string }
      >
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

function isValidSupabaseConfig(url: string | undefined, key: string | undefined): boolean {
  if (!url || !key) return false

  try {
    const parsedUrl = new URL(url)
    const secureOrigin = parsedUrl.protocol === 'https:'
    const localOrigin = parsedUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsedUrl.hostname)
    return (secureOrigin || localOrigin) && key.length > 20
  } catch {
    return false
  }
}

export const isSupabaseConfigured = isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)

if ((supabaseUrl || supabaseAnonKey) && !isSupabaseConfigured) {
  console.warn('La configuración de Supabase no es válida; se usará el catálogo local.')
}

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null

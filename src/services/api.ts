import { businesses as mockBusinesses, products as mockProducts } from '../data/mockData'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Business, Product, ProductCategory } from '../types'

const LOCAL_SUBMISSIONS_KEY = 'donde-lo-venden-merchant-submissions-v1'
const LOCAL_ANALYTICS_KEY = 'donde-lo-venden-whatsapp-analytics-v1'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const validCategories: ProductCategory[] = ['papeleria', 'ferreteria', 'agroinsumos', 'servicios']

type WhatsappClickType = 'direct_contact' | 'quote_list'

export interface CatalogData {
  businesses: Business[]
  products: Product[]
  source: 'supabase' | 'local'
}

export interface MerchantSubmission {
  requestType: 'new_business' | 'update_business'
  name: string
  category: ProductCategory
  phoneWhatsapp: string
  address: string
  zone: string
  shelfPhotos: string[]
}

interface LocalMerchantSubmission extends MerchantSubmission {
  id: string
  createdAt: string
}

interface LocalAnalyticsEvent {
  businessId: string
  productId?: string
  type: WhatsappClickType
  createdAt: string
}

function asCategory(value: string): ProductCategory {
  if (!validCategories.includes(value as ProductCategory)) {
    throw new Error(`Categoría desconocida recibida desde Supabase: ${value}`)
  }
  return value as ProductCategory
}

function getLocalSubmissions(): LocalMerchantSubmission[] {
  try {
    const raw = localStorage.getItem(LOCAL_SUBMISSIONS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter((entry): entry is LocalMerchantSubmission => {
      if (!entry || typeof entry !== 'object') return false
      const submission = entry as Partial<LocalMerchantSubmission>
      return (
        typeof submission.id === 'string' &&
        (submission.requestType === 'new_business' || submission.requestType === 'update_business') &&
        typeof submission.name === 'string' &&
        validCategories.includes(submission.category as ProductCategory) &&
        typeof submission.phoneWhatsapp === 'string' &&
        typeof submission.address === 'string' &&
        typeof submission.zone === 'string' &&
        Array.isArray(submission.shelfPhotos) &&
        submission.shelfPhotos.every((photo) => typeof photo === 'string')
      )
    })
  } catch (error) {
    console.warn('No se pudieron leer los registros locales de comercios.', error)
    return []
  }
}

function getLocalCatalog(): CatalogData {
  return {
    businesses: mockBusinesses,
    products: mockProducts,
    source: 'local',
  }
}

export async function fetchCatalog(): Promise<CatalogData> {
  if (!supabase) return getLocalCatalog()

  try {
    const [businessResult, productResult] = await Promise.all([
      supabase.from('businesses').select('*').order('name'),
      supabase.from('products').select('*').order('name'),
    ])

    if (businessResult.error) throw businessResult.error
    if (productResult.error) throw productResult.error

    const loadedBusinesses: Business[] = businessResult.data.map((row) => ({
      id: row.id,
      name: row.name,
      category: asCategory(row.category),
      address: row.address,
      phoneWhatsapp: row.phone_whatsapp,
      zone: row.zone,
      shelfPhotos: row.shelf_photos ?? [],
      featured: false,
    }))
    const businessesById = new Map(loadedBusinesses.map((business) => [business.id, business]))
    const loadedProducts: Product[] = productResult.data.flatMap((row) => {
      const business = businessesById.get(row.business_id)
      if (!business) {
        console.warn(`Se omitió el producto "${row.name}" porque su negocio no está disponible.`)
        return []
      }

      return [{
        id: row.id,
        name: row.name,
        category: asCategory(row.category),
        tags: row.tags ?? [],
        price: row.price ?? undefined,
        businessId: business.id,
        businessName: business.name,
        businessWhatsapp: business.phoneWhatsapp,
        businessAddress: business.address,
        zone: business.zone,
        imageUrl: row.image_url,
        inStock: row.in_stock,
      }]
    })

    return {
      businesses: loadedBusinesses,
      products: loadedProducts,
      source: 'supabase',
    }
  } catch (error) {
    console.warn('No se pudo cargar el catálogo de Supabase; se usarán los datos locales.', error)
    return getLocalCatalog()
  }
}

function normalizeMexicanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const nationalNumber = digits.startsWith('521') && digits.length === 13
    ? digits.slice(3)
    : digits.startsWith('52') && digits.length === 12
      ? digits.slice(2)
      : digits

  if (!/^\d{10}$/.test(nationalNumber)) {
    throw new Error('El teléfono de WhatsApp debe contener un número mexicano de 10 dígitos.')
  }

  return `52${nationalNumber}`
}

function saveLocalSubmission(submission: MerchantSubmission): void {
  try {
    const current = getLocalSubmissions()
    current.push({
      ...submission,
      id: `local-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(current))
  } catch (error) {
    console.error('No se pudo guardar la solicitud del comercio en este dispositivo.', error)
    throw new Error('No fue posible guardar el registro. Revisa el espacio disponible en tu dispositivo.')
  }
}

export async function submitMerchant(
  submission: MerchantSubmission,
): Promise<'supabase' | 'local'> {
  const normalizedSubmission = {
    request_type: submission.requestType,
    name: submission.name.trim(),
    category: submission.category,
    address: submission.address.trim(),
    phone_whatsapp: normalizeMexicanPhone(submission.phoneWhatsapp),
    zone: submission.zone.trim(),
    shelf_photos: submission.shelfPhotos,
    status: 'pending' as const,
  }

  if (supabase) {
    try {
      const { error } = await supabase.from('merchant_submissions').insert(normalizedSubmission)
      if (error) throw error
      return 'supabase'
    } catch (error) {
      console.warn('No se pudo enviar el registro a Supabase; se guardará localmente.', error)
    }
  }

  saveLocalSubmission({
    ...submission,
    phoneWhatsapp: normalizedSubmission.phone_whatsapp,
  })
  return 'local'
}

function saveLocalAnalytics(event: LocalAnalyticsEvent): void {
  try {
    const raw = localStorage.getItem(LOCAL_ANALYTICS_KEY)
    const current: unknown = raw ? JSON.parse(raw) : []
    const events = Array.isArray(current) ? current : []
    events.push(event)
    localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(events.slice(-500)))
  } catch (error) {
    console.error('No se pudo registrar el clic de WhatsApp localmente.', error)
  }
}

export async function trackWhatsappClick(
  businessId: string,
  productId?: string,
  type: WhatsappClickType = 'direct_contact',
): Promise<void> {
  const event: LocalAnalyticsEvent = {
    businessId,
    productId,
    type,
    createdAt: new Date().toISOString(),
  }

  if (supabase && UUID_PATTERN.test(businessId) && (!productId || UUID_PATTERN.test(productId))) {
    try {
      const { error } = await supabase.from('whatsapp_analytics').insert({
        business_id: businessId,
        product_id: productId ?? null,
        type,
      })
      if (!error) return
      console.warn('No se pudo guardar la métrica de WhatsApp en Supabase.', error)
    } catch (error) {
      console.warn('Falló la conexión al guardar la métrica de WhatsApp.', error)
    }
  } else if (isSupabaseConfigured) {
    console.info('La métrica se guarda localmente porque el registro usa datos de demostración.')
  }

  saveLocalAnalytics(event)
}

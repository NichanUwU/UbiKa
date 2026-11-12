import type { Business, Product } from '../types'

const zone = 'Zona Centro'

export const businesses: Business[] = [
  {
    id: 'papeleria-arcoiris',
    name: 'Papelería Arcoíris',
    category: 'papeleria',
    address: 'Primera Avenida Sur, Centro',
    phoneWhatsapp: '529651234567',
    zone,
    shelfPhotos: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80'],
    featured: true,
  },
  {
    id: 'papeleria-central',
    name: 'Papelería La Central',
    category: 'papeleria',
    address: 'Segunda Avenida Norte, Centro',
    phoneWhatsapp: '529651234568',
    zone,
    shelfPhotos: ['https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80'],
    featured: true,
  },
  {
    id: 'papeleria-colibri',
    name: 'Papelería Colibrí',
    category: 'papeleria',
    address: 'Calle Central, Centro',
    phoneWhatsapp: '529651234569',
    zone,
    shelfPhotos: ['https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80'],
    featured: false,
  },
  {
    id: 'ferreteria-el-tornillo',
    name: 'Ferretería El Tornillo',
    category: 'ferreteria',
    address: 'Primera Avenida Norte, Centro',
    phoneWhatsapp: '529651234570',
    zone,
    shelfPhotos: ['https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=900&q=80'],
    featured: true,
  },
  {
    id: 'ferreteria-la-frailesca',
    name: 'Ferretería La Frailesca',
    category: 'ferreteria',
    address: 'Segunda Avenida Sur, Centro',
    phoneWhatsapp: '529651234571',
    zone,
    shelfPhotos: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80'],
    featured: false,
  },
  {
    id: 'agroinsumos-el-campesino',
    name: 'Agroinsumos El Campesino',
    category: 'agroinsumos',
    address: 'Avenida Central Oriente, Centro',
    phoneWhatsapp: '529651234572',
    zone,
    shelfPhotos: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80'],
    featured: true,
  },
  {
    id: 'agroservicios-la-cosecha',
    name: 'Agroservicios La Cosecha',
    category: 'agroinsumos',
    address: 'Calle Segunda Oriente, Centro',
    phoneWhatsapp: '529651234573',
    zone,
    shelfPhotos: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80'],
    featured: false,
  },
]

function product(
  id: string,
  name: string,
  category: Product['category'],
  tags: string[],
  businessId: string,
  imageUrl: string,
  price?: number,
  inStock = true,
): Product {
  const business = businesses.find((entry) => entry.id === businessId)
  if (!business) throw new Error(`No existe el negocio ${businessId}`)

  return {
    id,
    name,
    category,
    tags,
    price,
    businessId: business.id,
    businessName: business.name,
    businessWhatsapp: business.phoneWhatsapp,
    businessAddress: business.address,
    zone: business.zone,
    imageUrl,
    inStock,
  }
}

const stationeryImage = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80'
const hardwareImage = 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=900&q=80'
const agricultureImage = 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80'

export const products: Product[] = [
  product('cuaderno-profesional', 'Cuaderno profesional cuadro grande', 'papeleria', ['libreta', 'escuela', 'cuadro grande'], 'papeleria-arcoiris', stationeryImage, 48),
  product('libreta-rayada', 'Libreta tamaño italiana rayada', 'papeleria', ['cuaderno', 'papel', 'escuela'], 'papeleria-central', stationeryImage, 32),
  product('resistol-blanco', 'Resistol blanco escolar  adhesivo', 'papeleria', ['pega', 'pegamento', 'adhesivo'], 'papeleria-colibri', stationeryImage, 24),
  product('paquete-hojas-carta', 'Paquete de hojas blancas tamaño carta', 'papeleria', ['papel', 'hoja', 'copias'], 'papeleria-arcoiris', stationeryImage, 115),
  product('colores-madera', 'Caja de colores de madera con 12 piezas', 'papeleria', ['colores', 'escuela', 'dibujo'], 'papeleria-central', stationeryImage, 58),
  product('pluma-azul', 'Paquete de plumas azules', 'papeleria', ['bolígrafo', 'escritura', 'escuela'], 'papeleria-colibri', stationeryImage, 36),
  product('martillo-carpintero', 'Martillo de carpintero con mango antiderrapante', 'ferreteria', ['herramienta', 'clavo', 'construcción'], 'ferreteria-el-tornillo', hardwareImage, 165),
  product('machete-campo', 'Machete para trabajo de campo', 'ferreteria', ['herramienta', 'campo', 'jardín'], 'ferreteria-la-frailesca', hardwareImage, 210),
  product('tornillos-mixtos', 'Surtido de tornillos para madera', 'ferreteria', ['tornillo', 'fijación', 'herramienta'], 'ferreteria-el-tornillo', hardwareImage, 42),
  product('cinta-aislante', 'Cinta aislante de uso eléctrico', 'ferreteria', ['electricidad', 'reparación', 'herramienta'], 'ferreteria-la-frailesca', hardwareImage, 28),
  product('fertilizante-organico', 'Fertilizante orgánico para huerto', 'agroinsumos', ['abono', 'cultivo', 'plantas'], 'agroinsumos-el-campesino', agricultureImage, 95),
  product('semilla-maiz', 'Semilla de maíz para siembra', 'agroinsumos', ['agricultura', 'cultivo', 'maíz'], 'agroservicios-la-cosecha', agricultureImage, 180),
  product('abono-granulado', 'Abono granulado para cultivo', 'agroinsumos', ['fertilizante', 'campo', 'plantas'], 'agroinsumos-el-campesino', agricultureImage, 240),
  product('aspersora-manual', 'Aspersora manual para jardín y parcela', 'agroinsumos', ['fumigación', 'riego', 'campo'], 'agroservicios-la-cosecha', agricultureImage, 390, false),
]

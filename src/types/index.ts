export type Category = 'todas' | 'papeleria' | 'ferreteria' | 'agroinsumos' | 'servicios'

export type ProductCategory = Exclude<Category, 'todas'>

export interface Product {
  id: string
  name: string
  category: ProductCategory
  tags: string[]
  price?: number
  businessId: string
  businessName: string
  businessWhatsapp: string
  businessAddress: string
  zone: string
  imageUrl: string
  inStock: boolean
}

export interface Business {
  id: string
  name: string
  category: ProductCategory
  address: string
  phoneWhatsapp: string
  zone: string
  shelfPhotos: string[]
  featured: boolean
}

export interface QuoteItem {
  id: string
  productName: string
  quantity: number
  targetCategory: Category
}

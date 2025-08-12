import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { products } from '@/lib/products'
import CustomPageClient from './custom-page-client'

export const metadata = {
  title: 'Create Your Own | SlapRush',
  description: 'Customize products with your own logo, text, and artwork.'
}

export default function CustomPage() {
  const defaultBase = products.find(p => p.category === 'Apparel') || products[0]
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-900 dark:to-stone-800">
      <SiteHeader />
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4 space-y-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Create Your Own</h1>
            <p className="text-muted-foreground max-w-2xl">Choose a base product, then upload your logo and add custom text. Drag, resize, and reorder elements. We'll generate a high‑resolution print file when you add it to the cart.</p>
          </div>
          <CustomPageClient initialProductId={defaultBase.id} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

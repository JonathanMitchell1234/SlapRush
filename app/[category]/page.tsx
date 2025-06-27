import SiteHeader from "@/components/site-header"
import ProductCard from "@/components/product-card"
import SiteFooter from "@/components/site-footer"
import { products } from "@/lib/products"
import { Button } from "@/components/ui/button"

export default function CategoryPage({ params }: { params: { category: string } }) {
  const { category } = params
  const decodedCategory = decodeURIComponent(category)
  const capitalizedCategory =
    decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1)

  const filteredProducts = products.filter(
    (product) => product.category.toLowerCase() === decodedCategory.toLowerCase()
  )

  const allCategories = [
    ...new Set(products.map((product) => product.category)),
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-900 dark:to-stone-800">
      <SiteHeader />
      <main className="flex-grow">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200">
              {capitalizedCategory}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-gray-100 dark:bg-slate-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {allCategories.map((cat) => (
                <Button
                  key={cat}
                  variant="outline"
                  className="py-8 text-lg bg-white dark:bg-slate-700 hover:shadow-lg transition-shadow hover:border-purple-500 dark:hover:border-purple-400"
                  asChild
                >
                  <a href={`/${cat.toLowerCase()}`}>{cat}</a>
                </Button>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

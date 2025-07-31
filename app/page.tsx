import SiteHeader from "@/components/site-header"
import ProductCard from "@/components/product-card"
import SiteFooter from "@/components/site-footer"
import SprayPaintHero from "@/components/spray-paint-hero"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { products } from "@/lib/products"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-900 dark:to-stone-800">
      <SiteHeader />
      <main className="flex-grow">
        {/* Spray Paint Hero Section */}
        <SprayPaintHero />

        {/* Featured Products Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button
                variant="outline"
                size="lg"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
              >
                View All Products
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-16 bg-gray-100 dark:bg-slate-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-gray-200">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                "Stickers",
                "Apparel",
                "Mugs",
                "Wall Art",
                "Accessories",
                "Home Decor",
                "Stationery",
                "Phone Cases",
                "Bags",
                "Kids",
              ].map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  className="py-8 text-lg bg-white dark:bg-slate-700 hover:shadow-lg transition-shadow hover:border-purple-500 dark:hover:border-purple-400"
                >
                  {category}
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

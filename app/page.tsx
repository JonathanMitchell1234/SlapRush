import SiteHeader from "@/components/site-header"
import ProductCard from "@/components/product-card"
import SiteFooter from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { products } from "@/lib/products"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-900 dark:to-stone-800">
      <SiteHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white text-center overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating Design Elements */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-white/10 rounded-full animate-float-slow"></div>
            <div className="absolute top-20 right-20 w-8 h-8 bg-white/15 rounded-full animate-float-medium"></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-float-fast"></div>
            <div className="absolute bottom-10 right-10 w-20 h-20 bg-white/5 rounded-full animate-float-slow"></div>
            
            {/* Print Design Icons */}
            <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-white/20 rotate-45 animate-pulse-slow"></div>
            <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-white/25 rounded-full animate-bounce-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-white/15 transform rotate-12 animate-wiggle"></div>
            
            {/* Print-related SVG Icons */}
            <svg className="absolute top-1/3 left-1/6 w-10 h-10 text-white/15 animate-float-medium" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 3H6v4h12V3zm1 5H5c-1.1 0-2 .9-2 2v6h4v4h10v-4h4v-6c0-1.1-.9-2-2-2zm-1 5H6v-2h12v2z"/>
            </svg>
            
            <svg className="absolute bottom-1/3 right-1/6 w-8 h-8 text-white/12 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            
            <svg className="absolute top-1/2 right-1/4 w-6 h-6 text-white/20 animate-bounce-slow" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            
            {/* T-shirt and Mug Icons */}
            <svg className="absolute top-1/4 right-1/3 w-12 h-12 text-white/10 animate-wiggle" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 4h-2V2h-4v2H8L6 6v2h2v12h8V8h2V6l-2-2z"/>
            </svg>
            
            <svg className="absolute bottom-1/4 left-1/3 w-10 h-10 text-white/15 animate-float-fast" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3h14c1.1 0 2 .9 2 2v2h-2V5H5v2H3V5c0-1.1.9-2 2-2zm0 18c-1.1 0-2-.9-2-2v-8h2v8h14v-8h2v8c0 1.1-.9 2-2 2H5z"/>
            </svg>
            
            {/* Design Elements */}
            <div className="absolute top-16 right-16 w-3 h-3 bg-yellow-300/30 rounded-full animate-pulse-slow"></div>
            <div className="absolute bottom-16 left-16 w-2 h-2 bg-cyan-300/40 rounded-full animate-float-medium"></div>
            <div className="absolute top-32 left-32 w-4 h-4 bg-green-300/25 rounded-full animate-bounce-slow"></div>
            
            {/* Gradient Overlay Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent animate-shimmer"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg animate-fade-in-up">
              Unleash Your Creativity
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-sm animate-fade-in-up animation-delay-200">
              Discover unique designs or create your own custom print-on-demand products. High-quality prints, delivered
              to your door.
            </p>
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 font-semibold py-3 px-8 text-lg animate-fade-in-up animation-delay-400 hover:scale-105 transition-transform duration-200"
            >
              Shop Best Sellers <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

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

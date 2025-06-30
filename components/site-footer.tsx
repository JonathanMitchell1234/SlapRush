import Link from "next/link"
import Image from "next/image"
import { Sparkles, Github, Twitter, Instagram } from "lucide-react"

export default function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-100 dark:bg-slate-800 border-t dark:border-slate-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              {/* Custom Print-on-Demand Logo - matches header */}
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/SlapRush Logo.png"
                  alt="SlapRush Logo"
                  width={102}
                  height={102}
                  className="text-purple-600 dark:text-purple-400"
                />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200 leading-tight">SlapRush</span>
                  <span className="text-[9px] text-purple-600 dark:text-purple-400 font-medium -mt-1">PRINT ON DEMAND</span>
                </div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">Your one-stop shop for custom print-on-demand products.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/stickers" className="text-muted-foreground hover:text-primary">
                  Stickers
                </Link>
              </li>
              <li>
                <Link href="/apparel" className="text-muted-foreground hover:text-primary">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="/homeliving" className="text-muted-foreground hover:text-primary">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link href="/accessories" className="text-muted-foreground hover:text-primary">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-primary">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-primary">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Connect</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t dark:border-slate-700 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} SlapRush Print on Demand. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

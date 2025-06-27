import Link from "next/link"
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
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 32 32" 
                  className="text-purple-600 dark:text-purple-400"
                  fill="currentColor"
                >
                  {/* Printer base */}
                  <rect x="4" y="12" width="24" height="12" rx="2" className="fill-current opacity-80" />
                  {/* Paper tray */}
                  <rect x="6" y="20" width="20" height="2" className="fill-white dark:fill-gray-900" />
                  {/* Print head */}
                  <rect x="8" y="8" width="16" height="4" rx="1" className="fill-current" />
                  {/* Paper coming out */}
                  <rect x="10" y="4" width="12" height="6" rx="1" className="fill-current opacity-60" />
                  {/* Design elements on paper */}
                  <circle cx="14" cy="6" r="1" className="fill-pink-500" />
                  <circle cx="18" cy="7" r="1" className="fill-orange-400" />
                  <rect x="12" y="8" width="8" height="1" rx="0.5" className="fill-current opacity-40" />
                  {/* Control buttons */}
                  <circle cx="10" cy="16" r="1" className="fill-green-500" />
                  <circle cx="13" cy="16" r="1" className="fill-red-500" />
                  {/* Creative sparkle */}
                  <path d="M26 6 L28 8 L26 10 L24 8 Z" className="fill-yellow-400" />
                </svg>
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

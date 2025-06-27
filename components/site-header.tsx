"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, User, Menu, Sparkles, Palette, Home, Gift, Magnet, BrickWall } from "lucide-react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useCart } from "@/hooks/use-cart"

const navLinks = [
	{ href: "/stickers", label: "Stickers", icon: <Gift className="h-4 w-4 mr-2" /> },
	{ href: "/magnets", label: "Magnets", icon: <Magnet className="h-4 w-4 mr-2" /> },
	{ href: "/signs", label: "Signs", icon: <BrickWall className="h-4 w-4 mr-2" /> },
	{ href: "/accessories", label: "Accessories", icon: <Sparkles className="h-4 w-4 mr-2" /> },
	{ href: "/custom", label: "Create Your Own", icon: <Palette className="h-4 w-4 mr-2" /> },
]

export default function SiteHeader() {
	const { setTheme } = useTheme()
	const { itemCount } = useCart()

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2">
					<div className="flex items-center gap-2">
						<svg 
							width="32" 
							height="32" 
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
							<span className="text-xl font-bold text-gray-800 dark:text-gray-200 leading-tight">SlapRush</span>
							<span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium -mt-1">PRINT ON DEMAND</span>
						</div>
					</div>
				</Link>

				<nav className="hidden md:flex items-center gap-6 text-sm font-medium">
					{navLinks.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							className="text-muted-foreground transition-colors hover:text-primary flex items-center"
						>
							{link.icon}
							{link.label}
						</Link>
					))}
				</nav>

				<div className="flex items-center gap-3">
					<div className="hidden sm:block relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input type="search" placeholder="Search products..." className="pl-10 w-40 md:w-64" />
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
								<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
								<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
								<span className="sr-only">Toggle theme</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
						<User className="h-5 w-5" />
						<span className="sr-only">User Account</span>
					</Button>
					<Button asChild variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
						<Link href="/cart">
							<ShoppingCart className="h-5 w-5" />
							{itemCount > 0 && (
								<span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
									{itemCount}
								</span>
							)}
							<span className="sr-only">Shopping Cart</span>
						</Link>
					</Button>

					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-primary">
								<Menu className="h-6 w-6" />
								<span className="sr-only">Toggle navigation menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="right">
							<nav className="grid gap-6 text-lg font-medium mt-8">
								{navLinks.map((link) => (
									<Link
										key={link.label}
										href={link.href}
										className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
									>
										{link.icon}
										{link.label}
									</Link>
								))}
								<div className="relative mt-4">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input type="search" placeholder="Search products..." className="pl-10 w-full" />
								</div>
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	)
}

'use client'

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

type Product = {
  id: string
  name: string
  category: string
  imageUrl: string
  price: number
  rating?: number
  reviewsCount?: number
  colors?: string[]
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
    })
  }

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full dark:bg-slate-800">
      <CardHeader className="p-0">
        <Link href={`/product/${product.id}`} className="block">
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            width={400}
            height={300}
            className="object-cover w-full aspect-[4/3] transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider">
          {product.category}
        </span>
        <CardTitle className="mt-1 mb-2 text-lg">
          <Link
            href={`/product/${product.id}`}
            className="hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            {product.name}
          </Link>
        </CardTitle>
        {product.rating && product.reviewsCount && (
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span>{product.rating.toFixed(1)}</span>
            <span className="mx-1">·</span>
            <span>{product.reviewsCount} reviews</span>
          </div>
        )}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center space-x-1 my-3">
            {product.colors.slice(0, 5).map((color, index) => (
              <span
                key={index}
                className="block h-5 w-5 rounded-full border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-xs text-muted-foreground">+{product.colors.length - 5}</span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t dark:border-slate-700">
        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">${product.price.toFixed(2)}</p>
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

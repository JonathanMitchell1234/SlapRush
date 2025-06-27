export type Product = {
  id: string
  name: string
  category: string
  imageUrl: string
  price: number
  rating?: number
  reviewsCount?: number
  colors?: string[]
}

export const products: Product[] = [
  {
    id: "1",
    name: "Customizable Abstract Art Mug",
    category: "Mugs",
    imageUrl: "https://images.unsplash.com/photo-1605714196241-00bf7a8fe7bb?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 18.99,
    rating: 4.5,
    reviewsCount: 120,
    colors: ["#FFFFFF", "#000000", "#3B82F6"],
  },
  {
    id: "2",
    name: "Minimalist Graphic T-Shirt",
    category: "Apparel",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop&crop=center",
    price: 29.99,
    rating: 4.8,
    reviewsCount: 250,
    colors: ["#FFFFFF", "#1F2937", "#FECACA"],
  },
  {
    id: "3",
    name: "Personalized Pet Portrait Sticker",
    category: "Stickers",
    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop&crop=center",
    price: 5.99,
    rating: 4.9,
    reviewsCount: 500,
  },
  {
    id: "4",
    name: "Modern Geometric Phone Case",
    category: "Accessories",
    imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop&crop=center",
    price: 22.5,
    rating: 4.3,
    reviewsCount: 85,
    colors: ["#10B981", "#EC4899", "#F59E0B"],
  },
  {
    id: "5",
    name: "Inspirational Quote Canvas Print",
    category: "Wall Art",
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center",
    price: 45.0,
    rating: 4.7,
    reviewsCount: 150,
  },
  {
    id: "6",
    name: "Custom Logo Business Cards (Pack of 100)",
    category: "Stationery",
    imageUrl: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop&crop=center",
    price: 15.75,
    rating: 4.6,
    reviewsCount: 95,
  },
  {
    id: "7",
    name: "Patterned Throw Pillow",
    category: "Home Decor",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center",
    price: 32.0,
    rating: 4.4,
    reviewsCount: 70,
    colors: ["#8B5CF6", "#D946EF", "#FBBF24"],
  },
  {
    id: "8",
    name: "Eco-Friendly Tote Bag",
    category: "Bags",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&crop=center",
    price: 24.99,
    rating: 4.9,
    reviewsCount: 180,
    colors: ["#F3F4F6", "#6B7280"],
  },
]

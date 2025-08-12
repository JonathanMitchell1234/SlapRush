"use client"

import { useState } from 'react'
import Image from 'next/image'
import FabricProductCustomizer from '@/components/fabric-product-customizer'
import { products } from '@/lib/products'

export default function CustomPageClient({ initialProductId }: { initialProductId: string }) {
  const [selectedProductId, setSelectedProductId] = useState(initialProductId)

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Select a Product</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map(p => {
            const isActive = p.id === selectedProductId
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProductId(p.id)}
                className={`group relative border rounded-md overflow-hidden text-left transition shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-slate-800 ${isActive ? 'ring-2 ring-purple-600 border-purple-600' : 'border-gray-200 dark:border-slate-700'}`}
              >
                <Image src={p.imageUrl || '/placeholder.svg'} alt={p.name} width={300} height={220} className="object-cover w-full aspect-[4/3]" />
                <div className="p-2">
                  <p className="text-xs uppercase tracking-wide text-purple-600 dark:text-purple-400 font-semibold">{p.category}</p>
                  <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">${p.price.toFixed(2)}</p>
                </div>
                {isActive && (
                  <span className="absolute top-2 right-2 text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full">Selected</span>
                )}
              </button>
            )
          })}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Customize</h2>
        <FabricProductCustomizer baseProductId={selectedProductId} />
      </section>
    </div>
  )
}

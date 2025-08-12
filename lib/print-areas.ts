export type PrintArea = {
  id: string
  label: string
  width: number // production px
  height: number // production px
  bleed: number // px
  safe: number // px
  displayScale: number // scale used for on-screen canvas
}

export const productPrintAreas: Record<string, PrintArea[]> = {
  // Example: T-Shirt (product id 2)
  '2': [
    { id: 'front', label: 'Front', width: 3600, height: 4800, bleed: 120, safe: 100, displayScale: 0.18 },
    { id: 'back', label: 'Back', width: 3600, height: 4800, bleed: 120, safe: 100, displayScale: 0.18 }
  ],
  // Fallback generic
  '*': [ { id: 'default', label: 'Design Area', width: 3000, height: 3000, bleed: 100, safe: 80, displayScale: 0.2 }]
}

export function getPrintAreas(productId: string): PrintArea[] {
  return productPrintAreas[productId] || productPrintAreas['*']
}

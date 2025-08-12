"use client"

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/use-cart'
import { products } from '@/lib/products'

// A simple 2D canvas compositor for adding text + logo (image) onto a base product mockup
// This is intentionally lightweight (no external heavy editors). In future you could swap with Fabric.js / Konva.

interface LayerBase { id: string; x: number; y: number; width: number; height: number; }
interface TextLayer extends LayerBase { type: 'text'; text: string; fontSize: number; color: string; }
interface ImageLayer extends LayerBase { type: 'image'; src: string; }

export type CustomizationLayer = TextLayer | ImageLayer

interface ProductCustomizerCanvasProps {
  baseProductId: string
}

const CANVAS_W = 500
const CANVAS_H = 500

export default function ProductCustomizerCanvas({ baseProductId }: ProductCustomizerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [layers, setLayers] = useState<CustomizationLayer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null)
  const { addToCart } = useCart()

  const baseProduct = products.find(p => p.id === baseProductId) || products[0]

  // Load base product image
  const baseImgRef = useRef<HTMLImageElement | null>(null)
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = baseProduct.imageUrl
    img.onload = () => {
      baseImgRef.current = img
      draw()
    }
  }, [baseProduct.imageUrl])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.fillStyle = '#f8f8f8'
    ctx.fillRect(0,0,CANVAS_W,CANVAS_H)

    // draw base
    if (baseImgRef.current) {
      // cover fit
      const img = baseImgRef.current
      const scale = Math.min(CANVAS_W / img.width, CANVAS_H / img.height)
      const iw = img.width * scale
      const ih = img.height * scale
      const ix = (CANVAS_W - iw)/2
      const iy = (CANVAS_H - ih)/2
      ctx.drawImage(img, ix, iy, iw, ih)
    }

    // draw layers
    layers.forEach(layer => {
      if (layer.type === 'text') {
        ctx.font = `${layer.height}px Bebas Neue, Inter, sans-serif`
        ctx.fillStyle = (layer as TextLayer).color
        ctx.textBaseline = 'top'
        ctx.fillText((layer as TextLayer).text, layer.x, layer.y)
        if (layer.id === selectedId) {
          ctx.strokeStyle = '#9333ea'
          ctx.setLineDash([4,2])
          ctx.strokeRect(layer.x - 4, layer.y - 4, layer.width + 8, layer.height + 8)
          ctx.setLineDash([])
        }
      } else {
        const image = new Image()
        image.src = (layer as ImageLayer).src
        image.onload = () => {
          ctx.drawImage(image, layer.x, layer.y, layer.width, layer.height)
          if (layer.id === selectedId) {
            ctx.strokeStyle = '#9333ea'
            ctx.setLineDash([4,2])
            ctx.strokeRect(layer.x - 4, layer.y - 4, layer.width + 8, layer.height + 8)
            ctx.setLineDash([])
          }
        }
      }
    })
  }, [layers, selectedId])

  useEffect(() => { draw() }, [draw])

  // Hit detection
  const findLayerAt = (x: number, y: number) => {
    for (let i = layers.length -1; i >=0; i--) {
      const l = layers[i]
      if (x >= l.x && x <= l.x + l.width && y >= l.y && y <= l.y + l.height) return l
    }
    return null
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const hit = findLayerAt(x,y)
    if (hit) {
      setSelectedId(hit.id)
      dragOffset.current = { dx: x - hit.x, dy: y - hit.y }
    } else {
      setSelectedId(null)
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectedId || !dragOffset.current) return
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setLayers(prev => prev.map(l => l.id === selectedId ? { ...l, x: x - dragOffset.current!.dx, y: y - dragOffset.current!.dy } : l))
  }

  const handlePointerUp = () => { dragOffset.current = null }

  const addTextLayer = () => {
    const text = prompt('Enter text')?.trim()
    if (!text) return
    const fontSize = 32
    const width = text.length * (fontSize * 0.6)
    const height = fontSize
    setLayers(l => [...l, { id: crypto.randomUUID(), type: 'text', text, fontSize, color: '#111827', x: 100, y: 100, width, height }])
  }

  const onTextChange = (id: string, value: string) => {
    setLayers(prev => prev.map(l => l.id === id && l.type === 'text' ? { ...l, text: value, width: value.length * (l.height * 0.6) } : l))
  }

  const addImageLayer = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const maxDim = 200
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
        setLayers(l => [...l, { id: crypto.randomUUID(), type: 'image', src: reader.result as string, x: 150, y: 150, width: img.width * scale, height: img.height * scale }])
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const removeLayer = (id: string) => setLayers(l => l.filter(x => x.id !== id))

  const exportPreview = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Force a full redraw synchronous for images (simplistic approach)
    draw()
    const dataUrl = canvas.toDataURL('image/png')
    // Add to cart as a customized variant (unique id)
    addToCart({
      id: `custom-${baseProduct.id}-${Date.now()}`,
      name: `${baseProduct.name} (Custom)`,
      imageUrl: dataUrl,
      price: baseProduct.price + Math.min(10, layers.length * 2),
      customization: {
        baseProductId: baseProduct.id,
        layers: layers.map(l => l.type === 'text' ? { type: 'text', text: l.text, x: l.x, y: l.y, width: l.width, height: l.height } : { type: 'image', src: l.src, x: l.x, y: l.y, width: l.width, height: l.height }),
        previewDataUrl: dataUrl,
      }
    })
    alert('Added customized product to cart!')
  }

  return (
    <div className="grid md:grid-cols-[500px_1fr] gap-8 w-full">
      <div className="space-y-4">
        <div className="border rounded-md bg-white dark:bg-slate-800 p-2 shadow-sm">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="w-full h-auto cursor-move border rounded"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addTextLayer}>Add Text</Button>
          <label className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 border rounded-md cursor-pointer bg-purple-600 text-white hover:bg-purple-700">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) addImageLayer(f) }} />
            Upload Logo
          </label>
          <Button variant="default" className="bg-purple-600 hover:bg-purple-700" onClick={exportPreview} disabled={!layers.length}>Add to Cart</Button>
        </div>
      </div>
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Layers</h3>
        {layers.length === 0 && <p className="text-sm text-muted-foreground">Add text or upload a logo to begin customizing.</p>}
        <ul className="space-y-3">
          {layers.map(l => (
            <li key={l.id} className={`p-3 border rounded-md flex items-start gap-3 ${selectedId===l.id? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30':'bg-white dark:bg-slate-800'}`}> 
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <button className="text-left font-medium text-sm" onClick={() => setSelectedId(l.id)}>{l.type === 'text' ? 'Text Layer' : 'Image Layer'}</button>
                  <button onClick={() => removeLayer(l.id)} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
                {l.type === 'text' && (
                  <Input value={l.text} onChange={e => onTextChange(l.id, e.target.value)} placeholder="Text" />
                )}
                {l.type === 'image' && (
                  <div className="text-xs text-muted-foreground">Image: {(l as ImageLayer).src.slice(0,30)}...</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

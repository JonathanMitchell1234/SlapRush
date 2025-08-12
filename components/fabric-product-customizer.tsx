"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
// Fabric v6 beta typing workaround
import * as fabricNS from 'fabric'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fabric: any = fabricNS
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { products } from '@/lib/products'
import { getPrintAreas } from '@/lib/print-areas'
import { useCart } from '@/hooks/use-cart'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

interface FabricCustomizerProps {
  baseProductId: string
}

// Basic font options; could be externalized.
const FONT_FAMILIES = ['Inter', 'Bebas Neue', 'Arial', 'Times New Roman', 'Courier New']

export default function FabricProductCustomizer({ baseProductId }: FabricCustomizerProps) {
  const baseProduct = products.find(p => p.id === baseProductId) || products[0]
  const areas = getPrintAreas(baseProduct.id)
  const [activeArea, setActiveArea] = useState(areas[0].id)
  const [showProduct, setShowProduct] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fabricRef = useRef<any | null>(null)
  const { addToCart } = useCart()

  const [selectedObj, setSelectedObj] = useState<any | null>(null)
  const [textValue, setTextValue] = useState('')
  const [fontSize, setFontSize] = useState(56)
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0])
  const [strokeEnabled, setStrokeEnabled] = useState(false)
  const [strokeWidth, setStrokeWidth] = useState(2)

  const initFabric = useCallback(() => {
    if (!canvasRef.current) return
    const area = areas.find(a => a.id === activeArea)!
    const w = Math.round(area.width * area.displayScale)
    const h = Math.round(area.height * area.displayScale)

    // Dispose old
    if (fabricRef.current) {
      try { fabricRef.current.dispose() } catch (_) {}
      fabricRef.current = null
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: w,
      height: h,
      backgroundColor: 'rgba(0,0,0,0)'
    })
    canvas.preserveObjectStacking = true
    canvas.selection = true

    canvas.on('selection:created', (e: any) => setSelectedObj(e.selected?.[0] || null))
    canvas.on('selection:updated', (e: any) => setSelectedObj(e.selected?.[0] || null))
    canvas.on('selection:cleared', () => setSelectedObj(null))

    fabricRef.current = canvas
  }, [activeArea, areas])

  // Recreate canvas when area changes
  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.dispose()
      fabricRef.current = null
    }
    initFabric()
  }, [initFabric])

  const addText = () => {
    if (!fabricRef.current || !textValue.trim()) return
    const textbox = new fabric.Textbox(textValue.trim(), {
      left: 60,
      top: 60,
      fill: '#111827',
      fontSize,
      fontFamily,
      stroke: strokeEnabled ? '#ffffff' : undefined,
      strokeWidth: strokeEnabled ? strokeWidth : 0,
      fontWeight: 'bold',
      transparentCorners: false
    })
    fabricRef.current.add(textbox)
    fabricRef.current.setActiveObject(textbox)
    fabricRef.current.requestRenderAll()
  }

  const updateActiveText = () => {
    if (!fabricRef.current || !selectedObj || selectedObj.type !== 'textbox') return
    const textbox = selectedObj as any
    textbox.set({ text: textValue, fontSize, fontFamily, stroke: strokeEnabled ? '#ffffff' : undefined, strokeWidth: strokeEnabled ? strokeWidth : 0 })
    fabricRef.current.requestRenderAll()
  }

  useEffect(() => { updateActiveText() }, [textValue, fontSize, fontFamily, strokeEnabled, strokeWidth])

  // Background now handled by DOM layering (see JSX)

  const handleFile = (file: File) => {
    if (!file || !fabricRef.current) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // Use native image to ensure it loads before creating fabric.Image
      const el = new Image()
      el.onload = () => {
        if (!fabricRef.current) return
        const maxDim = 400 // on-screen constraint
        const scale = Math.min(maxDim / el.width, maxDim / el.height, 1)
        const imgInstance = new fabric.Image(el, {
          left: 80,
          top: 80,
          scaleX: scale,
          scaleY: scale,
          selectable: true,
          hasRotatingPoint: true,
        })
        fabricRef.current.add(imgInstance)
        fabricRef.current.setActiveObject(imgInstance)
        fabricRef.current.requestRenderAll()
      }
      el.onerror = () => {
        console.error('Failed to load uploaded image')
      }
      el.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const removeSelected = () => {
    if (fabricRef.current && selectedObj) {
      fabricRef.current.remove(selectedObj)
      fabricRef.current.discardActiveObject().requestRenderAll()
      setSelectedObj(null)
    }
  }

  const bringForward = () => { if (fabricRef.current && selectedObj) { fabricRef.current.bringForward(selectedObj); fabricRef.current.requestRenderAll() } }
  const sendBack = () => { if (fabricRef.current && selectedObj) { fabricRef.current.sendBackwards(selectedObj); fabricRef.current.requestRenderAll() } }

  const exportAndAddToCart = () => {
    if (!fabricRef.current) return
    const area = areas.find(a => a.id === activeArea)!

    // Serialize JSON for future reproduction
    const json = fabricRef.current.toJSON()

    // Production export at full resolution: clone to hidden canvas
    const scale = 1 / area.displayScale
    const originalJson = json as any

    // Create element off-DOM
    const exportCanvasEl = document.createElement('canvas')
    exportCanvasEl.width = area.width
    exportCanvasEl.height = area.height
  const exportFabric = new fabric.Canvas(exportCanvasEl, { width: area.width, height: area.height, backgroundColor: '#ffffff' })

    exportFabric.loadFromJSON(originalJson, () => {
      // Scale objects up
  exportFabric.getObjects().forEach((obj: any) => {
        obj.scaleX = (obj.scaleX || 1) * scale
        obj.scaleY = (obj.scaleY || 1) * scale
        obj.left = (obj.left || 0) * scale
        obj.top = (obj.top || 0) * scale
        obj.setCoords()
      })
      exportFabric.renderAll()
  const dataUrlFull = exportFabric.toDataURL({ format: 'png', quality: 1 })
  const preview = fabricRef.current!.toDataURL({ format: 'png', quality: 0.92 })

      addToCart({
        id: `custom-${baseProduct.id}-${activeArea}-${Date.now()}`,
        name: `${baseProduct.name} - ${area.label} (Custom)`,
        imageUrl: preview,
        price: baseProduct.price + 8, // flat customization surcharge
        customization: {
          baseProductId: baseProduct.id,
          layers: [], // Fabric JSON stored separately
          previewDataUrl: preview,
          fabricJson: json,
          printAreaId: area.id,
          productionPng: dataUrlFull,
        } as any
      })
      alert('Customized product added to cart!')
    })
  }

  // Sync selected object controls -> local state when selection changes
  useEffect(() => {
    if (selectedObj && selectedObj.type === 'textbox') {
      const tb = selectedObj as fabric.Textbox
      setTextValue(tb.text || '')
      setFontSize(tb.fontSize || 56)
      setFontFamily(tb.fontFamily || FONT_FAMILIES[0])
      setStrokeEnabled(!!tb.stroke && (tb.strokeWidth || 0) > 0)
      setStrokeWidth(tb.strokeWidth || 2)
    }
  }, [selectedObj])

  return (
    <div className="space-y-6">
      <Tabs value={activeArea} onValueChange={setActiveArea}>
        <TabsList>
          {areas.map(a => <TabsTrigger key={a.id} value={a.id}>{a.label}</TabsTrigger>)}
        </TabsList>
        {areas.map(a => (
          <TabsContent key={a.id} value={a.id} className="mt-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="border bg-white dark:bg-slate-800 p-4 rounded shadow-sm inline-block">
                <div className="relative" style={{ width: Math.round(a.width * a.displayScale), height: Math.round(a.height * a.displayScale) }}>
                  {showProduct && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={baseProduct.imageUrl}
                      alt={baseProduct.name}
                      crossOrigin="anonymous"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                      draggable={false}
                    />
                  )}
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
                  <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-500/40" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Design area: {a.width}×{a.height}px (scaled)</p>
              </div>
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600">Text</h3>
                  <div className="flex items-center gap-3 text-xs mb-1">
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={showProduct} onChange={e => setShowProduct(e.target.checked)} /> Show Product Preview
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Enter text" value={textValue} onChange={e => setTextValue(e.target.value)} />
                    <Button variant="outline" onClick={addText}>Add</Button>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="text-xs w-20">Font Size</label>
                    <Slider value={[fontSize]} min={12} max={160} step={2} onValueChange={v => setFontSize(v[0])} className="flex-1" />
                    <span className="text-xs w-10 text-right">{fontSize}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="text-xs w-20">Font</label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-4 items-center text-xs">
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={strokeEnabled} onChange={e => setStrokeEnabled(e.target.checked)} /> Stroke
                    </label>
                    {strokeEnabled && (
                      <div className="flex items-center gap-2">
                        <span>Width</span>
                        <Input type="number" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value)||0)} className="w-20" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-purple-600">Artwork</h3>
                  <label className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 border rounded-md cursor-pointer bg-purple-600 text-white hover:bg-purple-700 w-fit">
                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                    Upload Image
                  </label>
                  <div className="flex gap-2">
                    <Button variant="secondary" disabled={!selectedObj} onClick={bringForward}>Bring Forward</Button>
                    <Button variant="secondary" disabled={!selectedObj} onClick={sendBack}>Send Back</Button>
                    <Button variant="destructive" disabled={!selectedObj} onClick={removeSelected}>Delete</Button>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={exportAndAddToCart}>
                    Add Customized Product to Cart
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

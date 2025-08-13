"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as fabricNS from 'fabric'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fabric: any = fabricNS
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { products } from '@/lib/products'
import { getPrintAreas } from '@/lib/print-areas'
import { designTemplates, applyTemplate, type DesignTemplate } from '@/lib/design-templates'
import { useCart } from '@/hooks/use-cart'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ColorPicker from '@/components/ui/color-picker'
import { 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle, 
  Minus,
  Undo2, 
  Redo2,
  Palette,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Download,
  Upload
} from 'lucide-react'

interface EnhancedCustomizerProps {
  baseProductId: string
}

const FONT_FAMILIES = [
  'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 
  'Courier New', 'Verdana', 'Comic Sans MS', 'Impact', 'Trebuchet MS',
  'Bebas Neue', 'Montserrat', 'Roboto', 'Open Sans'
]

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF', '#808080', '#FFA500', '#800080', '#008080',
  '#F5F5DC', '#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C'
]

const IMAGE_FILTERS = [
  { name: 'None', value: null },
  { name: 'Grayscale', value: 'Grayscale' },
  { name: 'Sepia', value: 'Sepia' },
  { name: 'Invert', value: 'Invert' },
  { name: 'Blur', value: 'Blur' },
  { name: 'Sharpen', value: 'Convolute' },
  { name: 'Brightness', value: 'Brightness' },
]

export default function EnhancedFabricCustomizer({ baseProductId }: EnhancedCustomizerProps) {
  const baseProduct = products.find(p => p.id === baseProductId) || products[0]
  const areas = getPrintAreas(baseProduct.id)
  const [activeArea, setActiveArea] = useState(areas[0].id)
  const [showProduct, setShowProduct] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fabricRef = useRef<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToCart } = useCart()

  // State management
  const [selectedObj, setSelectedObj] = useState<any | null>(null)
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('templates')
  const [isLoadingState, setIsLoadingState] = useState(false)
  
  // Text controls
  const [textValue, setTextValue] = useState('')
  const [fontSize, setFontSize] = useState(56)
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0])
  const [textColor, setTextColor] = useState('#000000')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [textAlign, setTextAlign] = useState('left')
  const [strokeEnabled, setStrokeEnabled] = useState(false)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [strokeColor, setStrokeColor] = useState('#ffffff')
  
  // Shape controls
  const [fillColor, setFillColor] = useState('#3b82f6')
  const [shapeStrokeColor, setShapeStrokeColor] = useState('#000000')
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(2)
  
  // Object controls
  const [objectOpacity, setObjectOpacity] = useState(100)
  
  // Image controls
  const [imageFilter, setImageFilter] = useState('None')

  const saveState = useCallback(() => {
    if (!fabricRef.current || isLoadingState) return
    
    const state = JSON.stringify(fabricRef.current.toJSON())
    
    // Don't save if state hasn't changed
    if (undoStack.length > 0 && undoStack[undoStack.length - 1] === state) {
      return
    }
    
    setUndoStack(prev => {
      const newStack = [...prev.slice(-19), state] // Keep last 20 states
      return newStack
    })
    setRedoStack([]) // Clear redo stack when new action is performed
  }, [undoStack, isLoadingState])

  // Manual save function for user actions
  const manualSaveState = useCallback(() => {
    if (!fabricRef.current || isLoadingState) return
    
    setTimeout(() => {
      if (!fabricRef.current) return
      const state = JSON.stringify(fabricRef.current.toJSON())
      
      setUndoStack(prev => {
        // Don't save if state hasn't changed
        if (prev.length > 0 && prev[prev.length - 1] === state) {
          return prev
        }
        const newStack = [...prev.slice(-19), state]
        return newStack
      })
      setRedoStack([])
    }, 50) // Small delay to ensure state is stable
  }, [isLoadingState])

  // Debounced save state to avoid too many saves
  const debouncedSaveState = useCallback(() => {
    const timeoutId = setTimeout(() => {
      saveState()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [saveState])

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

    // Event listeners
    canvas.on('selection:created', (e: any) => {
      setSelectedObj(e.selected?.[0] || null)
    })
    canvas.on('selection:updated', (e: any) => {
      setSelectedObj(e.selected?.[0] || null)
    })
    canvas.on('selection:cleared', () => {
      setSelectedObj(null)
    })
    
    // Only save state when object is modified by user (moved, scaled, etc.)
    canvas.on('object:modified', () => {
      if (!isLoadingState) {
        manualSaveState()
      }
    })
    
    // Save initial state
    setTimeout(() => {
      if (fabricRef.current) {
        const initialState = JSON.stringify(fabricRef.current.toJSON())
        setUndoStack([initialState])
      }
    }, 100)

    fabricRef.current = canvas

    // Enable drag and drop
    const canvasEl = canvasRef.current
    canvasEl.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
      canvasEl.style.border = '3px dashed #3b82f6'
    })
    
    canvasEl.addEventListener('dragleave', (e) => {
      e.preventDefault()
      e.stopPropagation()
      canvasEl.style.border = 'none'
    })
    
    canvasEl.addEventListener('drop', (e) => {
      e.preventDefault()
      e.stopPropagation()
      canvasEl.style.border = 'none'
      
      const files = Array.from(e.dataTransfer?.files || [])
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          handleFile(file)
        }
      })
    })

  }, [activeArea, areas, isLoadingState, manualSaveState])

  // Recreate canvas when area changes
  useEffect(() => {
    // Cleanup function
    return () => {
      if (fabricRef.current) {
        try {
          fabricRef.current.dispose()
        } catch (error) {
          console.warn('Error disposing fabric canvas:', error)
        }
        fabricRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (fabricRef.current) {
      try {
        fabricRef.current.dispose()
      } catch (error) {
        console.warn('Error disposing fabric canvas:', error)
      }
      fabricRef.current = null
    }
    initFabric()
  }, [initFabric])

  // Undo/Redo functions
  const undo = () => {
    if (!fabricRef.current || undoStack.length <= 1) return
    
    setIsLoadingState(true)
    const currentState = JSON.stringify(fabricRef.current.toJSON())
    const previousState = undoStack[undoStack.length - 2] // Get the state before current
    
    setRedoStack(prev => [currentState, ...prev])
    setUndoStack(prev => prev.slice(0, -1))
    
    fabricRef.current.loadFromJSON(previousState, () => {
      fabricRef.current.renderAll()
      setIsLoadingState(false)
    })
  }

  const redo = () => {
    if (!fabricRef.current || redoStack.length === 0) return
    
    setIsLoadingState(true)
    const currentState = JSON.stringify(fabricRef.current.toJSON())
    const nextState = redoStack[0]
    
    setUndoStack(prev => [...prev, currentState])
    setRedoStack(prev => prev.slice(1))
    
    fabricRef.current.loadFromJSON(nextState, () => {
      fabricRef.current.renderAll()
      setIsLoadingState(false)
    })
  }

  // Text functions
  const addText = () => {
    if (!fabricRef.current || !textValue.trim()) return
    
    // Save state before adding
    saveState()
    
    const textbox = new fabric.Textbox(textValue.trim(), {
      left: 60,
      top: 60,
      fill: textColor,
      fontSize,
      fontFamily,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textAlign,
      stroke: strokeEnabled ? strokeColor : undefined,
      strokeWidth: strokeEnabled ? strokeWidth : 0,
      transparentCorners: false
    })
    fabricRef.current.add(textbox)
    fabricRef.current.setActiveObject(textbox)
    fabricRef.current.requestRenderAll()
    
    // Save state manually after adding text
    manualSaveState()
    
    // Clear the text input after adding
    setTextValue('')
  }

  const updateActiveText = useCallback(() => {
    if (!fabricRef.current || !selectedObj || selectedObj.type !== 'textbox') return
    
    const textbox = selectedObj as any
    textbox.set({ 
      text: textValue, 
      fontSize, 
      fontFamily,
      fill: textColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      textAlign,
      stroke: strokeEnabled ? strokeColor : undefined, 
      strokeWidth: strokeEnabled ? strokeWidth : 0 
    })
    fabricRef.current.requestRenderAll()
  }, [selectedObj, textValue, fontSize, fontFamily, textColor, isBold, isItalic, textAlign, strokeEnabled, strokeColor, strokeWidth])

  // Shape functions
  const addRectangle = () => {
    if (!fabricRef.current) return
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 120,
      height: 80,
      fill: fillColor,
      stroke: shapeStrokeColor,
      strokeWidth: shapeStrokeWidth,
    })
    fabricRef.current.add(rect)
    fabricRef.current.setActiveObject(rect)
    fabricRef.current.requestRenderAll()
    manualSaveState()
  }

  const addCircle = () => {
    if (!fabricRef.current) return
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: fillColor,
      stroke: shapeStrokeColor,
      strokeWidth: shapeStrokeWidth,
    })
    fabricRef.current.add(circle)
    fabricRef.current.setActiveObject(circle)
    fabricRef.current.requestRenderAll()
    manualSaveState()
  }

  const addLine = () => {
    if (!fabricRef.current) return
    const line = new fabric.Line([50, 50, 200, 50], {
      stroke: shapeStrokeColor,
      strokeWidth: shapeStrokeWidth,
    })
    fabricRef.current.add(line)
    fabricRef.current.setActiveObject(line)
    fabricRef.current.requestRenderAll()
    manualSaveState()
  }

  // Image functions
  const handleFile = (file: File) => {
    if (!file || !fabricRef.current) return
    
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      const el = new Image()
      el.onload = () => {
        if (!fabricRef.current) return
        const maxDim = 400
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
        manualSaveState()
      }
      el.onerror = () => {
        console.error('Failed to load uploaded image')
      }
      el.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const applyImageFilter = (filterName: string) => {
    if (!selectedObj || selectedObj.type !== 'image') return
    
    selectedObj.filters = []
    
    if (filterName !== 'None') {
      let filter
      switch (filterName) {
        case 'Grayscale':
          filter = new fabric.Image.filters.Grayscale()
          break
        case 'Sepia':
          filter = new fabric.Image.filters.Sepia()
          break
        case 'Invert':
          filter = new fabric.Image.filters.Invert()
          break
        case 'Blur':
          filter = new fabric.Image.filters.Blur({ blur: 0.1 })
          break
        case 'Brightness':
          filter = new fabric.Image.filters.Brightness({ brightness: 0.2 })
          break
      }
      
      if (filter) {
        selectedObj.filters.push(filter)
      }
    }
    
    selectedObj.applyFilters()
    fabricRef.current?.requestRenderAll()
  }

  // Object manipulation functions
  const updateObjectOpacity = useCallback((opacity: number) => {
    if (!selectedObj) return
    selectedObj.set('opacity', opacity / 100)
    fabricRef.current?.requestRenderAll()
  }, [selectedObj])

  const removeSelected = () => {
    if (fabricRef.current && selectedObj) {
      fabricRef.current.remove(selectedObj)
      fabricRef.current.discardActiveObject().requestRenderAll()
      setSelectedObj(null)
      manualSaveState()
    }
  }

  const duplicateSelected = () => {
    if (!fabricRef.current || !selectedObj) return
    
    selectedObj.clone((cloned: any) => {
      cloned.set({
        left: selectedObj.left + 10,
        top: selectedObj.top + 10,
      })
      fabricRef.current.add(cloned)
      fabricRef.current.setActiveObject(cloned)
      fabricRef.current.requestRenderAll()
      manualSaveState()
    })
  }

  const bringForward = () => { 
    if (fabricRef.current && selectedObj) { 
      fabricRef.current.bringForward(selectedObj)
      fabricRef.current.requestRenderAll() 
    } 
  }
  
  const sendBack = () => { 
    if (fabricRef.current && selectedObj) { 
      fabricRef.current.sendBackwards(selectedObj)
      fabricRef.current.requestRenderAll() 
    } 
  }

  const bringToFront = () => { 
    if (fabricRef.current && selectedObj) { 
      fabricRef.current.bringToFront(selectedObj)
      fabricRef.current.requestRenderAll() 
    } 
  }
  
  const sendToBack = () => { 
    if (fabricRef.current && selectedObj) { 
      fabricRef.current.sendToBack(selectedObj)
      fabricRef.current.requestRenderAll() 
    } 
  }

  // Template functions
  const applyDesignTemplate = (template: DesignTemplate) => {
    if (!fabricRef.current) return
    setIsLoadingState(true)
    applyTemplate(fabricRef.current, template)
    setTimeout(() => setIsLoadingState(false), 100) // Small delay to ensure template is applied
  }

  // Export function
  const exportAndAddToCart = () => {
    if (!fabricRef.current) return
    const area = areas.find(a => a.id === activeArea)!

    const json = fabricRef.current.toJSON()
    const scale = 1 / area.displayScale
    const originalJson = json as any

    const exportCanvasEl = document.createElement('canvas')
    exportCanvasEl.width = area.width
    exportCanvasEl.height = area.height
    const exportFabric = new fabric.Canvas(exportCanvasEl, { 
      width: area.width, 
      height: area.height, 
      backgroundColor: '#ffffff' 
    })

    exportFabric.loadFromJSON(originalJson, () => {
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
        price: baseProduct.price + 12,
        customization: {
          baseProductId: baseProduct.id,
          layers: [],
          previewDataUrl: preview,
          fabricJson: json,
          printAreaId: area.id,
          productionPng: dataUrlFull,
        } as any
      })
      alert('Customized product added to cart!')
    })
  }

  // Update controls when object is selected
  useEffect(() => {
    if (selectedObj) {
      setObjectOpacity(Math.round((selectedObj.opacity || 1) * 100))
      
      if (selectedObj.type === 'textbox') {
        const tb = selectedObj as fabric.Textbox
        setTextValue(tb.text || '')
        setFontSize(tb.fontSize || 56)
        setFontFamily(tb.fontFamily || FONT_FAMILIES[0])
        setTextColor(typeof tb.fill === 'string' ? tb.fill : '#000000')
        setIsBold(tb.fontWeight === 'bold')
        setIsItalic(tb.fontStyle === 'italic')
        setTextAlign(tb.textAlign || 'left')
        setStrokeEnabled(!!tb.stroke && (tb.strokeWidth || 0) > 0)
        setStrokeWidth(tb.strokeWidth || 2)
        setStrokeColor(typeof tb.stroke === 'string' ? tb.stroke : '#ffffff')
      }
    }
  }, [selectedObj])

  // Update object opacity when slider changes
  useEffect(() => { 
    updateObjectOpacity(objectOpacity) 
  }, [objectOpacity, updateObjectOpacity])

  // Update text properties when they change (but only for selected textbox)
  useEffect(() => {
    // Only update if we have a selected textbox and we're not loading state
    if (selectedObj && selectedObj.type === 'textbox' && !isLoadingState) {
      updateActiveText()
    }
  }, [textValue, fontSize, fontFamily, textColor, isBold, isItalic, textAlign, strokeEnabled, strokeWidth, strokeColor]) // Removed selectedObj and updateActiveText from deps

  return (
    <div className="space-y-6">
      <Tabs value={activeArea} onValueChange={setActiveArea}>
        <TabsList>
          {areas.map(a => <TabsTrigger key={a.id} value={a.id}>{a.label}</TabsTrigger>)}
        </TabsList>
        
        {areas.map(a => (
          <TabsContent key={a.id} value={a.id} className="mt-4">
            <div className="flex flex-col xl:flex-row gap-8">
              {/* Canvas Area */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showProduct} 
                        onChange={e => setShowProduct(e.target.checked)} 
                      />
                      Show Product Preview
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={undo}
                      disabled={undoStack.length === 0}
                    >
                      <Undo2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={redo}
                      disabled={redoStack.length === 0}
                    >
                      <Redo2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="border bg-white dark:bg-slate-800 p-4 rounded shadow-sm inline-block">
                  <div 
                    className="relative" 
                    style={{ 
                      width: Math.round(a.width * a.displayScale), 
                      height: Math.round(a.height * a.displayScale) 
                    }}
                  >
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
                    <canvas 
                      ref={canvasRef} 
                      className="absolute inset-0 w-full h-full" 
                    />
                    <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-purple-500/40" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Design area: {a.width}×{a.height}px | Drop images here
                  </p>
                </div>
              </div>

              {/* Controls Panel */}
              <div className="w-full xl:w-80 space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="templates" className="p-2">
                      <Sparkles className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="text" className="p-2">
                      <Type className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="shapes" className="p-2">
                      <Square className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="images" className="p-2">
                      <ImageIcon className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="object" className="p-2">
                      <Palette className="w-4 h-4" />
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Templates Tab */}
                  <TabsContent value="templates" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Design Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          {designTemplates.map(template => (
                            <button
                              key={template.id}
                              onClick={() => applyDesignTemplate(template)}
                              className="p-3 border rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
                            >
                              <div className="text-2xl mb-2">{template.thumbnail}</div>
                              <div className="text-sm font-medium">{template.name}</div>
                              <div className="text-xs text-muted-foreground">{template.description}</div>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {template.category}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Text Tab */}
                  <TabsContent value="text" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Text Controls
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Enter text" 
                            value={textValue} 
                            onChange={e => setTextValue(e.target.value)} 
                          />
                          <Button onClick={addText}>Add</Button>
                        </div>
                        
                        <div className="flex gap-2 items-center">
                          <Button 
                            variant={isBold ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setIsBold(!isBold)}
                          >
                            <Bold className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant={isItalic ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setIsItalic(!isItalic)}
                          >
                            <Italic className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant={textAlign === 'left' ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setTextAlign('left')}
                          >
                            <AlignLeft className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant={textAlign === 'center' ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setTextAlign('center')}
                          >
                            <AlignCenter className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant={textAlign === 'right' ? "default" : "outline"} 
                            size="sm"
                            onClick={() => setTextAlign('right')}
                          >
                            <AlignRight className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex gap-2 items-center">
                            <label className="text-xs w-20">Font Size</label>
                            <Slider 
                              value={[fontSize]} 
                              min={12} 
                              max={200} 
                              step={2} 
                              onValueChange={v => setFontSize(v[0])} 
                              className="flex-1" 
                            />
                            <span className="text-xs w-10 text-right">{fontSize}</span>
                          </div>
                          
                          <div className="flex gap-2 items-center">
                            <label className="text-xs w-20">Font</label>
                            <Select value={fontFamily} onValueChange={setFontFamily}>
                              <SelectTrigger className="flex-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FONT_FAMILIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <ColorPicker 
                          color={textColor} 
                          onChange={setTextColor} 
                          label="Text Color"
                          presetColors={PRESET_COLORS}
                        />
                        
                        <div className="space-y-3">
                          <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
                            <input 
                              type="checkbox" 
                              checked={strokeEnabled} 
                              onChange={e => setStrokeEnabled(e.target.checked)} 
                            />
                            Text Outline
                          </label>
                          
                          {strokeEnabled && (
                            <div className="space-y-3 ml-6">
                              <div className="flex gap-2 items-center">
                                <label className="text-xs w-20">Width</label>
                                <Input 
                                  type="number" 
                                  value={strokeWidth} 
                                  onChange={e => setStrokeWidth(Number(e.target.value) || 0)} 
                                  className="w-20" 
                                  min="1" 
                                  max="20"
                                />
                              </div>
                              <ColorPicker 
                                color={strokeColor} 
                                onChange={setStrokeColor} 
                                label="Outline Color"
                                presetColors={PRESET_COLORS}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Shapes Tab */}
                  <TabsContent value="shapes" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Square className="w-4 h-4" />
                          Shape Tools
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          <Button onClick={addRectangle} className="flex flex-col gap-1 h-auto py-3">
                            <Square className="w-5 h-5" />
                            <span className="text-xs">Rectangle</span>
                          </Button>
                          <Button onClick={addCircle} className="flex flex-col gap-1 h-auto py-3">
                            <Circle className="w-5 h-5" />
                            <span className="text-xs">Circle</span>
                          </Button>
                          <Button onClick={addLine} className="flex flex-col gap-1 h-auto py-3">
                            <Minus className="w-5 h-5" />
                            <span className="text-xs">Line</span>
                          </Button>
                        </div>
                        
                        <ColorPicker 
                          color={fillColor} 
                          onChange={setFillColor} 
                          label="Fill Color"
                          presetColors={PRESET_COLORS}
                        />
                        
                        <ColorPicker 
                          color={shapeStrokeColor} 
                          onChange={setShapeStrokeColor} 
                          label="Stroke Color"
                          presetColors={PRESET_COLORS}
                        />
                        
                        <div className="flex gap-2 items-center">
                          <label className="text-xs w-20">Stroke Width</label>
                          <Slider 
                            value={[shapeStrokeWidth]} 
                            min={0} 
                            max={20} 
                            step={1} 
                            onValueChange={v => setShapeStrokeWidth(v[0])} 
                            className="flex-1" 
                          />
                          <span className="text-xs w-10 text-right">{shapeStrokeWidth}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Images Tab */}
                  <TabsContent value="images" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          Image Tools
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <label className="inline-flex items-center gap-2 text-sm font-medium px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 transition-colors">
                            <ImageIcon className="w-5 h-5" />
                            Upload or Drop Image
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} 
                            />
                          </label>
                          
                          {selectedObj && selectedObj.type === 'image' && (
                            <div className="space-y-3">
                              <div className="flex gap-2 items-center">
                                <label className="text-xs w-20">Filter</label>
                                <Select value={imageFilter} onValueChange={setImageFilter}>
                                  <SelectTrigger className="flex-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {IMAGE_FILTERS.map(filter => (
                                      <SelectItem key={filter.name} value={filter.name}>
                                        {filter.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button 
                                  size="sm" 
                                  onClick={() => applyImageFilter(imageFilter)}
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Object Tab */}
                  <TabsContent value="object" className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Palette className="w-4 h-4" />
                          Object Properties
                          {selectedObj && (
                            <Badge variant="secondary" className="ml-2">
                              {selectedObj.type}
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedObj ? (
                          <>
                            <div className="flex gap-2 items-center">
                              <label className="text-xs w-20">Opacity</label>
                              <Slider 
                                value={[objectOpacity]} 
                                min={0} 
                                max={100} 
                                step={5} 
                                onValueChange={v => setObjectOpacity(v[0])} 
                                className="flex-1" 
                              />
                              <span className="text-xs w-12 text-right">{objectOpacity}%</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Button variant="outline" size="sm" onClick={duplicateSelected}>
                                Duplicate
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {
                                if (selectedObj) {
                                  selectedObj.set({
                                    left: selectedObj.left,
                                    top: selectedObj.top,
                                    angle: 0
                                  })
                                  fabricRef.current?.requestRenderAll()
                                }
                              }}>
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={bringToFront}>
                                To Front
                              </Button>
                              <Button variant="outline" size="sm" onClick={sendToBack}>
                                To Back
                              </Button>
                              <Button variant="outline" size="sm" onClick={bringForward}>
                                Forward
                              </Button>
                              <Button variant="outline" size="sm" onClick={sendBack}>
                                Back
                              </Button>
                            </div>
                            
                            <Button 
                              variant="destructive" 
                              className="w-full" 
                              onClick={removeSelected}
                            >
                              Delete Selected
                            </Button>
                          </>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Select an object to edit its properties</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                <div className="pt-4 border-t">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                    size="lg"
                    onClick={exportAndAddToCart}
                  >
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

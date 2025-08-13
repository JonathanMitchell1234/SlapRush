import React from 'react'
import { Input } from '@/components/ui/input'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label: string
  presetColors?: string[]
}

const DEFAULT_PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF', '#808080', '#FFA500', '#800080', '#008080',
  '#F5F5DC', '#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C',
  '#DC143C', '#FF6347', '#FF1493', '#8B008B', '#4B0082', '#191970',
  '#006400', '#228B22', '#32CD32', '#7FFF00', '#ADFF2F', '#FFD700'
]

export default function ColorPicker({ 
  color, 
  onChange, 
  label, 
  presetColors = DEFAULT_PRESET_COLORS 
}: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex gap-2 items-center">
        <div className="relative">
          <input 
            type="color" 
            value={color} 
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded border-2 border-muted cursor-pointer hover:border-muted-foreground transition-colors"
            style={{ 
              backgroundColor: color,
              backgroundImage: 'none'
            }}
          />
          <div 
            className="absolute inset-1 rounded pointer-events-none"
            style={{ backgroundColor: color }}
          />
        </div>
        <Input 
          value={color.toUpperCase()} 
          onChange={(e) => {
            const value = e.target.value
            if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
              onChange(value)
            }
          }}
          className="text-xs font-mono w-24"
          placeholder="#000000"
          maxLength={7}
        />
      </div>
      
      {/* Preset Colors Grid */}
      <div className="grid grid-cols-6 gap-1.5 mt-3">
        {presetColors.map((presetColor, index) => (
          <button
            key={index}
            onClick={() => onChange(presetColor)}
            className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
              color.toUpperCase() === presetColor.toUpperCase() 
                ? 'border-purple-500 ring-2 ring-purple-500 ring-offset-2' 
                : 'border-muted hover:border-muted-foreground'
            }`}
            style={{ backgroundColor: presetColor }}
            title={presetColor}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}

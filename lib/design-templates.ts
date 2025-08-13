import * as fabricNS from 'fabric'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fabric: any = fabricNS

export interface DesignTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  fabricJson: any
}

export const designTemplates: DesignTemplate[] = [
  {
    id: 'minimal-text',
    name: 'Minimal Text',
    description: 'Clean, simple text design',
    category: 'Text',
    thumbnail: '📝',
    fabricJson: {
      objects: [
        {
          type: 'textbox',
          left: 150,
          top: 200,
          width: 200,
          height: 50,
          fill: '#000000',
          fontSize: 48,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          text: 'YOUR TEXT',
          textAlign: 'center'
        }
      ]
    }
  },
  {
    id: 'badge-design',
    name: 'Badge Design',
    description: 'Circle badge with text',
    category: 'Badges',
    thumbnail: '🏆',
    fabricJson: {
      objects: [
        {
          type: 'circle',
          left: 150,
          top: 150,
          radius: 80,
          fill: '#3b82f6',
          stroke: '#1e40af',
          strokeWidth: 4
        },
        {
          type: 'textbox',
          left: 120,
          top: 230,
          width: 140,
          height: 30,
          fill: '#ffffff',
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          text: 'BADGE',
          textAlign: 'center'
        }
      ]
    }
  },
  {
    id: 'geometric-pattern',
    name: 'Geometric Pattern',
    description: 'Modern geometric shapes',
    category: 'Patterns',
    thumbnail: '🔷',
    fabricJson: {
      objects: [
        {
          type: 'rect',
          left: 100,
          top: 100,
          width: 80,
          height: 80,
          fill: '#ef4444',
          angle: 45
        },
        {
          type: 'circle',
          left: 200,
          top: 120,
          radius: 40,
          fill: '#10b981'
        },
        {
          type: 'rect',
          left: 150,
          top: 200,
          width: 100,
          height: 20,
          fill: '#f59e0b'
        }
      ]
    }
  },
  {
    id: 'vintage-label',
    name: 'Vintage Label',
    description: 'Retro-style label design',
    category: 'Labels',
    thumbnail: '🏷️',
    fabricJson: {
      objects: [
        {
          type: 'rect',
          left: 80,
          top: 120,
          width: 240,
          height: 160,
          fill: 'transparent',
          stroke: '#8b5a2b',
          strokeWidth: 6,
          rx: 20,
          ry: 20
        },
        {
          type: 'textbox',
          left: 120,
          top: 150,
          width: 160,
          height: 40,
          fill: '#8b5a2b',
          fontSize: 28,
          fontFamily: 'Georgia',
          fontWeight: 'bold',
          text: 'VINTAGE',
          textAlign: 'center'
        },
        {
          type: 'textbox',
          left: 120,
          top: 200,
          width: 160,
          height: 30,
          fill: '#8b5a2b',
          fontSize: 18,
          fontFamily: 'Georgia',
          text: 'EST. 2024',
          textAlign: 'center'
        }
      ]
    }
  },
  {
    id: 'modern-quote',
    name: 'Modern Quote',
    description: 'Inspirational quote layout',
    category: 'Quotes',
    thumbnail: '💭',
    fabricJson: {
      objects: [
        {
          type: 'rect',
          left: 50,
          top: 180,
          width: 300,
          height: 4,
          fill: '#6366f1'
        },
        {
          type: 'textbox',
          left: 80,
          top: 120,
          width: 240,
          height: 50,
          fill: '#1f2937',
          fontSize: 24,
          fontFamily: 'Inter',
          fontStyle: 'italic',
          text: '"Dream Big"',
          textAlign: 'center'
        },
        {
          type: 'textbox',
          left: 80,
          top: 200,
          width: 240,
          height: 30,
          fill: '#6b7280',
          fontSize: 16,
          fontFamily: 'Inter',
          text: '- Anonymous',
          textAlign: 'right'
        }
      ]
    }
  },
  {
    id: 'logo-placeholder',
    name: 'Logo Layout',
    description: 'Template for logo + text',
    category: 'Branding',
    thumbnail: '🎯',
    fabricJson: {
      objects: [
        {
          type: 'circle',
          left: 150,
          top: 100,
          radius: 50,
          fill: 'transparent',
          stroke: '#9ca3af',
          strokeWidth: 2,
          strokeDashArray: [5, 5]
        },
        {
          type: 'textbox',
          left: 130,
          top: 170,
          width: 140,
          height: 40,
          fill: '#374151',
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          text: 'BRAND',
          textAlign: 'center'
        },
        {
          type: 'textbox',
          left: 130,
          top: 220,
          width: 140,
          height: 25,
          fill: '#6b7280',
          fontSize: 14,
          fontFamily: 'Inter',
          text: 'Your tagline here',
          textAlign: 'center'
        }
      ]
    }
  }
]

export function getTemplatesByCategory(): Record<string, DesignTemplate[]> {
  return designTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, DesignTemplate[]>)
}

export function applyTemplate(canvas: any, template: DesignTemplate) {
  if (!canvas || !template.fabricJson) return
  
  canvas.loadFromJSON(template.fabricJson, () => {
    canvas.renderAll()
  })
}

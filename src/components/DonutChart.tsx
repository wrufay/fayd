import type { ChartDataItem } from '../types'

interface DonutChartProps {
  data: ChartDataItem[]
  size?: number
  strokeWidth?: number
}

// Convert hex to HSL
const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { h: 0, s: 0, l: 50 }

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

// Convert HSL to hex
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Generate shade variations for items with same color
const generateShades = (items: ChartDataItem[]): Map<string, string> => {
  const colorGroups: Map<string, string[]> = new Map()
  const shadeMap: Map<string, string> = new Map()

  // Group items by color
  items.forEach(item => {
    const key = item.id || item.color
    const existing = colorGroups.get(item.color) || []
    existing.push(key)
    colorGroups.set(item.color, existing)
  })

  // Assign shades
  colorGroups.forEach((itemIds, baseColor) => {
    const hsl = hexToHsl(baseColor)
    const count = itemIds.length

    itemIds.forEach((id, index) => {
      if (count === 1) {
        shadeMap.set(id, baseColor)
      } else {
        // Create variations: spread lightness from -15 to +15 around base
        const lightnessOffset = ((index / (count - 1)) - 0.5) * 30
        const newLightness = Math.max(20, Math.min(80, hsl.l + lightnessOffset))
        shadeMap.set(id, hslToHex(hsl.h, hsl.s, newLightness))
      }
    })
  })

  return shadeMap
}

const DonutChart = ({ data, size = 120, strokeWidth = 20 }: DonutChartProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Generate shade variations for same-colored items
  const shadeMap = generateShades(data)

  // Calculate total and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) {
    // Empty state - show gray ring
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(4, 102, 200, 0.5)"
          strokeWidth={strokeWidth}
        />
      </svg>
    )
  }

  // Create segments
  const segments = data.map((item, index) => {
    const percentage = item.value / total

    // For very small segments, just skip
    if (percentage < 0.01) return null

    // Use stroke-dasharray for smoother rendering
    const segmentLength = circumference * percentage
    const dashArray = `${segmentLength} ${circumference - segmentLength}`
    const dashOffset = -circumference * (data.slice(0, index).reduce((sum, d) => sum + d.value, 0) / total)

    // Get the shade variation for this item
    const itemKey = item.id || item.color
    const strokeColor = shadeMap.get(itemKey) || item.color

    return (
      <circle
        key={item.id || index}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dasharray 0.3s ease' }}
      />
    )
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="rgba(4, 102, 200, 0.5)"
        strokeWidth={strokeWidth}
      />
      {/* Data segments */}
      {segments}
    </svg>
  )
}

export default DonutChart

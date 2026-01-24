import type { ChartDataItem } from '../types'

interface DonutChartProps {
  data: ChartDataItem[]
  size?: number
  strokeWidth?: number
}

const DonutChart = ({ data, size = 120, strokeWidth = 20 }: DonutChartProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

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
          stroke="#E8EDFF"
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

    return (
      <circle
        key={item.id || index}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={item.color}
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
        stroke="#E8EDFF"
        strokeWidth={strokeWidth}
      />
      {/* Data segments */}
      {segments}
    </svg>
  )
}

export default DonutChart

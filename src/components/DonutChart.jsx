import React from 'react'

const DonutChart = ({ data, size = 120, strokeWidth = 20 }) => {
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
  let currentAngle = -90 // Start from top

  const segments = data.map((item, index) => {
    const percentage = item.value / total
    const angle = percentage * 360
    const startAngle = currentAngle
    currentAngle += angle

    // Calculate arc
    const startRad = (startAngle * Math.PI) / 180
    const endRad = ((startAngle + angle) * Math.PI) / 180

    const x1 = center + radius * Math.cos(startRad)
    const y1 = center + radius * Math.sin(startRad)
    const x2 = center + radius * Math.cos(endRad)
    const y2 = center + radius * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    // For very small segments, just use a stroke
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

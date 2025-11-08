export function StarRating({ rating = 0, maxStars = 5, showValue = false, size = 'default' }) {
  const normalizedRating = Math.min(Math.max(Number(rating) || 0, 0), maxStars)
  const fullStars = Math.floor(normalizedRating)
  const hasHalfStar = normalizedRating % 1 >= 0.5
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0)

  const starSize = size === 'small' ? '0.875rem' : '1rem'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <div style={{ display: 'flex', gap: '0.125rem' }}>
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} filled={true} size={starSize} />
        ))}
        
        {/* Half star */}
        {hasHalfStar && <StarHalf key="half" size={starSize} />}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} filled={false} size={starSize} />
        ))}
      </div>
      
      {showValue && (
        <span style={{ 
          fontSize: size === 'small' ? '0.75rem' : '0.875rem',
          color: '#6b7280',
          marginLeft: '0.25rem'
        }}>
          ({normalizedRating.toFixed(1)})
        </span>
      )}
    </div>
  )
}

function Star({ filled, size }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill={filled ? '#fbbf24' : 'none'} 
      stroke={filled ? '#fbbf24' : '#d1d5db'} 
      strokeWidth="1.5"
      style={{ flexShrink: 0 }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function StarHalf({ size }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="#d1d5db" 
        strokeWidth="1.5"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="#fbbf24"
        stroke="#fbbf24" 
        strokeWidth="1.5"
        style={{ position: 'absolute', top: 0, left: 0, clipPath: 'inset(0 50% 0 0)' }}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </div>
  )
}


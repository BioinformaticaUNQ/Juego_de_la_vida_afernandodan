function VintageButton({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`v-btn v-btn-${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export default VintageButton

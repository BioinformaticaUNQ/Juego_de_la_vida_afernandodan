import './ToastStack.css'

function ToastStack({ toasts }) {
  const latestToast = toasts[0]

  if (!latestToast) {
    return null
  }

  const iconByType = {
    success: '✓',
    error: '✕',
    warn: '⏱',
    info: '•',
  }

  const labelByType = {
    success: 'Correcto',
    error: 'Incorrecto',
    warn: 'Timeout',
    info: 'Info',
  }

  const icon = iconByType[latestToast.type] || '•'
  const label = labelByType[latestToast.type] || 'Info'

  return (
    <aside className="toast-stack" aria-live="polite" aria-label="Mensajes del juego">
      <div key={latestToast.id} className={`toast toast-${latestToast.type}`.trim()}>
        <span className="toast-icon" aria-hidden="true">{icon}</span>
        <span className="toast-label">{label}</span>
      </div>
    </aside>
  )
}

export default ToastStack

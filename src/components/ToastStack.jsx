function ToastStack({ toasts }) {
  return (
    <aside className="toast-stack" aria-live="polite" aria-label="Mensajes del juego">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`.trim()}>
          {toast.message}
        </div>
      ))}
    </aside>
  )
}

export default ToastStack

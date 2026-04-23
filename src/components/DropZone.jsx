function DropZone({
  id,
  title,
  className = '',
  children,
  onDropPayload,
  placeholder,
}) {
  const handleDragOver = (event) => {
    event.preventDefault()
    event.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (event) => {
    event.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.currentTarget.classList.remove('drag-over')
    const rawPayload = event.dataTransfer.getData('application/json')
    if (!rawPayload) {
      return
    }
    onDropPayload?.(JSON.parse(rawPayload), id)
  }

  return (
    <div className={`dropzone-wrap ${className}`.trim()}>
      {title && <span className="dropzone-title">{title}</span>}
      <div
        className="dropzone-body"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {children || <span className="dropzone-placeholder">{placeholder}</span>}
      </div>
    </div>
  )
}

export default DropZone

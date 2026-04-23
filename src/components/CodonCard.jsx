function CodonCard({ task, now, onDropPayload }) {
  const remainingMs = Math.max(0, task.expiresAt - now)
  const percentage = Math.max(0, Math.min(100, (remainingMs / task.totalTime) * 100))
  const urgent = percentage <= 25

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
    onDropPayload?.(JSON.parse(rawPayload), task.id)
  }

  return (
    <article
      className={`codon-card ${urgent ? 'codon-urgent' : ''}`.trim()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="codon-card-topline">
        <span>Codon</span>
        <span>{Math.ceil(remainingMs / 1000)}s</span>
      </div>
      <div className="codon-card-main">
        <strong className="codon-seq">{task.codon}</strong>
        <span className="codon-anti">anti {task.requiredAnti}</span>
      </div>
      <div className="codon-bar-wrap">
        <div
          className={`codon-bar ${urgent ? 'codon-bar-danger' : ''}`.trim()}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </article>
  )
}

export default CodonCard

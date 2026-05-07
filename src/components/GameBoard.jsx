import ToastStack from './ToastStack'
import './GameBoard.css'

const GameBoard = ({
  isPaused,
  chainPreview,
  slots,
  trnaPool,
  codonWindow,
  renderCodon,
  onDropCard,
  toasts,
}) => {
  const handleDragStart = (event, cardId) => {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('text/plain', cardId)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.currentTarget.classList.remove('is-drag-over')
    const cardId = event.dataTransfer.getData('text/plain')
    if (cardId) {
      onDropCard(cardId)
    }
  }

  const allowDrop = (event) => {
    event.preventDefault()
    event.currentTarget.classList.add('is-drag-over')
  }

  const removeDropHighlight = (event) => {
    event.currentTarget.classList.remove('is-drag-over')
  }

  const renderSite = (label, key, payload, isDropZone = false) => (
    <article
      className={`game-site game-site--${key} ${isDropZone ? 'is-drop-zone' : ''}`.trim()}
      onDragOver={isDropZone ? allowDrop : undefined}
      onDragLeave={isDropZone ? removeDropHighlight : undefined}
      onDrop={isDropZone ? handleDrop : undefined}
    >
      <span className="game-site__label">{label}</span>
      {payload ? (
        <div className="game-site__payload">
          <strong>{payload.anticodon}</strong>
          <small>{payload.amino}</small>
        </div>
      ) : (
        <div className="game-site__empty">{isDropZone ? 'Insertar ARNt' : 'vacío'}</div>
      )}
    </article>
  )

  return (
    <section className="game-board">
      <section className="game-board__chain">
        <h3>Cadena polipeptídica resultante</h3>
        <div className="game-board__chain-main">
          {chainPreview.visibles.map((node, index) => (
            <div
              key={`${node.aminoacid}-${index}`}
              className={`game-board__chain-node ${node.isError ? 'is-error' : ''}`.trim()}
              style={{ backgroundColor: node.color }}
            />
          ))}
        </div>
        {slots.a && (
          <div className="game-board__chain-next">
            <div
              className="game-board__chain-node"
              style={{ backgroundColor: slots.a.color }}
            />
          </div>
        )}
      </section>

      <div className="game-board__ribosome">
        {isPaused && <div className="game-board__paused">PAUSA</div>}

        <div className="game-board__sites-row">
          {renderSite('E', 'e', slots.e)}
          {renderSite('P', 'p', slots.p)}
          {renderSite('A', 'a', slots.a, true)}
        </div>

        <ToastStack toasts={toasts} />

        <div className="game-board__mrna" aria-label="Flujo de ARNm 5 a 3">
          <span className="game-board__mrna-end">5'</span>
          <div className="game-board__mrna-strip" style={{ gridTemplateColumns: `repeat(${codonWindow.length || 1}, minmax(0, 1fr))` }}>
            {codonWindow.map((entry) => (
              <div
                key={`${entry.index}-${entry.codon || 'empty'}`}
                className={`game-board__mrna-codon ${entry.isActive ? 'is-active' : ''} ${entry.isEmpty ? 'is-empty' : ''}`.trim()}
              >
                {entry.isEmpty ? <span className="game-board__mrna-empty">---</span> : renderCodon(entry.codon)}
              </div>
            ))}
          </div>
          <span className="game-board__mrna-end">3'</span>
        </div>
      </div>

      <section className="game-board__pool">
        <h3>ARNt disponibles</h3>
        <div className="game-board__pool-grid">
          {trnaPool.map((card) => (
            <article
              key={card.id}
              className="game-board__trna-card"
              draggable
              onDragStart={(event) => handleDragStart(event, card.id)}
            >
              <div className="game-board__trna-top">
                <span className="game-board__amino-dot" style={{ backgroundColor: card.color }} />
                <span className="game-board__trna-label">{card.name}</span>
              </div>
              <div className="game-board__trna-icon">ARNt</div>
              <div className="game-board__trna-codon">{card.anticodon}</div>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export default GameBoard
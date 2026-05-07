import ProteinViewer from './ProteinViewer'
import PolypeptideChain from './PolypeptideChain'
import CodonSlot from './CodonSlot'
import './ResultModal.css'

const ResultModal = ({ result, chain, slots, onPrimaryAction }) => {
  const isSuccess = result.success
  const subtitle = isSuccess
    ? 'La traducción llegó a un codon STOP'
    : 'Errores excesivos → síntesis abortada: péptido truncado.'

  return (
    <div className="result-modal">
      <section className={`result-modal__panel ${isSuccess ? 'is-success' : 'is-truncated'}`.trim()}>
        <header className="result-modal__header">
          <div>
            <span className="result-modal__eyebrow">Resultado del nivel</span>
            <h2>{isSuccess ? 'Victoria' : 'Nivel fallido'}</h2>
            <p>{subtitle}</p>
          </div>
          <span className={`result-modal__status ${isSuccess ? 'is-success' : 'is-truncated'}`.trim()}>
            {isSuccess ? 'válida' : 'truncada'}
          </span>
        </header>

        <div className="result-modal__viewer-card">
          {isSuccess ? (
            <ProteinViewer />
          ) : (
            <div className="result-modal__failure-note">
              <strong>Proteína truncada</strong>
              <p>Muchos errores de apareamiento pueden producir péptidos o proteínas truncadas y no funcionales.</p>
            </div>
          )}
        </div>

        <div className="result-modal__stats" aria-label="Metadatos de traducción">
          <article>
            <span>Longitud</span>
            <strong>{result.length}</strong>
          </article>
          <article>
            <span>Errores</span>
            <strong>{result.errors}</strong>
          </article>
          <article>
            <span>Tasa de error</span>
            <strong>{(result.errorRate * 100).toFixed(1)}%</strong>
          </article>
          <article>
            <span>Puntaje</span>
            <strong>{Intl.NumberFormat('en-US').format(Math.round(result.score))}</strong>
          </article>
        </div>

        <div className="result-modal__polypeptide-section">
          <h3 className="result-modal__section-title">Cadena polipeptídica resultante</h3>
          <PolypeptideChain chain={chain} />
        </div>

        <div className="result-modal__actions">
          <button type="button" className="result-modal__action" onClick={onPrimaryAction}>
            {isSuccess ? 'Siguiente nivel' : 'Reintentar'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default ResultModal
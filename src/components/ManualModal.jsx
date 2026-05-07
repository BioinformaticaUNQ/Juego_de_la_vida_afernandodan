import './ManualModal.css'

const ManualModal = ({ title, subtitle, onClose, children }) => (
  <div className="modal-shell" onClick={onClose}>
    <section className="modal-shell__panel" onClick={(event) => event.stopPropagation()}>
      <header className="modal-shell__header">
        <div>
          <p className="modal-shell__eyebrow">Referencia</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button type="button" className="modal-shell__close" onClick={onClose}>Cerrar</button>
      </header>
      <div className="modal-shell__body">{children}</div>
    </section>
  </div>
)

export default ManualModal
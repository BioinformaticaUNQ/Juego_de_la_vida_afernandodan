function RibosomePanel({
  hint,
  hintIsError,
  inputValue,
  onInputChange,
  onSubmit,
  isInputDisabled,
  inputRef,
  isShaking,
  codonTrack,
  codonOffset,
}) {
  return (
    <section className="ribosome-shell">
      <div className="ribosome inky-borders">
        <form className="interaction-zone hand-drawn-border" onSubmit={onSubmit}>
          <p className={`hint ${hintIsError ? 'hint-error' : ''}`}>{hint}</p>
          <input
            ref={inputRef}
            value={inputValue}
            className={`aa-input ${isShaking ? 'shake' : ''}`}
            type="text"
            autoComplete="off"
            placeholder="Escribe el aminoacido"
            onChange={onInputChange}
            disabled={isInputDisabled}
            aria-label="Respuesta del aminoacido"
          />
        </form>

        <div className="mrna-window">
          <div className="mrna-strand" style={{ transform: `translateX(${codonOffset}px)` }}>
            {codonTrack.map((codon, index) => (
              <span className="codon" key={`${codon}-${index}`}>
                {codon}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RibosomePanel;

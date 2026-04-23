function ProteinChain({ beads }) {
  return (
    <div className="protein-chain" aria-live="polite">
      {beads.map((bead) => (
        <span
          className={`bead ${bead.isError ? 'bead-error' : ''}`}
          style={{ backgroundColor: bead.color }}
          key={bead.id}
        >
          {bead.label}
        </span>
      ))}
    </div>
  );
}

export default ProteinChain;

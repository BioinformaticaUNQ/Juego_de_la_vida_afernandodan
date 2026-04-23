function MoleculeChip({ item, sourceId, onDragStart }) {
  return (
    <button
      type="button"
      className={`molecule-chip molecule-${item.type}`}
      draggable
      onDragStart={(event) => onDragStart(event, { itemId: item.id, source: sourceId })}
    >
      {item.label}
    </button>
  )
}

export default MoleculeChip

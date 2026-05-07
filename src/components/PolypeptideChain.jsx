import './PolypeptideChain.css'

const PolypeptideChain = ({ chain }) => {
  if (!chain || chain.length === 0) {
    return <div className="polypeptide-chain">Sin cadena</div>
  }

  return (
    <div className="polypeptide-chain">
      {chain.map((node, index) => (
        <div
          key={`${node.aminoacid}-${index}`}
          className={`polypeptide-chain__residue ${node.isError ? 'is-error' : ''}`.trim()}
          style={{ backgroundColor: node.color }}
          title={`${node.aminoacid}${node.isError ? ' (Error)' : ''}`}
        >
          <span className="polypeptide-chain__letter">{node.aminoacid}</span>
        </div>
      ))}
    </div>
  )
}

export default PolypeptideChain

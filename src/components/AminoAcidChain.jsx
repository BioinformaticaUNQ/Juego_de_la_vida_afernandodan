import './AminoAcidChain.css'

const AminoAcidChain = ({ chain }) => {
  return (
    <div className="amino-acid-chain">
      {chain.map((node, index) => (
        <div
          key={`${node.aminoacid}-${index}`}
          className={`amino-acid-chain__node ${node.isError ? 'is-error' : ''}`.trim()}
          style={{ backgroundColor: node.color }}
          title={`${node.aminoacid}${node.isError ? ' (Error)' : ''}`}
        >
          <span className="amino-acid-chain__letter">{node.aminoacid}</span>
        </div>
      ))}
    </div>
  )
}

export default AminoAcidChain

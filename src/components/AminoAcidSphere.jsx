import './AminoAcidSphere.css'

const AminoAcidSphere = ({ aminoacid, color }) => {
  return (
    <div className="amino-acid-sphere" style={{ backgroundColor: color }} title={aminoacid}>
      <span className="amino-acid-sphere__letter">{aminoacid}</span>
    </div>
  )
}

export default AminoAcidSphere

import AminoAcidSphere from './AminoAcidSphere'
import './CodonSlot.css'

const CodonSlot = ({ sites }) => {
  const { eSite, pSite, aSite } = sites

  return (
    <div className="codon-slot">
      <div className="codon-slot__container">
        {/* Slot E */}
        <div className="codon-slot__site codon-slot__site--e">
          <div className="codon-slot__label">E</div>
          <div className="codon-slot__content">
            {eSite.codon && (
              <div className="codon-slot__codon">{eSite.codon}</div>
            )}
            {!eSite.codon && <div className="codon-slot__empty">VACÍO</div>}
          </div>
        </div>

        {/* Slot P */}
        <div className="codon-slot__site codon-slot__site--p">
          {pSite.aminoacid && (
            <AminoAcidSphere aminoacid={pSite.aminoacid} color={pSite.color} />
          )}
          <div className="codon-slot__label">P</div>
          <div className="codon-slot__content">
            {pSite.codon && (
              <div className="codon-slot__codon">{pSite.codon}</div>
            )}
          </div>
        </div>

        {/* Slot A */}
        <div className="codon-slot__site codon-slot__site--a">
          <div className="codon-slot__label">A</div>
          <div className="codon-slot__content">
            {aSite.instruction && (
              <div className="codon-slot__instruction">{aSite.instruction}</div>
            )}
            {!aSite.instruction && <div className="codon-slot__empty">INSERTAR ARNT</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodonSlot

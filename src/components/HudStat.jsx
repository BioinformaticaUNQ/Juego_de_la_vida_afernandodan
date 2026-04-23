function HudStat({ label, value, tone = 'default' }) {
  return (
    <article className={`hud-stat hud-stat-${tone}`}>
      <span className="hud-stat-label">{label}</span>
      <span className="hud-stat-value">{value}</span>
    </article>
  )
}

export default HudStat

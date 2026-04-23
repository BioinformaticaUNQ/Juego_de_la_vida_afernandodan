function TimerBar({ percentage }) {
  const tone = percentage < 15 ? 'is-danger' : percentage < 40 ? 'is-warning' : 'is-safe';

  return (
    <div className="timer-shell hand-drawn-border-dark">
      <div className={`timer-fill ${tone}`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

export default TimerBar;

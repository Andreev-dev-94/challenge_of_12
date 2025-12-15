import './reloadButton.css'

function ReloadButton({ resetGame }) {

  return (
    <div className='resfresh_butt_cont'>
      <button className="neon-refresh-btn" onClick={resetGame}>
        <span className="neon-icon">↻</span>
        <span className="neon-text">Restart</span>
        <span className="neon-glow"></span>
      </button>
    </div>
  );

}

export default ReloadButton;
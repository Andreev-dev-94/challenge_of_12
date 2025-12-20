import './reloadButton.css'

function ReloadButton({ resetGame, myText }) {

  return (
    <div className='resfresh_butt_cont'>
      <button className="neon-refresh-btn" onClick={resetGame}>
        <span className="neon-icon">↻</span>
        <span className="neon-text">{myText.reloadButton}</span>
        <span className="neon-glow"></span>
      </button>
    </div>
  );

}

export default ReloadButton;
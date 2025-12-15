import './leaderboardButton.css';

function LeaderboardButton({ onShowLeaderboard }) {
  return (
    <div className='leaderboard_btn_cont'>
      <div className="tooltip-container-leaderboard">
        <button className="neon-leaderboard-btn" onClick={onShowLeaderboard}>
          <span className="neon-icon">🏆</span>
          <span className="neon-text"></span>
          <span className="neon-glow"></span>
        </button>
        <span className="tooltip-text-leaderboard">Таблица лидеров</span>
      </div>
    </div>
  );
}

export default LeaderboardButton;
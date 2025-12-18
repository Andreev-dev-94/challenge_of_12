import './leaderboardButton.css';
import useYandexSDK from '../../hooks/useYandexSDK';

function LeaderboardButton({ onShowLeaderboard }) {
  const { ysdk, isLoading } = useYandexSDK();

  const handleShowLeaderboard = async () => {
    if (!ysdk || isLoading) {
        console.warn('SDK Яндекс не загружен');
        return;
    }
    
    console.log('Открытие кастомного лидерборда...');
    // Вместо вызова SDK открываем своё окно
    if (typeof onShowLeaderboard === 'function') {
        onShowLeaderboard();
    }
};

  if (isLoading) return null;

  return (
    <div className='leaderboard_btn_cont'>
      <div className="tooltip-container-leaderboard">
        <button className="neon-leaderboard-btn" onClick={handleShowLeaderboard}>
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
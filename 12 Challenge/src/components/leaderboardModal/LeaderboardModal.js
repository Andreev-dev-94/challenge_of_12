import './leaderboardModal.css';
import { useState, useEffect } from 'react';

function LeaderboardModal({ onClose, leaderboardData, playerName, playerRank, resetHighScore, loadLeaderboardData }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const handleResetRecord = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    try {
      console.log('🔄 Starting score reset...');
      setIsRefreshing(true);
      
      // Вызываем сброс рекорда
      if (resetHighScore) {
        await resetHighScore();
        console.log('✅ Score reset completed');
        
        // Принудительно обновляем данные
        setForceUpdate(prev => prev + 1);
      }
    } catch (error) {
      console.error('❌ Error resetting high score:', error);
    } finally {
      setIsRefreshing(false);
      setShowResetConfirm(false);
    }
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh requested...');
    setIsRefreshing(true);
    if (loadLeaderboardData) {
      await loadLeaderboardData();
    }
    setIsRefreshing(false);
  };

  // Принудительное обновление при изменении данных
  useEffect(() => {
    if (forceUpdate > 0 && loadLeaderboardData) {
      loadLeaderboardData();
    }
  }, [forceUpdate, loadLeaderboardData]);

  if (!leaderboardData) {
    return (
      <div className="modal-overlay">
        <div className="modal leaderboard-modal">
          <div className="modalContent">
            <h2>🏆 Таблица лидеров</h2>
            <p>Загрузка данных...</p>
            <button className="refreshButton-leaderboard" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Находим запись текущего игрока
  const currentPlayerEntry = leaderboardData.entries?.find(entry => entry.rank === playerRank);
  const currentPlayerScore = currentPlayerEntry?.score || 0;

  console.log('🔍 Current player entry:', currentPlayerEntry);
  console.log('🎯 Current player score:', currentPlayerScore);

  return (
    <>
      <div className="modal-overlay">
        <div className="modal leaderboard-modal">
          <div className="modalContent">
            <div className="leaderboard-header-row">
              <h2>🏆 Таблица лидеров</h2>
              <button 
                className={`refresh-leaderboard-btn ${isRefreshing ? 'refreshing' : ''}`}
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Обновить"
              >
                {isRefreshing ? '⟳' : '↻'}
              </button>
            </div>
            
            <div className="leaderboard-list">
              <div className="leaderboard-header">
                <span>Место</span>
                <span>Игрок</span>
                <span>Очки</span>
              </div>
              
              {leaderboardData.entries && leaderboardData.entries.length > 0 ? (
                leaderboardData.entries.map((entry, index) => (
                  <div 
                    key={entry.uniqueID || index}
                    className={`leaderboard-item ${entry.rank === playerRank ? 'current-player' : ''}`}
                  >
                    <span className="leaderboard-rank">#{entry.rank}</span>
                    <span className="leaderboard-name">
                      {entry.name || 'Аноним'}
                      {entry.rank === playerRank && ' (Вы)'}
                    </span>
                    <span className="leaderboard-score">{entry.score?.toLocaleString() || 0}</span>
                  </div>
                ))
              ) : (
                <div className="no-data-message">
                  <p>Нет данных для отображения</p>
                </div>
              )}
            </div>

            {playerRank && (
              <div className="player-rank-info">
                <p>Ваше место: <span className="rank-number">#{playerRank}</span></p>
                <p>Ваш рекорд: <span className="rank-number">{currentPlayerScore.toLocaleString()}</span></p>
              </div>
            )}

            <div className="leaderboard-actions">
              <button 
                className="refreshButton-leaderboard reset-record-btn" 
                onClick={handleResetRecord}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Обновление...' : 'Сбросить рекорд'}
              </button>
              <button className="refreshButton-leaderboard" onClick={onClose}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения сброса рекорда */}
      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal reset-confirm-modal">
            <div className="modalContent">
              <h2>Сброс рекорда</h2>
              <div className="modalText">
                <p>Вы уверены, что хотите сбросить рекорд?</p>
                <p>Это действие нельзя отменить. Все ваши результаты будут удалены.</p>
                <div className="warning-message">
                  ⚠️ Это повлияет на вашу позицию в таблице лидеров
                </div>
                <div className="current-score-info">
                  Текущий рекорд: <strong>{currentPlayerScore.toLocaleString()}</strong> очков
                </div>
              </div>
              <div className="reset-confirm-actions">
                <button className="refreshButton confirm-reset-btn" onClick={confirmReset}>
                  Да, сбросить
                </button>
                <button className="refreshButton cancel-reset-btn" onClick={cancelReset}>
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LeaderboardModal;
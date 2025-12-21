import './leaderboardModal.css';
import { useState, useEffect } from 'react';

function LeaderboardModal({ onClose, leaderboardData, playerName, playerRank, resetHighScore, loadLeaderboardData, myText }) {
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
            <h2>{myText.leaderboardTitle}</h2>
            <p>{myText.loadingData}</p>
            <button className="refreshButton-leaderboard" onClick={onClose}>
              {myText.closeButton}
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
              <h2>{myText.leaderboardTitle}</h2>
              <button
                className={`refresh-leaderboard-btn ${isRefreshing ? 'refreshing' : ''}`}
                onClick={handleRefresh}
                disabled={isRefreshing}
                title={myText.refreshTitle}
              >
                {isRefreshing ? '⟳' : '↻'}
              </button>
            </div>

            <div className="leaderboard-list">
              <div className="leaderboard-header">
                <span>{myText.placeHeader}</span>
                <span>{myText.playerHeader}</span>
                <span>{myText.pointsHeader}</span>
              </div>

              {leaderboardData.entries && leaderboardData.entries.length > 0 ? (
                leaderboardData.entries.map((entry, index) => (
                  <div
                    key={entry.uniqueID || index}
                    className={`leaderboard-item ${entry.rank === playerRank ? 'current-player' : ''}`}
                  >
                    <span className="leaderboard-rank">#{entry.rank}</span>
                    <span className="leaderboard-name">
                      {/* Используем publicName из объекта player */}
                      {entry.player?.publicName || myText.anonymous}
                      {entry.rank === playerRank && myText.youMarker}
                    </span>
                    <span className="leaderboard-score">{entry.score?.toLocaleString() || 0}</span>
                  </div>
                ))
              ) : (
                <div className="no-data-message">
                  <p>{myText.noData}</p>
                </div>
              )}
            </div>

            {playerRank && (
              <div className="player-rank-info">
                <p>{myText.yourPlace} <span className="rank-number">#{playerRank}</span></p>
                <p>{myText.yourRecord} <span className="rank-number">{currentPlayerScore.toLocaleString()}</span></p>
              </div>
            )}

            <div className="leaderboard-actions">
              <button
                className="refreshButton-leaderboard reset-record-btn"
                onClick={handleResetRecord}
                disabled={isRefreshing}
              >
                {isRefreshing ? myText.updating : myText.resetRecordButton}
              </button>
              <button className="refreshButton-leaderboard" onClick={onClose}>
                {myText.closeButton}
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
              <h2>{myText.resetConfirmTitle}</h2>
              <div className="modalText">
                <p>{myText.resetConfirmQuestion}</p>
                <p>{myText.resetConfirmWarning}</p>
                <div className="warning-message">
                  {myText.resetConfirmAffect}
                </div>
                <div 
                  className="current-score-info" 
                  dangerouslySetInnerHTML={{ 
                    __html: myText.resetCurrentScore(currentPlayerScore.toLocaleString()) 
                  }}
                />
              </div>
              <div className="reset-confirm-actions">
                <button className="refreshButton confirm-reset-btn" onClick={confirmReset}>
                  {myText.confirmResetButton}
                </button>
                <button className="refreshButton cancel-reset-btn" onClick={cancelReset}>
                  {myText.cancelResetButton}
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
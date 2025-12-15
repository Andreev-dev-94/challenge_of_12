import { useState, useEffect, useCallback } from 'react';
import useYandexSDK from './useYandexSDK';

const useGameRecords = () => {
  const { ysdk } = useYandexSDK();
  const [highScore, setHighScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [playerRank, setPlayerRank] = useState(null);

  // Загрузка рекорда при инициализации
  useEffect(() => {
    const initializeRecords = async () => {
      try {
        setIsLoading(true);

        // Загружаем из localStorage
        const savedHighScore = localStorage.getItem('highScore');
        const initialScore = savedHighScore ? parseInt(savedHighScore) : 0;

        console.log(`📥 Loaded initial score from localStorage: ${initialScore}`);
        setHighScore(initialScore);

        // Загружаем данные лидерборда
        await loadLeaderboardData();

      } catch (error) {
        console.error('Failed to initialize records:', error);
        const savedHighScore = localStorage.getItem('highScore');
        if (savedHighScore) {
          setHighScore(parseInt(savedHighScore));
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeRecords();
  }, [ysdk]);

  // Функция загрузки данных лидерборда
  const loadLeaderboardData = useCallback(async () => {
    if (!ysdk) {
      console.warn('Yandex SDK not available for leaderboard');
      return null;
    }

    try {
      console.log('🔄 Loading leaderboard data...');
      const leaderboards = await ysdk.getLeaderboards();
      const entries = await leaderboards.getLeaderboardEntries('leaderboard_v1', {
        includeUser: true,
        quantity: 20
      });

      console.log('📊 Raw leaderboard data:', entries);

      // ВАЖНО: Принудительно обновляем состояние
      setLeaderboardData(entries);
      setPlayerRank(entries.userRank);

      return entries;
    } catch (error) {
      console.error('Failed to load leaderboard data:', error);
      return null;
    }
  }, [ysdk]);

  // Обновление рекорда
  const updateHighScore = useCallback(async (newScore) => {
    console.log(`🎯 Updating high score to: ${newScore}`);

    // Устанавливаем в localStorage и состояние
    setHighScore(newScore);
    localStorage.setItem('highScore', newScore.toString());

    // Отправляем в Яндекс лидерборд
    if (ysdk) {
      try {
        const leaderboards = await ysdk.getLeaderboards();
        await leaderboards.setLeaderboardScore('leaderboard_v1', newScore);
        console.log('✅ Score saved to leaderboard');

        // Немедленно обновляем данные лидерборда
        const updatedData = await loadLeaderboardData();
        const newRank = updatedData?.userRank || null;

        return {
          isNewRecord: true,
          rank: newRank
        };
      } catch (error) {
        console.warn('Failed to update leaderboard:', error);
        return { isNewRecord: true, rank: null };
      }
    }

    return { isNewRecord: true, rank: null };
  }, [ysdk, loadLeaderboardData]);

  // Сброс рекорда
  const resetHighScore = useCallback(async () => {
    console.log('🔄 Resetting high score to 0');

    try {
      // Устанавливаем 0 в localStorage и состоянии
      setHighScore(0);
      localStorage.setItem('highScore', '0');

      // Устанавливаем 0 в Яндекс лидерборде
      if (ysdk) {
        try {
          const leaderboards = await ysdk.getLeaderboards();
          await leaderboards.setLeaderboardScore('leaderboard_v1', 0);
          console.log('✅ Leaderboard score set to 0');
        } catch (error) {
          console.warn('Failed to reset leaderboard:', error);
        }
      }

      // Немедленно обновляем данные лидерборда
      await loadLeaderboardData();

      console.log('✅ High score reset to 0 completed');
      return true;
    } catch (error) {
      console.error('Error resetting high score:', error);
      throw error;
    }
  }, [ysdk, loadLeaderboardData]);

  // Получение данных лидерборда
  const getLeaderboardData = useCallback(async () => {
    return await loadLeaderboardData();
  }, [loadLeaderboardData]);

  return {
    highScore,
    updateHighScore,
    resetHighScore,
    getLeaderboardData,
    loadLeaderboardData,
    leaderboardData,
    playerRank,
    isLoading
  };
};

export default useGameRecords;
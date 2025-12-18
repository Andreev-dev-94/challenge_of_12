import { useState, useEffect, useCallback } from 'react';
import useYandexSDK from './useYandexSDK';

const useGameRecords = () => {
  const { ysdk } = useYandexSDK();
  const [highScore, setHighScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [playerRank, setPlayerRank] = useState(null);
  const [leaderboardError, setLeaderboardError] = useState(null);

  // Функция загрузки данных лидерборда (ОСНОВНОЕ ИСПРАВЛЕНИЕ ЗДЕСЬ)
  const loadLeaderboardData = useCallback(async () => {
    if (!ysdk) {
      console.warn('SDK Яндекс недоступен для лидерборда');
      return null;
    }

    try {
      console.log('🔄 Загрузка данных лидерборда...');
      
      // ВАЖНО: Правильный способ получить объект лидерборда - через getLeaderboards()
      // Этот метод возвращает промис, поэтому нужен await
      const leaderboardApi = await ysdk.getLeaderboards();
      console.log('📊 Объект для работы с лидербордом получен:', leaderboardApi);

      // Проверяем, что получили объект с нужными методами
      if (!leaderboardApi || typeof leaderboardApi.getLeaderboardEntries !== 'function') {
        throw new Error('Некорректный объект лидерборда. Доступные методы: ' + (leaderboardApi ? Object.keys(leaderboardApi) : 'null'));
      }

      // Загружаем записи лидерборда 'score' (техническое имя с платформы)
      const entries = await leaderboardApi.getLeaderboardEntries('score', {
        includeUser: true,
        quantityTop: 10,  // Количество записей в топе
        quantityAround: 5 // Количество записей вокруг текущего игрока
      });
      
      console.log('✅ Данные лидерборда загружены:', entries);
      
      setLeaderboardData(entries);
      setPlayerRank(entries.userRank || null);
      setLeaderboardError(null);
      
      return entries;
    } catch (error) {
      console.error('❌ Ошибка загрузки лидерборда:', error);
      setLeaderboardError(error.message);
      return null;
    }
  }, [ysdk]);

  // Загрузка рекорда при инициализации
  useEffect(() => {
    const initializeRecords = async () => {
      try {
        setIsLoading(true);
        setLeaderboardError(null);

        // Загружаем из localStorage
        const savedHighScore = localStorage.getItem('highScore');
        const initialScore = savedHighScore ? parseInt(savedHighScore) : 0;

        console.log(`📥 Загружен рекорд из localStorage: ${initialScore}`);
        setHighScore(initialScore);

        // Загружаем данные лидерборда
        await loadLeaderboardData();

      } catch (error) {
        console.error('Ошибка инициализации рекордов:', error);
        const savedHighScore = localStorage.getItem('highScore');
        if (savedHighScore) {
          setHighScore(parseInt(savedHighScore));
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeRecords();
  }, [ysdk, loadLeaderboardData]);

  // Обновление рекорда
  const updateHighScore = useCallback(async (newScore) => {
    console.log(`🎯 Обновление рекорда на: ${newScore}`);

    // Устанавливаем в localStorage и состояние
    setHighScore(newScore);
    localStorage.setItem('highScore', newScore.toString());

    // Отправляем в Яндекс лидерборд
    if (ysdk) {
      try {
        // Тут тоже используем getLeaderboards(), а не свойство leaderboards
        const leaderboardApi = await ysdk.getLeaderboards();
        await leaderboardApi.setLeaderboardScore('score', newScore);
        console.log('✅ Рекорд сохранен в лидерборд');

        // Обновляем данные лидерборда
        const updatedData = await loadLeaderboardData();
        const newRank = updatedData?.userRank || null;

        return {
          isNewRecord: true,
          rank: newRank
        };
      } catch (error) {
        console.warn('Ошибка обновления лидерборда:', error);
        return { isNewRecord: true, rank: null };
      }
    }

    return { isNewRecord: true, rank: null };
  }, [ysdk, loadLeaderboardData]);

  // Сброс рекорда
  const resetHighScore = useCallback(async () => {
    console.log('🔄 Сброс рекорда на 0');

    try {
      setHighScore(0);
      localStorage.setItem('highScore', '0');

      if (ysdk) {
        try {
          const leaderboardApi = await ysdk.getLeaderboards();
          await leaderboardApi.setLeaderboardScore('score', 0);
          console.log('✅ Лидерборд сброшен на 0');
        } catch (error) {
          console.warn('Ошибка сброса лидерборда:', error);
        }
      }

      await loadLeaderboardData();
      console.log('✅ Рекорд успешно сброшен');
      return true;
    } catch (error) {
      console.error('Ошибка сброса рекорда:', error);
      throw error;
    }
  }, [ysdk, loadLeaderboardData]);

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
    leaderboardError,
    isLoading
  };
};

export default useGameRecords;
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
        console.warn('SDK Яндекс недоступен');
        return null;
    }

    try {
        console.log('🔄 Загрузка данных лидерборда...');
        
        // ВАЖНО: Универсальный способ получить API лидерборда
        let leaderboardApi;
        
        // Способ 1: Пробуем получить напрямую (как было в старых логах)
        if (ysdk.leaderboards && typeof ysdk.leaderboards.getEntries === 'function') {
            leaderboardApi = ysdk.leaderboards;
            console.log('📊 Используем прямой доступ ysdk.leaderboards');
        }
        // Способ 2: Пробуем вызвать как метод (как работало до этого)
        else if (ysdk.getLeaderboards && typeof ysdk.getLeaderboards === 'function') {
            leaderboardApi = await ysdk.getLeaderboards();
            console.log('📊 Используем метод ysdk.getLeaderboards()');
        }
        // Способ 3: Ищем в другом месте (на всякий случай)
        else if (ysdk.leaderboards && ysdk.leaderboards._isActualApi) {
            leaderboardApi = ysdk.leaderboards;
            console.log('📊 Используем альтернативный доступ к API');
        }
        else {
            // Для отладки: выводим что вообще есть в ysdk
            console.error('Не удалось найти API лидерборда. Доступные ключи:', Object.keys(ysdk).filter(k => k.includes('leader') || k.includes('Leader')));
            throw new Error('API лидерборда не найден');
        }

        console.log('📊 Объект лидерборда:', leaderboardApi);

        // Загружаем записи лидерборда 'score'
        const entries = await leaderboardApi.getEntries('score', {
            includeUser: true,
            quantityTop: 10,
            quantityAround: 5
        });
        
        console.log('✅ Данные лидерборда загружены:', entries);
        
        // Обработка имени игрока: имя должно быть в entry.player.publicName
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
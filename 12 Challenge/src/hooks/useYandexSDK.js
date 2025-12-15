import { useState, useEffect } from 'react';

const useYandexSDK = () => {
  const [ysdk, setYsdk] = useState(null);
  const [player, setPlayer] = useState(null);
  const [playerName, setPlayerName] = useState('Игрок'); // Добавляем отдельное состояние для имени
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        console.log('Initializing Yandex SDK...');

        if (typeof window.YaGames === 'undefined') {
          throw new Error('Yandex SDK not found');
        }

        const sdkInstance = await window.YaGames.init();
        setYsdk(sdkInstance);

        // Получаем данные игрока
        try {
          const playerData = await sdkInstance.getPlayer();
          setPlayer(playerData);

          // Получаем имя игрока
          const name = await playerData.getName();
          setPlayerName(name || 'Игрок');
          console.log('✅ Player data loaded:', name);
        } catch (playerError) {
          console.warn('⚠️ Could not load player data:', playerError);
          setPlayerName('Игрок');
        }

        console.log('✅ Yandex SDK initialized successfully');

      } catch (err) {
        console.error('❌ Failed to initialize Yandex SDK:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSDK();
  }, []);

  return { ysdk, isLoading, error, player, playerName }; // Возвращаем готовое имя
};

export default useYandexSDK;
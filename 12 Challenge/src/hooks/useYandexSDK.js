import { useState, useEffect } from 'react';

const useYandexSDK = () => {
    const [ysdk, setYsdk] = useState(null);
    const [playerName, setPlayerName] = useState('Игрок');
    const [isLoading, setIsLoading] = useState(true);
    const [isReady, setIsReady] = useState(false); // Новый флаг: SDK инициализирован И вызван ready()

    useEffect(() => {
        const initSDK = async () => {
            if (typeof window.YaGames === 'undefined') {
                console.warn('SDK Яндекс Игр (YaGames) не загружен.');
                setIsLoading(false);
                return;
            }

            try {
                // 1. Инициализируем SDK
                const sdk = await window.YaGames.init();
                console.log('✅ Яндекс SDK инициализирован.');
                setYsdk(sdk);

                // 2. НЕМЕДЛЕННО сообщаем платформе, что игра готова
                // Это БЛОКИРУЮЩИЙ вызов. До его завершения игра не должна показываться.
                if (sdk.features?.LoadingAPI?.ready) {
                    await sdk.features.LoadingAPI.ready();
                    console.log('✅ LoadingAPI.ready() вызван. Игра официально готова для платформы.');
                    setIsReady(true); // Критически важный флаг!
                }

                // 3. Фоново получаем данные игрока (после ready())
                try {
                    const player = await sdk.getPlayer();
                    const name = await player.getName();
                    setPlayerName(name || 'Игрок');
                    console.log('✅ Имя игрока получено:', name);
                } catch (playerError) {
                    console.warn('Не удалось получить имя игрока:', playerError);
                }

            } catch (error) {
                console.error('❌ Критическая ошибка при инициализации SDK:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Инициализируем немедленно, без задержек
        initSDK();
    }, []);

    return { ysdk, playerName, isLoading, isReady }; // Возвращаем isReady
};

export default useYandexSDK;
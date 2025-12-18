import { useState, useEffect } from 'react';

const useYandexSDK = () => {
    const [ysdk, setYsdk] = useState(null);
    const [playerName, setPlayerName] = useState('Игрок');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initSDK = async () => {
            // ВАЖНО: SDK уже загружен через <script src="/sdk.js">
            // Просто проверяем глобальный объект и инициализируем.
            if (typeof window.YaGames === 'undefined') {
                console.warn('SDK Яндекс Игр (YaGames) не загружен.');
                setIsLoading(false);
                return;
            }

            try {
                // 1. Инициализируем SDK через стандартный метод
                const sdk = await window.YaGames.init();
                console.log('✅ Яндекс SDK инициализирован.');

                // 2. Сообщаем платформе, что игра готова (ОБЯЗАТЕЛЬНЫЙ ШАГ)
                if (sdk.features?.LoadingAPI?.ready) {
                    await sdk.features.LoadingAPI.ready();
                    console.log('✅ LoadingAPI.ready() вызван.');
                }

                // 3. Получаем данные игрока
                try {
                    const player = await sdk.getPlayer();
                    const name = await player.getName();
                    setPlayerName(name || 'Игрок');
                    console.log('✅ Имя игрока получено:', name);
                } catch (playerError) {
                    console.warn('Не удалось получить имя игрока:', playerError);
                }

                // 4. Сохраняем инстанс SDK в состояние
                setYsdk(sdk);

            } catch (error) {
                console.error('❌ Критическая ошибка при инициализации SDK:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Даем странице и скрипту SDK немного времени на загрузку
        const timer = setTimeout(() => {
            initSDK();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return { ysdk, playerName, isLoading };
};

export default useYandexSDK;
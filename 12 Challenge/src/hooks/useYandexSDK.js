import { useState, useEffect } from 'react';

const useYandexSDK = () => {
    const [ysdk, setYsdk] = useState(null);
    const [playerName, setPlayerName] = useState('Игрок');
    const [isLoading, setIsLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const [lang, setLang] = useState('ru');
    const [sdkInitialized, setSdkInitialized] = useState(false); // Новый флаг

    useEffect(() => {
        const initSDK = async () => {
            if (typeof window.YaGames === 'undefined') {
                console.warn('SDK Яндекс Игр (YaGames) не загружен.');
                // Для локальной разработки - сразу готовим
                setIsReady(true);
                setIsLoading(false);
                return;
            }

            try {
                // 1. ТОЛЬКО инициализация SDK
                const sdk = await window.YaGames.init();
                console.log('✅ Яндекс SDK инициализирован.');
                setYsdk(sdk);
                setSdkInitialized(true); // SDK готов, но НЕ игра

                // 2. Фоново получаем данные игрока (не блокируем ready)
                try {
                    const player = await sdk.getPlayer();
                    const name = await player.getName();
                    setPlayerName(name || 'Игрок');
                    console.log('✅ Имя игрока получено:', name);
                } catch (playerError) {
                    console.warn('Не удалось получить имя игрока:', playerError);
                }

                // 3. Определение языка
                const platformLang = sdk.environment?.i18n?.lang || 'ru';
                const ruLangCodes = ['ru', 'be', 'uk'];
                let gameLang = 'ru';
                if (!ruLangCodes.includes(platformLang)) {
                    gameLang = 'en';
                }
                setLang(gameLang);
                console.log('🌐 Язык игры:', gameLang);

            } catch (error) {
                console.error('❌ Ошибка при инициализации SDK:', error);
                // Даже при ошибке даем возможность играть
                setIsReady(true);
            } finally {
                setIsLoading(false);
            }
        };

        initSDK();
    }, []);

    // НОВАЯ ФУНКЦИЯ: вызывайте её, когда игра реально готова
    const notifyGameReady = async () => {
        if (!ysdk || !sdkInitialized || isReady) return;
        
        try {
            if (ysdk.features?.LoadingAPI?.ready) {
                console.log('🎮 Вызываем LoadingAPI.ready() - игра Готова!');
                await ysdk.features.LoadingAPI.ready();
                console.log('✅ Игра официально доступна для платформы');
                setIsReady(true);
                return true;
            }
        } catch (error) {
            console.error('Ошибка при вызове ready():', error);
        }
        return false;
    };

    return { 
        ysdk, 
        playerName, 
        isLoading, 
        isReady, 
        lang,
        sdkInitialized,
        notifyGameReady // Экспортируем функцию
    };
};

export default useYandexSDK;
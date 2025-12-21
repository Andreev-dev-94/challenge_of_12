import { useState, useRef, useEffect } from 'react';
import './adMainButton.css';
import useYandexSDK from '../../hooks/useYandexSDK';

function AdMainButton({ life, setLife, isAdUsed, setIsAdUsed, setIsAdBlocking, myText }) {
  const { ysdk, isLoading } = useYandexSDK();
  const [isAdLoading, setIsAdLoading] = useState(false);
  const isProcessingRef = useRef(false);
  const adShownRef = useRef(false); // Новый реф для отслеживания факта показа

  // Сброс состояния при монтировании
  useEffect(() => {
    isProcessingRef.current = false;
    adShownRef.current = false;
  }, []);

  const handleShowRewardedAd = async () => {
    // Блокируем повторные нажатия
    if (isProcessingRef.current || isAdLoading || isAdUsed || life >= 3 || !ysdk) {
      console.log('Реклама не может быть показана:', {
        isProcessing: isProcessingRef.current,
        isLoading: isAdLoading,
        isAdUsed,
        life,
        hasSDK: !!ysdk
      });
      return;
    }

    console.log('🎬 Показ REWARDED рекламы за жизнь...');
    isProcessingRef.current = true;
    setIsAdLoading(true);
    setIsAdBlocking(true);
    adShownRef.current = false; // Сбрасываем флаг показа

    try {
      // Проверяем доступность REWARDED рекламы
      if (!ysdk.adv || typeof ysdk.adv.showRewardedVideo !== 'function') {
        throw new Error('Метод showRewardedVideo недоступен');
      }

      // Создаем промис для обработки REWARDED рекламы
      const adResult = await new Promise((resolve, reject) => {
        let rewardGranted = false;

        ysdk.adv.showRewardedVideo({
          callbacks: {
            onOpen: () => {
              console.log('🎬 Rewarded реклама открыта');
              adShownRef.current = true; // Реклама начала показ
            },
            onRewarded: () => {
              console.log('💰 Награда гарантирована!');
              rewardGranted = true;
              // ВАЖНО: Выдаем награду НЕМЕДЛЕННО здесь
              if (life < 3) {
                setLife(prev => Math.min(prev + 1, 3));
                setIsAdUsed(true);
                console.log('✅ Игрок получил +1 жизнь (в onRewarded)');
              }
            },
            onClose: () => {
              console.log(`✅ Rewarded реклама закрыта. Награда выдана: ${rewardGranted}`);
              // Разрешаем промис с результатом
              resolve(rewardGranted);
            },
            onError: (error) => {
              console.error('❌ Ошибка rewarded рекламы:', error);
              reject(error);
            }
          }
        });
      });

      // Дополнительная проверка (на случай, если onRewarded не сработал)
      if (adResult === true && !isAdUsed) {
        console.log('🔄 Дублирующая проверка: награда подтверждена');
        // Уже выдали в onRewarded, но на всякий случай
      }

    } catch (error) {
      console.error('Ошибка при показе rewarded рекламы:', error);
      // При ошибке "too frequent requests" все равно блокируем кнопку на 30 сек
      if (error.message && error.message.includes('frequent requests')) {
        console.warn('⚠️ Реклама запрошена слишком часто. Кнопка временно заблокирована.');
        // Можно установить таймер разблокировки, но isAdUsed уже делает это
      }
    } finally {
      // Всегда разблокируем UI
      setIsAdLoading(false);
      setIsAdBlocking(false);
      isProcessingRef.current = false;

      // Если реклама начала показ (adShownRef.current = true),
      // но награда не выдана, все равно помечаем кнопку как использованную
      // для предотвращения частых запросов
      if (adShownRef.current && !isAdUsed) {
        console.log('🛡️ Реклама была показана, блокируем кнопку до следующей игры');
        setIsAdUsed(true);
      }

      console.log('🔄 Обработка рекламы завершена');
    }
  };

  const getTooltipText = () => {
    if (isAdUsed) {
      return myText.adBonusUsed;
    }
    if (life >= 3) {
      return myText.maxLivesReached;
    }
    if (isAdLoading) {
      return myText.ads;
    }
    return myText.getLifeForAd;
  };

  if (isLoading) return null;

  const isDisabled = isAdLoading || isAdUsed || life >= 3;

  return (
    <div className='ad_bonus_cont'>
      <div className="tooltip-container-ad">
        <button
          className={`neon-ad-btn ${isDisabled ? 'disabled' : ''}`}
          onClick={handleShowRewardedAd}
          disabled={isDisabled}
        >
          <span className="neon-icon">🎬</span>
          <span className="neon-text"></span>
          <span className="neon-glow"></span>
        </button>
        <span className={isAdUsed || life >= 3 ? 'tooltip-text-ad disabled-tooltip' : 'tooltip-text-ad'}>
          {getTooltipText()}
        </span>
      </div>
    </div>
  );
}

export default AdMainButton;
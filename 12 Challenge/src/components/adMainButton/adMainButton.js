import { useState } from 'react';
import './adMainButton.css';
import useYandexSDK from '../../hooks/useYandexSDK';

function AdMainButton({ life, setLife, isAdUsed, setIsAdUsed, setIsAdBlocking }) {
  const { ysdk, isLoading } = useYandexSDK();
  const [isAdLoading, setIsAdLoading] = useState(false);

  const handleShowFullscreenAd = () => {
    // Проверяем условия: нельзя нажать если реклама уже загружается, жизни полные ИЛИ кнопка уже использована
    if (!ysdk || isAdLoading || life >= 3 || isAdUsed) {
      console.warn('Ad cannot be shown:', {
        hasSDK: !!ysdk,
        isAdLoading,
        life,
        isAdUsed,
        canShow: life < 3 && !isAdUsed
      });
      return;
    }

    console.log('Showing fullscreen ad...');
    setIsAdLoading(true);
    setIsAdBlocking(true); // Блокируем игру

    if (!ysdk.adv || !ysdk.adv.showFullscreenAdv) {
      setTimeout(() => {
        setLife(prev => Math.min(prev + 1, 3));
        setIsAdLoading(false);
        setIsAdUsed(true);
        setIsAdBlocking(false); // Разблокируем игру
      }, 3000);
      return;
    }

     ysdk.adv.showFullscreenAdv({
      callbacks: {
        onOpen: () => {
          console.log('🎬 Fullscreen ad opened');
          setIsAdBlocking(true); // Блокируем игру
        },
        onClose: (wasShown) => {
          console.log(`✅ Fullscreen ad closed, was shown: ${wasShown}`);
          if (wasShown && life < 3) {
            setLife(prev => Math.min(prev + 1, 3));
            setIsAdUsed(true);
          }
          setIsAdLoading(false);
          setIsAdBlocking(false); // Разблокируем игру
        },
        onError: (error) => {
          console.error('❌ Fullscreen ad error:', error);
          setIsAdLoading(false);
          setIsAdBlocking(false); // Разблокируем игру даже при ошибке
        }
      }
    });
  };

  // Функция для определения текста подсказки
  const getTooltipText = () => {
    if (isAdUsed) {
      return 'Бонус использован в этой игре';
    }
    if (life >= 3) {
      return 'Максимальное количество жизней';
    }
    if (isAdLoading) {
      return 'Реклама загружается...';
    }
    return 'Получить жизнь за рекламу';
  };

  // Определяем класс для подсказки в зависимости от состояния
  const getTooltipClassName = () => {
    if (isAdUsed || life >= 3) {
      return 'tooltip-text-ad disabled-tooltip';
    }
    return 'tooltip-text-ad';
  };

  if (isLoading) return null;

  const isDisabled = isAdLoading || life >= 3 || isAdUsed;

  return (
    <div className='ad_bonus_cont'>
      <div className="tooltip-container-ad">
        <button
          className={`neon-ad-btn ${isDisabled ? 'disabled' : ''}`}
          onClick={handleShowFullscreenAd}
          disabled={isDisabled}
        >
          <span className="neon-icon">🎬</span>
          <span className="neon-text"></span>
          <span className="neon-glow"></span>
        </button>
        <span className={getTooltipClassName()}>
          {getTooltipText()}
        </span>
      </div>
    </div>
  );
}

export default AdMainButton;
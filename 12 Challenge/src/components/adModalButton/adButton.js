import React, { useState } from 'react';
import useYandexSDK from '../../hooks/useYandexSDK';

const AdButton = ({ setShowGameOver, setLife, roundId }) => {
  const { ysdk, isLoading, error } = useYandexSDK();
  const [isAdLoading, setIsAdLoading] = useState(false); // Новое состояние для блокировки

  const handleShowRewardedAd = () => {
    if (!ysdk || isAdLoading) {
      console.warn('SDK not ready yet or ad already loading');
      return;
    }

    console.log('Showing rewarded ad...');
    
    // Блокируем кнопку сразу при нажатии
    setIsAdLoading(true);

    // Если это локальная заглушка (нет реального SDK)
    if (!ysdk.adv || !ysdk.adv.showRewardedVideo) {
      console.log('Using local ad simulation');
      // Эмулируем поведение рекламы с задержкой
      setTimeout(() => {
        // Эмулируем успешный просмотр
        setShowGameOver(false);
        setLife(prev => prev + 1);
        console.log('💰 Reward granted! (simulation)');
        
        // Разблокируем кнопку после завершения
        setIsAdLoading(false);
      }, 3000);
      return;
    }

    // Реальный вызов SDK Яндекс Игр
    ysdk.adv.showRewardedVideo({
      callbacks: {
        onOpen: () => {
          console.log('🎬 Rewarded ad opened');
          // Кнопка уже заблокирована, ничего не делаем
        },
        onRewarded: () => {
          console.log('💰 Reward granted!');
          setShowGameOver(false);
          setLife(prev => prev + 1);
          // НЕ разблокируем здесь, ждем onClose
        },
        onClose: (wasShown) => {
          console.log(`✅ Rewarded ad closed, was shown: ${wasShown}`);
          // Разблокируем кнопку независимо от результата
          setIsAdLoading(false);
        },
        onError: (error) => {
          console.error('❌ Rewarded ad error:', error);
          // При ошибке тоже разблокируем кнопку
          setIsAdLoading(false);
        }
      }
    });
  };

  if (isLoading) {
    return <div>Загрузка SDK...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red' }}>
        Ошибка: {error}
        <br />
        <small>Это нормально в режиме разработки</small>
      </div>
    );
  }

  return (
    <div>
      {/* <h3>Тест Яндекс SDK</h3> */}
      
      {roundId < 12 && (
        <button 
          className="refreshButton"
          onClick={handleShowRewardedAd}
          disabled={isAdLoading} // Блокируем кнопку во время загрузки рекламы
          style={{ 
            cursor: isAdLoading ? 'not-allowed' : 'pointer',
            opacity: isAdLoading ? 0.6 : 1
          }}
        >
          {isAdLoading ? 'Реклама загружается...' : 'Показать рекламу за награду'}
        </button>
      )}
      
    {/*   <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Режим: {ysdk ? 'SDK подключен' : 'Локальная заглушка'}
        <br />
        Статус: {isAdLoading ? 'Реклама показывается...' : 'Готово'}
        <br />
        Открой консоль браузера для просмотра логов
      </div> */}
    </div>
  );
};

export default AdButton;
import React, { useState, useEffect, useRef } from 'react';
import useYandexSDK from '../../hooks/useYandexSDK';

const AdButton = ({ setShowGameOver, setLife, roundId, myText }) => {
  const { ysdk, isLoading } = useYandexSDK();
  const [isAdLoading, setIsAdLoading] = useState(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    return () => {
      isProcessingRef.current = false;
    };
  }, []);

  const handleShowRewardedAd = async () => {
    if (isProcessingRef.current || isAdLoading || !ysdk) {
      console.warn('SDK не готов или реклама уже загружается');
      return;
    }

    console.log('Показ рекламы за награду...');
    isProcessingRef.current = true;
    setIsAdLoading(true);

    try {
      if (!ysdk.adv || typeof ysdk.adv.showRewardedVideo !== 'function') {
        throw new Error('Метод showRewardedVideo недоступен');
      }

      const adResult = await new Promise((resolve, reject) => {
        let rewarded = false;
        
        ysdk.adv.showRewardedVideo({
          callbacks: {
            onOpen: () => {
              console.log('🎬 Реклама за награду открыта');
            },
            onRewarded: () => {
              console.log('💰 Награда получена!');
              rewarded = true;
            },
            onClose: () => {
              console.log('✅ Реклама закрыта');
              resolve(rewarded);
            },
            onError: (error) => {
              console.error('❌ Ошибка рекламы:', error);
              reject(error);
            }
          }
        });
      });

      if (adResult === true) {
        setShowGameOver(false);
        setLife(prev => prev + 1);
        console.log('🎁 Игрок получил жизнь за просмотр рекламы');
      }

    } catch (error) {
      console.error('Ошибка при показе рекламы:', error);
    } finally {
      setIsAdLoading(false);
      isProcessingRef.current = false;
    }
  };

  if (isLoading) {
    return <div>Загрузка SDK...</div>;
  }

  if (roundId < 12) {
    return (
      <button 
        className="refreshButton"
        onClick={handleShowRewardedAd}
        disabled={isAdLoading}
        style={{ 
          cursor: isAdLoading ? 'not-allowed' : 'pointer',
          opacity: isAdLoading ? 0.6 : 1,
          display: 'block', // Добавьте это для вертикального расположения
          margin: '10px auto' // Добавьте это для отступов
        }}
      >
        {isAdLoading ? myText.ads : myText.adsShow}
      </button>
    );
  }

  return null;
};

export default AdButton;
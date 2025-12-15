
import './myPlayField.css';
import Star from '../star/star';
import { useEffect } from 'react';

const MyPlayField = ({ myCardsCount, setMyCardsCount, enemyPlay, setMyCurrentCard, myCurrentCard,
    drawRandomCard, life, setLife, result, setResult, setRoundId, showGameOver,roundId}) => {

    function play(cardType) {
        if (myCardsCount[cardType] > 0 && !showGameOver) {
          console.log(roundId);
            setResult("▪▪▪");
            setRoundId(prev => prev + 1);
            setMyCurrentCard(cardType);
            setMyCardsCount(prev => ({
                ...prev,
                [cardType]: prev[cardType] - 1  // Корректное уменьшение значения

            }));

            enemyPlay();
            drawRandomCard();

        }
    }

    // изменение счетчика количетсва жизней

    useEffect(() => {
        if (result === 'Поражение') {
            setLife(prev => prev - 1);
        }
    }, [result, setLife]);





      // Функция проверки пустых карт
  const isCardEmpty = (cardType) => myCardsCount[cardType] <= 0;

  return (
    <div className='myFieldAll'>
      <div className="cards-container">
        {['rock', 'scissors', 'paper'].map(cardType => (
          <div 
            key={cardType} 
            className={`card-slot ${isCardEmpty(cardType) ? 'empty' : ''}`}
          >
            {!isCardEmpty(cardType) && (
              <>
                <div className="card-counter">
                  {myCardsCount[cardType]}
                </div>
                <button
                  className={`card-button ${cardType}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!showGameOver) play(cardType);
                  }}
                  disabled={showGameOver}
                />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="stars-container">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            filled={star <= life}
            size={40}
            color="#0ff"
          />
        ))}
      </div>
    </div>
  );
}

export default MyPlayField;
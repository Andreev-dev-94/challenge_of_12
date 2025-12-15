import paperImg from '../../resources/img/paper.png';
import rockImg from '../../resources/img/rock.png';
import scissorsImg from '../../resources/img/scissors.png';
import './resultField.css';
import { useEffect, useState } from 'react';

const ResultField = ({ roundId, myCurrentCard, currentEnemyCard, result, setResult }) => {
    const [showCards, setShowCards] = useState(false);

    const cardImages = {
        paper: paperImg,
        rock: rockImg,
        scissors: scissorsImg
    };

    const resultRound = {
        victory: 'Победа',
        draw: 'Ничья',
        defeat: 'Поражение',
        start: 'Выберите карту',
    };

    useEffect(() => {
        // Сбрасываем состояние перед новой анимацией
        setShowCards(false);
        const timer = setTimeout(() => setShowCards(true), 50);
        return () => clearTimeout(timer);
    }, [roundId]);

    useEffect(() => {
        if (!myCurrentCard || myCurrentCard === 'default') {
            setResult(resultRound.start);
            return;
        }
        if (!currentEnemyCard) return;

        const newResult =
            myCurrentCard === currentEnemyCard ? resultRound.draw :
                (myCurrentCard === 'rock' && currentEnemyCard === 'scissors') ||
                    (myCurrentCard === 'scissors' && currentEnemyCard === 'paper') ||
                    (myCurrentCard === 'paper' && currentEnemyCard === 'rock') ? resultRound.victory : resultRound.defeat;

        setResult(newResult);
    }, [myCurrentCard, currentEnemyCard, roundId]);

    return (
        <div className="result-field">
            <div className="play-field-card-cont">
                <div className="card-display enemy">
                    {currentEnemyCard && (
                        <img
                            src={cardImages[currentEnemyCard]}
                            alt=""
                            className={showCards ? 'visible' : 'hidden'}
                        />
                    )}
                </div>

                <div className={`result-text ${result}`}>
                    {result}
                </div>

                <div className="card-display player">
                    {myCurrentCard && myCurrentCard !== 'default' && (
                        <img
                            src={cardImages[myCurrentCard]}
                            alt=""
                            className={showCards ? 'visible' : 'hidden'}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultField;
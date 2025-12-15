import './buySaleBar.css';
import { useEffect } from 'react';

function BuySaleBar({ myScore, setMyScore, result, setResult, bonus, setBonus, life, setLife, showGameOver }) {
    const getLifePrice = () => {
        return myScore <= 10000 ? 5000 : Math.floor(myScore / 2);
    };

    const lifePrice = getLifePrice();

    useEffect(() => {
        if (result === 'Победа' && !showGameOver) {
            setBonus(prev => {
                const newBonus = prev * 2;
                setMyScore(prevScore => prevScore + 1000 * prev);
                return newBonus;
            });
        } else if (result === 'Поражение') {
            setBonus(prev => Math.max(prev / 2, 1));
        }
    }, [result]);

    const sellLife = () => {
        setLife(prev => prev - 1);
        setMyScore(prev => prev + bonus * 1000);
        setBonus(prev => Math.max(prev / 2, 1));
    };

    const buyLife = () => {
        if (myScore >= lifePrice && life < 3) {
            setMyScore(prev => prev - lifePrice);
            setLife(prev => prev + 1);
            setBonus(prev => Math.max(prev / 2, 1));
        }
    };

    return (
        <div className='buy-sale-container'>

            <div className="disp-cont">
                <div className="score-display-bar">
                    <div className="name-text-bar-cont">
                        <span className="name-text-bar">Счет</span>
                    </div>
                    <div className="value-text-bar-cont">
                        <span className="value-text-bar">{myScore.toLocaleString('ru-RU')}</span>
                    </div>
                </div>

                <div className="score-display-bar">
                    <div className="name-text-bar-cont-x">
                        <span className="name-text-bar">Множитель</span>
                    </div>
                    <div className="value-text-bar-cont-x">
                        <span className="value-text-bar">{bonus}</span>
                    </div>

                </div>
            </div>

            <div className="button-bar-cont">

                <div className="tooltip-container">
                    <button
                        onClick={buyLife}
                        disabled={life >= 3 || myScore < lifePrice}
                        className="neon-button buy-button"
                    /*  title={
                         life >= 3
                             ? "Максимальное количество жизней (3)"
                             : myScore < lifePrice
                                 ? `Не хватает очков (нужно ${lifePrice})`
                                 : `Купить 1 жизнь за ${lifePrice} очков`
                     } */
                    >
                        Купить за {lifePrice.toLocaleString('ru-RU')}
                    </button>
                    <span className="tooltip-text">{
                         life >= 3
                             ? "Максимальное количество жизней (3)"
                             : myScore < lifePrice
                                 ? `Не хватает очков (нужно ${lifePrice.toLocaleString('ru-RU')})`
                                 : `Купить 1 жизнь за ${lifePrice.toLocaleString('ru-RU')} очков`
                     }</span>
                </div>

                <div className="tooltip-container">
                    <button
                        onClick={sellLife}
                        disabled={life <= 1}
                        className="neon-button sell-button"
                        title={life <= 1 ? "Нельзя продать последнюю жизнь" : `Продать 1 жизнь за ${(bonus * 1000)} очков`}
                    >
                        Продать за {(bonus * 1000).toLocaleString('ru-RU')}
                    </button>
                    <span className="tooltip-text">{life <= 1 ? "Нельзя продать последнюю жизнь" : `Продать 1 жизнь за ${(bonus * 1000).toLocaleString('ru-RU')} очков`}</span>
                </div>
            </div>


        </div>


    );
}

export default BuySaleBar;
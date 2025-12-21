import './buySaleBar.css';
import { useEffect } from 'react';

function BuySaleBar({ myScore, setMyScore, result, setResult, bonus, setBonus, life, setLife, showGameOver, myText}) {
    const getLifePrice = () => {
        return myScore <= 10000 ? 5000 : Math.floor(myScore / 2);
    };

    const lifePrice = getLifePrice();

    useEffect(() => {
        if (result === myText.resultFIeldVictory && !showGameOver) {
            setBonus(prev => {
                const newBonus = prev * 2;
                setMyScore(prevScore => prevScore + 1000 * prev);
                return newBonus;
            });
        } else if (result === myText.resultFIeldDefeat) {
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
                        <span className="name-text-bar">{myText.barScore}</span>
                    </div>
                    <div className="value-text-bar-cont">
                        <span className="value-text-bar">{myScore.toLocaleString('ru-RU')}</span>
                    </div>
                </div>

                <div className="score-display-bar">
                    <div className="name-text-bar-cont-x">
                        <span className="name-text-bar">{myText.barMultiplier}</span>
                    </div>
                    <div className="value-text-bar-cont-x">
                        <span className="value-text-bar">{bonus}</span>
                    </div>

                </div>
            </div>

            <div className="button-bar-cont">

    {/* Кнопка покупки */}
    <div className="tooltip-container">
        <button
            onClick={buyLife}
            disabled={life >= 3 || myScore < lifePrice}
            className="neon-button buy-button"
        >
            {myText.buyButtonText(lifePrice.toLocaleString(myText.currencyLocale))}
        </button>
        <span className="tooltip-text">
            {life >= 3
                ? myText.buyTooltipMax
                : myScore < lifePrice
                    ? myText.buyTooltipNoMoney(lifePrice.toLocaleString(myText.currencyLocale))
                    : myText.buyTooltipAvailable(lifePrice.toLocaleString(myText.currencyLocale))
            }
        </span>
    </div>

    {/* Кнопка продажи */}
    <div className="tooltip-container">
        <button
            onClick={sellLife}
            disabled={life <= 1}
            className="neon-button sell-button"
            title={life <= 1 
                ? myText.sellTooltipLastLife 
                : myText.sellTooltipAvailable((bonus * 1000).toLocaleString(myText.currencyLocale))
            }
        >
            {myText.sellButtonText((bonus * 1000).toLocaleString(myText.currencyLocale))}
        </button>
        <span className="tooltip-text">
            {life <= 1
                ? myText.sellTooltipLastLife
                : myText.sellTooltipAvailable((bonus * 1000).toLocaleString(myText.currencyLocale))
            }
        </span>
    </div>
</div>


        </div>


    );
}

export default BuySaleBar;
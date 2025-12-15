import './cardCollection.css';
import rockImg from '../../resources/img/rock.png';
import scissorsImg from '../../resources/img/scissors.png';
import paperImg from '../../resources/img/paper.png';

const PlayedCardsCollection = ({ playedCards }) => {
    const cardImages = {
        rock: rockImg,
        scissors: scissorsImg,
        paper: paperImg
    };

    // Функция для создания строки карт
    const renderRow = (type) => {
        // Фильтруем карты по типу и берем последние 8
        const cards = playedCards
            .filter(card => card.type === type)
            .slice(-8);

        // Создаем элементы карт
        const cardElements = cards.map((card, index) => (
            <div
                key={`${type}-${card.roundId}-${card.isPlayer ? 'p' : 'e'}`}
                className={`played-card ${card.isPlayer ? 'player' : 'enemy'}`}
            >
                <img src={cardImages[type]} alt={type} />
            </div>
        ));

        // Добавляем пустые ячейки
        while (cardElements.length < 8) {
            cardElements.push(
                <div
                    key={`empty-${type}-${cardElements.length}`}
                    className="empty-card-collection"
                />
            );
        }

        return cardElements;
    };

    return (
        <div className="played-cards-main">
            <div className="played-cards-container"> 
                <div className="played-cards-row">
                    {renderRow('rock')}
                </div>
                <div className="played-cards-row">
                    {renderRow('scissors')}
                </div>
                <div className="played-cards-row">
                    {renderRow('paper')}
                </div>
            </div>
        </div>
    );
};

export default PlayedCardsCollection;


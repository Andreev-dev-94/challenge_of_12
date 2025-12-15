import useArray from '../../hooks/useArray';
import enemyCard from '../../resources/img/enemyCard.png'
import empty from '../../resources/img/neon3.png'
import { useEffect, useState } from 'react';

const ArrayEnemyCard = () => {

    const defaultArr = [enemyCard, enemyCard, enemyCard, enemyCard,
        enemyCard, enemyCard, enemyCard, enemyCard,
        enemyCard, enemyCard, enemyCard, enemyCard
    ]

    const { array, set, update } = useArray(defaultArr);


    const reloadEnemyCards = () => {
        set(defaultArr);
    }

    const enemyPlay = () => {
        const modArray = array.map((img, value) => (img !== empty ? value : -1))
            .filter(img => img !== -1);
        if (modArray.length > 0) {
            const randomIndex = modArray[Math.floor(Math.random() * modArray.length)];
            update(randomIndex, empty);
        }
    }

    // Функция для перемешивания массива (Fisher-Yates shuffle)
    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Создаем колоду из 12 карт (по 4 каждого типа)
    const createArr = () => {
        const types = ['paper', 'rock', 'scissors'];
        let deck = [];
        types.forEach(type => {
            for (let i = 0; i < 4; i++) {
                deck.push(type);
            }
        });
        return shuffleArray(deck);
    };

    const createDeck = createArr();



    const [deck, setDeck] = useState([]);
    const [currentEnemyCard, setCurrentEnemyCard] = useState(null);

    // Инициализация колоды при монтировании
    useEffect(() => {
        setDeck(createDeck);
    }, []);


    // Функция для выбора случайной карты
    const drawRandomCard = () => {


        // Берем первую карту из перемешанной колоды
        const newCard = deck[0];

        // Обновляем состояния
        setCurrentEnemyCard(newCard);
        setDeck(prev => prev.slice(1));
        /* console.log(deck); */

        if (deck.length === 0) {
            alert('Все карты закончились!');
            return;
        }
    };






    return {
        reloadEnemyCards,
        enemyPlay,
        array,
        createDeck,
        currentEnemyCard,
        setCurrentEnemyCard,
        drawRandomCard, 
        setDeck
    }
}


export default ArrayEnemyCard;
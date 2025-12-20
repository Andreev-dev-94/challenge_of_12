import './gamePage.css';
import EnemyPlayField from '../enemyPlayField/enemyPlayField';
import { useState, useEffect } from 'react';
import MyPlayField from '../myPlayField/myPlayField';
import ScoreBar from '../scoreBar/scoreBar';
import ArrayEnemyCard from '../arrayEnemyCards/arrayEnemyCards';
import ReloadButton from '../reloadButton/reloadButton';
import ResultField from '../resultField/resultField';
import BuySaleBar from '../buySaleBar/buySaleBar';
import PlayedCardsCollection from '../cardCollection/cardCollection';
import InfoButton from '../infoButton/infoButton';
import AdButton from '../adModalButton/adButton';
import AdMainButton from '../adMainButton/adMainButton';
import useYandexSDK from '../../hooks/useYandexSDK';
import LeaderboardButton from '../leaderboardButton/leaderboardButton';
import LeaderboardModal from '../leaderboardModal/LeaderboardModal';
import useGameRecords from '../../hooks/useGameRecords';


const GAME_TEXTS = {
    ru: {
        welcomeTitle: 'Добро пожаловать в игру!',
        welcomeHello: 'Привет, ',
        welcomeReady: 'Готовы к увлекательному испытанию?',
        featureFight: 'Сражайтесь с противником',
        featureLives: 'Управляйте своими жизнями',
        featureAd: 'Получайте бонусы за рекламу',
        startButton: 'Начать игру',
        victory: 'Победа!',
        defeat: 'Поражение',
        points: 'Очков: ',
        tryAgain: 'Попробуйте еще раз!',
        newRecord: '🎉 Новый рекорд!',
        yourRank: 'Ваше место в таблице: #',
        currentRecord: 'Текущий рекорд: ',
        currentRecordPoints: 'очков',
        toBeatRecord: 'Чтобы побить рекорд, нужно больше',
        newGameButton: 'Новая игра',
        loading: 'Игра загружается...',
        ads: 'Реклама...',
        close: 'Закрыть',

        scoreBarRecord: 'Рекорд: ',

        reloadButton: 'Новая игра',

        infoButton: 'Помощь',

        rules: 'Правила игры "12 Challenge"',
        rulesTitle: '⚡ Основные правила',
        rulesList: [
            'Классическая игра <strong>"Камень-Ножницы-Бумага"</strong> с элементами выживания',
            'Игра продолжается максимум <strong>12 раундов</strong>',
            'Раунд начинается в момент выбора игроком карты, которую он хочет разыграть',
            'Всего на игру выдается <strong>12 карт</strong> (по 4 карты каждого вида)',
            'В начале игры у игрока <strong>3 жизни</strong> (звезды)',
            'Поражение в раунде = потеря 1 жизни',
            'Ноль жизней = конец игры'
        ],
        goalTitle: '🎯 Цель игры',
        goalText: 'Продержаться 12 раундов, сохранив хотя бы 1 жизнь, и набрать при этом максимально возможное количество баллов.',
        pointsTitle: '💰 Система баллов',
        pointsList: [
            'За победу в раунде начисляется <strong>1000 баллов</strong>, а также увеличивается <strong>множитель</strong>',
            '<strong>Динамический множитель</strong>: увеличивается и уменьшается в зависимости от действий игрока',
            '<strong>1000 баллов</strong>, начисленные за победу, <strong>умножаются на текущий множитель</strong>',
            '<strong>Стратегия</strong>: для достижения максимального счета важна серия побед'
        ],
        resourcesTitle: '🛠️ Управление ресурсами',
        resourcesList: [
            '<strong>Доступна покупка и продажа жизней</strong> во время игры',
            '<strong>Динамические цены</strong>: зависят от текущего счета',
            '<strong>Коллекция отыгранных карт</strong>: для наглядного анализа хода игры и дальнейшего планирования',
            'Если победа в игре неминуема, а у вас остались лишние звезды - продайте их до розыгрыша последнего раунда по хорошей цене'
        ],
        secretTitle: '💡 Секрет победы',
        secretText: 'Никто еще не выиграл 12 раундов подряд! Ключ к успеху — баланс между агрессией и сохранением жизней.',
        challengeText: '<strong>Ваша задача:</strong> выжить и побить рекорд! 🏆',

    },
    en: {
        welcomeTitle: 'Welcome to the game!',
        welcomeHello: 'Hello, ',
        welcomeReady: 'Ready for an exciting challenge?',
        featureFight: 'Fight the opponent',
        featureLives: 'Manage your lives',
        featureAd: 'Get bonuses for ads',
        startButton: 'Start Game',
        victory: 'Victory!',
        defeat: 'Defeat',
        points: 'Points: ',
        tryAgain: 'Try again!',
        newRecord: '🎉 New record!',
        yourRank: 'Your leaderboard rank: #',
        currentRecord: 'Current record: ',
        currentRecordPoints: 'points',
        toBeatRecord: 'To beat the record you need more than',
        newGameButton: 'New Game',
        loading: 'Game is loading...',
        ads: 'Ad is loading...',
        close: 'Close',

        scoreBarRecord: 'Record: ',

        reloadButton: 'Restart',

        infoButton: 'Info',

        rules: 'The rules of the game "12 Challenge"',
        rulesTitle: '⚡ Main Rules',
        rulesList: [
            'Classic <strong>"Rock-Paper-Scissors"</strong> game with survival elements',
            'The game lasts a maximum of <strong>12 rounds</strong>',
            'A round begins when the player chooses a card to play',
            'A total of <strong>12 cards</strong> are dealt for the game (4 of each type)',
            'At the start of the game, the player has <strong>3 lives</strong> (stars)',
            'Losing a round = losing 1 life',
            'Zero lives = game over'
        ],
        goalTitle: '🎯 Game Goal',
        goalText: 'Survive 12 rounds while keeping at least 1 life, and score the highest possible number of points.',
        pointsTitle: '💰 Points System',
        pointsList: [
            'Winning a round awards <strong>1000 points</strong> and increases the <strong>multiplier</strong>',
            '<strong>Dynamic multiplier</strong>: increases and decreases depending on player actions',
            'The <strong>1000 points</strong> awarded for a win are <strong>multiplied by the current multiplier</strong>',
            '<strong>Strategy</strong>: achieving a high score requires a winning streak'
        ],
        resourcesTitle: '🛠️ Resource Management',
        resourcesList: [
            '<strong>Lives can be bought and sold</strong> during the game',
            '<strong>Dynamic prices</strong>: depend on the current score',
            '<strong>Collection of played cards</strong>: for visual analysis of the game progress and further planning',
            'If victory is inevitable and you have extra stars left - sell them before playing the final round at a good price'
        ],
        secretTitle: '💡 Secret to Victory',
        secretText: 'No one has won 12 rounds in a row yet! The key to success is balancing aggression with life preservation.',
        challengeText: '<strong>Your challenge:</strong> survive and beat the record! 🏆',
    }
};



const GamePage = () => {
    const { ysdk, isLoading: sdkLoading, playerName, isReady, lang } = useYandexSDK();
    const myText = GAME_TEXTS[lang];

    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    const { reloadEnemyCards, array, enemyPlay, createDeck, currentEnemyCard,
        setCurrentEnemyCard, drawRandomCard, setDeck } = ArrayEnemyCard();

    // Используем хук рекордов
    const {
        highScore,
        updateHighScore,
        resetHighScore,
        getLeaderboardData,
        leaderboardData,
        playerRank,
        loadLeaderboardData
    } = useGameRecords();

    const MyInitialCards = {
        rock: 4,
        scissors: 4,
        paper: 4
    };

    const [myCardsCount, setMyCardsCount] = useState(MyInitialCards);
    const [myCurrentCard, setMyCurrentCard] = useState('default');
    const [result, setResult] = useState();
    const [life, setLife] = useState(3);
    const [myScore, setMyScore] = useState(0);
    const [bonus, setBonus] = useState(1);
    const [roundId, setRoundId] = useState(0);
    const [gameStatus, setGameStatus] = useState(null);
    const [showGameOver, setShowGameOver] = useState(false);
    const [playedCards, setPlayedCards] = useState([]);
    const [isAdUsed, setIsAdUsed] = useState(false);
    const [isAdBlocking, setIsAdBlocking] = useState(false);
    const [newRecordRank, setNewRecordRank] = useState(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [minLoadingPassed, setMinLoadingPassed] = useState(false);

    // Эффект для показа приветственного модального окна
    useEffect(() => {
        // Показываем окно, когда игра готова (isReady) и не в состоянии "Game Over"
        if (isReady && !showGameOver) {
            const timer = setTimeout(() => {
                setShowWelcomeModal(true);
            }, 500); // Небольшая задержка в 500мс для плавности
            return () => clearTimeout(timer);
        }
    }, [isReady, showGameOver]); // Эффект зависит от готовности и статуса игры

    // Обработка окончания игры и обновление рекорда
    useEffect(() => {
        if (gameStatus === 'won' && myScore > 0) {
            console.log(`🎮 Game won with score: ${myScore}, current high: ${highScore}`);

            if (myScore > highScore) {
                const updateRecord = async () => {
                    const result = await updateHighScore(myScore);
                    if (result.isNewRecord) {
                        setNewRecordRank(result.rank);
                        console.log(`🎉 New record! Rank: ${result.rank}`);
                    }
                };
                updateRecord();
            }
        }
    }, [gameStatus, myScore, highScore, updateHighScore]);

    // Проверка окончания игры
    useEffect(() => {
        const gameFinished = life <= 0 ||
            (myCardsCount.rock === 0 &&
                myCardsCount.paper === 0 &&
                myCardsCount.scissors === 0);

        if (gameFinished) {
            const timer = setTimeout(() => {
                setGameStatus(life <= 0 ? 'lost' : 'won');
                setShowGameOver(true);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [life, myCardsCount]);

    // Добавление сыгранных карт
    useEffect(() => {
        if (myCurrentCard !== 'default' && currentEnemyCard) {
            setPlayedCards(prev => [
                ...prev,
                {
                    type: myCurrentCard,
                    isPlayer: true,
                    roundId: roundId
                },
                {
                    type: currentEnemyCard,
                    isPlayer: false,
                    roundId: roundId
                }
            ]);
        }
    }, [myCurrentCard, currentEnemyCard, roundId]);

    const resetMyCards = () => {
        setMyCardsCount(MyInitialCards);
        setMyCurrentCard('default');
        setDeck(createDeck);
        setCurrentEnemyCard('default');
        setLife(3);
        setMyScore(0);
        setBonus(1);
        setPlayedCards([]);
    };

    const resetGame = () => {
        resetMyCards();
        reloadEnemyCards();
        setGameStatus(null);
        setShowGameOver(false);
        setLife(3);
        setMyScore(0);
        setBonus(1);
        setRoundId(0);
        setResult(null);
        setMyCurrentCard('default');
        setCurrentEnemyCard('default');
        setPlayedCards([]);
        setIsAdUsed(false);
        setNewRecordRank(null);
    };

    const handleStartGame = () => {
        setShowWelcomeModal(false);
    };

    // Функции для лидерборда
    const handleOpenLeaderboard = async () => {
        await getLeaderboardData();
        setShowLeaderboard(true);
    };

    const handleCloseLeaderboard = () => {
        setShowLeaderboard(false);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setMinLoadingPassed(true);
        }, 3000); // 3000 мс = 3 секунды
        return () => clearTimeout(timer); // Очистка при размонтировании
    }, []);

    // Показываем лоадер, если SDK не готов ИЛИ не прошло 3 секунды
    if (!isReady || !minLoadingPassed) {
        return (
            <div className="fullscreen-loader">
                <div className="loader-spinner"></div>
                <p>{myText.loading}</p>
            </div>
        );
    }

    return (
        <div className="game-container">
            {/* Блокирующий оверлей для рекламы */}
            {isAdBlocking && (
                <div className="ad-blocking-overlay">
                    <div className="ad-blocking-message">
                        <div className="ad-spinner"></div>
                        <p>{myText.ads}</p>
                    </div>
                </div>
            )}

            {/* Приветственное модальное окно */}
            {showWelcomeModal && (
                <div className="modal-overlay">
                    <div className="modal welcome-modal">
                        <div className="modalContent">
                            <h2>{myText.welcomeTitle}</h2>
                            <div className="modalText">
                                <p>{myText.welcomeHello} <span className="player-name">{playerName}</span>! 🎮</p>
                                <p>{myText.welcomeReady}</p>
                                <div className="welcome-features">
                                    <div className="feature-item">
                                        <span className="feature-icon">⚔️</span>
                                        <span>{myText.featureFight}</span>
                                    </div>
                                    <div className="feature-item">
                                        <span className="feature-icon">💖</span>
                                        <span>{myText.featureLives}</span>
                                    </div>
                                    <div className="feature-item">
                                        <span className="feature-icon">🎬</span>
                                        <span>{myText.featureAd}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="refreshButton start-game-btn" onClick={handleStartGame}>
                                {myText.startButton}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно лидерборда */}
            {showLeaderboard && (
                <LeaderboardModal
                    onClose={handleCloseLeaderboard}
                    leaderboardData={leaderboardData}
                    playerName={playerName}
                    playerRank={playerRank}
                    resetHighScore={resetHighScore}
                    loadLeaderboardData={loadLeaderboardData}
                />
            )}

            {/* Модальное окно окончания игры */}
            {showGameOver && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modalContent">
                            <h2>{gameStatus === 'won' ? myText.victory : myText.defeat}</h2>
                            <div className="modalText">
                                <p>{gameStatus === 'won' ? `${myText.points} ${myScore.toLocaleString()}` : myText.tryAgain}</p>

                                {/* Отображение нового рекорда */}
                                {gameStatus === 'won' && myScore >= highScore && (
                                    <div className="new-record-info">
                                        <p>{myText.newRecord}</p>
                                        <p>{myText.yourRank} <span className="record-rank">#{newRecordRank}</span></p>
                                        <p>{`${myText.currentRecord} ${myScore.toLocaleString()} ${myText.currentRecordPoints}`}</p>
                                    </div>
                                )}

                                {/* Отображение текущего рекорда если не побит */}
                                {gameStatus === 'won' && (!newRecordRank || myScore <= highScore) && (
                                    <div className="standard-win-info">
                                        <p>{`${myText.currentRecord} ${highScore.toLocaleString()} ${myText.currentRecordPoints}`}</p>
                                        {myScore < highScore && (
                                            <p>{`${myText.toBeatRecord} ${highScore.toLocaleString()} ${myText.currentRecordPoints}`}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <AdButton
                                setShowGameOver={setShowGameOver}
                                setLife={setLife}
                                roundId={roundId}
                            />
                            <button className="refreshButton" onClick={resetGame}>
                                {myText.newGameButton}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Игровые компоненты */}
            <EnemyPlayField arr={array} />

            <ScoreBar
                gameStatus={gameStatus}
                myScore={myScore}
                highScore={highScore}
                myText={myText}
            />

            <MyPlayField
                enemyPlay={enemyPlay}
                myCardsCount={myCardsCount}
                setMyCardsCount={setMyCardsCount}
                setMyCurrentCard={setMyCurrentCard}
                myCurrentCard={myCurrentCard}
                drawRandomCard={drawRandomCard}
                life={life}
                setLife={setLife}
                result={result}
                setResult={setResult}
                setRoundId={setRoundId}
                showGameOver={showGameOver}
                roundId={roundId}
            />

            <ReloadButton 
            myText={myText}
            resetGame={resetGame} />

            <InfoButton 
            myText={myText}/>

            <ResultField
                myCurrentCard={myCurrentCard}
                setMyCurrentCard={setMyCurrentCard}
                createDeck={createDeck}
                currentEnemyCard={currentEnemyCard}
                setCurrentEnemyCard={setCurrentEnemyCard}
                drawRandomCard={drawRandomCard}
                result={result}
                setResult={setResult}
                roundId={roundId}
            />

            <BuySaleBar
                myScore={myScore}
                setMyScore={setMyScore}
                result={result}
                setResult={setResult}
                bonus={bonus}
                setBonus={setBonus}
                life={life}
                setLife={setLife}
                showGameOver={showGameOver}
            />

            <PlayedCardsCollection playedCards={playedCards} />

            <AdMainButton
                life={life}
                setLife={setLife}
                isAdUsed={isAdUsed}
                setIsAdUsed={setIsAdUsed}
                setIsAdBlocking={setIsAdBlocking}
            />

            <LeaderboardButton onShowLeaderboard={handleOpenLeaderboard} />
        </div>
    )
}

export default GamePage;
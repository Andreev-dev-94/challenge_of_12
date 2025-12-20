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

        scoreBarRecord: 'Рекорд: ',
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

        scoreBarRecord: 'Record: ',
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

            <ReloadButton resetGame={resetGame} />

            <InfoButton />

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
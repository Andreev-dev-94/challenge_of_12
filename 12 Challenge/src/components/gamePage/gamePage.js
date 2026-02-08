import './gamePage.css';
import EnemyPlayField from '../enemyPlayField/enemyPlayField';
import { useState, useEffect, useRef } from 'react';
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
import { GAME_TEXTS } from '../locales/gameTexts';

const GamePage = () => {
    const { 
        ysdk, 
        isLoading: sdkLoading, 
        playerName, 
        isReady, 
        lang,
        sdkInitialized,
        notifyGameReady 
    } = useYandexSDK();
    
    const myText = GAME_TEXTS[lang] || GAME_TEXTS['ru'];
    
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [gameFullyReady, setGameFullyReady] = useState(false); // Новый флаг: игра реально готова
    const hasShownWelcomeRef = useRef(false);
    const [assetsLoaded, setAssetsLoaded] = useState(false); // Флаг загрузки ресурсов

    const { reloadEnemyCards, array, enemyPlay, createDeck, currentEnemyCard,
        setCurrentEnemyCard, drawRandomCard, setDeck } = ArrayEnemyCard();

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

    // 🔧 ЗАГРУЗКА РЕСУРСОВ (изображений, анимаций и т.д.)
    useEffect(() => {
        const loadGameAssets = async () => {
            console.log('🔄 Начало загрузки ресурсов игры...');
            
            // Здесь можно загружать изображения, звуки и другие ресурсы
            const imagesToPreload = [
                // Добавьте пути к вашим изображениям
                // '/images/cards/rock.png',
                // '/images/cards/paper.png',
                // '/images/cards/scissors.png',
            ];
            
            try {
                const imagePromises = imagesToPreload.map(url => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.src = url;
                        img.onload = resolve;
                        img.onerror = resolve; // Продолжаем даже при ошибке
                    });
                });
                
                await Promise.all(imagePromises);
                console.log('✅ Все ресурсы игры загружены');
                setAssetsLoaded(true);
            } catch (error) {
                console.warn('⚠️ Ошибка при загрузке ресурсов:', error);
                setAssetsLoaded(true); // Все равно продолжаем
            }
        };
        
        loadGameAssets();
    }, []);

    // 🔧 КЛЮЧЕВОЙ useEffect: определяем, когда игра реально готова
    useEffect(() => {
        // Условия готовности игры:
        // 1. SDK инициализирован
        // 2. Все ресурсы загружены (или загрузка пропущена)
        // 3. SDK еще не сообщил о готовности (isReady === false)
        // 4. Нет ошибок загрузки SDK
        if (sdkInitialized && assetsLoaded && !isReady && !sdkLoading) {
            console.log('🎮 Игра реально готова к взаимодействию!');
            console.log('- SDK инициализирован:', sdkInitialized);
            console.log('- Ресурсы загружены:', assetsLoaded);
            console.log('- SDK ready() еще не вызывался:', !isReady);
            
            // Устанавливаем флаг, что игра готова для нашего UI
            setGameFullyReady(true);
            
            // 🔥 ВАЖНО: Теперь вызываем GameReady API - когда игра ДЕЙСТВИТЕЛЬНО готова
            const callGameReady = async () => {
                try {
                    const success = await notifyGameReady();
                    if (success) {
                        console.log('✅ GameReady API вызван КОРРЕКТНО в момент, когда игра доступна для взаимодействия');
                    } else {
                        console.warn('⚠️ GameReady API не удалось вызвать');
                    }
                } catch (error) {
                    console.error('❌ Ошибка при вызове GameReady API:', error);
                }
            };
            
            // Небольшая задержка для гарантии, что UI успел обновиться
            const timer = setTimeout(() => {
                callGameReady();
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [sdkInitialized, assetsLoaded, isReady, sdkLoading, notifyGameReady]);

    // 🔧 Показ приветственного модального окна (только после готовности игры)
    useEffect(() => {
        // Показываем приветствие только когда:
        // 1. Игра полностью готова (gameFullyReady)
        // 2. Не в состоянии GameOver
        // 3. Еще не показывали в этой сессии
        if (gameFullyReady && !showGameOver && !hasShownWelcomeRef.current) {
            const timer = setTimeout(() => {
                setShowWelcomeModal(true);
                hasShownWelcomeRef.current = true;
                console.log('👋 Приветственная модалка показана (игра готова)');
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, [gameFullyReady, showGameOver]);

    useEffect(() => {
        // Функция для блокировки нежелательных событий
        const blockUnwantedEvents = (e) => {
            // Блокируем контекстное меню только на игровом поле
            if (e.target.closest('.game-container')) {
                e.preventDefault();
            }
        };
    
        // Добавляем обработчик на весь документ
        document.addEventListener('contextmenu', blockUnwantedEvents);
        
        // Очистка при размонтировании
        return () => {
            document.removeEventListener('contextmenu', blockUnwantedEvents);
        };
    }, []);

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
        setShowWelcomeModal(false);
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

    // 🔧 ОТОБРАЖЕНИЕ ЛОАДЕРА ПОКА ИГРА НЕ ГОТОВА
    // Показываем лоадер до тех пор, пока игра не станет реально готовой
    if (!gameFullyReady || sdkLoading) {
        return (
            <div className="fullscreen-loader">
                <div className="loader-spinner"></div>
                <p>{myText.loading}</p>
                <div style={{ 
                    marginTop: '20px', 
                    fontSize: '14px', 
                    color: '#888' 
                }}>
                    Загрузка игры...
                    <div style={{ 
                        marginTop: '10px',
                        fontSize: '12px' 
                    }}>
                        {!sdkInitialized && 'Инициализация платформы...'}
                        {sdkInitialized && !assetsLoaded && 'Загрузка ресурсов...'}
                        {sdkInitialized && assetsLoaded && 'Подготовка игрового поля...'}
                    </div>
                </div>
            </div>
        );
    }

    // 🔧 ИГРА РЕАЛЬНО ГОТОВА - отображаем основной интерфейс
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
                    myText={myText}
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
                            
                            {/* Кнопка рекламы для продолжения игры (только при проигрыше) */}
                            {gameStatus === 'lost' && (
                                <AdButton
                                    setShowGameOver={setShowGameOver}
                                    setLife={setLife}
                                    roundId={roundId}
                                    myText={myText}
                                />
                            )}
                            
                            <button className="refreshButton" onClick={resetGame} style={{ cursor: 'pointer' }}>
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
                myText={myText}
            />

            <ReloadButton 
                myText={myText}
                resetGame={resetGame} 
            />

            <InfoButton 
                myText={myText}
            />

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
                myText={myText}
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
                myText={myText}
            />

            <PlayedCardsCollection playedCards={playedCards} />

            <AdMainButton
                life={life}
                setLife={setLife}
                isAdUsed={isAdUsed}
                setIsAdUsed={setIsAdUsed}
                setIsAdBlocking={setIsAdBlocking}
                myText={myText}
            />

            <LeaderboardButton 
                onShowLeaderboard={handleOpenLeaderboard} 
                myText={myText}
            />
        </div>
    )
}

export default GamePage;
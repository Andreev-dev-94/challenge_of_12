import './scoreBar.css';
import { useEffect, useState } from 'react';

function ScoreBar({ gameStatus, myScore, highScore }) {
    const [isNewRecord, setIsNewRecord] = useState(false);

    // Анимация при новом рекорде
    useEffect(() => {
        if (gameStatus === 'won' && myScore > highScore) {
            setIsNewRecord(true);
            const timer = setTimeout(() => setIsNewRecord(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [gameStatus, myScore, highScore]);

    return (
        <div className='score-bar-main'>
            <div className='score-bar-container'>
                <div className={`score-display ${isNewRecord ? 'record-pulse' : ''}`}>
                    <span className="score-label">Рекорд:</span>
                    <span className="score-value">{highScore.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}

export default ScoreBar;
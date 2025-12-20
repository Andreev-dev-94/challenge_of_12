import './infoButton.css';
import { useState } from 'react';

function InfoButton({ myText }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <div className='info_butt_cont'>
        <button className="neon-info-btn" onClick={toggleModal}>
          <span className="neon-info-icon">ℹ</span>
          <span className="neon-info-text">{myText.infoButton}</span>
          <span className="neon-info-glow"></span>
        </button>
      </div>

      {isModalOpen && (
        <div className="info-modal-overlay">
          <div className="info-modal">
            <div className="info-modal-content">
              <h2>{myText.rules}</h2>

              <div className="rules-section">
                <h3>{myText.rulesTitle}</h3>
                <ul>
                    {myText.rulesList.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ul>
            </div>
            
            <div className="rules-section">
                <h3>{myText.goalTitle}</h3>
                <p>{myText.goalText}</p>
            </div>
            
            <div className="rules-section">
                <h3>{myText.pointsTitle}</h3>
                <ul>
                    {myText.pointsList.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ul>
            </div>
            
            <div className="rules-section">
                <h3>{myText.resourcesTitle}</h3>
                <ul>
                    {myText.resourcesList.map((item, index) => (
                        <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ul>
            </div>
            
            <div className="rules-section">
                <h3>{myText.secretTitle}</h3>
                <p>{myText.secretText}</p>
                <p className="final-challenge" dangerouslySetInnerHTML={{ __html: myText.challengeText }} />
            </div>

              <button
                className="neon-close-btn"
                onClick={toggleModal}
              >
                {myText.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InfoButton;
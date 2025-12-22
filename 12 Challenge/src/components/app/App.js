
import './App.css';

import { Fragment, useEffect} from 'react';

import GamePage from '../gamePage/gamePage';



function App() {


    useEffect(() => {
        // Глобальный запрет контекстного меню
        const handleContextMenu = (e) => {
          e.preventDefault();
          return false;
        };
    
        // Ограничение выделения текста
        const handleSelectStart = (e) => {
          const isTextElement = e.target.classList.contains('modalText') || 
                               e.target.classList.contains('rules-text') ||
                               e.target.classList.contains('instruction-text') ||
                               e.target.classList.contains('leaderboard-text');
          
          if (!isTextElement) {
            e.preventDefault();
            return false;
          }
        };
    
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('selectstart', handleSelectStart);
    
        return () => {
          document.removeEventListener('contextmenu', handleContextMenu);
          document.removeEventListener('selectstart', handleSelectStart);
        };
      }, []);

    return (
        <Fragment>

            <GamePage />


        </Fragment>



    );
}

export default App;

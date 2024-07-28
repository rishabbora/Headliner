import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import './components/styles.css';

import InputField from './components/InputField';
import BoxSelector from './components/BoxSelector';

interface Result {
  text: string;
  links: { title: string, url: string }[];
}

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([]);
  const [typedText, setTypedText] = useState<string>('');
  const [timer, setTimer] = useState<number>(30); 
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [hasStartedTyping, setHasStartedTyping] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const [sentences, setSentences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // New loading state
  const [showModal, setShowModal] = useState<boolean>(false); // Modal state
  const [links, setLinks] = useState<{ title: string, url: string }[]>([]); // State for the second element of the array
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null); 

  const boxNames = [
    'Finance',
    'US News',
    'International News',
    'Foreign Policy',
    'Stock Market',
    'Sports',
  ];

  const fetchPythonData = async (selected: string[], input: string) => {
    try {
      console.log('Sending request to backend...');
      setIsLoading(true); // Start loading
      const response = await axios.post('https://headliner-backend.onrender.com/run-python', {
        input,
        selectedBoxes: selected.length === 0 && input.trim() === '' ? ['Random'] : selected
      });
      console.log('Response from backend: ', response.data);
      const results: Result[] = response.data.result.map((output: { box: string; result: any }) => {
        if (Array.isArray(output.result)) {
          const links = output.result[1].map((title: string, index: number) => ({
            title,
            url: output.result[2][index] || '#'
          }));
          return { text: output.result[0]?.trim() || 'Missing result', links };
        }
        return { text: output.result?.trim() || 'Missing result', links: [] };
      });
      const newSentences = results.map(r => r.text).join(' ').trim().split('. ').map((sentence: string) => sentence + '.');
      const newLinks = results.flatMap(r => r.links);
      setSentences(newSentences);
      setLinks(newLinks);
      setTypedText('');
      setIsGameRunning(true);
      setTimer(30);
      setHasStartedTyping(false);
      setIsLoading(false); // End loading
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Error fetching data from Python script:', error);
      setIsLoading(false); // End loading even if there is an error
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const calculateWordsPerMinute = useCallback(() => {
    const correctWordsCount = document.querySelectorAll('.word.correct').length;
    setWordCount(correctWordsCount * 2); // Double the words typed in 30 seconds to get words per minute
    setShowModal(true); // Show modal when game ends
  }, []);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(intervalRef.current!);
          setIsGameRunning(false);
          calculateWordsPerMinute();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const startGame = () => {
    fetchPythonData(selectedBoxes, inputValue);
  };

  const stopGame = () => {
    setIsGameRunning(false);
    setTimer(30);
    setWordCount(0);
    setTypedText('');
    setSentences([]); // Clear the text area
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setShowModal(true); // Trigger the animation
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasStartedTyping) {
      setHasStartedTyping(true);
      startTimer();
    }
    const inputText = e.target.value;
    setTypedText(inputText);
  };

  const renderCharacter = (char: string, typedChar: string, index: number) => {
    const isCorrect = typedChar === char;
    const isIncorrect = typedChar && typedChar !== char;
    return (
      <span key={index} className={`character ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}>
        {char}
      </span>
    );
  };

  const renderWord = (word: string, typedWord: string, wordIndex: number) => {
    const isWordCorrect = word === typedWord;
    return (
      <span key={wordIndex} className={`word ${isWordCorrect ? 'correct' : ''}`}>
        {word.split('').map((char, charIndex) => renderCharacter(char, typedWord[charIndex] || '', charIndex))}
        {' '}
      </span>
    );
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className='App'>
      <span className="heading">Headline Typewriter</span>
      <h3>Welcome to Headliner! This is a typing speed game that makes you type the most recent news articles. 
        By playing this game you not only increase your typing speed but also learn more about the news! Select a category below or
        type in a custom query. Click Start Game to begin!</h3>
      <form className='input' onSubmit={handleSubmit}>
        <InputField inputValue={inputValue} setInputValue={setInputValue} />
      </form>

      <div className="box-section">
        <p className="category-note">Choose a category or it will be randomly chosen!</p>
        <BoxSelector boxNames={boxNames} selectedBoxes={selectedBoxes} setSelectedBoxes={setSelectedBoxes} />
      </div>

      <div className="typing-game">
        <div className="button-container">
          <button className='button' onClick={startGame} disabled={isGameRunning}>
            Start Game
          </button>
          <button className='button' onClick={stopGame} disabled={!isGameRunning}>
            End Game
          </button>
        </div>
        <p className="note">Text may take a few seconds to appear</p>
        <div className="timer">Time left: {timer} seconds</div>
        <div className="typing-area-container">
          <div className="words-to-type">
            {isLoading ? (
              <div className="spinner-container">
                <div className="spinner"></div>
              </div>
            ) : (
              sentences.join(' ').split(' ').map((word, wordIndex) => renderWord(word, typedText.split(' ')[wordIndex] || '', wordIndex))
            )}
          </div>
          <input
            type="text"
            className="typing-area"
            value={typedText}
            onChange={handleTyping}
            disabled={!isGameRunning}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            ref={inputRef}
          />
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Game Over!</h3>
            </div>
            <div className="modal-body">
              <p>Your typing speed is {wordCount} words per minute.</p>
              <h4>Related Links:</h4>
              <ul>
                {links.map((link, index) => (
                  <li key={index}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.title}</a></li>
                ))}
              </ul>
            </div>
            <div className="modal-footer">
              <button className="close-button" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

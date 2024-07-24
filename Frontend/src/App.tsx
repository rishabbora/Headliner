import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import './components/styles.css';

import InputField from './components/InputField';
import BoxSelector from './components/BoxSelector';

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([]);
  const [typedText, setTypedText] = useState<string>('');
  const [timer, setTimer] = useState<number>(30); 
  const [isGameRunning, setIsGameRunning] = useState<boolean>(false);
  const [hasStartedTyping, setHasStartedTyping] = useState<boolean>(false);
  const [wordCount, setWordCount] = useState<number>(0);
  const [sentences, setSentences] = useState<string[]>([]);
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
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/run-python`, {
        input,
        selectedBoxes: selected.length === 0 && input.trim() === '' ? ['Random'] : selected
      });
      console.log('Response from backend:', response.data); // Log the response data
      const results = response.data.result.map((output: { box: string; result: string }) => output.result.trim());
      const newSentences = results.join(' ').trim().split('. ').map((sentence: string) => sentence + '.');
      setSentences(newSentences); // Split sentences by period
      setTypedText(''); // Clear the textarea
      setIsGameRunning(true); // Start the game
      setTimer(30); // Reset the timer to 30 seconds
      setHasStartedTyping(false); // Reset the typing state
      if (inputRef.current) {
        inputRef.current.focus(); // Focus the input element when the game starts
      }
    } catch (error) {
      console.error('Error fetching data from Python script:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const calculateWordsPerMinute = useCallback(() => {
    const correctWordsCount = document.querySelectorAll('.word.correct').length;
    setWordCount(correctWordsCount * 2); // Double the words typed in 30 seconds to get words per minute
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
    fetchPythonData(selectedBoxes, inputValue); // Fetch data and start the game
  };

  const stopGame = () => {
    setIsGameRunning(false);
    setTimer(30); // Reset the timer to 30 seconds
    setWordCount(0);
    setTypedText('');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
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

  useEffect(() => {
    console.log('Sentences updated:', sentences); // Log the updated sentences
  }, [sentences]);

  return (
    <div className='App'>
      <span className="heading">Headline Typewriter</span>

      <form className='input' onSubmit={handleSubmit}>
        <InputField inputValue={inputValue} setInputValue={setInputValue} />
      </form>

      <div className="box-section">
        <p className="category-note">Choose a category or it will be randomly chosen!</p>
        <BoxSelector boxNames={boxNames} selectedBoxes={selectedBoxes} setSelectedBoxes={setSelectedBoxes} />
      </div>

      <div className="typing-game">
        <h2>Typing Speed Game</h2>
        <div className="button-container">
          <button className='button' onClick={startGame} disabled={isGameRunning}>
            Start Game
          </button>
          <button className='button' onClick={stopGame} disabled={!isGameRunning}>
            Stop Game
          </button>
        </div>
        <div className="timer">Time left: {timer} seconds</div>
        <div className="typing-area-container">
          <div className="words-to-type">
            {sentences.join(' ').split(' ').map((word, wordIndex) => renderWord(word, typedText.split(' ')[wordIndex] || '', wordIndex))}
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
        {!isGameRunning && timer === 0 && (
          <div className="results">
            <h3>Game Over!</h3>
            <p>Your typing speed is {wordCount} words per minute.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

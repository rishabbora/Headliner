import React from 'react';
import './styles.css';

interface BoxSelectorProps {
  boxNames: string[];
  selectedBoxes: string[];
  setSelectedBoxes: React.Dispatch<React.SetStateAction<string[]>>;
}

const BoxSelector: React.FC<BoxSelectorProps> = ({ boxNames, selectedBoxes, setSelectedBoxes }) => {
  const handleBoxClick = (boxName: string) => {
    if (selectedBoxes.includes(boxName)) {
      setSelectedBoxes(selectedBoxes.filter(name => name !== boxName));
    } else {
      setSelectedBoxes([...selectedBoxes, boxName]);
    }
  };

  return (
    <div className="box-container">
      {boxNames.map((boxName) => (
        <div
          key={boxName}
          className={`box ${selectedBoxes.includes(boxName) ? 'selected' : ''}`}
          onClick={() => handleBoxClick(boxName)}
        >
          {boxName}
        </div>
      ))}
    </div>
  );
};

export default BoxSelector;
import React from 'react';
import './styles.css';

interface InputFieldProps {
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
}

const InputField: React.FC<InputFieldProps> = ({ inputValue, setInputValue }) => {
  return (
    <input
      type='text'
      placeholder='Enter custom query'
      className='input__box'
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
    />
  );
}

export default InputField;
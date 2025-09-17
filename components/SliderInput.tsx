import React from 'react';

interface SliderInputProps {
  label: string;
  id: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SliderInput: React.FC<SliderInputProps> = ({ label, id, min, max, step, value, unit, onChange }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center space-x-4 mt-1">
        <input
          id={id}
          name={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
        />
        <span className="font-bold text-green-800 dark:text-green-300 text-right w-24">
          {value} {unit}
        </span>
      </div>
    </div>
  );
};

export default SliderInput;
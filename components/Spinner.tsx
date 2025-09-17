
import React from 'react';

interface SpinnerProps {
    message: string;
}

const Spinner: React.FC<SpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-green-600 rounded-full animate-spin"></div>
        <p className="text-green-800 font-medium">{message}</p>
    </div>
  );
};

export default Spinner;

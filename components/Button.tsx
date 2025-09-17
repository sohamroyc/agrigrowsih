
import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  icon?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', icon, ...props }) => {
  const baseClasses = 'px-6 py-3 font-bold rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center space-x-2';
  
  const variantClasses = {
    primary: 'bg-yellow-400 text-green-900 hover:bg-yellow-500 focus:ring-yellow-400',
    secondary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {icon && <i className={`fas ${icon}`}></i>}
      <span>{children}</span>
    </button>
  );
};

export default Button;

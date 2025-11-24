import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    secondary: "bg-green-600 text-white hover:bg-green-700",
    outline: "border-2 border-orange-500 text-orange-600 bg-transparent shadow-sm",
    ghost: "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-none",
    danger: "bg-red-500 text-white"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input 
      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white ${className}`}
      {...props} 
    />
  </div>
);

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => (
  <label className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 mb-2 cursor-pointer hover:bg-gray-50 transition-colors">
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 accent-orange-600" 
    />
    <span className="text-gray-700 font-medium">{label}</span>
  </label>
);

export const Loading: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-orange-50 text-orange-600">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
    <p className="font-bold animate-pulse text-lg">Cargando Nueva Vida...</p>
  </div>
);
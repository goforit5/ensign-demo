import React from 'react';
import { clsx } from 'clsx';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

const baseStyles = 'rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50';

const sizeStyles = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  indeterminate = false,
  size = 'md',
  className,
  id
}: CheckboxProps) {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const checkboxStyles = clsx(
    baseStyles,
    sizeStyles[size],
    className
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  if (label) {
    return (
      <div className="flex items-center">
        <input
          ref={checkboxRef}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={checkboxStyles}
        />
        <label 
          htmlFor={id} 
          className={clsx(
            'ml-2 text-sm text-gray-700 cursor-pointer',
            {
              'cursor-not-allowed opacity-50': disabled,
            }
          )}
        >
          {label}
        </label>
      </div>
    );
  }

  return (
    <input
      ref={checkboxRef}
      id={id}
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      disabled={disabled}
      className={checkboxStyles}
    />
  );
}
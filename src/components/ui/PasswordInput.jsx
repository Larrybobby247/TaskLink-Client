import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Drop-in replacement for <input type="password" className="input-field" .../>
 * with a show/hide eye icon. Accepts the same props (value, onChange,
 * placeholder, required, minLength, etc.) via ...rest.
 */
export default function PasswordInput({ className = '', ...rest }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...rest}
        type={visible ? 'text' : 'password'}
        className={`input-field pr-11 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

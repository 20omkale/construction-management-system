import React from 'react';
import { Loader2 } from 'lucide-react';

const AuthButton = ({ 
    children, 
    onClick, 
    type = "submit", 
    isLoading = false, 
    disabled = false,
    className = "" 
}) => {
    return (
        <button 
            type={type}
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`w-full py-3.5 text-white text-[15px] font-medium rounded-xl transition-all shadow-sm active:scale-[0.99] flex justify-center items-center gap-2
                ${isLoading || disabled ? 'bg-[#0066CC]/70 cursor-not-allowed' : 'bg-[#0066CC] hover:bg-[#0052a3] cursor-pointer hover:shadow-md'}
                ${className}`
            }
        >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {children}
        </button>
    );
};

export default AuthButton;
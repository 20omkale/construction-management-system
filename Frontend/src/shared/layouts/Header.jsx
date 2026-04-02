import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate(); // <-- This is the crucial fix

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex justify-between items-center">
      <div className="font-bold text-xl text-[#0f62fe]">SampleWeb ERP</div>
      
      <div className="flex items-center gap-4">
        {/* The Navigation Button */}
        <button 
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-[#0f62fe] hover:bg-[#0f62fe] hover:text-white rounded-lg transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          Inventory Module
        </button>

        {/* Dummy User Profile */}
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
          A
        </div>
      </div>
    </header>
  );
};

export default Header;
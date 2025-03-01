import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = '#3b82f6', text = 'Loading...' }) => {
  // Size variants
  const sizeMap = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };
  
  const spinnerSize = sizeMap[size] || sizeMap.medium;
  
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className={`${spinnerSize} rounded-full border-t-transparent animate-spin`} 
        style={{ borderColor: `${color} transparent transparent transparent` }}>
      </div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

// Page wrapper that shows spinner during page transitions
const LoadingWrapper = ({ isLoading, children }) => {
  return isLoading ? (
    <div className="fixed inset-0 bg-gray bg-opacity-80 z-50 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  ) : children;
};

export { LoadingSpinner, LoadingWrapper };

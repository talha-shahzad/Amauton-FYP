// @ts-nocheck
import React from 'react';
import './loading.css'; // Ensure correct path

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  return (
    <>
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p className="loading-text">Fetching products Please Wait</p>
        </div>
      )}
    </>
  );
};

export default LoadingOverlay;

import React from 'react';
import './BuyPro.css';
import cardImage from '../../assets/credit-card.png'; // make sure this image exists in your assets folder

const BuyPro: React.FC = () => {
  return (
    <div className="buypro-container">
      <h1 className="buypro-heading">Buy Pro</h1>
      <p className="buypro-subtext">This feature is currently in progress. Stay tuned!</p>
      <img src={cardImage} alt="Credit Card Illustration" className="buypro-image" />
    </div>
  );
};

export default BuyPro;

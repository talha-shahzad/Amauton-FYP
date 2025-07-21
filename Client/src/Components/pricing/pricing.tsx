import React from 'react';
import './Pricing.css'; // Custom styles
import { useNavigate } from 'react-router-dom';
const plans = [
  {
    title: 'Free',
    price: '$0',
    description: 'Basic features for personal use.',
    features: ['1 Project', '100 Requests/month', 'Community Support'],
    buttonText: 'Get Started',
  },
  {
    title: 'Pro',
    price: '$20',
    description: 'Advanced features for professionals.',
    features: ['Unlimited Projects', '10,000 Requests/month', 'Priority Support'],
    buttonText: 'Buy Pro',
  },
  {
    title: 'Enterprise',
    price: '$50',
    description: 'Custom solutions for businesses.',
    features: ['Unlimited Everything', 'Dedicated Manager', 'Custom Integrations'],
    buttonText: 'Buy Pro',
  },
];

const Pricing: React.FC = () => {
    const navigate = useNavigate();
    const handleClick = (value: string) => {
        if (value === 'Buy Pro') {
          navigate('/buy-pro'); 
        }
        else if (value === 'Get Started') {
          navigate('/seller-operations'); // Redirect to dashboard for free plan
        }
      };
  return (
    <div className="pricing-container">
      <h2 className="pricing-title">Pricing Plans</h2>
      <p className="pricing-subtitle">Choose a plan that fits your needs.</p>
      <div className="pricing-cards">
        {plans.map((plan, idx) => (
          <div className="pricing-card" key={idx}>
            <h3>{plan.title}</h3>
            <p className="price">{plan.price}</p>
            <p className="description">{plan.description}</p>
            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>✔ {feature}</li>
              ))}
            </ul>
            <button onClick={() =>handleClick(plan.buttonText)} value={plan.buttonText}>{plan.buttonText}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;

import React, { useState } from 'react';

const AIWizard = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    budget: 5000,
    type: '',
    priority: '',
    location: ''
  });

  const questions = [
    {
      id: 'budget',
      title: "What is your monthly budget?",
      subtitle: "We have options starting from KSh 2,000.",
      type: 'slider',
      min: 1500,
      max: 50000
    },
    {
      id: 'type',
      title: "What kind of space do you need?",
      options: [
        { label: 'Single Room / Bedsitter', icon: '🛏️', desc: 'Perfect for students/singles' },
        { label: '1-2 Bedroom Apartment', icon: '🏠', desc: 'More space and privacy' },
        { label: 'Full House / Villa', icon: '🏰', desc: 'For families and groups' }
      ]
    },
    {
      id: 'priority',
      title: "What's your top priority?",
      options: [
        { label: 'Low Cost', icon: '💰', value: 'cheap' },
        { label: 'Fast Internet', icon: '🌐', value: 'tech' },
        { label: 'Security', icon: '🛡️', value: 'safety' },
        { label: 'Near Road', icon: '🚗', value: 'transit' }
      ]
    }
  ];

  const handleNext = (val) => {
    const currentKey = questions[step].id;
    setAnswers({ ...answers, [currentKey]: val });
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep('result');
    }
  };

  const ResultView = () => (
    <div style={resultCard}>
      <div style={aiBadge}>AI RECOMMENDED</div>
      <h2>The Best Fit for You:</h2>
      <div style={matchCard}>
        <div style={matchScore}>98% Match</div>
        <h3>Tigoni Affordable Studios</h3>
        <p>KSh 3,500 / Month</p>
        <div style={tagRow}>
          <span style={featureTag}>✓ Water Inclusive</span>
          <span style={featureTag}>✓ Near Main Road</span>
        </div>
      </div>
      <button style={finalBtn} onClick={() => onComplete(answers)}>Show on Map</button>
      <button style={resetBtn} onClick={() => setStep(0)}>Restart AI Assistant</button>
    </div>
  );

  return (
    <div style={wizardOverlay}>
      <div style={wizardContainer}>
        {step !== 'result' ? (
          <>
            <div style={progressBar}><div style={{...progressInner, width: `${(step/questions.length)*100}%`}}></div></div>
            <h1 style={qTitle}>{questions[step].title}</h1>
            <p style={qSub}>{questions[step].subtitle}</p>

            {questions[step].type === 'slider' ? (
              <div style={sliderBox}>
                <div style={priceDisplay}>KSh {answers.budget.toLocaleString()}</div>
                <input 
                  type="range" 
                  min={questions[step].min} 
                  max={questions[step].max} 
                  value={answers.budget}
                  onChange={(e) => setAnswers({...answers, budget: e.target.value})}
                  style={iosSlider}
                />
                <button style={nextBtn} onClick={() => handleNext(answers.budget)}>Continue</button>
              </div>
            ) : (
              <div style={optionsGrid}>
                {questions[step].options.map((opt, i) => (
                  <div key={i} style={optCard} onClick={() => handleNext(opt.label)}>
                    <span style={optIcon}>{opt.icon}</span>
                    <div style={optLabel}>{opt.label}</div>
                    <div style={optDesc}>{opt.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <ResultView />
        )}
      </div>
    </div>
  );
};

// --- STYLES ---
const wizardOverlay = { height: '100%', width: '100%', background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const wizardContainer = { width: '100%', maxWidth: '500px', textAlign: 'center', animation: 'fadeIn 0.5s ease' };
const progressBar = { height: '6px', background: '#E5E5EA', borderRadius: '10px', marginBottom: '40px', overflow: 'hidden' };
const progressInner = { height: '100%', background: '#007AFF', transition: '0.4s' };

const qTitle = { fontSize: '28px', fontWeight: '800', marginBottom: '10px', color: '#1C1C1E' };
const qSub = { fontSize: '16px', color: '#8E8E93', marginBottom: '40px' };

const optionsGrid = { display: 'flex', flexDirection: 'column', gap: '15px' };
const optCard = { 
  background: '#fff', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px',
  cursor: 'pointer', transition: '0.2s', border: '1px solid transparent'
};
// Add hover effect in CSS
const optIcon = { fontSize: '32px' };
const optLabel = { fontWeight: 'bold', fontSize: '17px' };
const optDesc = { fontSize: '12px', color: '#8E8E93' };

const sliderBox = { background: '#fff', padding: '40px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' };
const priceDisplay = { fontSize: '42px', fontWeight: '900', color: '#007AFF', marginBottom: '20px' };
const iosSlider = { width: '100%', height: '8px', borderRadius: '5px', outline: 'none', cursor: 'pointer' };
const nextBtn = { marginTop: '30px', width: '100%', padding: '18px', borderRadius: '15px', background: '#007AFF', color: '#fff', border: 'none', fontWeight: 'bold' };

const resultCard = { background: '#fff', padding: '40px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' };
const aiBadge = { display: 'inline-block', padding: '4px 12px', background: '#34C759', color: '#fff', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', marginBottom: '20px' };
const matchCard = { padding: '25px', background: '#F2F2F7', borderRadius: '20px', marginBottom: '30px', textAlign: 'left' };
const matchScore = { color: '#34C759', fontWeight: 'bold', fontSize: '14px' };
const tagRow = { display: 'flex', gap: '10px', marginTop: '15px' };
const featureTag = { fontSize: '11px', color: '#555', background: '#ddd', padding: '4px 8px', borderRadius: '5px' };
const finalBtn = { width: '100%', padding: '18px', background: '#007AFF', color: '#fff', borderRadius: '15px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' };
const resetBtn = { background: 'none', border: 'none', color: '#8E8E93', fontSize: '13px', cursor: 'pointer' };

export default AIWizard;
import React, { useState } from 'react';
import { BookOpen, CheckSquare, Award, ArrowRight, HelpCircle, Check, X } from 'lucide-react';

const CHECKLISTS = {
  Flooding: [
    { id: 'f1', text: 'Locate highest ground in your house / area' },
    { id: 'f2', text: 'Unplug main electricity switch & shut off gas' },
    { id: 'f3', text: 'Pack emergency go-bag (water, food, medicine, flashlight)' },
    { id: 'f4', text: 'Store clean drinking water in sealed containers' },
    { id: 'f5', text: 'Save emergency contacts list on physical paper' },
  ],
  Earthquake: [
    { id: 'e1', text: 'Identify safe spots (under heavy tables, sturdy desks)' },
    { id: 'e2', text: 'Secure tall bookcase/cabinets to walls' },
    { id: 'e3', text: 'Pack survival kit with helmet, gloves, and boots' },
    { id: 'e4', text: 'Learn manual gas and water shutoff valves' },
    { id: 'e5', text: 'Designate an outdoor family meeting spot' },
  ],
  Cyclone: [
    { id: 'c1', text: 'Secure loose outdoor items (trash cans, furniture)' },
    { id: 'c2', text: 'Board up or tape windows and secure doors' },
    { id: 'c3', text: 'Fully charge powerbanks, phones, and emergency lights' },
    { id: 'c4', text: 'Store dry food rations for at least 3 days' },
    { id: 'c5', text: 'Identify the nearest designated local cyclone shelter' },
  ]
};

const QUIZ_QUESTIONS = [
  {
    id: 1,
    scenario: 'Flood',
    question: 'Water is rising rapidly inside your house. What is your immediate priority?',
    options: [
      'Go to the basement to save stored valuables.',
      'Shut off main electricity/gas and head to upper floors or the roof.',
      'Attempt to swim or drive through the floodwaters to find help.',
      'Wait in your living room for emergency responders to knock.'
    ],
    correct: 1,
    explanation: 'Basements flood first and trap you. Driving/swimming in floodwaters is the leading cause of flood deaths. Staying high and cutting utilities prevents electrocution/fires.'
  },
  {
    id: 2,
    scenario: 'Earthquake',
    question: 'You feel a strong earthquake while indoors. What action should you take?',
    options: [
      'Run immediately out of the building down the staircase.',
      'Drop, Cover under a sturdy table, and Hold on.',
      'Stand near windows or tall brick walls to watch what is happening.',
      'Take the elevator to reach ground level as fast as possible.'
    ],
    correct: 1,
    explanation: 'Running during shaking causes injuries from falling debris. Drop, Cover, and Hold protects you from falling light fixtures, plaster, and glass. Never use elevators.'
  },
  {
    id: 3,
    scenario: 'Cyclone',
    question: 'The winds suddenly stop during a severe cyclone. What does this mean?',
    options: [
      'The storm is over and it is safe to go outside.',
      'You are in the eye of the cyclone; dangerous winds will resume shortly from the opposite direction.',
      'The cyclone has changed direction and will not return.',
      'The storm has weakened permanently into a light breeze.'
    ],
    correct: 1,
    explanation: 'The eye is a deceptive calm center. Once it passes, the back wall of the cyclone hits with extreme force and winds in the opposite direction. Remain sheltered.'
  }
];

export default function SurvivalGuides({ activeScenario }) {
  const [activeTab, setActiveTab] = useState('checklist'); // 'checklist' | 'quiz'
  const [checkedItems, setCheckedItems] = useState({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Map activeScenario string to Checklist category
  const getDisasterKey = () => {
    if (activeScenario.toLowerCase().includes('flood')) return 'Flooding';
    if (activeScenario.toLowerCase().includes('earthquake')) return 'Earthquake';
    return 'Cyclone';
  };

  const disasterKey = getDisasterKey();
  const currentChecklist = CHECKLISTS[disasterKey] || CHECKLISTS.Flooding;

  const handleToggleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getCompletedCount = () => {
    return currentChecklist.filter(item => checkedItems[item.id]).length;
  };

  const handleAnswerQuiz = (index) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (index === QUIZ_QUESTIONS[currentQuizIndex].correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOption(null);
    if (currentQuizIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const completionPercent = Math.round((getCompletedCount() / currentChecklist.length) * 100);

  return (
    <div className="glass-card guides-container" style={{ flex: 1 }}>
      <div className="guides-header">
        <h2>
          {activeTab === 'checklist' ? (
            <>
              <CheckSquare size={20} className="text-cyan animate-pulse" />
              Preparedness Checklist
            </>
          ) : (
            <>
              <Award size={20} className="text-orange animate-pulse" />
              Safety Training Quiz
            </>
          )}
        </h2>

        <div className="guides-tab-buttons">
          <button 
            onClick={() => setActiveTab('checklist')} 
            className={`guides-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
          >
            Checklist
          </button>
          <button 
            onClick={() => setActiveTab('quiz')} 
            className={`guides-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          >
            Survival Quiz
          </button>
        </div>
      </div>

      <div className="guides-content">
        {activeTab === 'checklist' ? (
          <div>
            <p className="sos-desc" style={{ marginBottom: '1rem' }}>
              Actionable survival safety measures for <strong>{disasterKey}</strong>. Check off steps as you complete them:
            </p>

            <div className="checklist-list">
              {currentChecklist.map((item) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div 
                    key={item.id} 
                    className="checklist-item"
                    onClick={() => handleToggleCheck(item.id)}
                  >
                    <div className={`checklist-checkbox ${isChecked ? 'checked' : ''}`}>
                      {isChecked && <Check size={10} strokeWidth={4} />}
                    </div>
                    <span className={`checklist-text ${isChecked ? 'checked' : ''}`}>
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="guide-progress-bar">
              <span>Readiness Score:</span>
              <span className="logo-badge" style={{ 
                background: completionPercent === 100 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                borderColor: completionPercent === 100 ? 'var(--color-green)' : 'var(--color-cyan)',
                color: completionPercent === 100 ? 'var(--color-green)' : 'var(--color-cyan)',
              }}>
                {completionPercent}% Ready
              </span>
            </div>
          </div>
        ) : (
          <div className="quiz-panel">
            {quizFinished ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <Award size={40} className="text-orange" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Training Completed!</h3>
                <p className="sos-desc" style={{ margin: '0.5rem 0 1rem' }}>
                  You scored <strong>{quizScore} out of {QUIZ_QUESTIONS.length}</strong> on your safety preparedness challenge.
                </p>
                <button onClick={handleResetQuiz} className="popup-btn">
                  Retake Quiz
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="quiz-score-badge">
                    Question {currentQuizIndex + 1} of {QUIZ_QUESTIONS.length}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Score: {quizScore}/{QUIZ_QUESTIONS.length}
                  </span>
                </div>

                <p className="quiz-question">
                  {QUIZ_QUESTIONS[currentQuizIndex].question}
                </p>

                <div className="quiz-options">
                  {QUIZ_QUESTIONS[currentQuizIndex].options.map((opt, i) => {
                    let btnClass = '';
                    if (selectedOption !== null) {
                      if (i === QUIZ_QUESTIONS[currentQuizIndex].correct) {
                        btnClass = 'correct';
                      } else if (i === selectedOption) {
                        btnClass = 'wrong';
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswerQuiz(i)}
                        className={`quiz-option-btn ${btnClass}`}
                        disabled={selectedOption !== null}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedOption !== null && (
                  <div className="quiz-explanation">
                    <p style={{ fontWeight: '500', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {selectedOption === QUIZ_QUESTIONS[currentQuizIndex].correct ? '✓ Correct!' : '✗ Incorrect'}
                    </p>
                    <p>{QUIZ_QUESTIONS[currentQuizIndex].explanation}</p>
                    <button onClick={handleNextQuiz} className="quiz-next-btn">
                      Next Question
                      <ArrowRight size={12} style={{ marginLeft: '0.35rem', display: 'inline' }} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

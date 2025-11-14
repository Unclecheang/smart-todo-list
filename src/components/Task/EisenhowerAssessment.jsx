// components/Task/EisenhowerAssessment.jsx
import React, { useState } from 'react';
import './EisenhowerAssessment.css';

const EisenhowerAssessment = ({ task, onClose, onQuadrantSelect }) => {
  const [hoveredQuadrant, setHoveredQuadrant] = useState(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState(null);

  const quadrants = [
    {
      id: 'urgent-important',
      urgent: true,
      important: true,
      title: 'Do First',
      description: 'Urgent & Important',
      advice: 'Do it now! Prioritize completing it promptly.'
    },
    {
      id: 'not-urgent-important', 
      urgent: false,
      important: true,
      title: 'Schedule',
      description: 'Not Urgent & Important',
      advice: 'Schedule it! Plan time to do this important task.'
    },
    {
      id: 'urgent-not-important',
      urgent: true,
      important: false,
      title: 'Delegate',
      description: 'Urgent & Not Important', 
      advice: 'Delegate it! Consider if someone else can handle this.'
    },
    {
      id: 'not-urgent-not-important',
      urgent: false,
      important: false,
      title: 'Eliminate',
      description: 'Not Urgent & Not Important',
      advice: 'Eliminate it! Consider dropping or postponing this task.'
    }
  ];

  const handleQuadrantClick = (quadrantId) => {
    setSelectedQuadrant(quadrantId);
    if (onQuadrantSelect) {
      onQuadrantSelect(quadrantId);
    }
  };

  const handleQuadrantHover = (quadrantId) => {
    setHoveredQuadrant(quadrantId);
  };

  const handleMouseLeave = () => {
    setHoveredQuadrant(null);
  };

  const getQuadrantClass = (quadrantId) => {
    let className = 'quadrant-box';
    
    if (selectedQuadrant === quadrantId) {
      className += ' selected';
    } else if (hoveredQuadrant === quadrantId) {
      className += ' hovered';
    }
    
    return className;
  };

  const getSelectedAdvice = () => {
    const quadrant = quadrants.find(q => q.id === selectedQuadrant);
    return quadrant ? quadrant.advice : 'Please select a quadrant to categorize your task.';
  };

  return (
    <div className="assessment-overlay">
      <div className="assessment-modal">
        <h2>Task Added Successfully! 🎉</h2>
        <p className="task-title">"{task?.title}"</p>
        <p className="instruction">Select the Eisenhower Matrix quadrant for this task:</p>

        <div 
          className="eisenhower-matrix interactive"
          onMouseLeave={handleMouseLeave}
        >
          <div className="matrix-headers">
            <div className="header-spacer"></div>
            <div className="header urgent">Urgent</div>
            <div className="header not-urgent">Not Urgent</div>
          </div>

          <div className="matrix-body">
            <div className="side-label important">Important</div>
            
            {/* Urgent & Important */}
            <div 
              className={`quadrant urgent-important ${getQuadrantClass('urgent-important')}`}
              onMouseEnter={() => handleQuadrantHover('urgent-important')}
              onClick={() => handleQuadrantClick('urgent-important')}
            >
              <div className="quadrant-content">
                <div className="quadrant-title">Do First</div>
                <div className="quadrant-desc">Urgent & Important</div>
                {selectedQuadrant === 'urgent-important' && (
                  <div className="selected-badge">Selected</div>
                )}
              </div>
            </div>

            {/* Not Urgent & Important */}
            <div 
              className={`quadrant not-urgent-important ${getQuadrantClass('not-urgent-important')}`}
              onMouseEnter={() => handleQuadrantHover('not-urgent-important')}
              onClick={() => handleQuadrantClick('not-urgent-important')}
            >
              <div className="quadrant-content">
                <div className="quadrant-title">Schedule</div>
                <div className="quadrant-desc">Not Urgent & Important</div>
                {selectedQuadrant === 'not-urgent-important' && (
                  <div className="selected-badge">Selected</div>
                )}
              </div>
            </div>

            <div className="side-label not-important">Not Important</div>
            
            {/* Urgent & Not Important */}
            <div 
              className={`quadrant urgent-not-important ${getQuadrantClass('urgent-not-important')}`}
              onMouseEnter={() => handleQuadrantHover('urgent-not-important')}
              onClick={() => handleQuadrantClick('urgent-not-important')}
            >
              <div className="quadrant-content">
                <div className="quadrant-title">Delegate</div>
                <div className="quadrant-desc">Urgent & Not Important</div>
                {selectedQuadrant === 'urgent-not-important' && (
                  <div className="selected-badge">Selected</div>
                )}
              </div>
            </div>

            {/* Not Urgent & Not Important */}
            <div 
              className={`quadrant not-urgent-not-important ${getQuadrantClass('not-urgent-not-important')}`}
              onMouseEnter={() => handleQuadrantHover('not-urgent-not-important')}
              onClick={() => handleQuadrantClick('not-urgent-not-important')}
            >
              <div className="quadrant-content">
                <div className="quadrant-title">Eliminate</div>
                <div className="quadrant-desc">Not Urgent & Not Important</div>
                {selectedQuadrant === 'not-urgent-not-important' && (
                  <div className="selected-badge">Selected</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="advice-section">
          <p><strong>Advice:</strong> {getSelectedAdvice()}</p>
        </div>

        <div className="action-buttons">
          {/* <button 
            className="confirm-btn" 
            disabled={!selectedQuadrant}
            onClick={() => onQuadrantSelect(selectedQuadrant)}
          >
            Confirm Selection
          </button> */}
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EisenhowerAssessment;
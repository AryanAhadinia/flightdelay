import React, { useState } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import ChordDiagram from './ChordDiagram';
import './ChordSection.css';

const ChordSection: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`chord-section ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="chord-section-content">
        <div className="chord-section-text">
          <h2>Airport Route Visualization</h2>
          <p>
            This chord diagram visualizes flight routes between major airports, where:
          </p>
          <ul>
            <li>Colors represent the average delay time (from green to red)</li>
            <li>Width of connections represents the number of flights</li>
          </ul>
        </div>

        <div className="chord-section-visualization">
          <ChordDiagram isFullscreen={isFullscreen} />
          
          {!isFullscreen && (
            <div className="chord-controls-overlay">
              <button className="action-btn fullscreen-btn" onClick={toggleFullscreen}>
                <FaExpand />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {isFullscreen && (
        <button 
          className="exit-fullscreen-btn"
          onClick={toggleFullscreen} 
          aria-label="Exit fullscreen"
        >
          <FaCompress />
        </button>
      )}
    </div>
  );
};

export default ChordSection; 
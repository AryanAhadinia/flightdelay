import React, { useState } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import AirlineDelayBarChart from './AirlineDelayBarChart';
import './AirlineDelaySection.css';

const AirlineDelaySection: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    document.body.style.overflow = !isFullscreen ? 'hidden' : 'auto';
  };

  return (
    <div className={`airline-delay-section ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="airline-delay-header">
        <h2>Airline Delay Comparison</h2>
        <button className="fullscreen-btn" onClick={toggleFullscreen}>
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
      </div>
      
      <div className="airline-delay-content">
        <div className="airline-delay-visualization">
          <AirlineDelayBarChart isFullscreen={isFullscreen} />
        </div>
      </div>
    </div>
  );
};

export default AirlineDelaySection; 
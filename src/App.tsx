import React from 'react';
import FlightGlobe from './components/FlightGlobe';
import TeamSection from './components/TeamSection';
import USMapSection from './components/USMapSection';
import ChordSection from './components/ChordSection';
import AirlineDelaySection from './components/AirlineDelaySection';
import Navbar from './components/Navbar';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Navbar />
      
      <section id="home" className="hero-section">
        <FlightGlobe />
      </section>
      
      <section id="us-map" className="content-section">
        <USMapSection />
      </section>
      
      <section id="chord" className="content-section">
        <ChordSection />
      </section>
      
      <section id="airline-delay" className="content-section">
        <AirlineDelaySection />
      </section>
      
      <section id="team" className="content-section">
        <TeamSection />
      </section>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLinkClick = () => {
    if (menuOpen) setMenuOpen(false);
  };

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -80% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(section => {
      observer.observe(section);
    });

    return () => {
      sections.forEach(section => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-icon">✈️</span>
          <span className="logo-text">FlightDelays</span>
        </div>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <a
            href="#home"
            className={`navbar-item ${activeSection === 'home' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            Home
          </a>
          <a
            href="#us-map"
            className={`navbar-item ${activeSection === 'us-map' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            US Map
          </a>
          <a
            href="#chord"
            className={`navbar-item ${activeSection === 'chord' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            Routes
          </a>
          <a
            href="#airline-delay"
            className={`navbar-item ${activeSection === 'airline-delay' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            Airline Delays
          </a>
          <a
            href="#team"
            className={`navbar-item ${activeSection === 'team' ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            Team
          </a>
        </div>

        <button className="mobile-menu-button" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 
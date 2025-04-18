import React, { useState, useRef, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { FaExpand, FaCompress, FaTimes, FaSearchPlus, FaSearchMinus, FaCalendarAlt } from 'react-icons/fa';
import './USMapSection.css';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";


// TODO: connect to actual data
// NOTE: this is dummy data

const airports = [
  {
    name: "Hartsfield-Jackson Atlanta",
    code: "ATL",
    coordinates: [-84.4277, 33.6407] as [number, number],
    avgDelay: "12",
    delayRate: "16%",
    business: 100,
    delay: 45
  },
  {
    name: "Los Angeles International",
    code: "LAX",
    coordinates: [-118.4085, 33.9416] as [number, number],
    avgDelay: "15",
    delayRate: "18%",
    business: 80,
    delay: 55
  },
  {
    name: "O'Hare International",
    code: "ORD",
    coordinates: [-87.9073, 41.9742] as [number, number],
    avgDelay: "19",
    delayRate: "21%",
    business: 76,
    delay: 65
  },
  {
    name: "Dallas/Fort Worth",
    code: "DFW",
    coordinates: [-97.0403, 32.8998] as [number, number],
    avgDelay: "14",
    delayRate: "17%",
    business: 68,
    delay: 50
  },
  {
    name: "John F. Kennedy",
    code: "JFK",
    coordinates: [-73.7781, 40.6413] as [number, number],
    avgDelay: "17",
    delayRate: "20%",
    business: 57,
    delay: 60
  },
  {
    name: "San Francisco International",
    code: "SFO",
    coordinates: [-122.3786, 37.6213] as [number, number],
    avgDelay: "20",
    delayRate: "23%",
    business: 53,
    delay: 75
  }
];

const DEFAULT_CENTER: [number, number] = [-96, 36];

const USMapSection: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapScale, setMapScale] = useState(900);
  const [zoomFactor, setZoomFactor] = useState(1);
  const [baseScale, setBaseScale] = useState(900);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedAirport, setSelectedAirport] = useState<typeof airports[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2009, 0, 1));

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setSelectedAirport(null);
    setZoomFactor(1);
  };

  const handleZoomIn = () => {
    setZoomFactor(prev => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setZoomFactor(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleWheel = (event: WheelEvent) => {
    if (!isFullscreen) return;

    event.preventDefault();

    const delta = event.deltaY > 0 ? -0.1 : 0.1;

    setZoomFactor(prev => {
      const newZoom = prev + delta;
      return Math.max(0.5, Math.min(2.5, newZoom));
    });
  };

  useEffect(() => {
    if (!isFullscreen || !mapRef.current) return;

    const mapElement = mapRef.current;

    mapElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      mapElement.removeEventListener('wheel', handleWheel);
    };
  }, [isFullscreen, zoomFactor]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;

      const { width, height } = container.getBoundingClientRect();

      const aspectRatio = width / height;

      let calculatedBaseScale;
      if (isFullscreen) {
        if (aspectRatio > 1.8) {
          calculatedBaseScale = height * 0.8;
        } else {
          calculatedBaseScale = width * 0.45;
        }
      } else {
        calculatedBaseScale = Math.min(width * 0.55, 900);
      }

      setBaseScale(calculatedBaseScale);
      setMapScale(calculatedBaseScale * zoomFactor);
    };

    updateScale();

    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isFullscreen, zoomFactor]);

  useEffect(() => {
    setMapScale(baseScale * zoomFactor);
  }, [baseScale, zoomFactor]);

  // TODO: debug dragging the map

  const handleMarkerClick = (airport: typeof airports[0]) => {
    if (isFullscreen) {
      setSelectedAirport(airport);
    }
  };

  const closeAirportDetails = () => {
    setSelectedAirport(null);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  // TODO: set total months dynamically based on data
  const TOTAL_MONTHS = 10 * 12; // 10 years of data / 12 months

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);

    const year = Math.floor(value / 12) + 2009;
    const month = value % 12;

    const newDate = new Date(year, month, 1);
    setSelectedDate(newDate);
  };

  const calculateSliderValue = (): number => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    return ((year - 2009) * 12) + month;
  };

  const getDelayColor = (delay: number) => {
    // TODO: continuous color map instead of discrete
    if (delay <= 0) return "#00cc00";
    if (delay <= 25) return "#99cc00";
    if (delay <= 50) return "#ffcc00";
    if (delay <= 75) return "#ff6600";
    return "#cc0000";
  };

  const getAirportSize = (business: number) => {
    // TODO: set size dynamically based on zoom factor
    return 6 + (business / 100) * 4;
  };

  return (
    <div
      className={`usmap-container ${isFullscreen ? 'fullscreen' : ''}`}
      ref={containerRef}
    >
      <div className="usmap-content">
        <div className="usmap-text">
          <h2>Proof of Concept: Map Visualization</h2>
          <p>
            This is a proof of concept for the map component of the project.
            Due to the geographic nature of the data, it is necessary to visualize the data on a map.
            Click on the bottom of top-right corner of the map to enter fullscreen mode.
          </p>
        </div>

        <div
          className="usmap-visualization"
          ref={mapRef}
        >
          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>

          {isFullscreen && (
            <div className="zoom-controls">
              <button className="zoom-btn zoom-in" onClick={handleZoomIn} title="Zoom In">
                <FaSearchPlus />
              </button>
              <button className="zoom-btn zoom-out" onClick={handleZoomOut} title="Zoom Out">
                <FaSearchMinus />
              </button>
            </div>
          )}

          {isFullscreen && (
            <div className="time-slider-container">
              <div className="time-slider-header">
                <FaCalendarAlt />
                <span>{formatDate(selectedDate)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={TOTAL_MONTHS - 1}
                value={calculateSliderValue()}
                onChange={handleTimeChange}
                className="time-slider"
              />
              <div className="time-slider-labels">
                <span>January 2009</span>
                <span>December 2018</span>
              </div>
            </div>
          )}

          {selectedAirport && isFullscreen && (
            <div className="airport-details-card">
              <button className="close-card-btn" onClick={closeAirportDetails}>
                <FaTimes />
              </button>
              <div className="airport-header">
                <h2>{selectedAirport.name} <span className="airport-code">({selectedAirport.code})</span></h2>
              </div>
              <div className="airport-stats">
                <div className="stat-item">
                  <span className="stat-label">Average Delay:</span>
                  <span className="stat-value">{selectedAirport.avgDelay}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Delay Rate:</span>
                  <span className="stat-value">{selectedAirport.delayRate}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Time Period:</span>
                  <span className="stat-value">{formatDate(selectedDate)}</span>
                </div>
              </div>
            </div>
          )}

          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={{
              scale: mapScale,
              center: DEFAULT_CENTER
            }}
            style={{
              width: "100%",
              height: "100%"
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map(geo => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#f2f2f2"
                    stroke="#d9d9d9"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>

            {airports.map((airport) => (
              <Marker
                key={airport.code}
                coordinates={airport.coordinates}
                onClick={() => handleMarkerClick(airport)}
                className="airport-marker"
              >
                <circle
                  r={getAirportSize(airport.business)}
                  fill={selectedAirport?.code === airport.code ? "#ff6b6b" : getDelayColor(airport.delay)}
                  stroke="#fff"
                  strokeWidth={2}
                  opacity={0.8}
                  style={{ cursor: 'pointer' }}
                />
              </Marker>
            ))}
          </ComposableMap>

          {isFullscreen && (
            <div className="map-instructions">
              <p>Scroll to zoom</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default USMapSection;
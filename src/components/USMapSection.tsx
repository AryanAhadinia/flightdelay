import React, { useState, useRef, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { FaExpand, FaCompress, FaTimes, FaSearchPlus, FaSearchMinus, FaCalendarAlt } from 'react-icons/fa';
import * as d3 from 'd3';
import './USMapSection.css';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";


// TODO: connect to actual data
// NOTE: this is dummy data

const DEFAULT_CENTER: [number, number] = [-96, 36];

const USMapSection: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapScale, setMapScale] = useState(900);
  const [zoomFactor, setZoomFactor] = useState(1);
  const [baseScale, setBaseScale] = useState(900);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // const [airports, setAirports] = useState<typeof any>();

  const [selectedAirport, setSelectedAirport] = useState<typeof airports[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2009, 0, 1));

  // const airports = [
  //   {
  //     name: "Hartsfield-Jackson Atlanta",
  //     code: "ATL",
  //     coordinates: [-84.4277, 33.6407] as [number, number],
  //     avgDelay: "12",
  //     delayRate: "16%",
  //     business: 100,
  //     delay: 45
  //   },
  //   {
  //     name: "Los Angeles International",
  //     code: "LAX",
  //     coordinates: [-118.4085, 33.9416] as [number, number],
  //     avgDelay: "15",
  //     delayRate: "18%",
  //     business: 80,
  //     delay: 55
  //   },
  //   {
  //     name: "O'Hare International",
  //     code: "ORD",
  //     coordinates: [-87.9073, 41.9742] as [number, number],
  //     avgDelay: "19",
  //     delayRate: "21%",
  //     business: 76,
  //     delay: 65
  //   },
  //   {
  //     name: "Dallas/Fort Worth",
  //     code: "DFW",
  //     coordinates: [-97.0403, 32.8998] as [number, number],
  //     avgDelay: "14",
  //     delayRate: "17%",
  //     business: 68,
  //     delay: 50
  //   },
  //   {
  //     name: "John F. Kennedy",
  //     code: "JFK",
  //     coordinates: [-73.7781, 40.6413] as [number, number],
  //     avgDelay: "17",
  //     delayRate: "20%",
  //     business: 57,
  //     delay: 60
  //   },
  //   {
  //     name: "San Francisco International",
  //     code: "SFO",
  //     coordinates: [-122.3786, 37.6213] as [number, number],
  //     avgDelay: "20",
  //     delayRate: "23%",
  //     business: 53,
  //     delay: 75
  //   }
  // ];

  const [airports, setAirports] = useState<any[]>([]);
  const [airportsRawData, setAirportsRawData] = useState<any[]>([]);
  const [airportsMapsRawData, setAirportsMapsRawData] = useState<any[]>([]);
  const [quartiles, setQuartiles] = useState<{ q1: number; median: number; q3: number } | null>({ q1: 0, median: 0, q3: 0 });
  const [quartilesByMonth, setQuartilesByMonth] = useState<Record<string, { q1: number; median: number; q3: number }>>({});

  useEffect(() => {
    d3.csv('data/airports-map.csv').then(data_map => {
      d3.csv('data/airports.csv').then(data => {
        setAirportsMapsRawData(data_map);
        setAirportsRawData(data);
        
        // Compute quartiles for each year-month
        const quartilesMap: Record<string, { q1: number; median: number; q3: number }> = {};
        const grouped: Record<string, number[]> = {};
        data_map.forEach((row: any) => {
          const ym = `${row.Year}-${row.Month.toString().padStart(2, '0')}`;
          if (!grouped[ym]) grouped[ym] = [];
          grouped[ym].push(Number(row.AverageDelay));
        });
        Object.entries(grouped).forEach(([ym, delays]) => {
          delays.sort((a, b) => a - b);
          quartilesMap[ym] = {
            q1: d3.quantileSorted(delays, 0.25) || 0,
            median: d3.quantileSorted(delays, 0.5) || 0,
            q3: d3.quantileSorted(delays, 0.75) || 0,
          };
        });
        setQuartilesByMonth(quartilesMap);
      });
    });
  }, []);

  useEffect(() => {
    if (airportsRawData.length === 0 || airportsMapsRawData.length === 0) return;

    const currentMonth = selectedDate.getMonth() + 1;
    const currentYear = selectedDate.getFullYear();

    const formattedAirports = airportsRawData
      .filter(
        (d: any) =>
          d.STATE !== "PR" &&
          d.STATE !== "VI" &&
          d.STATE !== "AS" &&
          d.STATE !== "GU" &&
          d.STATE !== "MP"
      )
      .map((d: any) => {
        const airportData = airportsMapsRawData.find(
          (airport: any) =>
            airport.IATA_CODE === d.IATA_CODE &&
            Number(airport.Year) === currentYear &&
            Number(airport.Month) === currentMonth
        );
        if (airportData) {
          return {
            name: d.AIRPORT,
            code: d.IATA_CODE,
            coordinates: [parseFloat(d.LONGITUDE), parseFloat(d.LATITUDE)] as [number, number],
            avgDelay: airportData.AverageDelay,
            delayRate: "1%",
            business: Number(airportData.NumFlights),
            delay: 2,
          };
        } else {
          return {
            name: d.AIRPORT,
            code: d.IATA_CODE,
            coordinates: [parseFloat(d.LONGITUDE), parseFloat(d.LATITUDE)] as [number, number],
            avgDelay: "1",
            delayRate: "1%",
            business: 1,
            delay: 1,
          };
        }
      });

    setAirports(formattedAirports);
  }, [selectedDate, airportsRawData, airportsMapsRawData]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setSelectedAirport(null);
    setZoomFactor(1);
    // console.log(airportData);
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
    // Use quartiles for the selected date
    const ym = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;
    const q = quartilesByMonth[ym];
    if (!q) return "#cccccc";
    if (delay <= q.q1) return "#00cc00";
    if (delay <= q.median) return "#99cc00";
    if (delay <= q.q3) return "#ffcc00";
    return "#cc0000";
  };

  const getAirportSize = (business: number) => {
    // TODO: set size dynamically based on zoom factor
    return 6 + (business / 10000) * 4;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFullscreen) return;
    // Prevent panning if clicking on the time slider or its container
    const sliderContainer = document.querySelector('.time-slider-container');
    if (sliderContainer && sliderContainer.contains(e.target as Node)) {
      return;
    }
    setIsDragging(true);
    setStartPosition({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isFullscreen) return;
    setPosition({
      x: e.clientX - startPosition.x,
      y: e.clientY - startPosition.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isFullscreen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isFullscreen]);

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
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease',
              width: '100%',
              height: '100%'
            }}
          >
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
                    fill={getDelayColor(airport.avgDelay)}
                    // fill={selectedAirport?.code === airport.code ? "#ff6b6b" : getDelayColor(airport.avgDelay)}
                    stroke={selectedAirport?.code === airport.code ? "black" : "#fff"}
                    strokeWidth={selectedAirport?.code === airport.code ? 3 : 2}
                    opacity={0.8}
                    style={{ cursor: 'pointer' }}
                  />
                </Marker>
              ))}
            </ComposableMap>
          </div>

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
                {/* <div className="stat-item">
                  <span className="stat-label">Delay Rate:</span>
                  <span className="stat-value">{selectedAirport.delayRate}</span>
                </div> */}
                {/* <div className="stat-item">
                  <span className="stat-label">Time Period:</span>
                  <span className="stat-value">{formatDate(selectedDate)}</span>
                </div> */}
              </div>
            </div>
          )}

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

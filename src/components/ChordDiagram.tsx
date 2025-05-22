import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './ChordDiagram.css';
import { FaCalendarAlt } from 'react-icons/fa';

interface FlightRoute {
  Origin: string;
  Destination: string;
  NumFlights: number;
  AverageDelay: number;
}

interface AirportNode {
  IATA_CODE: string;
  AIRPORT: string;
}

interface ChordDiagramProps {
  className?: string;
  isFullscreen?: boolean;
}

const ChordDiagram: React.FC<ChordDiagramProps> = ({ className = '', isFullscreen = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2009, 0, 1));

  // TODO: replace with actual data
  const airports: AirportNode[] = [
    { IATA_CODE: "LAX", AIRPORT: "Los Angeles International" },
    { IATA_CODE: "JFK", AIRPORT: "John F. Kennedy" },
    { IATA_CODE: "SFO", AIRPORT: "San Francisco International" }
  ];

  // TODO: replace with actual data
  const flightRoutes: FlightRoute[] = [
    { Origin: "LAX", Destination: "JFK", NumFlights: 380, AverageDelay: 28 },
    { Origin: "LAX", Destination: "SFO", NumFlights: 520, AverageDelay: 10 },
    { Origin: "JFK", Destination: "LAX", NumFlights: 360, AverageDelay: 25 },
    { Origin: "JFK", Destination: "SFO", NumFlights: 290, AverageDelay: 30 },
    { Origin: "SFO", Destination: "LAX", NumFlights: 510, AverageDelay: 8 },
    { Origin: "SFO", Destination: "JFK", NumFlights: 280, AverageDelay: 27 }
  ];

  const getDelayColor = (delay: number) => {
    // TODO: continuous color
    if (delay <= 10) return "#00cc00";
    if (delay <= 20) return "#99cc00";
    if (delay <= 30) return "#ffcc00";
    if (delay <= 40) return "#ff6600";
    return "#cc0000";
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

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    setLoading(true);

    d3.select(svgRef.current).selectAll("*").remove();

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);

    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();

    svg.attr("width", containerWidth)
      .attr("height", isFullscreen ? containerHeight * 0.8 : containerHeight);

    const width = containerWidth;
    const height = isFullscreen ? containerHeight * 0.8 : containerHeight;
    const outerRadius = Math.min(width, height) * 0.4;
    const innerRadius = outerRadius * 0.9;

    const translateY = isFullscreen ? height * 0.4 : height / 2;
    
    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${translateY})`);

    const airportMap = new Map<string, number>();
    airports.forEach((airport, i) => {
      airportMap.set(airport.IATA_CODE, i);
    });

    const matrix = Array(airports.length).fill(0).map(() => Array(airports.length).fill(0));

    flightRoutes.forEach(route => {
      const sourceIndex = airportMap.get(route.Origin);
      const targetIndex = airportMap.get(route.Destination);

      if (sourceIndex !== undefined && targetIndex !== undefined) {
        matrix[sourceIndex][targetIndex] = route.NumFlights;
      }
    });

    const chord = d3.chord()
      .padAngle(0.05)
      .sortSubgroups(d3.descending);

    const chords = chord(matrix);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbon()
      .radius(innerRadius);

    const groups = g.append("g")
      .selectAll("g")
      .data(chords.groups)
      .join("g");

    groups.append("path")
      .attr("fill", "#ccc")
      .attr("stroke", "#000")
      .attr("d", arc as any);

    groups.append("text")
      .each(d => {
        (d as any).angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr("dy", ".35em")
      .attr("transform", d => {
        const angle = (d as any).angle * 180 / Math.PI;
        const rotation = angle < 180 ? angle - 90 : angle + 90;
        const translation = outerRadius + 10;
        const x = Math.cos((d as any).angle - Math.PI / 2) * translation;
        const y = Math.sin((d as any).angle - Math.PI / 2) * translation;
        return `translate(${x},${y}) rotate(${rotation})`;
      })
      .attr("text-anchor", d => ((d as any).angle < Math.PI ? "start" : "end"))
      .text(d => airports[d.index].IATA_CODE)
      .style("font-size", "12px")
      .style("font-weight", "bold");

    g.append("g")
      .attr("fill-opacity", 0.75)
      .selectAll("path")
      .data(chords)
      .join("path")
      .attr("d", ribbon as any)
      .attr("fill", d => {
        const sourceId = airports[d.source.index].IATA_CODE;
        const targetId = airports[d.target.index].IATA_CODE;
        const route = flightRoutes.find(r => r.Origin === sourceId && r.Destination === targetId);
        return route ? getDelayColor(route.AverageDelay) : "#ccc";
      })
      .attr("stroke", "#000")
      .style("stroke-width", d => {
        const sourceId = airports[d.source.index].IATA_CODE;
        const targetId = airports[d.target.index].IATA_CODE;
        const route = flightRoutes.find(r => r.Origin === sourceId && r.Destination === targetId);
        return route ? Math.max(0.1, Math.min(2, route.NumFlights / 200)) : 0.1;
      });

    setLoading(false);
  }, [isFullscreen, selectedDate]);

  return (
    <div
      className={`chord-diagram-container ${className} ${isFullscreen ? 'fullscreen' : ''}`}
      ref={containerRef}
    >
      {loading ? (
        <div className="loading-indicator">Loading chord diagram...</div>
      ) : null}
      <svg ref={svgRef}></svg>
      
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
    </div>
  );
};

export default ChordDiagram; 
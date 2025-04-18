import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './ChordDiagram.css';

interface FlightRoute {
  source: string;
  target: string;
  value: number;
  avgDelay: number;
}

interface AirportNode {
  id: string;
  name: string;
}

interface ChordDiagramProps {
  className?: string;
  isFullscreen?: boolean;
}

const ChordDiagram: React.FC<ChordDiagramProps> = ({ className = '', isFullscreen = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [loading, setLoading] = useState(true);

  // TODO: replace with actual data
  const airports: AirportNode[] = [
    { id: "LAX", name: "Los Angeles International" },
    { id: "JFK", name: "John F. Kennedy" },
    { id: "SFO", name: "San Francisco International" }
  ];

  // TODO: replace with actual data
  const flightRoutes: FlightRoute[] = [
    { source: "LAX", target: "JFK", value: 380, avgDelay: 28 },
    { source: "LAX", target: "SFO", value: 520, avgDelay: 10 },
    { source: "JFK", target: "LAX", value: 360, avgDelay: 25 },
    { source: "JFK", target: "SFO", value: 290, avgDelay: 30 },
    { source: "SFO", target: "LAX", value: 510, avgDelay: 8 },
    { source: "SFO", target: "JFK", value: 280, avgDelay: 27 }
  ];

  const getDelayColor = (delay: number) => {
    // TODO: continuous color
    if (delay <= 10) return "#00cc00";
    if (delay <= 20) return "#99cc00";
    if (delay <= 30) return "#ffcc00";
    if (delay <= 40) return "#ff6600";
    return "#cc0000";
  };

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    setLoading(true);

    d3.select(svgRef.current).selectAll("*").remove();

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);

    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();

    svg.attr("width", containerWidth)
      .attr("height", containerHeight);

    const width = containerWidth;
    const height = containerHeight;
    const outerRadius = Math.min(width, height) * 0.45;
    const innerRadius = outerRadius * 0.9;

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const airportMap = new Map<string, number>();
    airports.forEach((airport, i) => {
      airportMap.set(airport.id, i);
    });

    const matrix = Array(airports.length).fill(0).map(() => Array(airports.length).fill(0));

    flightRoutes.forEach(route => {
      const sourceIndex = airportMap.get(route.source);
      const targetIndex = airportMap.get(route.target);

      if (sourceIndex !== undefined && targetIndex !== undefined) {
        matrix[sourceIndex][targetIndex] = route.value;
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
      .text(d => airports[d.index].id)
      .style("font-size", "12px")
      .style("font-weight", "bold");

    g.append("g")
      .attr("fill-opacity", 0.75)
      .selectAll("path")
      .data(chords)
      .join("path")
      .attr("d", ribbon as any)
      .attr("fill", d => {
        const sourceId = airports[d.source.index].id;
        const targetId = airports[d.target.index].id;
        const route = flightRoutes.find(r => r.source === sourceId && r.target === targetId);
        return route ? getDelayColor(route.avgDelay) : "#ccc";
      })
      .attr("stroke", "#000")
      .style("stroke-width", d => {
        const sourceId = airports[d.source.index].id;
        const targetId = airports[d.target.index].id;
        const route = flightRoutes.find(r => r.source === sourceId && r.target === targetId);
        return route ? Math.max(0.1, Math.min(2, route.value / 200)) : 0.1;
      });

    setLoading(false);
  }, [isFullscreen]);

  return (
    <div
      className={`chord-diagram-container ${className} ${isFullscreen ? 'fullscreen' : ''}`}
      ref={containerRef}
    >
      {loading ? (
        <div className="loading-indicator">Loading chord diagram...</div>
      ) : null}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ChordDiagram; 
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './AirlineDelayBarChart.css';

interface DelayData {
  airline: string;
  weather: number;
  carrier: number;
  technical: number;
  security: number;
  other: number;
}

interface AirlineDelayBarChartProps {
  className?: string;
  isFullscreen?: boolean;
}

const AirlineDelayBarChart: React.FC<AirlineDelayBarChartProps> = ({ 
  className = '', 
  isFullscreen = false 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const delayData: DelayData[] = [
    { airline: "Delta", weather: 15, carrier: 12, technical: 8, security: 3, other: 5 },
    { airline: "United", weather: 12, carrier: 18, technical: 10, security: 2, other: 6 },
    { airline: "American", weather: 18, carrier: 15, technical: 7, security: 4, other: 8 },
    { airline: "Southwest", weather: 10, carrier: 8, technical: 12, security: 2, other: 4 },
    { airline: "JetBlue", weather: 14, carrier: 10, technical: 9, security: 3, other: 7 }
  ];

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 60, left: 60 };
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = isFullscreen ? window.innerHeight - 100 : 550;
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", containerWidth)
      .attr("height", containerHeight);

    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const keys = ["weather", "carrier", "technical", "security", "other"];
    const stack = d3.stack<DelayData>().keys(keys);
    const stackedData = stack(delayData);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(keys)
      .range(["#74add1", "#fdae61", "#f46d43", "#a6d96a", "#d9ef8b"]);

    const xScale = d3.scaleBand()
      .domain(delayData.map(d => d.airline))
      .range([0, width])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1]) || 0])
      .range([height, 0]);

    chart.append("g")
      .selectAll("g")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("fill", d => colorScale(d.key))
      .selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.data.airline) || 0)
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("stroke", "white")
      .attr("stroke-width", 1);

    chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", "12px");

    chart.append("g")
      .call(d3.axisLeft(yScale))
      .style("font-size", "12px");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 15)
      .attr("x", -(containerHeight / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Minutes of Delay");

    const legend = svg.append("g")
      .attr("transform", `translate(${width / 2 + margin.left - 200}, ${height + margin.top + 35})`);
      
    keys.forEach((key, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(${i * 80}, 0)`);
        
      legendRow.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale(key));
        
      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 12.5)
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .text(key.charAt(0).toUpperCase() + key.slice(1));
    });

    setLoading(false);
  }, [isFullscreen, delayData]);

  return (
    <div 
      className={`airline-delay-chart-container ${className} ${isFullscreen ? 'fullscreen' : ''}`}
      ref={containerRef}
    >
      {loading ? (
        <div className="loading-indicator">Loading chart...</div>
      ) : null}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default AirlineDelayBarChart; 
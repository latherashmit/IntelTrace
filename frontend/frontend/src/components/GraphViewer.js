import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GraphViewer = ({ graphData }) => {
  const svgRef = useRef();

  useEffect(() => {
    const nodes = graphData.nodes || [];
    const rawLinks = graphData.links || graphData.edges || [];

    const links = rawLinks.map(link => ({
      ...link,
      source: link.from || link.source,
      target: link.to || link.target,
    }));

    const width = 600, height = 400;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const getNodeColor = (node) => {
      if (node.group === "event") return "lightgray";
      switch ((node.risk || '').toLowerCase()) {
        case "high": return "red";
        case "medium": return "orange";
        case "low": return "green";
        default: return "steelblue";
      }
    };

    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 2);

    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("padding", "6px")
      .style("background", "#eee")
      .style("border", "1px solid #333")
      .style("border-radius", "4px")
      .style("display", "none");

    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 10)
      .attr("fill", getNodeColor)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).transition().attr("r", 15);
        tooltip.style("display", "block")
          .html(`<strong>${d.label}</strong><br/>Type: ${d.group}<br/>Risk: ${d.risk || 'N/A'}`);
      })
      .on("mousemove", event => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget).transition().attr("r", 10);
        tooltip.style("display", "none");
      });

    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text(d => d.label)
      .attr("font-size", 12)
      .attr("fill", "black");

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      label
        .attr("x", d => d.x + 12)
        .attr("y", d => d.y + 3);
    });

    return () => {
      tooltip.remove(); // Clean up tooltip
    };
  }, [graphData]);

  return <svg ref={svgRef} width={600} height={400}></svg>;
};

export default GraphViewer;

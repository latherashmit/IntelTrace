//This file defines a react component that uses D3.js to draw a network graph

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';   //d3 is a library for manipulating SVG-Scalable Vector Graphics(a DOM{Document Object Model} element in react)

const GraphViewer = ({ graphData }) => {
  const svgRef = useRef(); //creating a reference hook svgRef on actual <svg> element

  useEffect(() => {
    //Grabbing info from graphData
    const nodes = graphData.nodes || [];
    const rawLinks = graphData.links || [];   

    //standardising all links into format of source and the target
    //Each generated link would have a source and a target
    const links = rawLinks.map(link => ({
      ...link,   //Copies all remaining properties defined
      //makes the edges 
      source: link.from || link.source,
      target: link.to || link.target,
    }));
    
    //SVG initialisation - defining size and selecting actual DOM element using D3
    const width = 1000, height = 700;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    //Defines the physics that builds the graph
    const simulation = d3.forceSimulation(nodes)         //Handle node positioning
      .force("link", d3.forceLink(links).id(d => d.id).distance(80))   //Links the nodes together
      .force("charge", d3.forceManyBody().strength(-200))  //Induces a repeling force between the nodes
      .force("center", d3.forceCenter(width / 2, height / 2));  //Pulls graph to centre of SVG

    //Defines the Node coloring in the graph
    const getNodeColor = (node) => {
      if (node.group === "event") return "lightgray";
      switch ((node.risk || '').toLowerCase()) {
        case "high": return "red";
        case "medium": return "orange";
        case "low": return "green";
        default: return "steelblue";
      }
    };

    let toolkitOpen = false; // flag to disable hover tooltip when toolkit is shown

    //Renders a line for each edge 
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 2);
    
    //Defines the floating <div> tooltips which shows when the mouse is hovered
    const tooltip = d3.select("body").append("div")
      .style("position", "absolute")
      .style("padding", "6px")
      .style("background", "#eee")
      .style("border", "1px solid #333")
      .style("border-radius", "4px")
      .style("display", "none");  //Tooltip initially hidden
      //CSS would generalise this content instead of declaring everytime


    //Sets nodes representation to circles which on hovering reveals the tooltip
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 10)  //each node is a circle of radius 10units
      .attr("fill", getNodeColor)
      .on("mouseover", (event, d) => {
        if (toolkitOpen) return; // don’t show tooltip if toolkit is open
        d3.select(event.currentTarget).transition().attr("r", 15);
        tooltip.style("display", "block")   //shows tooltip and fills with given HTML
          .html(`<strong>${d.label}</strong><br/>Type: ${d.group}<br/>Risk: ${d.risk || 'N/A'}`);
      })
      .on("mousemove", event => {
        if (toolkitOpen) return;
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", (event) => {
        if (toolkitOpen) return;
        d3.select(event.currentTarget).transition().attr("r", 10);
        tooltip.style("display", "none");
      })
      // Click handler for suspect node selection


    .on("click", async (event, d) => {
       if (d.group !== 'suspect') return;
       toolkitOpen = true;
       tooltip.style("display", "none");

  // FETCH RICH SUSPECT DATA FROM /api/search
  let suspectData = null;
  try {
    const res = await fetch(`http://localhost:5000/api/search?name=${encodeURIComponent(d.label)}`);
    const data = await res.json();
    suspectData = data.find(s => s.suspect_id === d.id);  // find exact match
  } catch (err) {
    console.error("Error fetching suspect details:", err);
  }

  const neighborIds = new Set();
  links.forEach(l => {
    if (l.source.id === d.id) neighborIds.add(l.target.id);
    if (l.target.id === d.id) neighborIds.add(l.source.id);
  });
  neighborIds.add(d.id);

  node.attr("fill", n => neighborIds.has(n.id) ? getNodeColor(n) : "#ccc")
      .attr("opacity", n => neighborIds.has(n.id) ? 1 : 0.3);
  link.attr("stroke", l => (l.source.id === d.id || l.target.id === d.id) ? "#333" : "#bbb")
      .attr("opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.2);
  label.attr("fill", n => neighborIds.has(n.id) ? "black" : "#aaa")
       .attr("font-weight", n => n.id === d.id ? "bold" : "normal");

  // TOOLKIT PANEL CONTENT
  const panelHtml = suspectData ? `
    <div style='font-size:15px;'><strong>${suspectData.name}</strong></div>
    <div><strong>Age:</strong> ${suspectData.age}</div>
    <div><strong>Nationality:</strong> ${suspectData.nationality}</div>
    <div><strong>Last Seen City:</strong> ${suspectData.last_seen_city}</div>
    <div><strong>Coordinates:</strong> ${suspectData.last_seen_coordinates}</div>
    <div><strong>Associated Events:</strong> ${suspectData.associated_events.join(", ")}</div>
    <button id="reset-button" style="margin-top:10px;padding:5px 10px;">Reset</button>
  ` : `
    <div><strong>Error:</strong> Failed to load suspect details.</div>
    <button id="reset-button" style="margin-top:10px;padding:5px 10px;">Reset</button>
  `;


  toolkitPanel.html(panelHtml)
    .style("display", "block")
    .style("left", (event.pageX + 20) + "px")
    .style("top", (event.pageY - 20) + "px");

  d3.select("#reset-button").on("click", () => {
    toolkitPanel.style("display", "none");
    toolkitOpen = false;
    node.attr("fill", getNodeColor).attr("opacity", 1).transition().attr("r",10);
    link.attr("stroke", "#999").attr("opacity", 1);
    label.attr("fill", "black").attr("font-weight", "normal");
  });
});




    // Toolkit panel for suspect details
    const toolkitPanel = d3.select("body").append("div")
      .attr("id", "toolkit-panel")
      .style("position", "absolute")
      .style("padding", "12px")
      .style("background", "#fff")
      .style("border", "2px solid #333")
      .style("border-radius", "8px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.2)")
      .style("display", "none")
      .style("z-index", 1000);

    //Provides visible names on the nodes
    const label = svg.append("g") //Appends new <g> group element to <svg>
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text(d => d.label)
      .attr("font-size", "12px")
      .attr("fill", "black")
      .attr("pointer-events", "none"); // Let mouse events pass through labels

    //Handles the updates efficiently
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
      tooltip.remove();
      toolkitPanel.remove();
    };
  }, [graphData]);

  //Returns the SVG canvas centered in its parent
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', overflow: 'auto' }}>
      <svg ref={svgRef} width={1000} height={700} style={{ display: 'block', margin: 'auto' , transform: 'translateX(-100px)'}}></svg>
    </div>
  );
};

export default GraphViewer;

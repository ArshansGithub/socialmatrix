// GraphVisualization.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FaQuestionCircle } from 'react-icons/fa';

/**
 * Helper function to determine icon URL based on person's name or gender.
 */
const getIconUrl = (person) => {
  const lowerName = person.id.toLowerCase();

  if (lowerName === 'arshan') {
    return process.env.PUBLIC_URL + '/arshan.svg';
  }
  if (lowerName === 'joon') {
    return process.env.PUBLIC_URL + '/joon.svg';
  }
  if (lowerName === 'ethan') {
    return process.env.PUBLIC_URL + '/ethan.svg';
  }

  if (person.gender === 'female') {
    return process.env.PUBLIC_URL + '/female.svg';
  }
  return process.env.PUBLIC_URL + '/male.svg';
};

/**
 * Calculate node radius based on name length.
 */
function calculateRadius(name) {
  const baseRadius = 15;
  const extra = name.length * 2;
  return baseRadius + extra;
}

/**
 * Calculate font size based on name length.
 */
function calculateFontSize(name) {
  const base = 12;
  const maxLen = 10;
  if (name.length <= maxLen) return base;
  return Math.max(base - (name.length - maxLen) * 0.5, 8);
}

function GraphVisualization({
  title,
  people,
  friendships,
  setFriendships,
  networkLabel,
  removePerson,
  readOnly = false,
  onNodeClick, // Callback for node clicks
  selectedNodes = [], // Array of selected node IDs
}) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  /**
   * Remove a friendship between two people.
   */
  const removeFriendshipHandler = (s, t) => {
    if (readOnly) return;
    console.log(`[GraphVisualization - ${title}] Attempting to remove friendship between ${s} and ${t}`);
    if (window.confirm(`Remove friendship between ${s} and ${t}?`)) {
      const updated = friendships.filter(f =>
        !((f.source === s && f.target === t) || (f.source === t && f.target === s))
      );
      setFriendships(updated);
      console.log(`[GraphVisualization - ${title}] Removed friendship between ${s} and ${t}.`);
    }
  };

  /**
   * Add a random friendship within the network.
   */
  const addRandomFriendship = () => {
    if (readOnly) return;
    console.log(`[GraphVisualization - ${title}] Adding a random friendship.`);
    if (people.length < 2) {
      alert('Not enough people for random friendship.');
      console.warn(`[GraphVisualization - ${title}] Not enough people to add a friendship.`);
      return;
    }
    const notFriends = [];
    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const p1 = people[i].name;
        const p2 = people[j].name;
        const exist = friendships.some(f =>
          (f.source === p1 && f.target === p2) ||
          (f.source === p2 && f.target === p1)
        );
        if (!exist) {
          notFriends.push([p1, p2]);
        }
      }
    }
    if (notFriends.length === 0) {
      alert('All possible friendships exist already!');
      console.warn(`[GraphVisualization - ${title}] All possible friendships already exist.`);
      return;
    }
    const rnd = Math.floor(Math.random() * notFriends.length);
    const [s, t] = notFriends[rnd];
    setFriendships([...friendships, { source: s, target: t }]);
    console.log(`[GraphVisualization - ${title}] Added friendship between ${s} and ${t}.`);
  };

  /**
   * useEffect to build the D3 force-directed graph.
   */
  useEffect(() => {
    console.log(`[GraphVisualization - ${title}] Rendering graph.`);
    if (!svgRef.current || people.length === 0) {
      console.log(`[GraphVisualization - ${title}] No people to display.`);
      return;
    }

    // Clear any old drawing
    d3.select(svgRef.current).selectAll("*").remove();

    // Filter out invalid edges
    const validEdges = friendships.filter(f =>
      people.some(p => p.name === f.source) &&
      people.some(p => p.name === f.target)
    );
    console.log(`[GraphVisualization - ${title}] Valid friendships count:`, validEdges.length);

    // Setup width/height
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g');

    // Map data for nodes/links
    const nodes = people.map(p => ({
      id: p.name,
      gender: p.gender,
      network: p.network || networkLabel,
    }));
    const links = validEdges.map(f => ({
      source: f.source,
      target: f.target
    }));
    console.log(`[GraphVisualization - ${title}] Nodes count:`, nodes.length);
    console.log(`[GraphVisualization - ${title}] Links count:`, links.length);

    // Build simulation
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => calculateRadius(d.id) + 10))
      .on('tick', ticked);

    simulationRef.current = sim;

    // Link selection
    const linkSel = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke-width', 2)
      .attr('class', 'link')
      .on('click', (evt, d) => {
        console.log(`[GraphVisualization - ${title}] Link clicked between ${d.source.id} and ${d.target.id}`);
        if (!readOnly) {
          evt.stopPropagation();
          removeFriendshipHandler(d.source.id, d.target.id);
        }
      })
      .on('mouseover', function () {
        d3.select(this).classed("link-hover", true);
      })
      .on('mouseout', function () {
        d3.select(this).classed("link-hover", false);
      });

    // Node selection
    const nodeSel = svg.append('g')
      .selectAll('g.node')
      .data(nodes)
      .enter().append('g')
      .attr('class', d => selectedNodes.includes(d.id) ? 'node selected-node' : 'node')
      .on('click', (evt, d) => {
        if (!readOnly && typeof onNodeClick === 'function') {
          console.log(`[GraphVisualization - ${title}] Node clicked: ${d.id}`);
          evt.stopPropagation();
          onNodeClick(d.id);
        }
      })
      .on('contextmenu', (evt, d) => {
        evt.preventDefault();
        console.log(`[GraphVisualization - ${title}] Context menu on node: ${d.id}`);
        if (!readOnly && typeof removePerson === 'function') {
          const confirmDelete = window.confirm(`Delete "${d.id}"?`);
          if (confirmDelete) {
            console.log(`[GraphVisualization - ${title}] Removing person: ${d.id}`);
            removePerson(d.id);
          }
        }
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Circles with network-specific styling
    nodeSel.append('circle')
      .attr('class', d => {
        if (networkLabel === 'C') {
          return "node-background network-c";
        } else if (d.network === 'B') {
          return "node-background network-b";
        } else {
          return "node-background network-a";
        }
      })
      .attr('r', 25)
      .attr('fill', 'none')
      .attr('stroke', 'transparent');

    // Icons
    nodeSel.append('image')
      .attr('class', 'node-image')
      .attr('x', -20)
      .attr('y', -20)
      .attr('width', 40)
      .attr('height', 40)
      .attr('xlink:href', d => getIconUrl(d));

    // Labels
    nodeSel.append('text')
      .text(d => d.id)
      .attr('x', 0)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => calculateFontSize(d.id) + "px")
      .attr('fill', 'black')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Ticked => update positions
    function ticked() {
      nodes.forEach(node => {
        const pad = calculateRadius(node.id) + 10;
        node.x = Math.max(pad, Math.min(width - pad, node.x));
        node.y = Math.max(pad, Math.min(height - pad, node.y));
      });

      linkSel
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodeSel
        .attr('transform', d => `translate(${d.x},${d.y})`);
    }

    // Drag handlers
    function dragstarted(evt, d) {
      if (!evt.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      console.log(`[GraphVisualization - ${title}] Drag started on node: ${d.id}`);
    }
    function dragged(evt, d) {
      d.fx = evt.x;
      d.fy = evt.y;
      console.log(`[GraphVisualization - ${title}] Dragging node: ${d.id} to (${d.fx}, ${d.fy})`);
    }
    function dragended(evt, d) {
      if (!evt.active) sim.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      console.log(`[GraphVisualization - ${title}] Drag ended on node: ${d.id}`);
    }

    // Cleanup
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
        console.log(`[GraphVisualization - ${title}] Simulation stopped.`);
      }
    };
  }, [people, friendships, networkLabel, readOnly, title, removeFriendshipHandler, onNodeClick, selectedNodes]);

  /**
   * Explanation Handler
   */
  const explainGraph = () => {
    console.log(`[GraphVisualization - ${title}] User requested explanation for the graph.`);
    alert(
      "Graph Visualization:\n\n" +
      "• Displays the network of people and their friendships.\n" +
      "• Nodes represent people, and edges represent friendships.\n" +
      "• Click on nodes to select and create friendships.\n" +
      "• Right-click on nodes to delete a person.\n" +
      "• Hover over edges to highlight them.\n\n" +
      "Use the controls above the graph to add random friendships or manipulate the network."
    );
  };

  return (
    <div className="bg-white p-2 rounded shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-center">{title}</h3>
        <FaQuestionCircle
          onClick={explainGraph}
          className="text-gray-500 hover:text-gray-700 cursor-pointer"
          title="Learn about Graph Visualization"
        />
      </div>

      {/* Show random connection button only if not readOnly */}
      {!readOnly && (
        <div className="flex justify-center mb-2">
          <button
            onClick={addRandomFriendship}
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded font-bold"
          >
            Random Connection
          </button>
        </div>
      )}

      <svg ref={svgRef} className="w-full h-80"></svg>
    </div>
  );
}

export default GraphVisualization;
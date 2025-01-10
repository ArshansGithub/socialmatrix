import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const getIconUrl = (person) => {
  const lowerName = person.id.toLowerCase();

  // If the person's name is "arshan", load /arshan.svg from the public folder
  if (lowerName === 'arshan') {
    return process.env.PUBLIC_URL + '/arshan.svg';
  }
  if (lowerName === 'joon') {
    return process.env.PUBLIC_URL + '/joon.svg';
  }
  if (lowerName === 'ethan') {
    return process.env.PUBLIC_URL + '/ethan.svg';
  }

  // Otherwise, pick female/male from public:
  if (person.gender === 'female') {
    return process.env.PUBLIC_URL + '/female.svg';
  }
  return process.env.PUBLIC_URL + '/male.svg';
};

function calculateRadius(name) {
  const baseRadius = 15;
  const extra = name.length * 2;
  return baseRadius + extra;
}

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
  readOnly = false
}) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  const selectedNodesRef = useRef([]);

  // 1) Add a random connection inside this network (only if not readOnly)
  const addRandomFriendship = () => {
    if (readOnly) return;
    if (people.length < 2) {
      alert('Not enough people for random friendship.');
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
      return;
    }
    const rnd = Math.floor(Math.random() * notFriends.length);
    const [s, t] = notFriends[rnd];
    setFriendships([...friendships, { source: s, target: t }]);
  };

  // 2) Handle node click => dispatch custom event
  const handleNodeClick = (d) => {
    if (readOnly) return;
    const evt = new CustomEvent('nodeClick', { detail: d.id });
    window.dispatchEvent(evt);
  };

  // 3) Handle selection logic upon 'nodeClick' event
  const handleSelection = (e) => {
    if (readOnly) return;
    const selId = e.detail;
    const selNodes = selectedNodesRef.current;

    if (selNodes.length === 0) {
      // First node selected
      selNodes.push(selId);
      highlightNode(selId, true);

    } else if (selNodes.length === 1) {
      if (selNodes[0] === selId) {
        // Same node => unhighlight
        highlightNode(selId, false);
        selNodes.pop();
      } else {
        // Different node => create friendship if none
        const exists = friendships.some(f =>
          (f.source === selNodes[0] && f.target === selId) ||
          (f.source === selId && f.target === selNodes[0])
        );
        if (exists) {
          alert('Friendship already exists in this network.');
        } else {
          setFriendships([...friendships, { source: selNodes[0], target: selId }]);
        }
        highlightNode(selNodes[0], false);
        highlightNode(selId, false);
        selectedNodesRef.current = [];
      }
    }
  };

  // 4) Toggle highlight on a node
  const highlightNode = (id, highlight) => {
    d3.select(svgRef.current)
      .selectAll("g.node")
      .filter(d => d && d.id === id)
      .classed("selected-node", highlight);
  };

  // 5) Remove a friendship on link click (only if not readOnly)
  const removeFriendship = (s, t) => {
    if (readOnly) return;
    if (window.confirm(`Remove friendship between ${s} and ${t}?`)) {
      const updated = friendships.filter(f =>
        !((f.source === s && f.target === t) || (f.source === t && f.target === s))
      );
      setFriendships(updated);
    }
  };

  // 6) useEffect => build the D3 force-directed graph
  useEffect(() => {
    if (!svgRef.current || people.length === 0) return;

    // Clear any old drawing
    d3.select(svgRef.current).selectAll("*").remove();

    // Filter out invalid edges
    const validEdges = friendships.filter(f =>
      people.some(p => p.name === f.source) &&
      people.some(p => p.name === f.target)
    );

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
        // Only if not readOnly
        if (!readOnly) {
          evt.stopPropagation();
          removeFriendship(d.source.id, d.target.id);
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
      .attr('class', 'node')
      .on('click', (evt, d) => {
        if (!readOnly) {
          evt.stopPropagation();
          handleNodeClick(d);
        }
      })
      .on('contextmenu', (evt, d) => {
        // Prevent default menu
        evt.preventDefault();
        // If readOnly => do nothing. If not readOnly => remove?
        if (!readOnly && typeof removePerson === 'function') {
          const confirmDelete = window.confirm(`Delete "${d.id}"?`);
          if (confirmDelete) {
            removePerson(d.id);
          }
        }
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Circles
    nodeSel.append('circle')
      .attr('class', d => d.network === 'B' ? "node-background network-b" : "node-background")
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
    }
    function dragged(evt, d) {
      d.fx = evt.x;
      d.fy = evt.y;
    }
    function dragended(evt, d) {
      if (!evt.active) sim.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [people, friendships, networkLabel, readOnly]);

  // Listen for 'nodeClick' => handleSelection
  useEffect(() => {
    if (readOnly) return; // skip selection in read-only
    window.addEventListener('nodeClick', handleSelection);
    return () => {
      window.removeEventListener('nodeClick', handleSelection);
    };
  }, [friendships, readOnly]);

  return (
    <div className="bg-white p-2 rounded shadow">
      <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>

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
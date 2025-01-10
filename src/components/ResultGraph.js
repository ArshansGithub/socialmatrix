// ResultGraph.js
import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import GraphVisualization from './GraphVisualization';
import TablesAndSuggestions from './TablesAndSuggestions';

function ResultGraph({ peopleResult = [], friendshipsResult = [] }) {
  console.log('[ResultGraph] Rendering ResultGraph component.');

  // read-only => pass readOnly=true
  const noOp = () => {
    console.log('[ResultGraph] setFriendships called (no-op)');
  };

  const explainResultGraph = () => {
    console.log('[ResultGraph] User requested explanation for Result Graph.');
    alert(
      "Result Graph:\n\n" +
      "• Displays the outcome of matrix operations (A+B, A-B, A×B) on the unified set of nodes.\n" +
      "• The adjacency matrix, friend count, and suggestions here reflect this new combined or transformed network.\n\n" +
      "Real-World Application:\n" +
      "• Visualize merged or modified social networks.\n" +
      "• Analyze potential 'friend of friend' links (via multiplication).\n" +
      "• Study differences between networks (via subtraction).\n\n" +
      "Implementation:\n" +
      "1. Matrices are built for a unified node set.\n" +
      "2. The operation modifies the adjacency.\n" +
      "3. We re-map adjacency -> edges -> D3 graph.\n" +
      "4. Stats like adjacency matrix and suggestions are recalculated."
    );
  };

  return (
    <div className="bg-white rounded shadow p-4 sm:p-3 mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Result Graph</h3>
          <FaQuestionCircle
            onClick={explainResultGraph}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            title="Learn about the Result Graph"
          />
        </div>
        <p className="text-sm text-gray-600">
          {peopleResult.length} people, {friendshipsResult.length} friendships
        </p>
      </div>

      <GraphVisualization
        title="(Result)"
        people={peopleResult.map(p => ({ ...p, network: 'C' }))} // Ensure network label is 'C' for the result graph
        friendships={friendshipsResult}
        setFriendships={noOp}
        networkLabel="C"
        readOnly={true} // Set readOnly to true
      />

      {/* Show stats (adjacency, friend count, suggestions) for the result */}
      <TablesAndSuggestions
        people={peopleResult}
        friendships={friendshipsResult}
      />
    </div>
  );
}

export default ResultGraph;
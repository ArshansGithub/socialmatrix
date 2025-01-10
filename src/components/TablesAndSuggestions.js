import React, { useEffect, useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

function buildAdjacencyMatrix(people, friendships) {
  console.log('[TablesAndSuggestions] Building adjacency matrix.');
  const n = people.length;
  const nameToIndex = {};
  people.forEach((p, i) => (nameToIndex[p.name] = i));

  const matrix = Array.from({ length: n }, () => Array(n).fill(0));
  friendships.forEach((f) => {
    const i = nameToIndex[f.source];
    const j = nameToIndex[f.target];
    if (i !== undefined && j !== undefined) {
      matrix[i][j] = 1;
      matrix[j][i] = 1;
    }
  });
  console.log('[TablesAndSuggestions] Adjacency matrix built.');
  return matrix;
}

function multiply(A, B) {
  console.log('[TablesAndSuggestions] Multiplying matrices.');
  const n = A.length;
  const C = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[i][k] * B[k][j];
      }
      C[i][j] = sum;
    }
  }
  console.log('[TablesAndSuggestions] Matrices multiplied.');
  return C;
}

function TablesAndSuggestions({ people, friendships }) {
  console.log('[TablesAndSuggestions] Rendering TablesAndSuggestions component.');
  const adjacency = buildAdjacencyMatrix(people, friendships);

  // Friend Count
  const friendCounts = people.map((p) => {
    const c = friendships.filter((f) => f.source === p.name || f.target === p.name).length;
    return { name: p.name, count: c };
  }).sort((a, b) => b.count - a.count);
  console.log('[TablesAndSuggestions] Calculated friend counts.');

  // Friend Suggestions
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    console.log('[TablesAndSuggestions] Calculating friend suggestions.');
    if (people.length === 0) {
      setSuggestions([]);
      console.log('[TablesAndSuggestions] No people to suggest friends for.');
      return;
    }
    const A = adjacency;
    const A2 = multiply(A, A);
    const sugs = [];
    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        // A[i][j] === 0 => not currently friends
        // A2[i][j] > 0 => they share at least 1 mutual friend
        if (A[i][j] === 0 && A2[i][j] > 0) {
          sugs.push({
            p1: people[i].name,
            p2: people[j].name,
            mutualCount: A2[i][j],
          });
        }
      }
    }
    sugs.sort((x, y) => y.mutualCount - x.mutualCount);
    setSuggestions(sugs.slice(0, 10));
    console.log(`[TablesAndSuggestions] Generated ${sugs.length} suggestions.`);
  }, [people, friendships, adjacency]);

  const explainSuggestions = () => {
    console.log('[TablesAndSuggestions] User requested explanation for Friend Suggestions.');
    alert(
      "Friend Suggestions:\n\n" +
      "• We compute A² (A multiplied by itself) to see how many '2-step paths' exist between two people.\n" +
      "• If A[i][j] == 0 (they're not friends) but A²[i][j] > 0 (they share mutual friends), we suggest they connect.\n\n" +
      "Real-World:\n" +
      "• 'Recommended friends' (social networks)\n" +
      "• 'People you may know' features\n" +
      "• Suggesting new connections to strengthen clusters."
    );
  };

  return (
    <div className="mt-4">
      {/* Adjacency + Friend Count in a grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Adjacency */}
        <div className="bg-white p-2 rounded shadow overflow-auto max-h-64 text-xs sm:text-sm">
          <h3 className="font-semibold mb-2 text-center">Adjacency Matrix</h3>
          {people.length === 0 ? (
            <p className="text-sm">No people yet.</p>
          ) : (
            <table className="table-auto border-collapse w-full">
              <thead>
                <tr className="bg-gray-200">
                  <th></th>
                  {people.map((p) => (
                    <th key={p.name} className="border p-1">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {people.map((rp, i) => (
                  <tr key={rp.name}>
                    <th className="bg-gray-200 border p-1">{rp.name}</th>
                    {people.map((cp, j) => {
                      const val = adjacency[i][j];
                      return (
                        <td
                          key={cp.name}
                          className={`border p-1 text-center ${val === 1 ? 'bg-green-100' : ''}`}
                        >
                          {i === j ? '-' : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Friend Count */}
        <div className="bg-white p-2 rounded shadow overflow-auto max-h-64 text-xs sm:text-sm">
          <h3 className="font-semibold mb-2 text-center">Friend Count</h3>
          {friendCounts.length === 0 ? (
            <p className="text-sm">No people yet.</p>
          ) : (
            <table className="table-auto border-collapse w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-1">Person</th>
                  <th className="border p-1"># Friends</th>
                </tr>
              </thead>
              <tbody>
                {friendCounts.map((fc) => (
                  <tr key={fc.name}>
                    <td className="border p-1">{fc.name}</td>
                    <td className="border p-1 text-center">{fc.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Friend Suggestions */}
      <div className="bg-white p-2 rounded shadow mt-4 text-xs sm:text-sm">
        <div className="flex items-center justify-center mb-2 gap-2">
          <h3 className="font-semibold text-center">Friend Suggestions</h3>
          <FaQuestionCircle
            onClick={explainSuggestions}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            title="Learn about Friend Suggestions"
          />
        </div>
        {suggestions.length === 0 ? (
          <p className="text-sm text-center">No suggestions right now.</p>
        ) : (
          <table className="table-auto border-collapse w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-1">Person A</th>
                <th className="border p-1">Person B</th>
                <th className="border p-1">Mutual Friends</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map((s, idx) => (
                <tr key={idx}>
                  <td className="border p-1">{s.p1}</td>
                  <td className="border p-1">{s.p2}</td>
                  <td className="border p-1 text-center">{s.mutualCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default TablesAndSuggestions;
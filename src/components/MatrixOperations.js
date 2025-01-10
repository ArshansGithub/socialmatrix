import React from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

/** 
 * Unifies the people from both networks into a single sorted list
 * (to ensure consistent indexing).
 * Returns { unifiedPeople, adjA, adjB }, 
 * where adjA/adjB are adjacency matrices matching the union of people.
 */
function unifyPeopleAndBuildAdj(peopleA, friendshipsA, peopleB, friendshipsB) {
  // 1) Build a set of all names from both networks
  const nameSet = new Set();
  peopleA.forEach(p => nameSet.add(p.name));
  peopleB.forEach(p => nameSet.add(p.name));

  // 2) Convert set to array & sort by name (or however you prefer)
  const unifiedNames = Array.from(nameSet).sort();

  // 3) Build "unifiedPeople" with gender/network info if available from A or B
  // (We default to data from A if person is in A, else from B, or merge logic)
  const unifiedPeople = unifiedNames.map(name => {
    // Try to find person in A or B
    const foundA = peopleA.find(p => p.name === name);
    const foundB = peopleB.find(p => p.name === name);
    return foundA || foundB; 
  });

  // 4) Helper to build adjacency for the "unified" list
  function buildAdjMatrixForUnified(peopleSource, friendshipsSource) {
    // Map from name -> index in the unified array
    const nameToIndex = {};
    unifiedNames.forEach((nm, idx) => {
      nameToIndex[nm] = idx;
    });

    const n = unifiedNames.length;
    const M = Array.from({ length: n }, () => Array(n).fill(0));

    friendshipsSource.forEach(f => {
      const i = nameToIndex[f.source];
      const j = nameToIndex[f.target];
      if (i !== undefined && j !== undefined) {
        M[i][j] = 1;
        M[j][i] = 1; // undirected
      }
    });
    return M;
  }

  const adjA = buildAdjMatrixForUnified(peopleA, friendshipsA);
  const adjB = buildAdjMatrixForUnified(peopleB, friendshipsB);

  return { unifiedPeople, adjA, adjB };
}

/** Union => (A[i][j] || B[i][j]) */
function addMatrices(A, B) {
  const n = A.length;
  const C = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      C[i][j] = A[i][j] === 1 || B[i][j] === 1 ? 1 : 0;
    }
  }
  return C;
}

/** Subtraction => edges in A but not in B => (A[i][j]===1 && B[i][j]===0 ? 1 : 0) */
function subtractMatrices(A, B) {
  const n = A.length;
  const C = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      C[i][j] = (A[i][j] === 1 && B[i][j] === 0) ? 1 : 0;
    }
  }
  return C;
}

/** Multiplication => standard adjacency multiply => result[i][j] = 1 if sum > 0 */
function multiplyMatrices(A, B) {
  const n = A.length;
  const C = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += A[i][k] * B[k][j];
      }
      C[i][j] = sum > 0 ? 1 : 0;
    }
  }
  return C;
}

/** Convert adjacency matrix -> { newPeople, newFriendships } */
function matrixToNetwork(matrix, unifiedPeople) {
  const n = matrix.length;
  const newPeople = unifiedPeople.map(p => ({ ...p }));
  const newFriendships = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][j] === 1) {
        newFriendships.push({
          source: newPeople[i].name,
          target: newPeople[j].name,
        });
      }
    }
  }
  return { newPeople, newFriendships };
}

function MatrixOperations({
  peopleA, friendshipsA,
  peopleB, friendshipsB,
  peopleResult, setPeopleResult,
  friendshipsResult, setFriendshipsResult
}) {
  const explain = () => {
    alert(
      "Matrix Operations:\n\n" +
      "• A + B => Merges edges (union) for the unified set of people.\n" +
      "• A - B => Keeps edges in A but not in B.\n" +
      "• A x B => If there's a 2-step path, we create a new edge.\n\n" +
      "Implementation:\n" +
      "1. We unify the people sets from A & B.\n" +
      "2. We build adjacency matrices that match this unified set.\n" +
      "3. We perform standard matrix operations on them.\n" +
      "4. The result is converted back to a new (people, friendships) network.\n\n" +
      "Real World Usage:\n" +
      "• Merging two social networks.\n" +
      "• Finding unique vs shared edges.\n" +
      "• Exploring 2-step paths that might suggest 'friend-of-a-friend' relationships.\n\n" +
      "Click 'Clear Result' to empty the result graph."
    );
  };

  const handleAdd = () => {
    const { unifiedPeople, adjA, adjB } = unifyPeopleAndBuildAdj(
      peopleA, friendshipsA,
      peopleB, friendshipsB
    );
    const sum = addMatrices(adjA, adjB);
    const { newPeople, newFriendships } = matrixToNetwork(sum, unifiedPeople);
    setPeopleResult(newPeople);
    setFriendshipsResult(newFriendships);
    alert("A + B => Union of edges. Check the Result Graph below!");
  };

  const handleSubtract = () => {
    const { unifiedPeople, adjA, adjB } = unifyPeopleAndBuildAdj(
      peopleA, friendshipsA,
      peopleB, friendshipsB
    );
    const diff = subtractMatrices(adjA, adjB);
    const { newPeople, newFriendships } = matrixToNetwork(diff, unifiedPeople);
    setPeopleResult(newPeople);
    setFriendshipsResult(newFriendships);
    alert("A - B => Edges in A not in B. Check the Result Graph!");
  };

  const handleMultiply = () => {
    const { unifiedPeople, adjA, adjB } = unifyPeopleAndBuildAdj(
      peopleA, friendshipsA,
      peopleB, friendshipsB
    );
    const prod = multiplyMatrices(adjA, adjB);
    const { newPeople, newFriendships } = matrixToNetwork(prod, unifiedPeople);
    setPeopleResult(newPeople);
    setFriendshipsResult(newFriendships);
    alert("A × B => edges if there's a 2-step path. Check the Result Graph!");
  };

  const handleClear = () => {
    setPeopleResult([]);
    setFriendshipsResult([]);
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-4 sm:p-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Matrix Operations (A & B)</h2>
        <FaQuestionCircle
          onClick={explain}
          className="text-gray-500 hover:text-gray-700 cursor-pointer"
          title="Learn about Matrix Operations"
        />
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Use these operations on the unified adjacency matrices of A & B, then see the result below.
      </p>

      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-3 py-2 rounded text-sm"
        >
          A + B => Result
        </button>
        <button
          onClick={handleSubtract}
          className="bg-yellow-600 text-white px-3 py-2 rounded text-sm"
        >
          A - B => Result
        </button>
        <button
          onClick={handleMultiply}
          className="bg-purple-600 text-white px-3 py-2 rounded text-sm"
        >
          A x B => Result
        </button>
        <button
          onClick={handleClear}
          className="bg-red-600 text-white px-3 py-2 rounded text-sm"
        >
          Clear Graph
        </button>
      </div>
    </div>
  );
}

export default MatrixOperations;
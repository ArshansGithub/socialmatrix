import React, { useState } from 'react';
import NetworkPanel from './components/NetworkPanel';
import MatrixOperations from './components/MatrixOperations';
import TransformedNetwork from './components/TransformedNetwork'; // Renamed import

function App() {
  // Network A
  const [peopleA, setPeopleA] = useState([]);
  const [friendshipsA, setFriendshipsA] = useState([]);

  function removePersonA(personName) {
    setPeopleA(prev => prev.filter(p => p.name !== personName));
    setFriendshipsA(prev =>
      prev.filter(
        f => f.source !== personName && f.target !== personName
      )
    );
  }

  // Network B
  const [peopleB, setPeopleB] = useState([]);
  const [friendshipsB, setFriendshipsB] = useState([]);

  function removePersonB(personName) {
    setPeopleB(prev => prev.filter(p => p.name !== personName));
    setFriendshipsB(prev =>
      prev.filter(
        f => f.source !== personName && f.target !== personName
      )
    );
  }

  // Transformed result from matrix ops (A+B, A-B, A×B)
  const [peopleResult, setPeopleResult] = useState([]);
  const [friendshipsResult, setFriendshipsResult] = useState([]);

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <h1 className="text-3xl font-bold text-center mb-4">
        SocialMatrix - Made by Arshan - Group: Ethan, Joon
      </h1>

      {/* Side-by-side Networks: A and B (moved up) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <NetworkPanel
          title="Network A"
          networkLabel="A"
          people={peopleA}
          setPeople={setPeopleA}
          friendships={friendshipsA}
          setFriendships={setFriendshipsA}
          removePerson={removePersonA}
        />
        <NetworkPanel
          title="Network B"
          networkLabel="B"
          people={peopleB}
          setPeople={setPeopleB}
          friendships={friendshipsB}
          setFriendships={setFriendshipsB}
          removePerson={removePersonB}
        />
      </div>

      {/* Matrix Ops => merges or modifies A & B => sets the result */}
      <MatrixOperations
        peopleA={peopleA}
        friendshipsA={friendshipsA}
        peopleB={peopleB}
        friendshipsB={friendshipsB}
        peopleResult={peopleResult}
        setPeopleResult={setPeopleResult}
        friendshipsResult={friendshipsResult}
        setFriendshipsResult={setFriendshipsResult}
      />

      {/* Show the Transformed Network */}
      <TransformedNetwork
        peopleResult={peopleResult}
        friendshipsResult={friendshipsResult}
      />
    </div>
  );
}

export default App;
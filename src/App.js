// App.js
import React, { useState, useEffect } from 'react';
import NetworkPanel from './components/NetworkPanel';
import MatrixOperations from './components/MatrixOperations';
import ResultGraph from './components/ResultGraph';

function App() {
  // Network A State
  const [peopleA, setPeopleA] = useState([]);
  const [friendshipsA, setFriendshipsA] = useState([]);

  useEffect(() => {
    console.log('[App] Network A updated:', { peopleA, friendshipsA });
  }, [peopleA, friendshipsA]);

  // Remove Person from Network A
  function removePersonA(personName) {
    console.log(`[App] Removing person ${personName} from Network A.`);
    setPeopleA(prev => prev.filter(p => p.name !== personName));
    setFriendshipsA(prev =>
      prev.filter(
        f => f.source !== personName && f.target !== personName
      )
    );
  }

  // Network B State
  const [peopleB, setPeopleB] = useState([]);
  const [friendshipsB, setFriendshipsB] = useState([]);

  useEffect(() => {
    console.log('[App] Network B updated:', { peopleB, friendshipsB });
  }, [peopleB, friendshipsB]);

  // Remove Person from Network B
  function removePersonB(personName) {
    console.log(`[App] Removing person ${personName} from Network B.`);
    setPeopleB(prev => prev.filter(p => p.name !== personName));
    setFriendshipsB(prev =>
      prev.filter(
        f => f.source !== personName && f.target !== personName
      )
    );
  }

  // Result Graph State
  const [peopleResult, setPeopleResult] = useState([]);
  const [friendshipsResult, setFriendshipsResult] = useState([]);

  useEffect(() => {
    console.log('[App] Result network updated:', { peopleResult, friendshipsResult });
  }, [peopleResult, friendshipsResult]);

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* Credits in the top right corner */}
      <div className="text-right text-sm text-gray-500">
        <p>Beta Tester: Janko Czanik</p>
      </div>

      <h1 className="text-3xl font-bold text-center mb-4">
        SocialMatrix - Made by Arshan - Group: Ethan, Joon
      </h1>

      {/* Side-by-side Networks: A and B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <NetworkPanel
          title="Network A"
          networkLabel="A"
          people={peopleA}
          setPeople={setPeopleA}
          friendships={friendshipsA}
          setFriendships={setFriendshipsA}
          removePerson={removePersonA}
          otherPeople={peopleB}
          otherFriendships={friendshipsB}
        />
        <NetworkPanel
          title="Network B"
          networkLabel="B"
          people={peopleB}
          setPeople={setPeopleB}
          friendships={friendshipsB}
          setFriendships={setFriendshipsB}
          removePerson={removePersonB}
          otherPeople={peopleA}
          otherFriendships={friendshipsA}
        />
      </div>

      {/* Matrix Operations */}
      <MatrixOperations
        peopleA={peopleA}
        friendshipsA={friendshipsA}
        peopleB={peopleB}
        friendshipsB={friendshipsB}
        setPeopleResult={setPeopleResult}
        setFriendshipsResult={setFriendshipsResult}
      />

      {/* Result Graph */}
      <ResultGraph
        peopleResult={peopleResult}
        friendshipsResult={friendshipsResult}
      />
    </div>
  );
}

export default App;
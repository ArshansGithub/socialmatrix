// NetworkPanel.js
import React, { useState, useEffect, memo } from 'react';
import { IoMdMale, IoMdFemale } from "react-icons/io";
import { FaQuestionCircle } from "react-icons/fa";
import GraphVisualization from './GraphVisualization';
import TablesAndSuggestions from './TablesAndSuggestions';
import { useRef } from 'react';

/** 
 * Memoized AddPersonForm to prevent re-renders affecting the graph
 */
const AddPersonForm = memo(function AddPersonForm({ personName, setPersonName, gender, setGender, handleAddPerson, handleAddRandomPerson, handleGenerateRandomNetwork, handleDuplicateNetwork, networkLabel }) {
  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-2 flex-wrap">
        <input
          type="text"
          value={personName}
          onChange={(e) => {
            setPersonName(e.target.value);
            console.log(`[NetworkPanel] Input person name: ${e.target.value}`);
          }}
          placeholder="Name..."
          className="flex-1 border p-2 rounded text-sm min-w-[120px]"
        />
        <button
          onClick={() => {
            setGender('male');
            console.log(`[NetworkPanel] Gender selected: Male`);
          }}
          className={`p-2 rounded text-white text-sm ${gender === 'male' ? 'bg-blue-700' : 'bg-blue-500'}`}
        >
          <IoMdMale />
        </button>
        <button
          onClick={() => {
            setGender('female');
            console.log(`[NetworkPanel] Gender selected: Female`);
          }}
          className={`p-2 rounded text-white text-sm ${gender === 'female' ? 'bg-pink-700' : 'bg-pink-500'}`}
        >
          <IoMdFemale />
        </button>
      </div>
      <div className="flex gap-2 mb-2 flex-wrap">
        <button
          onClick={handleAddPerson}
          className="bg-blue-600 text-white px-3 py-1 rounded flex-1 text-sm min-w-[120px]"
        >
          Add Person
        </button>
        <button
          onClick={handleAddRandomPerson}
          className="bg-indigo-600 text-white px-3 py-1 rounded flex-1 text-sm min-w-[120px]"
        >
          Add Random
        </button>
      </div>

      <div className='flex items-center justify-evenly'>
        {/* Generate Entire Random Network */}
        <button
          onClick={handleGenerateRandomNetwork}
          className="bg-red-600 text-white px-3 py-2 rounded w-1/3 font-bold text-sm"
        >
          Generate Random Network
        </button>
        <button 
          onClick={handleDuplicateNetwork}
          className='bg-orange-600 text-white px-3 py-2 rounded w-1/3 font-bold text-sm'>
          Duplicate Network {networkLabel === 'A' ? 'B' : 'A'}
        </button>
      </div>
    </div>
  );
});

function NetworkPanel({
  title,
  networkLabel,
  people,
  setPeople,
  friendships,
  setFriendships,
  removePerson,
  otherPeople,
  otherFriendships,
}) {
  const [personName, setPersonName] = useState('');
  const [gender, setGender] = useState('');

  // Name pools for manual additions
  const femaleNames = [
    "Alice", "Diana", "Fiona", "Hannah", "Julia", "Laura", "Nina",
    "Paula", "Rachel", "Tina", "Uma", "Wendy", "Yvonne",
  ];
  const maleNames = [
    "Bob", "Charlie", "Ethan", "George", "Ian", "Kevin", "Michael",
    "Oscar", "Quentin", "Steve", "Victor", "Xander", "Zach",
  ];

  useEffect(() => {
    console.log(`[NetworkPanel - ${title}] Initialized with ${people.length} people and ${friendships.length} friendships.`);
  }, [people, friendships, title]);

  /** Add Person (manual) */
  const handleAddPerson = () => {
    console.log(`[NetworkPanel - ${title}] Attempting to add person: ${personName}, Gender: ${gender}`);
    const trimmed = personName.trim();
    if (!trimmed) {
      alert('Enter a name, please.');
      console.warn(`[NetworkPanel - ${title}] Person name is empty.`);
      return;
    }
    if (!gender) {
      alert('Select a gender, please.');
      console.warn(`[NetworkPanel - ${title}] Gender not selected.`);
      return;
    }
    if (people.some(p => p.name === trimmed)) {
      alert(`${trimmed} already exists in ${title}.`);
      console.warn(`[NetworkPanel - ${title}] Person ${trimmed} already exists.`);
      return;
    }
    setPeople([
      ...people,
      { name: trimmed, gender, network: networkLabel }
    ]);
    console.log(`[NetworkPanel - ${title}] Added person: ${trimmed}`);
    setPersonName('');
    setGender('');
  };

  /** Add Random Person (one at a time) */
  const handleAddRandomPerson = () => {
    console.log(`[NetworkPanel - ${title}] Adding a random person.`);
    const allPool = [...femaleNames, ...maleNames];
    const used = new Set(people.map(p => p.name));
    const available = allPool.filter(n => !used.has(n));
    if (available.length === 0) {
      alert('No random names left for this network!');
      console.warn(`[NetworkPanel - ${title}] No available random names to add.`);
      return;
    }
    const isMale = Math.random() < 0.5;
    const chosenName = available[Math.floor(Math.random() * available.length)];
    setPeople([
      ...people,
      { name: chosenName, gender: isMale ? 'male' : 'female', network: networkLabel }
    ]);
    console.log(`[NetworkPanel - ${title}] Added random person: ${chosenName}, Gender: ${isMale ? 'male' : 'female'}`);
  };

  /**
   * Generate an entire random network from scratch:
   * - Clears existing people/friendships
   * - Creates 5-10 random people
   * - Creates random edges between them
   */
  const handleGenerateRandomNetwork = () => {
    console.log(`[NetworkPanel - ${title}] Generating a new random network.`);
    if (!window.confirm(`This will replace all current data in ${title} with a new random set. Continue?`)) {
      console.log(`[NetworkPanel - ${title}] User canceled random network generation.`);
      return;
    }
    // Clear existing data
    setPeople([]);
    setFriendships([]);
    console.log(`[NetworkPanel - ${title}] Cleared existing people and friendships.`);

    const newPeople = [];
    const usedNames = new Set();

    // Decide how many random people (5..10)
    const count = 5 + Math.floor(Math.random() * 6);
    console.log(`[NetworkPanel - ${title}] Generating ${count} random people.`);

    for (let i = 0; i < count; i++) {
      const isMale = Math.random() < 0.5;
      const pool = isMale ? maleNames : femaleNames;
      let rndName = pool[Math.floor(Math.random() * pool.length)];
      while (usedNames.has(rndName)) {
        rndName = pool[Math.floor(Math.random() * pool.length)];
      }
      usedNames.add(rndName);

      newPeople.push({
        name: rndName,
        gender: isMale ? 'male' : 'female',
        network: networkLabel,
      });
      console.log(`[NetworkPanel - ${title}] Generated person: ${rndName}, Gender: ${isMale ? 'male' : 'female'}`);
    }

    // Build random friendships
    const newFriendships = [];
    // 30-40% chance per pair
    const edgeProbability = 0.35;
    for (let i = 0; i < newPeople.length; i++) {
      for (let j = i + 1; j < newPeople.length; j++) {
        if (Math.random() < edgeProbability) {
          newFriendships.push({
            source: newPeople[i].name,
            target: newPeople[j].name,
          });
          console.log(`[NetworkPanel - ${title}] Created friendship between ${newPeople[i].name} and ${newPeople[j].name}`);
        }
      }
    }

    setPeople(newPeople);
    setFriendships(newFriendships);
    alert(`Generated ${count} random people in ${title}.`);
    console.log(`[NetworkPanel - ${title}] Random network generation complete.`);
  };

  /** Duplicate Network (A to B or B to A) */
  const handleDuplicateNetwork = () => {
    console.log(`[NetworkPanel - ${title}] Duplicating network ${networkLabel === 'A' ? 'B' : 'A'}`);

    // Deep copy otherPeople and update the network label
    const duplicatedPeople = otherPeople.map(p => ({ ...p, network: networkLabel }));
    // Deep copy otherFriendships
    const duplicatedFriendships = otherFriendships.map(f => ({ ...f }));

    setPeople(duplicatedPeople);
    setFriendships(duplicatedFriendships);

    console.log(`[NetworkPanel - ${title}] Network ${networkLabel === 'A' ? 'B' : 'A'} duplicated.`);
    alert(`Network ${networkLabel === 'A' ? 'B' : 'A'} duplicated into ${title}.`);
  }

  /** Explanation Handler */
  const explainPanel = () => {
    console.log(`[NetworkPanel - ${title}] User requested explanation for the panel.`);
    alert(
      `${title} Panel:\n\n` +
      "• 'Add Person' => Create a custom-named person in this network.\n" +
      "• 'Add Random' => Picks a random name/gender from the built-in list.\n" +
      "• 'Generate Random Network' => Replaces the entire network with a random set of people and friendships.\n" +
      "• 'Duplicate Network' => Copies all people and friendships from the other network into this one, making them independent.\n\n" +
      "Matrix Relevance:\n" +
      "• Each new node adds a new row & column to the adjacency matrix.\n" +
      "• The random edges will set 1 in the adjacency matrix for those node pairs.\n\n" +
      "Real-World Usage:\n" +
      "• Simulate social or organizational networks.\n" +
      "• Quick 'random' data generation for testing or demos."
    );
  };

  /** Selection logic */
  const [selectedNodes, setSelectedNodes] = useState([]);

  const handleNodeClick = (selId) => {
    console.log(`[NetworkPanel - ${title}] Handling node click: ${selId}`);
    if (selectedNodes.includes(selId)) {
      // Deselect node
      setSelectedNodes(selectedNodes.filter(id => id !== selId));
      console.log(`[NetworkPanel - ${title}] Deselected node: ${selId}`);
    } else if (selectedNodes.length < 1) {
      // Select first node
      setSelectedNodes([...selectedNodes, selId]);
      console.log(`[NetworkPanel - ${title}] Selected node: ${selId}`);
    } else if (selectedNodes.length === 1) {
      const firstId = selectedNodes[0];
      if (firstId !== selId) {
        // Attempt to create friendship
        const exists = friendships.some(f =>
          (f.source === firstId && f.target === selId) ||
          (f.source === selId && f.target === firstId)
        );
        if (exists) {
          alert('Friendship already exists in this network.');
          console.warn(`[NetworkPanel - ${title}] Friendship already exists between ${firstId} and ${selId}.`);
        } else {
          setFriendships([...friendships, { source: firstId, target: selId }]);
          console.log(`[NetworkPanel - ${title}] Created new friendship between ${firstId} and ${selId}.`);
        }
        // Reset selection
        setSelectedNodes([]);
      }
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 sm:p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{title}</h2>
          <FaQuestionCircle
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            title={`Learn about ${title}`}
            onClick={explainPanel}
          />
        </div>
        <p className="text-sm text-gray-600">
          {people.length} people, {friendships.length} friendships
        </p>
      </div>

      {/* Add Person UI */}
      <AddPersonForm 
        personName={personName}
        setPersonName={setPersonName}
        gender={gender}
        setGender={setGender}
        handleAddPerson={handleAddPerson}
        handleAddRandomPerson={handleAddRandomPerson}
        handleGenerateRandomNetwork={handleGenerateRandomNetwork}
        handleDuplicateNetwork={handleDuplicateNetwork}
        networkLabel={networkLabel}
      />

      {/* Graph */}
      <GraphVisualization
        title={title}
        people={people}
        friendships={friendships}
        setFriendships={setFriendships}
        networkLabel={networkLabel}
        removePerson={removePerson}
        readOnly={false} // Ensure readOnly is false for Network Panels
        onNodeClick={handleNodeClick} // Pass the node click handler
        selectedNodes={selectedNodes} // Pass selected nodes for highlighting
      />

      {/* Tables & Suggestions */}
      <TablesAndSuggestions
        people={people}
        friendships={friendships}
      />
    </div>
  );
}

export default NetworkPanel;
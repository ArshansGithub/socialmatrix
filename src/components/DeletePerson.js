import React, { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';

function DeletePerson({ people, setPeople, friendships, setFriendships }) {
  const [selectedPerson, setSelectedPerson] = useState('');

  const handleDeletePerson = () => {
    console.log('[DeletePerson] Attempting to delete:', selectedPerson);
    if (selectedPerson === '') {
      alert('Please select a person to delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedPerson}? This will remove all their friendships.`)) {
      const updatedPeople = people.filter(p => p.name !== selectedPerson);
      const updatedFriendships = friendships.filter(f => f.source !== selectedPerson && f.target !== selectedPerson);
      setPeople(updatedPeople);
      setFriendships(updatedFriendships);
      console.log('[DeletePerson] Deleted person and removed associated friendships.');
      setSelectedPerson('');
    }
  };

  const explainDeletePerson = () => {
    alert(
      "Delete Person: Removes this person (and any connections) from the graph.\n" +
      "In matrix form, it removes their row and column from the adjacency matrix, effectively shrinking the matrix dimension."
    );
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-semibold">Delete Person</h2>
        <FaQuestionCircle 
          className="text-gray-500 hover:text-gray-700 cursor-pointer" 
          onClick={explainDeletePerson} 
          title="Learn about Delete Person"
        />
      </div>

      <select 
        value={selectedPerson} 
        onChange={(e) => setSelectedPerson(e.target.value)} 
        className="w-full p-2 border rounded mb-2"
      >
        <option value="">Select Person to Delete</option>
        {people.map(person => (
          <option key={person.name} value={person.name}>{person.name}</option>
        ))}
      </select>
      <button 
        onClick={handleDeletePerson} 
        className="w-full bg-red-500 text-white p-2 rounded"
      >
        Delete Person
      </button>
    </div>
  );
}

export default DeletePerson;
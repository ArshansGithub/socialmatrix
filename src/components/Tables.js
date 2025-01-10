import React from 'react';
import FriendCount from './FriendCount';
import AdjacencyMatrix from './AdjacencyMatrix';

function Tables({ people, friendships }) {
  console.log('[Tables] Rendering Tables...');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <AdjacencyMatrix people={people} friendships={friendships} />
      <FriendCount people={people} friendships={friendships} />
    </div>
  );
}

export default Tables;
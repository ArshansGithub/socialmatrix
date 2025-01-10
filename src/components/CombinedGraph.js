import React from 'react';
import GraphVisualization from './GraphVisualization';

function CombinedGraph({ peopleC, friendshipsC }) {
  return (
    <GraphVisualization
      title="Combined Network (C)"
      people={peopleC}
      friendships={friendshipsC}
      setFriendships={()=>{}}
      networkLabel="C"
    />
  );
}

export default CombinedGraph;
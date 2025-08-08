//React JSX frontend

import React, { useEffect, useState } from 'react';  //Usestate manages local state data and useEffect runs when useState mounts
import GraphViewer from './components/GraphViewer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import axios from 'axios';  //Used to make HTTP request to backend sever running on localhost:5000

function App() {
  //State Variables 
  const [graphData, setGraphData] = useState(null); //Stores nodes and links from network graph
  const [searchQuery, setSearchQuery] = useState(""); //Stores what user types in searchbar in form of string
  const [searchResults, setSearchResults] = useState([]); //Stores the result from backend after search in an array
  const [activeTab, setActiveTab] = useState("graph"); //The active display tab

  //UseEffect listens to changes in active tab
  //When user switches to graph toggle tab , it sends a get request to /api/graph with a expected response of "nodes" and the "link" which is stored in graphdata variable
  useEffect(() => {
    if (activeTab === "graph") {
      axios.get('http://localhost:5000/api/graph')
        .then(res => {
          const data = res.data || { nodes: [], edges: [] }; //if request succeeds stores the response in data else falls back to an empty graph
          setGraphData({nodes: data.nodes , links: data.edges});
        })
        .catch(err => {
          console.error("Error fetching graph:", err);
          setGraphData({ nodes: [], links: [] });
        });
    }
  }, [activeTab]);

  //Runs when user clicks Searchbar - validating the input , sending GET request to backend and storing the returned in a local state
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/search?name=${searchQuery}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  //Renders the Title and defines buttons allowing user to switch between the tab
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>IntelTrace Intelligence Platform</h1>  {/*Defines Title in frontend*/}

      <div style={{ marginBottom: '20px' }}> 
        <button
          onClick={() => setActiveTab("graph")}
          style={{
            padding: '10px 20px', 
            backgroundColor: activeTab === "graph" ? '#333' : '#ccc',
            color: activeTab === "graph" ? '#fff' : '#000',
            border: 'none',
            borderRadius: '5px',
            marginRight: '10px' 
          }}
        >
          Relationship Graph
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === "dashboard" ? '#333' : '#ccc',
            color: activeTab === "dashboard" ? '#fff' : '#000',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Dashboard
        </button>
      </div>

      {/* if active tab is dashboard - show analyticsDashboard */}
      {activeTab === "dashboard" && <AnalyticsDashboard />}


      {/* If active tab is graph - show following , NOTE : Make it ENTER triggerable */}
      {activeTab === "graph" && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search suspect by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '8px', width: '300px', marginRight: '10px' }}
            />
            <button onClick={handleSearch} style={{ padding: '8px 12px' }}>
              Search
            </button>
          </div>
     
     {/* Handles the search result , NOTE : Add "No result found" if invalid search queried AND add Labels to associated_events */}
          {searchResults.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Search Results:</h3>
              <ul>
                {searchResults.map(suspect => (
                  <li key={suspect.suspect_id}>
                    <strong>{suspect.name}</strong> — Risk: {suspect.risk_level}
                  </li>
                ))}
              </ul>
            </div>
          )}

     {/* If graph data is ready - pass it to graph */}
          {graphData ? (
            <GraphViewer graphData={graphData} />
          ) : (
            <p>Loading graph from backend...</p>
          )}
        </div>
      )}
    </div>
  );
}

//Export this component
export default App;

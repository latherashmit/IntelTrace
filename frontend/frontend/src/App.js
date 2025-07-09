import React, { useEffect, useState } from 'react';
import GraphViewer from './components/GraphViewer';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import axios from 'axios';
import Login from './components/Login';     //COPILOT MODIFICATION

function App() {
  const [graphData, setGraphData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState("graph"); // Default to graph
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('jwt'));     //COPILOT MODIFICATION

  useEffect(() => {
    if (activeTab === "graph") {
      axios.get('http://localhost:5000/api/graph')
        .then(res => {
          const data = res.data || { nodes: [], links: [] };
          setGraphData(data);
        })
        .catch(err => {
          console.error("Error fetching graph:", err);
          setGraphData({ nodes: [], links: [] }); 
        });
    }
  }, [activeTab]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/search?name=${searchQuery}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };


  //COPILOT MODIFICATION
  axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('jwt');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>IntelTrace Intelligence Platform</h1>

      {/* Toggle buttons */}
      <div style={{ marginBottom: '20px' }}>
          <button
          onClick={() => setActiveTab("graph")}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === "graph" ? '#333' : '#ccc',
            color: activeTab === "graph" ? '#fff' : '#000',
            border: 'none',
            borderRadius: '5px'
          }}
        >
        Relationship Graph
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === "dashboard" ? '#333' : '#ccc',
            color: activeTab === "dashboard" ? '#fff' : '#000',
            border: 'none',
            borderRadius: '5px'
          }}
        >
        Dashboard
        </button>

      
      </div>

      {/* Tab content */}
      {activeTab === "dashboard" && <AnalyticsDashboard />}

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
            <button onClick={handleSearch} style={{ padding: '8px 12px' }}>Search</button>
          </div>

          {searchResults.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Search Results:</h3>
              <ul>
                {searchResults.map(suspect => (
                  <li key={suspect.suspect_id}>
                    <strong>{suspect.name}</strong> — Risk: {suspect.risk_level} | Events: {suspect.associated_events.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

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

export default App;



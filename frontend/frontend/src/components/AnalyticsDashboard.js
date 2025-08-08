// This section collects and displays key metrics fetched from APIs

import React, { useEffect, useState } from 'react';
import axios from 'axios';

// STATE Declaration
const AnalyticsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [threatsToday, setThreatsToday] = useState(0);
  const [highRiskLocations, setHighRiskLocations] = useState(0);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch Events and filter events occurred on given date
    axios.get('http://localhost:5000/api/events')
      .then(res => {
        const data = res.data || [];
        setEvents(data);
        setThreatsToday(data.filter(e => e.date === '2023-08-23').length); // Replace with new Date()
        setHighRiskLocations([...new Set(data.map(e => e.location))].length);
      });

    // Fetch suspects and filter with risk_level == High
    axios.get('http://localhost:5000/api/suspects')
      .then(res => {
        const data = res.data || [];
        setSuspects(data.filter(s => s.risk_level === "High"));
      });

    // Fetch alerts
    axios.get('http://localhost:5000/api/alerts')
      .then(res => {
        setAlerts(res.data || []);
      });
  }, []);

  // Defines the layout of the dashboard
  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Dashboard Header */}
      <h2>IntelTrace Threat Dashboard</h2>

      {/* Top-level stat cards */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* Stat card for today's threats */}
        <StatCard title="Threats Today" value={threatsToday} />

        {/* Stat card for number of unique high-risk locations */}
        <StatCard title="High-Risk Locations" value={highRiskLocations} />

        {/* Stat card for number of high-risk individuals under watch */}
        <StatCard title="Individuals Under Watch" value={suspects.length} />
      </div>

      {/* Middle section showing alerts and suspects side-by-side */}
      <div style={{ display: 'flex', marginTop: '30px', gap: '40px' }}>
        {/* Recent Alerts panel */}
        <div style={{ flex: 1 }}>
          <h3>Recent Alerts</h3>
          {alerts.map((alert, index) => (
            <div
              key={index}
              style={{
                // Color-coded background based on alert severity
                backgroundColor: alert.level === 'HIGH' ? '#ff4d4f' : '#faad14',
                color: 'white',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '8px'
              }}
            >
              <strong>{alert.title}</strong> - {alert.time}
            </div>
          ))}
        </div>

        {/* Individuals under surveillance panel */}
        <div style={{ flex: 1 }}>
          <h3>Individuals Under Watch</h3>
          <ul>
            {suspects.map(s => (
              <li key={s.suspect_id}>
                <strong>{s.name}</strong> - Risk: {s.risk_level}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Timeline section showing all events in chronological order */}
      <div style={{ marginTop: '40px' }}>
        <h3>Timeline of Events</h3>
        <ul>
          {events.map((e, i) => (
            <li key={i}>
              {e.date} – {e.type} at {e.location}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Reusable stat card to show a metric (like count or value)
const StatCard = ({ title, value }) => (
  <div
    style={{
      flex: 1,
      backgroundColor: '#111',
      color: '#fff',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    }}
  >
    <h4>{title}</h4>
    <p style={{ fontSize: '24px', margin: 0 }}>{value}</p>
  </div>
);

export default AnalyticsDashboard;

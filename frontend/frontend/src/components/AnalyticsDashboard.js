import React, { useEffect, useState } from 'react';
import axios from 'axios';


const AnalyticsDashboard = () => {
  const [events, setEvents] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [threatsToday, setThreatsToday] = useState(0);
  const [highRiskLocations, setHighRiskLocations] = useState(0);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Fetch events
    axios.get('http://localhost:5000/api/events')
      .then(res => {
        const data = res.data || [];
        setEvents(data);
        setThreatsToday(data.filter(e => e.date === '2023-08-23').length);
        setHighRiskLocations([...new Set(data.map(e => e.location))].length);
      });

    // Fetch suspects
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

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h2>IntelTrace Threat Dashboard</h2>

      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <StatCard title="Threats Today" value={threatsToday} />
        <StatCard title="High-Risk Locations" value={highRiskLocations} />
        <StatCard title="Individuals Under Watch" value={suspects.length} />
      </div>

      <div style={{ display: 'flex', marginTop: '30px', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <h3>Recent Alerts</h3>
          {alerts.map((alert, index) => (
            <div key={index} style={{
              backgroundColor: alert.level === 'HIGH' ? '#ff4d4f' : '#faad14',
              color: 'white',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '8px'
            }}>
              <strong>{alert.title}</strong> - {alert.time}
            </div>
          ))}
        </div>

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

      <div style={{ marginTop: '40px' }}>
        <h3>Timeline of Events</h3>
        <ul>
          {events.map((e, i) => (
            <li key={i}>{e.date} – {e.type} at {e.location}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div style={{
    flex: 1,
    backgroundColor: '#111',
    color: '#fff',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)'
  }}>
    <h4>{title}</h4>
    <p style={{ fontSize: '24px', margin: 0 }}>{value}</p>
  </div>
);

export default AnalyticsDashboard;

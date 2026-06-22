import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Compass, Users, Activity } from 'lucide-react';

const SCENARIOS = [
  { id: 'flood', name: 'Flash Flood', label: '🌊 Flood Alert' },
  { id: 'earthquake', name: 'Earthquake', label: '🌋 Seismic Alert' },
  { id: 'cyclone', name: 'Cyclone Tasha', label: '🌀 Cyclone Alert' }
];

export default function Dashboard({ activeScenario, onScenarioChange, metrics, tickerAlerts }) {
  
  const getAlertDetails = () => {
    switch(activeScenario) {
      case 'Earthquake':
        return {
          type: 'warning',
          title: 'MAJOR SEISMIC WARNING: 6.8 Richter Scale Tremor',
          desc: 'High structural damage risk. Avoid brick overpasses and bridges. Main tunnels in Sector B are temporarily blocked for inspection.',
        };
      case 'Cyclone Tasha':
        return {
          type: 'danger',
          title: 'CATEGORY 3 CYCLONE TASHA: Shore Landfall Imminent',
          desc: 'Winds exceeding 140km/h. Avoid all coastal highways. Power grids have been preemptively shutdown in Sector C.',
        };
      case 'Flash Flood':
      default:
        return {
          type: 'danger',
          title: 'FLASH FLOOD ALERT: Heavy Inflow at River Basin',
          desc: 'River Road and Low Crossing are heavily flooded. Sector 2 residents should move to elevated shelters immediately.',
        };
    }
  };

  const alert = getAlertDetails();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header section with Scenarios */}
      <header className="header">
        <div className="logo-section">
          <h1>
            <ShieldCheck size={26} className="text-cyan animate-pulse" />
            LifeBridge AI
          </h1>
          <span className="logo-badge">Resilience Hub</span>
        </div>

        <div className="scenario-selector">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onScenarioChange(sc.name)}
              className={`scenario-btn ${activeScenario.toLowerCase().includes(sc.id) ? 'active' : ''}`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Alert Warning Banner */}
      <div className={`alert-banner ${alert.type}`}>
        <div className="alert-banner-content">
          <AlertTriangle size={24} style={{ flexShrink: 0 }} />
          <div>
            <h3>{alert.title}</h3>
            <p>{alert.desc}</p>
          </div>
        </div>
        <div className="live-indicator">
          <div className="live-indicator-dot"></div>
          Live telemetry
        </div>
      </div>

      {/* Stats row */}
      <div className="metrics-row">
        <div className="glass-card metric-card">
          <div className="metric-icon-box green">
            <Compass size={20} />
          </div>
          <div className="metric-info">
            <h4>Safe Corridors</h4>
            <p>{metrics.safeRoads}%</p>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box red">
            <AlertCircle size={20} />
          </div>
          <div className="metric-info">
            <h4>Active Hazards</h4>
            <p>{metrics.activeHazards}</p>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box cyan">
            <Users size={20} />
          </div>
          <div className="metric-info">
            <h4>Active Responders</h4>
            <p>{metrics.activeResponders}</p>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box orange">
            <Activity size={20} />
          </div>
          <div className="metric-info">
            <h4>Shelter Capacity</h4>
            <p>{metrics.shelterOccupancy}%</p>
          </div>
        </div>
      </div>

      {/* Scrolling Alerts Ticker */}
      <div className="broadcast-ticker">
        <span className="ticker-label">Live Broadcast Feed</span>
        <div className="ticker-wrapper">
          <div className="ticker-text">
            {tickerAlerts.map((msg, i) => (
              <span key={i}>{msg}</span>
            ))}
            {/* Duplicate list to enable continuous looping */}
            {tickerAlerts.map((msg, i) => (
              <span key={`dup-${i}`}>{msg}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

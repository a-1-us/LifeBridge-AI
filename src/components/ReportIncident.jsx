import React, { useState } from 'react';
import { AlertOctagon, Send, Check } from 'lucide-react';

export default function ReportIncident({ onReportSubmit }) {
  const [type, setType] = useState('Flooding');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;

    const newReport = {
      id: `incident-${Date.now()}`,
      type,
      location: location.trim(),
      severity,
      description: description.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onReportSubmit(newReport);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setLocation('');
      setDescription('');
    }, 2000);
  };

  return (
    <div className="glass-card report-panel">
      <h2>
        <AlertOctagon size={20} className="text-red" />
        Report Active Hazard
      </h2>

      {submitted ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'rgba(16, 185, 129, 0.1)', 
            color: 'var(--color-green)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Check size={24} />
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600' }}>
            Report Broadcasted Successfully!
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Responders and active maps have been updated in real-time.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="request-aid-form" style={{ gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div className="form-group">
              <label htmlFor="hazard-type-select">Hazard Type</label>
              <select 
                id="hazard-type-select"
                className="form-select"
                value={type} 
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Flooding">Flooding / Water Rising</option>
                <option value="Road Blocked">Road Blocked</option>
                <option value="Structural Hazard">Structural Hazard</option>
                <option value="Medical Emergency">Medical Incident</option>
                <option value="Power Outage">Utility / Power Outage</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity-select">Severity</label>
              <select 
                id="severity-select"
                className="form-select"
                value={severity} 
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="Low">Low - Minor issue</option>
                <option value="Medium">Medium - Caution</option>
                <option value="High">High - Major Hazard</option>
                <option value="Critical">Critical - Life Threatening</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="hazard-location-input">Location / Coordinates</label>
            <input 
              id="hazard-location-input"
              type="text" 
              className="form-input" 
              placeholder="e.g., North Bridge Highway, Sector 4"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hazard-description-input">Incident Description</label>
            <textarea 
              id="hazard-description-input"
              className="form-textarea" 
              placeholder="Provide critical details (e.g. powerline down across street, water depth 3ft)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows="3"
              style={{ resize: 'none' }}
            />
          </div>

          <button type="submit" className="form-submit-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Send size={14} />
            Broadcast Hazard Report
          </button>
        </form>
      )}
    </div>
  );
}

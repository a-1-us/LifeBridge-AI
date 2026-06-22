import React, { useState } from 'react';
import { Users, AlertTriangle, ShieldCheck, ArrowRight, Heart } from 'lucide-react';

export default function VolunteerDispatch({ dispatchRequests, onClaimRequest, onAddVolunteer }) {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'signup'
  const [volName, setVolName] = useState('');
  const [skill, setSkill] = useState('First Aid');
  const [isSignedUp, setIsSignedUp] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    if (!volName.trim()) return;

    onAddVolunteer({
      name: volName.trim(),
      skill,
      location: 'Simulated Zone A',
    });
    
    setIsSignedUp(true);
    setTimeout(() => {
      setIsSignedUp(false);
      setVolName('');
      setActiveTab('tasks');
    }, 2000);
  };

  return (
    <div className="glass-card dispatch-container" style={{ flex: 1 }}>
      <div className="dispatch-header">
        <h2>
          <Users size={20} className="text-cyan animate-pulse" />
          Volunteer & Dispatch Portal
        </h2>
      </div>

      <div className="dispatch-tabs">
        <button 
          onClick={() => setActiveTab('tasks')} 
          className={`dispatch-tab ${activeTab === 'tasks' ? 'active' : ''}`}
        >
          Active Aid Requests
        </button>
        <button 
          onClick={() => setActiveTab('signup')} 
          className={`dispatch-tab ${activeTab === 'signup' ? 'active' : ''}`}
        >
          Rescuer Sign-Up
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <div className="dispatch-list">
          {dispatchRequests.length === 0 ? (
            <p className="sos-desc" style={{ textAlign: 'center', padding: '2rem 0' }}>
              No active dispatch tasks at the moment.
            </p>
          ) : (
            dispatchRequests.map((req) => (
              <div key={req.id} className="dispatch-item">
                <div className="dispatch-item-info">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {req.type}
                    <span className={`dispatch-badge ${
                      req.status === 'Claimed' 
                        ? 'claimed' 
                        : req.severity === 'Critical' || req.severity === 'High' 
                        ? 'critical' 
                        : 'normal'
                    }`}>
                      {req.status === 'Claimed' ? 'Claimed' : req.severity}
                    </span>
                  </h4>
                  <p>📍 {req.location} • {req.timestamp}</p>
                  <p className="sos-desc" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    {req.description}
                  </p>
                  {req.claimedBy && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-green)', fontWeight: '600', marginTop: '0.15rem' }}>
                      Claimed by Rescuer: {req.claimedBy}
                    </p>
                  )}
                </div>

                <button 
                  onClick={() => req.status !== 'Claimed' && onClaimRequest(req.id)}
                  disabled={req.status === 'Claimed'}
                  className={`dispatch-btn ${req.status === 'Claimed' ? 'disabled' : ''}`}
                >
                  {req.status === 'Claimed' ? 'Assigned' : 'Claim Task'}
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          {isSignedUp ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
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
                <Heart size={24} className="animate-pulse" />
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                Thank you for joining the shield!
              </p>
              <p className="sos-desc" style={{ marginTop: '0.25rem' }}>
                Your rescuer profile is active. You can now claim local assistance tasks.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="request-aid-form">
              <p className="sos-desc" style={{ marginBottom: '0.5rem' }}>
                Register as an emergency volunteer to assist citizens in distress.
              </p>
              <div className="form-group">
                <label htmlFor="volunteer-name-input">Rescuer Full Name</label>
                <input 
                  id="volunteer-name-input"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={volName}
                  onChange={(e) => setVolName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="volunteer-skill-select">Primary Survival Skill</label>
                <select 
                  id="volunteer-skill-select"
                  className="form-select"
                  value={skill} 
                  onChange={(e) => setSkill(e.target.value)}
                >
                  <option value="First Aid / Triage">First Aid & Medical Triage</option>
                  <option value="Search & Rescue">Water/Structural Search & Rescue</option>
                  <option value="Emergency Transport">Offroad / Boat Driving</option>
                  <option value="Resource Logistics">Supply Prep & Distribution</option>
                  <option value="Crisis Counseling">Crisis Hotline Support</option>
                </select>
              </div>

              <button type="submit" className="form-submit-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                Join Emergency Network
                <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

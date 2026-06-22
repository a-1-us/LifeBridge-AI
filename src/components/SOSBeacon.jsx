import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, VolumeX, Volume2, Eye } from 'lucide-react';

export default function SOSBeacon({ activeScenario, onToggleSOS, isSOSActive }) {
  const [useSound, setUseSound] = useState(true);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);
  const intervalRef = useRef(null);

  // Handle Audio Synthesis
  useEffect(() => {
    if (isSOSActive && useSound) {
      startSiren();
    } else {
      stopSiren();
    }

    return () => {
      stopSiren();
    };
  }, [isSOSActive, useSound]);

  const startSiren = () => {
    try {
      stopSiren();

      // Create Web Audio Context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      // Create nodes
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sawtooth'; // piercing siren sound
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // Base frequency 800Hz

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;

      oscillator.start();

      // Siren frequency modulation loop (creates "wee-woo" effect)
      let rising = true;
      let freq = 800;
      intervalRef.current = setInterval(() => {
        if (!oscillatorRef.current || !audioCtxRef.current) return;
        
        if (rising) {
          freq += 40;
          if (freq >= 1200) rising = false;
        } else {
          freq -= 40;
          if (freq <= 800) rising = true;
        }
        
        // Fast volume pulse
        const vol = Math.sin(audioCtx.currentTime * 10) * 0.15 + 0.15;
        
        oscillatorRef.current.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gainNodeRef.current.gain.setValueAtTime(vol, audioCtx.currentTime);
      }, 50);

    } catch (e) {
      console.error('Failed to initialize SOS audio beacon:', e);
    }
  };

  const stopSiren = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        if (audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
      } catch (e) {}
      audioCtxRef.current = null;
    }
    gainNodeRef.current = null;
  };

  const handleToggleSOS = () => {
    onToggleSOS(!isSOSActive);
  };

  return (
    <div className="glass-card sos-card">
      <div className="sos-title">
        <ShieldAlert size={20} className={isSOSActive ? 'animate-pulse' : ''} />
        <h2>SOS Emergency Beacon</h2>
      </div>
      
      <p className="sos-desc">
        If you are trapped or in immediate danger, turn on the beacon. It activates a piercing audio siren and flashes your screen in Morse code to signal rescue teams.
      </p>

      <div className="sos-button-container">
        <div className={`sos-glow-ring ${isSOSActive ? 'active' : ''}`}></div>
        <button 
          onClick={handleToggleSOS}
          className={`sos-btn ${isSOSActive ? 'active' : ''}`}
        >
          {isSOSActive ? 'ACTIVE' : 'SOS'}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
        <button 
          onClick={() => setUseSound(!useSound)} 
          className="map-control-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          {useSound ? <Volume2 size={14} /> : <VolumeX size={14} />}
          {useSound ? 'Sound On' : 'Muted'}
        </button>
        <span className="map-control-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Eye size={14} />
          Strobe active
        </span>
      </div>

      {isSOSActive && (
        <div className="sos-status-alert">
          🚨 Distress signal active! Simulated rescuers are notified.
        </div>
      )}

      {/* Morse code strobe overlay */}
      <div className={`sos-strobe-overlay ${isSOSActive ? 'active' : ''}`} />
    </div>
  );
}

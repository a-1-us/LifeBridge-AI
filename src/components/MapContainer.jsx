import React, { useState, useEffect } from 'react';
import { Map, Eye, Navigation, CheckCircle, ShieldAlert, Heart, Compass } from 'lucide-react';

export default function MapContainer({ activeScenario, mapData, reports, isSOSActive }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'shelter' | 'hospital' | 'supplies' | 'hazard'
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);

  // Clear selected node & route on scenario change
  useEffect(() => {
    setSelectedNode(null);
    setActiveRoute(null);
  }, [activeScenario]);

  // Determine user coordinate
  const userCoord = { x: 60, y: 300 };

  // Combine static nodes and dynamic report hazards
  const getFilteredNodes = () => {
    const staticNodes = mapData.nodes.filter(node => {
      if (filter === 'all') return true;
      return node.type === filter;
    });

    const hazardNodes = reports.map(r => ({
      id: r.id,
      name: `${r.type} (${r.severity})`,
      type: 'hazard',
      status: r.severity === 'Critical' ? 'Critical' : 'Danger',
      x: r.id.includes('1') ? 140 : r.id.includes('2') ? 220 : 330, // simulated position
      y: r.id.includes('1') ? 230 : r.id.includes('2') ? 170 : 250,
      description: r.description,
      amenities: `Reported at ${r.timestamp}`
    }));

    if (filter === 'all' || filter === 'hazard') {
      return [...staticNodes, ...hazardNodes];
    }
    return staticNodes;
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setActiveRoute(null); // Reset route until clicked
  };

  const handleGetRoute = (node) => {
    // Generate route path coordinates from user to selected node
    // Simple path generator (User -> Central Supply -> Target) or direct
    let path = `M ${userCoord.x} ${userCoord.y} `;
    
    // Intermediate routing point depending on location to look natural
    if (node.x > 250 && node.y < 200) {
      // route via central supply
      path += `L 260 210 L ${node.x} ${node.y}`;
    } else {
      path += `L ${node.x} ${node.y}`;
    }
    
    setActiveRoute(path);
  };

  const getNodeColor = (node) => {
    if (node.type === 'shelter') return 'var(--color-green)';
    if (node.type === 'hospital') return 'var(--color-blue)';
    if (node.type === 'supplies') return 'var(--color-cyan)';
    if (node.type === 'hazard') {
      return node.status === 'Critical' ? 'var(--color-red)' : 'var(--color-orange)';
    }
    return 'var(--text-secondary)';
  };

  return (
    <div className="glass-card map-card">
      <div className="map-card-header">
        <h2>
          <Map size={20} className="text-cyan animate-pulse" />
          Interactive Sector Map
        </h2>
        <div className="map-controls">
          <button onClick={() => setFilter('all')} className={`map-control-btn ${filter === 'all' ? 'active' : ''}`}>All</button>
          <button onClick={() => setFilter('shelter')} className={`map-control-btn ${filter === 'shelter' ? 'active' : ''}`}>Shelters</button>
          <button onClick={() => setFilter('hospital')} className={`map-control-btn ${filter === 'hospital' ? 'active' : ''}`}>Hospitals</button>
          <button onClick={() => setFilter('supplies')} className={`map-control-btn ${filter === 'supplies' ? 'active' : ''}`}>Supplies</button>
          <button onClick={() => setFilter('hazard')} className={`map-control-btn ${filter === 'hazard' ? 'active' : ''}`}>Hazards</button>
        </div>
      </div>

      <div className="map-canvas-container">
        <svg viewBox="0 0 500 350" className="map-svg">
          {/* Grid lines for tech aesthetics */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Water body simulation (Pulsing blue SVG path) */}
          <path 
            d={
              activeScenario.toLowerCase().includes('flood')
                ? "M -10 100 Q 120 180 250 160 T 510 170 L 510 360 L -10 360 Z" // Flood: higher water
                : "M -10 110 Q 120 150 250 130 T 510 140 L 510 360 L -10 360 Z" // Normal water line
            } 
            className="map-water-body"
            style={{ 
              transition: 'd 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: activeScenario.toLowerCase().includes('flood') ? 0.8 : 0.6 
            }} 
          />

          {/* Roads/Routes */}
          {mapData.roads.map((road) => (
            <path
              key={road.id}
              d={road.path}
              className={`map-road ${road.status.toLowerCase()}`}
            />
          ))}

          {/* User Active SOS Beacon Strobe (if enabled) */}
          {isSOSActive && (
            <g transform={`translate(${userCoord.x}, ${userCoord.y})`}>
              <circle r="25" fill="none" stroke="var(--color-red)" strokeWidth="1.5" className="pulse-circle" />
              <circle r="12" fill="none" stroke="var(--color-red)" strokeWidth="2" className="pulse-circle" style={{ animationDelay: '0.6s' }} />
            </g>
          )}

          {/* Safe Route Overlay (Glowing animated line) */}
          {activeRoute && (
            <path
              d={activeRoute}
              className="map-route-glowing"
            />
          )}

          {/* User Location Pin */}
          <g transform={`translate(${userCoord.x}, ${userCoord.y})`}>
            <circle r="7" fill="var(--color-cyan)" filter="drop-shadow(0 0 4px var(--color-cyan))" />
            <circle r="3" fill="#060913" />
            <text y="-12" textAnchor="middle" fill="var(--color-cyan)" fontSize="8" fontWeight="700">YOU</text>
          </g>

          {/* Dynamic Nodes */}
          {getFilteredNodes().map((node) => {
            const color = getNodeColor(node);
            const isSelected = selectedNode?.id === node.id;
            return (
              <g 
                key={node.id} 
                className="map-node"
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node)}
              >
                {/* Selected Ring */}
                {isSelected && (
                  <circle r="14" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3, 2" className="animate-spin" style={{ animationDuration: '6s' }} />
                )}
                
                {/* Node marker */}
                <circle 
                  r={node.type === 'hazard' ? 7 : 8} 
                  fill={node.type === 'hazard' ? '#121824' : color} 
                  stroke={color} 
                  strokeWidth="2" 
                  filter={`drop-shadow(0 0 6px ${color})`} 
                />
                
                {node.type === 'hazard' && (
                  <path d="M 0 -3 L 0 1 M 0 3 L 0 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                )}
                {node.type !== 'hazard' && (
                  <circle r="2.5" fill="#121824" />
                )}

                {/* Node Label (Subtle, only if near or selected) */}
                <text 
                  y="-14" 
                  textAnchor="middle" 
                  fill={isSelected ? '#ffffff' : 'var(--text-secondary)'} 
                  fontSize="7.5" 
                  fontWeight={isSelected ? '700' : '500'}
                  style={{ transition: 'fill 0.2s' }}
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Box */}
        {selectedNode && (
          <div className="map-popup">
            <div className="popup-details">
              <h4>
                {selectedNode.type === 'shelter' && <CheckCircle size={14} className="text-green" />}
                {selectedNode.type === 'hospital' && <Heart size={14} className="text-blue" />}
                {selectedNode.type === 'supplies' && <Compass size={14} className="text-cyan" />}
                {selectedNode.type === 'hazard' && <ShieldAlert size={14} className="text-red" />}
                {selectedNode.name}
              </h4>
              <p>{selectedNode.description}</p>
              <p style={{ opacity: 0.7 }}>
                {selectedNode.type === 'shelter' && `Capacity: ${selectedNode.occupancy}/${selectedNode.capacity} clients • Services: ${selectedNode.amenities}`}
                {selectedNode.type === 'hospital' && `Status: ${selectedNode.status} • Specialty: ${selectedNode.amenities}`}
                {selectedNode.type === 'supplies' && `Availability: ${selectedNode.status} • Rations: ${selectedNode.amenities}`}
                {selectedNode.type === 'hazard' && `Report: ${selectedNode.amenities}`}
              </p>
            </div>
            <div className="popup-actions">
              <button onClick={() => setSelectedNode(null)} className="popup-btn secondary">Close</button>
              {selectedNode.type !== 'hazard' && (
                <button onClick={() => handleGetRoute(selectedNode)} className="popup-btn">
                  <Navigation size={12} style={{ marginRight: '0.25rem', display: 'inline' }} />
                  Plot Route
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

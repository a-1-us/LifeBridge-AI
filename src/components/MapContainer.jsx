import React, { useState, useEffect, useRef } from 'react';
import { Map, Eye, Navigation, CheckCircle, ShieldAlert, Heart, Compass, Globe } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Geographic Coordinate Map for Miami, FL disaster simulation
const nodeCoords = {
  n1: { lat: 25.7800, lng: -80.1800 },
  n2: { lat: 25.7650, lng: -80.1400 },
  n3: { lat: 25.7400, lng: -80.1600 },
  n4: { lat: 25.7900, lng: -80.2100 },
  n5: { lat: 25.7300, lng: -80.2200 },
  n6: { lat: 25.7550, lng: -80.1300 },
  n7: { lat: 25.7700, lng: -80.1700 }
};

const roadCoords = {
  r1: [[25.7500, -80.2000], [25.7300, -80.2200]],
  r2: [[25.7300, -80.2200], [25.7700, -80.1700], [25.7550, -80.1300]],
  r3: [[25.7500, -80.2000], [25.7550, -80.1900], [25.7700, -80.1700]],
  r4: [[25.7550, -80.1900], [25.7680, -80.1850]],
  r5: [[25.7700, -80.1700], [25.7400, -80.1600], [25.7800, -80.1800]],
  r6: [[25.7800, -80.1800], [25.7900, -80.2100]],
  r7: [[25.7900, -80.2100], [25.7650, -80.1400], [25.7550, -80.1300]]
};

export default function MapContainer({ activeScenario, mapData, reports, isSOSActive }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'shelter' | 'hospital' | 'supplies' | 'hazard'
  const [viewMode, setViewMode] = useState('vector'); // 'vector' | 'satellite'
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [leafletRoute, setLeafletRoute] = useState(null);

  const mapDivRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Clear selected node & route on scenario change
  useEffect(() => {
    setSelectedNode(null);
    setActiveRoute(null);
    setLeafletRoute(null);
  }, [activeScenario]);

  // Determine user coordinate
  const userCoord = { x: 60, y: 300 };

  // Combine static nodes and dynamic report hazards
  const getFilteredNodes = () => {
    const staticNodes = mapData.nodes.map(node => ({
      ...node,
      lat: nodeCoords[node.id]?.lat || 25.76,
      lng: nodeCoords[node.id]?.lng || -80.19
    })).filter(node => {
      if (filter === 'all') return true;
      return node.type === filter;
    });

    const hazardNodes = reports.map(r => {
      const isFirst = r.id.includes('1');
      const isSecond = r.id.includes('2');
      return {
        id: r.id,
        name: `${r.type} (${r.severity})`,
        type: 'hazard',
        status: r.severity === 'Critical' ? 'Critical' : 'Danger',
        x: isFirst ? 140 : isSecond ? 220 : 330, // simulated vector position
        y: isFirst ? 230 : isSecond ? 170 : 250,
        lat: isFirst ? 25.7550 : isSecond ? 25.7680 : 25.7480, // simulated lat/lng
        lng: isFirst ? -80.1900 : isSecond ? -80.1850 : -80.1750,
        description: r.description,
        amenities: `Reported at ${r.timestamp}`
      };
    });

    if (filter === 'all' || filter === 'hazard') {
      return [...staticNodes, ...hazardNodes];
    }
    return staticNodes;
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setActiveRoute(null); // Reset route until clicked
    setLeafletRoute(null);
  };

  const handleGetRoute = (node) => {
    if (viewMode === 'vector') {
      // Vector routing path
      let path = `M ${userCoord.x} ${userCoord.y} `;
      if (node.x > 250 && node.y < 200) {
        path += `L 260 210 L ${node.x} ${node.y}`;
      } else {
        path += `L ${node.x} ${node.y}`;
      }
      setActiveRoute(path);
    } else {
      // Leaflet satellite routing
      // Draw polyline connecting user to the clicked node
      setLeafletRoute([[25.7500, -80.2000], [node.lat, node.lng]]);
    }
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

  // Leaflet Map Initialization
  useEffect(() => {
    if (viewMode === 'satellite' && mapDivRef.current) {
      // Re-initialize map safely
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapDivRef.current, {
        center: [25.7617, -80.1918],
        zoom: 13,
        zoomControl: false
      });
      mapInstanceRef.current = map;

      // Add Satellite imagery tiles (Esri World Imagery)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
      }).addTo(map);

      // Add a dark opacity overlay for cyberpunk visual blend
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png', {
        opacity: 0.35
      }).addTo(map);

      // Add a standard Zoom control at the bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // User location marker
      const userIcon = L.divIcon({
        className: 'custom-leaflet-user',
        html: '<div style="width:16px;height:16px;background:#06b6d4;border-radius:50%;box-shadow:0 0 12px #06b6d4;border:3px solid #060913"></div>',
        iconSize: [16, 16]
      });
      L.marker([25.7500, -80.2000], { icon: userIcon }).addTo(map).bindPopup('<b>Your Location</b>');

      // Plot other nodes
      getFilteredNodes().forEach(node => {
        const color = getNodeColor(node);
        const icon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="width:14px;height:14px;background:${color};border-radius:50%;box-shadow:0 0 10px ${color};border:2px solid #030712"></div>`,
          iconSize: [14, 14]
        });

        const marker = L.marker([node.lat, node.lng], { icon: icon }).addTo(map);
        marker.bindPopup(`
          <div style="color:#f8fafc; font-family:var(--font-family); font-size:0.75rem;">
            <b style="font-size:0.85rem; color:${color}">${node.name}</b><br/>
            ${node.description}<br/>
            <span style="opacity:0.7">${node.amenities || ''}</span>
          </div>
        `, {
          className: 'leaflet-popup-obsidian'
        });

        marker.on('click', () => {
          setSelectedNode(node);
          setLeafletRoute(null);
        });
      });

      // Draw Roads
      mapData.roads.forEach(road => {
        const coords = roadCoords[road.id];
        if (!coords) return;

        let color = '#10b981';
        let dash = '';
        if (road.status === 'Dangerous') {
          color = '#f59e0b';
          dash = '5, 5';
        }
        if (road.status === 'Flooded' || road.status === 'Blocked') {
          color = '#ef4444';
        }

        L.polyline(coords, {
          color: color,
          weight: 4,
          dashArray: dash,
          opacity: 0.8
        }).addTo(map);
      });

      // Draw active route
      if (leafletRoute) {
        L.polyline(leafletRoute, {
          color: '#06b6d4',
          weight: 5,
          dashArray: '8, 8',
          opacity: 0.95
        }).addTo(map);
      }

      // Draw active user SOS beacon on Leaflet
      if (isSOSActive) {
        const sosCircle = L.circle([25.7500, -80.2000], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.15,
          radius: 400
        }).addTo(map);
        
        // Fast blinking interval simulation on map
        let visible = true;
        const blinkInterval = setInterval(() => {
          if (!mapInstanceRef.current) return;
          if (visible) {
            sosCircle.setStyle({ opacity: 0.1, fillOpacity: 0.05 });
          } else {
            sosCircle.setStyle({ opacity: 0.8, fillOpacity: 0.25 });
          }
          visible = !visible;
        }, 800);

        return () => {
          clearInterval(blinkInterval);
        };
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode, filter, activeScenario, selectedNode, leafletRoute, reports, isSOSActive]);

  return (
    <div className="glass-card map-card">
      <div className="map-card-header">
        <h2 style={{ gap: '0.5rem' }}>
          <Map size={20} className="text-cyan animate-pulse" />
          Interactive Crisis Map
          <span style={{ display: 'flex', gap: '0.2rem', marginLeft: '0.5rem' }}>
            <button 
              onClick={() => setViewMode('vector')} 
              className={`scenario-btn ${viewMode === 'vector' ? 'active' : ''}`}
              style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}
            >
              <Compass size={12} />
              Offline Vector
            </button>
            <button 
              onClick={() => setViewMode('satellite')} 
              className={`scenario-btn ${viewMode === 'satellite' ? 'active' : ''}`}
              style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}
            >
              <Globe size={12} />
              Live Satellite
            </button>
          </span>
        </h2>
        <div className="map-controls">
          <button onClick={() => setFilter('all')} className={`map-control-btn ${filter === 'all' ? 'active' : ''}`}>All</button>
          <button onClick={() => setFilter('shelter')} className={`map-control-btn ${filter === 'shelter' ? 'active' : ''}`}>Shelters</button>
          <button onClick={() => setFilter('hospital')} className={`map-control-btn ${filter === 'hospital' ? 'active' : ''}`}>Hospitals</button>
          <button onClick={() => setFilter('supplies')} className={`map-control-btn ${filter === 'supplies' ? 'active' : ''}`}>Supplies</button>
          <button onClick={() => setFilter('hazard')} className={`map-control-btn ${filter === 'hazard' ? 'active' : ''}`}>Hazards</button>
        </div>
      </div>

      <div className="map-canvas-container" style={{ position: 'relative' }}>
        {viewMode === 'vector' ? (
          <svg viewBox="0 0 500 350" width="100%" height="350" className="map-svg">
            {/* Grid lines for tech aesthetics */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(6, 182, 212, 0.07)" strokeWidth="0.75" />
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
              <circle r="7" fill="var(--color-cyan)" style={{ filter: 'drop-shadow(0 0 4px var(--color-cyan))' }} />
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
                    style={{ filter: `drop-shadow(0 0 6px ${color})` }} 
                  />
                  
                  {node.type === 'hazard' && (
                    <path d="M 0 -3 L 0 1 M 0 3 L 0 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                  )}
                  {node.type !== 'hazard' && (
                    <circle r="2.5" fill="#121824" />
                  )}

                  {/* Node Label */}
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
        ) : (
          <div 
            ref={mapDivRef} 
            style={{ 
              width: '100%', 
              height: '350px', 
              background: '#030712',
              borderRadius: '8px'
            }} 
          />
        )}

        {/* Selected Node Details Box */}
        {selectedNode && (
          <div className="map-popup" style={{ zIndex: 1001 }}>
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

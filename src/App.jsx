import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import MapContainer from './components/MapContainer';
import SOSBeacon from './components/SOSBeacon';
import VolunteerDispatch from './components/VolunteerDispatch';
import ReportIncident from './components/ReportIncident';
import SuppliesTracker from './components/SuppliesTracker';
import SurvivalGuides from './components/SurvivalGuides';
import Chatbot from './components/Chatbot';

// Define initial scenarios database
const SCENARIO_DATA = {
  'Flash Flood': {
    roads: [
      { id: 'r1', name: 'Valley Corridor', path: 'M 60 300 L 90 120', status: 'Safe' },
      { id: 'r2', name: 'Ridge Road', path: 'M 90 120 L 290 200 L 410 280', status: 'Safe' },
      { id: 'r3', name: 'River Way', path: 'M 60 300 L 180 230 L 290 200', status: 'Dangerous' },
      { id: 'r4', name: 'Low Crossing', path: 'M 180 230 L 260 210', status: 'Flooded' },
      { id: 'r5', name: 'Shelter Access A', path: 'M 290 200 L 180 180 L 260 70', status: 'Safe' },
      { id: 'r6', name: 'Hospital Link', path: 'M 260 70 L 350 90', status: 'Safe' },
      { id: 'r7', name: 'East Ring Drive', path: 'M 350 90 L 420 150 L 410 280', status: 'Safe' }
    ],
    nodes: [
      { id: 'n1', name: 'North Shelter', type: 'shelter', x: 260, y: 70, status: 'Safe', capacity: 250, occupancy: 145, description: 'Elevated school building converted to emergency shelter.', amenities: 'Water, Warm Food, Blankets' },
      { id: 'n2', name: 'East Safe-Haven', type: 'shelter', x: 420, y: 150, status: 'Safe', capacity: 400, occupancy: 388, description: 'Community sports dome with backup generators.', amenities: 'Cots, Emergency Power, Medical Triage' },
      { id: 'n3', name: 'Elevated Post', type: 'shelter', x: 180, y: 180, status: 'Safe', capacity: 150, occupancy: 42, description: 'Hilltop rescue base camp.', amenities: 'First Aid, Satellite Comms' },
      { id: 'n4', name: 'City Hospital', type: 'hospital', x: 350, y: 90, status: 'Active', description: 'Central city emergency hospital.', amenities: 'Trauma Surgery, ICU active' },
      { id: 'n5', name: 'Valley Clinic', type: 'hospital', x: 90, y: 120, status: 'Active', description: 'Local neighborhood clinic.', amenities: 'First Aid Triage, Wound dressing' },
      { id: 'n6', name: 'Food Depot East', type: 'supplies', x: 410, y: 280, status: 'Stable', description: 'Primary emergency food reserve.', amenities: 'Dry rations, Baby formula' },
      { id: 'n7', name: 'Central Water Hub', type: 'supplies', x: 290, y: 200, status: 'Critical', description: 'Water processing and container distribution point.', amenities: 'Fresh Drinking Water, Filtration Kits' }
    ],
    supplies: [
      { name: 'Bottled Water', current: 1800, needed: 4000, unit: 'L' },
      { name: 'First Aid Kits', current: 320, needed: 500, unit: 'Kits' },
      { name: 'Warm Blankets', current: 210, needed: 800, unit: 'Packs' },
      { name: 'Canned Food', current: 2500, needed: 4000, unit: 'Meals' }
    ],
    dispatchRequests: [
      { id: 'disp-1', type: 'Rescue Evacuation', location: 'Lower Basin Sector 3', severity: 'Critical', timestamp: '10:15 AM', description: 'Elderly resident trapped on second floor due to rapid street flooding.', status: 'Open', claimedBy: null },
      { id: 'disp-2', type: 'Medical Aid Dispatch', location: 'Hilltop Road Sector 2', severity: 'High', timestamp: '10:32 AM', description: 'Infant needs insulin dose; parents unable to drive out due to local blockages.', status: 'Open', claimedBy: null },
      { id: 'disp-3', type: 'Water Supply Delivery', location: 'Elevated Post', severity: 'Normal', timestamp: '10:48 AM', description: 'Rations are low. Needs 100 liters of bottled water transported.', status: 'Open', claimedBy: null }
    ],
    tickerAlerts: [
      'RIVER BASIN INFLOW REACHES PEAK VELOCITY. AVOID LOW CROSSINGS.',
      'CITY DISPATCH DEPLOYED 4 INFLATABLE RESCUE BOATS.',
      'SHELTER CAPACITY REACHING 75%. CONTACT BRIDGEAI FOR ALTERNATIVES.',
      'SECTOR C HIGHWAY CLEAR OF DEBRIS. UTILITY REPAIRS ONGOING.'
    ]
  },
  'Earthquake': {
    roads: [
      { id: 'r1', name: 'Valley Corridor', path: 'M 60 300 L 90 120', status: 'Safe' },
      { id: 'r2', name: 'Ridge Road', path: 'M 90 120 L 290 200 L 410 280', status: 'Dangerous' },
      { id: 'r3', name: 'River Way', path: 'M 60 300 L 180 230 L 290 200', status: 'Safe' },
      { id: 'r4', name: 'Low Crossing', path: 'M 180 230 L 260 210', status: 'Safe' },
      { id: 'r5', name: 'Shelter Access A', path: 'M 290 200 L 180 180 L 260 70', status: 'Blocked' },
      { id: 'r6', name: 'Hospital Link', path: 'M 260 70 L 350 90', status: 'Dangerous' },
      { id: 'r7', name: 'East Ring Drive', path: 'M 350 90 L 420 150 L 410 280', status: 'Safe' }
    ],
    nodes: [
      { id: 'n1', name: 'North Shelter', type: 'shelter', x: 260, y: 70, status: 'Safe', capacity: 250, occupancy: 95, description: 'Local school auditorium checked and cleared by structural engineers.', amenities: 'Blankets, Water, First Aid' },
      { id: 'n2', name: 'East Safe-Haven', type: 'shelter', x: 420, y: 150, status: 'Safe', capacity: 400, occupancy: 120, description: 'Geodesic dome facility. Structurally sound.', amenities: 'Warm Meals, Cots' },
      { id: 'n3', name: 'Elevated Post', type: 'shelter', x: 180, y: 180, status: 'Safe', capacity: 150, occupancy: 110, description: 'Triage and counseling zone in open park space.', amenities: 'Water, Support Staff' },
      { id: 'n4', name: 'City Hospital', type: 'hospital', x: 350, y: 90, status: 'Active', description: 'Central hospital (emergency power active).', amenities: 'Surgical ICU open' },
      { id: 'n5', name: 'Valley Clinic', type: 'hospital', x: 90, y: 120, status: 'Active', description: 'Secondary triage center.', amenities: 'Shock & Trauma stabilization' },
      { id: 'n6', name: 'Food Depot East', type: 'supplies', x: 410, y: 280, status: 'Stable', description: 'Food warehouse. Minimal damage.', amenities: 'Dry goods, rations' },
      { id: 'n7', name: 'Central Water Hub', type: 'supplies', x: 290, y: 200, status: 'Stable', description: 'Bottled water storage center.', amenities: 'Emergency drinking water packs' }
    ],
    supplies: [
      { name: 'First Aid Kits', current: 150, needed: 800, unit: 'Kits' },
      { name: 'Warm Blankets', current: 600, needed: 1000, unit: 'Packs' },
      { name: 'Flashlights / Beacons', current: 400, needed: 1200, unit: 'Units' },
      { name: 'Canned Food', current: 1100, needed: 2500, unit: 'Meals' }
    ],
    dispatchRequests: [
      { id: 'disp-1', type: 'Structural Extraction', location: 'Metropolis Tower Sector 4', severity: 'Critical', timestamp: '10:20 AM', description: 'Building entrance collapsed; 2 citizens reported trapped under heavy drywall debris.', status: 'Open', claimedBy: null },
      { id: 'disp-2', type: 'Gas Leak Containment', location: 'Downtown Commercial Row', severity: 'High', timestamp: '10:41 AM', description: 'Main gas line fractured. Gas odor spreading; needs emergency shutoff specialist.', status: 'Open', claimedBy: null },
      { id: 'disp-3', type: 'Stretcher Transport', location: 'West Plaza Station', severity: 'Normal', timestamp: '10:55 AM', description: 'Citizen injured foot from falling bricks; needs transport to Valley Clinic.', status: 'Open', claimedBy: null }
    ],
    tickerAlerts: [
      'AFTERSHOCK OF MAGNITUDE 4.5 DETECTED. REMAIN UNDER SECURE COVER.',
      'SHELTER ACCESS ROAD BLOCKED BY COLLAPSED MASONRY. DETOUR IN PLACE.',
      'POWER GRID COMMENCING ROTATIONAL SHUTDOWNS TO PREVENT ELECTRIC FIRES.',
      'STRUCTURAL SECURITY CREWS ASSESSING SECTOR A APARTMENTS.'
    ]
  },
  'Cyclone Tasha': {
    roads: [
      { id: 'r1', name: 'Valley Corridor', path: 'M 60 300 L 90 120', status: 'Safe' },
      { id: 'r2', name: 'Ridge Road', path: 'M 90 120 L 290 200 L 410 280', status: 'Safe' },
      { id: 'r3', name: 'River Way', path: 'M 60 300 L 180 230 L 290 200', status: 'Safe' },
      { id: 'r4', name: 'Low Crossing', path: 'M 180 230 L 260 210', status: 'Safe' },
      { id: 'r5', name: 'Shelter Access A', path: 'M 290 200 L 180 180 L 260 70', status: 'Safe' },
      { id: 'r6', name: 'Hospital Link', path: 'M 260 70 L 350 90', status: 'Safe' },
      { id: 'r7', name: 'East Ring Drive', path: 'M 350 90 L 420 150 L 410 280', status: 'Dangerous' }
    ],
    nodes: [
      { id: 'n1', name: 'North Shelter', type: 'shelter', x: 260, y: 70, status: 'Safe', capacity: 250, occupancy: 210, description: 'Reinforced concrete community gymnasium.', amenities: 'Water, Heavy Rations, Shelter beds' },
      { id: 'n2', name: 'East Safe-Haven', type: 'shelter', x: 420, y: 150, status: 'Safe', capacity: 400, occupancy: 395, description: 'Underground bunker safe from hurricane-force winds.', amenities: 'Power generators, medical wing' },
      { id: 'n3', name: 'Elevated Post', type: 'shelter', x: 180, y: 180, status: 'Safe', capacity: 150, occupancy: 25, description: 'High ground coordination post.', amenities: 'Radio towers, water filters' },
      { id: 'n4', name: 'City Hospital', type: 'hospital', x: 350, y: 90, status: 'Active', description: 'Central hospital with wind-shutter defenses.', amenities: 'Trauma ICU, emergency room' },
      { id: 'n5', name: 'Valley Clinic', type: 'hospital', x: 90, y: 120, status: 'Active', description: 'Small inland clinical post.', amenities: 'Outpatient trauma care' },
      { id: 'n6', name: 'Food Depot East', type: 'supplies', x: 410, y: 280, status: 'Critical', description: 'Coastal dry food silo. Roof tiles damaged.', amenities: 'Dry bread, non-perishable cans' },
      { id: 'n7', name: 'Central Water Hub', type: 'supplies', x: 290, y: 200, status: 'Stable', description: 'Water purification reserves.', amenities: 'Sealed plastic water tanks' }
    ],
    supplies: [
      { name: 'Waterproofing Tarps', current: 110, needed: 500, unit: 'Tarps' },
      { name: 'Bottled Water', current: 3100, needed: 5000, unit: 'L' },
      { name: 'Power Cells (AA/AAA)', current: 200, needed: 800, unit: 'Packs' },
      { name: 'Canned Food', current: 1800, needed: 4000, unit: 'Meals' }
    ],
    dispatchRequests: [
      { id: 'disp-1', type: 'Clear Road Blockage', location: 'East Ring Sector 1', severity: 'High', timestamp: '10:11 AM', description: 'Fallen metal advertising billboard blocking transit lanes for rescue vehicles.', status: 'Open', claimedBy: null },
      { id: 'disp-2', type: 'Roof Protection Dispatch', location: 'Coastal Villa Estates', severity: 'Critical', timestamp: '10:35 AM', description: 'Wind blew off roof sheet. Inflow of rain flooding home; elderly couple trapped inside.', status: 'Open', claimedBy: null },
      { id: 'disp-3', type: 'Evacuation Transit', location: 'Sea Wall Sector C', severity: 'Critical', timestamp: '10:50 AM', description: 'Storm surge beginning to breach seawalls. 4 citizens need high-clearance truck evacuation.', status: 'Open', claimedBy: null }
    ],
    tickerAlerts: [
      'CYCLONE TASHA WIND SPEEDS MEASURED AT 160KM/H. EVACUATE SEAWALL.',
      'COASTAL HIGHWAYS CLOSED TO ALL VEHICULAR TRAFFIC. DANGER OF SURGE.',
      'EMERGENCY POWER GRID IS OPERATIONAL IN NORTH SECTOR.',
      'REINFORCING SEA BARRIERS. RESCUE TEAMS ON HIGH ALERT.'
    ]
  }
};

export default function App() {
  const [activeScenario, setActiveScenario] = useState('Flash Flood');
  const [scenarioData, setScenarioData] = useState(SCENARIO_DATA['Flash Flood']);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [userVolunteers, setUserVolunteers] = useState([]);

  // Sync data structure when scenario changes
  useEffect(() => {
    setScenarioData(JSON.parse(JSON.stringify(SCENARIO_DATA[activeScenario])));
  }, [activeScenario]);

  // Handle Volunteer Signup
  const handleAddVolunteer = (vol) => {
    setUserVolunteers(prev => [...prev, vol]);
  };

  // Handle claiming dispatch request
  const handleClaimRequest = (id) => {
    setScenarioData(prev => {
      const updated = { ...prev };
      updated.dispatchRequests = updated.dispatchRequests.map(req => {
        if (req.id === id) {
          return {
            ...req,
            status: 'Claimed',
            claimedBy: userVolunteers[userVolunteers.length - 1]?.name || 'Community Responder'
          };
        }
        return req;
      });
      return updated;
    });
  };

  // Handle adding new reported hazards
  const handleReportSubmit = (report) => {
    // Add to local state reports list
    setScenarioData(prev => {
      const updated = { ...prev };
      
      // Add to broadcast ticker
      updated.tickerAlerts = [
        `⚠️ NEW HAZARD REPORT: ${report.type} at ${report.location} (${report.severity})`,
        ...updated.tickerAlerts
      ];

      // Add to dispatch lists so volunteers can claim it
      updated.dispatchRequests = [
        {
          id: report.id,
          type: report.type,
          location: report.location,
          severity: report.severity,
          timestamp: report.timestamp,
          description: report.description,
          status: 'Open',
          claimedBy: null
        },
        ...updated.dispatchRequests
      ];

      return updated;
    });
  };

  // Handle update supply levels from child components
  const handleUpdateSupply = (name, quantity, type) => {
    setScenarioData(prev => {
      const updated = { ...prev };
      updated.supplies = updated.supplies.map(sup => {
        if (sup.name === name) {
          if (type === 'donate') {
            return { ...sup, current: Math.min(sup.needed, sup.current + quantity) };
          } else {
            return { ...sup, needed: sup.needed + quantity };
          }
        }
        return sup;
      });
      return updated;
    });
  };

  // Compute live metrics dynamically
  const getMetrics = () => {
    const totalRoads = scenarioData.roads.length;
    const safeRoads = scenarioData.roads.filter(r => r.status === 'Safe').length;
    const safePercent = Math.round((safeRoads / totalRoads) * 100);

    const activeHazards = scenarioData.dispatchRequests.filter(req => req.status === 'Open').length;
    
    // Calculate shelter occupancies
    const shelters = scenarioData.nodes.filter(n => n.type === 'shelter');
    const totalCap = shelters.reduce((acc, curr) => acc + curr.capacity, 0);
    const totalOcc = shelters.reduce((acc, curr) => acc + curr.occupancy, 0);
    const occupancyPercent = Math.round((totalOcc / totalCap) * 100);

    const activeResponders = 18 + userVolunteers.length;

    return {
      safeRoads: safePercent,
      activeHazards,
      activeResponders,
      shelterOccupancy: occupancyPercent
    };
  };

  const metrics = getMetrics();

  return (
    <div className="app-container">
      {/* Dashboard contains Header, alert warnings, metrics and live ticker */}
      <Dashboard 
        activeScenario={activeScenario}
        onScenarioChange={setActiveScenario}
        metrics={metrics}
        tickerAlerts={scenarioData.tickerAlerts}
      />

      <div className="dashboard-grid">
        {/* Main interactive panel */}
        <div className="main-column">
          {/* Sector Map */}
          <MapContainer 
            activeScenario={activeScenario}
            mapData={scenarioData}
            reports={scenarioData.dispatchRequests.filter(r => r.id.startsWith('incident-'))}
            isSOSActive={isSOSActive}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Supplies Monitor */}
            <SuppliesTracker 
              supplies={scenarioData.supplies}
              onUpdateSupply={handleUpdateSupply}
            />

            {/* Incident Reporting Form */}
            <ReportIncident 
              onReportSubmit={handleReportSubmit}
            />
          </div>
        </div>

        {/* Side panels */}
        <div className="side-column">
          {/* SOS Beacon widget */}
          <SOSBeacon 
            activeScenario={activeScenario}
            isSOSActive={isSOSActive}
            onToggleSOS={setIsSOSActive}
          />

          {/* Volunteer portal */}
          <VolunteerDispatch 
            dispatchRequests={scenarioData.dispatchRequests}
            onClaimRequest={handleClaimRequest}
            onAddVolunteer={handleAddVolunteer}
          />

          {/* Chatbot Interface */}
          <Chatbot 
            activeScenario={activeScenario}
            mapData={scenarioData}
            supplies={scenarioData.supplies}
          />

          {/* Preparedness Survival checklists & quizzes */}
          <SurvivalGuides 
            activeScenario={activeScenario}
          />
        </div>
      </div>

      <footer className="footer">
        <p>© 2026 LifeBridge AI Disaster Intelligence. Designed for Resilient Communities.</p>
      </footer>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, ArrowRight } from 'lucide-react';

const CHIPS = [
  { text: 'Nearest shelter?', action: 'shelter' },
  { text: 'Is North Bridge safe?', action: 'road' },
  { text: 'First Aid advice?', action: 'medical' },
  { text: 'Where is food/water?', action: 'supplies' }
];

export default function Chatbot({ activeScenario, mapData, supplies }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  // Initialize chatbot welcome message when active scenario changes
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: `BridgeAI online. Active crisis protocol: **${activeScenario}**. Tell me your emergency. I can guide you to open shelters, safe evacuation routes, first-aid advice, and supply distribution hubs.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [activeScenario]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Generate BOT response
    setTimeout(() => {
      const botResponseText = generateBotResponse(text.toLowerCase());
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  const generateBotResponse = (query) => {
    // 1. Shelter queries
    if (query.includes('shelter') || query.includes('camp') || query.includes('stay')) {
      const shelters = mapData.nodes.filter(n => n.type === 'shelter' && n.status === 'Safe');
      if (shelters.length === 0) return "Checking live reports... All designated shelters in this sector are currently at capacity. Please head to high ground and await local transport rescue.";
      
      let list = shelters.map(s => `• **${s.name}**: Occupancy ${s.occupancy}/${s.capacity} (${s.amenities || 'Water, Food, Medical'}).`).join('\n');
      return `Currently, we have ${shelters.length} open, safe shelter(s) available in this sector:\n\n${list}\n\n*Click on any shelter on the map to find a glowing safe route from your position.*`;
    }

    // 2. Road safety / route queries
    if (query.includes('road') || query.includes('route') || query.includes('bridge') || query.includes('highway') || query.includes('safe')) {
      const blockedRoads = mapData.roads.filter(r => r.status === 'Flooded' || r.status === 'Blocked');
      const safeRoads = mapData.roads.filter(r => r.status === 'Safe');
      
      let res = `**Road Security Assessment:**\n`;
      if (blockedRoads.length > 0) {
        res += `• 🛑 **BLOCKED/FLOODED:** ${blockedRoads.map(r => r.name).join(', ')}. Avoid these routes immediately.\n`;
      }
      res += `• 🟢 **SAFE ROUTES:** ${safeRoads.map(r => r.name).join(', ')}. These corridors are checked by responders.\n\nAlways drive with extreme caution during active emergency alert states.`;
      return res;
    }

    // 3. First Aid / Medical queries
    if (query.includes('medical') || query.includes('hospital') || query.includes('doctor') || query.includes('aid') || query.includes('injury') || query.includes('burn') || query.includes('bleed')) {
      if (query.includes('bleed') || query.includes('wound') || query.includes('cut')) {
        return `🚨 **First Aid: Severe Bleeding**\n1. **Apply Direct Pressure:** Press firmly on the wound with a clean cloth.\n2. **Elevate:** Raise the injured limb above heart level if possible.\n3. **Do not remove dressing:** If blood seeps through, add more cloth on top.\n4. Call emergency dispatch if bleeding does not stop after 10 minutes.`;
      }
      if (query.includes('burn')) {
        return `🚨 **First Aid: Thermal Burns**\n1. **Cool the Burn:** Run cool (not cold) clean water over the burn for 10-15 minutes.\n2. **Do NOT use ice:** Extreme cold damages tissue further.\n3. **Cover loosely:** Use sterile, non-adhesive bandages.\n4. **Never pop blisters:** This increases the risk of severe infection.`;
      }
      
      const hospitals = mapData.nodes.filter(n => n.type === 'hospital');
      let hospList = hospitals.map(h => `• **${h.name}**: Active triage capacity (${h.status === 'Active' ? 'Accepting Patients' : 'Full / Emergency Only'}).`).join('\n');
      return `For immediate trauma care, please consult these medical facilities:\n\n${hospList}\n\nFor first-aid questions, type details (e.g., "how to treat bleeding", "how to treat a burn").`;
    }

    // 4. Supplies queries
    if (query.includes('supplies') || query.includes('food') || query.includes('water') || query.includes('medicine') || query.includes('blanket')) {
      const hubs = mapData.nodes.filter(n => n.type === 'supplies');
      const criticalSupplies = supplies.filter(s => (s.current / s.needed) < 0.5);
      
      let supplyStatus = criticalSupplies.length > 0 
        ? `⚠️ **Warning:** Critical shortages reported in: ${criticalSupplies.map(s => s.name).join(', ')}.`
        : `🟢 Supply reserves are stable.`;

      let hubList = hubs.map(h => `• **${h.name}**: Dispensing rations and medical packs.`).join('\n');
      return `**Resource Distribution Hubs:**\n\n${hubList}\n\n${supplyStatus}\n\nYou can request rations or submit donation pledges using the Supplies Tracker at the top of the dashboard.`;
    }

    // 5. Volunteer queries
    if (query.includes('volunteer') || query.includes('help') || query.includes('join') || query.includes('work')) {
      return `Thank you for offering your support! Citizens can register as emergency responders in the **Volunteer & Dispatch Portal** on the dashboard. Once registered, you will be assigned open rescue tasks (e.g. food delivery, medical transit) according to your selected skills.`;
    }

    // Default response
    return `I received your query. In an active **${activeScenario}**, standard communications might be disrupted. If you are in immediate danger, please toggle the **SOS Beacon** on the left dashboard to alert local rescue teams. 

How can I help you find shelters, check road safety, or consult first aid guidelines?`;
  };

  return (
    <div className="glass-card chatbot-container">
      <div className="chatbot-header">
        <Bot size={20} className="text-cyan animate-pulse" />
        <h2>BridgeAI Assistant</h2>
        <span className="logo-badge" style={{ marginLeft: 'auto', background: 'rgba(6,182,212,0.1)', color: 'var(--color-cyan)', fontSize: '0.6rem' }}>
          GPT-Survival v3.5
        </span>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
            {msg.sender === 'bot' ? (
              // Basic markdown formatter helper for bold, bullet points and returns
              <div 
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ 
                  __html: msg.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                }} 
              />
            ) : (
              msg.text
            )}
            <div style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: '0.25rem', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
              {msg.timestamp}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="quick-prompts">
        {CHIPS.map((chip) => (
          <button 
            key={chip.action} 
            className="prompt-chip"
            onClick={() => handleSend(chip.text)}
          >
            {chip.text}
          </button>
        ))}
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
        className="chat-input-form"
      >
        <input 
          type="text" 
          className="chat-input" 
          placeholder="Ask about shelters, roads, first-aid..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="chat-send-btn">
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

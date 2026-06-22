import React, { useState } from 'react';
import { Package2, HandHelping, ArrowUpRight, X, Check } from 'lucide-react';

export default function SuppliesTracker({ supplies, onUpdateSupply }) {
  const [modalType, setModalType] = useState(null); // 'request' | 'donate' | null
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [donorName, setDonorName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenModal = (type) => {
    setModalType(type);
    setSelectedItem(supplies[0]?.name || '');
    setQuantity('');
    setDonorName('');
    setSuccessMsg('');
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    // Call updates on parent supplies state
    // For donations, we increase the current quantity. For requests, we increase the target/needed quantity.
    onUpdateSupply(selectedItem, qty, modalType);

    setSuccessMsg(
      modalType === 'donate' 
        ? `Thank you! Pledged donation of ${qty} units of ${selectedItem} has been logged.`
        : `Your request for ${qty} units of ${selectedItem} has been submitted to dispatch.`
    );

    setTimeout(() => {
      handleCloseModal();
    }, 2500);
  };

  const getProgressColor = (percent) => {
    if (percent < 30) return 'red';
    if (percent < 70) return 'orange';
    return 'green';
  };

  return (
    <div className="glass-card supplies-container">
      <div className="supplies-header">
        <h2>
          <Package2 size={20} className="text-cyan" />
          Emergency Supplies
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => handleOpenModal('request')} className="supplies-action-btn" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
            Request
          </button>
          <button onClick={() => handleOpenModal('donate')} className="supplies-action-btn" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#a7f3d0' }}>
            Donate
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {supplies.map((item) => {
          const percent = Math.min(100, Math.round((item.current / item.needed) * 100));
          const colorClass = getProgressColor(percent);
          return (
            <div key={item.name} className="supply-item">
              <div className="supply-meta">
                <span className="supply-name">{item.name}</span>
                <span className="supply-qty">
                  {item.current} / {item.needed} {item.unit} ({percent}%)
                </span>
              </div>
              <div className="supply-progress-bg">
                <div 
                  className={`supply-progress-fill ${colorClass}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Request / Donate */}
      {modalType && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                {modalType === 'donate' ? 'Pledge Supply Donation' : 'Submit Supply Request'}
              </h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <X size={18} />
              </button>
            </div>

            {successMsg ? (
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
                  <Check size={24} />
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="request-aid-form">
                <div className="form-group">
                  <label htmlFor="supply-item-select">Select Supply Item</label>
                  <select 
                    id="supply-item-select"
                    className="form-select"
                    value={selectedItem} 
                    onChange={(e) => setSelectedItem(e.target.value)}
                  >
                    {supplies.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name} ({item.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="supply-quantity-input">Quantity</label>
                  <input 
                    id="supply-quantity-input"
                    type="number" 
                    className="form-input" 
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    min="1"
                  />
                </div>

                {modalType === 'donate' && (
                  <div className="form-group">
                    <label htmlFor="donor-name-input">Your Name / Organization</label>
                    <input 
                      id="donor-name-input"
                      type="text" 
                      className="form-input" 
                      placeholder="Optional"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                    />
                  </div>
                )}

                <button type="submit" className="form-submit-btn" style={{ marginTop: '0.5rem' }}>
                  {modalType === 'donate' ? 'Confirm Donation Pledge' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

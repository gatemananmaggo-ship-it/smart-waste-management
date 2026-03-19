import React, { useState } from 'react';
import axios from 'axios';
import { X, MapPin, Cpu, Tag, Navigation } from 'lucide-react';
import CONFIG from '../config';

const inputStyle = {
    width: '100%',
    padding: '10px 12px 10px 36px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border 0.2s',
};

const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const InputWrapper = ({ children }) => (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {children}
    </div>
);

const IconWrap = ({ children }) => (
    <span style={{
        position: 'absolute',
        left: '10px',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
    }}>
        {children}
    </span>
);

const AddBinModal = ({ onClose, onBinAdded }) => {
    const [form, setForm] = useState({
        hardwareId: '',
        address: '',
        latitude: '',
        longitude: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { hardwareId, address, latitude, longitude } = form;

        if (!hardwareId.trim() || !address.trim() || !latitude || !longitude) {
            setError('All fields are required.');
            return;
        }
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            setError('Please enter valid latitude (-90 to 90) and longitude (-180 to 180).');
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post(CONFIG.API_BINS, {
                hardwareId: hardwareId.trim(),
                address: address.trim(),
                location: { latitude: lat, longitude: lng },
            });
            onBinAdded(response.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add bin. Check the backend is running.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease',
        }}>
            <div className="glass" style={{
                width: '100%', maxWidth: '460px',
                padding: '32px',
                borderRadius: '16px',
                position: 'relative',
                animation: 'slideUp 0.25s ease',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Add New Bin</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            Register a smart bin to the system
                        </p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.08)', border: 'none',
                        borderRadius: '8px', padding: '6px', cursor: 'pointer',
                        color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
                        transition: 'background 0.2s',
                    }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {/* Hardware ID */}
                    <div>
                        <label style={labelStyle}>Hardware ID</label>
                        <InputWrapper>
                            <IconWrap><Cpu size={14} /></IconWrap>
                            <input
                                style={inputStyle}
                                type="text"
                                name="hardwareId"
                                placeholder="e.g. BIN-001"
                                value={form.hardwareId}
                                onChange={handleChange}
                                autoComplete="off"
                            />
                        </InputWrapper>
                    </div>

                    {/* Address */}
                    <div>
                        <label style={labelStyle}>Address / Label</label>
                        <InputWrapper>
                            <IconWrap><Tag size={14} /></IconWrap>
                            <input
                                style={inputStyle}
                                type="text"
                                name="address"
                                placeholder="e.g. Main Gate, AKGEC Campus"
                                value={form.address}
                                onChange={handleChange}
                            />
                        </InputWrapper>
                    </div>

                    {/* Lat / Lng */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={labelStyle}>Latitude</label>
                            <InputWrapper>
                                <IconWrap><MapPin size={14} /></IconWrap>
                                <input
                                    style={inputStyle}
                                    type="number"
                                    name="latitude"
                                    placeholder="28.6757"
                                    step="any"
                                    value={form.latitude}
                                    onChange={handleChange}
                                />
                            </InputWrapper>
                        </div>
                        <div>
                            <label style={labelStyle}>Longitude</label>
                            <InputWrapper>
                                <IconWrap><Navigation size={14} /></IconWrap>
                                <input
                                    style={inputStyle}
                                    type="number"
                                    name="longitude"
                                    placeholder="77.5020"
                                    step="any"
                                    value={form.longitude}
                                    onChange={handleChange}
                                />
                            </InputWrapper>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: '10px 14px',
                            background: 'rgba(239,68,68,0.12)',
                            border: '1px solid rgba(239,68,68,0.35)',
                            borderRadius: '8px',
                            color: '#f87171',
                            fontSize: '0.83rem',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, padding: '10px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '8px', color: 'var(--text-secondary)',
                            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500,
                            transition: 'background 0.2s',
                        }}
                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        >
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} style={{
                            flex: 2, padding: '10px',
                            background: submitting
                                ? 'rgba(56,189,248,0.3)'
                                : 'linear-gradient(135deg, #38bdf8, #6366f1)',
                            border: 'none', borderRadius: '8px',
                            color: 'white', cursor: submitting ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem', fontWeight: 600,
                            transition: 'opacity 0.2s',
                        }}>
                            {submitting ? 'Adding...' : '+ Add Bin'}
                        </button>
                    </div>
                </form>

                <style>{`
                    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                    @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
                    input::placeholder { color: rgba(148,163,184,0.5); }
                    input:focus { border-color: rgba(56,189,248,0.6) !important; }
                `}</style>
            </div>
        </div>
    );
};

export default AddBinModal;

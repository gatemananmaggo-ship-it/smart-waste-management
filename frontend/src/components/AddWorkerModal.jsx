import React, { useState } from 'react';
import { X, User, Lock, Phone } from 'lucide-react';
import axios from 'axios';
import CONFIG from '../config';

const AddWorkerModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.phone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number.');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(CONFIG.API_WORKERS, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            window.dispatchEvent(new Event('workerAdded'));
            onClose();
        } catch (err) {
            console.error('Failed to add worker:', err);
            
            // Check if it's a 404 meaning the endpoint doesn't exist on the server yet
            if (err.response?.status === 404) {
                setError('Feature unavailable. (Make sure your backend server has the new code and was restarted!).');
            } else {
                setError(err.response?.data?.message || 'An error occurred while saving the worker.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px'
        }}>
            <div style={{
                background: '#0f172a', width: '100%', maxWidth: '450px',
                borderRadius: '24px', border: '1px solid var(--glass-border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', overflow: 'hidden'
            }}>
                <div style={{
                    padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={20} color="#38bdf8" /> Add Service Worker
                    </h2>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%', transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '32px 24px' }}>
                    {error && (
                        <div style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                            padding: '12px 16px', borderRadius: '8px', marginBottom: '24px',
                            fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>
                                Worker Username
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="e.g. john_doe"
                                    required
                                    style={{
                                        width: '100%', padding: '12px 12px 12px 42px',
                                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>
                                Mobile Number (for SMS alerts)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="10-digit mobile number"
                                    required
                                    style={{
                                        width: '100%', padding: '12px 12px 12px 42px',
                                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 500 }}>
                                Temporary Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create password"
                                    required
                                    style={{
                                        width: '100%', padding: '12px 12px 12px 42px',
                                        background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', color: 'white', fontSize: '0.95rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1, padding: '12px', background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                    color: 'white', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1, padding: '12px', background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                                    border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                                    transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(56,189,248,0.25)'
                                }}
                            >
                                {loading ? 'Saving...' : 'Add Worker'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddWorkerModal;

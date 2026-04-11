import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Trash2, Phone, CheckCircle, XCircle } from 'lucide-react';
import CONFIG from '../config';

const WorkersManagement = ({ onAddWorkerClick }) => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWorkers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(CONFIG.API_WORKERS, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkers(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch workers:', err);
            setError('Failed to load workers. Please try again.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    const handleDelete = async (workerId) => {
        if (!window.confirm('Are you sure you want to remove this worker?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${CONFIG.API_WORKERS}/${workerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkers(prev => prev.filter(w => w._id !== workerId));
        } catch (err) {
            console.error('Failed to delete worker:', err);
            alert('Failed to delete worker.');
        }
    };

    const handleToggleAvailability = async (workerId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !currentStatus;
            await axios.patch(`${CONFIG.API_WORKERS}/${workerId}`, 
                { isAvailable: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWorkers(prev => prev.map(w => 
                w._id === workerId ? { ...w, isAvailable: newStatus } : w
            ));
        } catch (err) {
            console.error('Failed to toggle worker status:', err);
            alert('Failed to update worker status.');
        }
    };

    // Allow parent to tell us when a worker was added so we can refresh the list
    useEffect(() => {
        const handleWorkerAdded = () => {
            fetchWorkers();
        };
        window.addEventListener('workerAdded', handleWorkerAdded);
        return () => window.removeEventListener('workerAdded', handleWorkerAdded);
    }, []);

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            border: '1px solid var(--glass-border)',
            padding: '24px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.2))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                        <Users size={20} color="#38bdf8" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>Automated Alert Recipients</h2>
                </div>
                <button
                    onClick={onAddWorkerClick}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        padding: '10px 20px', background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                        border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        boxShadow: '0 4px 15px rgba(56,189,248,0.25)'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={18} /> Add Worker
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading workers...</div>
            ) : error ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>{error}</div>
            ) : workers.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', padding: '60px 20px', 
                    background: 'rgba(0,0,0,0.2)', borderRadius: '12px',
                    border: '1px dashed rgba(255,255,255,0.1)' 
                }}>
                    <Users size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ color: 'white', marginBottom: '8px' }}>No workers added yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Add workers so they can receive SMS notifications when bins are full.
                    </p>
                    <button
                        onClick={onAddWorkerClick}
                        style={{
                            padding: '8px 16px', background: 'transparent',
                            border: '1px solid #38bdf8', borderRadius: '6px', color: '#38bdf8',
                            cursor: 'pointer', fontWeight: 500
                        }}
                    >
                        Add Your First Worker
                    </button>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Worker Name</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Contact Number</th>
                                <th style={{ textAlign: 'left', padding: '16px', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Alerts Status</th>
                                <th style={{ textAlign: 'right', padding: '16px', color: '#94a3b8', fontWeight: 500, fontSize: '0.9rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers.map(worker => (
                                <tr key={worker._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '16px', color: 'white', fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ 
                                                width: '32px', height: '32px', borderRadius: '50%', 
                                                background: 'rgba(56,189,248,0.1)', display: 'flex', 
                                                alignItems: 'center', justifyContent: 'center', color: '#38bdf8' 
                                            }}>
                                                {(worker.username || '?').charAt(0).toUpperCase()}
                                            </div>
                                            {worker.username || 'Unknown'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                            <Phone size={14} />
                                            {worker.phone}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <button
                                            onClick={() => handleToggleAvailability(worker._id, worker.isAvailable)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '6px', 
                                                background: worker.isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                                color: worker.isAvailable ? '#10b981' : '#ef4444', 
                                                padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem',
                                                border: `1px solid ${worker.isAvailable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                                cursor: 'pointer', transition: 'all 0.2s',
                                                fontWeight: 600
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = worker.isAvailable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}
                                            onMouseOut={e => e.currentTarget.style.background = worker.isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
                                        >
                                            {worker.isAvailable ? (<><CheckCircle size={14} /> Active</>) : (<><XCircle size={14} /> On Leave</>)}
                                        </button>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => handleDelete(worker._id)}
                                            style={{ 
                                                background: 'rgba(239, 68, 68, 0.1)', border: 'none', 
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = '#ef4444'}
                                            onMouseOut={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                            onMouseEnter={e => e.currentTarget.style.color = 'white'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}
                                            title="Remove Worker"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default WorkersManagement;

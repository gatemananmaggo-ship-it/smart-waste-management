import React from 'react';
import { Battery, Trash2, X, Navigation } from 'lucide-react';

const BinTable = ({ bins, onEmptyBin, onRemoveBin }) => {
    return (
        <div className="glass" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Smart Bin Fleet</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total: {bins.length}</span>
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <th style={{ padding: '16px 24px' }}>Bin ID</th>
                            <th style={{ padding: '16px 24px' }}>Location / Address</th>
                            <th style={{ padding: '16px 24px' }}>Fill Level</th>
                            <th style={{ padding: '16px 24px' }}>Battery</th>
                            <th style={{ padding: '16px 24px' }}>Status</th>
                            <th style={{ padding: '16px 24px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bins.map((bin) => (
                            <tr key={bin._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '16px 24px', fontWeight: 500 }}>{bin.hardwareId}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ fontSize: '0.9rem' }}>{bin.address}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {bin.location.latitude.toFixed(4)}, {bin.location.longitude.toFixed(4)}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', position: 'relative' }}>
                                            <div style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                height: '100%',
                                                width: `${bin.fillLevel}%`,
                                                background: bin.fillLevel > 80 ? 'var(--danger)' : bin.fillLevel > 50 ? 'var(--warning)' : 'var(--success)',
                                                borderRadius: '3px'
                                            }}></div>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{bin.fillLevel}%</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: bin.batteryLevel < 20 ? 'var(--danger)' : 'var(--text-primary)' }}>
                                        <Battery size={16} />
                                        <span style={{ fontSize: '0.85rem' }}>{bin.batteryLevel}%</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        background: bin.status === 'Full' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: bin.status === 'Full' ? 'var(--danger)' : 'var(--success)',
                                        border: `1px solid ${bin.status === 'Full' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                                    }}>
                                        {bin.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '0' }}>
                                    <button
                                        onClick={() => onEmptyBin(bin.hardwareId)}
                                        disabled={bin.fillLevel === 0}
                                        style={{
                                            background: bin.fillLevel === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(56, 189, 248, 0.1)',
                                            border: '1px solid var(--glass-border)',
                                            color: bin.fillLevel === 0 ? 'var(--text-secondary)' : 'var(--accent-primary)',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            cursor: bin.fillLevel === 0 ? 'default' : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        Collect
                                    </button>
                                    <button
                                        onClick={() => {
                                            const url = `https://www.google.com/maps/dir/?api=1&destination=${bin.location.latitude},${bin.location.longitude}&travelmode=walking`;
                                            window.open(url, '_blank');
                                        }}
                                        title="Navigate to bin"
                                        style={{
                                            background: 'rgba(59, 130, 246, 0.08)',
                                            border: '1px solid rgba(59, 130, 246, 0.2)',
                                            color: '#3b82f6',
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center',
                                            transition: 'all 0.2s',
                                            marginLeft: '6px',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.18)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'}
                                    >
                                        <Navigation size={14} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Remove "${bin.hardwareId}" from the system? This cannot be undone.`)) {
                                                onRemoveBin(bin.hardwareId);
                                            }
                                        }}
                                        title="Remove bin"
                                        style={{
                                            background: 'rgba(239,68,68,0.08)',
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            color: 'var(--danger)',
                                            padding: '6px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center',
                                            transition: 'all 0.2s',
                                            marginLeft: '6px',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BinTable;

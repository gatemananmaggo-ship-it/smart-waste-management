import React from 'react';

const StatsCard = ({ title, value, subValue, icon: Icon, trend, color }) => {
    return (
        <div className="glass card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
                zIndex: 0
            }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                <div style={{
                    padding: '10px',
                    borderRadius: '12px',
                    background: `${color}10`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)',
                        background: trend.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '20px'
                    }}>
                        {trend}
                    </div>
                )}
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>{title}</p>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{value}</h3>
                {subValue && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{subValue}</p>
                )}
            </div>
        </div>
    );
};

export default StatsCard;

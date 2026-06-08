import React, { useState } from 'react';
import { Search, Trash2, Battery, User, Phone, MapPin, AlertCircle, CheckCircle2, Navigation, RefreshCw, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BinMonitor = ({ bins, onEmptyBin, onViewChange }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'full', 'filling', 'empty'

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter bins based on status selection and search term
    const filteredBins = bins.filter(bin => {
        const matchesSearch = bin.hardwareId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             bin.address.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesStatus = true;
        if (filterStatus === 'full') matchesStatus = bin.status === 'Full' || bin.fillLevel >= 90;
        else if (filterStatus === 'filling') matchesStatus = bin.fillLevel >= 50 && bin.fillLevel < 90;
        else if (filterStatus === 'empty') matchesStatus = bin.fillLevel < 50;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (level) => {
        if (level >= 90) return 'var(--danger)'; // red
        if (level >= 50) return 'var(--warning)'; // orange/yellow
        return 'var(--success)'; // green
    };

    const countStatus = (statusType) => {
        if (statusType === 'full') return bins.filter(b => b.status === 'Full' || b.fillLevel >= 90).length;
        if (statusType === 'filling') return bins.filter(b => b.fillLevel >= 50 && b.fillLevel < 90).length;
        if (statusType === 'empty') return bins.filter(b => b.fillLevel < 50).length;
        return bins.length;
    };

    return (
        <div>
            {/* Header controls with Search and Category filters */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '32px'
            }}>
                {/* Category Pill Filters */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setFilterStatus('all')}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '30px',
                            border: '1px solid',
                            borderColor: filterStatus === 'all' ? '#38bdf8' : 'rgba(255,255,255,0.05)',
                            background: filterStatus === 'all' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.02)',
                            color: filterStatus === 'all' ? 'white' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.88rem'
                        }}
                    >
                        🔍 All Bins ({countStatus('all')})
                    </button>
                    <button
                        onClick={() => setFilterStatus('full')}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '30px',
                            border: '1px solid',
                            borderColor: filterStatus === 'full' ? '#ef4444' : 'rgba(255,255,255,0.05)',
                            background: filterStatus === 'full' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.02)',
                            color: filterStatus === 'full' ? '#ef4444' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.88rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span style={{
                            width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444',
                            animation: countStatus('full') > 0 ? 'pulse-danger 1.5s infinite' : 'none'
                        }}></span>
                        Alerts / Full ({countStatus('full')})
                    </button>
                    <button
                        onClick={() => setFilterStatus('filling')}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '30px',
                            border: '1px solid',
                            borderColor: filterStatus === 'filling' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                            background: filterStatus === 'filling' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.02)',
                            color: filterStatus === 'filling' ? '#f59e0b' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.88rem'
                        }}
                    >
                        ⏳ Filling Up ({countStatus('filling')})
                    </button>
                    <button
                        onClick={() => setFilterStatus('empty')}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '30px',
                            border: '1px solid',
                            borderColor: filterStatus === 'empty' ? '#10b981' : 'rgba(255,255,255,0.05)',
                            background: filterStatus === 'empty' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                            color: filterStatus === 'empty' ? '#10b981' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.88rem'
                        }}
                    >
                        ✅ Healthy ({countStatus('empty')})
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search by ID or Address..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            color: 'white',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = '#38bdf8'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                    />
                </div>
            </div>

            {/* Visual Grid of Bins */}
            {filteredBins.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    border: '1px dashed var(--glass-border)'
                }}>
                    <Trash2 size={48} color="rgba(255,255,255,0.15)" style={{ marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No bins match your current filters.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '24px'
                }}>
                    {filteredBins.map((bin) => {
                        const isFull = bin.status === 'Full' || bin.fillLevel >= 90;
                        const isLowBattery = bin.batteryLevel < 20;
                        const fillColor = getStatusColor(bin.fillLevel);

                        return (
                            <div
                                key={bin._id}
                                className="glass"
                                style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    border: isFull ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--glass-border)',
                                    background: isFull ? 'rgba(239, 68, 68, 0.02)' : 'var(--glass-bg)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    animation: isFull ? 'pulse-border 3s infinite' : 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    minHeight: '260px'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Card Title & Status Badge */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.15rem', color: 'white', fontFamily: 'monospace', fontWeight: 700 }}>
                                            {bin.hardwareId}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                            <MapPin size={12} />
                                            <span style={{ maxWidth: '190px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {bin.address}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontWeight: 700,
                                            background: isFull ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                            color: isFull ? '#ef4444' : '#10b981',
                                            border: `1px solid ${isFull ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                                        }}>
                                            {isFull ? t('needs_collection') : t('healthy')}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isLowBattery ? '#ef4444' : 'var(--text-secondary)' }}>
                                            <Battery size={14} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{bin.batteryLevel}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body: Trash Can Fluid Visualization & Stats details */}
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
                                    {/* Visual Bin Container */}
                                    <div style={{
                                        position: 'relative',
                                        width: '64px',
                                        height: '110px',
                                        border: '3px solid rgba(255, 255, 255, 0.15)',
                                        borderRadius: '10px 10px 4px 4px',
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        overflow: 'hidden',
                                        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6)',
                                        flexShrink: 0
                                    }}>
                                        {/* Bin Top Cap */}
                                        <div style={{
                                            position: 'absolute',
                                            top: 0, left: 0, right: 0, height: '4px',
                                            background: 'rgba(255, 255, 255, 0.3)', zIndex: 10
                                        }} />
                                        
                                        {/* Fluid Level */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0, left: 0, right: 0,
                                            height: `${bin.fillLevel}%`,
                                            background: `linear-gradient(to top, ${fillColor}dd, ${fillColor}aa)`,
                                            transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: '0 -2px 8px rgba(255,255,255,0.1)'
                                        }}>
                                            {bin.fillLevel > 15 && (
                                                <div className="wave-animation" style={{
                                                    position: 'absolute',
                                                    top: '-6px', left: 0, width: '200%', height: '12px',
                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '42%',
                                                    animation: 'wave 3s linear infinite'
                                                }} />
                                            )}
                                        </div>
                                        
                                        {/* Overlay Numeric Text */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                            fontSize: '0.9rem', fontWeight: 800, color: 'white',
                                            textShadow: '0 1px 5px rgba(0,0,0,0.9)', zIndex: 12
                                        }}>
                                            {bin.fillLevel}%
                                        </div>
                                    </div>

                                    {/* Worker Details Section */}
                                    <div style={{ flex: 1, height: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        {bin.assignedWorker ? (
                                            <div style={{
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                borderRadius: '12px',
                                                padding: '12px',
                                                position: 'relative'
                                            }}>
                                                <span style={{
                                                    fontSize: '0.65rem', color: 'var(--text-secondary)',
                                                    textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px'
                                                }}>
                                                    👤 Assigned Collector
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '28px', height: '28px', borderRadius: '50%',
                                                        background: 'rgba(56, 189, 248, 0.15)', display: 'flex',
                                                        alignItems: 'center', justifyContents: 'center', color: '#38bdf8',
                                                        fontSize: '0.8rem', fontWeight: 800, paddingLeft: '9px'
                                                    }}>
                                                        {(bin.assignedWorker.username || 'W').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                                                            {bin.assignedWorker.username}
                                                        </p>
                                                        {bin.assignedWorker.phone && (
                                                            <a 
                                                                href={`tel:${bin.assignedWorker.phone}`}
                                                                style={{ 
                                                                    margin: 0, fontSize: '0.78rem', color: '#38bdf8', 
                                                                    display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none',
                                                                    marginTop: '2px' 
                                                                }}
                                                            >
                                                                <Phone size={10} /> {bin.assignedWorker.phone}
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{
                                                border: isFull ? '1px dashed rgba(239, 68, 68, 0.4)' : '1px dashed rgba(255,255,255,0.1)',
                                                background: isFull ? 'rgba(239, 68, 68, 0.04)' : 'rgba(0,0,0,0.1)',
                                                borderRadius: '12px',
                                                padding: '12px',
                                                textAlign: 'center',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '90px'
                                            }}>
                                                {isFull ? (
                                                    <>
                                                        <AlertCircle size={18} color="#ef4444" style={{ marginBottom: '4px', animation: 'bounce 1s infinite' }} />
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>
                                                            {t('no_worker_assigned')}
                                                        </span>
                                                        <span style={{ fontSize: '0.65rem', color: 'rgba(239, 68, 68, 0.7)', marginTop: '2px' }}>
                                                            No active workers available
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={18} color="#10b981" style={{ marginBottom: '4px' }} />
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                            {t('no_worker_assigned')}
                                                        </span>
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                                            Stable Level (Idle)
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Bar */}
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    paddingTop: '16px',
                                    marginTop: '8px'
                                }}>
                                    <button
                                        onClick={() => onEmptyBin(bin.hardwareId)}
                                        disabled={bin.fillLevel === 0}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '10px',
                                            background: bin.fillLevel === 0 ? 'rgba(255, 255, 255, 0.02)' : 'linear-gradient(135deg, #10b981, #059669)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: bin.fillLevel === 0 ? 'rgba(255, 255, 255, 0.2)' : 'white',
                                            fontWeight: 600,
                                            cursor: bin.fillLevel === 0 ? 'default' : 'pointer',
                                            boxShadow: bin.fillLevel === 0 ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)',
                                            transition: 'opacity 0.2s'
                                        }}
                                        onMouseOver={e => { if(bin.fillLevel > 0) e.currentTarget.style.opacity = '0.9'; }}
                                        onMouseOut={e => { if(bin.fillLevel > 0) e.currentTarget.style.opacity = '1'; }}
                                    >
                                        <Trash2 size={16} /> Collect / Clean
                                    </button>

                                    <button
                                        onClick={() => {
                                            // Show map route view
                                            if (onViewChange) {
                                                onViewChange('map');
                                            } else {
                                                const url = `https://www.google.com/maps/dir/?api=1&destination=${bin.location.latitude},${bin.location.longitude}&travelmode=walking`;
                                                window.open(url, '_blank');
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '10px 14px',
                                            background: 'rgba(56, 189, 248, 0.1)',
                                            border: '1px solid rgba(56, 189, 248, 0.2)',
                                            borderRadius: '8px',
                                            color: '#38bdf8',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'}
                                    >
                                        <Navigation size={16} /> Route
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Embed micro-animations style */}
            <style>{`
                @keyframes wave {
                    0% { transform: translateX(0) rotate(0deg); }
                    100% { transform: translateX(-50%) rotate(360deg); }
                }
                @keyframes pulse-border {
                    0%, 100% { border-color: rgba(239, 68, 68, 0.25); box-shadow: 0 0 10px rgba(239, 68, 68, 0.05); }
                    50% { border-color: rgba(239, 68, 68, 0.7); box-shadow: 0 0 20px rgba(239, 68, 68, 0.2); }
                }
                @keyframes pulse-danger {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 0.4; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
            `}</style>
        </div>
    );
};

export default BinMonitor;

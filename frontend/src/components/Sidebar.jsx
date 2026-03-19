import React from 'react';
import { LayoutDashboard, Map as MapIcon, BarChart3, Trash2, Settings, AlertTriangle, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ activeView, setActiveView }) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const menuItems = [
        { id: 'overview', icon: LayoutDashboard, label: t('overview') },
        { id: 'map', icon: MapIcon, label: t('live_map') },
        { id: 'analytics', icon: BarChart3, label: t('analytics') },
        { id: 'bins', icon: Trash2, label: t('smart_bins') },
        { id: 'settings', icon: Settings, label: t('settings') },
    ];

    return (
        <aside className="glass" style={{
            width: 'var(--sidebar-width)',
            height: 'calc(100vh - 40px)',
            position: 'fixed',
            top: '20px',
            left: '20px',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            zIndex: 100
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Trash2 size={20} color="white" />
                </div>
                <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.025em' }}>EcoSmart</h2>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: activeView === item.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                            color: activeView === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease',
                            border: activeView === item.id ? '1px solid var(--glass-border)' : '1px solid transparent'
                        }}
                        onMouseOver={(e) => {
                            if (activeView !== item.id) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeView !== item.id) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }
                        }}
                    >
                        <item.icon size={20} />
                        <span style={{ fontWeight: 500 }}>{item.label}</span>
                    </div>
                ))}
            </nav>

            <div className="glass" style={{
                padding: '16px',
                marginTop: 'auto',
                background: 'rgba(56, 189, 248, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                border: '1px solid var(--accent-primary)',
                boxShadow: '0 4px 20px rgba(56, 189, 248, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 
                    }}>
                        <User size={16} color="white" />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ 
                            fontSize: '0.9rem', fontWeight: 600, margin: 0, 
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                        }}>
                            {user?.username}
                        </p>
                        <p style={{ 
                            fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                            {user?.city}, {user?.state}
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={logout}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', 
                        color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', padding: '4px 0', opacity: 0.8 
                    }}
                    onMouseOver={e => e.currentTarget.style.opacity = 1}
                    onMouseOut={e => e.currentTarget.style.opacity = 0.8}
                >
                    <LogOut size={16} /> {t('logout')}
                </button>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('system_status')}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t('all_systems_online')}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

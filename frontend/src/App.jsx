import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Trash2, Battery, AlertTriangle, CheckCircle2, Plus, Trees, User as UserIcon } from 'lucide-react';

import Sidebar from './components/Sidebar';
import StatsCard from './components/StatsCard';
import BinMap from './components/BinMap';
import TrendChart from './components/TrendChart';
import BinTable from './components/BinTable';
import AddBinModal from './components/AddBinModal';
import Login from './components/Login';
import Register from './components/Register';
import Settings from './components/Settings';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import CONFIG from './config';

const socket = io(CONFIG.SOCKET_URL);

function App() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [showLogin, setShowLogin] = useState(true);
  const [bins, setBins] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [showAddBin, setShowAddBin] = useState(false);

  useEffect(() => {
    // Initial data fetch
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching bins from:', CONFIG.API_BINS);
        
        const response = await axios.get(CONFIG.API_BINS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Full API Response:', response.data);
        const { bins: binsData, history } = response.data;
        
        if (Array.isArray(binsData)) {
            console.log(`Successfully loaded ${binsData.length} bins`);
            setBins(binsData);
        } else {
            console.warn('API returned unexpected bins format, trying to handle as array if possible');
            setBins(Array.isArray(response.data) ? response.data : []);
        }
        
        if (history && history.length > 0) {
          setTrends(history.map(h => ({
            timestamp: h.timestamp,
            fillLevel: h.averageFillLevel
          })));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Data fetch error:', err);
        setLoading(false);
      }
    };

    if (user) {
      if (user.hubId) {
        console.log('Joining hub socket:', user.hubId);
        socket.emit('joinHub', user.hubId);
      }
      fetchData();

      // Socket listeners
      socket.on('binUpdate', (updatedBin) => {
        setBins(prevBins => {
          const index = prevBins.findIndex(b => b.hardwareId === updatedBin.hardwareId);
          if (index !== -1) {
            const newBins = [...prevBins];
            newBins[index] = updatedBin;
            return newBins;
          } else {
            return [...prevBins, updatedBin];
          }
        });
      });

      socket.on('trendUpdate', (point) => {
        setTrends(prev => {
          const updated = [...prev, point];
          return updated.slice(-30);
        });
      });
    } else if (!authLoading) {
      setLoading(false);
    }

    return () => {
      socket.off('binUpdate');
      socket.off('trendUpdate');
    };
  }, [user, authLoading]);

  const handleBinAdded = (newBin) => {
    setBins(prev => [...prev, newBin]);
  };

  const handleRemoveBin = async (hardwareId) => {
    try {
      await axios.delete(`${CONFIG.API_BINS}/${hardwareId}`);
      setBins(prev => prev.filter(b => b.hardwareId !== hardwareId));
    } catch (err) {
      console.error('Failed to remove bin:', err);
    }
  };

  const handleEmptyBin = async (hardwareId) => {
    try {
      await axios.patch(`${CONFIG.API_BINS}/${hardwareId}`, {
        fillLevel: 0,
        status: 'Empty'
      });
      // The socket event will trigger the UI update automatically
    } catch (err) {
      console.error('Failed to empty bin:', err);
    }
  };

  const totalBins = bins.length;
  const fullBins = bins.filter(b => b.status === 'Full').length;
  const lowBattery = bins.filter(b => b.batteryLevel < 20).length;
  const healthyBins = bins.filter(b => b.status !== 'Full' && b.batteryLevel >= 20).length;

  if (authLoading || loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Animated Background Elements */}
        <div style={{ position: 'absolute', bottom: '20%', display: 'flex', gap: '40px', alignItems: 'flex-end', opacity: 0.4 }}>
           <div className="animate-sway" style={{ animationDelay: '0s' }}><Trees size={80} color="#10b981" /></div>
           <div className="animate-sway" style={{ animationDelay: '1s' }}><Trees size={120} color="#059669" /></div>
           <div className="animate-sway" style={{ animationDelay: '0.5s' }}><Trees size={60} color="#34d399" /></div>
        </div>

        {/* Central Animation */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '30px', zIndex: 10 }}>
          <div className="animate-float" style={{ animation: 'float 3s ease-in-out infinite' }}>
            <UserIcon size={50} color="#38bdf8" />
          </div>
          <div className="animate-pulse-glow" style={{ position: 'relative' }}>
             <Trash2 size={70} color="#f8fafc" />
             <div style={{
               position: 'absolute',
               bottom: '10px',
               left: '50%',
               transform: 'translateX(-50%)',
               width: '30px',
               height: '20px',
               background: '#10b981',
               opacity: 0.6,
               borderRadius: '4px',
               animation: 'fill 2s ease-in-out infinite'
             }}></div>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
            EcoSmart <span style={{ color: '#38bdf8' }}>Cloud</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Optimizing urban waste networks...</p>
        </div>

        <style>{`
          @keyframes sway {
            0%, 100% { transform: rotate(-2deg); }
            50% { transform: rotate(2deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-15px) rotate(5deg); }
          }
          @keyframes fill {
            0%, 100% { height: 5px; opacity: 0.3; }
            50% { height: 25px; opacity: 0.8; }
          }
          .animate-sway {
            animation: sway 4s ease-in-out infinite;
            transform-origin: bottom center;
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggle={() => setShowLogin(false)} />
    ) : (
      <Register onToggle={() => setShowLogin(true)} />
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'map':
        return (
          <div className="grid grid-cols-1">
            <BinMap bins={bins} height="calc(100vh - 200px)" />
          </div>
        );
      case 'settings':
        return <Settings />;
      case 'analytics':
        return (
          <div className="grid grid-cols-1">
            <TrendChart data={trends} />
            <BinTable bins={bins} onEmptyBin={handleEmptyBin} onRemoveBin={handleRemoveBin} />
          </div>
        );
      case 'bins':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                onClick={() => setShowAddBin(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 18px',
                  background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                  border: 'none', borderRadius: '8px',
                  color: 'white', fontWeight: 600, fontSize: '0.88rem',
                  cursor: 'pointer', boxShadow: '0 4px 15px rgba(56,189,248,0.25)',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                <Plus size={16} /> Add Bin
              </button>
            </div>
            <BinTable bins={bins} onEmptyBin={handleEmptyBin} onRemoveBin={handleRemoveBin} />
          </div>
        );
      case 'overview':
      default:
        return (
          <>
            <section className="grid grid-cols-4" style={{ marginBottom: '40px' }}>
              <StatsCard
                title={t('total_bins')}
                value={totalBins}
                icon={Trash2}
                color="#38bdf8"
                subValue="Actively reporting"
              />
              <StatsCard
                title={t('full_bins')}
                value={fullBins}
                icon={AlertTriangle}
                color="#ef4444"
                trend={fullBins > 0 ? `Alert` : null}
                subValue="Need immediate collection"
              />
              <StatsCard
                title={t('low_battery')}
                value={lowBattery}
                icon={Battery}
                color="#f59e0b"
                subValue="Maintenance required"
              />
              <StatsCard
                title={t('system_health')}
                value={`${Math.round((healthyBins / totalBins || 1) * 100)}%`}
                icon={CheckCircle2}
                color="#10b981"
                subValue="Optimization score"
              />
            </section>

            <section className="grid grid-cols-2" style={{ marginBottom: '40px' }}>
              <BinMap bins={bins} />
              <TrendChart data={trends} />
            </section>

            <section style={{ marginBottom: '40px' }}>
              <BinTable bins={bins} onEmptyBin={handleEmptyBin} onRemoveBin={handleRemoveBin} />
            </section>
          </>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        <header style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>
              {t(activeView)}
            </h1>
            <div style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '6px 14px',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('hub_id')}</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>{user.hubId}</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{t('active_bins_in')} <b>{user.city}</b></p>
        </header>

          {renderContent()}
      </main>

      {showAddBin && (
        <AddBinModal
          onClose={() => setShowAddBin(false)}
          onBinAdded={handleBinAdded}
        />
      )}

      {/* Debug Info Panel */}
      <div style={{
        position: 'fixed', bottom: '10px', right: '10px',
        padding: '8px 12px', background: 'rgba(0,0,0,0.8)',
        borderRadius: '8px', zIndex: 10000, fontSize: '10px', color: '#38bdf8',
        border: '1px solid rgba(56,189,248,0.3)', pointerEvents: 'none'
      }}>
        API: {CONFIG.API_BINS} | Bins: {bins.length} | User: {user?.username}
      </div>
    </div>
  );
}

export default App;

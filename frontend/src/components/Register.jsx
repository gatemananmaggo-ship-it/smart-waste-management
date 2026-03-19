import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, MapPin, User, LogIn, Globe, Map, Home } from 'lucide-react';

const Register = ({ onToggle }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        area_access: '',
        state: '',
        city: '',
        place: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(formData);
        if (res.success) {
            setSuccess(true);
            setTimeout(onToggle, 2000);
        } else {
            setError(res.message);
        }
    };

    if (success) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh',
                background: 'var(--bg-color)', color: 'var(--text-primary)'
            }}>
                <div style={{
                    width: '100%', maxWidth: '400px', padding: '40px',
                    background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)',
                    borderRadius: '16px', textAlign: 'center'
                }}>
                    <h2 style={{ color: '#10b981', marginBottom: '16px' }}>Account Created!</h2>
                    <p>Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh',
            background: 'var(--bg-color)', color: 'var(--text-primary)'
        }}>
            <div style={{
                width: '100%', maxWidth: '400px', padding: '40px',
                background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)',
                borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>Create Account</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'center' }}>Join EcoSmart and manage your area</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Area Access Detail</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                name="area_access"
                                type="text"
                                placeholder="e.g. Campus North, Sector 7"
                                value={formData.area_access}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>State</label>
                            <div style={{ position: 'relative' }}>
                                <Globe size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    name="state"
                                    type="text"
                                    placeholder="e.g. Haryana"
                                    value={formData.state}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white'
                                    }}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>City</label>
                            <div style={{ position: 'relative' }}>
                                <Map size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    name="city"
                                    type="text"
                                    placeholder="e.g. Gurugram"
                                    value={formData.city}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(15, 23, 42, 0.6)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white'
                                    }}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Place / Organization</label>
                        <div style={{ position: 'relative' }}>
                            <Home size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                name="place"
                                type="text"
                                placeholder="e.g. DLF Phase 3"
                                value={formData.place}
                                onChange={handleChange}
                                style={{
                                    width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white'
                                }}
                                required
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.88rem' }}>{error}</p>}

                    <button type="submit" style={{
                        width: '100%', padding: '12px', background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                        border: 'none', borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer',
                        marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}>
                        <LogIn size={18} /> Register
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    Already have an account? 
                    <button onClick={onToggle} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginLeft: '4px', fontWeight: 600 }}>Login</button>
                </p>
            </div>
        </div>
    );
};

export default Register;

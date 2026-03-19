import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

const Login = ({ onToggle }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(username, password);
        if (!res.success) {
            setError(res.message);
        }
    };

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
                <h2 style={{ fontSize: '2rem', marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', textAlign: 'center' }}>Sign in to access your garbage bin area</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 12px 12px 40px', background: 'rgba(15, 23, 42, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'white'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        <LogIn size={18} /> Login
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    Don't have an account? 
                    <button onClick={onToggle} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginLeft: '4px', fontWeight: 600 }}>Sign up</button>
                </p>
            </div>
        </div>
    );
};

export default Login;

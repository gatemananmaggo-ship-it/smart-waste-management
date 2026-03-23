import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Palette, Languages, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, Globe, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import CONFIG from '../config';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const { language, t, changeLanguage } = useLanguage();
    
    // Password state
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPasswords, setShowPasswords] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isUpdating, setIsUpdating] = useState(false);

    // Phone state
    const [newPhone, setNewPhone] = useState(user?.phone || '');
    const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

    // Theme state (local for now, could be in Context)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setStatus({ type: 'error', message: 'Passwords do not match' });
        }

        setIsUpdating(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${CONFIG.API_URL}/profile/change-password`, 
                { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus({ type: 'success', message: 'Password updated successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update password' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePhoneUpdate = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });
        setIsUpdatingPhone(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${CONFIG.API_URL}/profile/update-phone`, 
                { phone: newPhone },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            updateUser({ phone: res.data.phone });
            setStatus({ type: 'success', message: 'Phone number updated successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update phone' });
        } finally {
            setIsUpdatingPhone(false);
        }
    };

    const sectionStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px'
    };

    const labelStyle = {
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        marginBottom: '6px',
        display: 'block'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        color: 'white',
        fontSize: '0.95rem'
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Account Information */}
            <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <User color="var(--accent-primary)" size={24} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{t('account_info')}</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <span style={labelStyle}>{t('username')}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                            <User size={16} color="var(--text-secondary)" />
                            <span>{user?.username}</span>
                        </div>
                    </div>
                    <div>
                        <span style={labelStyle}>{t('email')}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                            <Mail size={16} color="var(--text-secondary)" />
                            <span>{user?.email}</span>
                        </div>
                    </div>
                    <div>
                        <span style={labelStyle}>{t('hub_id')}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)', fontWeight: 700, fontFamily: 'monospace' }}>
                            <Shield size={16} />
                            <span>{user?.hubId}</span>
                        </div>
                    </div>
                    <div>
                        <span style={labelStyle}>{t('city')} / {t('state')}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                            <Globe size={16} color="var(--text-secondary)" />
                            <span>{user?.city}, {user?.state}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                    <form onSubmit={handlePhoneUpdate} style={{ display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={labelStyle}>Mobile Number (SMS Alerts)</label>
                            <div style={{ position: 'relative' }}>
                                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="tel"
                                    style={{ ...inputStyle, paddingLeft: '40px' }}
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    placeholder="e.g. 9876543210"
                                    required
                                />
                            </div>
                        </div>
                        <button 
                            type="submit"
                            disabled={isUpdatingPhone}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                fontWeight: 600,
                                cursor: isUpdatingPhone ? 'not-allowed' : 'pointer',
                                opacity: isUpdatingPhone ? 0.7 : 1
                            }}
                        >
                            {isUpdatingPhone ? 'Saving...' : 'Update Phone'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Appearance & Language */}
            <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <Palette color="var(--accent-primary)" size={24} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{t('appearance')}</h3>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '20px' }}>
                    <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{t('theme')}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Toggle between {theme === 'dark' ? 'light' : 'dark'} mode</p>
                    </div>
                    <button 
                        onClick={handleThemeToggle}
                        style={{
                            padding: '8px 20px',
                            background: theme === 'dark' ? '#38bdf8' : '#6366f1',
                            border: 'none',
                            borderRadius: '30px',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {theme === 'dark' ? t('light') : t('dark')}
                    </button>
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Languages size={18} color="var(--text-secondary)" />
                        <span style={{ fontWeight: 600 }}>{t('language')}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        {[
                            { code: 'en', name: 'English' },
                            { code: 'hi', name: 'हिन्दी' },
                            { code: 'bn', name: 'বাংলা' },
                            { code: 'mr', name: 'मराठी' },
                            { code: 'te', name: 'తెలుగు' },
                            { code: 'ta', name: 'தமிழ்' }
                        ].map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                style={{
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: language === lang.code ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                    background: language === lang.code ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.02)',
                                    color: language === lang.code ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Security */}
            <div style={sectionStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <Shield color="#ef4444" size={24} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{t('security')}</h3>
                </div>

                <form onSubmit={handlePasswordChange}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>{t('current_password')}</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                style={inputStyle}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label style={labelStyle}>{t('new_password')}</label>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                style={inputStyle}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>{t('confirm_password')}</label>
                            <input
                                type={showPasswords ? 'text' : 'password'}
                                style={inputStyle}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    {status.message && (
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', 
                            borderRadius: '8px', marginBottom: '20px',
                            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: status.type === 'success' ? '#10b981' : '#ef4444',
                            border: `1px solid ${status.type === 'success' ? '#10b981' : '#ef4444'}`
                        }}>
                            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                            <span style={{ fontSize: '0.9rem' }}>{status.message}</span>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isUpdating}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--accent-primary)',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 700,
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            opacity: isUpdating ? 0.7 : 1
                        }}
                    >
                        {isUpdating ? 'Updating...' : t('update_password')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;

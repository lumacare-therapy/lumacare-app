/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/globals.css';

// ==================== GOOGLE CLIENT ID ====================
const GOOGLE_CLIENT_ID = "253002272888-cg3k451mqesnerv21056utk8u1lk22f6.apps.googleusercontent.com";

// ==================== AUTH CONTEXT ====================
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('lumacare_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('lumacare_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lumacare_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// ==================== LOADING COMPONENTS ====================
const LoadingSpinner = ({ size = 'medium', color = '#8b5cf6' }) => {
  const sizes = { small: '24px', medium: '40px', large: '60px' };
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="loading-spinner" style={{ width: sizes[size], height: sizes[size], borderTopColor: color }} />
    </div>
  );
};

const LoadingWave = () => (
  <div className="loading-wave">
    <span></span><span></span><span></span><span></span><span></span>
  </div>
);

// ==================== TECHNIQUES DATA ====================
const techniquesData = {
  'priority-matrix': { 
    id: 'priority-matrix', name: 'Priority Matrix', icon: '📌', description: 'Organize tasks by urgency and importance', 
    whenToUse: 'When feeling overwhelmed with multiple responsibilities', color: '#fbbf24', type: 'matrix', category: '📌 Matrix', location: 'matrix' 
  },
  'box-breathing': { 
    id: 'box-breathing', name: 'Box Breathing', icon: '⬛', description: '4-4-4-4 breathing pattern for instant calm', 
    whenToUse: 'During acute anxiety, panic symptoms, physical tension', color: '#8b5cf6', type: 'breathing', category: '🌬️ Breathing', location: 'breathe',
    pattern: '4-4-4-4', inhale: 4, hold1: 4, exhale: 4, hold2: 4, minCycles: 5, maxCycles: 10 
  },
  '478-breathing': { 
    id: '478-breathing', name: '4-7-8 Breathing', icon: '🌬️', description: 'Relaxation breath for anxiety and sleep', 
    whenToUse: 'During anxiety, before sleep, or when stressed', color: '#06b6d4', type: 'breathing', category: '🌬️ Breathing', location: 'breathe',
    pattern: '4-7-8', inhale: 4, hold1: 7, exhale: 8, hold2: 4, minCycles: 5, maxCycles: 10 
  },
  'cognitive-restructuring': { 
    id: 'cognitive-restructuring', name: 'Cognitive Restructuring', icon: '🧠', description: 'Challenge and reframe negative thoughts', 
    whenToUse: 'When experiencing negative self-talk or catastrophic thinking', color: '#f472b6', type: 'cognitive', category: '🧠 Cognitive', location: 'breathe' 
  },
  'pomodoro': { 
    id: 'pomodoro', name: 'Pomodoro Technique', icon: '⏰', description: 'Focused work intervals with breaks', 
    whenToUse: 'When struggling with focus or procrastination', color: '#f97316', type: 'pomodoro', category: '⏰ Focus', location: 'breathe' 
  },
  'grounding': { 
    id: 'grounding', name: '5-4-3-2-1 Grounding', icon: '🌱', description: 'Use your senses to stay present', 
    whenToUse: 'During panic attacks, dissociation, or feeling disconnected', color: '#f87171', type: 'grounding', category: '🌱 Grounding', location: 'breathe' 
  },
  'progressive-muscle-relaxation': { 
    id: 'progressive-muscle-relaxation', name: 'Progressive Muscle Relaxation', icon: '🫂', description: 'Tense and release muscle groups', 
    whenToUse: 'When you feel physical tension, tight shoulders', color: '#8b5cf6', type: 'body-scan', category: '🔍 Body Scan', location: 'breathe' 
  },
  'rain-method': { 
    id: 'rain-method', name: 'RAIN Method', icon: '🌧️', description: 'A mindfulness tool for difficult emotions', 
    whenToUse: 'When feeling overwhelmed by emotions', color: '#06b6d4', type: 'mindfulness', category: '🧘 Mindfulness', location: 'breathe' 
  },
  'body-scan': { 
    id: 'body-scan', name: 'Body Scan', icon: '🔍', description: 'Bring attention to each part of your body', 
    whenToUse: 'When feeling disconnected from your body', color: '#f472b6', type: 'meditation', category: '🙏 Meditation', location: 'breathe' 
  },
  'noting-practice': { 
    id: 'noting-practice', name: 'Noting Practice', icon: '📝', description: 'Label thoughts and let them pass', 
    whenToUse: 'When your mind is racing', color: '#fbbf24', type: 'mindfulness', category: '🧘 Mindfulness', location: 'breathe' 
  },
  'self-compassion-break': { 
    id: 'self-compassion-break', name: 'Self-Compassion Break', icon: '🤍', description: 'Three phrases to be kinder to yourself', 
    whenToUse: 'When you\'re being hard on yourself', color: '#f87171', type: 'cognitive', category: '🧠 Cognitive', location: 'breathe' 
  },
  'stop-technique': { 
    id: 'stop-technique', name: 'STOP Technique', icon: '🛑', description: 'A quick reset when overwhelmed', 
    whenToUse: 'During moments of panic or stress', color: '#f97316', type: 'grounding', category: '🌱 Grounding', location: 'breathe' 
  },
  'gratitude-log': { 
    id: 'gratitude-log', name: 'Gratitude Log', icon: '🙏', description: 'Write down 3 things you appreciate', 
    whenToUse: 'When feeling down or to end your day', color: '#06b6d4', type: 'journal', category: '📝 Journal', location: 'breathe' 
  }
};

// ==================== USER SESSION TRACKING ====================
const useSessionTracking = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(user);
  useEffect(() => { if (user) setUserData(user); }, [user]);
  const canUseSession = () => {
    if (!userData) return false;
    if (userData.isPremium) return true;
    if (!userData.lastSessionTime) return true;
    return (Date.now() - userData.lastSessionTime) / (1000 * 60 * 60) >= 12;
  };
  const trackSession = (techniqueType, rating = null, feedback = '') => {
    if (!userData) return { success: false };
    if (!canUseSession() && !userData.isPremium) return { success: false, message: 'Session limit reached' };
    const newStats = { ...userData.stats };
    const dayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    if (techniqueType === 'breathing') newStats.breathing += 1;
    else if (techniqueType === 'cognitive') newStats.aiSessions += 1;
    else if (techniqueType === 'grounding') newStats.sosUsed += 1;
    else if (techniqueType === 'pomodoro') newStats.aiSessions += 1;
    newStats.weeklyData[dayIndex].sessions += 1;
    if (rating) {
      newStats.moodScores.push({ score: rating, timestamp: Date.now(), feedback, technique: techniqueType });
      const todayMoods = newStats.moodScores.filter(m => new Date(m.timestamp).toDateString() === new Date().toDateString());
      const avgMood = todayMoods.reduce((sum, m) => sum + m.score, 0) / todayMoods.length || 0;
      newStats.weeklyData[dayIndex].mood = Math.round(avgMood * 20);
    }
    const updatedUser = { ...userData, lastSessionTime: Date.now(), sessionsRemaining: userData.isPremium ? Infinity : userData.sessionsRemaining - 1, stats: newStats };
    setUserData(updatedUser);
    localStorage.setItem('lumacare_user', JSON.stringify(updatedUser));
    return { success: true };
  };
  const upgradeUser = (plan) => {
    const updatedUser = { ...userData, isPremium: plan === 'monthly', sessionsRemaining: plan === 'session' ? userData.sessionsRemaining + 1 : Infinity, premiumExpiry: plan === 'monthly' ? Date.now() + (30 * 24 * 60 * 60 * 1000) : userData.premiumExpiry };
    setUserData(updatedUser);
    localStorage.setItem('lumacare_user', JSON.stringify(updatedUser));
  };
  return { userData, canUseSession, trackSession, upgradeUser };
};

// ==================== LOGIN PAGE ====================
const LoginPage = ({ onLogin }) => {
  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    onLogin({ name: decoded.name, email: decoded.email, picture: decoded.picture, isPremium: false, sessionsRemaining: 1, lastSessionTime: null, stats: { aiSessions: 0, breathing: 0, sosUsed: 0, journal: 0, moodScores: [], weeklyData: [{ day: 'Mon', mood: 0, sessions: 0 }, { day: 'Tue', mood: 0, sessions: 0 }, { day: 'Wed', mood: 0, sessions: 0 }, { day: 'Thu', mood: 0, sessions: 0 }, { day: 'Fri', mood: 0, sessions: 0 }, { day: 'Sat', mood: 0, sessions: 0 }, { day: 'Sun', mood: 0, sessions: 0 }] } });
  };
  const handleGuestLogin = () => {
    onLogin({ name: 'Guest', email: 'guest@lumacare.app', picture: null, isPremium: false, sessionsRemaining: 3, lastSessionTime: null, stats: { aiSessions: 0, breathing: 0, sosUsed: 0, journal: 0, moodScores: [], weeklyData: [{ day: 'Mon', mood: 0, sessions: 0 }, { day: 'Tue', mood: 0, sessions: 0 }, { day: 'Wed', mood: 0, sessions: 0 }, { day: 'Thu', mood: 0, sessions: 0 }, { day: 'Fri', mood: 0, sessions: 0 }, { day: 'Sat', mood: 0, sessions: 0 }, { day: 'Sun', mood: 0, sessions: 0 }] } });
  };
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => { const handleResize = () => setWindowWidth(window.innerWidth); window.addEventListener('resize', handleResize); return () => window.removeEventListener('resize', handleResize); }, []);
  const isMobile = windowWidth <= 768;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a0b2e 0%, #0f172a 50%, #1e1b4b 100%)', padding: '20px' }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 24px' }}>
        <img src="https://i.ibb.co/DHdnTVGs/Glowing-lotus-with-diamond-accents.png" alt="LumaCare Logo" style={{ width: '80px', height: 'auto', marginBottom: '16px' }} />
        <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '8px' }}>LumaCare</h1>
        <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Your daily system for mental clarity and focus</p>
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.error('Google Failed')} useOneTap theme="filled_black" shape="pill" text="continue_with" size="large" width="100%" />
        <button onClick={handleGuestLogin} style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '40px', color: 'white', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>Continue as Guest (3 free sessions)</button>
      </div>
    </div>
  );
};

// ==================== PREMIUM MODAL ====================
const PremiumModal = ({ onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const handlePayFast = (plan) => {
    setIsProcessing(true);
    window.open(plan === 'monthly' ? 'https://payf.st/bk8we' : 'https://payf.st/1frnc', '_blank');
    setTimeout(() => { setIsProcessing(false); if (window.confirm('Did you complete the payment?')) { onUpgrade(plan); onClose(); } }, 3000);
  };
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="glass-card" style={{ maxWidth: '500px', width: '90%', position: 'relative', padding: '32px' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        <h2 className="text-gradient" style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '24px' }}>Upgrade Your Journey</h2>
        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
          <div onClick={() => setSelectedPlan('monthly')} style={{ padding: '20px', background: selectedPlan === 'monthly' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(15, 23, 42, 0.5)', borderRadius: '24px', border: selectedPlan === 'monthly' ? '1px solid #8b5cf6' : '1px solid rgba(139, 92, 246, 0.2)', cursor: 'pointer' }}>
            <h3 style={{ color: '#f1f5f9' }}>Premium Monthly — $9.99/mo</h3>
            <p style={{ color: '#94a3b8' }}>Unlimited sessions, all techniques, priority support</p>
          </div>
          <div onClick={() => setSelectedPlan('session')} style={{ padding: '20px', background: selectedPlan === 'session' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.5)', borderRadius: '24px', border: selectedPlan === 'session' ? '1px solid #06b6d4' : '1px solid rgba(139, 92, 246, 0.2)', cursor: 'pointer' }}>
            <h3 style={{ color: '#f1f5f9' }}>Single Session — $2.99</h3>
            <p style={{ color: '#94a3b8' }}>One additional session, all techniques</p>
          </div>
        </div>
        <button onClick={() => handlePayFast(selectedPlan)} disabled={isProcessing} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', border: 'none', borderRadius: '40px', color: 'white', fontWeight: 'bold', cursor: 'pointer', opacity: isProcessing ? 0.6 : 1 }}>{isProcessing ? 'Processing...' : 'Upgrade'}</button>
      </div>
    </div>
  );
};

// ==================== MAIN APP COMPONENT ====================
function App() {
  const [scrolled, setScrolled] = useState(false);
  const { user, login, logout } = useAuth();
  const [currentTechnique, setCurrentTechnique] = useState(null);
  const { userData, trackSession, upgradeUser } = useSessionTracking();
  const [showPremium, setShowPremium] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => { window.removeEventListener('resize', handleResize); window.removeEventListener('scroll', handleScroll); };
  }, []);

  const isMobile = windowWidth <= 768;
  const navigateTo = (path) => { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); };
  const startTechnique = (techniqueId) => { const technique = techniquesData[techniqueId]; setCurrentTechnique(technique); localStorage.setItem('lumacare_current_technique', JSON.stringify(technique)); navigateTo(technique.location === 'matrix' ? '/matrix' : '/breathe'); };
  const handleTechniqueComplete = (techniqueId, rating, feedback) => { const technique = techniquesData[techniqueId]; if (technique) trackSession(technique.type, rating, feedback); setCurrentTechnique(null); localStorage.removeItem('lumacare_current_technique'); navigateTo('/techniques'); };
  const handleBack = () => { setCurrentTechnique(null); localStorage.removeItem('lumacare_current_technique'); navigateTo('/techniques'); };
  const handleUpgrade = (plan) => upgradeUser(plan);
  useEffect(() => { const saved = localStorage.getItem('lumacare_current_technique'); if (saved && window.location.pathname === '/breathe') setCurrentTechnique(JSON.parse(saved)); }, []);

  const styles = {
    container: { minHeight: '100vh', background: 'transparent', fontFamily: 'Inter, system-ui, sans-serif', color: '#f1f5f9', position: 'relative' },
    nav: { position: 'sticky', top: '20px', zIndex: 100, margin: '20px 24px', padding: '12px 24px', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '60px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
    navContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' },
    logo: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
    logoText: { fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #f0f9ff 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    navLinks: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' },
    navItem: { padding: '8px 20px', borderRadius: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', textDecoration: 'none', cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '0.95rem' },
    navItemActive: { color: '#c084fc', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)' },
    main: { maxWidth: '1200px', margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 2 },
    card: { background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '32px', padding: '28px', transition: 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)' },
    title: { fontSize: '2.5rem', fontWeight: 500, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #f0f9ff 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' },
    subtitle: { fontSize: '1.1rem', color: '#94a3b8', marginBottom: '32px', fontWeight: 400 },
    button: { padding: '12px 28px', borderRadius: '40px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.3s ease' },
    premiumButton: { padding: '8px 20px', borderRadius: '30px', border: 'none', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: 'white', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' },
    input: { padding: '14px 20px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '28px', color: '#f1f5f9', fontSize: '1rem', width: '100%', marginBottom: '16px' },
    select: { padding: '14px 20px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '28px', color: '#f1f5f9', fontSize: '1rem', width: '100%', marginBottom: '16px', cursor: 'pointer' },
    profileImage: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #c084fc' },
    profilePlaceholder: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'white' },
    badge: { background: 'rgba(139, 92, 246, 0.2)', color: '#c084fc', padding: '8px 20px', borderRadius: '40px', fontSize: '0.85rem', fontWeight: 500, display: 'inline-block', marginBottom: '24px', border: '1px solid rgba(139, 92, 246, 0.3)' },
  };

  // ==================== TECHNIQUE INSTRUCTION MODAL ====================
  const TechniqueInstructions = ({ technique, onStart, onBack }) => {
    const [showInstructions, setShowInstructions] = useState(true);
    if (!showInstructions) return onStart();
    return (
      <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '32px', border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{technique.icon}</div>
        <h2 className="text-gradient" style={{ fontSize: '1.8rem' }}>{technique.name}</h2>
        <div style={{ textAlign: 'left', margin: '20px 0' }}>
          <h3 style={{ color: technique.color }}>📋 What it is:</h3>
          <p style={{ color: '#94a3b8' }}>{technique.description}</p>
          <h3 style={{ color: technique.color, marginTop: '16px' }}>🎯 When to use:</h3>
          <p style={{ color: '#94a3b8' }}>{technique.whenToUse}</p>
          <h3 style={{ color: technique.color, marginTop: '16px' }}>🏷️ Category:</h3>
          <p style={{ color: '#94a3b8' }}>{technique.category || 'Wellness'}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onBack} style={{ ...styles.button, background: 'transparent', border: '2px solid #94a3b8', flex: 1 }}>Back</button>
          <button onClick={() => setShowInstructions(false)} style={{ ...styles.button, flex: 1 }}>Start Session →</button>
        </div>
      </div>
    );
  };

  // ==================== DASHBOARD ====================
  const Dashboard = ({ navigateTo, userData, startTechnique }) => {
    const [stressLevel, setStressLevel] = useState(42);
    const [clarityScore, setClarityScore] = useState(68);
    const [greeting, setGreeting] = useState('');
    useEffect(() => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('morning');
      else if (hour < 17) setGreeting('afternoon');
      else setGreeting('evening');
      if (userData?.stats) {
        const avgMood = userData.stats.moodScores.length > 0 ? userData.stats.moodScores.reduce((sum, m) => sum + m.score, 0) / userData.stats.moodScores.length : 4.2;
        setStressLevel(Math.round(100 - (avgMood * 20)));
        setClarityScore(Math.min(100, Math.round(50 + (userData.stats.moodScores.filter(m => m.score >= 4).length * 2))));
      }
    }, [userData]);
    const formatTime = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (!userData) return null;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div><h1 className="text-gradient" style={styles.title}>Good {greeting}, {userData.name?.split(' ')[0] || 'there'}</h1><p style={styles.subtitle}>Your mind is clear. Let's keep it that way.</p></div>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px 24px', borderRadius: '40px', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', gap: '24px' }}>
            <div><span>🕐</span> {formatTime()}</div>
            {!userData.isPremium && <div>🎯 {userData.sessionsRemaining > 0 ? `${userData.sessionsRemaining} left` : 'No sessions'}</div>}
            {userData.isPremium && <div>✨ Premium</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexDirection: isMobile ? 'column' : 'row', marginBottom: '24px' }}>
          <div style={{ ...styles.card, textAlign: 'center', flex: 1 }}><h3 style={{ color: '#94a3b8', marginBottom: '16px' }}>Stress Level</h3><div style={{ fontSize: '3rem', fontWeight: 500 }}>{stressLevel}%</div></div>
          <div style={{ ...styles.card, textAlign: 'center', flex: 1 }}><h3 style={{ color: '#94a3b8', marginBottom: '16px' }}>Task Clarity</h3><div style={{ fontSize: '3rem', fontWeight: 500 }}>{clarityScore}%</div></div>
        </div>
        <div style={styles.card}>
          <h3 style={{ color: '#c084fc', marginBottom: '16px' }}>🤔 Quick Tools</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <button onClick={() => startTechnique('box-breathing')} style={styles.button}>😰 Anxious</button>
            <button onClick={() => startTechnique('priority-matrix')} style={styles.button}>😤 Overwhelmed</button>
            <button onClick={() => startTechnique('grounding')} style={styles.button}>😔 Sad</button>
            <button onClick={() => startTechnique('cognitive-restructuring')} style={styles.button}>🧠 Racing thoughts</button>
          </div>
          <button onClick={() => { const keys = Object.keys(techniquesData); startTechnique(keys[Math.floor(Math.random() * keys.length)]); }} style={{ ...styles.button, width: '100%', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.4)' }}>🎲 Surprise me</button>
        </div>
        <div style={styles.card}>
          <h3 style={{ color: '#c084fc', marginBottom: '16px' }}>Weekly Progress</h3>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div><div style={{ width: '12px', height: '12px', background: '#8b5cf6', borderRadius: '3px', display: 'inline-block', marginRight: '8px' }} />Mood</div>
            <div><div style={{ width: '12px', height: '12px', background: '#06b6d4', borderRadius: '3px', display: 'inline-block', marginRight: '8px' }} />Sessions</div>
          </div>
          <div style={{ display: 'flex', gap: '16px', overflowX: isMobile ? 'auto' : 'visible' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '8px', minWidth: '30px' }}><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', minWidth: isMobile ? '500px' : 'auto' }}>
              {userData.stats.weeklyData.map((data, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px' }}>
                  <div style={{ width: '20px', height: `${data.mood}px`, background: '#8b5cf6', borderRadius: '10px 10px 0 0', marginBottom: '4px' }} />
                  <div style={{ width: '20px', height: `${Math.min(data.sessions * 15, 150)}px`, background: '#06b6d4', borderRadius: '10px 10px 0 0' }} />
                  <span style={{ marginTop: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>{data.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px', marginTop: '24px' }}>
          {[{ icon: '🤖', label: 'AI Sessions', value: userData.stats.aiSessions }, { icon: '🌬️', label: 'Breathing', value: userData.stats.breathing }, { icon: '🆘', label: 'SOS', value: userData.stats.sosUsed }, { icon: '📝', label: 'Journal', value: userData.stats.journal }].map((stat, i) => (
            <div key={i} style={{ ...styles.card, textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '2rem' }}>{stat.icon}</div><div style={{ fontSize: '1.5rem', fontWeight: 500 }}>{stat.value}</div><div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{stat.label}</div></div>
          ))}
        </div>
      </div>
    );
  };

  // ==================== BREATHING TECHNIQUE ====================
const BreathingTechnique = ({ technique, onComplete, onBack }) => {
  const [cycles, setCycles] = useState(technique.minCycles);
  const [isActive, setIsActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(technique.inhale);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [customInhale, setCustomInhale] = useState(technique.inhale);
  const [customHold1, setCustomHold1] = useState(technique.hold1);
  const [customExhale, setCustomExhale] = useState(technique.exhale);
  const [customHold2, setCustomHold2] = useState(technique.hold2);
  const [useCustomTimes, setUseCustomTimes] = useState(false);

  const inhaleTime = useCustomTimes ? customInhale : technique.inhale;
  const hold1Time = useCustomTimes ? customHold1 : technique.hold1;
  const exhaleTime = useCustomTimes ? customExhale : technique.exhale;
  const hold2Time = useCustomTimes ? customHold2 : technique.hold2;

  // Timer effect
  useEffect(() => {
    let timer;
    if (isActive && !completed && !paused) {
      timer = setInterval(() => {
        setCount(prev => {
          if (prev <= 1) {
            if (phase === 'inhale') { setPhase('hold1'); return hold1Time; }
            if (phase === 'hold1') { setPhase('exhale'); return exhaleTime; }
            if (phase === 'exhale') { setPhase('hold2'); return hold2Time; }
            if (phase === 'hold2') {
              if (currentCycle >= cycles) {
                setCompleted(true);
                setIsActive(false);
                return inhaleTime;
              }
              setPhase('inhale');
              setCurrentCycle(c => c + 1);
              return inhaleTime;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, completed, paused, phase, currentCycle, cycles, inhaleTime, hold1Time, exhaleTime, hold2Time]);

  // Sound effect
  useEffect(() => {
    if (soundEnabled && isActive && !completed && !paused) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        let freq = 440;
        if (phase === 'inhale') freq = 440;
        else if (phase === 'hold1') freq = 330;
        else if (phase === 'exhale') freq = 220;
        else freq = 330;
        oscillator.frequency.value = freq;
        gainNode.gain.value = 0.15;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.2);
        oscillator.stop(audioContext.currentTime + 0.2);
        audioContext.resume().catch(e => {});
      } catch (e) {}
    }
  }, [phase, soundEnabled, isActive, completed, paused]);

  // Haptic feedback
  useEffect(() => {
    if (hapticEnabled && isActive && !completed && !paused && 'vibrate' in navigator) {
      if (phase === 'inhale') navigator.vibrate(50);
      else if (phase === 'hold1') navigator.vibrate(30);
      else if (phase === 'exhale') navigator.vibrate(80);
      else if (phase === 'hold2') navigator.vibrate(30);
    }
  }, [phase, hapticEnabled, isActive, completed, paused]);

  const handleStart = () => {
    setIsActive(true);
    setPaused(false);
    setCurrentCycle(1);
    setPhase('inhale');
    setCount(inhaleTime);
    setCompleted(false);
  };

  const handlePause = () => {
    setIsActive(false);
    setPaused(true);
  };

  const handleResume = () => {
    setIsActive(true);
    setPaused(false);
  };

  const handleComplete = () => {
    onComplete(technique.id, rating, feedback);
  };

  if (completed) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem' }}>✨</div>
        <h2 className="text-gradient">Session Complete!</h2>
        <p>You completed {cycles} cycles.</p>
        <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
          <h3>How do you feel?</h3>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(139,92,246,0.2)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer' }}>{n}</button>
            ))}
          </div>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Share your experience..." style={styles.input} />
          <button onClick={handleComplete} style={styles.button}>Save</button>
          <button onClick={onBack} style={{ ...styles.button, background: 'transparent', border: '2px solid #94a3b8', marginTop: '10px' }}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
      <h1 className="text-gradient">{technique.name}</h1>
      <p style={{ color: technique.color }}>Pattern: {technique.pattern}</p>
      
      {!isActive || paused ? (
        <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}>
          <h3>Set Your Session</h3>
          <p>Cycles: {cycles}</p>
          <input type="range" min={technique.minCycles} max={technique.maxCycles} value={cycles} onChange={(e) => setCycles(parseInt(e.target.value))} style={{ width: '100%' }} />
          
          <div style={{ marginTop: '16px', textAlign: 'left' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <input type="checkbox" checked={useCustomTimes} onChange={(e) => setUseCustomTimes(e.target.checked)} />
              <span>Customize breathing times</span>
            </label>
            {useCustomTimes && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '0.8rem' }}>Inhale: {customInhale}s</label><input type="range" min={2} max={8} step={1} value={customInhale} onChange={(e) => setCustomInhale(parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                <div><label style={{ fontSize: '0.8rem' }}>Hold: {customHold1}s</label><input type="range" min={2} max={8} step={1} value={customHold1} onChange={(e) => setCustomHold1(parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                <div><label style={{ fontSize: '0.8rem' }}>Exhale: {customExhale}s</label><input type="range" min={2} max={8} step={1} value={customExhale} onChange={(e) => setCustomExhale(parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                <div><label style={{ fontSize: '0.8rem' }}>Hold: {customHold2}s</label><input type="range" min={2} max={8} step={1} value={customHold2} onChange={(e) => setCustomHold2(parseInt(e.target.value))} style={{ width: '100%' }} /></div>
              </div>
            )}
          </div>
          
          <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ ...styles.button, marginTop: '12px', background: 'transparent', border: `2px solid ${technique.color}`, width: '100%' }}>{soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}</button>
          <button onClick={() => setHapticEnabled(!hapticEnabled)} style={{ ...styles.button, marginTop: '12px', background: 'transparent', border: `2px solid ${technique.color}`, width: '100%' }}>{hapticEnabled ? '📳 Haptic On' : '📴 Haptic Off'}</button>
          
          {paused ? (
            <button onClick={handleResume} style={{ ...styles.button, marginTop: '16px', width: '100%' }}>Resume</button>
          ) : (
            <button onClick={handleStart} style={{ ...styles.button, marginTop: '16px', width: '100%' }}>Begin</button>
          )}
        </div>
      ) : (
        <>
          <div style={{ width: '250px', height: '250px', margin: '20px auto', background: technique.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${phase === 'inhale' || phase === 'hold1' ? 1.5 : 1})`, transition: 'transform 1s ease', boxShadow: `0 0 30px ${technique.color}80` }}>
            <div>
              <h2>{phase === 'inhale' ? '🌬️ Inhale' : phase === 'hold1' ? '⏸️ Hold' : phase === 'exhale' ? '💨 Exhale' : '⏸️ Hold'}</h2>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{count}s</p>
            </div>
          </div>
          <p>Cycle {currentCycle} of {cycles}</p>
          <div className="progress-bar" style={{ width: '200px', margin: '16px auto' }}><div className="progress-fill" style={{ width: `${(currentCycle / cycles) * 100}%` }} /></div>
          <button onClick={handlePause} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '40px', cursor: 'pointer', marginTop: '16px' }}>Pause</button>
        </>
      )}
    </div>
  );
};

  // ==================== GROUNDING TECHNIQUE ====================
  const GroundingTechnique = ({ technique, onComplete, onBack }) => {
    const [step, setStep] = useState(0);
    const [items, setItems] = useState([]);
    const [input, setInput] = useState('');
    const [completed, setCompleted] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const steps = ['5 things you see:', '4 things you feel:', '3 things you hear:', '2 things you smell:', '1 thing you taste:'];
    const counts = [5,4,3,2,1];
    const addItem = () => { if (input.trim()) { setItems([...items, ...input.split(',').map(i => i.trim())]); setInput(''); } };
    const next = () => { if (items.length < counts[step]) return; setItems([]); if (step < steps.length - 1) setStep(step + 1); else setCompleted(true); };
    if (completed) {
      return (
        <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
          <h2 className="text-gradient">Grounding Complete!</h2>
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(139,92,246,0.2)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer' }}>{n}</button>)}</div>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} />
            <button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Complete</button>
          </div>
        </div>
      );
    }
    return (
      <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
        <h1 className="text-gradient">{technique.name}</h1>
        <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}>
          <h3>{steps[step]} ({items.length}/{counts[step]})</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>{items.map((i, idx) => <span key={idx} style={{ background: `${technique.color}20`, padding: '4px 8px', borderRadius: '20px' }}>{i}</span>)}</div>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter items separated by commas" style={styles.input} />
          <button onClick={addItem} style={{ ...styles.button, marginRight: '10px' }}>Add</button>
          <button onClick={next} disabled={items.length < counts[step]} style={styles.button}>Next</button>
        </div>
      </div>
    );
  };

  // ==================== POMODORO TECHNIQUE ====================
  const PomodoroTechnique = ({ technique, onComplete, onBack }) => {
    const [task, setTask] = useState('');
    const [cycle, setCycle] = useState(1);
    const [phase, setPhase] = useState('work');
    const [time, setTime] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    useEffect(() => {
      let timer;
      if (isActive && !completed) {
        timer = setInterval(() => {
          setTime(prev => {
            if (prev <= 1) {
              if (phase === 'work') { setPhase('break'); return 5 * 60; }
              else if (cycle >= 4) { setPhase('longBreak'); return 15 * 60; }
              else { setCycle(c => c + 1); setPhase('work'); return 25 * 60; }
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [isActive, phase, cycle, completed]);
    const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
    const handleStart = () => { if (!task) { alert('Describe your task first'); return; } setIsActive(true); };
    if (completed) {
      return (
        <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
          <h2 className="text-gradient">Great Work!</h2>
          <p>You completed 4 cycles on: {task}</p>
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(139,92,246,0.2)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer' }}>{n}</button>)}</div>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How productive were you?" style={styles.input} />
            <button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Complete</button>
          </div>
        </div>
      );
    }
    return (
      <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
        <h1 className="text-gradient">{technique.name}</h1>
        {!isActive ? (
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}>
            <h3>What are you working on?</h3>
            <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Enter your task" style={styles.input} />
            <button onClick={handleStart} style={styles.button}>Start Timer</button>
          </div>
        ) : (
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}>
            <div style={{ fontSize: '4rem', textAlign: 'center' }}>{formatTime(time)}</div>
            <p style={{ textAlign: 'center' }}>{phase === 'work' ? 'Focus Time' : phase === 'break' ? 'Short Break' : 'Long Break'} • Cycle {cycle} of 4</p>
            <button onClick={() => setIsActive(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '40px', margin: '20px auto', display: 'block' }}>Pause</button>
          </div>
        )}
      </div>
    );
  };

  // ==================== COGNITIVE CHATBOT ====================
  const CognitiveChatbot = ({ onComplete, onBack }) => {
    const technique = techniquesData['cognitive-restructuring'];
    const [step, setStep] = useState(0);
    const [messages, setMessages] = useState([{ role: 'assistant', content: "What's on your mind? What thought is bothering you?" }]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [thought, setThought] = useState('');
    const [evidenceFor, setEvidenceFor] = useState([]);
    const [evidenceAgainst, setEvidenceAgainst] = useState([]);
    const [alternatives, setAlternatives] = useState([]);
    const [balancedThought, setBalancedThought] = useState('');
    const [completed, setCompleted] = useState(false);
    const questions = ["What's on your mind?", "What evidence supports this?", "What evidence challenges it?", "What would you tell a friend?", "What's a more balanced way to think?"];
    const handleSend = () => {
      if (!input.trim() || isProcessing) return;
      const userMsg = input.trim();
      setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
      setInput('');
      setIsProcessing(true);
      if (step === 0) setThought(userMsg);
      else if (step === 1) setEvidenceFor([...evidenceFor, userMsg]);
      else if (step === 2) setEvidenceAgainst([...evidenceAgainst, userMsg]);
      else if (step === 3) setAlternatives([...alternatives, userMsg]);
      else if (step === 4) { setBalancedThought(userMsg); setCompleted(true); setIsProcessing(false); return; }
      setTimeout(() => { setMessages(prev => [...prev, { role: 'assistant', content: questions[step + 1] || "Let's wrap this up." }]); setStep(step + 1); setIsProcessing(false); }, 500);
    };
    if (completed) {
      return (
        <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
          <h2 className="text-gradient">Your Session Summary</h2>
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
            <p><strong>Thought:</strong> {thought}</p>
            <p><strong>Evidence For:</strong> {evidenceFor.join(', ')}</p>
            <p><strong>Evidence Against:</strong> {evidenceAgainst.join(', ')}</p>
            <p><strong>Alternatives:</strong> {alternatives.join(', ')}</p>
            <p><strong>Balanced Thought:</strong> {balancedThought}</p>
          </div>
          <button onClick={() => onComplete('cognitive', 5, JSON.stringify({ thought, evidenceFor, evidenceAgainst, alternatives, balancedThought }))} style={styles.button}>Save</button>
        </div>
      );
    }
    return (
      <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
        <h1 className="text-gradient">{technique.name}</h1>
        <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}>
          {messages.map((msg, i) => <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '10px 0' }}><span style={{ background: msg.role === 'user' ? '#06b6d4' : technique.color, padding: '8px 16px', borderRadius: '20px', display: 'inline-block' }}>{msg.content}</span></div>)}
          {isProcessing && <div>...</div>}
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your response..." style={styles.input} />
          <button onClick={handleSend} style={styles.button}>Send</button>
        </div>
      </div>
    );
  };

  // ==================== PROGRESSIVE MUSCLE RELAXATION ====================
  const ProgressiveMuscleRelaxation = ({ technique, onComplete, onBack }) => {
    const [step, setStep] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [timer, setTimer] = useState(5);
    const [completed, setCompleted] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const muscles = ['Feet', 'Legs', 'Stomach', 'Hands', 'Arms', 'Shoulders', 'Neck', 'Face'];
    useEffect(() => {
      let interval;
      if (isActive && timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
      else if (isActive && timer === 0) { if (step < muscles.length - 1) { setStep(s => s + 1); setTimer(5); } else { setIsActive(false); setCompleted(true); } }
      return () => clearInterval(interval);
    }, [isActive, timer, step]);
    const startSession = () => { setIsActive(true); setTimer(5); setStep(0); };
    if (completed) {
      return (
        <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
          <h2 className="text-gradient">Session Complete!</h2>
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(139,92,246,0.2)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer' }}>{n}</button>)}</div>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} />
            <button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button>
          </div>
        </div>
      );
    }
    if (!isActive) return <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button><h1 className="text-gradient">{technique.name}</h1><div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}><button onClick={startSession} style={styles.button}>Start Session</button></div></div>;
    return <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button><h1 className="text-gradient">{technique.name}</h1><div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}><h3>{muscles[step]}</h3><p>{timer === 5 ? 'Tense...' : 'Release...'}</p><div style={{ fontSize: '3rem', textAlign: 'center' }}>{timer}s</div></div></div>;
  };

  // ==================== RAIN METHOD ====================
  const RainMethod = ({ technique, onComplete, onBack }) => {
    const [step, setStep] = useState(0);
    const [responses, setResponses] = useState(['', '', '', '']);
    const [completed, setCompleted] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const steps = ['R - Recognize', 'A - Allow', 'I - Investigate', 'N - Nurture'];
    const prompts = ['What is happening?', 'Can you let it be?', 'What does it feel like?', 'What would you tell a friend?'];
    const handleNext = () => { if (step < steps.length - 1) setStep(step + 1); else setCompleted(true); };
    if (completed) {
      return (
        <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
          <h2 className="text-gradient">RAIN Method Complete!</h2>
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
            {steps.map((s, i) => <div key={i}><strong>{s}:</strong> {responses[i]}</div>)}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(139,92,246,0.2)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer' }}>{n}</button>)}</div>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Share your experience..." style={styles.input} />
            <button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button>
          </div>
        </div>
      );
    }
    return (
      <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
        <h1 className="text-gradient">{technique.name}</h1>
        <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}>
          <h3>{steps[step]}</h3>
          <p>{prompts[step]}</p>
          <textarea value={responses[step]} onChange={(e) => { const newRes = [...responses]; newRes[step] = e.target.value; setResponses(newRes); }} placeholder="Write your response..." style={styles.input} rows="3" />
          <button onClick={handleNext} disabled={!responses[step].trim()} style={styles.button}>{step === steps.length - 1 ? 'Complete' : 'Next'}</button>
        </div>
      </div>
    );
  };

  // ==================== BODY SCAN ====================
  const BodyScan = ({ technique, onComplete, onBack }) => {
    const [step, setStep] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [timer, setTimer] = useState(15);
    const [completed, setCompleted] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const parts = ['Feet', 'Legs', 'Hips', 'Stomach', 'Chest', 'Back', 'Hands', 'Arms', 'Shoulders', 'Neck', 'Face', 'Whole Body'];
    useEffect(() => {
      let interval;
      if (isActive && timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
      else if (isActive && timer === 0) { if (step < parts.length - 1) { setStep(s => s + 1); setTimer(15); } else { setIsActive(false); setCompleted(true); } }
      return () => clearInterval(interval);
    }, [isActive, timer, step]);
    const startSession = () => { setIsActive(true); setTimer(15); setStep(0); };
    if (completed) {
      return (
        <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
          <h2 className="text-gradient">Body Scan Complete!</h2>
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(139,92,246,0.2)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer' }}>{n}</button>)}</div>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} />
            <button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button>
          </div>
        </div>
      );
    }
    if (!isActive) return <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button><h1 className="text-gradient">{technique.name}</h1><div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}><button onClick={startSession} style={styles.button}>Start Body Scan</button></div></div>;
    return <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button><h1 className="text-gradient">{technique.name}</h1><div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}><h3>{parts[step]}</h3><p>Bring attention to your {parts[step].toLowerCase()}...</p><div style={{ fontSize: '3rem', textAlign: 'center' }}>{timer}s</div></div></div>;
  };

  // ==================== NOTING PRACTICE ====================
  const NotingPractice = ({ technique, onComplete, onBack }) => {
    const [isActive, setIsActive] = useState(false);
    const [timer, setTimer] = useState(180);
    const [notes, setNotes] = useState([]);
    const [completed, setCompleted] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    useEffect(() => {
      let interval;
      if (isActive && timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
      else if (isActive && timer === 0) { setIsActive(false); setCompleted(true); }
      return () => clearInterval(interval);
    }, [isActive, timer]);
    const startSession = () => { setIsActive(true); setTimer(180); setNotes([]); };
    const addNote = (type) => { setNotes([...notes, { type, time: 180 - timer }]); };
    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    if (completed) {
      return (
        <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
          <h2 className="text-gradient">Noting Practice Complete!</h2>
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
            <h3>Your Notes:</h3>
            {notes.map((n, i) => <div key={i}>• {n.type} at {n.time}s</div>)}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(139,92,246,0.2)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer' }}>{n}</button>)}</div>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How did this help?" style={styles.input} />
            <button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button>
          </div>
        </div>
      );
    }
    if (!isActive) return <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button><h1 className="text-gradient">{technique.name}</h1><div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}><button onClick={startSession} style={styles.button}>Start 3-Minute Session</button></div></div>;
    return <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button><h1 className="text-gradient">{technique.name}</h1><div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}><div style={{ fontSize: '2rem', textAlign: 'center' }}>{formatTime(timer)}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '20px 0' }}><button onClick={() => addNote('thinking')} style={styles.button}>💭 Thinking</button><button onClick={() => addNote('feeling')} style={styles.button}>❤️ Feeling</button><button onClick={() => addNote('planning')} style={styles.button}>📋 Planning</button><button onClick={() => addNote('remembering')} style={styles.button}>📖 Remembering</button></div>{notes.slice(-5).map((n, i) => <div key={i}>• {n.type}</div>)}</div></div>;
  };

  // ==================== SELF-COMPASSION BREAK ====================
  const SelfCompassionBreak = ({ technique, onComplete, onBack }) => {
    const [step, setStep] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const phrases = ["This is hard right now. Place your hand on your heart.", "Many people feel this way. You're not alone.", "May I be kind to myself in this moment."];
    const next = () => { if (step < phrases.length - 1) setStep(step + 1); else setCompleted(true); };
    if (completed) {
      return (
        <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
          <h2 className="text-gradient">Self-Compassion Complete!</h2>
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(139,92,246,0.2)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer' }}>{n}</button>)}</div>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} />
            <button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button>
          </div>
        </div>
      );
    }
    return <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button><h1 className="text-gradient">{technique.name}</h1><div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}><p>{phrases[step]}</p><button onClick={next} style={styles.button}>{step === phrases.length - 1 ? 'Complete' : 'Next'}</button></div></div>;
  };

  // ==================== STOP TECHNIQUE ====================
  const StopTechnique = ({ technique, onComplete, onBack }) => {
    const [step, setStep] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const steps = ['S - Stop', 'T - Take a breath', 'O - Observe', 'P - Proceed'];
    const instructions = ['Stop what you are doing.', 'Take a deep breath in, and out.', 'Observe what is happening inside and around you.', 'Proceed with awareness.'];
    const next = () => { if (step < steps.length - 1) setStep(step + 1); else setCompleted(true); };
    if (completed) {
      return (
        <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
          <h2 className="text-gradient">STOP Complete!</h2>
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(139,92,246,0.2)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer' }}>{n}</button>)}</div>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} />
            <button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button>
          </div>
        </div>
      );
    }
    return <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button><h1 className="text-gradient">{technique.name}</h1><div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}><h3>{steps[step]}</h3><p>{instructions[step]}</p><button onClick={next} style={styles.button}>{step === steps.length - 1 ? 'Complete' : 'Next'}</button></div></div>;
  };

  // ==================== GRATITUDE LOG ====================
  const GratitudeLog = ({ technique, onComplete, onBack }) => {
    const [entries, setEntries] = useState(['', '', '']);
    const [saved, setSaved] = useState(false);
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const saveEntries = () => {
      const existing = localStorage.getItem('gratitude_entries');
      const all = existing ? JSON.parse(existing) : [];
      all.push({ date: new Date().toISOString(), entries });
      localStorage.setItem('gratitude_entries', JSON.stringify(all));
      setSaved(true);
    };
    if (saved) {
      return (
        <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button>
          <h2 className="text-gradient">Gratitude Log Saved!</h2>
          <div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 30px ${technique.color}20` }}>
            <h3>Your entries:</h3>
            {entries.map((e, i) => <div key={i}>• {e}</div>)}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(139,92,246,0.2)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer' }}>{n}</button>)}</div>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} />
            <button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button>
          </div>
        </div>
      );
    }
    return <div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '2px solid #94a3b8' }}>← Back</button><h1 className="text-gradient">{technique.name}</h1><div style={{ ...styles.card, border: `1px solid ${technique.color}40`, boxShadow: `0 0 20px ${technique.color}10` }}><p>Write 3 things you're grateful for today.</p>{entries.map((e, i) => <input key={i} value={e} onChange={(e2) => { const newEntries = [...entries]; newEntries[i] = e2.target.value; setEntries(newEntries); }} placeholder={`Thing ${i+1}`} style={styles.input} />)}<button onClick={saveEntries} disabled={!entries[0] || !entries[1] || !entries[2]} style={styles.button}>Save</button></div></div>;
  };

  // ==================== PRIORITY MATRIX ====================
  const PriorityMatrix = () => {
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    useEffect(() => {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    const isMobile = windowWidth <= 768;
    const [tasks, setTasks] = useState(() => {
      const saved = localStorage.getItem('lumacare_matrix_tasks');
      return saved ? JSON.parse(saved) : [{ id: 1, text: 'Finish client presentation', quadrant: 'urgent-important', completed: false }, { id: 2, text: 'Plan next week', quadrant: 'important-not-urgent', completed: false }];
    });
    const [newTask, setNewTask] = useState('');
    const [selectedQuadrant, setSelectedQuadrant] = useState('urgent-important');
    useEffect(() => { localStorage.setItem('lumacare_matrix_tasks', JSON.stringify(tasks)); }, [tasks]);
    const addTask = () => { if (newTask.trim()) { setTasks([...tasks, { id: Date.now(), text: newTask, quadrant: selectedQuadrant, completed: false }]); setNewTask(''); } };
    const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));
    const quadrants = [{ id: 'urgent-important', title: 'Urgent & Important', color: '#ef4444' }, { id: 'important-not-urgent', title: 'Important, Not Urgent', color: '#10b981' }, { id: 'urgent-not-important', title: 'Urgent, Not Important', color: '#f59e0b' }, { id: 'neither', title: 'Neither', color: '#6b7280' }];
    return (
      <div><h1 className="text-gradient">Priority Matrix</h1>
        <div style={styles.card}><input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="New task..." style={styles.input} /><select value={selectedQuadrant} onChange={(e) => setSelectedQuadrant(e.target.value)} style={styles.select}>{quadrants.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}</select><button onClick={addTask} style={styles.button}>Add Task</button></div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>{quadrants.map(q => (<div key={q.id} style={{ ...styles.card, borderColor: q.color }}><h3 style={{ color: q.color }}>{q.title}</h3>{tasks.filter(t => t.quadrant === q.id).map(task => (<div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} /><span style={{ textDecoration: task.completed ? 'line-through' : 'none', flex: 1 }}>{task.text}</span><button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button></div>))}</div>))}</div>
      </div>
    );
  };

  // ==================== TECHNIQUES ====================
  const Techniques = ({ navigateTo, startTechnique }) => {
    const techniques = Object.values(techniquesData);
    // Group techniques by category
    const grouped = techniques.reduce((acc, tech) => {
      const category = tech.category || '✨ Wellness';
      if (!acc[category]) acc[category] = [];
      acc[category].push(tech);
      return acc;
    }, {});
    return (
      <div><h1 className="text-gradient">Therapy Techniques</h1>
        {Object.entries(grouped).map(([category, techs]) => (
          <div key={category} style={{ marginBottom: '32px' }}>
            <h2 style={{ color: '#c084fc', marginBottom: '16px', fontSize: '1.3rem' }}>{category}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {techs.map(tech => (
                <div key={tech.id} style={{ ...styles.card, cursor: 'pointer', border: `1px solid ${tech.color}40`, transition: 'all 0.3s ease' }} onClick={() => startTechnique(tech.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '2rem' }}>{tech.icon}</div>
                    <div><h3 style={{ margin: 0 }}>{tech.name}</h3><span style={{ fontSize: '0.8rem', color: tech.color }}>{tech.type}</span></div>
                  </div>
                  <p style={{ color: '#94a3b8', margin: '12px 0' }}>{tech.description.substring(0, 80)}...</p>
                  <button style={styles.button}>Start →</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ==================== BREATHE TAB ====================
const BreatheTab = ({ technique, onComplete, onBack }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const handleStart = () => { setShowInstructions(false); setSessionStarted(true); };

  const ScrollableContainer = ({ children }) => (
    <div style={{ height: 'calc(100vh - 140px)', overflowY: 'auto', padding: '20px', scrollBehavior: 'smooth' }}>
      {children}
    </div>
  );

  if (!technique) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div style={{ fontSize: '4rem' }}>🌬️</div>
        <h2 className="text-gradient">Select a technique first</h2>
        <button onClick={onBack} style={styles.button}>Browse Techniques</button>
      </div>
    );
  }

  if (showInstructions && !sessionStarted) {
    return <TechniqueInstructions technique={technique} onStart={handleStart} onBack={onBack} />;
  }

  switch (technique.id) {
    case 'box-breathing':
    case '478-breathing':
      return <ScrollableContainer><BreathingTechnique technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'grounding':
      return <ScrollableContainer><GroundingTechnique technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'pomodoro':
      return <ScrollableContainer><PomodoroTechnique technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'cognitive-restructuring':
      return <ScrollableContainer><CognitiveChatbot onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'progressive-muscle-relaxation':
      return <ScrollableContainer><ProgressiveMuscleRelaxation technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'rain-method':
      return <ScrollableContainer><RainMethod technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'body-scan':
      return <ScrollableContainer><BodyScan technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'noting-practice':
      return <ScrollableContainer><NotingPractice technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'self-compassion-break':
      return <ScrollableContainer><SelfCompassionBreak technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'stop-technique':
      return <ScrollableContainer><StopTechnique technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'gratitude-log':
      return <ScrollableContainer><GratitudeLog technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    default:
      return <ScrollableContainer><div><h2>Coming soon</h2><button onClick={onBack} style={styles.button}>Back</button></div></ScrollableContainer>;
  }
};

  // ==================== SETTINGS ====================
const Settings = ({ logout, user, darkMode, setDarkMode }) => {
  const [name, setName] = useState(user?.name || '');
  
  const handleSaveName = () => {
    const updated = { ...user, name };
    localStorage.setItem('lumacare_user', JSON.stringify(updated));
    window.location.reload();
  };
  
  const exportData = () => {
    const data = localStorage.getItem('lumacare_user');
    if (!data) return alert('No data to export');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumacare_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          localStorage.setItem('lumacare_user', JSON.stringify(data));
          alert('Data imported! Page will reload.');
          window.location.reload();
        } catch (err) { alert('Invalid file'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };
  
  return (
    <div>
      <h1 className="text-gradient">Settings</h1>
      <div style={styles.card}>
        <h3 style={{ color: '#c084fc' }}>Profile</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
        <button onClick={handleSaveName} style={styles.button}>Save Name</button>
        
        <h3 style={{ color: '#c084fc', marginTop: '24px' }}>Appearance</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Dark Mode</span>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{
              padding: '8px 20px',
              background: darkMode ? '#06b6d4' : '#8b5cf6',
              border: 'none',
              borderRadius: '40px',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {darkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
        
        <h3 style={{ color: '#c084fc', marginTop: '24px' }}>Data</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={exportData} style={{ ...styles.button, background: '#06b6d4' }}>📥 Export Data</button>
          <button onClick={importData} style={{ ...styles.button, background: '#8b5cf6' }}>📤 Import Data</button>
        </div>
        
        <h3 style={{ color: '#c084fc', marginTop: '24px' }}>Account</h3>
        <button onClick={logout} style={{ ...styles.button, background: '#ef4444', width: '100%' }}>Sign Out</button>
      </div>
    </div>
  );
};

  // ==================== ROUTER ====================
  const routerFutureConfig = { v7_startTransition: true, v7_relativeSplatPath: true };
  if (!user) return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}><LoginPage onLogin={login} /></GoogleOAuthProvider>;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/matrix', label: 'Matrix', icon: '📌' },
    { path: '/techniques', label: 'Techniques', icon: '🧘' },
    { path: '/breathe', label: 'Breathe', icon: '🌬️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router future={routerFutureConfig}>
        <div style={styles.container}>
          <div className="flowing-bg" />
          <div className="particle-glow" />
          {[...Array(20)].map((_, i) => (
            <div key={i} className="floating-particle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${Math.random() * 6 + 2}px`, height: `${Math.random() * 6 + 2}px`, animationDelay: `${Math.random() * 10}s`, animationDuration: `${Math.random() * 10 + 8}s` }} />
          ))}
          {!isMobile && (
            <nav style={{ ...styles.nav, ...(scrolled ? { background: 'rgba(15, 23, 42, 0.8)' } : {}) }}>
              <div style={styles.navContent}>
                <div style={styles.logo} onClick={() => navigateTo('/')}>
                  <img src="https://i.ibb.co/DHdnTVGs/Glowing-lotus-with-diamond-accents.png" alt="LumaCare Logo" style={{ height: '32px', width: 'auto', borderRadius: '8px' }} />
                  <span style={styles.logoText}>LumaCare</span>
                </div>
                <div style={styles.navLinks}>{navItems.map(item => <NavLink key={item.path} to={item.path} style={({ isActive }) => ({ ...styles.navItem, ...(isActive && styles.navItemActive) })}><span>{item.icon}</span><span>{item.label}</span></NavLink>)}</div>
                <div style={{ display: 'flex', gap: '12px' }}><button onClick={() => setShowPremium(true)} style={styles.premiumButton}>⭐ Premium</button><div onClick={() => navigateTo('/settings')} style={{ cursor: 'pointer' }}>{user.picture ? <img src={user.picture} alt="profile" style={styles.profileImage} /> : <div style={styles.profilePlaceholder}>{user.name?.charAt(0).toUpperCase()}</div>}</div></div>
              </div>
            </nav>
          )}
          {isMobile && (
            <header style={{ position: 'sticky', top: 0, zIndex: 100, padding: '12px 16px', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigateTo('/')}>
                <img src="https://i.ibb.co/DHdnTVGs/Glowing-lotus-with-diamond-accents.png" alt="LumaCare Logo" style={{ height: '28px', width: 'auto', borderRadius: '6px' }} />
                <span>LumaCare</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}><button onClick={() => setShowPremium(true)} style={styles.premiumButton}>⭐</button><div onClick={() => navigateTo('/settings')}>{user.picture ? <img src={user.picture} alt="profile" style={{ width: '36px', height: '36px', borderRadius: '50%' }} /> : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{user.name?.charAt(0).toUpperCase()}</div>}</div></div>
            </header>
          )}
          {showPremium && <PremiumModal onClose={() => setShowPremium(false)} onUpgrade={handleUpgrade} />}
          <main style={styles.main}>
            <Routes>
              <Route path="/" element={<Dashboard navigateTo={navigateTo} userData={userData} startTechnique={startTechnique} />} />
              <Route path="/matrix" element={<PriorityMatrix />} />
              <Route path="/techniques" element={<Techniques navigateTo={navigateTo} startTechnique={startTechnique} />} />
              <Route path="/breathe" element={<BreatheTab technique={currentTechnique} onComplete={handleTechniqueComplete} onBack={handleBack} />} />
              <Route path="/settings" element={<Settings logout={logout} user={user} darkMode={darkMode} setDarkMode={setDarkMode} />} />
            </Routes>
          </main>
          {isMobile && (
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(139, 92, 246, 0.2)', padding: '8px 4px', zIndex: 100 }}>
              {navItems.map(item => <NavLink key={item.path} to={item.path} style={({ isActive }) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', flex: 1, color: isActive ? '#c084fc' : '#94a3b8', textDecoration: 'none', fontSize: '0.7rem' })}><span style={{ fontSize: '1.2rem' }}>{item.icon}</span><span>{item.label}</span></NavLink>)}
            </nav>
          )}
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default function AppWithProvider() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

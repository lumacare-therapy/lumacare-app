/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== GOOGLE CLIENT ID ====================
const GOOGLE_CLIENT_ID = "253002272888-cg3k451mqesnerv21056utk8u1lk22f6.apps.googleusercontent.com";

// ==================== OPENROUTER API KEY - FROM ENV ====================
const OPENROUTER_KEY = process.env.REACT_APP_OPENROUTER_KEY;

// ==================== STYLES ====================
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0b2e 50%, #2d1b4a 100%)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#f7fafc',
    position: 'relative',
  },
  nav: {
    position: 'sticky',
    top: '16px',
    zIndex: 100,
    margin: '16px 24px',
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '100px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
  },
  navContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #fff, #9f7aea)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  navItem: {
    padding: '8px 16px',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#cbd5e0',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  navItemActive: {
    color: '#f7fafc',
    background: 'rgba(159, 122, 234, 0.1)',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #fff, #9f7aea)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#cbd5e0',
    marginBottom: '24px',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  premiumButton: {
    padding: '8px 20px',
    borderRadius: '30px',
    border: 'none',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginRight: '12px',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
  },
  input: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    width: '100%',
    marginBottom: '16px',
  },
  select: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    width: '100%',
    marginBottom: '16px',
    cursor: 'pointer',
  },
  profileImage: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #9f7aea',
  },
  profilePlaceholder: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.2)',
  },
  badge: {
    backgroundColor: 'rgba(46, 125, 50, 0.15)',
    color: '#4fd1c5',
    padding: '6px 16px',
    borderRadius: '30px',
    fontSize: '0.9rem',
    fontWeight: 600,
    display: 'inline-block',
    marginBottom: '20px',
    border: '1px solid #4fd1c5',
    backdropFilter: 'blur(5px)',
  },
};

// ==================== AUTH CONTEXT ====================
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('lumacare_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
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

// ==================== LOGIN PAGE WITH SEO CONTENT ====================
const LoginPage = ({ onLogin }) => {
  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const user = {
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      isPremium: false,
      sessionsRemaining: 1,
      lastSessionTime: null,
      premiumExpiry: null,
      stats: {
        aiSessions: 0,
        breathing: 0,
        sosUsed: 0,
        journal: 0,
        moodScores: [],
        weeklyData: [
          { day: 'Mon', mood: 0, sessions: 0 },
          { day: 'Tue', mood: 0, sessions: 0 },
          { day: 'Wed', mood: 0, sessions: 0 },
          { day: 'Thu', mood: 0, sessions: 0 },
          { day: 'Fri', mood: 0, sessions: 0 },
          { day: 'Sat', mood: 0, sessions: 0 },
          { day: 'Sun', mood: 0, sessions: 0 }
        ]
      }
    };
    onLogin(user);
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In Failed');
  };

  const handleGuestLogin = () => {
    const guestUser = {
      name: 'Guest User',
      email: 'guest@lumacare.app',
      picture: null,
      isPremium: false,
      sessionsRemaining: 3,
      lastSessionTime: null,
      premiumExpiry: null,
      stats: {
        aiSessions: 0,
        breathing: 0,
        sosUsed: 0,
        journal: 0,
        moodScores: [],
        weeklyData: [
          { day: 'Mon', mood: 0, sessions: 0 },
          { day: 'Tue', mood: 0, sessions: 0 },
          { day: 'Wed', mood: 0, sessions: 0 },
          { day: 'Thu', mood: 0, sessions: 0 },
          { day: 'Fri', mood: 0, sessions: 0 },
          { day: 'Sat', mood: 0, sessions: 0 },
          { day: 'Sun', mood: 0, sessions: 0 }
        ]
      }
    };
    onLogin(guestUser);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0b2e 50%, #2d1b4a 100%)',
        position: 'relative',
      }}
    >
      {/* Background Effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.6) 1px, transparent 1px)',
        backgroundSize: '200px 200px',
        opacity: 0.3,
        animation: 'twinkle 4s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 30% 40%, rgba(138,43,226,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(75,0,130,0.2) 0%, transparent 50%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <motion.div 
        style={{
          ...styles.card,
          maxWidth: '700px',
          width: '90%',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '48px 32px',
        }}
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        {/* Brain Icon */}
        <div style={{ 
          fontSize: '5rem', 
          marginBottom: '8px',
          filter: 'drop-shadow(0 0 20px #9f7aea)',
          animation: 'float 3s ease-in-out infinite'
        }}>
          🧠
        </div>
        
        {/* ✅ NEW: No Login Badge */}
        <div style={{
          backgroundColor: 'rgba(46, 125, 50, 0.15)',
          color: '#4fd1c5',
          padding: '6px 16px',
          borderRadius: '30px',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'inline-block',
          marginBottom: '20px',
          border: '1px solid #4fd1c5',
          backdropFilter: 'blur(5px)'
        }}>
          ⚡ No login required. Start for free.
        </div>
        
        {/* ✅ UPDATED: H1 Tag */}
        <h1 style={{ 
          fontSize: '2.5rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #fff, #9f7aea, #4fd1c5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '24px',
          lineHeight: 1.3
        }}>
          End Task Overwhelm for<br />Freelancers & Remote Workers
        </h1>
        
        <p style={{ color: '#cbd5e0', marginBottom: '32px', fontSize: '1.1rem' }}>
          Your daily system for mental clarity and focus
        </p>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: '#9f7aea' }}>📊</div>
              <div style={{ color: '#cbd5e0', fontSize: '0.9rem' }}>Dashboard</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: '#4fd1c5' }}>📌</div>
              <div style={{ color: '#cbd5e0', fontSize: '0.9rem' }}>Priority Matrix</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', color: '#f687b3' }}>🧘</div>
              <div style={{ color: '#cbd5e0', fontSize: '0.9rem' }}>Techniques</div>
            </div>
          </div>

          <div style={{ background: 'rgba(159,122,234,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <p style={{ color: '#cbd5e0', marginBottom: '8px' }}>✨ Free Plan Includes:</p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ color: 'white', marginBottom: '4px' }}>✓ 1 session every 12 hours</li>
              <li style={{ color: 'white', marginBottom: '4px' }}>✓ All techniques</li>
              <li style={{ color: 'white' }}>✓ Progress tracking</li>
            </ul>
          </div>
        </div>

        {/* ✅ NEW: SEO Content Section */}
        <div style={{ 
          textAlign: 'left', 
          marginTop: '40px', 
          marginBottom: '40px',
          padding: '24px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '16px',
          border: '1px solid rgba(159,122,234,0.3)'
        }}>
          <h2 style={{ 
            fontSize: '1.8rem', 
            color: '#9f7aea', 
            marginBottom: '16px',
            fontWeight: 600
          }}>
            For Freelancers Drowning in Task Overwhelm
          </h2>
          <p style={{ color: '#cbd5e0', marginBottom: '16px', lineHeight: 1.6 }}>
            LumaCare is the daily operating system for freelancers and remote workers who are tired of chaos, missed deadlines, and burnout.
          </p>
          <p style={{ color: '#cbd5e0', marginBottom: '24px', lineHeight: 1.6 }}>
            Most productivity apps add more noise. LumaCare subtracts it.
          </p>

          <h2 style={{ 
            fontSize: '1.8rem', 
            color: '#9f7aea', 
            marginBottom: '16px',
            fontWeight: 600
          }}>
            How It Works
          </h2>
          <ul style={{ 
            color: '#cbd5e0', 
            marginBottom: '24px', 
            paddingLeft: '20px',
            lineHeight: 1.8
          }}>
            <li><strong style={{ color: '#4fd1c5' }}>Priority Matrix:</strong> Drag tasks into Urgent vs. Important. Your brain stops spinning.</li>
            <li><strong style={{ color: '#4fd1c5' }}>10-Second Logging:</strong> Track energy and stress without friction.</li>
            <li><strong style={{ color: '#4fd1c5' }}>Burnout Timeline:</strong> Watch your crash patterns emerge so you can rest before you break.</li>
          </ul>

          <h2 style={{ 
            fontSize: '1.8rem', 
            color: '#9f7aea', 
            marginBottom: '16px',
            fontWeight: 600
          }}>
            Why Freelancers Use LumaCare
          </h2>
          <p style={{ color: '#cbd5e0', marginBottom: '16px', lineHeight: 1.6 }}>
            Client work is unpredictable. LumaCare gives you a single place to sort the chaos, without adding more admin. <strong style={{ color: '#4fd1c5' }}>No login required.</strong> Start in 5 seconds. Upgrade only if you need advanced analytics.
          </p>
        </div>

        {/* Google Sign-In */}
        <div style={{ marginBottom: '16px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_black"
            shape="pill"
            text="continue_with"
            size="large"
            width="100%"
          />
        </div>

        {/* Guest Login Option */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGuestLogin}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            border: '2px solid #9f7aea',
            borderRadius: '40px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>👤</span>
          <span>Continue as Guest (3 free sessions)</span>
        </motion.button>

        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </motion.div>
  );
};

// ==================== PREMIUM PLANS MODAL ====================
const PremiumModal = ({ onClose, onUpgrade }) => {
  const handlePayFast = (plan) => {
    if (plan === 'monthly') {
      window.open('https://payf.st/bk8we', '_blank');
    } else {
      window.open('https://payf.st/1frnc', '_blank');
    }
    
    setTimeout(() => {
      if (window.confirm('Did you complete the payment? Click OK if yes, Cancel to verify later.')) {
        onUpgrade(plan);
        onClose();
      }
    }, 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          ...styles.card,
          maxWidth: '500px',
          width: '90%',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#cbd5e0',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <h2 style={{ color: '#9f7aea', marginBottom: '24px', textAlign: 'center' }}>Upgrade Your Wellness Journey</h2>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(159,122,234,0.1), rgba(79,209,197,0.1))',
            borderRadius: '16px',
            border: '2px solid #9f7aea',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              color: 'white',
            }}>
              BEST VALUE
            </div>
            <h3 style={{ color: '#9f7aea', marginBottom: '8px' }}>Premium Monthly</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px' }}>
              $9.99<span style={{ fontSize: '1rem', color: '#cbd5e0' }}>/month</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
              <li style={{ marginBottom: '8px' }}>✓ Unlimited sessions</li>
              <li style={{ marginBottom: '8px' }}>✓ All techniques</li>
              <li style={{ marginBottom: '8px' }}>✓ Priority support</li>
              <li>✓ Advanced analytics</li>
            </ul>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePayFast('monthly')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
                border: 'none',
                borderRadius: '30px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Get Premium
            </motion.button>
          </div>

          <div style={{
            padding: '24px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <h3 style={{ color: '#4fd1c5', marginBottom: '8px' }}>Single Session</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '16px' }}>
              $2.99<span style={{ fontSize: '1rem', color: '#cbd5e0' }}>/session</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
              <li style={{ marginBottom: '8px' }}>✓ One additional session</li>
              <li style={{ marginBottom: '8px' }}>✓ All techniques</li>
              <li>✓ No expiration</li>
            </ul>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePayFast('session')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: '2px solid #4fd1c5',
                borderRadius: '30px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add Session
            </motion.button>
          </div>
        </div>

        <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center' }}>
          Secure payment powered by PayFast. All prices in USD.
        </p>
      </motion.div>
    </div>
  );
};

// ==================== TECHNIQUE DATA ====================
const techniquesData = {
  'priority-matrix': {
    id: 'priority-matrix',
    name: 'Priority Matrix',
    icon: '📌',
    description: 'Organize tasks by urgency and importance',
    whenToUse: 'When feeling overwhelmed with multiple responsibilities',
    steps: [
      'Start by reviewing example tasks in each quadrant',
      'Click any example to edit it to match your actual tasks',
      'Drag tasks between quadrants if your priorities change',
      'Focus on Quadrant 2 for long-term success',
      'Set realistic time blocks for each category'
    ],
    color: '#fbbf24',
    type: 'matrix',
    location: 'matrix'
  },
  'box-breathing': {
    id: 'box-breathing',
    name: 'Box Breathing',
    icon: '⬛',
    description: '4-4-4-4 breathing pattern for instant calm',
    whenToUse: 'During acute anxiety, panic symptoms, physical tension',
    steps: [
      'Sit comfortably and relax your shoulders',
      'Inhale through your nose for 4 seconds',
      'Hold your breath for 4 seconds',
      'Exhale through your mouth for 4 seconds',
      'Hold empty for 4 seconds',
      'Repeat 5-10 cycles'
    ],
    color: '#9f7aea',
    type: 'breathing',
    location: 'breathe',
    pattern: '4-4-4-4',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    minCycles: 5,
    maxCycles: 10
  },
  '478-breathing': {
    id: '478-breathing',
    name: '4-7-8 Breathing',
    icon: '🌬️',
    description: 'Relaxation breath for anxiety and sleep',
    whenToUse: 'During anxiety, before sleep, or when stressed',
    steps: [
      'Sit comfortably and relax your shoulders',
      'Inhale through your nose for 4 seconds',
      'Hold your breath for 7 seconds',
      'Exhale through your mouth for 8 seconds',
      'Hold empty for 4 seconds',
      'Repeat 5-10 cycles'
    ],
    color: '#4fd1c5',
    type: 'breathing',
    location: 'breathe',
    pattern: '4-7-8',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 4,
    minCycles: 5,
    maxCycles: 10
  },
  'cognitive-restructuring': {
    id: 'cognitive-restructuring',
    name: 'Cognitive Restructuring',
    icon: '🧠',
    description: 'Challenge and reframe negative thoughts',
    whenToUse: 'When experiencing negative self-talk or catastrophic thinking',
    steps: [
      'Identify the automatic negative thought',
      'Examine evidence for and against the thought',
      'Consider alternative perspectives',
      'Develop a balanced, realistic thought',
      'Practice the new thought pattern'
    ],
    color: '#f687b3',
    type: 'cognitive',
    location: 'breathe'
  },
  'pomodoro': {
    id: 'pomodoro',
    name: 'Pomodoro Technique',
    icon: '⏰',
    description: 'Focused work intervals with breaks',
    whenToUse: 'When struggling with focus or procrastination',
    steps: [
      'Choose a specific task to focus on',
      'Set a timer for 25 minutes of focused work',
      'When timer rings, take a 5-minute break',
      'After 4 cycles, take a 15-30 minute break',
      'Repeat as needed'
    ],
    color: '#f97316',
    type: 'pomodoro',
    location: 'breathe'
  },
  'grounding': {
    id: 'grounding',
    name: '5-4-3-2-1 Grounding',
    icon: '🌱',
    description: 'Use your senses to stay present',
    whenToUse: 'During panic attacks, dissociation, or feeling disconnected',
    steps: [
      'Name 5 things you can see',
      'Identify 4 things you can touch',
      'Acknowledge 3 things you can hear',
      'Notice 2 things you can smell',
      'Recognize 1 thing you can taste'
    ],
    color: '#f87171',
    type: 'grounding',
    location: 'breathe'
  }
};

// ==================== USER SESSION TRACKING ====================
const useSessionTracking = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  const canUseSession = () => {
    if (!userData) return false;
    if (userData.isPremium) return true;
    
    if (!userData.lastSessionTime) return true;
    
    const hoursSinceLast = (Date.now() - userData.lastSessionTime) / (1000 * 60 * 60);
    return hoursSinceLast >= 12;
  };

  const trackSession = (techniqueType, rating = null, feedback = '') => {
    if (!userData) return { success: false, message: 'Not logged in' };
    if (!canUseSession() && !userData.isPremium) {
      return { success: false, message: 'Session limit reached. Wait 12 hours or upgrade to premium.' };
    }

    const newStats = { ...userData.stats };
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;

    if (techniqueType === 'breathing') newStats.breathing += 1;
    else if (techniqueType === 'cognitive') newStats.aiSessions += 1;
    else if (techniqueType === 'grounding') newStats.sosUsed += 1;
    else if (techniqueType === 'pomodoro') newStats.aiSessions += 1;

    newStats.weeklyData[dayIndex].sessions += 1;
    
    if (rating) {
      newStats.moodScores.push({ score: rating, timestamp: Date.now(), feedback, technique: techniqueType });
      const todayMoods = newStats.moodScores.filter(m => 
        new Date(m.timestamp).toDateString() === new Date().toDateString()
      );
      const avgMood = todayMoods.reduce((sum, m) => sum + m.score, 0) / todayMoods.length || 0;
      newStats.weeklyData[dayIndex].mood = Math.round(avgMood * 20);
    }

    const updatedUser = {
      ...userData,
      lastSessionTime: Date.now(),
      sessionsRemaining: userData.isPremium ? Infinity : userData.sessionsRemaining - 1,
      stats: newStats
    };

    setUserData(updatedUser);
    localStorage.setItem('lumacare_user', JSON.stringify(updatedUser));

    return { success: true };
  };

  const upgradeUser = (plan) => {
    const updatedUser = {
      ...userData,
      isPremium: plan === 'monthly',
      sessionsRemaining: plan === 'session' ? userData.sessionsRemaining + 1 : Infinity,
      premiumExpiry: plan === 'monthly' ? Date.now() + (30 * 24 * 60 * 60 * 1000) : userData.premiumExpiry
    };
    setUserData(updatedUser);
    localStorage.setItem('lumacare_user', JSON.stringify(updatedUser));
  };

  return { userData, canUseSession, trackSession, upgradeUser };
};

// ==================== DASHBOARD ====================
const Dashboard = ({ navigateTo, userData }) => {
  const [stressLevel, setStressLevel] = useState(42);
  const [clarityScore, setClarityScore] = useState(68);

  useEffect(() => {
    if (userData?.stats) {
      const avgMood = userData.stats.moodScores.length > 0 
        ? userData.stats.moodScores.reduce((sum, m) => sum + m.score, 0) / userData.stats.moodScores.length 
        : 4.2;
      setStressLevel(Math.round(100 - (avgMood * 20)));
      
      const clarityBase = 50 + (userData.stats.moodScores.filter(m => m.score >= 4).length * 2);
      setClarityScore(Math.min(100, Math.round(clarityBase)));
    }
  }, [userData]);

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  if (!userData) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={styles.title}>Good {new Date().getHours() < 12 ? 'morning' : 'evening'}, {userData.name}</h1>
        <div style={{ 
          background: 'rgba(159, 122, 234, 0.1)', 
          padding: '8px 16px', 
          borderRadius: '30px',
          border: '1px solid #9f7aea40',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <span>🕐 {formatTime()}</span>
          {!userData.isPremium && (
            <span style={{color: userData.sessionsRemaining > 0 ? '#4fd1c5' : '#f87171'}}>
              {userData.sessionsRemaining > 0 ? `${userData.sessionsRemaining} session left` : 'No sessions'}
            </span>
          )}
          {userData.isPremium && <span style={{color: '#fbbf24'}}>✨ Premium</span>}
        </div>
      </div>
      <p style={styles.subtitle}>Your mind is clear. Let's keep it that way.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
        <div style={{...styles.card, textAlign: 'center'}}>
          <h3 style={{color: '#cbd5e0', marginBottom: '20px'}}>Stress Level</h3>
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `conic-gradient(#9f7aea 0deg ${stressLevel * 3.6}deg, #2d1b4a ${stressLevel * 3.6}deg 360deg)`,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: '#1a0b2e',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{stressLevel}%</span>
              <span style={{color: '#cbd5e0'}}>
                {stressLevel < 30 ? 'low' : stressLevel < 60 ? 'moderate' : 'high'}
              </span>
            </div>
          </div>
        </div>

        <div style={{...styles.card, textAlign: 'center'}}>
          <h3 style={{color: '#cbd5e0', marginBottom: '20px'}}>Task Clarity</h3>
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: `conic-gradient(#4fd1c5 0deg ${clarityScore * 3.6}deg, #2d1b4a ${clarityScore * 3.6}deg 360deg)`,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: '#1a0b2e',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{clarityScore}%</span>
              <span style={{color: '#cbd5e0'}}>
                {clarityScore < 40 ? 'unclear' : clarityScore < 70 ? 'moderate' : 'clear'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{...styles.card, marginTop: '24px'}}>
        <h3 style={{fontSize: '1.3rem', marginBottom: '20px', color: '#9f7aea'}}>Weekly Progress</h3>
        
        <div style={{display: 'flex', gap: '24px', marginBottom: '20px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{width: '12px', height: '12px', background: '#9f7aea', borderRadius: '3px'}}></div>
            <span style={{color: '#cbd5e0'}}>Mood Score</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <div style={{width: '12px', height: '12px', background: '#4fd1c5', borderRadius: '3px'}}></div>
            <span style={{color: '#cbd5e0'}}>Sessions</span>
          </div>
        </div>

        <div style={{display: 'flex', gap: '16px'}}>
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '8px', minWidth: '30px'}}>
            <span style={{color: '#cbd5e0', fontSize: '0.8rem'}}>100</span>
            <span style={{color: '#cbd5e0', fontSize: '0.8rem'}}>75</span>
            <span style={{color: '#cbd5e0', fontSize: '0.8rem'}}>50</span>
            <span style={{color: '#cbd5e0', fontSize: '0.8rem'}}>25</span>
            <span style={{color: '#cbd5e0', fontSize: '0.8rem'}}>0</span>
          </div>

          <div style={{flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px'}}>
            {userData.stats.weeklyData.map((data, i) => (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px'}}>
                <div style={{
                  width: '16px',
                  height: `${data.mood}px`,
                  background: '#9f7aea',
                  borderRadius: '6px 6px 0 0',
                  marginBottom: '4px',
                  transition: 'height 0.3s ease',
                  boxShadow: '0 0 10px #9f7aea80'
                }} />
                <div style={{
                  width: '16px',
                  height: `${Math.min(data.sessions * 15, 150)}px`,
                  background: '#4fd1c5',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s ease',
                  boxShadow: '0 0 10px #4fd1c580'
                }} />
                <span style={{color: '#cbd5e0', fontSize: '0.8rem', marginTop: '8px'}}>{data.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '24px' }}>
        <div style={{...styles.card, textAlign: 'center', padding: '20px'}}>
          <div style={{fontSize: '2.5rem', marginBottom: '8px'}}>🤖</div>
          <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#9f7aea'}}>{userData.stats.aiSessions}</div>
          <div style={{color: '#cbd5e0', fontSize: '0.9rem'}}>AI Sessions</div>
        </div>

        <div style={{...styles.card, textAlign: 'center', padding: '20px'}}>
          <div style={{fontSize: '2.5rem', marginBottom: '8px'}}>🌬️</div>
          <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#4fd1c5'}}>{userData.stats.breathing}</div>
          <div style={{color: '#cbd5e0', fontSize: '0.9rem'}}>Breathing</div>
        </div>

        <div style={{...styles.card, textAlign: 'center', padding: '20px'}}>
          <div style={{fontSize: '2.5rem', marginBottom: '8px'}}>🆘</div>
          <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#f87171'}}>{userData.stats.sosUsed}</div>
          <div style={{color: '#cbd5e0', fontSize: '0.9rem'}}>SOS Used</div>
        </div>

        <div style={{...styles.card, textAlign: 'center', padding: '20px'}}>
          <div style={{fontSize: '2.5rem', marginBottom: '8px'}}>📝</div>
          <div style={{fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24'}}>{userData.stats.journal}</div>
          <div style={{color: '#cbd5e0', fontSize: '0.9rem'}}>Journal</div>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== AI ASSISTANT WITH OPENROUTER ====================
const AIAssistant = ({ startTechnique }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "👋 Hi there! I'm your LumaCare wellness assistant. I'm here to talk, listen, and support you. No pressure, no judgment. How are you feeling today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const getAIResponse = async (userMessage) => {
    try {
      const allMessages = [
        {
          role: 'system',
          content: `You are a warm, empathetic wellness assistant for LumaCare. Your personality:
          
          - You're a good listener who asks thoughtful follow-up questions
          - You validate feelings before offering any suggestions
          - You speak naturally, like a caring friend
          
          IMPORTANT: When someone explicitly mentions a problem (anxiety, stress, overwhelm, panic, negative thoughts, focus issues, etc.), you SHOULD recommend a specific technique AFTER listening first.
          
          TECHNIQUE RECOMMENDATIONS (use these naturally):
          - For anxiety/panic: "That sounds really tough. You know what helps me when I feel anxious? Box breathing. It's this simple 4-4-4-4 pattern. Would you like to try it together?"
          - For overwhelm/tasks: "When I'm overwhelmed with too much, the Priority Matrix helps me sort things out. Want me to show you how it works?"
          - For negative thoughts: "Those thoughts can be really heavy. There's something called Cognitive Restructuring that helps challenge them. I can guide you through it if you'd like."
          - For focus issues: "Struggling with focus is so frustrating. The Pomodoro Technique really helps me - 25 minutes of work, then a break. Want to give it a shot?"
          - For panic/dissociation: "That feeling of being disconnected is scary. Grounding techniques help bring you back to the present. Want to try the 5-4-3-2-1 method with me?"
          
          RULES:
          - Always listen first, then suggest
          - Be warm and conversational, not clinical
          - Ask if they want to try it - don't just dump information
          - Keep responses natural (2-4 sentences)`
        },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'LumaCare Wellness'
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct',
          messages: allMessages,
          temperature: 0.8,
          max_tokens: 250
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      ]);
      
      return aiResponse;
    } catch (error) {
      console.error('OpenRouter Error:', error);
      
      const lowerMsg = userMessage.toLowerCase();
      
      if (lowerMsg.includes('anxi') || lowerMsg.includes('panic') || lowerMsg.includes('nervous')) {
        return "I hear that anxiety is really getting to you. You know what helps me when I feel like that? Box breathing. It's simple - inhale for 4, hold for 4, exhale for 4, hold for 4. It calms your nervous system pretty quickly. Want to try it together?";
      }
      else if (lowerMsg.includes('overwhelm') || lowerMsg.includes('too much') || lowerMsg.includes('stressed')) {
        return "That sounds like a lot to handle. When I get overwhelmed, the Priority Matrix helps me sort through everything. It helps you figure out what's actually urgent vs what can wait. Would you like me to show you how it works?";
      }
      else if (lowerMsg.includes('negative') || lowerMsg.includes('thought') || lowerMsg.includes('self-doubt')) {
        return "Those negative thoughts can be really convincing, can't they? There's this technique called Cognitive Restructuring that helps challenge them. I could guide you through it if you're interested - it's helped me before.";
      }
      else if (lowerMsg.includes('focus') || lowerMsg.includes('concentrate') || lowerMsg.includes('distracted')) {
        return "Ugh, struggling with focus is the worst. The Pomodoro Technique has been a game-changer for me - you work for 25 minutes, then take a 5-minute break. Want to give it a try?";
      }
      else if (lowerMsg.includes('panic') || lowerMsg.includes('disconnect') || lowerMsg.includes('unreal')) {
        return "That feeling of being disconnected or panicky is really scary. Grounding techniques help bring you back to the present. There's one called 5-4-3-2-1 where you notice things around you. Want to try it with me?";
      }
      else {
        return "I'm really glad you're here. What's been on your mind lately? I'm all ears, and if there's something specific you're dealing with, I might know some techniques that could help.";
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    const aiResponse = await getAIResponse(userMessage);
    
    const techniqueKeywords = {
      'box breathing': 'box-breathing',
      '4-7-8': '478-breathing',
      'priority matrix': 'priority-matrix',
      'cognitive restructuring': 'cognitive-restructuring',
      'pomodoro': 'pomodoro',
      'grounding': 'grounding'
    };

    let detectedTechnique = null;
    const lowerResponse = aiResponse.toLowerCase();
    for (const [keyword, techniqueId] of Object.entries(techniqueKeywords)) {
      if (lowerResponse.includes(keyword)) {
        detectedTechnique = techniqueId;
        break;
      }
    }

    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: aiResponse,
      technique: detectedTechnique 
    }]);
    setIsLoading(false);
  };

  const conversationStarters = [
    { emoji: '😊', text: 'Just checking in', query: 'Just wanted to check in and say hi' },
    { emoji: '😰', text: 'Feeling anxious', query: 'I\'ve been feeling really anxious lately' },
    { emoji: '😔', text: 'A bit down', query: 'I\'m feeling a bit down today' },
    { emoji: '😤', text: 'Overwhelmed', query: 'Everything feels overwhelming right now' },
    { emoji: '😴', text: 'Tired', query: 'I\'m exhausted but can\'t relax' },
    { emoji: '🧠', text: 'Can\'t stop thinking', query: 'My mind won\'t stop racing' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 style={styles.title}>AI Wellness Assistant</h1>
      <p style={styles.subtitle}>Here to listen and help 💙</p>

      <div style={{...styles.card, minHeight: '550px', display: 'flex', flexDirection: 'column'}}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '16px',
          padding: '16px',
          maxHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}>
                  🤖
                </div>
              )}
              <div style={{
                maxWidth: '70%',
                padding: '12px 18px',
                borderRadius: msg.role === 'user' 
                  ? '20px 20px 4px 20px' 
                  : '20px 20px 20px 4px',
                background: msg.role === 'user' 
                  ? 'linear-gradient(135deg, #9f7aea, #4fd1c5)'
                  : 'rgba(255,255,255,0.1)',
                color: 'white',
                lineHeight: '1.5',
                fontSize: '1rem',
              }}>
                {msg.content}
                {msg.technique && (
                  <div style={{marginTop: '12px'}}>
                    <motion.button
                      whileHover={{scale: 1.02}}
                      whileTap={{scale: 0.98}}
                      onClick={() => startTechnique(msg.technique)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
                        border: 'none',
                        borderRadius: '20px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Try this technique →
                    </motion.button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}>
                  👤
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px' }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                🤖
              </div>
              <div style={{
                padding: '12px 18px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '4px'
              }}>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>.</motion.span>
              </div>
            </motion.div>
          )}
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '16px',
          justifyContent: 'center'
        }}>
          {conversationStarters.map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setInput(item.query);
                setTimeout(() => handleSend(), 100);
              }}
              style={{
                padding: '8px 16px',
                background: 'rgba(159,122,234,0.1)',
                border: '1px solid #9f7aea40',
                borderRadius: '30px',
                color: 'white',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{item.emoji}</span>
              <span>{item.text}</span>
            </motion.button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="How are you feeling? Just type naturally..."
            disabled={isLoading}
            style={{
              ...styles.input,
              marginBottom: 0,
              opacity: isLoading ? 0.5 : 1,
              borderRadius: '30px',
              padding: '14px 20px'
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: isLoading || !input.trim() ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
              border: 'none',
              color: 'white',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '1.2rem',
              opacity: isLoading || !input.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ➤
          </motion.button>
        </div>

        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          💬 I'm here to listen and help when you need it.
        </div>
      </div>
    </motion.div>
  );
};

// ==================== COGNITIVE RESTRUCTURING ====================
const CognitiveChatbot = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hey there. Let's work through some thoughts together, but really slowly - no rush at all. I want to understand what's going on with you. What's on your mind today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const [thought, setThought] = useState('');
  const [evidenceFor, setEvidenceFor] = useState([]);
  const [evidenceAgainst, setEvidenceAgainst] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [balancedThought, setBalancedThought] = useState('');
  
  const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const getCognitiveResponse = async (userMessage, currentStep) => {
    try {
      let systemPrompt = '';
      
      if (currentStep === 0) {
        systemPrompt = `You are guiding someone through Cognitive Restructuring. They just shared their initial thought. 
        Respond warmly and ask gentle follow-up questions to understand them better. Keep it to 1-2 sentences.`;
      } 
      else if (currentStep === 1) {
        systemPrompt = `You are guiding someone through Cognitive Restructuring. They shared evidence for their thought.
        Now ask them what evidence might contradict this thought. Be gentle. Keep it to 1-2 sentences.`;
      }
      else if (currentStep === 2) {
        systemPrompt = `You are guiding someone through Cognitive Restructuring. They shared evidence against their thought.
        Now ask them to consider alternative perspectives. Keep it to 1-2 sentences.`;
      }
      else if (currentStep === 3) {
        systemPrompt = `You are guiding someone through Cognitive Restructuring. They shared alternative perspectives.
        Now ask them to develop a more balanced thought. Keep it to 1-2 sentences.`;
      }
      else if (currentStep === 4) {
        systemPrompt = `You are completing Cognitive Restructuring. Acknowledge their work and tell them you'll show a summary. Keep it warm.`;
      }

      const allMessages = [
        {
          role: 'system',
          content: systemPrompt
        },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'LumaCare Wellness'
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct',
          messages: allMessages,
          temperature: 0.8,
          max_tokens: 100
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      ]);
      
      return aiResponse;
    } catch (error) {
      console.error('OpenRouter Error:', error);
      
      const fallbacks = [
        "I really want to understand. Can you tell me more about that?",
        "Take your time with this. What else comes up for you?",
        "That's helpful. Is there anything more you want to share?",
      ];
      
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    
    if (step === 0) setThought(userMessage);
    else if (step === 1) setEvidenceFor([...evidenceFor, userMessage]);
    else if (step === 2) setEvidenceAgainst([...evidenceAgainst, userMessage]);
    else if (step === 3) setAlternatives([...alternatives, userMessage]);
    else if (step === 4) {
      setBalancedThought(userMessage);
      setCompleted(true);
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsProcessing(true);

    const aiResponse = await getCognitiveResponse(userMessage, step);
    
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsProcessing(false);
  };

  const moveToNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
      const stepMessages = [
        "Alright, let's gently move to the next part. ",
        "Okay, now let's look at something a little different. ",
        "Good. Now let's explore another angle. ",
        "You're doing great. One more step to go. "
      ];
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: stepMessages[step] + "Take your time with this next question." 
      }]);
    }
  };

  const handleComplete = () => {
    onComplete('cognitive', rating, feedback, {
      thought,
      evidenceFor,
      evidenceAgainst,
      alternatives,
      balancedThought
    });
  };

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{textAlign: 'center'}}>
        <h2 style={{color: '#f687b3', marginBottom: '24px'}}>🧠 Thank You for Sharing</h2>
        <p style={{color: '#cbd5e0', marginBottom: '32px'}}>
          You took the time to really understand yourself. That's beautiful.
        </p>

        <div style={{...styles.card, marginBottom: '24px', textAlign: 'left'}}>
          <h3 style={{color: '#f687b3', marginBottom: '16px'}}>What We Discovered Together:</h3>
          
          <div style={{marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
            <p style={{color: '#cbd5e0', fontWeight: 'bold'}}>Your original thought:</p>
            <p style={{color: 'white'}}>"{thought}"</p>
          </div>

          {evidenceFor.length > 0 && (
            <div style={{marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
              <p style={{color: '#cbd5e0', fontWeight: 'bold'}}>What made it feel true:</p>
              <ul style={{color: 'white', marginLeft: '20px'}}>
                {evidenceFor.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}

          {evidenceAgainst.length > 0 && (
            <div style={{marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
              <p style={{color: '#cbd5e0', fontWeight: 'bold'}}>What challenged that thought:</p>
              <ul style={{color: 'white', marginLeft: '20px'}}>
                {evidenceAgainst.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}

          {alternatives.length > 0 && (
            <div style={{marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
              <p style={{color: '#cbd5e0', fontWeight: 'bold'}}>Other ways to see it:</p>
              <ul style={{color: 'white', marginLeft: '20px'}}>
                {alternatives.map((a, i) => <li key={i}>• {a}</li>)}
              </ul>
            </div>
          )}

          <div style={{marginBottom: '16px', padding: '12px', background: 'rgba(246,135,179,0.1)', borderRadius: '8px'}}>
            <p style={{color: '#cbd5e0', fontWeight: 'bold'}}>A kinder, more balanced thought:</p>
            <p style={{color: '#f687b3', fontStyle: 'italic', fontSize: '1.1rem'}}>"{balancedThought}"</p>
          </div>
        </div>

        <div style={{...styles.card, marginBottom: '24px', textAlign: 'left'}}>
          <h3 style={{color: '#f687b3', marginBottom: '16px'}}>How are you feeling now?</h3>
          
          <div style={{marginBottom: '24px'}}>
            <p style={{color: '#cbd5e0', marginBottom: '8px'}}>On a scale of 1-5, how are you doing?</p>
            <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
              {[1,2,3,4,5].map(n => (
                <motion.button
                  key={n}
                  whileHover={{scale: 1.1}}
                  onClick={() => setRating(n)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: rating === n ? '#f687b3' : 'rgba(159,122,234,0.1)',
                    border: '1px solid #f687b3',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Anything you want to share about this experience?"
            style={{...styles.input, minHeight: '100px'}}
          />
        </div>

        <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.98}}
            onClick={handleComplete}
            style={styles.button}
          >
            Complete
          </motion.button>
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.98}}
            onClick={onBack}
            style={{...styles.button, background: 'transparent', border: '1px solid #cbd5e0'}}
          >
            Back
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={onBack} style={{background: 'none', border: 'none', color: '#f687b3', cursor: 'pointer', marginBottom: '16px', fontSize: '1rem'}}>← Back</button>
      
      <h1 style={styles.title}>Cognitive Restructuring</h1>
      <p style={{...styles.subtitle, color: '#f687b3'}}>Let's go slowly. No rush at all.</p>

      <div style={{...styles.card, minHeight: '550px', display: 'flex', flexDirection: 'column'}}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '16px',
          padding: '16px',
          maxHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f687b3, #4fd1c5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}>
                  🤖
                </div>
              )}
              <div style={{
                maxWidth: '70%',
                padding: '12px 18px',
                borderRadius: msg.role === 'user' 
                  ? '20px 20px 4px 20px' 
                  : '20px 20px 20px 4px',
                background: msg.role === 'user' 
                  ? 'linear-gradient(135deg, #f687b3, #4fd1c5)'
                  : 'rgba(255,255,255,0.1)',
                color: 'white',
                lineHeight: '1.5',
                fontSize: '1rem',
              }}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0
                }}>
                  👤
                </div>
              )}
            </motion.div>
          ))}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px' }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f687b3, #4fd1c5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                🤖
              </div>
              <div style={{
                padding: '12px 18px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '4px'
              }}>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>.</motion.span>
              </div>
            </motion.div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Take your time. Share what feels right..."
            disabled={isProcessing}
            style={{
              ...styles.input,
              marginBottom: 0,
              opacity: isProcessing ? 0.5 : 1,
              borderRadius: '30px',
              padding: '14px 20px'
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isProcessing || !input.trim()}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: isProcessing || !input.trim() ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #f687b3, #4fd1c5)',
              border: 'none',
              color: 'white',
              cursor: isProcessing || !input.trim() ? 'not-allowed' : 'pointer',
              fontSize: '1.2rem',
              opacity: isProcessing || !input.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ➤
          </motion.button>
        </div>

        {step > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={moveToNextStep}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #f687b3',
              borderRadius: '30px',
              color: '#f687b3',
              fontSize: '0.9rem',
              cursor: 'pointer',
              alignSelf: 'center'
            }}
          >
            I think I'm ready for the next step →
          </motion.button>
        )}

        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          💭 Take all the time you need. There's no rush here.
        </div>
      </div>
    </motion.div>
  );
};

// ==================== BREATHING TECHNIQUE ====================
const BreathingTechnique = ({ technique, onComplete, onBack }) => {
  const [cycles, setCycles] = useState(technique.minCycles);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('inhale');
  const [count, setCount] = useState(technique.inhale);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let timer;
    if (isActive && !completed) {
      timer = setInterval(() => {
        setCount(prev => {
          if (prev <= 1) {
            if (phase === 'inhale') { 
              setPhase('hold1'); 
              return technique.hold1; 
            }
            if (phase === 'hold1') { 
              setPhase('exhale'); 
              return technique.exhale; 
            }
            if (phase === 'exhale') { 
              setPhase('hold2'); 
              return technique.hold2; 
            }
            if (phase === 'hold2') { 
              if (currentCycle >= cycles) {
                setCompleted(true);
                setIsActive(false);
                return technique.inhale;
              }
              setPhase('inhale');
              setCurrentCycle(c => c + 1);
              return technique.inhale; 
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase, currentCycle, cycles, technique, completed]);

  const handleStart = () => {
    if (cycles < technique.minCycles || cycles > technique.maxCycles) {
      alert(`Please select between ${technique.minCycles} and ${technique.maxCycles} cycles`);
      return;
    }
    setIsActive(true);
    setCurrentCycle(1);
    setPhase('inhale');
    setCount(technique.inhale);
    setCompleted(false);
  };

  const handleComplete = () => {
    onComplete(technique.id, rating, feedback);
  };

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{textAlign: 'center'}}>
        <h2 style={{color: technique.color, marginBottom: '24px'}}>✨ Session Complete!</h2>
        <p style={{color: '#cbd5e0', marginBottom: '32px', fontSize: '1.2rem'}}>
          You completed {cycles} cycles of {technique.name}.
        </p>
        
        <div style={{...styles.card, marginBottom: '24px', textAlign: 'left'}}>
          <h3 style={{color: technique.color, marginBottom: '16px'}}>How do you feel?</h3>
          
          <div style={{marginBottom: '24px'}}>
            <p style={{color: '#cbd5e0', marginBottom: '8px'}}>Rate your experience (1-5):</p>
            <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
              {[1,2,3,4,5].map(n => (
                <motion.button
                  key={n}
                  whileHover={{scale: 1.1}}
                  onClick={() => setRating(n)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: rating === n ? technique.color : 'rgba(159,122,234,0.1)',
                    border: '1px solid ' + technique.color,
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="How did this technique help you? Share your experience..."
            style={{...styles.input, minHeight: '100px'}}
          />
        </div>

        <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.98}}
            onClick={handleComplete}
            style={styles.button}
          >
            Save & Continue
          </motion.button>
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.98}}
            onClick={onBack}
            style={{...styles.button, background: 'transparent', border: '1px solid #cbd5e0'}}
          >
            Back to Techniques
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{textAlign: 'center'}}>
      <button onClick={onBack} style={{background: 'none', border: 'none', color: '#9f7aea', cursor: 'pointer', marginBottom: '16px', fontSize: '1rem', display: 'block', textAlign: 'left'}}>← Back to Techniques</button>
      
      <h1 style={styles.title}>{technique.name}</h1>
      <p style={{...styles.subtitle, color: technique.color}}>Pattern: {technique.pattern}</p>

      <div style={{...styles.card, marginBottom: '24px', background: technique.color + '10', textAlign: 'left'}}>
        <h3 style={{color: technique.color, marginBottom: '8px'}}>When to Use</h3>
        <p style={{color: '#cbd5e0'}}>{technique.whenToUse}</p>
      </div>

      {!isActive ? (
        <div style={{...styles.card, marginBottom: '24px'}}>
          <h3 style={{color: technique.color, marginBottom: '16px'}}>Set Your Session</h3>
          <label style={{display: 'block', color: '#cbd5e0', marginBottom: '8px'}}>
            Number of cycles ({technique.minCycles}-{technique.maxCycles}):
          </label>
          <input
            type="number"
            min={technique.minCycles}
            max={technique.maxCycles}
            value={cycles}
            onChange={(e) => setCycles(parseInt(e.target.value))}
            style={styles.input}
          />
          <motion.button
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
            onClick={handleStart}
            style={{...styles.button, width: '100%'}}
          >
            Begin Session
          </motion.button>
        </div>
      ) : (
        <>
          <motion.div
            style={{
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              margin: '20px auto',
              background: `radial-gradient(circle at 30% 30%, ${technique.color}, #1a0b2e)`,
              boxShadow: `0 0 50px ${technique.color}80`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            animate={{ scale: phase === 'inhale' || phase === 'hold1' ? 1.8 : 1 }}
            transition={{duration: 
              phase === 'inhale' ? technique.inhale : 
              phase === 'hold1' ? technique.hold1 : 
              phase === 'exhale' ? technique.exhale : technique.hold2 
            }}
          >
            <div style={{color: 'white', textShadow: '0 2px 10px black'}}>
              <h2 style={{fontSize: '1.8rem', marginBottom: '8px'}}>
                {phase === 'inhale' ? 'Inhale' : 
                 phase === 'hold1' ? 'Hold' : 
                 phase === 'exhale' ? 'Exhale' : 'Hold Empty'}
              </h2>
              <p style={{fontSize: '2.5rem', fontWeight: 'bold'}}>{count}s</p>
            </div>
          </motion.div>

          <div style={{marginTop: '16px'}}>
            <p style={{color: technique.color}}>Cycle {currentCycle} of {cycles}</p>
          </div>

          <div style={{display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px'}}>
            <motion.button
              whileHover={{scale: 1.05}}
              whileTap={{scale: 0.95}}
              onClick={() => setIsActive(false)}
              style={{
                background: 'rgba(239,68,68,0.2)',
                border: '2px solid #ef4444',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '50px',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              Pause
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

// ==================== GROUNDING TECHNIQUE ====================
const GroundingTechnique = ({ technique, onComplete, onBack }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [items, setItems] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const groundingSteps = [
    { prompt: "👁️ Name 5 things you can see around you:", count: 5, placeholder: "Enter 5 things separated by commas" },
    { prompt: "✋ Identify 4 things you can touch or feel:", count: 4, placeholder: "Enter 4 things separated by commas" },
    { prompt: "👂 Acknowledge 3 things you can hear:", count: 3, placeholder: "Enter 3 things separated by commas" },
    { prompt: "👃 Notice 2 things you can smell:", count: 2, placeholder: "Enter 2 things separated by commas" },
    { prompt: "👅 Recognize 1 thing you can taste:", count: 1, placeholder: "Enter 1 thing" }
  ];

  const handleAddItem = () => {
    if (!currentInput.trim()) return;
    
    const newItems = currentInput.split(',').map(i => i.trim()).filter(i => i);
    setItems([...items, ...newItems]);
    setCurrentInput('');
  };

  const handleNext = () => {
    if (items.length < groundingSteps[step].count) {
      alert(`Please list at least ${groundingSteps[step].count} things (you've listed ${items.length})`);
      return;
    }

    setAnswers([...answers, { step, items: [...items], prompt: groundingSteps[step].prompt }]);
    setItems([]);
    
    if (step < groundingSteps.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleComplete = () => {
    onComplete(technique.id, rating, feedback);
  };

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{textAlign: 'center'}}>
        <h2 style={{color: technique.color, marginBottom: '24px'}}>🌱 Grounding Complete</h2>
        <p style={{color: '#cbd5e0', marginBottom: '32px'}}>
          You've anchored yourself in the present moment.
        </p>

        <div style={{...styles.card, marginBottom: '24px', textAlign: 'left'}}>
          <h3 style={{color: technique.color, marginBottom: '16px'}}>Your grounding moments:</h3>
          {answers.map((ans, i) => (
            <div key={i} style={{marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px'}}>
              <p style={{color: technique.color, fontWeight: 'bold', marginBottom: '8px'}}>{ans.prompt}</p>
              <ul style={{color: 'white', marginLeft: '20px'}}>
                {ans.items.map((item, j) => (
                  <li key={j}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{...styles.card, marginBottom: '24px', textAlign: 'left'}}>
          <h3 style={{color: technique.color, marginBottom: '16px'}}>How do you feel?</h3>
          
          <div style={{marginBottom: '24px'}}>
            <p style={{color: '#cbd5e0', marginBottom: '8px'}}>Rate your experience (1-5):</p>
            <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
              {[1,2,3,4,5].map(n => (
                <motion.button
                  key={n}
                  whileHover={{scale: 1.1}}
                  onClick={() => setRating(n)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: rating === n ? technique.color : 'rgba(159,122,234,0.1)',
                    border: '1px solid ' + technique.color,
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="How do you feel after grounding yourself?"
            style={{...styles.input, minHeight: '100px'}}
          />
        </div>

        <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.98}}
            onClick={handleComplete}
            style={styles.button}
          >
            Complete
          </motion.button>
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.98}}
            onClick={onBack}
            style={{...styles.button, background: 'transparent', border: '1px solid #cbd5e0'}}
          >
            Back
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={onBack} style={{background: 'none', border: 'none', color: '#9f7aea', cursor: 'pointer', marginBottom: '16px', fontSize: '1rem'}}>← Back to Techniques</button>
      
      <h1 style={styles.title}>{technique.name}</h1>
      <p style={{...styles.subtitle, color: technique.color}}>Step {step + 1} of {groundingSteps.length}</p>
      <p style={{color: '#cbd5e0', marginBottom: '16px'}}>Listed: {items.length} / {groundingSteps[step].count} items</p>

      <div style={styles.card}>
        <h3 style={{color: technique.color, marginBottom: '16px'}}>{groundingSteps[step].prompt}</h3>
        
        <div style={{marginBottom: '16px', minHeight: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '12px'}}>
          {items.length > 0 ? (
            <ul style={{color: 'white', marginLeft: '20px'}}>
              {items.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          ) : (
            <p style={{color: '#6b7280', fontStyle: 'italic'}}>No items listed yet. Add some below.</p>
          )}
        </div>

        <div style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
          <input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            placeholder={groundingSteps[step].placeholder}
            style={{flex: 1, ...styles.input, marginBottom: 0}}
          />
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
            onClick={handleAddItem}
            style={{padding: '12px 24px', background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer'}}
          >
            Add
          </motion.button>
        </div>

        <motion.button
          whileHover={{scale: 1.02}}
          whileTap={{scale: 0.98}}
          onClick={handleNext}
          disabled={items.length < groundingSteps[step].count}
          style={{
            ...styles.button,
            width: '100%',
            opacity: items.length < groundingSteps[step].count ? 0.5 : 1,
            cursor: items.length < groundingSteps[step].count ? 'not-allowed' : 'pointer'
          }}
        >
          {step < groundingSteps.length - 1 ? 'Next Step' : 'Complete Grounding'}
        </motion.button>
      </div>
    </motion.div>
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
  const [taskType, setTaskType] = useState('work');
  const [customTask, setCustomTask] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let timer;
    if (isActive && !completed) {
      timer = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            if (phase === 'work') {
              setPhase('break');
              return 5 * 60;
            } else {
              if (cycle >= 4) {
                setPhase('longBreak');
                return 15 * 60;
              } else {
                setCycle(c => c + 1);
                setPhase('work');
                return 25 * 60;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase, cycle, completed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!task && !customTask) {
      alert('Please describe your task first');
      return;
    }
    setIsActive(true);
  };

  const handleComplete = () => {
    onComplete(technique.id, rating, feedback);
  };

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{textAlign: 'center'}}>
        <h2 style={{color: technique.color, marginBottom: '24px'}}>🎉 Great Work!</h2>
        <p style={{color: '#cbd5e0', marginBottom: '32px'}}>
          You completed 4 Pomodoro cycles on: {task || customTask}
        </p>

        <div style={{...styles.card, marginBottom: '24px', textAlign: 'left'}}>
          <h3 style={{color: technique.color, marginBottom: '16px'}}>How was your focus session?</h3>
          
          <div style={{marginBottom: '24px'}}>
            <p style={{color: '#cbd5e0', marginBottom: '8px'}}>Rate your focus (1-5):</p>
            <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
              {[1,2,3,4,5].map(n => (
                <motion.button
                  key={n}
                  whileHover={{scale: 1.1}}
                  onClick={() => setRating(n)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: rating === n ? technique.color : 'rgba(159,122,234,0.1)',
                    border: '1px solid ' + technique.color,
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {n}
                </motion.button>
              ))}
            </div>
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="How productive were you? Share your experience..."
            style={{...styles.input, minHeight: '100px'}}
          />
        </div>

        <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.98}}
            onClick={handleComplete}
            style={styles.button}
          >
            Complete
          </motion.button>
          <motion.button
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.98}}
            onClick={onBack}
            style={{...styles.button, background: 'transparent', border: '1px solid #cbd5e0'}}
          >
            Back
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button onClick={onBack} style={{background: 'none', border: 'none', color: '#9f7aea', cursor: 'pointer', marginBottom: '16px', fontSize: '1rem'}}>← Back to Techniques</button>
      
      <h1 style={styles.title}>{technique.name}</h1>
      <p style={{...styles.subtitle, color: technique.color}}>Cycle {cycle} of 4</p>

      <div style={styles.card}>
        {!isActive ? (
          <>
            <h3 style={{color: technique.color, marginBottom: '16px'}}>Step 1: Choose your task</h3>
            
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              style={{...styles.select, color: 'white', backgroundColor: '#1a0b2e'}}
            >
              <option value="work" style={{backgroundColor: '#1a0b2e', color: 'white'}}>💼 Work</option>
              <option value="school" style={{backgroundColor: '#1a0b2e', color: 'white'}}>📚 School work</option>
              <option value="project" style={{backgroundColor: '#1a0b2e', color: 'white'}}>🚀 Project</option>
              <option value="other" style={{backgroundColor: '#1a0b2e', color: 'white'}}>✨ Other</option>
            </select>

            {taskType === 'other' ? (
              <input
                type="text"
                value={customTask}
                onChange={(e) => setCustomTask(e.target.value)}
                placeholder="Describe your task"
                style={styles.input}
              />
            ) : (
              <input
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder={`Enter your ${taskType} task`}
                style={styles.input}
              />
            )}

            <motion.button
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
              onClick={handleStart}
              style={{...styles.button, width: '100%'}}
            >
              Start Timer
            </motion.button>
          </>
        ) : (
          <>
            <div style={{textAlign: 'center', marginBottom: '24px'}}>
              <h2 style={{fontSize: '3rem', color: technique.color}}>{formatTime(time)}</h2>
              <p style={{color: '#cbd5e0', fontSize: '1.2rem', marginTop: '8px'}}>
                {phase === 'work' ? '🔨 Focus Time' : phase === 'break' ? '☕ Short Break' : '🎉 Long Break'}
              </p>
              <p style={{color: '#cbd5e0', marginTop: '8px'}}>
                Working on: {task || customTask}
              </p>
            </div>

            <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
              <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                onClick={() => setIsActive(false)}
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  border: '2px solid #ef4444',
                  color: 'white',
                  padding: '12px 32px',
                  borderRadius: '50px',
                  cursor: 'pointer'
                }}
              >
                Pause
              </motion.button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ==================== PRIORITY MATRIX ====================
const PriorityMatrix = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('lumacare_matrix_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Finish client presentation', quadrant: 'urgent-important', completed: false },
      { id: 2, text: 'Plan next week\'s schedule', quadrant: 'important-not-urgent', completed: false },
      { id: 3, text: 'Reply to emails', quadrant: 'urgent-not-important', completed: false },
    ];
  });

  const [newTask, setNewTask] = useState('');
  const [selectedQuadrant, setSelectedQuadrant] = useState('urgent-important');

  useEffect(() => {
    localStorage.setItem('lumacare_matrix_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.trim()) return;
    const task = { id: Date.now(), text: newTask, quadrant: selectedQuadrant, completed: false };
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const quadrants = [
    { id: 'urgent-important', title: 'Urgent & Important', subtitle: 'Do now', color: '#ef4444' },
    { id: 'important-not-urgent', title: 'Important, Not Urgent', subtitle: 'Schedule', color: '#10b981' },
    { id: 'urgent-not-important', title: 'Urgent, Not Important', subtitle: 'Delegate', color: '#f59e0b' },
    { id: 'neither', title: 'Neither', subtitle: 'Eliminate', color: '#6b7280' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 style={styles.title}>Priority Matrix</h1>
      <p style={styles.subtitle}>Sort tasks by urgency and importance.</p>

      <div style={{...styles.card, marginBottom: '24px'}}>
        <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
            style={{flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white'}}
          />
          <select
            value={selectedQuadrant}
            onChange={(e) => setSelectedQuadrant(e.target.value)}
            style={{padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', minWidth: '180px'}}
          >
            {quadrants.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
          <motion.button
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
            onClick={addTask}
            style={{padding: '12px 32px', background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer'}}
          >
            Add
          </motion.button>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
        {quadrants.map((q) => (
          <div key={q.id} style={{...styles.card, background: `linear-gradient(135deg, ${q.color}20, rgba(0,0,0,0.2))`, borderColor: q.color + '80'}}>
            <h3 style={{color: q.color, marginBottom: '4px'}}>{q.title}</h3>
            <p style={{fontSize: '0.85rem', color: '#cbd5e0', marginBottom: '16px'}}>{q.subtitle}</p>
            {tasks.filter(t => t.quadrant === q.id).map(task => (
              <div key={task.id} style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '8px'}}>
                <span
                  onClick={() => toggleTask(task.id)}
                  style={{width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', background: task.completed ? q.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                >
                  {task.completed && '✓'}
                </span>
                <span style={{flex: 1, textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.5 : 1}}>{task.text}</span>
                <span onClick={() => deleteTask(task.id)} style={{cursor: 'pointer', color: '#ef4444'}}>✕</span>
              </div>
            ))}
            {tasks.filter(t => t.quadrant === q.id).length === 0 && (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px', color: '#6b7280', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '8px'}}>
                Drop tasks here
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ==================== SETTINGS ====================
const Settings = ({ logout, user }) => {
  const [name, setName] = useState(user?.name || '');
  const [preferences, setPreferences] = useState({
    dailyRituals: localStorage.getItem('dailyRituals') === 'true' || false,
    hapticFeedback: localStorage.getItem('hapticFeedback') === 'true' || false,
    reducedMotion: localStorage.getItem('reducedMotion') === 'true' || false,
    voiceGuidance: localStorage.getItem('voiceGuidance') === 'true' || false,
  });

  const handleSaveName = () => {
    const updatedUser = { ...user, name };
    localStorage.setItem('lumacare_user', JSON.stringify(updatedUser));
    window.location.reload();
  };

  const handleToggle = (key, value) => {
    setPreferences({ ...preferences, [key]: value });
    localStorage.setItem(key, value.toString());
  };

  const ToggleSwitch = ({ checked, onChange }) => (
    <label style={{position: 'relative', display: 'inline-block', width: '50px', height: '24px'}}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{opacity: 0, width: 0, height: 0}} />
      <span style={{
        position: 'absolute',
        cursor: 'pointer',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: checked ? '#9f7aea' : 'rgba(255,255,255,0.1)',
        borderRadius: '24px',
        transition: '0.3s'
      }}>
        <span style={{
          position: 'absolute',
          height: '20px',
          width: '20px',
          left: checked ? '26px' : '4px',
          bottom: '2px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transition: '0.3s'
        }} />
      </span>
    </label>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 style={styles.title}>Settings</h1>
      <p style={styles.subtitle}>Personalize your LumaCare experience</p>

      <div style={{...styles.card, marginBottom: '16px'}}>
        <h3 style={{marginBottom: '16px', color: '#9f7aea'}}>Profile</h3>
        
        <div style={{marginBottom: '16px'}}>
          <label style={{display: 'block', color: '#cbd5e0', marginBottom: '8px'}}>What should I call you?</label>
          <div style={{display: 'flex', gap: '8px'}}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white'}}
            />
            <motion.button
              whileHover={{scale: 1.05}}
              whileTap={{scale: 0.95}}
              onClick={handleSaveName}
              style={{padding: '12px 24px', background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer'}}
            >
              Save
            </motion.button>
          </div>
        </div>

        <div style={{color: '#cbd5e0', fontSize: '0.9rem'}}>
          <span style={{color: '#9f7aea'}}>📧</span> {user?.email}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{marginBottom: '16px', color: '#9f7aea'}}>Preferences</h3>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
          <div>
            <div style={{fontWeight: 500}}>Daily Rituals</div>
            <div style={{color: '#cbd5e0', fontSize: '0.85rem'}}>Receive daily practice suggestions</div>
          </div>
          <ToggleSwitch checked={preferences.dailyRituals} onChange={(val) => handleToggle('dailyRituals', val)} />
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
          <div>
            <div style={{fontWeight: 500}}>Haptic Feedback</div>
            <div style={{color: '#cbd5e0', fontSize: '0.85rem'}}>Gentle vibrations on interaction</div>
          </div>
          <ToggleSwitch checked={preferences.hapticFeedback} onChange={(val) => handleToggle('hapticFeedback', val)} />
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
          <div>
            <div style={{fontWeight: 500}}>Reduced Motion</div>
            <div style={{color: '#cbd5e0', fontSize: '0.85rem'}}>Minimize animations</div>
          </div>
          <ToggleSwitch checked={preferences.reducedMotion} onChange={(val) => handleToggle('reducedMotion', val)} />
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0'}}>
          <div>
            <div style={{fontWeight: 500}}>Voice Guidance</div>
            <div style={{color: '#cbd5e0', fontSize: '0.85rem'}}>Audio during exercises</div>
          </div>
          <ToggleSwitch checked={preferences.voiceGuidance} onChange={(val) => handleToggle('voiceGuidance', val)} />
        </div>
      </div>

      <div style={{...styles.card, marginTop: '16px'}}>
        <h3 style={{marginBottom: '16px', color: '#9f7aea'}}>Account</h3>
        <motion.button
          whileHover={{scale: 1.02}}
          whileTap={{scale: 0.98}}
          onClick={logout}
          style={{width: '100%', padding: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', cursor: 'pointer'}}
        >
          Sign Out
        </motion.button>
      </div>
    </motion.div>
  );
};

// ==================== TECHNIQUES LIST ====================
const Techniques = ({ navigateTo, startTechnique }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 style={styles.title}>Therapy Techniques</h1>
      <p style={styles.subtitle}>Choose a technique that matches how you feel</p>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px'}}>
        {Object.values(techniquesData).map((tech) => (
          <motion.div
            key={tech.id}
            style={{...styles.card, cursor: 'pointer', borderColor: tech.color + '40'}}
            whileHover={{y: -4, borderColor: tech.color}}
            onClick={() => startTechnique(tech.id)}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: tech.color + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem'
              }}>
                {tech.icon}
              </div>
              <div>
                <h3 style={{fontSize: '1.2rem', marginBottom: '4px'}}>{tech.name}</h3>
              </div>
            </div>
            <p style={{color: '#cbd5e0', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '12px'}}>{tech.description}</p>
            <p style={{color: tech.color, fontSize: '0.85rem', marginBottom: '16px'}}><strong>When to use:</strong> {tech.whenToUse}</p>
            <motion.button
              whileHover={{scale: 1.02}}
              whileTap={{scale: 0.98}}
              onClick={(e) => {
                e.stopPropagation();
                startTechnique(tech.id);
              }}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '10px',
                background: 'linear-gradient(135deg, ' + tech.color + '40, ' + tech.color + '20)',
                border: '1px solid ' + tech.color,
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 500
              }}
            >
              Start Practice
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ==================== BREATHE TAB ====================
const BreatheTab = ({ technique, onComplete, onBack }) => {
  if (!technique) {
    return (
      <div style={{textAlign: 'center', padding: '60px'}}>
        <h2 style={{color: '#9f7aea'}}>Select a technique first</h2>
        <p style={{color: '#cbd5e0', marginTop: '16px'}}>Go to Techniques tab to choose a practice.</p>
        <motion.button
          whileHover={{scale: 1.05}}
          whileTap={{scale: 0.98}}
          onClick={onBack}
          style={styles.button}
        >
          Browse Techniques
        </motion.button>
      </div>
    );
  }

  switch (technique.type) {
    case 'breathing':
      return <BreathingTechnique technique={technique} onComplete={onComplete} onBack={onBack} />;
    case 'grounding':
      return <GroundingTechnique technique={technique} onComplete={onComplete} onBack={onBack} />;
    case 'pomodoro':
      return <PomodoroTechnique technique={technique} onComplete={onComplete} onBack={onBack} />;
    case 'cognitive':
      return <CognitiveChatbot onComplete={onComplete} onBack={onBack} />;
    default:
      return (
        <div style={{textAlign: 'center'}}>
          <h2 style={{color: '#9f7aea'}}>Technique not available</h2>
          <motion.button onClick={onBack} style={styles.button}>
            Back
          </motion.button>
        </div>
      );
  }
};

// ==================== MAIN APP ====================
function App() {
  const [scrolled, setScrolled] = useState(false);
  const { user, login, logout } = useAuth();
  const [currentTechnique, setCurrentTechnique] = useState(null);
  const { userData, trackSession, upgradeUser } = useSessionTracking();
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes breathe { 0%,100% { opacity: 0.8; } 50% { opacity: 1; } }
      @keyframes twinkle { 0%,100% { opacity: 0.3; } 50% { opacity: 0.5; } }
      @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    `;
    document.head.appendChild(style);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const startTechnique = (techniqueId) => {
    const technique = techniquesData[techniqueId];
    setCurrentTechnique(technique);
    localStorage.setItem('lumacare_current_technique', JSON.stringify(technique));
    
    if (technique.location === 'matrix') {
      navigateTo('/matrix');
    } else {
      navigateTo('/breathe');
    }
  };

  const handleTechniqueComplete = (techniqueId, rating, feedback, additionalData = {}) => {
    const technique = techniquesData[techniqueId];
    if (technique) {
      trackSession(technique.type, rating, feedback);
    }
    setCurrentTechnique(null);
    localStorage.removeItem('lumacare_current_technique');
    navigateTo('/techniques');
  };

  const handleBack = () => {
    setCurrentTechnique(null);
    localStorage.removeItem('lumacare_current_technique');
    navigateTo('/techniques');
  };

  const handleUpgrade = (plan) => {
    upgradeUser(plan);
  };

  useEffect(() => {
    const savedTechnique = localStorage.getItem('lumacare_current_technique');
    if (savedTechnique && window.location.pathname === '/breathe') {
      setCurrentTechnique(JSON.parse(savedTechnique));
    }
  }, []);

  const routerFutureConfig = {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  };

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <LoginPage onLogin={login} />
      </GoogleOAuthProvider>
    );
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/matrix', label: 'Matrix', icon: '📌' },
    { path: '/techniques', label: 'Techniques', icon: '🧘' },
    { path: '/assistant', label: 'Assistant', icon: '🤖' },
    { path: '/breathe', label: 'Breathe', icon: '🌬️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router future={routerFutureConfig}>
        <div style={styles.container}>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '200px 200px',
            opacity: 0.3,
            animation: 'twinkle 4s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: -1
          }} />
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 30% 40%, rgba(138,43,226,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(75,0,130,0.2) 0%, transparent 50%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: -1
          }} />

          <motion.nav style={{...styles.nav, ...(scrolled ? { background: 'rgba(10,10,26,0.8)', backdropFilter: 'blur(20px)' } : {})}} initial={{ y: -100 }} animate={{ y: 0 }}>
            <div style={styles.navContent}>
              <div style={styles.logo} onClick={() => navigateTo('/')}>
                <span style={{ fontSize: '2rem', marginRight: '8px' }}>🧠</span>
                <span style={styles.logoText}>LumaCare</span>
              </div>
              
              <div style={styles.navLinks}>
                {navItems.map((item) => (
                  <NavLink key={item.path} to={item.path} style={({ isActive }) => ({...styles.navItem, ...(isActive ? styles.navItemActive : {})})}>
                    <motion.div style={{display: 'flex', alignItems: 'center', gap: '8px'}} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                      <span>{item.icon}</span>
                      <span style={{display: 'inline'}} className="nav-label">{item.label}</span>
                    </motion.div>
                  </NavLink>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPremium(true)}
                  style={styles.premiumButton}
                >
                  ⭐ Premium
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigateTo('/settings')} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '8px'}}>
                  {user.picture ? (
                    <img src={user.picture} alt="profile" style={styles.profileImage} />
                  ) : (
                    <div style={styles.profilePlaceholder}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.nav>

          {showPremium && (
            <PremiumModal onClose={() => setShowPremium(false)} onUpgrade={handleUpgrade} />
          )}

          <motion.main style={styles.main} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Dashboard navigateTo={navigateTo} userData={userData} />} />
                <Route path="/matrix" element={<PriorityMatrix />} />
                <Route path="/techniques" element={<Techniques navigateTo={navigateTo} startTechnique={startTechnique} />} />
                <Route path="/assistant" element={<AIAssistant startTechnique={startTechnique} />} />
                <Route path="/breathe" element={<BreatheTab technique={currentTechnique} onComplete={handleTechniqueComplete} onBack={handleBack} />} />
                <Route path="/settings" element={<Settings logout={logout} user={user} />} />
              </Routes>
            </AnimatePresence>
          </motion.main>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

// ==================== WRAP WITH PROVIDER ====================
export default function AppWithProvider() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/globals.css';

// ==================== GOOGLE CLIENT ID ====================
const GOOGLE_CLIENT_ID = "253002272888-cg3k451mqesnerv21056utk8u1lk22f6.apps.googleusercontent.com";

// ==================== OPENROUTER API KEY - FROM ENV ====================
const OPENROUTER_KEY = process.env.REACT_APP_OPENROUTER_KEY;

// ==================== OPENROUTER API - STRICT EXTRACTION ====================
const callOpenRouter = async (messages, model = 'z-ai/glm-4.7-flash') => {
  const OPENROUTER_KEY = process.env.REACT_APP_OPENROUTER_KEY;
  
  if (!OPENROUTER_KEY) {
    console.error('❌ OpenRouter API key is missing!');
    return null;
  }

  try {
    console.log('📡 Sending to OpenRouter...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'LumaCare'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
      return null;
    }

    const choice = data.choices?.[0];
    
    // If there's reasoning, extract just the final answer
    if (choice?.message?.reasoning) {
      const reasoning = choice.message.reasoning;
      
      // STRATEGY 1: Look for text after "Final Polish:"
      const finalPolishMatch = reasoning.match(/\*?Final Polish:\*?\s*"?([^"\n]+)"?/i);
      if (finalPolishMatch && finalPolishMatch[1]) {
        return finalPolishMatch[1].trim();
      }
      
      // STRATEGY 2: Look for draft answers and pick the last one
      const draftMatches = reasoning.matchAll(/Draft \d+:\s*([^\n]+)/gi);
      const drafts = Array.from(draftMatches, match => match[1].trim());
      if (drafts.length > 0) {
        return drafts[drafts.length - 1];
      }
      
      // STRATEGY 3: Get the last sentence that looks like speech
      const sentences = reasoning.split('\n').filter(l => l.trim().length > 10);
      for (let i = sentences.length - 1; i >= 0; i--) {
        const line = sentences[i].replace(/\*+/g, '').trim();
        // Skip lines that look like instructions
        if (!line.match(/^(Draft|Step|\d+\.)/i) && line.length > 10) {
          return line;
        }
      }
      
      // STRATEGY 4: If all else fails, use a fallback
      return "I'm here for you. What's on your mind? 💙";
    }
    
    // Standard OpenAI format
    if (choice?.message?.content) {
      return choice.message.content;
    }
    
    return "I'm here to help. What would you like to talk about?";
    
  } catch (error) {
    console.error('❌ Fetch Error:', error);
    return "I'm here for you. Can you tell me more?";
  }
};

const getFallbackResponse = (userMessage, conversationHistory = []) => {
  const lowerMsg = userMessage.toLowerCase();
  
  // Check if this is a greeting
  const greetings = ['hi', 'hello', 'hey', 'yo', 'sup', 'what\'s up', 'howdy'];
  const isGreeting = greetings.some(g => lowerMsg.includes(g));
  
  // Check if we already greeted them recently
  const lastMessages = conversationHistory.slice(-4);
  const alreadyGreeted = lastMessages.some(m => 
    m.role === 'assistant' && m.content.includes('Good to see you')
  );
  
  if (isGreeting && alreadyGreeted) {
    return "Hey again! 👋 What's on your mind today? I'm here to listen.";
  }
  
  if (lowerMsg.includes('check in') || lowerMsg.includes('just saying hi')) {
    return "Thanks for checking in! 👋 How are you feeling right now?";
  }
  
  if (lowerMsg.includes('anxi') || lowerMsg.includes('panic') || lowerMsg.includes('stress')) {
    return "I hear that anxiety. Box breathing helps - inhale 4, hold 4, exhale 4, hold 4. Want to try? 🧘";
  }
  else if (lowerMsg.includes('overwhelm') || lowerMsg.includes('too much')) {
    return "That's a lot. Priority Matrix helps sort urgent vs important. Want me to show you? 📌";
  }
  else if (lowerMsg.includes('negative') || lowerMsg.includes('down') || lowerMsg.includes('bad')) {
    return "Those thoughts are heavy. Cognitive Restructuring can help challenge them. Want to try? 🧠";
  }
  else if (lowerMsg.includes('focus') || lowerMsg.includes('distracted')) {
    return "Focus issues suck. Pomodoro Technique - 25 min work, 5 min break. Want to try? ⏰";
  }
  else if (isGreeting) {
    return "Hey! 👋 Good to see you. How's your day going?";
  }
  else {
    return "I'm here for you. What's on your mind? 💙";
  }
};

// ==================== ENHANCED STYLES ====================
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0b2e 50%, #2d1b4a 100%)',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    color: '#f7fafc',
    position: 'relative',
  },
  nav: {
    position: 'sticky',
    top: '20px',
    zIndex: 100,
    margin: '20px 24px',
    padding: '12px 20px',
    background: 'rgba(10, 10, 26, 0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(159, 122, 234, 0.2)',
    borderRadius: '100px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(159, 122, 234, 0.1)',
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
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: '40px',
    height: '40px',
    background: 'radial-gradient(circle, rgba(159,122,234,0.4) 0%, transparent 70%)',
    borderRadius: '50%',
    left: '-10px',
    top: '-5px',
    filter: 'blur(10px)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #fff, #9f7aea, #4fd1c5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 3s ease infinite',
  },
  navLinks: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  navItem: {
    padding: '10px 20px',
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#cbd5e0',
    textDecoration: 'none',
    cursor: 'pointer',
    minHeight: '44px',
    minWidth: '44px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  navItemActive: {
    color: '#f7fafc',
    background: 'rgba(159, 122, 234, 0.15)',
    border: '1px solid rgba(159, 122, 234, 0.3)',
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
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontSize: '2.8rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #fff, #9f7aea, #4fd1c5)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 3s ease infinite',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#cbd5e0',
    marginBottom: '32px',
    lineHeight: 1.6,
  },
  button: {
    padding: '14px 28px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(159, 122, 234, 0.3)',
  },
  premiumButton: {
    padding: '10px 22px',
    borderRadius: '30px',
    border: 'none',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginRight: '12px',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  input: {
    padding: '14px 18px',
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid transparent',
    borderRadius: '16px',
    color: 'white',
    fontSize: '1rem',
    width: '100%',
    marginBottom: '16px',
    transition: 'all 0.3s ease',
  },
  select: {
    padding: '14px 18px',
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid transparent',
    borderRadius: '16px',
    color: 'white',
    fontSize: '1rem',
    width: '100%',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239f7aea' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 18px center',
  },
  profileImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #9f7aea',
    transition: 'transform 0.3s ease',
  },
  profilePlaceholder: {
    width: '40px',
    height: '40px',
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
    backgroundColor: 'rgba(79, 209, 197, 0.15)',
    color: '#4fd1c5',
    padding: '8px 20px',
    borderRadius: '30px',
    fontSize: '0.95rem',
    fontWeight: 600,
    display: 'inline-block',
    marginBottom: '24px',
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

// ==================== LOADING COMPONENT ====================
const LoadingSpinner = ({ size = 'medium', color = '#9f7aea' }) => {
  const sizes = {
    small: '24px',
    medium: '40px',
    large: '60px'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div className="loading-spinner" style={{ width: sizes[size], height: sizes[size], borderTopColor: color }} />
    </div>
  );
};

const LoadingWave = () => (
  <div className="loading-wave">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
);

// ==================== LOGIN PAGE - WITH LANGUAGE PREFERENCE ====================
const LoginPage = ({ onLogin }) => {
  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const selectedLanguage = localStorage.getItem('preferred_language') || 'en';
    
    const user = {
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      isPremium: false,
      sessionsRemaining: 1,
      lastSessionTime: null,
      premiumExpiry: null,
      language: selectedLanguage,
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
    const selectedLanguage = localStorage.getItem('preferred_language') || 'en';
    
    const guestUser = {
      name: 'Guest User',
      email: 'guest@lumacare.app',
      picture: null,
      isPremium: false,
      sessionsRemaining: 3,
      lastSessionTime: null,
      premiumExpiry: null,
      language: selectedLanguage,
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

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const isMobile = windowWidth <= 768;
  const isSmallMobile = windowWidth <= 480;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0b2e 50%, #2d1b4a 100%)',
        position: 'relative',
        padding: isMobile ? '16px' : '24px',
        overflowY: 'auto',
      }}
    >
      {/* Animated background particles */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 1px, transparent 1px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.6) 1px, transparent 1px)',
        backgroundSize: isMobile ? '100px 100px' : '200px 200px',
        opacity: 0.3,
        animation: 'twinkle 4s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      {/* Interactive glow that follows mouse */}
      <div style={{
        position: 'fixed',
        top: mousePosition.y - 150,
        left: mousePosition.x - 150,
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(159,122,234,0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'all 0.1s ease',
      }} />

      <motion.div 
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '32px',
          maxWidth: '800px',
          width: '100%',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: isMobile ? '40px 24px' : '60px 40px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(159,122,234,0.2)',
        }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div 
          style={{ 
            fontSize: isSmallMobile ? '4rem' : isMobile ? '4.5rem' : '5.5rem', 
            marginBottom: isMobile ? '8px' : '16px',
            filter: 'drop-shadow(0 0 30px #9f7aea)',
          }}
          animate={{ 
            y: [0, -10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🧠
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={styles.badge}
        >
          ⚡ No login required. Start for free.
        </motion.div>
        
        <h1 className="gradient-text" style={{ 
          fontSize: isSmallMobile ? '1.8rem' : isMobile ? '2.2rem' : '3rem',
          marginBottom: isMobile ? '16px' : '24px',
          lineHeight: 1.3,
          fontWeight: 800,
        }}>
          End Task Overwhelm for<br />{isMobile ? 'Freelancers' : 'Freelancers & Remote Workers'}
        </h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ 
            color: '#cbd5e0', 
            marginBottom: isMobile ? '32px' : '40px', 
            fontSize: isMobile ? '1rem' : '1.2rem',
            maxWidth: '600px',
            margin: '0 auto 40px auto',
          }}
        >
          Your daily system for mental clarity and focus
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ 
            display: 'flex', 
            gap: isMobile ? '12px' : '24px', 
            justifyContent: 'center', 
            marginBottom: isMobile ? '24px' : '32px',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          {[
            { icon: '📊', text: 'Dashboard', color: '#9f7aea' },
            { icon: '📌', text: 'Priority Matrix', color: '#4fd1c5' },
            { icon: '🧘', text: 'Techniques', color: '#f687b3' },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4 }}
              style={{ 
                textAlign: 'center',
                flex: isMobile ? '1 0 auto' : 'none',
                minWidth: isMobile ? '80px' : 'auto',
              }}
            >
              <div style={{ 
                fontSize: isMobile ? '1.8rem' : '2.2rem', 
                color: item.color,
                marginBottom: '8px',
                filter: 'drop-shadow(0 0 10px ' + item.color + '80)',
              }}>
                {item.icon}
              </div>
              <div style={{ color: '#cbd5e0', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>{item.text}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ 
            background: 'linear-gradient(135deg, rgba(159,122,234,0.1), rgba(79,209,197,0.1))',
            borderRadius: '20px', 
            padding: isMobile ? '20px' : '24px', 
            marginBottom: isMobile ? '24px' : '32px',
            border: '1px solid rgba(159,122,234,0.3)',
          }}
        >
          <p style={{ color: '#cbd5e0', marginBottom: '12px', fontSize: isMobile ? '0.95rem' : '1.1rem' }}>✨ Free Plan Includes:</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ color: 'white', fontSize: isMobile ? '0.9rem' : '1rem' }}>✓ 1 session every 12 hours</span>
            <span style={{ color: 'white', fontSize: isMobile ? '0.9rem' : '1rem' }}>✓ All techniques</span>
            <span style={{ color: 'white', fontSize: isMobile ? '0.9rem' : '1rem' }}>✓ Progress tracking</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ 
            textAlign: 'left', 
            marginBottom: isMobile ? '32px' : '40px',
            padding: isMobile ? '20px' : '28px',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.3), rgba(159,122,234,0.1))',
            borderRadius: '20px',
            border: '1px solid rgba(159,122,234,0.3)',
          }}
        >
          <h2 style={{ 
            fontSize: isMobile ? '1.6rem' : '2rem', 
            color: '#9f7aea', 
            marginBottom: '16px',
            fontWeight: 700,
          }}>
            For Freelancers Drowning in Task Overwhelm
          </h2>
          <p style={{ 
            color: '#cbd5e0', 
            marginBottom: '16px', 
            lineHeight: 1.8,
            fontSize: isMobile ? '0.95rem' : '1.1rem',
          }}>
            LumaCare is the daily operating system for freelancers and remote workers who are tired of chaos, missed deadlines, and burnout.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
            gap: '16px',
            marginTop: '24px',
          }}>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <span style={{ fontSize: '2rem', color: '#4fd1c5' }}>📌</span>
              <h3 style={{ color: 'white', margin: '8px 0' }}>Priority Matrix</h3>
              <p style={{ color: '#cbd5e0', fontSize: '0.9rem' }}>Drag tasks into Urgent vs. Important. Your brain stops spinning.</p>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <span style={{ fontSize: '2rem', color: '#f687b3' }}>⚡</span>
              <h3 style={{ color: 'white', margin: '8px 0' }}>10-Second Logging</h3>
              <p style={{ color: '#cbd5e0', fontSize: '0.9rem' }}>Track energy and stress without friction.</p>
            </div>
          </div>
        </motion.div>

        {/* Language Preference - Only for new users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          style={{
            marginBottom: '20px',
            textAlign: 'left',
            padding: '16px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(159,122,234,0.2)'
          }}
        >
          <label style={{ color: '#cbd5e0', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>
            🌍 Choose your language
          </label>
          <select
            id="language-select"
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(159,122,234,0.3)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
            onChange={(e) => {
              localStorage.setItem('preferred_language', e.target.value);
            }}
          >
            <option value="en" style={{ background: '#1a0b2e' }}>🇬🇧 English</option>
            <option value="es" style={{ background: '#1a0b2e' }}>🇪🇸 Español</option>
            <option value="fr" style={{ background: '#1a0b2e' }}>🇫🇷 Français</option>
            <option value="de" style={{ background: '#1a0b2e' }}>🇩🇪 Deutsch</option>
            <option value="zh" style={{ background: '#1a0b2e' }}>🇨🇳 中文</option>
            <option value="hi" style={{ background: '#1a0b2e' }}>🇮🇳 हिन्दी</option>
            <option value="ar" style={{ background: '#1a0b2e' }}>🇸🇦 العربية</option>
            <option value="pt" style={{ background: '#1a0b2e' }}>🇧🇷 Português</option>
          </select>
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '8px' }}>
            You can change this anytime in Settings
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ 
            marginBottom: isMobile ? '16px' : '20px',
          }}
        >
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
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02, borderColor: '#9f7aea' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGuestLogin}
          className="btn-outline"
          style={{
            width: '100%',
            padding: isMobile ? '12px' : '14px',
            background: 'transparent',
            border: '2px solid rgba(159, 122, 234, 0.3)',
            borderRadius: '40px',
            color: 'white',
            fontSize: isMobile ? '0.95rem' : '1rem',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: isMobile ? '20px' : '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '48px',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>👤</span>
          <span>Continue as Guest (3 free sessions)</span>
        </motion.button>

        <p style={{ 
          color: 'rgba(255,255,255,0.3)', 
          fontSize: isMobile ? '0.7rem' : '0.8rem',
        }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </motion.div>
  );
};

// ==================== PREMIUM PLANS MODAL - ENHANCED ====================
const PremiumModal = ({ onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayFast = async (plan) => {
    setIsProcessing(true);
    
    if (plan === 'monthly') {
      window.open('https://payf.st/bk8we', '_blank');
    } else {
      window.open('https://payf.st/1frnc', '_blank');
    }
    
    setTimeout(() => {
      setIsProcessing(false);
      if (window.confirm('Did you complete the payment? Click OK to activate your premium features.')) {
        onUpgrade(plan);
        onClose();
      }
    }, 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
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
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        style={{
          ...styles.card,
          maxWidth: '500px',
          width: '90%',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
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

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: '3rem', marginBottom: '16px' }}
          >
            ⭐
          </motion.div>
          <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>Upgrade Your Journey</h2>
          <p style={{ color: '#cbd5e0' }}>Unlock unlimited access and premium features</p>
        </div>

        <div style={{ display: 'grid', gap: '20px', marginBottom: '24px' }}>
          <motion.div
            whileHover={{ scale: 1.02, borderColor: '#9f7aea' }}
            style={{
              padding: '28px',
              background: selectedPlan === 'monthly' 
                ? 'linear-gradient(135deg, rgba(159,122,234,0.2), rgba(79,209,197,0.2))'
                : 'rgba(255,255,255,0.03)',
              borderRadius: '20px',
              border: selectedPlan === 'monthly' 
                ? '2px solid #9f7aea'
                : '1px solid rgba(255,255,255,0.1)',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => setSelectedPlan('monthly')}
          >
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              padding: '6px 20px',
              borderRadius: '30px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
            }}>
              🏆 BEST VALUE
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#9f7aea', fontSize: '1.4rem' }}>Premium Monthly</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
                $9.99<span style={{ fontSize: '1rem', color: '#cbd5e0' }}>/mo</span>
              </div>
            </div>
            
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}>
              {['Unlimited sessions', 'All techniques', 'Priority support', 'Advanced analytics'].map((feature, i) => (
                <li key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#cbd5e0',
                  fontSize: '0.95rem',
                }}>
                  <span style={{ color: '#4fd1c5' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, borderColor: '#4fd1c5' }}
            style={{
              padding: '24px',
              background: selectedPlan === 'session' 
                ? 'linear-gradient(135deg, rgba(79,209,197,0.2), rgba(159,122,234,0.2))'
                : 'rgba(255,255,255,0.03)',
              borderRadius: '20px',
              border: selectedPlan === 'session' 
                ? '2px solid #4fd1c5'
                : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => setSelectedPlan('session')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#4fd1c5', fontSize: '1.3rem' }}>Single Session</h3>
              <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'white' }}>
                $2.99<span style={{ fontSize: '0.9rem', color: '#cbd5e0' }}>/ea</span>
              </div>
            </div>
            
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <li style={{ color: '#cbd5e0' }}>✓ One additional session</li>
              <li style={{ color: '#cbd5e0' }}>✓ All techniques</li>
              <li style={{ color: '#cbd5e0' }}>✓ No expiration</li>
            </ul>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handlePayFast(selectedPlan)}
          disabled={isProcessing}
          className="btn-premium"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1.1rem',
            opacity: isProcessing ? 0.7 : 1,
            cursor: isProcessing ? 'not-allowed' : 'pointer',
          }}
        >
          {isProcessing ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <LoadingSpinner size="small" color="white" />
              <span>Processing...</span>
            </div>
          ) : (
            `Upgrade with ${selectedPlan === 'monthly' ? 'Monthly' : 'Single Session'}`
          )}
        </motion.button>

        <p style={{ 
          color: 'rgba(255,255,255,0.3)', 
          fontSize: '0.8rem', 
          textAlign: 'center',
          marginTop: '20px',
        }}>
          🔒 Secure payment powered by PayFast. All prices in USD.
        </p>
      </motion.div>
    </motion.div>
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

// ==================== DASHBOARD - ENHANCED ====================
const Dashboard = ({ navigateTo, userData }) => {
  const [stressLevel, setStressLevel] = useState(42);
  const [clarityScore, setClarityScore] = useState(68);
  const [greeting, setGreeting] = useState('');
  
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('morning');
    else if (hour < 17) setGreeting('afternoon');
    else setGreeting('evening');
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

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
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
    >

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px', 
        flexWrap: 'wrap', 
        gap: '16px' 
      }}>
        <div>
          <h1 style={styles.title}>
            Good {greeting}, {userData.name.split(' ')[0]}
          </h1>
          <p style={styles.subtitle}>Your mind is clear. Let's keep it that way.</p>
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          style={{ 
            background: 'linear-gradient(135deg, rgba(159, 122, 234, 0.1), rgba(79, 209, 197, 0.1))',
            padding: '12px 24px', 
            borderRadius: '40px',
            border: '1px solid rgba(159, 122, 234, 0.3)',
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🕐</span>
            <span style={{ color: '#cbd5e0' }}>{formatTime()}</span>
          </div>
          {!userData.isPremium && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🎯</span>
              <span style={{ color: userData.sessionsRemaining > 0 ? '#4fd1c5' : '#f87171' }}>
                {userData.sessionsRemaining > 0 ? `${userData.sessionsRemaining} session left` : 'No sessions'}
              </span>
            </div>
          )}
          {userData.isPremium && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>✨</span>
              <span className="badge-premium" style={{ padding: '4px 12px' }}>Premium</span>
            </div>
          )}
        </motion.div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: '24px', 
        marginTop: '32px' 
      }}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{...styles.card, textAlign: 'center', flex: 1}}
        >
          <h3 style={{ color: '#cbd5e0', marginBottom: '24px', fontSize: '1.2rem' }}>Stress Level</h3>
          <div style={{
            width: isMobile ? '200px' : '220px',
            height: isMobile ? '200px' : '220px',
            borderRadius: '50%',
            margin: '0 auto',
            background: `conic-gradient(#9f7aea 0deg ${stressLevel * 3.6}deg, rgba(159, 122, 234, 0.1) ${stressLevel * 3.6}deg 360deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(159, 122, 234, 0.3)',
          }}>
            <div style={{
              width: isMobile ? '160px' : '180px',
              height: isMobile ? '160px' : '180px',
              borderRadius: '50%',
              background: '#1a0b2e',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 5px 15px rgba(0,0,0,0.3)',
            }}>
              <span style={{ fontSize: isMobile ? '2.5rem' : '3rem', fontWeight: 'bold' }}>{stressLevel}%</span>
              <span style={{ color: '#cbd5e0', fontSize: '1rem' }}>
                {stressLevel < 30 ? '✨ low' : stressLevel < 60 ? '⚖️ moderate' : '⚠️ high'}
              </span>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: '24px', width: '80%', margin: '24px auto 0' }}>
            <div className="progress-fill" style={{ width: `${100 - stressLevel}%` }} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{...styles.card, textAlign: 'center', flex: 1}}
        >
          <h3 style={{ color: '#cbd5e0', marginBottom: '24px', fontSize: '1.2rem' }}>Task Clarity</h3>
          <div style={{
            width: isMobile ? '200px' : '220px',
            height: isMobile ? '200px' : '220px',
            borderRadius: '50%',
            margin: '0 auto',
            background: `conic-gradient(#4fd1c5 0deg ${clarityScore * 3.6}deg, rgba(79, 209, 197, 0.1) ${clarityScore * 3.6}deg 360deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(79, 209, 197, 0.3)',
          }}>
            <div style={{
              width: isMobile ? '160px' : '180px',
              height: isMobile ? '160px' : '180px',
              borderRadius: '50%',
              background: '#1a0b2e',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 5px 15px rgba(0,0,0,0.3)',
            }}>
              <span style={{ fontSize: isMobile ? '2.5rem' : '3rem', fontWeight: 'bold' }}>{clarityScore}%</span>
              <span style={{ color: '#cbd5e0', fontSize: '1rem' }}>
                {clarityScore < 40 ? '🌫️ unclear' : clarityScore < 70 ? '📊 moderate' : '☀️ clear'}
              </span>
            </div>
          </div>
          <div className="progress-bar" style={{ marginTop: '24px', width: '80%', margin: '24px auto 0' }}>
            <div className="progress-fill" style={{ width: `${clarityScore}%` }} />
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{...styles.card, marginTop: '24px'}}
      >
        <h3 style={{ fontSize: '1.4rem', marginBottom: '24px', color: '#9f7aea' }}>Weekly Progress</h3>
        
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#9f7aea', borderRadius: '3px' }}></div>
            <span style={{ color: '#cbd5e0' }}>Mood Score</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: '#4fd1c5', borderRadius: '3px' }}></div>
            <span style={{ color: '#cbd5e0' }}>Sessions</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? '16px' : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '8px', minWidth: '30px' }}>
            <span style={{ color: '#cbd5e0', fontSize: '0.8rem' }}>100</span>
            <span style={{ color: '#cbd5e0', fontSize: '0.8rem' }}>75</span>
            <span style={{ color: '#cbd5e0', fontSize: '0.8rem' }}>50</span>
            <span style={{ color: '#cbd5e0', fontSize: '0.8rem' }}>25</span>
            <span style={{ color: '#cbd5e0', fontSize: '0.8rem' }}>0</span>
          </div>

          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', minWidth: isMobile ? '500px' : 'auto' }}>
            {userData.stats.weeklyData.map((data, i) => (
              <motion.div 
                key={i} 
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                transition={{ delay: 0.4 + i * 0.05 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px' }}
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${data.mood}px` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                  style={{
                    width: '20px',
                    background: 'linear-gradient(135deg, #9f7aea, #b794f4)',
                    borderRadius: '10px 10px 0 0',
                    marginBottom: '4px',
                    boxShadow: '0 0 15px #9f7aea80',
                  }}
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(data.sessions * 15, 150)}px` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                  style={{
                    width: '20px',
                    background: 'linear-gradient(135deg, #4fd1c5, #76e4d7)',
                    borderRadius: '10px 10px 0 0',
                    transition: 'height 0.3s ease',
                    boxShadow: '0 0 15px #4fd1c580',
                  }}
                />
                <span style={{ color: '#cbd5e0', fontSize: '0.8rem', marginTop: '8px' }}>{data.day}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: '16px', 
        marginTop: '24px' 
      }}>
        {[
          { icon: '🤖', label: 'AI Sessions', value: userData.stats.aiSessions, color: '#9f7aea' },
          { icon: '🌬️', label: 'Breathing', value: userData.stats.breathing, color: '#4fd1c5' },
          { icon: '🆘', label: 'SOS Used', value: userData.stats.sosUsed, color: '#f87171' },
          { icon: '📝', label: 'Journal', value: userData.stats.journal, color: '#fbbf24' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -4, scale: 1.02 }}
            style={{...styles.card, textAlign: 'center', padding: '24px 16px'}}
          >
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ fontSize: '2.5rem', marginBottom: '8px' }}
            >
              {stat.icon}
            </motion.div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            <div style={{ color: '#cbd5e0', fontSize: '0.9rem' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ==================== AI ASSISTANT - FIXED CHAT LAYOUT ====================
const AIAssistant = ({ startTechnique }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "👋 Hey there! I'm Luma, your wellness buddy. I'm here to chat, listen, or just hang out. No pressure, no judgment. How you doing today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const getAIResponse = async (userMessage) => {
    setIsTyping(true);
    try {
      const allMessages = [
        {
          role: 'system',
          content: `You are LumaAI, a warm, friendly wellness assistant for LumaCare. 

RULES:
1. Remember the ENTIRE conversation history
2. Be warm and conversational - use emojis occasionally 😊
3. If they mention struggles, recommend techniques naturally
4. Keep responses 2-4 sentences

TECHNIQUES:
- Anxiety/panic: Box breathing
- Overwhelm: Priority Matrix
- Negative thoughts: Cognitive Restructuring
- Focus issues: Pomodoro Technique
- Panic/disconnection: 5-4-3-2-1 Grounding`
        },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      let aiResponse = await callOpenRouter(allMessages, 'z-ai/glm-4.7-flash');
      
      if (!aiResponse) {
        console.log('⚠️ Using fallback response');
        aiResponse = getFallbackResponse(userMessage, conversationHistory);
      }
      
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      ]);
      
      return aiResponse;
    } catch (error) {
      console.error('❌ Error:', error);
      return getFallbackResponse(userMessage, conversationHistory);
    } finally {
      setIsTyping(false);
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
    { emoji: '😊', text: 'Just checking in', query: 'Just wanted to check in and say hi', color: '#9f7aea' },
    { emoji: '😰', text: 'Feeling anxious', query: 'I\'ve been feeling really anxious lately', color: '#f87171' },
    { emoji: '😔', text: 'A bit down', query: 'I\'m feeling a bit down today', color: '#60a5fa' },
    { emoji: '😤', text: 'Overwhelmed', query: 'Everything feels overwhelming right now', color: '#fbbf24' },
    { emoji: '😴', text: 'Tired', query: 'I\'m exhausted but can\'t relax', color: '#a78bfa' },
    { emoji: '🧠', text: 'Can\'t stop thinking', query: 'My mind won\'t stop racing', color: '#f472b6' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{ height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px', flexShrink: 0 }}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: '3rem' }}
        >
          🤖
        </motion.div>
        <div>
          <h1 style={styles.title}>AI Wellness Assistant</h1>
          <p style={styles.subtitle}>Here to listen and help 💙</p>
        </div>
      </div>

      <div style={{...styles.card, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
        {/* Messages area - fills available space, scrolls when needed */}
        <div
  id="chat-messages-container"
  style={{
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }}
>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                }}>
                  🤖
                </div>
              )}
              <div style={{
                maxWidth: '70%',
                padding: '14px 20px',
                borderRadius: msg.role === 'user' 
                  ? '20px 20px 4px 20px' 
                  : '20px 20px 20px 4px',
                background: msg.role === 'user' 
                  ? 'linear-gradient(135deg, #9f7aea, #4fd1c5)'
                  : 'rgba(255,255,255,0.1)',
                color: 'white',
                lineHeight: '1.6',
                fontSize: '1rem',
              }}>
                {msg.content}
                {msg.technique && (
                  <div style={{ marginTop: '12px' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startTechnique(msg.technique)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
                        border: 'none',
                        borderRadius: '20px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        width: '100%'
                      }}
                    >
                      Try this technique →
                    </motion.button>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4fd1c5, #9f7aea)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  flexShrink: 0,
                }}>
                  👤
                </div>
              )}
            </motion.div>
          ))}
          {(isLoading || isTyping) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px' }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem'
              }}>
                🤖
              </div>
              <div style={{
                padding: '14px 20px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.1)',
              }}>
                <LoadingWave />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input area - fixed at bottom */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '20px',
          background: 'rgba(0,0,0,0.2)',
          flexShrink: 0
        }}>
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
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setInput(item.query);
                  setTimeout(() => handleSend(), 100);
                }}
                style={{
                  padding: '10px 18px',
                  background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                  border: `1px solid ${item.color}40`,
                  borderRadius: '30px',
                  color: 'white',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
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
              placeholder="Type your message..."
              disabled={isLoading}
              style={{
                ...styles.input,
                marginBottom: 0,
                borderRadius: '30px',
                flex: 1
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ➤
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== COGNITIVE CHATBOT - COMPLETE WORKING VERSION ====================
const CognitiveChatbot = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  const [sessionData, setSessionData] = useState({
    situation: '',
    automaticThought: '',
    feelings: '',
    evidenceFor: [],
    evidenceAgainst: [],
    alternatives: [],
    balancedThought: ''
  });

  const questions = [
    {
      id: 'situation',
      prompt: "What's on your mind? What situation or thought is bothering you?",
      field: 'situation',
      type: 'single'
    },
    {
      id: 'feelings',
      prompt: "What feelings or emotions come up with this?",
      field: 'feelings',
      type: 'single'
    },
    {
      id: 'evidenceFor',
      prompt: "What evidence supports this thought? What makes it feel true? (Type one thing at a time, type 'done' when finished)",
      field: 'evidenceFor',
      type: 'array'
    },
    {
      id: 'evidenceAgainst',
      prompt: "What evidence might challenge this thought? Is there anything that doesn't support it? (Type one thing at a time, type 'done' when finished)",
      field: 'evidenceAgainst',
      type: 'array'
    },
    {
      id: 'alternatives',
      prompt: "If a friend had this thought, what would you tell them? Are there other ways to see this? (Type one thing at a time, type 'done' when finished)",
      field: 'alternatives',
      type: 'array'
    },
    {
      id: 'balanced',
      prompt: "Based on everything we've discussed, what's a more balanced, kinder way to think about this?",
      field: 'balancedThought',
      type: 'single'
    }
  ];

  const getAIResponse = async (userMessage, currentStep) => {
    try {
      let systemPrompt = '';
      
      if (currentStep === 0) {
        systemPrompt = "You are guiding someone through Cognitive Restructuring. They just shared their initial thought. Respond warmly and ask gentle follow-up questions to understand them better. Keep it to 1-2 sentences.";
      } 
      else if (currentStep === 1) {
        systemPrompt = "They shared evidence for their thought. Now ask what evidence might contradict it. Be gentle. Keep it to 1-2 sentences.";
      }
      else if (currentStep === 2) {
        systemPrompt = "They shared evidence against. Now ask for alternative perspectives. Keep it to 1-2 sentences.";
      }
      else if (currentStep === 3) {
        systemPrompt = "They shared alternatives. Now ask for a more balanced thought. Keep it to 1-2 sentences.";
      }
      else if (currentStep === 4) {
        systemPrompt = "Acknowledge their work and tell them you'll show a summary. Keep it warm.";
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      let aiResponse = await callOpenRouter(messages, 'z-ai/glm-4.7-flash');
      
      if (!aiResponse) {
        const fallbacks = [
          "I really want to understand. Can you tell me more? 🧠",
          "Take your time. What else comes up? 💭",
          "That's helpful. Is there anything more? 🌱",
          "I'm here with you. Continue sharing? 🤗",
        ];
        aiResponse = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
      
      return aiResponse;
    } catch (error) {
      console.error('AI Error:', error);
      return "I'm here with you. Want to continue? 🌱";
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    setMessages([{ 
      role: 'assistant', 
      content: "Hi there. I'm here to help you work through some thoughts. No rush, no pressure. Let's start with the first question:\n\n" + questions[0].prompt 
    }]);
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userResponse = input.trim();
    const currentQuestion = questions[step];

    setMessages(prev => [...prev, { role: 'user', content: userResponse }]);
    setInput('');
    setIsProcessing(true);

    if (currentQuestion.type === 'array') {
      if (userResponse.toLowerCase() === 'done') {
        if (step < questions.length - 1) {
          setStep(step + 1);
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: questions[step + 1].prompt 
            }]);
            setIsProcessing(false);
          }, 500);
        } else {
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: "Thank you for sharing. Here's your summary..." 
            }]);
            setTimeout(() => {
              onComplete(sessionData);
            }, 1500);
          }, 500);
        }
      } else {
        setSessionData(prev => ({
          ...prev,
          [currentQuestion.field]: [...(prev[currentQuestion.field] || []), userResponse]
        }));

        const aiResponse = await getAIResponse(userResponse, step);
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: aiResponse + " (Type 'done' when finished)" 
        }]);
        setIsProcessing(false);
      }
    } 
    else {
      setSessionData(prev => ({
        ...prev,
        [currentQuestion.field]: userResponse
      }));

      if (step < questions.length - 1) {
        setStep(step + 1);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: questions[step + 1].prompt 
          }]);
          setIsProcessing(false);
        }, 500);
      } else {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "Thank you for sharing. Here's your summary..." 
          }]);
          setTimeout(() => {
            onComplete(sessionData);
          }, 1500);
        }, 500);
      }
    }
  };

  if (!sessionStarted) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '20px', textAlign: 'center' }}
      >
        <motion.button
          whileHover={{ x: -4 }}
          onClick={onBack}
          style={{
            ...styles.button,
            marginBottom: '30px',
            padding: '8px 16px',
            background: 'transparent',
            border: '2px solid #f687b3',
            color: '#f687b3',
            width: 'auto'
          }}
        >
          ← Back to Techniques
        </motion.button>

        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ fontSize: '5rem', marginBottom: '20px' }}
        >
          🧠
        </motion.div>
        
        <h2 style={{ 
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #fff, #f687b3, #4fd1c5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '16px'
        }}>
          Cognitive Restructuring
        </h2>
        
        <p style={{ color: '#cbd5e0', fontSize: '1.1rem', marginBottom: '30px', maxWidth: '500px', margin: '0 auto 30px' }}>
          A gentle way to examine and reshape negative thoughts. No pressure, no judgment - just understanding.
        </p>
        
        <div style={{ 
          background: 'rgba(246,135,179,0.1)', 
          borderRadius: '16px', 
          padding: '24px',
          marginBottom: '30px',
          maxWidth: '400px',
          margin: '0 auto 30px',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#f687b3', marginBottom: '12px' }}>✨ In this session:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ color: 'white', marginBottom: '8px' }}>✓ Identify the situation</li>
            <li style={{ color: 'white', marginBottom: '8px' }}>✓ Explore feelings</li>
            <li style={{ color: 'white', marginBottom: '8px' }}>✓ Find evidence for & against</li>
            <li style={{ color: 'white', marginBottom: '8px' }}>✓ Consider alternatives</li>
            <li style={{ color: 'white' }}>✓ Create balanced thought</li>
          </ul>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startSession}
          style={{
            padding: '16px 40px',
            background: 'linear-gradient(135deg, #f687b3, #4fd1c5)',
            border: 'none',
            borderRadius: '40px',
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(246,135,179,0.3)'
          }}
        >
          Start Your Session →
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      style={{ padding: '20px' }}
    >
      <motion.button
        whileHover={{ x: -4 }}
        onClick={onBack}
        style={{
          ...styles.button,
          marginBottom: '20px',
          padding: '8px 16px',
          background: 'transparent',
          border: '2px solid #f687b3',
          color: '#f687b3',
          width: 'auto'
        }}
      >
        ← Exit Session
      </motion.button>

      <div style={{ ...styles.card, minHeight: '550px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px', padding: '0 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#f687b3' }}>
            <span>Session Progress</span>
            <span>{step + 1} of {questions.length}</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #f687b3, #4fd1c5)', width: `${((step + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%',
                padding: '12px 18px',
                borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: msg.role === 'user' ? 'linear-gradient(135deg, #f687b3, #4fd1c5)' : 'rgba(255,255,255,0.1)',
                color: 'white',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isProcessing && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '12px 18px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px' }}>
                <LoadingWave />
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', padding: '0 10px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={questions[step]?.type === 'array' ? "Type your answer... (type 'done' when finished)" : "Type your response..."}
            disabled={isProcessing}
            style={{
              ...styles.input,
              marginBottom: 0,
              borderRadius: '30px',
              flex: 1,
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(246,135,179,0.3)',
              color: 'white',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(246,135,179,0.3)'
            }}
          >
            ➤
          </motion.button>
        </div>

        {questions[step]?.type === 'array' && (
          <p style={{ marginTop: '10px', color: '#f687b3', fontSize: '0.85rem', textAlign: 'center', padding: '8px', background: 'rgba(246,135,179,0.1)', borderRadius: '8px' }}>
            💡 You can add multiple items. Type 'done' when you're finished with this section.
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ==================== BREATHING TECHNIQUE - ENHANCED ====================
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }} style={{ fontSize: '4rem', marginBottom: '24px' }}>✨</motion.div>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '16px' }}>Session Complete!</h2>
        <p style={{ color: '#cbd5e0', marginBottom: '32px', fontSize: '1.2rem' }}>You completed {cycles} cycles of {technique.name}.</p>
        
        <div style={{...styles.card, marginBottom: '24px', textAlign: 'left'}}>
          <h3 style={{ color: technique.color, marginBottom: '16px' }}>How do you feel?</h3>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#cbd5e0', marginBottom: '12px' }}>Rate your experience (1-5):</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {[1,2,3,4,5].map(n => (
                <motion.button key={n} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(159,122,234,0.1)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>{n}</motion.button>
              ))}
            </div>
          </div>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How did this technique help you?" className="input" style={{ minHeight: '100px', width: '100%' }} />
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={handleComplete} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>Save & Continue</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={onBack} className="btn-outline" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>Back</motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
      <motion.button whileHover={{ x: -4 }} onClick={onBack} className="btn-outline" style={{ marginBottom: '20px', padding: '8px 16px' }}>← Back</motion.button>
      <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{technique.name}</h1>
      <p style={{ color: technique.color, fontSize: '1.2rem', marginBottom: '24px' }}>Pattern: {technique.pattern}</p>

      <div style={{...styles.card, marginBottom: '24px', background: technique.color + '10', textAlign: 'left'}}>
        <h3 style={{ color: technique.color, marginBottom: '8px' }}>When to Use</h3>
        <p style={{ color: '#cbd5e0', lineHeight: 1.6 }}>{technique.whenToUse}</p>
      </div>

      {!isActive ? (
        <div style={styles.card}>
          <h3 style={{ color: technique.color, marginBottom: '20px', fontSize: '1.3rem' }}>Set Your Session</h3>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#cbd5e0', marginBottom: '8px' }}>Number of cycles ({technique.minCycles}-{technique.maxCycles}):</label>
            <input type="range" min={technique.minCycles} max={technique.maxCycles} value={cycles} onChange={(e) => setCycles(parseInt(e.target.value))} style={{ width: '100%', height: '6px', background: `linear-gradient(90deg, ${technique.color} 0%, ${technique.color} ${(cycles - technique.minCycles) / (technique.maxCycles - technique.minCycles) * 100}%, rgba(255,255,255,0.1) ${(cycles - technique.minCycles) / (technique.maxCycles - technique.minCycles) * 100}%)`, borderRadius: '3px', outline: 'none', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#cbd5e0' }}>
              <span>{technique.minCycles}</span>
              <span style={{ color: technique.color, fontWeight: 'bold', fontSize: '1.2rem' }}>{cycles}</span>
              <span>{technique.maxCycles}</span>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleStart} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>Begin Session</motion.button>
        </div>
      ) : (
        <>
          <motion.div style={{ width: '300px', height: '300px', borderRadius: '50%', margin: '20px auto', background: `radial-gradient(circle at 30% 30%, ${technique.color}, #1a0b2e)`, boxShadow: `0 0 60px ${technique.color}80`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }} animate={{ scale: phase === 'inhale' || phase === 'hold1' ? 1.8 : 1, rotate: [0, 5, -5, 0] }} transition={{ duration: phase === 'inhale' ? technique.inhale : phase === 'hold1' ? technique.hold1 : phase === 'exhale' ? technique.exhale : technique.hold2, rotate: { duration: 4, repeat: Infinity } }}>
            <div style={{ color: 'white', textShadow: '0 2px 10px black', zIndex: 2 }}>
              <motion.h2 key={phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '2rem', marginBottom: '8px' }}>{phase === 'inhale' ? '🌬️ Inhale' : phase === 'hold1' ? '⏸️ Hold' : phase === 'exhale' ? '💨 Exhale' : '⏸️ Hold'}</motion.h2>
              <motion.p key={count} initial={{ scale: 0.5 }} animate={{ scale: 1 }} style={{ fontSize: '3rem', fontWeight: 'bold' }}>{count}s</motion.p>
            </div>
          </motion.div>
          <div style={{ marginTop: '24px' }}>
            <p style={{ color: technique.color, fontSize: '1.2rem' }}>Cycle {currentCycle} of {cycles}</p>
            <div className="progress-bar" style={{ width: '200px', margin: '16px auto' }}><div className="progress-fill" style={{ width: `${(currentCycle / cycles) * 100}%` }} /></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsActive(false)} style={{ background: 'rgba(239,68,68,0.2)', border: '2px solid #ef4444', color: 'white', padding: '12px 32px', borderRadius: '50px', fontSize: '1.1rem', cursor: 'pointer' }}>⏸️ Pause</motion.button>
          </div>
        </>
      )}
    </motion.div>
  );
};

// ==================== GROUNDING TECHNIQUE - ENHANCED ====================
const GroundingTechnique = ({ technique, onComplete, onBack }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [items, setItems] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const groundingSteps = [
    { prompt: "👁️ Name 5 things you can see around you:", count: 5, placeholder: "Enter 5 things separated by commas", icon: "👁️" },
    { prompt: "✋ Identify 4 things you can touch or feel:", count: 4, placeholder: "Enter 4 things separated by commas", icon: "✋" },
    { prompt: "👂 Acknowledge 3 things you can hear:", count: 3, placeholder: "Enter 3 things separated by commas", icon: "👂" },
    { prompt: "👃 Notice 2 things you can smell:", count: 2, placeholder: "Enter 2 things separated by commas", icon: "👃" },
    { prompt: "👅 Recognize 1 thing you can taste:", count: 1, placeholder: "Enter 1 thing", icon: "👅" }
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
    if (step < groundingSteps.length - 1) setStep(step + 1);
    else setCompleted(true);
  };

  const handleComplete = () => {
    onComplete(technique.id, rating, feedback);
  };

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }} style={{ fontSize: '4rem', marginBottom: '24px' }}>🌱</motion.div>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '16px' }}>Grounding Complete</h2>
        <p style={{ color: '#cbd5e0', marginBottom: '32px', fontSize: '1.2rem' }}>You've anchored yourself in the present moment.</p>
        <div style={{...styles.card, marginBottom: '24px', textAlign: 'left'}}>
          <h3 style={{ color: technique.color, marginBottom: '20px', fontSize: '1.4rem' }}>Your grounding moments:</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {answers.map((ans, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                <p style={{ color: technique.color, fontWeight: 'bold', marginBottom: '8px' }}>{ans.prompt}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ans.items.map((item, j) => <span key={j} style={{ padding: '4px 12px', background: `${technique.color}20`, borderRadius: '20px', color: 'white', fontSize: '0.9rem', border: `1px solid ${technique.color}40` }}>{item}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div style={{...styles.card, marginBottom: '24px', textAlign: 'left'}}>
          <h3 style={{ color: technique.color, marginBottom: '16px' }}>How do you feel?</h3>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#cbd5e0', marginBottom: '12px' }}>Rate your experience (1-5):</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {[1,2,3,4,5].map(n => <motion.button key={n} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(159,122,234,0.1)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>{n}</motion.button>)}
            </div>
          </div>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel after grounding yourself?" className="input" style={{ minHeight: '100px', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={handleComplete} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>Complete</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={onBack} className="btn-outline" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>Back</motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.button whileHover={{ x: -4 }} onClick={onBack} className="btn-outline" style={{ marginBottom: '20px', padding: '8px 16px' }}>← Back</motion.button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '2.5rem' }}>{groundingSteps[step].icon}</motion.div>
        <div><h1 style={styles.title}>{technique.name}</h1><p style={{ color: technique.color, fontSize: '1.1rem' }}>Step {step + 1} of {groundingSteps.length}</p></div>
      </div>
      <div style={styles.card}>
        <h3 style={{ color: technique.color, marginBottom: '20px', fontSize: '1.3rem' }}>{groundingSteps[step].prompt}</h3>
        <div style={{ marginBottom: '20px', minHeight: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '16px' }}>
          {items.length > 0 ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{items.map((item, i) => <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ padding: '6px 14px', background: `${technique.color}20`, borderRadius: '20px', color: 'white', fontSize: '0.95rem', border: `1px solid ${technique.color}40` }}>{item}</motion.span>)}</div> : <p style={{ color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', textAlign: 'center' }}>No items listed yet. Add some below.</p>}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: technique.color }}>Progress</span><span style={{ color: 'white' }}>{items.length} / {groundingSteps[step].count}</span></div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${(items.length / groundingSteps[step].count) * 100}%` }} /></div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input value={currentInput} onChange={(e) => setCurrentInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddItem()} placeholder={groundingSteps[step].placeholder} className="input" style={{ flex: 1, marginBottom: 0 }} />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddItem} className="btn-primary" style={{ padding: '14px 24px' }}>Add</motion.button>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext} disabled={items.length < groundingSteps[step].count} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', opacity: items.length < groundingSteps[step].count ? 0.5 : 1, cursor: items.length < groundingSteps[step].count ? 'not-allowed' : 'pointer' }}>{step < groundingSteps.length - 1 ? 'Next Step →' : 'Complete Grounding'}</motion.button>
      </div>
    </motion.div>
  );
};

// ==================== POMODORO TECHNIQUE - ENHANCED ====================
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }} style={{ fontSize: '4rem', marginBottom: '24px' }}>🎉</motion.div>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '16px' }}>Great Work!</h2>
        <p style={{ color: '#cbd5e0', marginBottom: '32px', fontSize: '1.2rem' }}>You completed 4 Pomodoro cycles on: <strong style={{ color: technique.color }}>{task || customTask}</strong></p>
        <div style={{...styles.card, marginBottom: '24px', textAlign: 'left'}}>
          <h3 style={{ color: technique.color, marginBottom: '16px' }}>How was your focus session?</h3>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: '#cbd5e0', marginBottom: '12px' }}>Rate your focus (1-5):</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {[1,2,3,4,5].map(n => <motion.button key={n} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : 'rgba(159,122,234,0.1)', border: `2px solid ${technique.color}`, color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>{n}</motion.button>)}
            </div>
          </div>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How productive were you? Share your experience..." className="input" style={{ minHeight: '100px', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={handleComplete} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>Complete</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={onBack} className="btn-outline" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>Back</motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.button whileHover={{ x: -4 }} onClick={onBack} className="btn-outline" style={{ marginBottom: '20px', padding: '8px 16px' }}>← Back</motion.button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ fontSize: '2.5rem' }}>⏰</motion.div>
        <div><h1 style={styles.title}>{technique.name}</h1><p style={{ color: technique.color, fontSize: '1.1rem' }}>Cycle {cycle} of 4 • {phase === 'work' ? '🔨 Focus' : phase === 'break' ? '☕ Break' : '🎉 Long Break'}</p></div>
      </div>
      <div style={styles.card}>
        {!isActive ? (
          <>
            <h3 style={{ color: technique.color, marginBottom: '20px', fontSize: '1.3rem' }}>Step 1: Choose your task</h3>
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="select" style={{ marginBottom: '16px' }}>
              <option value="work">💼 Work</option><option value="school">📚 School work</option><option value="project">🚀 Project</option><option value="other">✨ Other</option>
            </select>
            {taskType === 'other' ? <input type="text" value={customTask} onChange={(e) => setCustomTask(e.target.value)} placeholder="Describe your task" className="input" style={{ marginBottom: '24px' }} /> : <input type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder={`Enter your ${taskType} task`} className="input" style={{ marginBottom: '24px' }} />}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleStart} className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>Start Timer</motion.button>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <motion.div key={time} initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ fontSize: '4rem', fontWeight: 'bold', color: technique.color, textShadow: `0 0 20px ${technique.color}80`, marginBottom: '16px' }}>{formatTime(time)}</motion.div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ color: technique.color }}>Progress</span><span style={{ color: 'white' }}>{phase === 'work' ? '25 min' : phase === 'break' ? '5 min' : '15 min'}</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(phase === 'work' ? (25*60 - time) / (25*60) : phase === 'break' ? (5*60 - time) / (5*60) : (15*60 - time) / (15*60)) * 100}%` }} /></div>
              </div>
              <p style={{ color: '#cbd5e0', fontSize: '1.1rem', marginBottom: '24px' }}>Working on: <strong style={{ color: 'white' }}>{task || customTask}</strong></p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsActive(false)} style={{ background: 'rgba(239,68,68,0.2)', border: '2px solid #ef4444', color: 'white', padding: '12px 32px', borderRadius: '50px', fontSize: '1.1rem', cursor: 'pointer' }}>⏸️ Pause</motion.button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// ==================== PRIORITY MATRIX - ENHANCED ====================
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
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

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

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = (id) => {
    if (editText.trim()) {
      setTasks(tasks.map(t => t.id === id ? { ...t, text: editText } : t));
    }
    setEditingId(null);
    setEditText('');
  };

  const quadrants = [
    { id: 'urgent-important', title: 'Urgent & Important', subtitle: 'Do now', color: '#ef4444', icon: '⚡' },
    { id: 'important-not-urgent', title: 'Important, Not Urgent', subtitle: 'Schedule', color: '#10b981', icon: '📅' },
    { id: 'urgent-not-important', title: 'Urgent, Not Important', subtitle: 'Delegate', color: '#f59e0b', icon: '🤝' },
    { id: 'neither', title: 'Neither', subtitle: 'Eliminate', color: '#6b7280', icon: '🗑️' },
  ];

  const getTasksByQuadrant = (quadrantId) => {
    return tasks.filter(t => t.quadrant === quadrantId);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 style={styles.title}>Priority Matrix</h1>
      <p style={styles.subtitle}>Sort tasks by urgency and importance.</p>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{...styles.card, marginBottom: '24px'}}>
        <h3 style={{ color: '#9f7aea', marginBottom: '16px' }}>Add New Task</h3>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
          <input value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask()} placeholder="Enter a new task..." className="input" style={{ flex: 1, marginBottom: isMobile ? '0' : '0' }} />
          <select value={selectedQuadrant} onChange={(e) => setSelectedQuadrant(e.target.value)} className="select" style={{ width: isMobile ? '100%' : '200px', marginBottom: isMobile ? '0' : '0' }}>
            {quadrants.map(q => <option key={q.id} value={q.id} style={{ background: '#1a0b2e', color: 'white' }}>{q.icon} {q.title}</option>)}
          </select>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addTask} className="btn-primary" style={{ width: isMobile ? '100%' : 'auto', padding: '14px 28px' }}>Add Task</motion.button>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
        {quadrants.map((q, index) => {
          const quadrantTasks = getTasksByQuadrant(q.id);
          const completionRate = quadrantTasks.length > 0 ? Math.round((quadrantTasks.filter(t => t.completed).length / quadrantTasks.length) * 100) : 0;
          return (
            <motion.div key={q.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} style={{ ...styles.card, padding: isMobile ? '16px' : '20px', borderColor: `${q.color}40`, background: `linear-gradient(135deg, ${q.color}10, rgba(0,0,0,0.2))` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ color: q.color, fontSize: isMobile ? '1.1rem' : '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}><span>{q.icon}</span>{q.title}</h3>
                  <p style={{ color: '#cbd5e0', fontSize: '0.85rem' }}>{q.subtitle}</p>
                </div>
                {quadrantTasks.length > 0 && <div style={{ textAlign: 'right' }}><span style={{ color: q.color, fontSize: '1.2rem', fontWeight: 'bold' }}>{quadrantTasks.length}</span><span style={{ color: '#cbd5e0', fontSize: '0.8rem' }}> tasks</span></div>}
              </div>
              {quadrantTasks.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}><span style={{ color: '#cbd5e0' }}>Progress</span><span style={{ color: q.color }}>{completionRate}%</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${completionRate}%`, background: q.color }} /></div>
                </div>
              )}
              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '8px' }}>
                {quadrantTasks.map(task => (
                  <motion.div key={task.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '8px', border: editingId === task.id ? `2px solid ${q.color}` : '1px solid rgba(255,255,255,0.05)' }}>
                    <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => toggleTask(task.id)} style={{ width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${task.completed ? q.color : 'rgba(255,255,255,0.2)'}`, background: task.completed ? q.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>{task.completed && '✓'}</motion.span>
                    {editingId === task.id ? <input value={editText} onChange={(e) => setEditText(e.target.value)} onBlur={() => saveEdit(task.id)} onKeyPress={(e) => e.key === 'Enter' && saveEdit(task.id)} className="input" style={{ flex: 1, padding: '6px 10px', marginBottom: 0 }} autoFocus /> : <span onClick={() => startEdit(task)} style={{ flex: 1, color: task.completed ? 'rgba(255,255,255,0.5)' : 'white', textDecoration: task.completed ? 'line-through' : 'none', cursor: 'pointer', fontSize: isMobile ? '0.9rem' : '0.95rem', wordBreak: 'break-word' }}>{task.text}</span>}
                    <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteTask(task.id)} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '18px', flexShrink: 0, padding: '4px' }}>✕</motion.span>
                  </motion.div>
                ))}
              </div>
              {quadrantTasks.length === 0 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80px', color: 'rgba(255,255,255,0.3)', border: `2px dashed ${q.color}40`, borderRadius: '12px', fontSize: '0.9rem' }}>Drop tasks here</div>}
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ ...styles.card, marginTop: '24px', background: 'linear-gradient(135deg, rgba(159,122,234,0.1), rgba(79,209,197,0.1))', textAlign: 'center' }}>
        <h3 style={{ color: '#9f7aea', marginBottom: '8px' }}>✨ Quick Tips</h3>
        <p style={{ color: '#cbd5e0', fontSize: '0.95rem' }}>Focus on Quadrant 2 (Important, Not Urgent) for long-term success. These tasks prevent crises before they happen.</p>
      </motion.div>
    </motion.div>
  );
};

// ==================== TECHNIQUES LIST - ENHANCED ====================
const Techniques = ({ navigateTo, startTechnique }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All Techniques', icon: '✨', color: '#9f7aea' },
    { id: 'breathing', name: 'Breathing', icon: '🌬️', color: '#9f7aea' },
    { id: 'cognitive', name: 'Cognitive', icon: '🧠', color: '#f687b3' },
    { id: 'grounding', name: 'Grounding', icon: '🌱', color: '#f87171' },
    { id: 'pomodoro', name: 'Focus', icon: '⏰', color: '#f97316' },
  ];

  const filteredTechniques = selectedCategory === 'all' ? Object.values(techniquesData) : Object.values(techniquesData).filter(t => t.type === selectedCategory);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ fontSize: '3rem' }}>🧘</motion.div>
        <div><h1 style={styles.title}>Therapy Techniques</h1><p style={styles.subtitle}>Choose a technique that matches how you feel</p></div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {categories.map(cat => (
          <motion.button key={cat.id} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedCategory(cat.id)} style={{ padding: '10px 20px', borderRadius: '30px', border: selectedCategory === cat.id ? `2px solid ${cat.color}` : '1px solid rgba(255,255,255,0.1)', background: selectedCategory === cat.id ? `linear-gradient(135deg, ${cat.color}20, transparent)` : 'rgba(255,255,255,0.03)', color: selectedCategory === cat.id ? cat.color : '#cbd5e0', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{cat.icon}</span><span>{cat.name}</span>
          </motion.button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredTechniques.map((tech, index) => (
          <motion.div key={tech.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -4 }} style={{ ...styles.card, cursor: 'pointer', borderColor: tech.color + '40', position: 'relative', overflow: 'hidden' }} onClick={() => startTechnique(tech.id)}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at top right, ${tech.color}20, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} style={{ width: '56px', height: '56px', borderRadius: '18px', background: tech.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: `1px solid ${tech.color}40` }}>{tech.icon}</motion.div>
              <div><h3 style={{ fontSize: '1.3rem', marginBottom: '4px', color: 'white' }}>{tech.name}</h3><span style={{ color: tech.color, fontSize: '0.8rem', padding: '4px 12px', background: tech.color + '20', borderRadius: '20px', display: 'inline-block' }}>{tech.type}</span></div>
            </div>
            <p style={{ color: '#cbd5e0', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>{tech.description}</p>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '16px', borderLeft: `3px solid ${tech.color}` }}>
              <p style={{ color: tech.color, fontSize: '0.85rem', marginBottom: '4px' }}><strong>When to use:</strong></p>
              <p style={{ color: '#cbd5e0', fontSize: '0.9rem' }}>{tech.whenToUse}</p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={(e) => { e.stopPropagation(); startTechnique(tech.id); }} style={{ width: '100%', padding: '12px', background: `linear-gradient(135deg, ${tech.color}40, ${tech.color}20)`, border: `1px solid ${tech.color}`, color: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>Start Practice</motion.button>
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px' }}>
        <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} style={{ fontSize: '4rem', marginBottom: '24px' }}>🌬️</motion.div>
        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '16px' }}>Select a technique first</h2>
        <p style={{ color: '#cbd5e0', marginBottom: '32px' }}>Go to Techniques tab to choose a practice.</p>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={onBack} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>Browse Techniques</motion.button>
      </motion.div>
    );
  }

  switch (technique.type) {
    case 'breathing': return <BreathingTechnique technique={technique} onComplete={onComplete} onBack={onBack} />;
    case 'grounding': return <GroundingTechnique technique={technique} onComplete={onComplete} onBack={onBack} />;
    case 'pomodoro': return <PomodoroTechnique technique={technique} onComplete={onComplete} onBack={onBack} />;
    case 'cognitive': return <CognitiveChatbot onComplete={(sessionData) => { console.log('Cognitive session complete:', sessionData); onComplete('cognitive', 5, JSON.stringify(sessionData)); }} onBack={onBack} />;
    default: return <div style={{ textAlign: 'center' }}><h2 style={{ color: '#9f7aea' }}>Technique not available</h2><motion.button onClick={onBack} className="btn-primary" style={{ marginTop: '24px' }}>Back</motion.button></div>;
  }
};

// ==================== SETTINGS - ENHANCED ====================
const Settings = ({ logout, user }) => {
  const [name, setName] = useState(user?.name || '');
  const [preferences, setPreferences] = useState({
    dailyRituals: localStorage.getItem('dailyRituals') === 'true' || false,
    hapticFeedback: localStorage.getItem('hapticFeedback') === 'true' || false,
    reducedMotion: localStorage.getItem('reducedMotion') === 'true' || false,
    voiceGuidance: localStorage.getItem('voiceGuidance') === 'true' || false,
    emailNotifications: localStorage.getItem('emailNotifications') === 'true' || false,
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
    <label className="toggle-switch"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span className="toggle-slider" /></label>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ fontSize: '2.5rem' }}>⚙️</motion.div>
        <div><h1 style={styles.title}>Settings</h1><p style={styles.subtitle}>Personalize your LumaCare experience</p></div>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} style={styles.card}>
          <h3 style={{ marginBottom: '20px', color: '#9f7aea', display: 'flex', alignItems: 'center', gap: '8px' }}><span>👤</span> Profile</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#cbd5e0', marginBottom: '8px' }}>What should I call you?</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" style={{ flex: 1, marginBottom: 0 }} />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveName} className="btn-primary">Save</motion.button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}><span style={{ color: '#9f7aea', fontSize: '0.9rem' }}>📧 Email</span><p style={{ color: 'white', wordBreak: 'break-all' }}>{user?.email}</p></div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}><span style={{ color: '#9f7aea', fontSize: '0.9rem' }}>⭐ Status</span><p style={{ color: user?.isPremium ? '#fbbf24' : '#4fd1c5' }}>{user?.isPremium ? 'Premium Member' : 'Free Member'}</p></div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} style={styles.card}>
          <h3 style={{ marginBottom: '20px', color: '#9f7aea', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🎨</span> Preferences</h3>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              { key: 'dailyRituals', label: 'Daily Rituals', description: 'Receive daily practice suggestions', icon: '🌅' },
              { key: 'hapticFeedback', label: 'Haptic Feedback', description: 'Gentle vibrations on interaction', icon: '📳' },
              { key: 'reducedMotion', label: 'Reduced Motion', description: 'Minimize animations', icon: '🎬' },
              { key: 'voiceGuidance', label: 'Voice Guidance', description: 'Audio during exercises', icon: '🎤' },
              { key: 'emailNotifications', label: 'Email Notifications', description: 'Weekly progress reports', icon: '📧' },
            ].map((item, index) => (
              <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span style={{ fontSize: '1.5rem' }}>{item.icon}</span><div><div style={{ fontWeight: 500, color: 'white' }}>{item.label}</div><div style={{ color: '#cbd5e0', fontSize: '0.85rem' }}>{item.description}</div></div></div>
                <ToggleSwitch checked={preferences[item.key]} onChange={(val) => handleToggle(item.key, val)} />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} style={styles.card}>
          <h3 style={{ marginBottom: '20px', color: '#9f7aea', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🔒</span> Account</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={logout} style={{ width: '100%', padding: '14px', background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', borderRadius: '12px', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>Sign Out</motion.button>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', textAlign: 'center', marginTop: '8px' }}>Version 2.0.0 • © 2026 LumaCare</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ==================== MAIN APP ====================
function App() {
  const [scrolled, setScrolled] = useState(false);
  const { user, login, logout } = useAuth();
  const [currentTechnique, setCurrentTechnique] = useState(null);
  const { userData, trackSession, upgradeUser } = useSessionTracking();
  const [showPremium, setShowPremium] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
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
    if (technique.location === 'matrix') navigateTo('/matrix');
    else navigateTo('/breathe');
  };

  const handleTechniqueComplete = (techniqueId, rating, feedback, additionalData = {}) => {
    const technique = techniquesData[techniqueId];
    if (technique) trackSession(technique.type, rating, feedback);
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
    if (savedTechnique && window.location.pathname === '/breathe') setCurrentTechnique(JSON.parse(savedTechnique));
  }, []);

  const routerFutureConfig = { v7_startTransition: true, v7_relativeSplatPath: true };

  if (!user) {
    return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}><LoginPage onLogin={login} /></GoogleOAuthProvider>;
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
          {/* Enhanced Background Layers */}
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(159, 122, 234, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(159, 122, 234, 0.05) 1px, transparent 1px)', backgroundSize: '50px 50px', zIndex: -3, pointerEvents: 'none', animation: 'rotate-slow 60s linear infinite' }} />
          <div style={{ position: 'fixed', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 60%)', animation: 'rotate-slow 30s linear infinite', zIndex: -4, pointerEvents: 'none' }} />
          <div style={{ position: 'fixed', top: '10%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(159, 122, 234, 0.4) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: -2, pointerEvents: 'none', animation: 'pulse-glow 4s ease-in-out infinite' }} />
          <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(79, 209, 197, 0.3) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: -2, pointerEvents: 'none', animation: 'pulse-glow 4s ease-in-out infinite 1s' }} />
          <div style={{ position: 'fixed', top: '50%', right: '20%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(246, 135, 179, 0.3) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', zIndex: -2, pointerEvents: 'none', animation: 'pulse-glow 4s ease-in-out infinite 2s' }} />
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ position: 'fixed', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: `${Math.random() * 40 + 10}px`, height: `${Math.random() * 40 + 10}px`, background: `rgba(${Math.random() * 100 + 100}, ${Math.random() * 50 + 50}, ${Math.random() * 200 + 50}, 0.1)`, borderRadius: '50%', pointerEvents: 'none', zIndex: -1, animation: `float-particle ${Math.random() * 10 + 10}s ease-in-out infinite`, animationDelay: `${Math.random() * 5}s` }} />
          ))}

          {/* Desktop Navigation */}
          {!isMobile && (
            <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} style={{ ...styles.nav, ...(scrolled ? { background: 'rgba(10,10,26,0.9)' } : {}) }}>
              <div style={styles.navContent}>
                <motion.div style={styles.logo} onClick={() => navigateTo('/')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <div style={styles.logoGlow} />
                  <span style={{ fontSize: '2rem', position: 'relative' }}>🧠</span>
                  <span style={styles.logoText}>LumaCare</span>
                </motion.div>
                <div style={styles.navLinks}>
                  {navItems.map((item) => (
                    <NavLink key={item.path} to={item.path}>
                      {({ isActive }) => (
                        <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) }}>
                          <span>{item.icon}</span><span>{item.label}</span>
                        </motion.div>
                      )}
                    </NavLink>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setShowPremium(true)} className="btn-premium" style={{ padding: '10px 22px', borderRadius: '30px', fontSize: '0.95rem' }}>⭐ Premium</motion.button>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => navigateTo('/settings')} style={{ cursor: 'pointer' }}>
                    {user.picture ? <img src={user.picture} alt="profile" style={styles.profileImage} /> : <div style={styles.profilePlaceholder}>{user.name.charAt(0).toUpperCase()}</div>}
                  </motion.div>
                </div>
              </div>
            </motion.nav>
          )}

          {/* Mobile Header */}
          {isMobile && (
            <motion.header initial={{ y: -100 }} animate={{ y: 0 }} style={{ position: 'sticky', top: 0, zIndex: 100, padding: '12px 16px', background: 'rgba(10, 10, 26, 0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(159, 122, 234, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <motion.div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} whileTap={{ scale: 0.95 }} onClick={() => navigateTo('/')}>
                <span style={{ fontSize: '1.8rem' }}>🧠</span>
                <span className="gradient-text" style={{ fontWeight: 600, fontSize: '1.2rem' }}>LumaCare</span>
              </motion.div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowPremium(true)} className="btn-premium" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>⭐</motion.button>
                <motion.div whileTap={{ scale: 0.95 }} onClick={() => navigateTo('/settings')}>
                  {user.picture ? <img src={user.picture} alt="profile" style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #9f7aea' }} /> : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'white' }}>{user.name.charAt(0).toUpperCase()}</div>}
                </motion.div>
              </div>
            </motion.header>
          )}

          {/* Premium Modal */}
          <AnimatePresence>{showPremium && <PremiumModal onClose={() => setShowPremium(false)} onUpgrade={handleUpgrade} />}</AnimatePresence>

          {/* Main Content */}
          <motion.main style={{...styles.main, paddingBottom: isMobile ? '80px' : '48px'}} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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

          {/* Mobile Bottom Navigation */}
          {isMobile && (
            <motion.nav initial={{ y: 100 }} animate={{ y: 0 }} style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: 'rgba(26, 11, 46, 0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(159, 122, 234, 0.2)', padding: '8px 4px', zIndex: 100 }}>
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} style={({ isActive }) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 0', flex: '1', color: isActive ? '#9f7aea' : '#cbd5e0', textDecoration: 'none', fontSize: '0.7rem', gap: '4px' })}>
                  {({ isActive }) => (<><motion.span animate={isActive ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }} style={{ fontSize: '1.4rem' }}>{item.icon}</motion.span><span>{item.label}</span></>)}
                </NavLink>
              ))}
            </motion.nav>
          )}
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

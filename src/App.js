/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './styles/globals.css';

const GOOGLE_CLIENT_ID = "253002272888-cg3k451mqesnerv21056utk8u1lk22f6.apps.googleusercontent.com";

const triggerHaptic = (pattern = 'light') => {
  if ('vibrate' in navigator && window.innerWidth <= 768) {
    if (pattern === 'light') navigator.vibrate(10);
    if (pattern === 'medium') navigator.vibrate(20);
    if (pattern === 'success') navigator.vibrate([10, 30, 10]);
  }
};

const techniquesData = {
  'priority-matrix': { id: 'priority-matrix', name: 'Priority Matrix', icon: '📌', description: 'Organize tasks by urgency and importance', whenToUse: 'When feeling overwhelmed with multiple responsibilities', color: '#FCD34D', type: 'matrix', category: '📌 Matrix', location: 'matrix' },
  'box-breathing': { id: 'box-breathing', name: 'Box Breathing', icon: '⬛', description: '4-4-4-4 breathing pattern for instant calm', whenToUse: 'During acute anxiety, panic symptoms, physical tension', color: '#FBCFE8', type: 'breathing', category: '🌬️ Breathing', location: 'breathe', pattern: '4-4-4-4', inhale: 4, hold1: 4, exhale: 4, hold2: 4, minCycles: 5, maxCycles: 10 },
  '478-breathing': { id: '478-breathing', name: '4-7-8 Breathing', icon: '🌬️', description: 'Relaxation breath for anxiety and sleep', whenToUse: 'During anxiety, before sleep, or when stressed', color: '#D1FAE5', type: 'breathing', category: '🌬️ Breathing', location: 'breathe', pattern: '4-7-8', inhale: 4, hold1: 7, exhale: 8, hold2: 4, minCycles: 5, maxCycles: 10 },
  'cognitive-restructuring': { id: 'cognitive-restructuring', name: 'Cognitive Restructuring', icon: '🧠', description: 'Challenge and reframe negative thoughts', whenToUse: 'When experiencing negative self-talk or catastrophic thinking', color: '#C4B5FD', type: 'cognitive', category: '🧠 Cognitive', location: 'breathe' },
  'pomodoro': { id: 'pomodoro', name: 'Pomodoro Technique', icon: '⏰', description: 'Focused work intervals with breaks', whenToUse: 'When struggling with focus or procrastination', color: '#FDE68A', type: 'pomodoro', category: '⏰ Focus', location: 'breathe' },
  'grounding': { id: 'grounding', name: '5-4-3-2-1 Grounding', icon: '🌱', description: 'Use your senses to stay present', whenToUse: 'During panic attacks, dissociation, or feeling disconnected', color: '#A7F3D0', type: 'grounding', category: '🌱 Grounding', location: 'breathe' },
  'progressive-muscle-relaxation': { id: 'progressive-muscle-relaxation', name: 'Progressive Muscle Relaxation', icon: '🫂', description: 'Tense and release muscle groups', whenToUse: 'When you feel physical tension, tight shoulders', color: '#FBCFE8', type: 'body-scan', category: '🔍 Body Scan', location: 'breathe' },
  'rain-method': { id: 'rain-method', name: 'RAIN Method', icon: '🌧️', description: 'A mindfulness tool for difficult emotions', whenToUse: 'When feeling overwhelmed by emotions', color: '#D1FAE5', type: 'mindfulness', category: '🧘 Mindfulness', location: 'breathe' },
  'body-scan': { id: 'body-scan', name: 'Body Scan', icon: '🔍', description: 'Bring attention to each part of your body', whenToUse: 'When feeling disconnected from your body', color: '#C4B5FD', type: 'meditation', category: '🙏 Meditation', location: 'breathe' },
  'noting-practice': { id: 'noting-practice', name: 'Noting Practice', icon: '📝', description: 'Label thoughts and let them pass', whenToUse: 'When your mind is racing', color: '#FDE68A', type: 'mindfulness', category: '🧘 Mindfulness', location: 'breathe' },
  'self-compassion-break': { id: 'self-compassion-break', name: 'Self-Compassion Break', icon: '🤍', description: 'Three phrases to be kinder to yourself', whenToUse: 'When you\'re being hard on yourself', color: '#FBCFE8', type: 'cognitive', category: '🧠 Cognitive', location: 'breathe' },
  'stop-technique': { id: 'stop-technique', name: 'STOP Technique', icon: '🛑', description: 'A quick reset when overwhelmed', whenToUse: 'During moments of panic or stress', color: '#A7F3D0', type: 'grounding', category: '🌱 Grounding', location: 'breathe' },
  'gratitude-log': { id: 'gratitude-log', name: 'Gratitude Log', icon: '🙏', description: 'Write down 3 things you appreciate', whenToUse: 'When feeling down or to end your day', color: '#FDE68A', type: 'journal', category: '📝 Journal', location: 'breathe' }
};

const styles = {
  container: { minHeight: '100vh', background: 'transparent', fontFamily: 'Poppins, system-ui, sans-serif', color: '#4B5563', position: 'relative' },
  nav: { position: 'sticky', top: '20px', zIndex: 100, margin: '20px 24px', padding: '12px 28px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(251,207,232,0.6)', borderRadius: '80px', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' },
  navContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' },
  logo: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' },
  logoText: { fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.01em', background: 'linear-gradient(135deg, #FBCFE8, #D1FAE5, #C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  navLinks: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' },
  navItem: { padding: '8px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px', color: '#6B7280', textDecoration: 'none', cursor: 'pointer', transition: 'all 0.3s ease', fontSize: '0.95rem', fontWeight: 500 },
  navItemActive: { color: '#8B5CF6', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 2 },
  card: { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(251,207,232,0.5)', borderRadius: '32px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' },
  title: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#4B5563', marginBottom: '8px' },
  subtitle: { fontSize: '1rem', color: '#9CA3AF', marginBottom: '24px', fontWeight: 400 },
  button: { padding: '12px 28px', borderRadius: '60px', border: 'none', background: 'linear-gradient(135deg, #FBCFE8, #D1FAE5)', color: '#4B5563', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' },
  premiumButton: { padding: '8px 20px', borderRadius: '40px', border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #C4B5FD)', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  input: { padding: '14px 20px', background: '#FFFFFF', border: '1px solid #FBCFE8', borderRadius: '28px', color: '#4B5563', fontSize: '0.95rem', width: '100%', marginBottom: '16px', transition: 'all 0.2s ease', boxSizing: 'border-box' },
  select: { padding: '14px 20px', background: '#FFFFFF', border: '1px solid #FBCFE8', borderRadius: '28px', color: '#4B5563', fontSize: '0.95rem', width: '100%', marginBottom: '16px', cursor: 'pointer' },
  profileImage: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FBCFE8' },
  profilePlaceholder: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #FBCFE8, #D1FAE5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 600, color: '#4B5563' },
  badge: { background: '#FBCFE8', color: '#8B5CF6', padding: '8px 20px', borderRadius: '40px', fontSize: '0.8rem', fontWeight: 500, display: 'inline-block', marginBottom: '24px' },
};

const AuthContext = React.createContext();
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const savedUser = localStorage.getItem('lumacare_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);
  const login = (userData) => { setUser(userData); localStorage.setItem('lumacare_user', JSON.stringify(userData)); };
  const logout = () => { setUser(null); localStorage.removeItem('lumacare_user'); };
  return (<AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>);
};
const useAuth = () => React.useContext(AuthContext);

const LoadingSpinner = ({ size = 'medium', color = '#FBCFE8' }) => {
  const sizes = { small: '24px', medium: '40px', large: '60px' };
  return (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}><div className="loading-spinner" style={{ width: sizes[size], height: sizes[size], borderTopColor: color }} /></div>);
};

const useSessionTracking = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(user);
  useEffect(() => { if (user) setUserData(user); }, [user]);

  const trackSession = (techniqueType, rating = null, feedback = '') => {
    if (!userData) return { success: false };
    const newStats = { ...userData.stats };
    const dayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    if (techniqueType === 'breathing') newStats.breathing += 1;
    else if (techniqueType === 'cognitive') newStats.aiSessions += 1;
    else if (techniqueType === 'grounding') newStats.sosUsed += 1;
    else if (techniqueType === 'pomodoro') newStats.aiSessions += 1;
    else if (techniqueType === 'journal') newStats.journal += 1;
    newStats.weeklyData[dayIndex].sessions += 1;
    if (rating) {
      newStats.moodScores.push({ score: rating, timestamp: Date.now(), feedback, technique: techniqueType });
      const todayMoods = newStats.moodScores.filter(m => new Date(m.timestamp).toDateString() === new Date().toDateString());
      const avgMood = todayMoods.reduce((sum, m) => sum + m.score, 0) / todayMoods.length || 0;
      newStats.weeklyData[dayIndex].mood = Math.round(avgMood * 20);
    }
    const updatedUser = { ...userData, lastSessionTime: Date.now(), stats: newStats };
    setUserData(updatedUser);
    localStorage.setItem('lumacare_user', JSON.stringify(updatedUser));
    return { success: true };
  };

  const upgradeUser = (plan) => {
    const updatedUser = {
      ...userData,
      isPremium: true,
      premiumPlan: plan,
      premiumExpiry: plan === 'monthly' ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (365 * 24 * 60 * 60 * 1000)
    };
    setUserData(updatedUser);
    localStorage.setItem('lumacare_user', JSON.stringify(updatedUser));
  };

  return { userData, trackSession, upgradeUser };
};

const LoginPage = ({ onLogin }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('lumacare_onboarding_complete') === 'true') setShowOnboarding(false);
  }, []);

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const user = {
      name: decoded.name, email: decoded.email, picture: decoded.picture,
      isPremium: false, premiumPlan: null, premiumExpiry: null, lastSessionTime: null,
      stats: {
        aiSessions: 0, breathing: 0, sosUsed: 0, journal: 0, moodScores: [],
        weeklyData: [
          { day: 'Mon', mood: 0, sessions: 0 }, { day: 'Tue', mood: 0, sessions: 0 },
          { day: 'Wed', mood: 0, sessions: 0 }, { day: 'Thu', mood: 0, sessions: 0 },
          { day: 'Fri', mood: 0, sessions: 0 }, { day: 'Sat', mood: 0, sessions: 0 },
          { day: 'Sun', mood: 0, sessions: 0 }
        ]
      }
    };
    setTempUser(user);
    if (localStorage.getItem('lumacare_onboarding_complete') !== 'true') setShowOnboarding(true);
    else onLogin(user);
  };

  const handleGuestLogin = () => {
    const guestUser = {
      name: 'Guest User', email: 'guest@lumacare.app', picture: null,
      isPremium: false, premiumPlan: null, premiumExpiry: null, lastSessionTime: null,
      stats: {
        aiSessions: 0, breathing: 0, sosUsed: 0, journal: 0, moodScores: [],
        weeklyData: [
          { day: 'Mon', mood: 0, sessions: 0 }, { day: 'Tue', mood: 0, sessions: 0 },
          { day: 'Wed', mood: 0, sessions: 0 }, { day: 'Thu', mood: 0, sessions: 0 },
          { day: 'Fri', mood: 0, sessions: 0 }, { day: 'Sat', mood: 0, sessions: 0 },
          { day: 'Sun', mood: 0, sessions: 0 }
        ]
      }
    };
    setTempUser(guestUser);
    if (localStorage.getItem('lumacare_onboarding_complete') !== 'true') setShowOnboarding(true);
    else onLogin(guestUser);
  };

  const completeOnboarding = () => {
    if (tempUser) { localStorage.setItem('lumacare_onboarding_complete', 'true'); onLogin(tempUser); }
    setShowOnboarding(false);
  };

  const RecommendationScreen = ({ answers, onContinue, onTryTechnique }) => {
    const map = {
      anxiety: { name: 'Box Breathing', id: 'box-breathing' },
      overwhelm: { name: 'Priority Matrix', id: 'priority-matrix' },
      sadness: { name: 'Grounding', id: 'grounding' },
      racing: { name: 'Cognitive Restructuring', id: 'cognitive-restructuring' },
      focus: { name: 'Pomodoro Technique', id: 'pomodoro' },
      tension: { name: 'Progressive Muscle Relaxation', id: 'progressive-muscle-relaxation' }
    };
    const t = map[answers.mainStruggle?.value] || map.anxiety;
    return (
      <div style={{ ...styles.card, maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '32px', position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🧠</div>
        <h2 style={styles.title}>Based on your answers</h2>
        <p style={{ color: '#6B7280', marginBottom: '24px' }}>We recommend starting with <strong style={{ color: '#8B5CF6' }}>{t.name}</strong></p>
        <div style={{ textAlign: 'left', marginBottom: '24px', background: 'rgba(139,92,246,0.1)', borderRadius: '16px', padding: '16px' }}>
          <p style={{ marginBottom: '8px' }}>📌 <strong>You said:</strong></p>
          <p style={{ fontSize: '0.9rem', color: '#4B5563' }}>• Main struggle: {answers.mainStruggle?.label}</p>
          <p style={{ fontSize: '0.9rem', color: '#4B5563' }}>• Frequency: {answers.frequency?.label}</p>
          <p style={{ fontSize: '0.9rem', color: '#4B5563' }}>• Goal: {answers.goal?.label}</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={onContinue} style={{ ...styles.button, background: 'transparent', border: '2px solid #cbd5e0', flex: 1 }}>Go to Dashboard</button>
          <button onClick={() => onTryTechnique(t.id)} style={{ ...styles.button, flex: 1 }}>Try {t.name} →</button>
        </div>
      </div>
    );
  };

  const OnboardingSurvey = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({ mainStruggle: null, frequency: null, wantsTechniques: [], goal: null });
    const [completed, setCompleted] = useState(false);
    const [finalAnswers, setFinalAnswers] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const questions = [
      { id: 'mainStruggle', question: "What's your main struggle right now?", options: [{ value: 'anxiety', label: '😰 Anxiety & Panic' }, { value: 'overwhelm', label: '😤 Overwhelm & Too Many Tasks' }, { value: 'sadness', label: '😔 Sadness & Low Mood' }, { value: 'racing', label: '🧠 Racing Thoughts' }, { value: 'focus', label: "⏰ Can't Focus" }, { value: 'tension', label: '🫂 Physical Tension' }] },
      { id: 'frequency', question: "How often do you feel this way?", options: [{ value: 'daily', label: 'Daily' }, { value: 'few-times', label: 'A few times a week' }, { value: 'weekly', label: 'Once a week' }, { value: 'occasional', label: 'Occasionally' }] },
      { id: 'wantsTechniques', question: "Which techniques sound helpful? (Select all)", multiple: true, options: [{ value: 'breathing', label: '🌬️ Breathing' }, { value: 'grounding', label: '🌱 Grounding' }, { value: 'cognitive', label: '🧠 Cognitive' }, { value: 'focus', label: '⏰ Focus' }, { value: 'journal', label: '📝 Journal' }] },
      { id: 'goal', question: "What's your main goal?", options: [{ value: 'calm', label: 'Feel calmer' }, { value: 'productivity', label: 'Get more done' }, { value: 'sleep', label: 'Sleep better' }, { value: 'understand', label: 'Understand emotions' }] }
    ];

    const q = questions[step];
    const canProceed = q.multiple ? answers[q.id]?.length > 0 : answers[q.id] !== null;

    const handleSelect = (field, value, option) => {
      if (isProcessing) return;
      if (q.multiple) {
        setAnswers(p => ({ ...p, [field]: p[field].includes(value) ? p[field].filter(v => v !== value) : [...p[field], value] }));
      } else {
        const na = { ...answers, [field]: { value, label: option.label } };
        setAnswers(na);
        if (step < questions.length - 1) {
          setIsProcessing(true);
          setTimeout(() => { setStep(step + 1); setIsProcessing(false); }, 300);
        } else {
          setIsProcessing(true);
          const f = { mainStruggle: na.mainStruggle, frequency: na.frequency, wantsTechniques: na.wantsTechniques, goal: { value, label: option.label } };
          localStorage.setItem('lumacare_onboarding_complete', 'true');
          localStorage.setItem('lumacare_onboarding_answers', JSON.stringify(f));
          setFinalAnswers(f);
          setCompleted(true);
          setIsProcessing(false);
        }
      }
    };

    const handleNext = () => {
      if (isProcessing) return;
      if (step < questions.length - 1) {
        setIsProcessing(true);
        setTimeout(() => { setStep(step + 1); setIsProcessing(false); }, 300);
      } else {
        setIsProcessing(true);
        const f = { mainStruggle: answers.mainStruggle, frequency: answers.frequency, wantsTechniques: answers.wantsTechniques, goal: answers.goal };
        localStorage.setItem('lumacare_onboarding_complete', 'true');
        localStorage.setItem('lumacare_onboarding_answers', JSON.stringify(f));
        setFinalAnswers(f);
        setCompleted(true);
        setIsProcessing(false);
      }
    };

    if (completed && finalAnswers) {
      return (
        <RecommendationScreen
          answers={finalAnswers}
          onContinue={completeOnboarding}
          onTryTechnique={(id) => {
            completeOnboarding();
            setTimeout(() => { if (window.startTechniqueFromOnboarding) window.startTechniqueFromOnboarding(id); }, 100);
          }}
        />
      );
    }

    return (
      <div style={{ ...styles.card, maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '32px', position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#8B5CF6', fontSize: '0.8rem' }}>
            <span>Getting to know you</span>
            <span>{step + 1} of {questions.length}</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
        </div>
        <h2 style={styles.title}>{q.question}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', marginBottom: '24px' }}>
          {q.options.map(o => (
            <button key={o.value} onClick={() => handleSelect(q.id, o.value, o)} disabled={isProcessing}
              style={{
                ...styles.button,
                background: (q.multiple ? answers[q.id]?.includes(o.value) : answers[q.id]?.value === o.value) ? 'linear-gradient(135deg, #8B5CF6, #C4B5FD)' : styles.button.background,
                border: '1px solid rgba(139,92,246,0.3)', justifyContent: 'flex-start', gap: '12px',
                opacity: isProcessing ? 0.7 : 1,
                color: (q.multiple ? answers[q.id]?.includes(o.value) : answers[q.id]?.value === o.value) ? 'white' : '#4B5563'
              }}>
              {o.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => { localStorage.setItem('lumacare_onboarding_complete', 'true'); completeOnboarding(); }}
            style={{ ...styles.button, background: 'transparent', border: '2px solid #cbd5e0', flex: 1 }} disabled={isProcessing}>
            Skip
          </button>
          {q.multiple && (
            <button onClick={handleNext} disabled={!canProceed || isProcessing}
              style={{ ...styles.button, flex: 1, opacity: canProceed ? 1 : 0.5, cursor: canProceed ? 'pointer' : 'not-allowed' }}>
              {step === questions.length - 1 ? 'Finish' : 'Next'}
            </button>
          )}
        </div>
      </div>
    );
  };

  if (showOnboarding) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF9F0 0%, #FDE4D6 50%, #E9D8FD 100%)', padding: '20px' }}>
        <OnboardingSurvey />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF9F0 0%, #FDE4D6 50%, #E9D8FD 100%)', padding: '20px' }}>
      <div className="glass-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 24px', position: 'relative', zIndex: 2 }}>
        <img src="https://i.ibb.co/XxH73YFf/launchericon-512x512-Photoroom.png" alt="LumaCare Logo" style={{ width: '80px', height: 'auto', marginBottom: '16px' }} />
        <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '8px' }}>LumaCare</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>Your daily system for mental clarity and focus</p>
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.error('Google Failed')} useOneTap theme="filled_black" shape="pill" text="continue_with" size="large" width="100%" />
        <button onClick={handleGuestLogin} style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'rgba(251,207,232,0.3)', border: '1px solid #fbcfe8', borderRadius: '40px', color: '#4b5563', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <img src="https://i.ibb.co/XxH73YFf/launchericon-512x512-Photoroom.png" alt="LumaCare" style={{ width: '20px', height: '20px' }} />
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

const PremiumModal = ({ onClose, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [buttonRendered, setButtonRendered] = useState(false);
  const planIds = { monthly: 'P-72T62542XW549282SNII7GZY', yearly: 'P-2XJ20656V8350534VNII7J3Q' };

  useEffect(() => {
    if (document.getElementById('paypal-sdk')) return;
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = 'https://www.paypal.com/sdk/js?client-id=AYkkL5gWX0Ipl01CqNjK5el4DwNNkzo9BHuI991fm8hmonNNlMtZ_2RBRISsJbsiMmgCwLJyJbwoP8eD&vault=true&intent=subscription';
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (scriptLoaded && window.paypal && !buttonRendered) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
        window.paypal.Buttons({
          style: { shape: 'pill', color: 'gold', layout: 'vertical', label: 'subscribe' },
          createSubscription: (data, actions) => actions.subscription.create({ plan_id: planIds[selectedPlan] }),
          onApprove: (data) => { setPaymentSuccess(true); onUpgrade(selectedPlan); setTimeout(() => onClose(), 2000); },
          onError: (err) => { console.error('PayPal error:', err); alert('Payment failed. Please try again.'); }
        }).render('#paypal-button-container');
        setButtonRendered(true);
      }
    }
  }, [scriptLoaded, selectedPlan, buttonRendered]);

  useEffect(() => { setButtonRendered(false); }, [selectedPlan]);

  const proFeatures = [
    { icon: '🎯', title: 'Personalized', desc: 'Tools based on how you feel' },
    { icon: '📊', title: 'Daily Check-ins', desc: 'Mood tracking with suggestions' },
    { icon: '📈', title: 'Progress Tracking', desc: 'Streaks, stats, visual progress' },
    { icon: '🗺️', title: 'Guided Programs', desc: '7 & 30 day programs' },
    { icon: '📱', title: 'Offline Access', desc: 'Works anywhere, anytime' },
    { icon: '📝', title: 'Journal Vault', desc: 'Save all your entries' }
  ];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div className="glass-card" style={{ maxWidth: '550px', width: '90%', position: 'relative', padding: '32px', background: '#FFF9F0', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#6b7280', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        {paymentSuccess ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ ...styles.title, color: '#8B5CF6' }}>Welcome to Pro!</h2>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>Your premium features are now unlocked!</p>
            <LoadingSpinner size="small" color="#8B5CF6" />
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ ...styles.badge, marginBottom: '16px', background: '#8B5CF6', color: 'white' }}>✨ LumaCare Pro</span>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Unlock Your Full Potential</h2>
              <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>All techniques are free. Pro gives you the full experience.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {proFeatures.map((f, i) => (
                <div key={i} style={{ padding: '14px', background: 'rgba(139,92,246,0.05)', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.1)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{f.icon}</div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '2px' }}>{f.title}</h4>
                  <p style={{ fontSize: '0.7rem', color: '#9CA3AF', lineHeight: '1.3' }}>{f.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
              <div onClick={() => setSelectedPlan('yearly')} style={{ padding: '16px 20px', background: selectedPlan === 'yearly' ? '#fbcfe8' : '#fde4d6', borderRadius: '20px', border: selectedPlan === 'yearly' ? '2px solid #8B5CF6' : '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><h3 style={{ color: '#4b5563', fontSize: '1rem', marginBottom: '2px' }}>🌟 Yearly Plan</h3><p style={{ color: '#6b7280', fontSize: '0.85rem' }}>$39/year — Save 35%</p></div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#8B5CF6' }}>$3.25<span style={{ fontSize: '0.8rem' }}>/mo</span></div>
                </div>
                {selectedPlan === 'yearly' && <span style={{ position: 'absolute', top: '-8px', right: '16px', background: '#10B981', color: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>BEST VALUE</span>}
              </div>
              <div onClick={() => setSelectedPlan('monthly')} style={{ padding: '16px 20px', background: selectedPlan === 'monthly' ? '#d1fae5' : '#fde4d6', borderRadius: '20px', border: selectedPlan === 'monthly' ? '2px solid #8B5CF6' : '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><h3 style={{ color: '#4b5563', fontSize: '1rem', marginBottom: '2px' }}>💫 Monthly Plan</h3><p style={{ color: '#6b7280', fontSize: '0.85rem' }}>$4.99/month — Cancel anytime</p></div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#8B5CF6' }}>$4.99<span style={{ fontSize: '0.8rem' }}>/mo</span></div>
                </div>
              </div>
            </div>
            {!scriptLoaded ? (
              <div style={{ textAlign: 'center', padding: '20px' }}><LoadingSpinner size="small" color="#8B5CF6" /><p style={{ color: '#6B7280', marginTop: '12px' }}>Loading PayPal...</p></div>
            ) : (
              <div id="paypal-button-container" style={{ minHeight: '150px' }}></div>
            )}
            <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: '#9CA3AF' }}>🔒 Secure payment via PayPal • Cancel anytime • All techniques remain free</p>
          </>
        )}
      </div>
    </div>
  );
};

const DailyCheckIn = ({ onComplete, onStartTechnique }) => {
  const [mood, setMood] = useState(null);
  const [note, setNote] = useState('');
  const [suggestedTechnique, setSuggestedTechnique] = useState(null);

  const moodOptions = [
    { value: 'great', emoji: '😊', label: 'Great', color: '#10B981' },
    { value: 'good', emoji: '🙂', label: 'Good', color: '#60A5FA' },
    { value: 'okay', emoji: '😐', label: 'Okay', color: '#F59E0B' },
    { value: 'low', emoji: '😔', label: 'Low', color: '#F97316' },
    { value: 'struggling', emoji: '😢', label: 'Struggling', color: '#EF4444' }
  ];

  const suggestions = { great: 'gratitude-log', good: 'pomodoro', okay: 'body-scan', low: 'grounding', struggling: 'box-breathing' };

  const handleSave = () => {
    const checkIn = { date: new Date().toISOString(), mood, note, suggestedTechnique: suggestedTechnique?.id };
    const checkIns = JSON.parse(localStorage.getItem('lumacare_checkins') || '[]');
    checkIns.push(checkIn);
    localStorage.setItem('lumacare_checkins', JSON.stringify(checkIns));
    localStorage.setItem('lumacare_last_active', new Date().toDateString());
    localStorage.setItem('lumacare_streak', (parseInt(localStorage.getItem('lumacare_streak') || '0') + 1).toString());
    onComplete(checkIn);
  };

  return (
    <div style={styles.card}>
      <h2 style={{ ...styles.title, fontSize: '1.5rem', textAlign: 'center', marginBottom: '8px' }}>How are you showing up today?</h2>
      <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '24px' }}>One honest answer. No judgment.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {moodOptions.map(o => (
          <button key={o.value} onClick={() => { setMood(o.value); setSuggestedTechnique(techniquesData[suggestions[o.value]]); }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 16px',
              borderRadius: '20px', border: mood === o.value ? `2px solid ${o.color}` : '1px solid #E5E7EB',
              background: mood === o.value ? `${o.color}15` : 'white', cursor: 'pointer',
              transition: 'all 0.2s ease', minWidth: '65px'
            }}>
            <span style={{ fontSize: '2rem' }}>{o.emoji}</span>
            <span style={{ fontSize: '0.75rem', color: o.color, fontWeight: 600, marginTop: '4px' }}>{o.label}</span>
          </button>
        ))}
      </div>
      {mood && (
        <>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any thoughts? (optional)" style={{ ...styles.input, minHeight: '80px' }} />
          {suggestedTechnique && (
            <div style={{ padding: '16px', background: 'rgba(139,92,246,0.05)', borderRadius: '16px', marginBottom: '16px', border: '1px solid rgba(139,92,246,0.15)' }}>
              <p style={{ fontSize: '0.9rem', color: '#8B5CF6', fontWeight: 600, marginBottom: '8px' }}>💡 We recommend:</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '2rem' }}>{suggestedTechnique.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, color: '#4B5563' }}>{suggestedTechnique.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{suggestedTechnique.description}</p>
                </div>
                <button onClick={() => onStartTechnique(suggestedTechnique.id)} style={{ ...styles.button, padding: '8px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>Try Now →</button>
              </div>
            </div>
          )}
          <button onClick={handleSave} style={{ ...styles.button, width: '100%' }}>Save Check-in ✨</button>
        </>
      )}
    </div>
  );
};

const StreakTracker = ({ isPremium }) => {
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    const s = localStorage.getItem('lumacare_streak');
    const la = localStorage.getItem('lumacare_last_active');
    const today = new Date().toDateString();
    if (la === today) setStreak(parseInt(s) || 0);
    else if (la) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      if (la === y.toDateString()) setStreak(parseInt(s) || 0);
      else setStreak(0);
    }
  }, []);
  return (
    <div style={{ background: isPremium ? 'linear-gradient(135deg, #8B5CF6, #C4B5FD)' : '#FDE4D6', borderRadius: '60px', padding: '12px 20px', textAlign: 'center', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <img src="https://i.ibb.co/8DYkzR18/4e4404e9-3353-4465-afeb-d09deedde8ee-removalai-preview.png" alt="streak" style={{ width: '28px', height: '28px' }} />
      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isPremium ? 'white' : '#4B5563' }}>{streak} day streak</span>
    </div>
  );
};

const TechniqueInstructions = ({ technique, onStart, onBack }) => (
  <div style={{ ...styles.card, maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '32px' }}>
    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{technique.icon}</div>
    <h2 style={styles.title}>{technique.name}</h2>
    <div style={{ textAlign: 'left', margin: '20px 0' }}>
      <h3 style={{ color: '#8B5CF6' }}>📋 What it is:</h3><p style={{ color: '#6B7280' }}>{technique.description}</p>
      <h3 style={{ color: '#8B5CF6', marginTop: '16px' }}>🎯 When to use:</h3><p style={{ color: '#6B7280' }}>{technique.whenToUse}</p>
    </div>
    <div style={{ display: 'flex', gap: '12px' }}>
      <button onClick={onBack} style={{ ...styles.button, background: 'transparent', border: '1px solid #e5e7eb', flex: 1 }}>Back</button>
      <button onClick={() => { triggerHaptic('light'); onStart(); }} style={{ ...styles.button, flex: 1 }}>Start Session →</button>
    </div>
  </div>
);

const Dashboard = ({ navigateTo, userData, startTechnique, setShowPremium }) => {
  const [stressLevel, setStressLevel] = useState(42);
  const [clarityScore, setClarityScore] = useState(68);
  const [greeting, setGreeting] = useState('');
  const [ww, setWW] = useState(window.innerWidth);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [stressChange, setStressChange] = useState(null);
  const [clarityChange, setClarityChange] = useState(null);

  useEffect(() => {
    const hr = () => setWW(window.innerWidth);
    window.addEventListener('resize', hr);
    const h = new Date().getHours();
    if (h < 12) setGreeting('morning');
    else if (h < 17) setGreeting('afternoon');
    else setGreeting('evening');
    if (userData?.stats) {
      const am = userData.stats.moodScores.length > 0 ? userData.stats.moodScores.reduce((s, m) => s + m.score, 0) / userData.stats.moodScores.length : 4.2;
      setStressLevel(Math.round(100 - (am * 20)));
      setClarityScore(Math.min(100, Math.round(50 + (userData.stats.moodScores.filter(m => m.score >= 4).length * 2))));
    }
    if (userData?.isPremium) {
      const ci = JSON.parse(localStorage.getItem('lumacare_checkins') || '[]');
      if (!ci.find(c => new Date(c.date).toDateString() === new Date().toDateString())) setShowCheckIn(true);
    }
    return () => window.removeEventListener('resize', hr);
  }, [userData]);

  useEffect(() => {
    const handleTechniqueDone = (e) => {
      const { type } = e.detail;
      const effects = {
        breathing: { stress: -15, clarity: 5 },
        grounding: { stress: -20, clarity: 10 },
        cognitive: { stress: -10, clarity: 15 },
        pomodoro: { stress: -5, clarity: 20 },
        journal: { stress: -8, clarity: 12 },
        'body-scan': { stress: -18, clarity: 8 },
        mindfulness: { stress: -12, clarity: 10 },
        meditation: { stress: -15, clarity: 5 }
      };
      const effect = effects[type] || { stress: -5, clarity: 5 };
      if (effect.stress) { setStressChange(effect.stress); setStressLevel(prev => Math.max(0, Math.min(100, prev + effect.stress))); setTimeout(() => setStressChange(null), 2500); }
      if (effect.clarity) { setClarityChange(effect.clarity); setClarityScore(prev => Math.max(0, Math.min(100, prev + effect.clarity))); setTimeout(() => setClarityChange(null), 2500); }
    };
    window.addEventListener('techniqueCompleted', handleTechniqueDone);
    return () => window.removeEventListener('techniqueCompleted', handleTechniqueDone);
  }, []);

  const isMobile = ww <= 768;
  if (!userData) return null;

  return (
    <div>
      <StreakTracker isPremium={userData.isPremium} />

      {userData.isPremium && showCheckIn && (
        <DailyCheckIn onComplete={(ci) => { setShowCheckIn(false); if (ci.suggestedTechnique) startTechnique(ci.suggestedTechnique); }} onStartTechnique={startTechnique} />
      )}

      {userData.isPremium && !showCheckIn && (
        <div style={{ ...styles.card, textAlign: 'center', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p style={{ color: '#10B981', fontWeight: 600 }}>You showed up today. That matters. 🐾</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={styles.title}>
            {userData.isPremium ? 'Welcome back. Your streak is alive. 🔥' : "Hey. Glad you're here. 🐾"}
          </h1>
        </div>
        <div style={{ background: userData.isPremium ? 'linear-gradient(135deg, #8B5CF6, #C4B5FD)' : '#FDE4D6', padding: '8px 20px', borderRadius: '40px', display: 'flex', gap: '16px', color: userData.isPremium ? 'white' : '#4B5563' }}>
          <div>🕐 {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
          <div>{userData.isPremium ? '💫 Pro' : '✨ Free'}</div>
        </div>
      </div>

      {userData.isPremium && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { icon: '📊', label: 'Sessions completed', value: userData.stats.aiSessions + userData.stats.breathing + userData.stats.sosUsed + userData.stats.journal },
            { icon: '🔥', label: 'Days in a row', value: localStorage.getItem('lumacare_streak') || 0 },
            { icon: '🎯', label: 'Average mood this week', value: userData.stats.moodScores.length > 0 ? (userData.stats.moodScores.reduce((s, m) => s + m.score, 0) / userData.stats.moodScores.length).toFixed(1) : '--' },
            { icon: '⭐', label: 'Thoughts logged', value: userData.stats.journal }
          ].map((s, i) => (
            <div key={i} style={{ ...styles.card, textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '2rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 500, marginTop: '8px' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', flexDirection: isMobile ? 'column' : 'row', marginBottom: '24px' }}>
        <div style={{ ...styles.card, textAlign: 'center', flex: 1, position: 'relative' }}>
          <h3 style={{ color: '#6B7280', marginBottom: '16px' }}>How's your stress right now?</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {stressLevel}%
            {stressChange && (
              <span style={{ fontSize: '1rem', color: stressChange < 0 ? '#10B981' : '#EF4444', fontWeight: 600, animation: 'fadeInOut 2.5s ease' }}>
                {stressChange > 0 ? '+' : ''}{stressChange}%
              </span>
            )}
          </div>
        </div>
        <div style={{ ...styles.card, textAlign: 'center', flex: 1, position: 'relative' }}>
          <h3 style={{ color: '#6B7280', marginBottom: '16px' }}>How clear does your head feel?</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {clarityScore}%
            {clarityChange && (
              <span style={{ fontSize: '1rem', color: clarityChange > 0 ? '#10B981' : '#EF4444', fontWeight: 600, animation: 'fadeInOut 2.5s ease' }}>
                {clarityChange > 0 ? '+' : ''}{clarityChange}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{ color: '#8B5CF6', marginBottom: '16px' }}>Quick Tools</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Help me calm down', tech: 'box-breathing', img: 'https://i.ibb.co/9m6MsjQ3/d9c8d387-86fb-42bd-89dc-c187f18619c6-removalai-preview.png' },
            { label: 'Too much at once', tech: 'priority-matrix', img: 'https://i.ibb.co/ksvDshqx/78887fad-7305-4607-88d8-95c7434872b4-removalai-preview.png' },
            { label: 'I need a moment', tech: 'grounding', img: 'https://i.ibb.co/m5j9K9Pq/cd4a51b8-ee94-4cd9-bd93-824ec8400b33-removalai-preview.png' },
            { label: "Brain won't stop", tech: 'cognitive-restructuring', img: 'https://i.ibb.co/q3hvwqm6/d69a24e2-8ae3-4434-ac0e-b8906ae5532b-removalai-preview.png' }
          ].map(b => (
            <button key={b.tech} onClick={() => { triggerHaptic('light'); startTechnique(b.tech); }} style={styles.button}>
              <img src={b.img} alt={b.label} style={{ width: '24px', height: '24px' }} />{b.label}
            </button>
          ))}
        </div>
        <button onClick={() => { const k = Object.keys(techniquesData).filter(x => x !== 'priority-matrix'); startTechnique(k[Math.floor(Math.random() * k.length)]); }}
          style={{ ...styles.button, width: '100%', background: '#FDE4D6', marginTop: '16px' }}>
          Let LumaCare pick for you 🎲
        </button>
      </div>

      {!userData.isPremium && (
        <div style={{ ...styles.card, textAlign: 'center', marginTop: '24px', background: 'linear-gradient(135deg, rgba(139,92,246,0.05), rgba(196,181,253,0.05))', border: '1px solid rgba(139,92,246,0.2)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💫</div>
          <h3 style={{ color: '#8B5CF6', marginBottom: '8px' }}>Your mind deserves more than the basics.</h3>
          <p style={{ color: '#6B7280', marginBottom: '16px', fontSize: '0.9rem' }}>Track your progress. See your patterns. Own your wellness.</p>
          <button onClick={() => setShowPremium(true)} style={styles.premiumButton}>Upgrade to Pro — $4.99/month</button>
        </div>
      )}
    </div>
  );
};

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
              if (currentCycle >= cycles) { setCompleted(true); setIsActive(false); return inhaleTime; }
              setPhase('inhale'); setCurrentCycle(c => c + 1); return inhaleTime;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, completed, paused, phase, currentCycle, cycles, inhaleTime, hold1Time, exhaleTime, hold2Time]);

  useEffect(() => {
    if (soundEnabled && isActive && !completed && !paused) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode); gainNode.connect(audioContext.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = phase === 'inhale' ? 440 : phase === 'exhale' ? 220 : 330;
        gainNode.gain.value = 0.15;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.2);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (e) {}
    }
  }, [phase, soundEnabled, isActive, completed, paused]);

  const handleStart = () => { setIsActive(true); setPaused(false); setCurrentCycle(1); setPhase('inhale'); setCount(inhaleTime); setCompleted(false); };

  if (completed) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem' }}>✨</div>
        <h2 style={styles.title}>Session Complete!</h2><p>You completed {cycles} cycles.</p>
        <div style={styles.card}>
          <h3>How do you feel?</h3>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>
            {[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : '#FBCFE8', border: `2px solid ${technique.color}`, color: '#4B5563', cursor: 'pointer' }}>{n}</button>)}
          </div>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Share your experience..." style={styles.input} />
          <button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button>
          <button onClick={onBack} style={{ ...styles.button, background: 'transparent', border: '1px solid #e5e7eb', marginTop: '10px' }}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button>
      <h1 style={styles.title}>{technique.name}</h1><p style={{ color: technique.color }}>Pattern: {technique.pattern}</p>
      {!isActive || paused ? (
        <div style={styles.card}>
          <h3>Set Your Session</h3><p>Cycles: {cycles}</p>
          <input type="range" min={technique.minCycles} max={technique.maxCycles} value={cycles} onChange={(e) => setCycles(parseInt(e.target.value))} style={{ width: '100%' }} />
          <div style={{ marginTop: '16px', textAlign: 'left' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <input type="checkbox" checked={useCustomTimes} onChange={(e) => setUseCustomTimes(e.target.checked)} /><span>Customize breathing times</span>
            </label>
            {useCustomTimes && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[{ label: 'Inhale', val: customInhale, set: setCustomInhale },{ label: 'Hold', val: customHold1, set: setCustomHold1 },{ label: 'Exhale', val: customExhale, set: setCustomExhale },{ label: 'Hold', val: customHold2, set: setCustomHold2 }].map(f => (
                  <div key={f.label}><label style={{ fontSize: '0.8rem' }}>{f.label}: {f.val}s</label><input type="range" min={2} max={8} step={1} value={f.val} onChange={(e) => f.set(parseInt(e.target.value))} style={{ width: '100%' }} /></div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ ...styles.button, marginTop: '12px', background: 'transparent', border: `1px solid ${technique.color}`, width: '100%' }}>{soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}</button>
          {paused ? (
            <button onClick={() => { setIsActive(true); setPaused(false); }} style={{ ...styles.button, marginTop: '16px', width: '100%' }}>Resume</button>
          ) : (
            <button onClick={() => { triggerHaptic('light'); handleStart(); }} style={{ ...styles.button, marginTop: '16px', width: '100%' }}>Begin</button>
          )}
        </div>
      ) : (
        <>
          <div style={{ width: 'min(70vw, 320px)', height: 'min(70vw, 320px)', margin: '20px auto', background: `radial-gradient(circle at 30% 30%, ${technique.color}, ${technique.color}80)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${phase === 'inhale' || phase === 'hold1' ? 1.3 : 1})`, transition: 'transform 1.2s cubic-bezier(0.34, 1.2, 0.64, 1)', boxShadow: `0 0 40px ${technique.color}, 0 0 20px ${technique.color}80 inset`, position: 'relative' }}>
            <div style={{ zIndex: 2, textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', marginBottom: '8px' }}>{phase === 'inhale' ? '🌬️ Inhale' : phase === 'hold1' ? '⏸️ Hold' : phase === 'exhale' ? '💨 Exhale' : '⏸️ Hold'}</h2>
              <p style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 'bold' }}>{count}s</p>
            </div>
          </div>
          <p>Cycle {currentCycle} of {cycles}</p>
          <div className="progress-bar" style={{ width: '200px', margin: '16px auto' }}><div className="progress-fill" style={{ width: `${(currentCycle / cycles) * 100}%` }} /></div>
          <button onClick={() => { triggerHaptic('light'); setIsActive(false); setPaused(true); }} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '40px', cursor: 'pointer', marginTop: '16px' }}>Pause</button>
        </>
      )}
    </div>
  );
};

const GroundingTechnique = ({ technique, onComplete, onBack }) => {
  const [step, setStep] = useState(0); const [items, setItems] = useState([]); const [input, setInput] = useState('');
  const [completed, setCompleted] = useState(false); const [rating, setRating] = useState(0); const [feedback, setFeedback] = useState('');
  const steps = ['5 things you see:', '4 things you feel:', '3 things you hear:', '2 things you smell:', '1 thing you taste:'];
  const counts = [5,4,3,2,1];
  const addItem = () => { if (input.trim()) { setItems([...items, ...input.split(',').map(i => i.trim())]); setInput(''); } };
  const next = () => { if (items.length < counts[step]) return; setItems([]); if (step < steps.length - 1) setStep(step + 1); else setCompleted(true); };
  if (completed) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h2 style={styles.title}>Grounding Complete!</h2><div style={styles.card}><div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : '#FBCFE8', border: `2px solid ${technique.color}`, color: '#4B5563', cursor: 'pointer' }}>{n}</button>)}</div><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} /><button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Complete</button></div></div>);
  return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1><div style={styles.card}><h3>{steps[step]} ({items.length}/{counts[step]})</h3><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>{items.map((i, idx) => <span key={idx} style={{ background: '#FBCFE8', padding: '4px 12px', borderRadius: '20px' }}>{i}</span>)}</div><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter items separated by commas" style={styles.input} /><button onClick={addItem} style={{ ...styles.button, marginRight: '10px' }}>Add</button><button onClick={next} disabled={items.length < counts[step]} style={styles.button}>Next</button></div></div>);
};

const PomodoroTechnique = ({ technique, onComplete, onBack }) => {
  const [task, setTask] = useState(''); const [cycle, setCycle] = useState(1); const [phase, setPhase] = useState('work');
  const [time, setTime] = useState(25 * 60); const [isActive, setIsActive] = useState(false);
  const [completed, setCompleted] = useState(false); const [rating, setRating] = useState(0); const [feedback, setFeedback] = useState('');
  useEffect(() => { let timer; if (isActive && !completed) { timer = setInterval(() => { setTime(prev => { if (prev <= 1) { if (phase === 'work') { setPhase('break'); return 5 * 60; } else if (cycle >= 4) { setPhase('longBreak'); return 15 * 60; } else { setCycle(c => c + 1); setPhase('work'); return 25 * 60; } } return prev - 1; }); }, 1000); } return () => clearInterval(timer); }, [isActive, phase, cycle, completed]);
  const formatTime = (sec) => `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`;
  const handleStart = () => { if (!task) { alert('Describe your task first'); return; } setIsActive(true); };
  if (completed) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h2 style={styles.title}>Great Work!</h2><p>You completed 4 cycles on: {task}</p><div style={styles.card}><div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : '#FBCFE8', border: `2px solid ${technique.color}`, color: '#4B5563', cursor: 'pointer' }}>{n}</button>)}</div><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How productive were you?" style={styles.input} /><button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Complete</button></div></div>);
  return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1>{!isActive ? (<div style={styles.card}><h3>What are you working on?</h3><input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Enter your task" style={styles.input} /><button onClick={() => { triggerHaptic('light'); handleStart(); }} style={styles.button}>Start Timer</button></div>) : (<div style={styles.card}><div style={{ fontSize: '4rem', textAlign: 'center' }}>{formatTime(time)}</div><p style={{ textAlign: 'center' }}>{phase === 'work' ? 'Focus Time' : phase === 'break' ? 'Short Break' : 'Long Break'} • Cycle {cycle} of 4</p><button onClick={() => { triggerHaptic('light'); setIsActive(false); }} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '40px', margin: '20px auto', display: 'block', cursor: 'pointer' }}>Pause</button></div>)}</div>);
};

const CognitiveChatbot = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([{ role: 'assistant', content: "What's on your mind? What thought is bothering you?" }]);
  const [input, setInput] = useState(''); const [isProcessing, setIsProcessing] = useState(false);
  const [thought, setThought] = useState(''); const [evidenceFor, setEvidenceFor] = useState([]);
  const [evidenceAgainst, setEvidenceAgainst] = useState([]); const [alternatives, setAlternatives] = useState([]);
  const [balancedThought, setBalancedThought] = useState(''); const [completed, setCompleted] = useState(false);
  const questions = ["What's on your mind?", "What evidence supports this?", "What evidence challenges it?", "What would you tell a friend?", "What's a more balanced way to think?"];
  const handleSend = () => { if (!input.trim() || isProcessing) return; const u = input.trim(); setMessages(p => [...p, { role: 'user', content: u }]); setInput(''); setIsProcessing(true); if (step === 0) setThought(u); else if (step === 1) setEvidenceFor([...evidenceFor, u]); else if (step === 2) setEvidenceAgainst([...evidenceAgainst, u]); else if (step === 3) setAlternatives([...alternatives, u]); else if (step === 4) { setBalancedThought(u); setCompleted(true); setIsProcessing(false); return; } setTimeout(() => { setMessages(p => [...p, { role: 'assistant', content: questions[step + 1] || "Let's wrap this up." }]); setStep(step + 1); setIsProcessing(false); }, 500); };
  if (completed) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h2 style={styles.title}>Your Session Summary</h2><div style={styles.card}><p><strong>Thought:</strong> {thought}</p><p><strong>Evidence For:</strong> {evidenceFor.join(', ')}</p><p><strong>Evidence Against:</strong> {evidenceAgainst.join(', ')}</p><p><strong>Alternatives:</strong> {alternatives.join(', ')}</p><p><strong>Balanced Thought:</strong> {balancedThought}</p></div><button onClick={() => onComplete('cognitive', 5, JSON.stringify({ thought, evidenceFor, evidenceAgainst, alternatives, balancedThought }))} style={styles.button}>Save</button></div>);
  return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>Cognitive Restructuring</h1><div style={styles.card}>{messages.map((m, i) => <div key={i} style={{ textAlign: m.role === 'user' ? 'right' : 'left', margin: '10px 0' }}><span style={{ background: m.role === 'user' ? '#D1FAE5' : '#FBCFE8', padding: '8px 16px', borderRadius: '20px', display: 'inline-block' }}>{m.content}</span></div>)}{isProcessing && <div>...</div>}<input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your response..." style={styles.input} /><button onClick={() => { triggerHaptic('light'); handleSend(); }} style={styles.button}>Send</button></div></div>);
};

const ProgressiveMuscleRelaxation = ({ technique, onComplete, onBack }) => {
  const [step, setStep] = useState(0); const [isActive, setIsActive] = useState(false); const [timer, setTimer] = useState(5);
  const [completed, setCompleted] = useState(false); const [rating, setRating] = useState(0); const [feedback, setFeedback] = useState('');
  const muscles = ['Feet', 'Legs', 'Stomach', 'Hands', 'Arms', 'Shoulders', 'Neck', 'Face'];
  useEffect(() => { let i; if (isActive && timer > 0) i = setInterval(() => setTimer(t => t - 1), 1000); else if (isActive && timer === 0) { if (step < muscles.length - 1) { setStep(s => s + 1); setTimer(5); } else { setIsActive(false); setCompleted(true); } } return () => clearInterval(i); }, [isActive, timer, step]);
  if (completed) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h2 style={styles.title}>Session Complete!</h2><div style={styles.card}><div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : '#FBCFE8', border: `2px solid ${technique.color}`, color: '#4B5563', cursor: 'pointer' }}>{n}</button>)}</div><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} /><button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button></div></div>);
  if (!isActive) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1><div style={styles.card}><button onClick={() => { triggerHaptic('light'); setIsActive(true); setTimer(5); setStep(0); }} style={styles.button}>Start Session</button></div></div>);
  return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1><div style={styles.card}><h3>{muscles[step]}</h3><p>{timer === 5 ? 'Tense...' : 'Release...'}</p><div style={{ fontSize: '3rem', textAlign: 'center' }}>{timer}s</div></div></div>);
};

const RainMethod = ({ technique, onComplete, onBack }) => {
  const [step, setStep] = useState(0); const [responses, setResponses] = useState(['', '', '', '']);
  const [completed, setCompleted] = useState(false); const [rating, setRating] = useState(0); const [feedback, setFeedback] = useState('');
  const steps = ['R - Recognize', 'A - Allow', 'I - Investigate', 'N - Nurture'];
  const prompts = ['What is happening?', 'Can you let it be?', 'What does it feel like?', 'What would you tell a friend?'];
  if (completed) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h2 style={styles.title}>RAIN Method Complete!</h2><div style={styles.card}>{steps.map((s, i) => <div key={i}><strong>{s}:</strong> {responses[i]}</div>)}<div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : '#FBCFE8', border: `2px solid ${technique.color}`, color: '#4B5563', cursor: 'pointer' }}>{n}</button>)}</div><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Share your experience..." style={styles.input} /><button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button></div></div>);
  return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1><div style={styles.card}><h3>{steps[step]}</h3><p>{prompts[step]}</p><textarea value={responses[step]} onChange={(e) => { const n = [...responses]; n[step] = e.target.value; setResponses(n); }} placeholder="Write your response..." style={styles.input} rows="3" /><button onClick={() => { if (step < steps.length - 1) setStep(step + 1); else setCompleted(true); }} disabled={!responses[step].trim()} style={styles.button}>{step === steps.length - 1 ? 'Complete' : 'Next'}</button></div></div>);
};

const BodyScan = ({ technique, onComplete, onBack }) => {
  const [step, setStep] = useState(0); const [isActive, setIsActive] = useState(false); const [timer, setTimer] = useState(15);
  const [completed, setCompleted] = useState(false); const [rating, setRating] = useState(0); const [feedback, setFeedback] = useState('');
  const parts = ['Feet', 'Legs', 'Hips', 'Stomach', 'Chest', 'Back', 'Hands', 'Arms', 'Shoulders', 'Neck', 'Face', 'Whole Body'];
  useEffect(() => { let i; if (isActive && timer > 0) i = setInterval(() => setTimer(t => t - 1), 1000); else if (isActive && timer === 0) { if (step < parts.length - 1) { setStep(s => s + 1); setTimer(15); } else { setIsActive(false); setCompleted(true); } } return () => clearInterval(i); }, [isActive, timer, step]);
  if (completed) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h2 style={styles.title}>Body Scan Complete!</h2><div style={styles.card}><div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : '#FBCFE8', border: `2px solid ${technique.color}`, color: '#4B5563', cursor: 'pointer' }}>{n}</button>)}</div><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} /><button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button></div></div>);
  if (!isActive) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1><div style={styles.card}><button onClick={() => { triggerHaptic('light'); setIsActive(true); setTimer(15); setStep(0); }} style={styles.button}>Start Body Scan</button></div></div>);
  return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1><div style={styles.card}><h3>{parts[step]}</h3><p>Bring attention to your {parts[step].toLowerCase()}...</p><div style={{ fontSize: '3rem', textAlign: 'center' }}>{timer}s</div></div></div>);
};

const NotingPractice = ({ technique, onComplete, onBack }) => {
  const [isActive, setIsActive] = useState(false); const [timer, setTimer] = useState(180); const [notes, setNotes] = useState([]);
  const [completed, setCompleted] = useState(false); const [rating, setRating] = useState(0); const [feedback, setFeedback] = useState('');
  useEffect(() => { let i; if (isActive && timer > 0) i = setInterval(() => setTimer(t => t - 1), 1000); else if (isActive && timer === 0) { setIsActive(false); setCompleted(true); } return () => clearInterval(i); }, [isActive, timer]);
  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  if (completed) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h2 style={styles.title}>Noting Practice Complete!</h2><div style={styles.card}><h3>Your Notes:</h3>{notes.map((n, i) => <div key={i}>• {n.type} at {n.time}s</div>)}<div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : '#FBCFE8', border: `2px solid ${technique.color}`, color: '#4B5563', cursor: 'pointer' }}>{n}</button>)}</div><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How did this help?" style={styles.input} /><button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button></div></div>);
  if (!isActive) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1><div style={styles.card}><button onClick={() => { triggerHaptic('light'); setIsActive(true); setTimer(180); setNotes([]); }} style={styles.button}>Start 3-Minute Session</button></div></div>);
  return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1><div style={styles.card}><div style={{ fontSize: '2rem', textAlign: 'center' }}>{formatTime(timer)}</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>{['thinking','feeling','planning','remembering'].map(t => <button key={t} onClick={() => setNotes([...notes, { type: t, time: 180 - timer }])} style={styles.button}>{t === 'thinking' ? '💭' : t === 'feeling' ? '❤️' : t === 'planning' ? '📋' : '📖'} {t.charAt(0).toUpperCase() + t.slice(1)}</button>)}</div>{notes.slice(-5).map((n, i) => <div key={i}>• {n.type}</div>)}</div></div>);
};

const SelfCompassionBreak = ({ technique, onComplete, onBack }) => {
  const [step, setStep] = useState(0); const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState(0); const [feedback, setFeedback] = useState('');
  const phrases = ["This is hard right now. Place your hand on your heart.", "Many people feel this way. You're not alone.", "May I be kind to myself in this moment."];
  if (completed) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h2 style={styles.title}>Self-Compassion Complete!</h2><div style={styles.card}><div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : '#FBCFE8', border: `2px solid ${technique.color}`, color: '#4B5563', cursor: 'pointer' }}>{n}</button>)}</div><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} /><button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button></div></div>);
  return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1><div style={styles.card}><p>{phrases[step]}</p><button onClick={() => { if (step < phrases.length - 1) setStep(step + 1); else setCompleted(true); }} style={styles.button}>{step === phrases.length - 1 ? 'Complete' : 'Next'}</button></div></div>);
};

const StopTechnique = ({ technique, onComplete, onBack }) => {
  const [step, setStep] = useState(0); const [completed, setCompleted] = useState(false);
  const [rating, setRating] = useState(0); const [feedback, setFeedback] = useState('');
  const steps = ['S - Stop', 'T - Take a breath', 'O - Observe', 'P - Proceed'];
  const instructions = ['Stop what you are doing.', 'Take a deep breath in, and out.', 'Observe what is happening inside and around you.', 'Proceed with awareness.'];
  if (completed) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h2 style={styles.title}>STOP Complete!</h2><div style={styles.card}><div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : '#FBCFE8', border: `2px solid ${technique.color}`, color: '#4B5563', cursor: 'pointer' }}>{n}</button>)}</div><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} /><button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button></div></div>);
  return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1><div style={styles.card}><h3>{steps[step]}</h3><p>{instructions[step]}</p><button onClick={() => { if (step < steps.length - 1) setStep(step + 1); else setCompleted(true); }} style={styles.button}>{step === steps.length - 1 ? 'Complete' : 'Next'}</button></div></div>);
};

const GratitudeLog = ({ technique, onComplete, onBack }) => {
  const [entries, setEntries] = useState(['', '', '']); const [saved, setSaved] = useState(false);
  const [rating, setRating] = useState(0); const [feedback, setFeedback] = useState('');
  const saveEntries = () => { const e = localStorage.getItem('gratitude_entries'); const a = e ? JSON.parse(e) : []; a.push({ date: new Date().toISOString(), entries }); localStorage.setItem('gratitude_entries', JSON.stringify(a)); setSaved(true); };
  if (saved) return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h2 style={styles.title}>Gratitude Log Saved!</h2><div style={styles.card}><h3>Your entries:</h3>{entries.map((e, i) => <div key={i}>• {e}</div>)}<div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '20px 0' }}>{[1,2,3,4,5].map(n => <button key={n} onClick={() => setRating(n)} style={{ width: '48px', height: '48px', borderRadius: '50%', background: rating === n ? technique.color : '#FBCFE8', border: `2px solid ${technique.color}`, color: '#4B5563', cursor: 'pointer' }}>{n}</button>)}</div><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How do you feel?" style={styles.input} /><button onClick={() => onComplete(technique.id, rating, feedback)} style={styles.button}>Save</button></div></div>);
  return (<div><button onClick={onBack} style={{ marginBottom: '20px', ...styles.button, background: 'transparent', border: '1px solid #e5e7eb' }}>← Back</button><h1 style={styles.title}>{technique.name}</h1><div style={styles.card}><p>Write 3 things you're grateful for today.</p>{entries.map((e, i) => <input key={i} value={e} onChange={(ev) => { const n = [...entries]; n[i] = ev.target.value; setEntries(n); }} placeholder={`Thing ${i+1}`} style={styles.input} />)}<button onClick={saveEntries} disabled={!entries[0] || !entries[1] || !entries[2]} style={styles.button}>Save</button></div></div>);
};

const PriorityMatrix = () => {
  const [ww, setWW] = useState(window.innerWidth);
  useEffect(() => { const h = () => setWW(window.innerWidth); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  const isMobile = ww <= 768;
  const [tasks, setTasks] = useState(() => { const s = localStorage.getItem('lumacare_matrix_tasks'); return s ? JSON.parse(s) : [{ id: 1, text: 'Finish client presentation', quadrant: 'urgent-important', completed: false },{ id: 2, text: 'Plan next week', quadrant: 'important-not-urgent', completed: false }]; });
  const [newTask, setNewTask] = useState(''); const [selectedQuadrant, setSelectedQuadrant] = useState('urgent-important');
  useEffect(() => { localStorage.setItem('lumacare_matrix_tasks', JSON.stringify(tasks)); }, [tasks]);
  const quadrants = [{ id: 'urgent-important', title: 'Urgent & Important', color: '#EF4444' },{ id: 'important-not-urgent', title: 'Important, Not Urgent', color: '#10B981' },{ id: 'urgent-not-important', title: 'Urgent, Not Important', color: '#F59E0B' },{ id: 'neither', title: 'Neither', color: '#6B7280' }];
  return (<div><h1 style={styles.title}>Priority Matrix</h1><div style={styles.card}><input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="New task..." style={styles.input} /><select value={selectedQuadrant} onChange={(e) => setSelectedQuadrant(e.target.value)} style={styles.select}>{quadrants.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}</select><button onClick={() => { if (newTask.trim()) { setTasks([...tasks, { id: Date.now(), text: newTask, quadrant: selectedQuadrant, completed: false }]); setNewTask(''); } }} style={styles.button}>Add Task</button></div><div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>{quadrants.map(q => (<div key={q.id} style={{ ...styles.card, borderColor: q.color }}><h3 style={{ color: q.color }}>{q.title}</h3>{tasks.filter(t => t.quadrant === q.id).map(t => (<div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><input type="checkbox" checked={t.completed} onChange={() => setTasks(tasks.map(x => x.id === t.id ? { ...x, completed: !x.completed } : x))} /><span style={{ textDecoration: t.completed ? 'line-through' : 'none', flex: 1 }}>{t.text}</span><button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>✕</button></div>))}</div>))}</div></div>);
};

const Techniques = ({ navigateTo, startTechnique }) => {
  const techniques = Object.values(techniquesData);
  const techniqueImages = {
    'priority-matrix': 'https://i.ibb.co/dsZmwMnR/Screenshot-2026-04-12-204912-removebg-preview.png',
    'box-breathing': 'https://i.ibb.co/BKY43Ys9/Screenshot-2026-04-12-205821-removebg-preview.png',
    '478-breathing': 'https://i.ibb.co/PZfysFkC/Screenshot-2026-04-19-135712.png',
    'cognitive-restructuring': 'https://i.ibb.co/JwyFzkDW/6295904e-55fe-46d7-be40-c73d2224722d-removalai-preview.png',
    'pomodoro': 'https://i.ibb.co/zdh4KHH/ca373229-9b47-4e66-88e2-f1d56f0d2f07-removalai-preview.png',
    'grounding': 'https://i.ibb.co/nFhdxZf/Screenshot-2026-04-16-110429-removebg-preview.png',
    'progressive-muscle-relaxation': 'https://i.ibb.co/fGyjyZPD/Screenshot-2026-04-22-160846.png',
    'rain-method': 'https://i.ibb.co/3mt6YPDT/b74a0174-d6aa-43ee-87af-cd7b04bff2ef-removalai-preview.png',
    'body-scan': 'https://i.ibb.co/ZRDg36GF/Screenshot-2026-04-22-160023.png',
    'noting-practice': 'https://i.ibb.co/1YxwRypr/49db9465-5762-43d4-8a22-5852e3a1c7e9-removalai-preview.png',
    'self-compassion-break': 'https://i.ibb.co/fRBQ6SF/Screenshot-2026-04-22-162112.png',
    'stop-technique': 'https://i.ibb.co/bg41SwGb/Screenshot-2026-04-22-162155.png',
    'gratitude-log': 'https://i.ibb.co/ZRDg36GF/Screenshot-2026-04-22-160023.png',
  };
  const grouped = techniques.reduce((acc, tech) => { const cat = tech.category || '✨ Wellness'; if (!acc[cat]) acc[cat] = []; acc[cat].push(tech); return acc; }, {});
  return (<div><h1 style={styles.title}>Techniques</h1><p style={styles.subtitle}>All techniques are free. Tap any card to start.</p>{Object.entries(grouped).map(([category, techs]) => (<div key={category} style={{ marginBottom: '40px' }}><h2 style={{ color: '#8B5CF6', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 600 }}>{category}</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '20px' }}>{techs.map(tech => (<div key={tech.id} onClick={() => { triggerHaptic('light'); startTechnique(tech.id); }} style={{ background: 'white', borderRadius: '28px', padding: '24px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: `1px solid ${tech.color}30` }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-6px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}><img src={techniqueImages[tech.id]} alt={tech.name} style={{ width: '70px', height: '70px', objectFit: 'contain', marginBottom: '12px' }} /><h3 style={{ fontSize: '0.9rem', marginBottom: '6px', fontWeight: 600, color: '#4B5563' }}>{tech.name}</h3><p style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{tech.type}</p></div>))}</div></div>))}</div>);
};

const BreatheTab = ({ technique, onComplete, onBack }) => {
  const [showInstructions, setShowInstructions] = useState(true); const [sessionStarted, setSessionStarted] = useState(false);
  const ScrollableContainer = ({ children }) => (<div style={{ height: 'calc(100vh - 140px)', overflowY: 'auto', padding: '20px', scrollBehavior: 'smooth' }}>{children}</div>);
  if (!technique) return (<div style={{ textAlign: 'center', padding: '60px' }}><div style={{ fontSize: '4rem', marginBottom: '20px' }}>🌬️</div><h2 style={styles.title}>Select a technique first</h2><p style={{ color: '#6B7280', marginBottom: '30px' }}>Choose a technique from the list below</p><button onClick={onBack} style={{ ...styles.button, margin: '0 auto', display: 'inline-block' }}>Browse Techniques</button></div>);
  if (showInstructions && !sessionStarted) return <TechniqueInstructions technique={technique} onStart={() => { setShowInstructions(false); setSessionStarted(true); }} onBack={onBack} />;
  switch (technique.id) {
    case 'box-breathing': case '478-breathing': return <ScrollableContainer><BreathingTechnique technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'grounding': return <ScrollableContainer><GroundingTechnique technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'pomodoro': return <ScrollableContainer><PomodoroTechnique technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'cognitive-restructuring': return <ScrollableContainer><CognitiveChatbot onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'progressive-muscle-relaxation': return <ScrollableContainer><ProgressiveMuscleRelaxation technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'rain-method': return <ScrollableContainer><RainMethod technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'body-scan': return <ScrollableContainer><BodyScan technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'noting-practice': return <ScrollableContainer><NotingPractice technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'self-compassion-break': return <ScrollableContainer><SelfCompassionBreak technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'stop-technique': return <ScrollableContainer><StopTechnique technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    case 'gratitude-log': return <ScrollableContainer><GratitudeLog technique={technique} onComplete={onComplete} onBack={onBack} /></ScrollableContainer>;
    default: return (<ScrollableContainer><div style={{ textAlign: 'center' }}><h2 style={styles.title}>Coming soon</h2><button onClick={onBack} style={styles.button}>Back</button></div></ScrollableContainer>);
  }
};

const Settings = ({ logout, user }) => {
  const [name, setName] = useState(user?.name || '');
  return (<div><h1 style={styles.title}>Settings</h1><div style={styles.card}><h3 style={{ color: '#8B5CF6' }}>Profile</h3><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={styles.input} /><button onClick={() => { const u = { ...user, name }; localStorage.setItem('lumacare_user', JSON.stringify(u)); window.location.reload(); }} style={styles.button}>Save Name</button><h3 style={{ color: '#8B5CF6', marginTop: '24px' }}>Subscription</h3>{user?.isPremium ? (<div style={{ padding: '16px', background: 'rgba(139,92,246,0.1)', borderRadius: '16px', marginBottom: '16px' }}><p style={{ color: '#8B5CF6', fontWeight: 600 }}>💫 Pro Member</p><p style={{ fontSize: '0.85rem', color: '#6B7280' }}>Plan: {user.premiumPlan === 'yearly' ? 'Yearly ($39/year)' : 'Monthly ($4.99/mo)'}</p></div>) : (<div style={{ padding: '16px', background: 'rgba(251,207,232,0.3)', borderRadius: '16px', marginBottom: '16px' }}><p style={{ color: '#6B7280' }}>Free Plan — All techniques included</p></div>)}<h3 style={{ color: '#8B5CF6', marginTop: '24px' }}>Data</h3><div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}><button onClick={() => { const d = { user: localStorage.getItem('lumacare_user'), checkins: localStorage.getItem('lumacare_checkins'), gratitude: localStorage.getItem('gratitude_entries'), streak: localStorage.getItem('lumacare_streak') }; const b = new Blob([JSON.stringify(d)], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `lumacare_backup_${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(u); }} style={{ ...styles.button, background: '#D1FAE5' }}>📥 Export Data</button><button onClick={() => { const i = document.createElement('input'); i.type = 'file'; i.accept = 'application/json'; i.onchange = (e) => { const f = e.target.files[0]; const r = new FileReader(); r.onload = (ev) => { try { const d = JSON.parse(ev.target.result); if (d.user) localStorage.setItem('lumacare_user', d.user); if (d.checkins) localStorage.setItem('lumacare_checkins', d.checkins); if (d.gratitude) localStorage.setItem('gratitude_entries', d.gratitude); if (d.streak) localStorage.setItem('lumacare_streak', d.streak); alert('Imported! Reloading...'); window.location.reload(); } catch { alert('Invalid file'); } }; r.readAsText(f); }; i.click(); }} style={{ ...styles.button, background: '#FBCFE8' }}>📤 Import Data</button></div><h3 style={{ color: '#8B5CF6', marginTop: '24px' }}>Account</h3><button onClick={() => { triggerHaptic('medium'); logout(); }} style={{ ...styles.button, background: '#EF4444', width: '100%' }}>Sign Out</button></div></div>);
};

function App() {
  const [scrolled, setScrolled] = useState(false);
  const { user, login, logout } = useAuth();
  const [currentTechnique, setCurrentTechnique] = useState(null);
  const { userData, trackSession, upgradeUser } = useSessionTracking();
  const [showPremium, setShowPremium] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth <= 768;

  useEffect(() => {
    const hr = () => setWindowWidth(window.innerWidth);
    const hs = () => setScrolled(window.scrollY > 20);
    window.addEventListener('resize', hr);
    window.addEventListener('scroll', hs);
    return () => { window.removeEventListener('resize', hr); window.removeEventListener('scroll', hs); };
  }, []);

  const navigateTo = (path) => { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); };
  const startTechnique = (techniqueId) => { const t = techniquesData[techniqueId]; setCurrentTechnique(t); localStorage.setItem('lumacare_current_technique', JSON.stringify(t)); navigateTo(t.location === 'matrix' ? '/matrix' : '/breathe'); };

  const handleTechniqueComplete = (techniqueId, rating, feedback) => {
    const t = techniquesData[techniqueId];
    if (t) trackSession(t.type, rating, feedback);
    window.dispatchEvent(new CustomEvent('techniqueCompleted', { detail: { type: t?.type } }));
    setCurrentTechnique(null);
    localStorage.removeItem('lumacare_current_technique');
    navigateTo('/techniques');
  };

  const handleBack = () => { setCurrentTechnique(null); localStorage.removeItem('lumacare_current_technique'); navigateTo('/techniques'); };

  useEffect(() => { const s = localStorage.getItem('lumacare_current_technique'); if (s && window.location.pathname === '/breathe') setCurrentTechnique(JSON.parse(s)); }, []);
  useEffect(() => { window.startTechniqueFromOnboarding = startTechnique; return () => { delete window.startTechniqueFromOnboarding; }; }, []);

  if (!user) return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}><LoginPage onLogin={login} /></GoogleOAuthProvider>;

  const navItems = [
    { path: '/', label: 'Dashboard', imgSrc: 'https://i.ibb.co/ZRwCb097/9e8aaca4-dfc7-4dfc-b946-403717d7d89e-removalai-preview.png' },
    { path: '/matrix', label: 'Matrix', imgSrc: 'https://i.ibb.co/CKW9R4wd/Screenshot-2026-04-20-121359-removebg-preview.png' },
    { path: '/techniques', label: 'Techniques', imgSrc: 'https://i.ibb.co/5h96fjgs/Screenshot-2026-04-22-163313-removebg-preview.png' },
    { path: '/breathe', label: 'Breathe', imgSrc: 'https://i.ibb.co/YF1vHDf4/Screenshot-2026-04-20-123012-removebg-preview.png' },
    { path: '/settings', label: 'Settings', imgSrc: 'https://i.ibb.co/SDzfwCLG/1a564dfb-e23f-43e9-be68-779c2b3441bf-removalai-preview.png' },
  ];

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div style={styles.container}>
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -2, background: 'linear-gradient(135deg, #FFF9F0 0%, #FDE4D6 50%, #E9D8FD 100%)', backgroundSize: '200% 200%', animation: isMobile ? 'none' : 'softFlow 20s ease infinite' }} />
          {!isMobile && <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none', background: 'radial-gradient(circle at 30% 40%, rgba(251,207,232,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(209,250,229,0.2) 0%, transparent 50%)' }} />}

          {!isMobile && (
            <nav style={{ ...styles.nav, ...(scrolled ? { background: 'rgba(255,255,255,0.9)' } : {}) }}>
              <div style={styles.navContent}>
                <div style={styles.logo} onClick={() => navigateTo('/')}>
                  <img src="https://i.ibb.co/XxH73YFf/launchericon-512x512-Photoroom.png" alt="LumaCare Logo" style={{ height: '32px', width: 'auto', borderRadius: '8px' }} />
                  <span style={styles.logoText}>LumaCare</span>
                </div>
                <div style={styles.navLinks}>
                  {navItems.map(item => (<NavLink key={item.path} to={item.path} style={({ isActive }) => ({ ...styles.navItem, ...(isActive && styles.navItemActive) })}><img src={item.imgSrc} alt={item.label} style={{ width: '32px', height: '32px', objectFit: 'contain' }} /><span>{item.label}</span></NavLink>))}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {!userData?.isPremium && (<button onClick={() => { triggerHaptic('light'); setShowPremium(true); }} style={styles.premiumButton}><img src="https://i.ibb.co/Fb7zk3zC/12589570-6cba-463e-af2f-dd5ee100a546-removalai-preview.png" alt="premium" style={{ width: '20px', height: '20px' }} />Pro</button>)}
                  <div onClick={() => navigateTo('/settings')} style={{ cursor: 'pointer' }}>{user.picture ? <img src={user.picture} alt="profile" style={styles.profileImage} /> : <div style={styles.profilePlaceholder}>{user.name?.charAt(0).toUpperCase()}</div>}</div>
                </div>
              </div>
            </nav>
          )}

          {isMobile && (
            <header style={{ position: 'sticky', top: 0, zIndex: 100, padding: '12px 16px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #fbcfe8', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigateTo('/')}><img src="https://i.ibb.co/XxH73YFf/launchericon-512x512-Photoroom.png" alt="LumaCare Logo" style={{ height: '28px', width: 'auto', borderRadius: '6px' }} /><span>LumaCare</span></div>
              <div style={{ display: 'flex', gap: '8px' }}>{!userData?.isPremium && <button onClick={() => { triggerHaptic('light'); setShowPremium(true); }} style={styles.premiumButton}><img src="https://i.ibb.co/Fb7zk3zC/12589570-6cba-463e-af2f-dd5ee100a546-removalai-preview.png" alt="premium" style={{ width: '18px', height: '18px' }} /></button>}<div onClick={() => navigateTo('/settings')}>{user.picture ? <img src={user.picture} alt="profile" style={{ width: '36px', height: '36px', borderRadius: '50%' }} /> : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #FBCFE8, #D1FAE5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4B5563' }}>{user.name?.charAt(0).toUpperCase()}</div>}</div></div>
            </header>
          )}

          {showPremium && <PremiumModal onClose={() => setShowPremium(false)} onUpgrade={(plan) => upgradeUser(plan)} />}

          <main style={{ ...styles.main, paddingBottom: isMobile ? '80px' : '40px' }}>
            <Routes>
              <Route path="/" element={<Dashboard navigateTo={navigateTo} userData={userData} startTechnique={startTechnique} setShowPremium={setShowPremium} />} />
              <Route path="/matrix" element={<PriorityMatrix />} />
              <Route path="/techniques" element={<Techniques navigateTo={navigateTo} startTechnique={startTechnique} />} />
              <Route path="/breathe" element={<BreatheTab technique={currentTechnique} onComplete={handleTechniqueComplete} onBack={handleBack} />} />
              <Route path="/settings" element={<Settings logout={logout} user={userData} />} />
            </Routes>
          </main>

          {isMobile && (
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid #FBCFE8', padding: '8px 4px', zIndex: 100 }}>
              {navItems.map(item => (<NavLink key={item.path} to={item.path} style={({ isActive }) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', flex: 1, color: isActive ? '#8B5CF6' : '#6B7280', textDecoration: 'none', fontSize: '0.7rem' })}><img src={item.imgSrc} alt={item.label} style={{ width: '28px', height: '28px', objectFit: 'contain', marginBottom: '4px' }} /><span>{item.label}</span></NavLink>))}
            </nav>
          )}
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default function AppWithProvider() {
  return (<AuthProvider><App /></AuthProvider>);
}

import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';

// Animated orb that changes color and scale
const MorphingOrb = ({ state }) => {
  const meshRef = useRef();
  
  const colors = {
    overwhelm: '#ef4444',
    calm: '#4fd1c5',
    focus: '#fbbf24'
  };
  
  const getScale = () => {
    switch(state) {
      case 'overwhelm': return 1.3;
      case 'calm': return 1;
      case 'focus': return 1.15;
      default: return 1;
    }
  };
  
  const getPulseSpeed = () => {
    switch(state) {
      case 'overwhelm': return 3;
      case 'calm': return 0.8;
      case 'focus': return 1.5;
      default: return 1;
    }
  };
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const pulse = Math.sin(time * getPulseSpeed()) * 0.03;
      const scale = getScale();
      meshRef.current.scale.set(scale + pulse, scale + pulse, scale + pulse);
      
      if (meshRef.current.material) {
        if (state === 'overwhelm') {
          meshRef.current.material.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.2;
          meshRef.current.material.roughness = 0.7;
        } else if (state === 'focus') {
          meshRef.current.material.emissiveIntensity = 0.2;
          meshRef.current.material.metalness = 0.8;
          meshRef.current.material.roughness = 0.3;
        } else {
          meshRef.current.material.emissiveIntensity = 0.1;
          meshRef.current.material.metalness = 0.2;
          meshRef.current.material.roughness = 0.5;
        }
      }
    }
  });
  
  useEffect(() => {
    if (meshRef.current && meshRef.current.material) {
      gsap.to(meshRef.current.material.color, {
        r: new THREE.Color(colors[state]).r,
        g: new THREE.Color(colors[state]).g,
        b: new THREE.Color(colors[state]).b,
        duration: 0.6,
        ease: "power2.inOut"
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1.2, state === 'overwhelm' ? 3 : 2]} />
      <meshStandardMaterial
        color={colors[state]}
        emissive={state === 'overwhelm' ? '#ff3333' : '#222222'}
        emissiveIntensity={0.3}
        roughness={0.4}
        metalness={0.3}
      />
    </mesh>
  );
};

// Floating particles
const Particles = () => {
  const particleCount = 200;
  const positions = useRef(new Float32Array(particleCount * 3));
  
  useEffect(() => {
    for (let i = 0; i < particleCount; i++) {
      positions.current[i*3] = (Math.random() - 0.5) * 12;
      positions.current[i*3+1] = (Math.random() - 0.5) * 8;
      positions.current[i*3+2] = (Math.random() - 0.5) * 8 - 4;
    }
  }, []);
  
  useFrame(() => {
    for (let i = 0; i < particleCount; i++) {
      positions.current[i*3+1] += 0.002;
      if (positions.current[i*3+1] > 4) positions.current[i*3+1] = -4;
    }
  });
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.05} transparent opacity={0.3} />
    </points>
  );
};

// Main MoodShift Component
const MoodShift = ({ onSelectTechnique }) => {
  const [currentState, setCurrentState] = useState('overwhelm');
  const [transitioning, setTransitioning] = useState(false);
  const [showText, setShowText] = useState(true);
  
  const states = [
    { 
      id: 'overwhelm', 
      text: 'Feeling overwhelmed? Your nervous system is on high alert.', 
      button: 'Find calm', 
      nextState: 'calm', 
      technique: null,
      bgGradient: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4a 100%)'
    },
    { 
      id: 'calm', 
      text: 'This is regulation. Your body can rest. Try box breathing to anchor it.', 
      button: 'Find focus', 
      nextState: 'focus', 
      technique: 'box-breathing',
      bgGradient: 'linear-gradient(135deg, #0a2b2e 0%, #1a4a5a 100%)'
    },
    { 
      id: 'focus', 
      text: "Now you're focused. Ready to work?", 
      button: 'Go to Priority Matrix', 
      nextState: null, 
      technique: 'priority-matrix',
      bgGradient: 'linear-gradient(135deg, #2d1b4a 0%, #fbbf24 100%)'
    }
  ];
  
  const current = states.find(s => s.id === currentState);
  
  const handleNext = () => {
    if (transitioning) return;
    setTransitioning(true);
    setShowText(false);
    
    if (current.nextState) {
      setTimeout(() => {
        setCurrentState(current.nextState);
        setTimeout(() => {
          setShowText(true);
          setTransitioning(false);
        }, 400);
      }, 500);
    } else {
      onSelectTechnique && onSelectTechnique(current.technique);
    }
  };
  
  // Manual camera rotation for the orb
  const [cameraAngle, setCameraAngle] = useState(0);
  
  useEffect(() => {
    if (currentState === 'overwhelm') {
      const interval = setInterval(() => {
        setCameraAngle(prev => prev + 0.02);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [currentState]);
  
  return (
    <div style={{ 
      width: '100%', 
      height: '500px', 
      position: 'relative',
      borderRadius: '24px',
      overflow: 'hidden',
      background: current.bgGradient,
      transition: 'background 0.8s ease',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      marginBottom: '24px'
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        <directionalLight position={[0, 5, 5]} intensity={0.8} />
        
        <group rotation={[0, cameraAngle, 0]}>
          <MorphingOrb state={currentState} />
        </group>
        <Particles />
      </Canvas>
      
      {/* Text Card */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: `translateX(-50%) scale(${showText ? 1 : 0.9})`,
          width: '85%',
          maxWidth: '380px',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: '28px',
          padding: '20px 24px',
          textAlign: 'center',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          opacity: showText ? 1 : 0,
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <p style={{ 
          color: 'white', 
          fontSize: '1rem', 
          marginBottom: '16px',
          lineHeight: 1.5,
          fontWeight: 500
        }}>
          {current.text}
        </p>
        <button
          onClick={handleNext}
          disabled={transitioning}
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #9f7aea, #4fd1c5)',
            border: 'none',
            borderRadius: '40px',
            color: 'white',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: transitioning ? 0.6 : 1
          }}
        >
          {current.button}
        </button>
      </div>
    </div>
  );
};

export default MoodShift;

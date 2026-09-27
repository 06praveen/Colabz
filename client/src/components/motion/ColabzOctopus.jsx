import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Code2, FolderGit2, CheckSquare, AlertCircle, PhoneCall, MessageSquare, Users, Bell } from 'lucide-react';

/**
 * ColabzOctopus — 2D Character Mascot & Interactive Radial UI Hub
 * "MANY HANDS. ONE WORKSPACE."
 *
 * Implements 7 core animation behaviors:
 * 1. Eye Tracking with Spring Physics & Velocity-based Squash/Stretch
 * 2. Anticipatory & Randomized Blinking (including double-blinks)
 * 3. Idle Random Glances, Breathing Pulse, and Tentacle Sway
 * 4. Secondary Tentacle Follow-Through & Lag Physics
 * 5. Interactive Node Hover & Activation Energy Pulse
 * 6. Bioluminescent Particle Streams along Tentacle Paths
 * 7. Micro-Expressions (Excited Sparkle, Relaxed Idle Eyes, Dynamic Mouth Morphing)
 */
export default function ColabzOctopus({
  mode = 'hero', // hero | radial-hub | compact
  width = 580,
  height = 500,
  interactive = true,
  activeNodeId = null,
  onNodeSelect = null,
  className = '',
  style = {}
}) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef(null);

  // Active node hover state
  const [hoveredNode, setHoveredNode] = useState(null);
  const activeIndex = hoveredNode !== null 
    ? hoveredNode 
    : (activeNodeId !== null ? activeNodeId : null);

  // Eye Tracking & Physics State
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [pupilScale, setPupilScale] = useState({ scaleX: 1, scaleY: 1 });
  const prevEyePos = useRef({ x: 0, y: 0 });

  // Blinking State: 'open' | 'anticipate' | 'blink'
  const [blinkState, setBlinkState] = useState('open');

  // Idle & Mood State: 'happy' | 'excited' | 'relaxed' | 'focused'
  const [mood, setMood] = useState('happy');
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef(null);
  const lastMouseTimeRef = useRef(Date.now());  // 8 Radial Workspace Nodes Config with Equal Wavy Motion Paths & Equal Thickness
  const radialNodes = [
    {
      id: 'notifications',
      label: 'Notifications',
      desc: 'Live Activity',
      icon: Bell,
      angle: 270,
      pos: { x: 300, y: 45 },
      bodyConnect: { x: 300, y: 212 },
      dBase: 'M 300,212 C 300,165 300,105 300,45',
      dActive: 'M 300,212 C 265,160 335,95 300,45',
      dWavy: 'M 300,212 C 335,160 265,95 300,45',
      suctionDots: [{ cx: 300, cy: 175, r: 3 }, { cx: 300, cy: 125, r: 3 }, { cx: 300, cy: 75, r: 2.5 }],
      color: '#38bdf8'
    },
    {
      id: 'members',
      label: 'Members',
      desc: 'Team Roles',
      icon: Users,
      angle: 315,
      pos: { x: 445, y: 105 },
      bodyConnect: { x: 326, y: 226 },
      dBase: 'M 326,226 C 370,178 410,140 445,105',
      dActive: 'M 326,226 C 410,150 370,185 445,105',
      dWavy: 'M 326,226 C 340,220 430,115 445,105',
      suctionDots: [{ cx: 360, cy: 190, r: 3 }, { cx: 395, cy: 155, r: 3 }, { cx: 425, cy: 125, r: 2.5 }],
      color: '#c084fc'
    },
    {
      id: 'chat',
      label: 'Chat',
      desc: 'Real-time Rooms',
      icon: MessageSquare,
      angle: 0,
      pos: { x: 505, y: 260 },
      bodyConnect: { x: 342, y: 260 },
      dBase: 'M 342,260 C 400,260 460,260 505,260',
      dActive: 'M 342,260 C 400,225 460,295 505,260',
      dWavy: 'M 342,260 C 400,295 460,225 505,260',
      suctionDots: [{ cx: 385, cy: 254, r: 3 }, { cx: 430, cy: 262, r: 3 }, { cx: 475, cy: 260, r: 2.5 }],
      color: '#00e5a3'
    },
    {
      id: 'calls',
      label: 'Calls',
      desc: 'Voice & Video',
      icon: PhoneCall,
      angle: 45,
      pos: { x: 445, y: 415 },
      bodyConnect: { x: 326, y: 294 },
      dBase: 'M 326,294 C 370,342 410,380 445,415',
      dActive: 'M 326,294 C 395,325 385,400 445,415',
      dWavy: 'M 326,294 C 345,360 435,360 445,415',
      suctionDots: [{ cx: 360, cy: 330, r: 3 }, { cx: 395, cy: 365, r: 3 }, { cx: 425, cy: 395, r: 2.5 }],
      color: '#a855f7'
    },
    {
      id: 'issues',
      label: 'Issues',
      desc: 'Bug Tracker',
      icon: AlertCircle,
      angle: 90,
      pos: { x: 300, y: 475 },
      bodyConnect: { x: 300, y: 308 },
      dBase: 'M 300,308 C 300,355 300,415 300,475',
      dActive: 'M 300,308 C 335,360 265,425 300,475',
      dWavy: 'M 300,308 C 265,360 335,425 300,475',
      suctionDots: [{ cx: 300, cy: 345, r: 3 }, { cx: 300, cy: 395, r: 3 }, { cx: 300, cy: 445, r: 2.5 }],
      color: '#f43f5e'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      desc: 'Kanban Boards',
      icon: CheckSquare,
      angle: 135,
      pos: { x: 155, y: 415 },
      bodyConnect: { x: 274, y: 294 },
      dBase: 'M 274,294 C 230,342 190,380 155,415',
      dActive: 'M 274,294 C 205,325 215,400 155,415',
      dWavy: 'M 274,294 C 255,360 165,360 155,415',
      suctionDots: [{ cx: 240, cy: 330, r: 3 }, { cx: 205, cy: 365, r: 3 }, { cx: 175, cy: 395, r: 2.5 }],
      color: '#eab308'
    },
    {
      id: 'projects',
      label: 'Projects',
      desc: 'Workspaces',
      icon: FolderGit2,
      angle: 180,
      pos: { x: 95, y: 260 },
      bodyConnect: { x: 258, y: 260 },
      dBase: 'M 258,260 C 200,260 140,260 95,260',
      dActive: 'M 258,260 C 200,225 140,295 95,260',
      dWavy: 'M 258,260 C 200,295 140,225 95,260',
      suctionDots: [{ cx: 215, cy: 254, r: 3 }, { cx: 170, cy: 262, r: 3 }, { cx: 125, cy: 260, r: 2.5 }],
      color: '#3b82f6'
    },
    {
      id: 'code',
      label: 'Code',
      desc: 'Git Repositories',
      icon: Code2,
      angle: 225,
      pos: { x: 155, y: 105 },
      bodyConnect: { x: 274, y: 226 },
      dBase: 'M 274,226 C 230,178 190,140 155,105',
      dActive: 'M 274,226 C 190,150 230,185 155,105',
      dWavy: 'M 274,226 C 260,220 170,115 155,105',
      suctionDots: [{ cx: 240, cy: 190, r: 3 }, { cx: 205, cy: 155, r: 3 }, { cx: 175, cy: 125, r: 2.5 }],
      color: '#00e5a3'
    }
  ];

  // 1. EYE TRACKING & SQUASH/STRETCH PHYSICS
  const updateEyeTarget = useCallback((targetX, targetY) => {
    // Calculate velocity for squash/stretch
    const dx = targetX - prevEyePos.current.x;
    const dy = targetY - prevEyePos.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy);

    prevEyePos.current = { x: targetX, y: targetY };
    setEyePos({ x: targetX, y: targetY });

    if (speed > 0.5) {
      const stretchFactor = Math.min(speed * 0.08, 0.35);
      const angle = Math.atan2(dy, dx);
      setPupilScale({
        scaleX: 1 + Math.abs(Math.cos(angle)) * stretchFactor - Math.abs(Math.sin(angle)) * (stretchFactor * 0.5),
        scaleY: 1 + Math.abs(Math.sin(angle)) * stretchFactor - Math.abs(Math.cos(angle)) * (stretchFactor * 0.5)
      });
      // Settle back to normal 1:1 scale
      setTimeout(() => setPupilScale({ scaleX: 1, scaleY: 1 }), 180);
    }
  }, []);

  // Mouse Move Event Listener for Eye Tracking
  const handleMouseMove = useCallback((e) => {
    if (!interactive || shouldReduceMotion) return;
    lastMouseTimeRef.current = Date.now();
    if (isIdle) setIsIdle(false);
    if (activeIndex === null && mood === 'relaxed') setMood('happy');

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clampX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    const clampY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

    // Max eye pupil displacement (8px horizontally, 7px vertically)
    updateEyeTarget(clampX * 8.5, clampY * 7);
  }, [interactive, shouldReduceMotion, isIdle, activeIndex, mood, updateEyeTarget]);

  // Handle global mouse move listener
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // 2. RANDOMIZED & ANTICIPATORY BLINKING LOGIC
  useEffect(() => {
    if (shouldReduceMotion) return;

    let timeoutId;
    const scheduleNextBlink = () => {
      // Blink interval between 3000ms and 6000ms
      const delay = Math.random() * 3000 + 3000;
      timeoutId = setTimeout(() => {
        // Step 1: Anticipatory eye-narrowing (eyelid squeeze for 80ms)
        setBlinkState('anticipate');
        setTimeout(() => {
          // Step 2: Full blink close (110ms)
          setBlinkState('blink');
          setTimeout(() => {
            // Step 3: 18% Chance of a playful Double Blink!
            const isDoubleBlink = Math.random() < 0.18;
            if (isDoubleBlink) {
              setBlinkState('open');
              setTimeout(() => {
                setBlinkState('blink');
                setTimeout(() => {
                  setBlinkState('open');
                  scheduleNextBlink();
                }, 100);
              }, 70);
            } else {
              setBlinkState('open');
              scheduleNextBlink();
            }
          }, 110);
        }, 80);
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(timeoutId);
  }, [shouldReduceMotion]);

  // 3. IDLE RANDOM GLANCES & MOOD SHIFTS
  useEffect(() => {
    if (shouldReduceMotion) return;

    const idleChecker = setInterval(() => {
      const now = Date.now();
      const timeSinceMouse = now - lastMouseTimeRef.current;

      if (timeSinceMouse > 2500 && activeIndex === null) {
        setIsIdle(true);

        // Pick a random direction / angle for idle glance
        const randomAngle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 5 + 3;
        updateEyeTarget(Math.cos(randomAngle) * dist, Math.sin(randomAngle) * dist);

        // Mood shift to relaxed if idle for >7 seconds
        if (timeSinceMouse > 7000) {
          setMood('relaxed');
        }
      }
    }, 3200);

    return () => clearInterval(idleChecker);
  }, [shouldReduceMotion, activeIndex, updateEyeTarget]);

  // 5. NODE HOVER / ACTIVATION FEEDBACK & MOOD RESPONSE
  useEffect(() => {
    if (activeIndex !== null) {
      setMood('excited');
      setIsIdle(false);
      const targetNode = radialNodes[activeIndex];
      if (targetNode) {
        const rad = (targetNode.angle * Math.PI) / 180;
        updateEyeTarget(Math.cos(rad) * 9, Math.sin(rad) * 7.5);
      }
    } else if (!isIdle) {
      setMood('happy');
    }
  }, [activeIndex, isIdle, updateEyeTarget]);

  // Node Hover Handlers
  const handleNodeMouseEnter = (index) => {
    setHoveredNode(index);
  };
  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
  };
  const handleNodeClick = (node, index) => {
    if (onNodeSelect) onNodeSelect(node, index);
  };

  const isCompact = mode === 'compact';

  return (
    <div
      ref={containerRef}
      className={`colabz-octopus-hub-container ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
        ...style
      }}
    >
      <svg
        viewBox="0 0 600 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          {/* Bioluminescent Gradient Palette */}
          <radialGradient id="octoHeadGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="35%" stopColor="#00e5a3" />
            <stop offset="75%" stopColor="#059669" />
            <stop offset="100%" stopColor="#022c22" />
          </radialGradient>

          <radialGradient id="octoGlowAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5a3" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#00e5a3" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00e5a3" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="activeNodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5a3" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00e5a3" stopOpacity="0" />
          </radialGradient>

          {/* High-Definition Neon Glow Filter */}
          <filter id="octoGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="nodeBrightGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="headShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000000" floodOpacity="0.5" />
          </filter>

          {/* Tentacle Gradient */}
          <linearGradient id="tentacleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#00e5a3" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="activeTentacleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="50%" stopColor="#00e5a3" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* Ambient Background Glow Aura */}
        <ellipse cx="300" cy="260" rx="90" ry="82" fill="url(#octoGlowAura)" opacity="0.5" />

        {/* 4. TENTACLE PHYSICS & BEZIER SWAY (BACKGROUND LAYER) */}
        <g id="octopus-tentacles">
          {radialNodes.map((node, idx) => {
            const isActive = activeIndex === idx;

            return (
              <g key={node.id}>
                {/* Glow Underlay for Active Tentacle */}
                {isActive && (
                  <motion.path
                    d={node.dBase}
                    stroke="#00e5a3"
                    strokeWidth="14"
                    strokeLinecap="round"
                    opacity="0.45"
                    filter="url(#octoGlow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Main Tentacle Path with Synchronized Fluid Wavy Motion */}
                <motion.path
                  d={node.dBase}
                  stroke={isActive ? 'url(#activeTentacleGrad)' : 'url(#tentacleGrad)'}
                  strokeWidth={isActive ? '9.5' : '8.5'}
                  strokeLinecap="round"
                  filter="url(#octoGlow)"
                  initial={{ d: node.dBase }}
                  animate={
                    shouldReduceMotion
                      ? { d: node.dBase }
                      : {
                          d: [node.dBase, node.dActive, node.dWavy, node.dBase]
                        }
                  }
                  transition={{
                    duration: 3.0,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: [0.42, 0, 0.58, 1]
                  }}
                />

                {/* 6. BIOLUMINESCENT PARTICLE STREAMS ALONG TENTACLE PATHS */}
                <motion.path
                  d={node.dBase}
                  stroke="#ffffff"
                  strokeWidth={isActive ? '3.5' : '2'}
                  strokeDasharray="4 22"
                  strokeLinecap="round"
                  opacity={isActive ? '0.95' : '0.45'}
                  animate={{
                    strokeDashoffset: [0, -104]
                  }}
                  transition={{
                    duration: isActive ? 1.2 : 2.8,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />

                {/* Suction Cups */}
                {node.suctionDots.map((dot, dIdx) => (
                  <circle
                    key={dIdx}
                    cx={dot.cx}
                    cy={dot.cy}
                    r={dot.r}
                    fill="#f0fdf4"
                    stroke="#00e5a3"
                    strokeWidth="0.8"
                    opacity="0.9"
                  />
                ))}

                {/* 5. ENERGY PULSE WAVE TRAVELING TO ACTIVE NODE */}
                {isActive && (
                  <motion.circle
                    r="6"
                    fill="#ffffff"
                    filter="url(#octoGlow)"
                    animate={{
                      cx: [node.bodyConnect.x, node.pos.x],
                      cy: [node.bodyConnect.y, node.pos.y],
                      scale: [0.6, 1.3, 0.8],
                      opacity: [1, 1, 0]
                    }}
                    transition={{
                      duration: 0.95,
                      repeat: Infinity,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* CENTRAL MASCOT BODY & HEAD WITH PERIODIC SLOW 360 SPIN */}
        <motion.g
          id="octopus-mascot-core"
          filter="url(#headShadow)"
          style={{ transformOrigin: '300px 260px' }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  rotate: [0, 0, 360, 360]
                }
          }
          transition={{
            duration: 6.5,
            repeat: Infinity,
            repeatDelay: 1.0,
            times: [0, 0.35, 0.82, 1],
            ease: [0.25, 1, 0.5, 1]
          }}
        >
          {/* Head Body Oval with Breathing Pulse */}
          <motion.ellipse
            cx="300"
            cy="260"
            rx="56"
            ry="48"
            fill="url(#octoHeadGrad)"
            stroke="#a7f3d0"
            strokeWidth="1.8"
            filter="url(#octoGlow)"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: mood === 'excited' ? [1, 1.04, 1] : [1, 1.025, 1]
                  }
            }
            transition={{
              scale: { duration: mood === 'excited' ? 1.8 : 3.4, repeat: Infinity, ease: 'easeInOut' }
            }}
          />

          {/* Head Specular Highlight Shine */}
          <ellipse
            cx="280"
            cy="238"
            rx="22"
            ry="13"
            fill="#ffffff"
            opacity="0.35"
            transform="rotate(-22 280 238)"
          />

          {/* Code Emblem on Forehead < /> */}
          <g transform="translate(286, 226) scale(0.7)" opacity="0.9">
            <path d="M 6 0 L 0 6 L 6 12" stroke="#ecfdf5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M 14 0 L 20 6 L 14 12" stroke="#ecfdf5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="12" y1="1" x2="8" y2="11" stroke="#34d399" strokeWidth="2.2" strokeLinecap="round" />
          </g>

          {/* EXPRESSIVE EYES GROUP (WITH EYE TRACKING & BLINKING) */}
          <g id="octopus-eyes">
            {/* Left Eye Socket */}
            <circle cx="280" cy="258" r="13" fill="#080a0d" stroke="#00e5a3" strokeWidth="1.5" />
            {/* Right Eye Socket */}
            <circle cx="320" cy="258" r="13" fill="#080a0d" stroke="#00e5a3" strokeWidth="1.5" />

            {/* BLINKING ANATOMY */}
            {blinkState === 'blink' ? (
              <>
                {/* Cute Closed Eye Arcs */}
                <path d="M 270 258 Q 280 265 290 258" stroke="#00e5a3" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M 310 258 Q 320 265 330 258" stroke="#00e5a3" strokeWidth="3" strokeLinecap="round" fill="none" />
              </>
            ) : blinkState === 'anticipate' ? (
              <>
                {/* Anticipatory Flattened Lid Squeeze */}
                <path d="M 269 256 Q 280 262 291 256" stroke="#00e5a3" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 309 256 Q 320 262 331 256" stroke="#00e5a3" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </>
            ) : mood === 'relaxed' ? (
              <>
                {/* Relaxed Half-Closed Idle Eyes */}
                <path d="M 270 256 Q 280 261 290 256" stroke="#00e5a3" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 310 256 Q 320 261 330 256" stroke="#00e5a3" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                {/* Soft pupil glimpse beneath */}
                <circle cx={280 + eyePos.x * 0.5} cy={260} r="3.5" fill="#ffffff" />
                <circle cx={320 + eyePos.x * 0.5} cy={260} r="3.5" fill="#ffffff" />
              </>
            ) : (
              <>
                {/* 1. Left Pupil with Tracking & Squash/Stretch */}
                <motion.g
                  animate={{
                    x: eyePos.x,
                    y: eyePos.y,
                    scaleX: pupilScale.scaleX,
                    scaleY: pupilScale.scaleY
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                >
                  <circle cx="280" cy="258" r={mood === 'excited' ? "6.2" : "5.5"} fill="#ffffff" />
                  <circle cx="278" cy="256" r="2.2" fill="#00e5a3" />
                  <circle cx="282.5" cy="259.5" r="1.1" fill="#ffffff" />

                  {/* 7. Sparkle Star Catchlights when Excited */}
                  {mood === 'excited' && (
                    <polygon
                      points="280,252 281.5,254.5 284,255 281.5,255.5 280,258 278.5,255.5 276,255 278.5,254.5"
                      fill="#ffffff"
                    />
                  )}
                </motion.g>

                {/* 1. Right Pupil with Tracking & Squash/Stretch */}
                <motion.g
                  animate={{
                    x: eyePos.x,
                    y: eyePos.y,
                    scaleX: pupilScale.scaleX,
                    scaleY: pupilScale.scaleY
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                >
                  <circle cx="320" cy="258" r={mood === 'excited' ? "6.2" : "5.5"} fill="#ffffff" />
                  <circle cx="318" cy="256" r="2.2" fill="#00e5a3" />
                  <circle cx="322.5" cy="259.5" r="1.1" fill="#ffffff" />

                  {/* 7. Sparkle Star Catchlights when Excited */}
                  {mood === 'excited' && (
                    <polygon
                      points="320,252 321.5,254.5 324,255 321.5,255.5 320,258 318.5,255.5 316,255 318.5,254.5"
                      fill="#ffffff"
                    />
                  )}
                </motion.g>
              </>
            )}
          </g>

          {/* Rosy Cheeks */}
          <ellipse cx="268" cy="268" rx="5.5" ry="3.5" fill="#f43f5e" opacity="0.4" />
          <ellipse cx="332" cy="268" rx="5.5" ry="3.5" fill="#f43f5e" opacity="0.4" />

          {/* 5 & 7. DYNAMIC MOUTH EXPRESSIONS */}
          {mood === 'excited' ? (
            /* Open Happy Smile with Pink Tongue */
            <g>
              <path
                d="M 291 270 Q 300 282 309 270 Z"
                fill="#080a0d"
                stroke="#00e5a3"
                strokeWidth="1.2"
              />
              <path
                d="M 294 276 Q 300 282 306 276"
                fill="#f43f5e"
                opacity="0.85"
              />
            </g>
          ) : (
            /* Cute Curved Smile */
            <path
              d="M 293 271 Q 300 277 307 271"
              stroke="#080a0d"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </motion.g>

        {/* 5. RADIAL INTERACTIVE NODES (OUTER CIRCLE IN HERO / RADIAL MODE) */}
        {!isCompact && (
          <g id="radial-hub-nodes">
            {radialNodes.map((node, idx) => {
              const IconComp = node.icon;
              const isActive = activeIndex === idx;

              return (
                <g
                  key={`node-group-${node.id}`}
                  onMouseEnter={() => handleNodeMouseEnter(idx)}
                  onMouseLeave={handleNodeMouseLeave}
                  onClick={() => handleNodeClick(node, idx)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Active Radiating Pulse Ring */}
                  {isActive && (
                    <motion.circle
                      cx={node.pos.x}
                      cy={node.pos.y}
                      r="26"
                      fill="none"
                      stroke="#00e5a3"
                      strokeWidth="2"
                      animate={{
                        r: [24, 38],
                        opacity: [0.9, 0]
                      }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        ease: 'easeOut'
                      }}
                    />
                  )}

                  {/* Outer Circle Ring */}
                  <motion.circle
                    cx={node.pos.x}
                    cy={node.pos.y}
                    r="24"
                    fill={isActive ? 'var(--bg-elevated)' : 'var(--bg-surface)'}
                    stroke={isActive ? '#00e5a3' : 'var(--border-default)'}
                    strokeWidth={isActive ? '2.5' : '1.5'}
                    filter={isActive ? 'url(#nodeBrightGlow)' : 'none'}
                    animate={{
                      scale: isActive ? 1.12 : 1
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  />

                  {/* Icon Rendering inside SVG ForeignObject for Clean Lucide Integration */}
                  <foreignObject
                    x={node.pos.x - 12}
                    y={node.pos.y - 12}
                    width="24"
                    height="24"
                    style={{ pointerEvents: 'none' }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? '#00e5a3' : 'var(--text-secondary)'
                      }}
                    >
                      <IconComp size={16} />
                    </div>
                  </foreignObject>

                  {/* Labeled Node Pill Tag */}
                  <foreignObject
                    x={node.pos.x - 55}
                    y={node.pos.y + (node.angle > 180 || node.angle === 0 ? 28 : -50)}
                    width="110"
                    height="28"
                    style={{ pointerEvents: 'none', overflow: 'visible' }}
                  >
                    <motion.div
                      animate={{
                        scale: isActive ? 1.05 : 1,
                        y: isActive ? -2 : 0
                      }}
                      style={{
                        backgroundColor: isActive ? 'var(--bg-elevated)' : 'rgba(17, 21, 28, 0.85)',
                        border: isActive ? '1px solid #00e5a3' : '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '2px 8px',
                        textAlign: 'center',
                        boxShadow: isActive ? '0 0 12px rgba(0, 229, 163, 0.3)' : '0 2px 8px rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: isActive ? '#00e5a3' : 'var(--text-primary)',
                          letterSpacing: '0.02em',
                          display: 'block',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {node.label}
                      </span>
                    </motion.div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}

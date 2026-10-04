import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function AuthScene({ mode = 'login', isInputFocused = false }) {
  const mountRef = useRef(null);
  const isInputFocusedRef = useRef(isInputFocused);
  const modeRef = useRef(mode);

  useEffect(() => {
    isInputFocusedRef.current = isInputFocused;
  }, [isInputFocused]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer;
    let animationFrameId;

    try {
      const width = mount.clientWidth || window.innerWidth || 400;
      const height = mount.clientHeight || window.innerHeight || 400;

      // 1. Scene, Camera, Renderer
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x07080a, 0.035);

      const isMobile = window.innerWidth < 640;
      const cameraZ = isMobile ? 26 : 20;

      const camera = new THREE.PerspectiveCamera(45, width / (height || 1), 0.1, 1000);
      camera.position.set(0, 0, cameraZ);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      mount.appendChild(renderer.domElement);

      // 2. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const purpleLight = new THREE.PointLight(0x8b7cff, 2.2, 40);
      purpleLight.position.set(-4, 3, 8);
      scene.add(purpleLight);

      const cyanLight = new THREE.PointLight(0x00e5a3, 2.0, 40);
      cyanLight.position.set(4, -3, 8);
      scene.add(cyanLight);

      // 3. Central Background Workspace Node
      const workspaceGroup = new THREE.Group();
      workspaceGroup.position.set(0, 0, 0);

      const coreGeo = new THREE.OctahedronGeometry(1.2, 2);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x00e5a3,
        roughness: 0.2,
        metalness: 0.8,
        emissive: 0x047857,
        emissiveIntensity: modeRef.current === 'signup' ? 0.7 : 0.4,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      workspaceGroup.add(coreMesh);

      const wireGeo = new THREE.IcosahedronGeometry(1.8, 1);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x00e5a3,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      workspaceGroup.add(wireMesh);

      scene.add(workspaceGroup);

      // 4. Orbiting Workspace Sub-Nodes
      const nodesConfig = [
        { name: 'PT (Lead)', color: 0x8b7cff, radius: 4.2, angle: 0, speed: 0.006, size: 0.32 },
        { name: 'RH (Dev)', color: 0x00e5a3, radius: 4.8, angle: (Math.PI * 2) / 5, speed: 0.005, size: 0.32 },
        { name: 'AM (Dev)', color: 0x3b82f6, radius: 3.8, angle: (Math.PI * 4) / 5, speed: 0.0065, size: 0.32 },
        { name: 'REPO', color: 0x06b6d4, radius: 5.2, angle: (Math.PI * 6) / 5, speed: 0.005, size: 0.36 },
        { name: 'TASKS', color: 0xf59e0b, radius: 4.5, angle: (Math.PI * 8) / 5, speed: 0.0055, size: 0.34 },
      ];

      const nodeObjects = [];

      nodesConfig.forEach((cfg) => {
        const geo = new THREE.SphereGeometry(cfg.size, 20, 20);
        const mat = new THREE.MeshStandardMaterial({
          color: cfg.color,
          roughness: 0.3,
          metalness: 0.7,
          emissive: cfg.color,
          emissiveIntensity: 0.4,
        });
        const mesh = new THREE.Mesh(geo, mat);
        workspaceGroup.add(mesh);

        // Connection Line to Workspace Core
        const lineMat = new THREE.LineBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: 0.25,
        });
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, 0),
        ]);
        const lineMesh = new THREE.Line(lineGeo, lineMat);
        workspaceGroup.add(lineMesh);

        nodeObjects.push({ mesh, cfg, lineMesh, lineGeo, lineMat });
      });

      // 5. Star Particle Constellation
      const particleCount = 140;
      const particleGeo = new THREE.BufferGeometry();
      const particlePos = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        particlePos[i] = (Math.random() - 0.5) * 35;
        particlePos[i + 1] = (Math.random() - 0.5) * 35;
        particlePos[i + 2] = (Math.random() - 0.5) * 25 - 5;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

      const particleMat = new THREE.PointsMaterial({
        color: 0x00e5a3,
        size: 0.06,
        transparent: true,
        opacity: 0.35,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // 6. Mouse Parallax
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (e) => {
        const rect = mount.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        mouseX = (x / (rect.width || 1)) * 2 - 1;
        mouseY = -(y / (rect.height || 1)) * 2 + 1;
      };

      mount.addEventListener('mousemove', handleMouseMove);

      const handleResize = () => {
        if (!mount || !renderer) return;
        const newW = mount.clientWidth;
        const newH = mount.clientHeight;
        camera.aspect = newW / (newH || 1);

        const isMob = newW < 640;
        camera.position.z = isMob ? 26 : 20;

        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };

      window.addEventListener('resize', handleResize);

      // 7. Animation Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const isFocused = isInputFocusedRef.current;
        const currentMode = modeRef.current;

        // Core rotation
        coreMesh.rotation.y += currentMode === 'signup' ? 0.006 : 0.004;
        coreMesh.rotation.x += 0.002;
        wireMesh.rotation.y -= 0.003;

        // Pulse effect on input focus
        if (isFocused) {
          const pulse = 1 + Math.sin(Date.now() * 0.004) * 0.04;
          coreMesh.scale.set(pulse, pulse, pulse);
          wireMat.opacity = 0.38;
        } else {
          coreMesh.scale.set(1, 1, 1);
          wireMat.opacity = 0.2;
        }

        // Nodes Orbiting Workspace
        nodeObjects.forEach((item) => {
          const speedMultiplier = currentMode === 'signup' ? 1.25 : 1.0;
          item.cfg.angle += item.cfg.speed * speedMultiplier;
          const x = Math.cos(item.cfg.angle) * item.cfg.radius;
          const y = Math.sin(item.cfg.angle * 1.3) * 1.1;
          const z = Math.sin(item.cfg.angle) * item.cfg.radius;

          item.mesh.position.set(x, y, z);

          const positions = new Float32Array([0, 0, 0, x, y, z]);
          item.lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          item.lineGeo.attributes.position.needsUpdate = true;
          item.lineMat.opacity = isFocused ? 0.4 : 0.2;
        });

        particles.rotation.y += 0.0004;

        // Subtle Camera Parallax
        targetX += (mouseX * 0.8 - targetX) * 0.03;
        targetY += (-mouseY * 0.8 - targetY) * 0.03;
        camera.position.x = targetX;
        camera.position.y = targetY;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        if (mount) {
          mount.removeEventListener('mousemove', handleMouseMove);
          if (renderer?.domElement && mount.contains(renderer.domElement)) {
            mount.removeChild(renderer.domElement);
          }
        }
        if (renderer) {
          renderer.dispose();
        }
      };
    } catch (err) {
      console.warn('WebGL fallback mode:', err);
    }
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />

      {/* Subtle System Status Tag */}
      <div
        className="font-mono"
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: '2rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          background: 'rgba(11, 13, 16, 0.75)',
          padding: '0.4rem 0.85rem',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 10,
        }}
      >
        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
        <span>COLABZ AUTH // {mode === 'signup' ? 'CREATING WORKSPACE' : 'SECURE SESSION READY'}</span>
      </div>
    </div>
  );
}

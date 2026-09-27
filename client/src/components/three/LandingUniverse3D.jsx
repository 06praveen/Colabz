import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function LandingUniverse3D() {
  const mountRef = useRef(null);
  const [activeMetadata, setActiveMetadata] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07080a, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const purpleLight = new THREE.PointLight(0x8b7cff, 3, 40);
    purpleLight.position.set(0, 0, 6);
    scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2, 40);
    cyanLight.position.set(6, 6, 6);
    scene.add(cyanLight);

    // 3. Central Project Node Group
    const projectGroup = new THREE.Group();

    const coreGeo = new THREE.IcosahedronGeometry(1.7, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x8b7cff,
      roughness: 0.15,
      metalness: 0.85,
      emissive: 0x4a34c9,
      emissiveIntensity: 0.7,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.userData = {
      title: 'PROJECT: campus-connect',
      details: '24 commits • 4 contributors • 12 tasks • 3 issues'
    };
    projectGroup.add(coreMesh);

    const wireGeo = new THREE.IcosahedronGeometry(2.3, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x5ea1ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    projectGroup.add(wireMesh);

    scene.add(projectGroup);

    // 4. Surrounding Functional Nodes (7 Nodes)
    const nodesConfig = [
      { id: 'dev1', title: 'TEAM MEMBER', details: 'Praveen Tiwari (Lead Architect)', color: 0x8b7cff, radius: 5.2, angle: 0, speed: 0.008, size: 0.4 },
      { id: 'dev2', title: 'TEAM MEMBER', details: 'Rahul Sharma (Full-Stack Dev)', color: 0x3ddb82, radius: 5.8, angle: (Math.PI * 2) / 7, speed: 0.007, size: 0.4 },
      { id: 'dev3', title: 'TEAM MEMBER', details: 'Amit Verma (Backend Dev)', color: 0x5ea1ff, radius: 4.8, angle: (Math.PI * 4) / 7, speed: 0.009, size: 0.4 },
      { id: 'repo', title: 'REPOSITORY', details: 'main • 24 commits • 8 branches', color: 0x06b6d4, radius: 6.2, angle: (Math.PI * 6) / 7, speed: 0.006, size: 0.48 },
      { id: 'tasks', title: 'TASKS', details: '12 open tasks • 3 in progress', color: 0xffb800, radius: 5.5, angle: (Math.PI * 8) / 7, speed: 0.0075, size: 0.44 },
      { id: 'issues', title: 'ISSUES', details: '3 active issues • 1 bug report', color: 0xff5c70, radius: 5.0, angle: (Math.PI * 10) / 7, speed: 0.0085, size: 0.42 },
      { id: 'ship', title: 'DEPLOYMENT', details: 'Production ready • v1.0.0', color: 0xa855f7, radius: 6.5, angle: (Math.PI * 12) / 7, speed: 0.0055, size: 0.5 },
    ];

    const nodeObjects = [];

    nodesConfig.forEach((cfg) => {
      const geo = new THREE.SphereGeometry(cfg.size, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.2,
        metalness: 0.8,
        emissive: cfg.color,
        emissiveIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { title: cfg.title, details: cfg.details };
      scene.add(mesh);

      // Connection Line
      const lineMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.4,
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const lineMesh = new THREE.Line(lineGeo, lineMat);
      scene.add(lineMesh);

      nodeObjects.push({ mesh, cfg, lineMesh, lineGeo });
    });

    // 5. Star Particle Field
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 40;
      particlePos[i + 1] = (Math.random() - 0.5) * 40;
      particlePos[i + 2] = (Math.random() - 0.5) * 30 - 5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x8b7cff,
      size: 0.07,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Parallax & Raycaster
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleMouseMove = (e) => {
      const rect = mount.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseX = (x / width) * 2 - 1;
      mouseY = -(y / height) * 2 + 1;

      mouseVector.x = mouseX;
      mouseVector.y = mouseY;
    };

    mount.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Frame Loop
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Core Project Slow Rotation
      coreMesh.rotation.y += 0.005;
      coreMesh.rotation.x += 0.002;
      wireMesh.rotation.y -= 0.003;

      // Orbiting Nodes
      nodeObjects.forEach((item) => {
        item.cfg.angle += item.cfg.speed;
        const x = Math.cos(item.cfg.angle) * item.cfg.radius;
        const y = Math.sin(item.cfg.angle * 1.4) * 1.5;
        const z = Math.sin(item.cfg.angle) * item.cfg.radius;

        item.mesh.position.set(x, y, z);

        // Update Line Endpoints
        const positions = new Float32Array([0, 0, 0, x, y, z]);
        item.lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        item.lineGeo.attributes.position.needsUpdate = true;
      });

      // Ambient Particle Drift
      particles.rotation.y += 0.0006;

      // Smooth Camera Parallax
      targetX += (mouseX * 1.8 - targetX) * 0.04;
      targetY += (-mouseY * 1.8 - targetY) * 0.04;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      // Raycasting Hover Interaction
      raycaster.setFromCamera(mouseVector, camera);
      const targetObjects = [coreMesh, ...nodeObjects.map(n => n.mesh)];
      const intersects = raycaster.intersectObjects(targetObjects);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.title) {
          setActiveMetadata({
            title: hit.userData.title,
            details: hit.userData.details
          });
        }
      } else {
        setActiveMetadata(null);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (mount) {
        mount.removeEventListener('mousemove', handleMouseMove);
        if (renderer.domElement) mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '540px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'radial-gradient(circle at center, rgba(139, 124, 255, 0.05) 0%, rgba(7, 8, 10, 0.95) 75%)', border: '1px solid var(--border-default)' }}>
      {/* Three.js WebGL Canvas */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'crosshair' }} />

      {/* Hover Telemetry Metadata Overlay */}
      {activeMetadata ? (
        <div
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(11, 13, 16, 0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--accent-primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.65rem 1.25rem',
            textAlign: 'center',
            boxShadow: '0 0 25px var(--accent-glow)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.08em' }}>
            {activeMetadata.title}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '0.15rem' }}>
            {activeMetadata.details}
          </div>
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            background: 'rgba(7, 8, 10, 0.6)',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-subtle)',
            pointerEvents: 'none'
          }}
        >
          Hover over nodes to inspect real-time project telemetry
        </div>
      )}
    </div>
  );
}

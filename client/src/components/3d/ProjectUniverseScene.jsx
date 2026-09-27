import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ProjectUniverseScene() {
  const mountRef = useRef(null);
  const [activeHoverNode, setActiveHoverNode] = useState('Central Project Universe');

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Dimensions
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07080a, 0.05);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x8b7cff, 2.5, 30);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 1.8, 30);
    cyanLight.position.set(5, 5, 5);
    scene.add(cyanLight);

    // 3. Central Project Node (Icosahedron Mesh + Wireframe Outer Shell)
    const projectGroup = new THREE.Group();

    const coreGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x8b7cff,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
      emissive: 0x3d27b4,
      emissiveIntensity: 0.6,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    projectGroup.add(coreMesh);

    const wireGeo = new THREE.IcosahedronGeometry(2.1, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x5ea1ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    projectGroup.add(wireMesh);

    scene.add(projectGroup);

    // 4. Developer / Team Nodes (3 Orbital Nodes)
    const devData = [
      { name: 'Praveen (Lead Architect)', color: 0x06b6d4, radius: 4.5, angle: 0, speed: 0.012 },
      { name: 'Rahul (Full-Stack Dev)', color: 0x3ddb82, radius: 5.2, angle: (Math.PI * 2) / 3, speed: 0.01 },
      { name: 'Amit (Backend Engineer)', color: 0xffb800, radius: 4.2, angle: (Math.PI * 4) / 3, speed: 0.015 },
    ];

    const devMeshes = [];
    const lineGeometries = [];
    const lineMeshes = [];

    devData.forEach((dev) => {
      // Dev Sphere Mesh
      const devGeo = new THREE.SphereGeometry(0.45, 32, 32);
      const devMat = new THREE.MeshStandardMaterial({
        color: dev.color,
        roughness: 0.3,
        metalness: 0.7,
        emissive: dev.color,
        emissiveIntensity: 0.4,
      });
      const devMesh = new THREE.Mesh(devGeo, devMat);
      devMesh.userData = { name: dev.name };
      scene.add(devMesh);

      // Line connecting Dev Node to Project Node
      const lineMat = new THREE.LineDashedMaterial({
        color: dev.color,
        dashSize: 0.2,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.5,
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ]);
      const lineMesh = new THREE.Line(lineGeo, lineMat);
      scene.add(lineMesh);

      devMeshes.push({ devMesh, data: dev, lineMesh, lineGeo });
    });

    // 5. Star / Particle Constellation Field
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 35;
      particlePos[i + 1] = (Math.random() - 0.5) * 35;
      particlePos[i + 2] = (Math.random() - 0.5) * 25 - 5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x8b7cff,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 6. Mouse Parallax & Raycasting Setup
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleMouseMove = (event) => {
      const rect = mount.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      mouseX = (x / width) * 2 - 1;
      mouseY = -(y / height) * 2 + 1;

      mouseVector.x = mouseX;
      mouseVector.y = mouseY;
    };

    mount.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Core Project Rotation
      coreMesh.rotation.y += 0.008;
      coreMesh.rotation.x += 0.004;
      wireMesh.rotation.y -= 0.005;

      // Orbiting Developer Nodes
      devMeshes.forEach((item) => {
        item.data.angle += item.data.speed;
        const x = Math.cos(item.data.angle) * item.data.radius;
        const y = Math.sin(item.data.angle * 1.5) * 1.2;
        const z = Math.sin(item.data.angle) * item.data.radius;

        item.devMesh.position.set(x, y, z);

        // Update Line Endpoints
        const positions = new Float32Array([0, 0, 0, x, y, z]);
        item.lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        item.lineGeo.attributes.position.needsUpdate = true;
      });

      // Background Particles Slow Drift
      particleSystem.rotation.y += 0.0008;

      // Mouse Parallax Lerping
      targetX += (mouseX * 1.5 - targetX) * 0.05;
      targetY += (-mouseY * 1.5 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      // Raycasting Hover Check
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects([coreMesh, ...devMeshes.map(d => d.devMesh)]);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit === coreMesh) {
          setActiveHoverNode('Central Project Repository: Colabz');
        } else if (hit.userData && hit.userData.name) {
          setActiveHoverNode(`Active Team Member: ${hit.userData.name}`);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
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
    <div style={{ position: 'relative', width: '100%', height: '480px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
      {/* 3D WebGL Canvas Target */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* Live Telemetry Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          background: 'rgba(11, 13, 16, 0.85)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.5rem 0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
          pointerEvents: 'none'
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }} />
        <span>NODE TELEMETRY: <strong style={{ color: 'var(--accent-cyan)' }}>{activeHoverNode}</strong></span>
      </div>

      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          background: 'rgba(7, 8, 10, 0.6)',
          padding: '0.3rem 0.6rem',
          borderRadius: '4px',
          border: '1px solid var(--border-subtle)',
          pointerEvents: 'none'
        }}
      >
        Interactive WebGL • Mouse Parallax Active
      </div>
    </div>
  );
}

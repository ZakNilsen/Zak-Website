"use client";

import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

const WATER_Y = -0.4;

// ---------------------------------------------------------------------------
// Canvas-generated textures (no external assets needed)
// ---------------------------------------------------------------------------
function usePlanetTexture(): THREE.CanvasTexture {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, "#f6d9a8");
    grad.addColorStop(0.35, "#e8a86c");
    grad.addColorStop(0.65, "#c9714f");
    grad.addColorStop(1, "#7c3f4d");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#000000";
      ctx.fillRect(0, (i / 8) * size + Math.sin(i) * 6, size, 6);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function useTreeSilhouetteTexture(): THREE.CanvasTexture {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.moveTo(0, 256);
    let x = 0;
    while (x < 512) {
      const h = 60 + Math.random() * 130;
      const w = 30 + Math.random() * 40;
      ctx.lineTo(x, 256 - h * 0.2);
      ctx.lineTo(x + w / 2, 256 - h);
      ctx.lineTo(x + w, 256 - h * 0.2);
      x += w * 0.8;
    }
    ctx.lineTo(512, 256);
    ctx.closePath();
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

// ---------------------------------------------------------------------------
// Sky background: a big gradient sphere behind everything
// ---------------------------------------------------------------------------
function SkyBackdrop() {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2;
    c.height = 256;
    const ctx = c.getContext("2d") as CanvasRenderingContext2D;
    const g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, "#050810");
    g.addColorStop(0.45, "#0b1330");
    g.addColorStop(0.75, "#1a2a4a");
    g.addColorStop(1, "#0a1220");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 2, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[80, 32, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Planet + ring, floating on the horizon
// ---------------------------------------------------------------------------
function Planet() {
  const groupRef = useRef<THREE.Group>(null);
  const planetTex = usePlanetTexture();

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.05;
  });

  return (
    <group ref={groupRef} position={[4.5, 1.1, -18]}>
      <mesh>
        <sphereGeometry args={[2.2, 48, 48]} />
        <meshBasicMaterial map={planetTex} />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <ringGeometry args={[2.9, 3.6, 64]} />
        <meshBasicMaterial color="#e8c9a0" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Aurora ribbons
// ---------------------------------------------------------------------------
function Aurora() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const colors = ["#4be3a0", "#7ee8fa", "#a685ff"];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      mesh.position.x = Math.sin(t * 0.15 + i * 1.7) * 2.5;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 + i * 0.02 + Math.sin(t * 0.4 + i * 1.7) * 0.02;
    });
  });

  return (
    <group>
      {colors.map((color, i) => (
        <mesh
          key={color}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[0, 7 + i * 1.4, -22 - i * 2]}
          rotation={[0.1, 0, 0]}
        >
          <planeGeometry args={[28, 6, 40, 1]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1 + i * 0.03}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Forest silhouette, foreground
// ---------------------------------------------------------------------------
function Forest() {
  const tex = useTreeSilhouetteTexture();
  return (
    <mesh position={[0, 2.2, 2]}>
      <planeGeometry args={[30, 6]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Campfire: light + flame particles + embers + logs
// ---------------------------------------------------------------------------
function Campfire() {
  const lightRef = useRef<THREE.PointLight>(null);
  const flameRef = useRef<THREE.Points>(null);
  const emberRef = useRef<THREE.Points>(null);

  const flameCount = 24;
  const emberCount = 40;

  const flamePositions = useMemo(() => {
    const arr = new Float32Array(flameCount * 3);
    for (let i = 0; i < flameCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.25;
      arr[i * 3 + 1] = Math.random() * 0.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
    }
    return arr;
  }, []);

  const emberData = useMemo(() => {
    const positions = new Float32Array(emberCount * 3);
    const speeds = new Float32Array(emberCount);
    for (let i = 0; i < emberCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 1] = Math.random() * 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      speeds[i] = 0.2 + Math.random() * 0.4;
    }
    return { positions, speeds };
  }, []);

  useFrame((_, delta) => {
    if (lightRef.current) {
      lightRef.current.intensity = 2.8 + Math.random() * 0.6;
    }
    if (flameRef.current) {
      const pos = flameRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < flameCount; i++) {
        let y = pos.getY(i) + delta * 0.9;
        if (y > 0.6) y = 0;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      flameRef.current.rotation.y += delta * 0.5;
    }
    if (emberRef.current) {
      const pos = emberRef.current.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < emberCount; i++) {
        let y = pos.getY(i) + emberData.speeds[i] * delta * 0.6;
        if (y > 2.2) y = 0;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group position={[0, WATER_Y + 0.02, 1.5]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, (i / 4) * Math.PI, Math.PI / 2]} position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.9, 8]} />
          <meshBasicMaterial color="#241611" />
        </mesh>
      ))}

      <points ref={flameRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[flamePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.35}
          color="#ffb15c"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={emberRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[emberData.positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#ffcf8a"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <pointLight ref={lightRef} color="#ff9d4d" intensity={3.2} distance={9} decay={2} position={[0, 0.6, 0]} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Water: drei's Reflector gives us a REAL mirrored reflection of the scene
// ---------------------------------------------------------------------------
function Water() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 0]}>
      <planeGeometry args={[60, 40]} />
      <MeshReflectorMaterial
        resolution={1024}
        mirror={0.6}
        mixBlur={8}
        mixStrength={1.2}
        blur={[300, 100]}
        color="#0a1420"
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Slight camera bob for a living, breathing feel
// ---------------------------------------------------------------------------
function CameraRig() {
  const { camera } = useThree();
  useFrame(({ clock }) => {
    camera.position.y = 1.4 + Math.sin(clock.getElapsedTime() * 0.15) * 0.03;
  });
  return null;
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------
interface SecretCampfireSceneProps {
  onClose: () => void;
}

export default function SecretCampfireScene({ onClose }: SecretCampfireSceneProps) {
  const [showText, setShowText] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "black",
      }}
    >
      <Canvas
        style={{ width: "100%", height: "100%" }}
        camera={{ position: [0, 1.4, 7.5], fov: 50, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
        onCreated={() => setTimeout(() => setShowText(true), 900)}
      >
        <ambientLight color="#33456b" intensity={0.6} />
        <SkyBackdrop />
        <Stars radius={60} depth={30} count={900} factor={2.5} fade speed={0.3} />
        <Planet />
        <Aurora />
        <Forest />
        <Campfire />
        <Water />
        <CameraRig />
      </Canvas>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showText ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: "3.5rem",
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            color: "#cfe8ff",
            fontSize: "0.875rem",
            letterSpacing: "0.08em",
            fontWeight: 300,
            marginBottom: "0.5rem",
            fontFamily: "Georgia, serif",
          }}
        >
          You followed the old signal.
        </p>
        <h2
          style={{
            color: "#f4ead9",
            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
            fontWeight: 300,
            marginBottom: "0.75rem",
            fontFamily: "Georgia, serif",
          }}
        >
          Welcome to the clearing, wanderer.
        </h2>
        <p
          style={{
            color: "#9fb3d1",
            fontSize: "0.75rem",
            maxWidth: "24rem",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Stay a while. The fire doesn&apos;t mind. — Zak
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: showText ? 1 : 0 }}
        transition={{ duration: 1 }}
        onClick={onClose}
        style={{
          position: "absolute",
          top: "1.25rem",
          right: "1.25rem",
          color: "#cfe8ff",
          fontSize: "0.75rem",
          letterSpacing: "0.08em",
          border: "1px solid rgba(207, 232, 255, 0.3)",
          borderRadius: "9999px",
          padding: "0.5rem 1rem",
          background: "rgba(207, 232, 255, 0.03)",
          cursor: "pointer",
        }}
      >
        Close
      </motion.button>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";

interface SecretStarryNightSceneProps {
  onClose: () => void;
}

/* ========================================================================= */
/* Configuration                                                             */
/* ========================================================================= */

const WATER_Y = -1.15;
const METEOR_COUNT = 6;

/* ========================================================================= */
/* Deterministic random                                                      */
/* ========================================================================= */

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/** Approximate gaussian in [-1, 1]. */
function gaussian(random: () => number) {
  return (random() + random() + random() + random() - 2) / 2;
}

/* ========================================================================= */
/* Shared textures (lazy module singletons; page is client-only)            */
/* ========================================================================= */

let glowTexture: THREE.CanvasTexture | null = null;

/** Soft radial dot used for stars, glows, clouds and bushes. */
function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glowTexture = new THREE.CanvasTexture(canvas);
  return glowTexture;
}

let bandTexture: THREE.CanvasTexture | null = null;

/**
 * Soft horizontal band whose alpha reaches zero well before the texture
 * border. Wide stretched planes (horizon glows, clouds) must use this instead
 * of the radial glow texture — otherwise their rectangle shows up as a faint
 * box against the sky gradient on wide viewports.
 */
function getBandTexture() {
  if (bandTexture) return bandTexture;
  const w = 256;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(w, h);
  const smooth = (edge0: number, edge1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  };
  for (let y = 0; y < h; y++) {
    const dy = Math.abs(y / (h - 1) - 0.5) * 2; // 0 at center -> 1 at edge
    const fy = smooth(0.92, 0.35, dy);
    for (let x = 0; x < w; x++) {
      const dx = Math.abs(x / (w - 1) - 0.5) * 2;
      const fx = smooth(0.92, 0.3, dx);
      const i = (y * w + x) * 4;
      image.data[i] = 255;
      image.data[i + 1] = 255;
      image.data[i + 2] = 255;
      image.data[i + 3] = Math.round(255 * fx * fy);
    }
  }
  ctx.putImageData(image, 0, 0);
  bandTexture = new THREE.CanvasTexture(canvas);
  return bandTexture;
}

/* ========================================================================= */
/* Sky                                                                       */
/* ========================================================================= */

function Sky() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);

    // Canvas top = zenith; 0.5 = eye-level horizon.
    gradient.addColorStop(0.0, "#030510");
    gradient.addColorStop(0.26, "#0a0b28");
    gradient.addColorStop(0.36, "#171544");
    gradient.addColorStop(0.42, "#2a1a4c");
    gradient.addColorStop(0.45, "#45285a");
    gradient.addColorStop(0.47, "#6f4064");
    gradient.addColorStop(0.487, "#965c72");
    gradient.addColorStop(0.502, "#7c4a5e");
    // Below the horizon: dimmed mirror of the afterglow, seen through the water.
    gradient.addColorStop(0.515, "#89516a");
    gradient.addColorStop(0.535, "#5c3656");
    gradient.addColorStop(0.57, "#332048");
    gradient.addColorStop(0.63, "#1c1434");
    gradient.addColorStop(0.76, "#0e0a1e");
    gradient.addColorStop(1.0, "#070512");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[120, 48, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

/* ========================================================================= */
/* Stars                                                                     */
/* ========================================================================= */

function StarLayer({
  count,
  seed,
  size,
  opacity,
  color,
  materialRef,
}: {
  count: number;
  seed: number;
  size: number;
  opacity: number;
  color: string;
  materialRef?: React.RefObject<THREE.PointsMaterial | null>;
}) {
  const geometry = useMemo(() => {
    const random = seededRandom(seed);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(0.03 + random() * 0.9);
      const radius = 60 + random() * 40;
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.cos(phi) * radius;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [count, seed]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color,
      size,
      map: getGlowTexture(),
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [color, size, opacity]);

  useEffect(() => {
    if (materialRef) materialRef.current = material;
  }, [material, materialRef]);

  return <points geometry={geometry} material={material} />;
}

function StarsField() {
  const brightRef = useRef<THREE.PointsMaterial | null>(null);

  useFrame(({ clock }) => {
    if (!brightRef.current) return;
    brightRef.current.opacity = 0.85 + Math.sin(clock.getElapsedTime() * 1.7) * 0.15;
  });

  return (
    <>
      <StarLayer count={2200} seed={49201} size={0.55} opacity={0.75} color="#c8d8f8" />
      <StarLayer count={600} seed={5521} size={1.05} opacity={0.9} color="#e8eeff" />
      <StarLayer
        count={110}
        seed={90417}
        size={2.0}
        opacity={1}
        color="#ffffff"
        materialRef={brightRef}
      />
    </>
  );
}

/* ========================================================================= */
/* Milky Way                                                                 */
/* ========================================================================= */

function MilkyWay() {
  const hazeTexture = useMemo(() => {
    const w = 256;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const random = seededRandom(31337);

    for (let i = 0; i < 520; i++) {
      const y = random() * h;
      const dust = Math.sin((y / h) * Math.PI); // dust lane strongest mid-band
      let gx = gaussian(random);
      // Push blobs off the exact centerline to carve a dust lane.
      if (Math.abs(gx) < 0.22 && random() < dust * 0.8) {
        gx += gx >= 0 ? 0.3 : -0.3;
      }
      const x = w / 2 + gx * w * 0.16;
      const r = 8 + random() * 26;
      const a = 0.01 + random() * 0.035;
      const warm = random() < 0.18;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, warm ? `rgba(216,190,220,${a})` : `rgba(178,192,255,${a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }, []);

  const bandGeometry = useMemo(() => {
    const count = 2600;
    const random = seededRandom(7731);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = gaussian(random) * 4.6;
      positions[i * 3 + 1] = (random() * 2 - 1) * 31;
      positions[i * 3 + 2] = 1 + random() * 2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  const bandMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: "#cdd6ff",
      size: 0.45,
      map: getGlowTexture(),
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  return (
    <group position={[4, 26, -70]} rotation={[0, 0, 0.16]}>
      <mesh>
        <planeGeometry args={[26, 64]} />
        <meshBasicMaterial
          map={hazeTexture}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <points geometry={bandGeometry} material={bandMaterial} />
    </group>
  );
}

/* ========================================================================= */
/* Horizon glow                                                              */
/* ========================================================================= */

function HorizonGlow() {
  return (
    <>
      <mesh position={[-2, 1.6, -32]}>
        <planeGeometry args={[60, 9]} />
        <meshBasicMaterial
          color="#7c4258"
          map={getBandTexture()}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[-4, 0.9, -31]}>
        <planeGeometry args={[34, 5]} />
        <meshBasicMaterial
          color="#c97a5f"
          map={getBandTexture()}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

/* ========================================================================= */
/* Pine trees                                                                */
/* ========================================================================= */

/**
 * Jagged pine silhouette: from the tip down, each tier reaches out to a
 * drooping branch point then notches back toward the trunk. `detail`
 * multiplies the tier count (finer serration for trees near the camera).
 */
function createPineGeometry(random: () => number, detail = 1) {
  const height = 4.4 + random() * 1.8;
  const tiers = Math.round((11 + Math.floor(random() * 5)) * detail);
  const maxR = 0.85 + random() * 0.55;
  // Keep branch droop substantial on high-detail trees (flat spikes look fake
  // up close) and use shallow serration instead of deep saw-tooth notches.
  const droopFactor = 1 / Math.sqrt(detail);
  const closeUp = detail > 1.5;
  const notchBase = closeUp ? 0.52 : 0.2;
  const notchVar = closeUp ? 0.14 : 0.12;
  const reachJitter = closeUp ? 0.14 : 0.3;
  const shape = new THREE.Shape();
  shape.moveTo(0, height);

  const makeSide = (dir: number) => {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i < tiers; i++) {
      const t = (i + 1) / tiers;
      const y = height * (1 - Math.pow(t, 1.08) * 0.9);
      const reach =
        maxR *
        (0.16 + 0.84 * Math.pow(t, 0.85)) *
        (1 - reachJitter / 2 + random() * reachJitter);
      const droop = (0.08 + reach * (0.3 + random() * 0.2)) * droopFactor;
      pts.push([dir * reach, y - droop]);
      pts.push([
        dir * reach * (notchBase + random() * notchVar),
        y - droop - (0.05 + random() * 0.1) * droopFactor,
      ]);
    }
    return pts;
  };

  for (const [x, y] of makeSide(1)) shape.lineTo(x, y);
  shape.lineTo(0.07, -0.3);
  shape.lineTo(-0.07, -0.3);
  const left = makeSide(-1);
  for (let i = left.length - 1; i >= 0; i--) shape.lineTo(left[i][0], left[i][1]);
  shape.closePath();

  return new THREE.ShapeGeometry(shape);
}

let treeGeometryPool: THREE.ShapeGeometry[] | null = null;

function getTreeGeometries() {
  if (treeGeometryPool) return treeGeometryPool;
  const random = seededRandom(60321);
  treeGeometryPool = Array.from({ length: 10 }, () => createPineGeometry(random));
  return treeGeometryPool;
}

/* ========================================================================= */
/* Ridge (distant hills)                                                     */
/* ========================================================================= */

const RIDGE_POINTS: Array<[number, number]> = [
  [-52, 1.6], [-44, 0.9], [-37, 2.2], [-30, 1.2], [-24, 2.6],
  [-17, 1.4], [-10, 2.0], [-4, 1.1], [3, 2.3], [10, 1.3],
  [17, 2.5], [24, 1.2], [31, 2.0], [38, 1.0], [46, 2.2], [54, 1.1], [60, 1.8],
];

function createRidgeGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-60, -6);
  shape.lineTo(-60, 0.5);
  for (const [x, y] of RIDGE_POINTS) shape.lineTo(x, y);
  shape.lineTo(60, -6);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

/* ========================================================================= */
/* Scenery: ridge + shore + forest, built once and mirrored once             */
/* ========================================================================= */

function buildScenery(reflected: boolean) {
  const group = new THREE.Group();
  const side = THREE.DoubleSide;
  const treeGeometries = getTreeGeometries();

  // Keep the mirrored world strictly below the water surface, otherwise the
  // reflected geometry pokes up past the horizon as a slab across the sky.
  const clippingPlanes = reflected
    ? [new THREE.Plane(new THREE.Vector3(0, -1, 0), WATER_Y)]
    : undefined;

  const ridgeMaterial = new THREE.MeshBasicMaterial({
    color: reflected ? "#171230" : "#120e24",
    side,
    transparent: reflected,
    opacity: reflected ? 0.8 : 1,
    clippingPlanes,
  });
  const backMaterial = new THREE.MeshBasicMaterial({
    color: reflected ? "#0d0b1e" : "#0a0816",
    side,
    transparent: reflected,
    opacity: reflected ? 0.85 : 1,
    clippingPlanes,
  });
  const frontMaterial = new THREE.MeshBasicMaterial({
    color: reflected ? "#080714" : "#040309",
    side,
    transparent: reflected,
    opacity: reflected ? 0.9 : 1,
    clippingPlanes,
  });
  const shoreMaterial = new THREE.MeshBasicMaterial({
    color: reflected ? "#080714" : "#04030a",
    side,
    transparent: reflected,
    opacity: reflected ? 0.9 : 1,
    clippingPlanes,
  });

  const addTree = (
    geometry: THREE.ShapeGeometry,
    x: number,
    y: number,
    z: number,
    scale: number,
    material: THREE.Material
  ) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.scale.set(scale, scale, 1);
    group.add(mesh);
  };

  const ridge = new THREE.Mesh(createRidgeGeometry(), ridgeMaterial);
  ridge.position.set(0, -0.6, -22);
  group.add(ridge);

  // Shore band grounding the trunks.
  const shore = new THREE.Mesh(new THREE.PlaneGeometry(70, 0.9), shoreMaterial);
  shore.position.set(0, -0.95, -12.2);
  group.add(shore);

  // Back forest row (stratified x placement: even coverage, no clumps).
  {
    const random = seededRandom(18273);
    const count = 95;
    for (let i = 0; i < count; i++) {
      const x = -33 + ((i + (random() - 0.5) * 0.9) / (count - 1)) * 66;
      const z = -14.5 + random() * 1.5;
      const scale = 0.28 + random() * 0.3;
      const geometry = treeGeometries[Math.floor(random() * treeGeometries.length)];
      addTree(geometry, x, -0.95, z, scale, backMaterial);
    }
  }

  // Front forest row: slightly taller trees toward the edges.
  {
    const random = seededRandom(88123);
    const count = 85;
    for (let i = 0; i < count; i++) {
      const x = -32 + ((i + (random() - 0.5) * 0.9) / (count - 1)) * 64;
      const z = -12.5 + random() * 1.2;
      const edge = Math.min(1, Math.abs(x) / 24);
      const scale = 0.42 + random() * 0.42 + edge * 0.3;
      const geometry = treeGeometries[Math.floor(random() * treeGeometries.length)];
      addTree(geometry, x, -1.05, z, scale, frontMaterial);
    }
  }

  return group;
}

function Scenery() {
  const scenery = useMemo(() => buildScenery(false), []);
  const reflection = useMemo(() => buildScenery(true), []);

  return (
    <>
      <primitive object={scenery} />
      <primitive
        object={reflection}
        position={[0, 2 * (WATER_Y + 0.02), 0]}
        scale={[1, -1, 1]}
      />
    </>
  );
}

/* ========================================================================= */
/* Water                                                                     */
/* ========================================================================= */

function Water() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => new THREE.PlaneGeometry(140, 70, 100, 60), []);

  const originalPositions = useMemo(
    () => Float32Array.from(geometry.attributes.position.array),
    [geometry]
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();
    const position = mesh.geometry.attributes.position;
    for (let i = 0; i < position.count; i++) {
      const x = originalPositions[i * 3];
      const y = originalPositions[i * 3 + 1];
      const wave =
        Math.sin(x * 0.34 + t * 0.42) * 0.02 +
        Math.sin(y * 0.55 - t * 0.3) * 0.014 +
        Math.sin((x + y) * 0.18 + t * 0.2) * 0.01;
      position.setZ(i, originalPositions[i * 3 + 2] + wave);
    }
    position.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, WATER_Y, -20]}
      renderOrder={2}
    >
      <meshStandardMaterial
        color="#0a0d1f"
        roughness={0.35}
        metalness={0.25}
        transparent
        opacity={0.42}
        depthWrite={false}
      />
    </mesh>
  );
}

/* Sky glow reflected on the water: pink near the far shore, fading closer. */
function WaterGlow() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0.0, "rgba(150,92,114,0.55)");
    gradient.addColorStop(0.18, "rgba(110,64,96,0.34)");
    gradient.addColorStop(0.45, "rgba(70,42,86,0.17)");
    gradient.addColorStop(0.8, "rgba(40,26,60,0.06)");
    gradient.addColorStop(1.0, "rgba(30,20,50,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 4, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, WATER_Y + 0.03, -3]}
        renderOrder={3}
      >
        <planeGeometry args={[64, 18]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Brighter warm patch mirroring the strongest part of the afterglow. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-3, WATER_Y + 0.04, -9]}
        renderOrder={3}
      >
        <planeGeometry args={[30, 7]} />
        <meshBasicMaterial
          color="#a05a58"
          map={getBandTexture()}
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

/* ========================================================================= */
/* Star reflections                                                          */
/* ========================================================================= */

function StarReflections() {
  const reflections = useMemo(() => {
    const random = seededRandom(7132);
    return Array.from({ length: 110 }, () => ({
      x: -16 + random() * 32,
      z: -1 + random() * 12,
      width: 0.015 + random() * 0.06,
      opacity: 0.06 + random() * 0.14,
    }));
  }, []);

  return (
    <group position={[0, WATER_Y + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {reflections.map((reflection, i) => (
        <mesh
          key={i}
          position={[reflection.x, reflection.z, 0]}
          scale={[reflection.width, 0.01 + reflection.width * 0.3, 1]}
          renderOrder={3}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#b8c8ec"
            transparent
            opacity={reflection.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ========================================================================= */
/* Foreground shoreline                                                      */
/* ========================================================================= */

function Shoreline() {
  const rocks = useMemo(() => {
    const random = seededRandom(88291);
    return Array.from({ length: 26 }, () => ({
      x: -16 + random() * 32,
      z: 3.6 + random() * 3.4,
      scale: 0.12 + random() * 0.32,
      rotation: random() * Math.PI,
    }));
  }, []);

  return (
    <group>
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          position={[rock.x, WATER_Y + rock.scale * 0.25, rock.z]}
          rotation={[0, rock.rotation, 0]}
          scale={[rock.scale * 1.9, rock.scale, rock.scale * 1.4]}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#04060c" roughness={1} />
        </mesh>
      ))}

      {/* Dark ground strip at the very bottom of the frame. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y + 0.01, 6.5]}>
        <planeGeometry args={[60, 6]} />
        <meshBasicMaterial color="#020308" />
      </mesh>

      {/* Bush silhouettes along the near shore. */}
      {[
        { x: -4.2, y: -0.6, z: 5.5, sx: 3.2, sy: 1.6 },
        { x: 3.4, y: -0.7, z: 5.8, sx: 2.6, sy: 1.3 },
        { x: 0.5, y: -0.85, z: 6.2, sx: 2.2, sy: 1.0 },
      ].map((bush, i) => (
        <mesh key={i} position={[bush.x, bush.y, bush.z]} scale={[bush.sx, bush.sy, 1]} renderOrder={4}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            color="#01020a"
            map={getGlowTexture()}
            transparent
            opacity={0.95}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* Dark bank mound grounding a framing tree at the water's edge. The base
   stays shallow — a deep base shows through the transparent water as a slab. */
function createMoundGeometry(random: () => number, width: number, height: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -0.25);
  const segments = 10;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = -width / 2 + t * width;
    const y = Math.sin(t * Math.PI) * height * (0.7 + random() * 0.5);
    shape.lineTo(x, y);
  }
  shape.lineTo(width / 2, -0.25);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

/* Large near-silhouette pines framing the left and right edges. */
function FramingTrees() {
  const { trees, mounds } = useMemo(() => {
    const random = seededRandom(3141);
    const trees = [
      { geometry: createPineGeometry(random, 3), x: -10.4, y: WATER_Y - 0.4, z: -5, scale: 2.6 },
      { geometry: createPineGeometry(random, 3), x: 10.8, y: WATER_Y - 0.3, z: -4.5, scale: 2.0 },
    ];
    const mounds = [
      { geometry: createMoundGeometry(random, 11, 0.9), x: -10.4, z: -4.6 },
      { geometry: createMoundGeometry(random, 9, 0.7), x: 10.8, z: -4.2 },
    ];
    return { trees, mounds };
  }, []);

  const reflectionClip = useMemo(
    () => [new THREE.Plane(new THREE.Vector3(0, -1, 0), WATER_Y)],
    []
  );

  return (
    <>
      {trees.map((tree, i) => (
        <React.Fragment key={i}>
          <mesh
            geometry={tree.geometry}
            position={[tree.x, tree.y, tree.z]}
            scale={[tree.scale, tree.scale, 1]}
          >
            <meshBasicMaterial color="#010208" side={THREE.DoubleSide} />
          </mesh>
          {/* The tree's reflection dominates the near water below its bank,
              occluding the far-forest reflections behind it. */}
          <mesh
            geometry={tree.geometry}
            position={[tree.x, 2 * WATER_Y - tree.y, tree.z]}
            scale={[tree.scale, -tree.scale, 1]}
          >
            <meshBasicMaterial
              color="#06050f"
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
              clippingPlanes={reflectionClip}
            />
          </mesh>
        </React.Fragment>
      ))}
      {mounds.map((mound, i) => (
        <React.Fragment key={i}>
          <mesh
            geometry={mound.geometry}
            position={[mound.x, WATER_Y, mound.z]}
            renderOrder={4}
          >
            <meshBasicMaterial color="#010208" side={THREE.DoubleSide} />
          </mesh>
          {/* The bank's own reflection, occluding the far-forest
              reflections in the water directly below it. */}
          <mesh
            geometry={mound.geometry}
            position={[mound.x, WATER_Y, mound.z]}
            scale={[1, -1, 1]}
          >
            <meshBasicMaterial
              color="#06050f"
              side={THREE.DoubleSide}
              transparent
              opacity={0.9}
              clippingPlanes={reflectionClip}
            />
          </mesh>
        </React.Fragment>
      ))}
    </>
  );
}

/* ========================================================================= */
/* Grass                                                                     */
/* ========================================================================= */

/** Small clump of grass blades leaning outward from the base. */
function createGrassTuftGeometry(random: () => number) {
  const shape = new THREE.Shape();
  const blades = 5 + Math.floor(random() * 4);
  const width = 0.5;
  shape.moveTo(-width, 0);
  for (let i = 0; i < blades; i++) {
    const t = (i + 0.5) / blades;
    const baseX = -width + t * width * 2;
    const h = 0.5 + random() * 0.9;
    const lean = (t - 0.5) * 0.8 + (random() - 0.5) * 0.3;
    shape.lineTo(baseX + lean * h * 0.4, h);
    shape.lineTo(baseX + (width / blades) * 0.7, 0.02);
  }
  shape.lineTo(width, 0);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

/* Tufts along the framing-tree banks and the near shore. */
function Grass() {
  const tufts = useMemo(() => {
    const random = seededRandom(77551);
    const geometries = Array.from({ length: 6 }, () => createGrassTuftGeometry(random));
    const list: Array<{
      geometry: THREE.ShapeGeometry;
      x: number;
      y: number;
      z: number;
      sx: number;
      sy: number;
    }> = [];

    const addTuft = (x: number, y: number, z: number, scale: number) => {
      list.push({
        geometry: geometries[Math.floor(random() * geometries.length)],
        x,
        y,
        z,
        sx: scale * (0.8 + random() * 0.6),
        sy: scale,
      });
    };

    // Left bank mound (center -10.4, width 11, height ~0.9)
    for (let i = 0; i < 10; i++) {
      const t = 0.08 + random() * 0.84;
      const x = -10.4 + (t - 0.5) * 11;
      const y = WATER_Y + Math.sin(t * Math.PI) * 0.9 * 0.8 - 0.04;
      addTuft(x, y, -4.5, 0.3 + random() * 0.25);
    }

    // Right bank mound (center 10.8, width 9, height ~0.7)
    for (let i = 0; i < 8; i++) {
      const t = 0.08 + random() * 0.84;
      const x = 10.8 + (t - 0.5) * 9;
      const y = WATER_Y + Math.sin(t * Math.PI) * 0.7 * 0.8 - 0.04;
      addTuft(x, y, -4.1, 0.28 + random() * 0.22);
    }

    // Near shore at the bottom of the frame
    for (let i = 0; i < 14; i++) {
      const x = -13 + random() * 26;
      const z = 4.6 + random() * 1.6;
      addTuft(x, WATER_Y + 0.02, z, 0.3 + random() * 0.3);
    }

    return list;
  }, []);

  return (
    <>
      {tufts.map((tuft, i) => (
        <mesh
          key={i}
          geometry={tuft.geometry}
          position={[tuft.x, tuft.y, tuft.z]}
          scale={[tuft.sx, tuft.sy, 1]}
          renderOrder={5}
        >
          <meshBasicMaterial color="#010208" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

/* ========================================================================= */
/* Meteors                                                                   */
/* ========================================================================= */

type MeteorData = {
  startX: number;
  startY: number;
  startZ: number;
  travelX: number;
  travelY: number;
  duration: number;
  delay: number;
  length: number;
};

function createMeteorData(): MeteorData[] {
  const random = seededRandom(92481);
  return Array.from({ length: METEOR_COUNT }, (_, i) => {
    const dir = random() < 0.5 ? -1 : 1;
    return {
      startX: -16 + random() * 32,
      startY: 6 + random() * 12,
      startZ: -55 - random() * 10,
      travelX: dir * (5 + random() * 6),
      travelY: -(4 + random() * 5),
      duration: 0.7 + random() * 0.9,
      delay: i * 2.1 + random() * 5,
      length: 4.5 + random() * 4,
    };
  });
}

let meteorTrailTexture: THREE.CanvasTexture | null = null;

/** Trail brightens toward the head (right edge of the texture). */
function getMeteorTrailTexture() {
  if (meteorTrailTexture) return meteorTrailTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 8;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 128, 0);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.7, "rgba(220,230,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 8);
  meteorTrailTexture = new THREE.CanvasTexture(canvas);
  return meteorTrailTexture;
}

function Meteor({ data }: { data: MeteorData }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const head = headRef.current;
    const trail = trailRef.current;
    if (!group || !head || !trail) return;

    const cycle = data.duration + 7;
    const elapsed = (clock.getElapsedTime() + data.delay) % cycle;
    const progress = elapsed / data.duration;

    if (progress < 0 || progress > 1) {
      group.visible = false;
      return;
    }

    group.visible = true;
    const p = progress * progress * (3 - 2 * progress);
    group.position.set(
      data.startX + data.travelX * p,
      data.startY + data.travelY * p,
      data.startZ
    );
    group.rotation.z = Math.atan2(data.travelY, data.travelX);

    const fade = Math.min(progress / 0.12, (1 - progress) / 0.25, 1);
    (head.material as THREE.MeshBasicMaterial).opacity = fade;
    (trail.material as THREE.MeshBasicMaterial).opacity = fade * 0.85;
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={headRef}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial
          color="#ffffff"
          map={getGlowTexture()}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={trailRef} position={[-data.length / 2, 0, 0]}>
        <planeGeometry args={[data.length, 0.09]} />
        <meshBasicMaterial
          color="#cfe0ff"
          map={getMeteorTrailTexture()}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function MeteorShower() {
  const meteors = useMemo(createMeteorData, []);
  return (
    <>
      {meteors.map((meteor, i) => (
        <Meteor key={i} data={meteor} />
      ))}
    </>
  );
}

/* One big, bright meteor fired when the visitor makes their wish to leave. */
function WishMeteor({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const startRef = useRef<number | null>(null);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const head = headRef.current;
    const trail = trailRef.current;
    if (!group || !head || !trail) return;

    if (!active) {
      group.visible = false;
      return;
    }

    const t = clock.getElapsedTime();
    if (startRef.current === null) startRef.current = t;
    const progress = (t - startRef.current) / 1.2;
    if (progress > 1) {
      group.visible = false;
      return;
    }

    group.visible = true;
    const p = progress * progress * (3 - 2 * progress);
    group.position.set(-20 + 36 * p, 15 - 9 * p, -45);
    group.rotation.z = Math.atan2(-9, 36);

    const fade = Math.min(progress / 0.1, (1 - progress) / 0.25, 1);
    (head.material as THREE.MeshBasicMaterial).opacity = fade;
    (trail.material as THREE.MeshBasicMaterial).opacity = fade;
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={headRef}>
        <planeGeometry args={[1.2, 1.2]} />
        <meshBasicMaterial
          color="#ffffff"
          map={getGlowTexture()}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={trailRef} position={[-6.5, 0, 0]}>
        <planeGeometry args={[13, 0.16]} />
        <meshBasicMaterial
          color="#dfeaff"
          map={getMeteorTrailTexture()}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ========================================================================= */
/* Camera                                                                    */
/* ========================================================================= */

function CameraRig() {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Almost imperceptible drift; the scene should feel alive,
    // not like the camera is floating.
    camera.position.x = Math.sin(t * 0.055) * 0.035;
    camera.position.y = 1.15 + Math.sin(t * 0.08) * 0.018;
    camera.lookAt(0, 1.4, -12);
  });

  return null;
}

/* ========================================================================= */
/* Main Scene                                                                */
/* ========================================================================= */

function TwinkleStar({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      style={{ display: "inline-block" }}
      animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.15, 0.9] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay }}
    >
      ✦
    </motion.span>
  );
}

export default function SecretStarryNightScene({ onClose }: SecretStarryNightSceneProps) {
  const [showText, setShowText] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleWish = () => {
    if (leaving) return;
    setLeaving(true);
    // Wish meteor streaks (~1.2s), fade to black (0.5s delay + 1.2s), then go home.
    window.setTimeout(onClose, 1900);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "100%",
        overflow: "hidden",
        background: "#010309",
      }}
    >
      <Canvas
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        camera={{ position: [0, 1.15, 8], fov: 54, near: 0.1, far: 300 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          // Required so the mirrored scenery stays below the water surface.
          localClippingEnabled: true,
        }}
        dpr={[1, 1.75]}
        onCreated={() => {
          window.setTimeout(() => setShowText(true), 1400);
        }}
      >
        {/* Ambient night lighting (water + rocks use standard materials) */}
        <ambientLight color="#52527a" intensity={0.5} />
        <directionalLight color="#8a7a9a" intensity={0.25} position={[-8, 10, -20]} />

        {/* Sky */}
        <Sky />
        <StarsField />
        <MilkyWay />
        <HorizonGlow />

        {/* Landscape and its reflection */}
        <Scenery />

        {/* Water */}
        <Water />
        <WaterGlow />
        <StarReflections />

        {/* Foreground */}
        <Shoreline />
        <FramingTrees />
        <Grass />

        {/* Meteors */}
        <MeteorShower />
        <WishMeteor active={leaving} />

        <CameraRig />
      </Canvas>

      {/* Cinematic vignette */}
      <div className="cosmic-vignette" />

      {/* Slight atmospheric overlay */}
      <div className="cosmic-atmosphere" />

      {/* Text */}
      <motion.div
        className="cosmic-message"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 18 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <span className="cosmic-kicker">THE NIGHT SKY REMEMBERS</span>
        <h2>
          Somewhere beyond
          <br />
          the trees.
        </h2>
        <p>
          Look up.
          <br />
          You might catch something.
        </p>

        {/* Wish-on-a-star exit: fires a bright meteor, fades out, goes home */}
        <motion.button
          onClick={handleWish}
          disabled={leaving}
          style={{
            pointerEvents: "auto",
            marginTop: "1.4rem",
            padding: "0.6rem 1.3rem",
            borderRadius: 999,
            border: "1px solid rgba(190,211,237,0.22)",
            background: "rgba(8,12,24,0.35)",
            color: "rgba(214,226,244,0.8)",
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            cursor: leaving ? "default" : "pointer",
            backdropFilter: "blur(8px)",
          }}
          whileHover={
            leaving
              ? undefined
              : {
                  borderColor: "rgba(205,224,245,0.55)",
                  color: "#eef4fb",
                  backgroundColor: "rgba(90,110,170,0.12)",
                  boxShadow: "0 0 22px rgba(150,180,255,0.22)",
                  scale: 1.03,
                }
          }
          whileTap={leaving ? undefined : { scale: 0.97 }}
        >
          {leaving ? (
            <>wish granted — safe travels ✦</>
          ) : (
            <>
              <TwinkleStar />
              &nbsp; wish on a star — it&rsquo;ll take you home &nbsp;
              <TwinkleStar delay={1.2} />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Fade to black while the wish meteor crosses, then redirect */}
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 9,
          pointerEvents: "none",
          background: "#010309",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: leaving ? 1 : 0 }}
        transition={{ duration: 1.2, ease: "easeInOut", delay: leaving ? 0.5 : 0 }}
      />
    </div>
  );
}

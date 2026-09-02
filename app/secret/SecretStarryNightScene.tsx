"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

import { motion } from "framer-motion";

interface SecretStarryNightSceneProps {
  onClose: () => void;
}

/* ========================================================================= */
/* Configuration                                                              */
/* ========================================================================= */

const WATER_Y = -1.15;

const METEOR_COUNT = 7;
const STAR_COUNT = 2400;
const MILKY_WAY_COUNT = 1100;

/* ========================================================================= */
/* Deterministic random                                                       */
/* ========================================================================= */

function seededRandom(seed: number) {
  let value = seed;

  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/* ========================================================================= */
/* Sky                                                                        */
/* ========================================================================= */

function Sky() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");

    canvas.width = 4;
    canvas.height = 1024;

    const ctx = canvas.getContext("2d")!;

    const gradient = ctx.createLinearGradient(
      0,
      0,
      0,
      canvas.height
    );

    gradient.addColorStop(0, "#01030a");
    gradient.addColorStop(0.2, "#030713");
    gradient.addColorStop(0.45, "#071125");
    gradient.addColorStop(0.67, "#101d35");
    gradient.addColorStop(0.82, "#172842");
    gradient.addColorStop(1, "#09131f");

    ctx.fillStyle = gradient;
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    /*
     * Very subtle horizon glow.
     */
    const horizon = ctx.createLinearGradient(
      0,
      canvas.height * 0.55,
      0,
      canvas.height
    );

    horizon.addColorStop(
      0,
      "rgba(100,130,180,0)"
    );

    horizon.addColorStop(
      0.55,
      "rgba(95,120,160,0.05)"
    );

    horizon.addColorStop(
      1,
      "rgba(30,60,90,0.18)"
    );

    ctx.fillStyle = horizon;

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const texture = new THREE.CanvasTexture(
      canvas
    );

    texture.colorSpace =
      THREE.SRGBColorSpace;

    return texture;
  }, []);

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry
        args={[100, 48, 32]}
      />

      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ========================================================================= */
/* Stars                                                                      */
/* ========================================================================= */

function StarsField() {
  const geometry = useMemo(() => {
    const random = seededRandom(49201);

    const positions = new Float32Array(
      STAR_COUNT * 3
    );

    const sizes = new Float32Array(
      STAR_COUNT
    );

    for (let i = 0; i < STAR_COUNT; i++) {
      /*
       * Avoid a completely uniform sphere.
       * Most stars live in the upper hemisphere.
       */
      const theta =
        random() * Math.PI * 2;

      const phi =
        Math.acos(
          0.05 +
            random() * 0.88
        );

      const radius =
        35 +
        random() * 40;

      positions[i * 3] =
        Math.sin(phi) *
        Math.cos(theta) *
        radius;

      positions[i * 3 + 1] =
        Math.cos(phi) *
        radius;

      positions[i * 3 + 2] =
        Math.sin(phi) *
        Math.sin(theta) *
        radius;

      sizes[i] =
        random() < 0.08
          ? 2.5 + random() * 2.5
          : 0.7 + random() * 1.4;
    }

    const geometry =
      new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    geometry.setAttribute(
      "size",
      new THREE.BufferAttribute(
        sizes,
        1
      )
    );

    return geometry;
  }, []);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: "#dbe8ff",
      size: 0.075,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending:
        THREE.AdditiveBlending,
    });
  }, []);

  return (
    <points
      geometry={geometry}
      material={material}
    />
  );
}

/* ========================================================================= */
/* Milky Way                                                                  */
/* ========================================================================= */

function MilkyWay() {
  const pointsRef =
    useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const random = seededRandom(7731);

    const positions = new Float32Array(
      MILKY_WAY_COUNT * 3
    );

    for (
      let i = 0;
      i < MILKY_WAY_COUNT;
      i++
    ) {
      /*
       * Diagonal band across the sky.
       */
      const t =
        random() * 2 - 1;

      const x =
        t * 22;

      const centerY =
        7.5 -
        t * 1.7;

      const spread =
        (random() - 0.5) *
        5.5;

      const y =
        centerY +
        spread;

      const z =
        -25 +
        (random() - 0.5) *
        3;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    const geometry =
      new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    return geometry;
  }, []);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: "#8998c7",
      size: 0.09,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending:
        THREE.AdditiveBlending,
    });
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.z =
      Math.sin(
        clock.getElapsedTime() *
          0.008
      ) *
      0.006;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
    />
  );
}

/* ========================================================================= */
/* Horizon glow                                                               */
/* ========================================================================= */

function HorizonGlow() {
  return (
    <mesh
      position={[0, 0.2, -27]}
    >
      <planeGeometry
        args={[45, 12]}
      />

      <meshBasicMaterial
        color="#536b91"
        transparent
        opacity={0.055}
        depthWrite={false}
        blending={
          THREE.AdditiveBlending
        }
      />
    </mesh>
  );
}

/* ========================================================================= */
/* Distant mountains                                                          */
/* ========================================================================= */

function Mountains() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    shape.moveTo(-30, 0);

    const points = [
      [-28, 2],
      [-25, 1.3],
      [-22, 3.5],
      [-19, 2],
      [-16, 4.2],
      [-13, 2],
      [-10, 3],
      [-7, 1.6],
      [-4, 4.5],
      [-1, 2],
      [2, 3.4],
      [5, 1.5],
      [8, 4],
      [11, 2],
      [14, 3.2],
      [17, 1.4],
      [20, 4],
      [23, 2],
      [26, 3.4],
      [30, 1.3],
    ];

    for (const [x, y] of points) {
      shape.lineTo(x, y);
    }

    shape.lineTo(30, -8);
    shape.lineTo(-30, -8);
    shape.closePath();

    return new THREE.ShapeGeometry(
      shape
    );
  }, []);

  return (
    <group
      position={[0, -0.5, -17]}
    >
      <mesh
        geometry={geometry}
      >
        <meshBasicMaterial
          color="#08121c"
        />
      </mesh>

      <mesh
        geometry={geometry}
        position={[3, -1, 3]}
        scale={[1.2, 0.75, 1]}
      >
        <meshBasicMaterial
          color="#050b11"
        />
      </mesh>
    </group>
  );
}

/* ========================================================================= */
/* Pine trees                                                                 */
/* ========================================================================= */

function PineTree({
  position,
  scale,
  color,
}: {
  position: [
    number,
    number,
    number
  ];
  scale: number;
  color: string;
}) {
  return (
    <group
      position={position}
      scale={scale}
    >
      <mesh
        position={[0, 1.2, 0]}
      >
        <cylinderGeometry
          args={[
            0.08,
            0.13,
            2.4,
            5,
          ]}
        />

        <meshBasicMaterial
          color={color}
        />
      </mesh>

      <mesh
        position={[0, 2.4, 0]}
      >
        <coneGeometry
          args={[
            1.05,
            2.5,
            7,
          ]}
        />

        <meshBasicMaterial
          color={color}
        />
      </mesh>

      <mesh
        position={[0, 3.25, 0]}
      >
        <coneGeometry
          args={[
            0.8,
            2.1,
            7,
          ]}
        />

        <meshBasicMaterial
          color={color}
        />
      </mesh>

      <mesh
        position={[0, 4.05, 0]}
      >
        <coneGeometry
          args={[
            0.52,
            1.6,
            7,
          ]}
        />

        <meshBasicMaterial
          color={color}
        />
      </mesh>
    </group>
  );
}

/* ========================================================================= */
/* Forest                                                                     */
/* ========================================================================= */

function Forest() {
  const backTrees = useMemo(() => {
    const random =
      seededRandom(18273);

    return Array.from(
      { length: 65 },
      () => ({
        x:
          -28 +
          random() * 56,

        z:
          -11 +
          random() * 3,

        scale:
          0.45 +
          random() * 0.55,
      })
    );
  }, []);

  const frontTrees = useMemo(() => {
    const random =
      seededRandom(88123);

    return Array.from(
      { length: 42 },
      () => ({
        x:
          -25 +
          random() * 50,

        z:
          -6 +
          random() * 2,

        scale:
          0.7 +
          random() * 1.0,
      })
    );
  }, []);

  return (
    <group>
      {/* Distant forest */}
      {backTrees.map(
        (tree, i) => (
          <PineTree
            key={`back-${i}`}
            position={[
              tree.x,
              -0.65,
              tree.z,
            ]}
            scale={tree.scale}
            color="#09141a"
          />
        )
      )}

      {/* Foreground forest */}
      {frontTrees.map(
        (tree, i) => (
          <PineTree
            key={`front-${i}`}
            position={[
              tree.x,
              -0.75,
              tree.z,
            ]}
            scale={tree.scale}
            color="#03080b"
          />
        )
      )}
    </group>
  );
}

/* ========================================================================= */
/* Water                                                                      */
/* ========================================================================= */

function Water() {
  const meshRef =
    useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(
      70,
      42,
      120,
      80
    );
  }, []);

  const originalPositions =
    useMemo(() => {
      const position =
        geometry.attributes.position;

      const values =
        new Float32Array(
          position.count * 3
        );

      for (
        let i = 0;
        i < position.count;
        i++
      ) {
        values[i * 3] =
          position.getX(i);

        values[i * 3 + 1] =
          position.getY(i);

        values[i * 3 + 2] =
          position.getZ(i);
      }

      return values;
    }, [geometry]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;

    if (!mesh) return;

    const t =
      clock.getElapsedTime();

    const position =
      mesh.geometry.attributes
        .position;

    for (
      let i = 0;
      i < position.count;
      i++
    ) {
      const x =
        originalPositions[
          i * 3
        ];

      const y =
        originalPositions[
          i * 3 + 1
        ];

      /*
       * Small layered waves.
       * Very intentionally subtle.
       */
      const wave1 =
        Math.sin(
          x * 0.34 +
            t * 0.42
        ) * 0.025;

      const wave2 =
        Math.sin(
          y * 0.55 -
            t * 0.3
        ) * 0.018;

      const wave3 =
        Math.sin(
          (x + y) * 0.18 +
            t * 0.2
        ) * 0.012;

      position.setZ(
        i,
        originalPositions[
          i * 3 + 2
        ] +
          wave1 +
          wave2 +
          wave3
      );
    }

    position.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
      position={[
        0,
        WATER_Y,
        -1,
      ]}
    >
      <meshStandardMaterial
        color="#06121b"
        roughness={0.28}
        metalness={0.2}
        transparent
        opacity={0.94}
      />
    </mesh>
  );
}

/* ========================================================================= */
/* Star reflections                                                           */
/* ========================================================================= */

function StarReflections() {
  const reflections =
    useMemo(() => {
      const random =
        seededRandom(7132);

      return Array.from(
        { length: 100 },
        () => ({
          x:
            -15 +
            random() * 30,

          z:
            -2 +
            random() * 14,

          width:
            0.015 +
            random() * 0.06,

          opacity:
            0.025 +
            random() * 0.09,
        })
      );
    }, []);

  return (
    <group
      position={[
        0,
        WATER_Y + 0.015,
        0,
      ]}
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
    >
      {reflections.map(
        (reflection, i) => (
          <mesh
            key={i}
            position={[
              reflection.x,
              reflection.z,
              0,
            ]}
            scale={[
              reflection.width,
              0.01 +
                reflection.width *
                  0.3,
              1,
            ]}
          >
            <planeGeometry
              args={[1, 1]}
            />

            <meshBasicMaterial
              color="#9fbde0"
              transparent
              opacity={
                reflection.opacity
              }
              depthWrite={false}
              blending={
                THREE.AdditiveBlending
              }
            />
          </mesh>
        )
      )}
    </group>
  );
}

/* ========================================================================= */
/* Meteors                                                                    */
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

function createMeteorData() {
  const random =
    seededRandom(92481);

  return Array.from(
    { length: METEOR_COUNT },
    (_, i): MeteorData => {
      const startX =
        -15 +
        random() * 30;

      const startY =
        3.8 +
        random() * 8;

      return {
        startX,
        startY,
        startZ:
          -22 -
          random() * 6,

        travelX:
          3.5 +
          random() * 6,

        travelY:
          -(1.4 +
            random() * 3.0),

        duration:
          0.65 +
          random() * 0.8,

        delay:
          i *
            1.7 +
          random() * 4,

        length:
          1.4 +
          random() * 2.2,
      };
    }
  );
}

function Meteor({
  data,
}: {
  data: MeteorData;
}) {
  const groupRef =
    useRef<THREE.Group>(null);

  const trailRef =
    useRef<THREE.Mesh>(null);

  const reflectionRef =
    useRef<THREE.Mesh>(null);

  const headRef =
    useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (
      !groupRef.current ||
      !trailRef.current ||
      !reflectionRef.current ||
      !headRef.current
    ) {
      return;
    }

    const cycleLength =
      data.duration + 6;

    const elapsed =
      (clock.getElapsedTime() +
        data.delay) %
      cycleLength;

    const progress =
      elapsed / data.duration;

    if (
      progress < 0 ||
      progress > 1
    ) {
      groupRef.current.visible =
        false;

      reflectionRef.current.visible =
        false;

      return;
    }

    groupRef.current.visible =
      true;

    /*
     * Ease in/out.
     */
    const p =
      progress * progress *
      (3 - 2 * progress);

    const x =
      data.startX +
      data.travelX * p;

    const y =
      data.startY +
      data.travelY * p;

    const z =
      data.startZ;

    groupRef.current.position.set(
      x,
      y,
      z
    );

    /*
     * Direction vector.
     */
    const dx = data.travelX;
    const dy = data.travelY;

    const angle =
      Math.atan2(dy, dx);

    groupRef.current.rotation.z =
      angle;

    /*
     * Fade near beginning/end.
     */
    const fade =
      Math.min(
        progress / 0.12,
        (1 - progress) / 0.2,
        1
      );

    const headMaterial =
      headRef.current
        .material as THREE.MeshBasicMaterial;

    const trailMaterial =
      trailRef.current
        .material as THREE.MeshBasicMaterial;

    headMaterial.opacity =
      fade;

    trailMaterial.opacity =
      fade * 0.55;

    /*
     * Meteor reflection.
     *
     * The further down the meteor gets,
     * the closer the reflection approaches
     * the horizon.
     */
    const reflectionStrength =
      Math.max(
        0,
        1 -
          Math.abs(y - 2.5) /
            10
      );

    reflectionRef.current.visible =
      reflectionStrength > 0.05;

    reflectionRef.current.position.x =
      x * 0.72;

    reflectionRef.current.position.z =
      -y * 0.42 - 1;

    reflectionRef.current.scale.x =
      Math.max(
        0.15,
        reflectionStrength
      );

    const reflectionMaterial =
      reflectionRef.current
        .material as THREE.MeshBasicMaterial;

    reflectionMaterial.opacity =
      fade *
      reflectionStrength *
      0.35;
  });

  return (
    <>
      <group ref={groupRef}>
        {/* Meteor head */}
        <mesh ref={headRef}>
          <sphereGeometry
            args={[0.09, 8, 8]}
          />

          <meshBasicMaterial
            color="#ffffff"
            transparent
            blending={
              THREE.AdditiveBlending
            }
          />
        </mesh>

        {/* Meteor glow */}
        <mesh scale={2.5}>
          <sphereGeometry
            args={[0.09, 8, 8]}
          />

          <meshBasicMaterial
            color="#8fb9ff"
            transparent
            opacity={0.18}
            blending={
              THREE.AdditiveBlending
            }
            depthWrite={false}
          />
        </mesh>

        {/* Trail */}
        <mesh
          ref={trailRef}
          position={[
            -data.length / 2,
            0,
            0,
          ]}
        >
          <planeGeometry
            args={[
              data.length,
              0.035,
            ]}
          />

          <meshBasicMaterial
            color="#b9d5ff"
            transparent
            opacity={0.5}
            depthWrite={false}
            blending={
              THREE.AdditiveBlending
            }
          />
        </mesh>
      </group>

      {/* Reflection */}
      <mesh
        ref={reflectionRef}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        position={[
          0,
          WATER_Y + 0.025,
          0,
        ]}
      >
        <planeGeometry
          args={[
            data.length * 0.55,
            0.025,
          ]}
        />

        <meshBasicMaterial
          color="#789bc9"
          transparent
          opacity={0}
          depthWrite={false}
          blending={
            THREE.AdditiveBlending
          }
        />
      </mesh>
    </>
  );
}

function MeteorShower() {
  const meteors = useMemo(
    createMeteorData,
    []
  );

  return (
    <>
      {meteors.map(
        (meteor, i) => (
          <Meteor
            key={i}
            data={meteor}
          />
        )
      )}
    </>
  );
}

/* ========================================================================= */
/* Foreground shoreline                                                       */
/* ========================================================================= */

function Shoreline() {
  const rocks = useMemo(() => {
    const random =
      seededRandom(88291);

    return Array.from(
      { length: 35 },
      () => ({
        x:
          -24 +
          random() * 48,

        z:
          4 +
          random() * 5,

        scale:
          0.15 +
          random() * 0.5,

        rotation:
          random() *
          Math.PI,
      })
    );
  }, []);

  return (
    <group>
      {rocks.map(
        (rock, i) => (
          <mesh
            key={i}
            position={[
              rock.x,
              WATER_Y + 0.05,
              rock.z,
            ]}
            rotation={[
              0,
              rock.rotation,
              0,
            ]}
            scale={[
              rock.scale * 1.8,
              rock.scale,
              rock.scale * 1.3,
            ]}
          >
            <dodecahedronGeometry
              args={[1, 0]}
            />

            <meshStandardMaterial
              color="#05090b"
              roughness={1}
            />
          </mesh>
        )
      )}
    </group>
  );
}

/* ========================================================================= */
/* Camera                                                                     */
/* ========================================================================= */

function CameraRig() {
  const { camera } =
    useThree();

  useFrame(({ clock }) => {
    const t =
      clock.getElapsedTime();

    /*
     * Almost imperceptible camera movement.
     * The scene should feel alive,
     * not like the camera is floating.
     */
    camera.position.x =
      Math.sin(t * 0.055) *
      0.035;

    camera.position.y =
      1.15 +
      Math.sin(t * 0.08) *
        0.018;

    camera.lookAt(
      0,
      1.2,
      -12
    );
  });

  return null;
}

/* ========================================================================= */
/* Main Scene                                                                 */
/* ========================================================================= */

export default function SecretStarryNightScene({
  onClose,
}: SecretStarryNightSceneProps) {
  const [showText, setShowText] =
    useState(false);

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
        camera={{
          position: [
            0,
            1.15,
            8,
          ],
          fov: 54,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          powerPreference:
            "high-performance",
        }}
        dpr={[1, 1.75]}
        onCreated={() => {
          window.setTimeout(
            () => {
              setShowText(true);
            },
            1400
          );
        }}
      >
        {/* Ambient night lighting */}
        <ambientLight
          color="#526889"
          intensity={0.35}
        />

        <directionalLight
          color="#6e86aa"
          intensity={0.2}
          position={[
            -8,
            10,
            -20,
          ]}
        />

        {/* Sky */}
        <Sky />

        <StarsField />

        <MilkyWay />

        <HorizonGlow />

        {/* Landscape */}
        <Mountains />

        <Forest />

        {/* Water */}
        <Water />

        <StarReflections />

        <Shoreline />

        {/* Meteors */}
        <MeteorShower />

        <CameraRig />
      </Canvas>

      {/* Cinematic vignette */}
      <div className="cosmic-vignette" />

      {/* Slight atmospheric overlay */}
      <div className="cosmic-atmosphere" />

      {/* Text */}
      <motion.div
        className="cosmic-message"
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity:
            showText ? 1 : 0,
          y:
            showText ? 0 : 18,
        }}
        transition={{
          duration: 2,
          ease: "easeOut",
        }}
      >
        <span className="cosmic-kicker">
          THE NIGHT SKY REMEMBERS
        </span>

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
      </motion.div>

      {/* Close */}
      <motion.button
        className="cosmic-close"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity:
            showText ? 1 : 0,
        }}
        transition={{
          duration: 1.5,
        }}
        onClick={onClose}
      >
        Leave
      </motion.button>
    </div>
  );
}

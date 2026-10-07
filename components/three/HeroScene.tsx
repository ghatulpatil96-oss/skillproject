"use client";

// ─────────────────────────────────────────────────────────────
// Nomu-style hero scene: floating brand-colored shapes with
// mouse + scroll parallax. Lazily loaded (ssr: false), wrapped
// in a WebGL error boundary with a static gradient fallback.
// ─────────────────────────────────────────────────────────────
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const CORAL = "#FF8A5E";
const CORAL_DEEP = "#FF7448";
const INK = "#0F151D";
const GOLD = "#FFB020";

function Shapes() {
  const group = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g || reduced.current) return;
    const { clock } = state;
    // scroll gently spins the cluster; mouse tilts it
    const scrollSpin = Math.min(window.scrollY / 900, 1.4);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, mouse.current.x * 0.35 + scrollSpin * 0.7, 0.05);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, mouse.current.y * 0.18, 0.05);
    g.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.08;
  });

  return (
    <group ref={group}>
      {/* hero shape — coral rounded cube */}
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.9}>
        <RoundedBox args={[1.7, 1.7, 1.7]} radius={0.4} smoothness={8} position={[0.2, 0.35, 0]}>
          <meshStandardMaterial color={CORAL} roughness={0.32} metalness={0.05} />
        </RoundedBox>
      </Float>

      {/* ink torus */}
      <Float speed={1.1} rotationIntensity={0.9} floatIntensity={1.2}>
        <mesh position={[2.1, -1.15, -0.6]} rotation={[0.7, 0.3, 0]}>
          <torusGeometry args={[0.55, 0.22, 24, 64]} />
          <meshStandardMaterial color={INK} roughness={0.3} metalness={0.15} />
        </mesh>
      </Float>

      {/* faceted gold icosahedron — the "textured" one */}
      <Float speed={1.7} rotationIntensity={0.5} floatIntensity={1.4}>
        <mesh position={[-1.85, -1.35, -0.4]}>
          <icosahedronGeometry args={[0.62, 0]} />
          <meshStandardMaterial color={GOLD} roughness={0.45} flatShading />
        </mesh>
      </Float>

      {/* matte white sphere */}
      <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1}>
        <mesh position={[1.15, 1.9, -1.2]}>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.25} />
        </mesh>
      </Float>

      {/* small deep-coral accent sphere */}
      <Float speed={1.9} rotationIntensity={0.4} floatIntensity={1.6}>
        <mesh position={[-1.1, 1.75, -0.9]}>
          <sphereGeometry args={[0.26, 32, 32]} />
          <meshStandardMaterial color={CORAL_DEEP} roughness={0.35} />
        </mesh>
      </Float>
    </group>
  );
}

function GradientFallback() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute right-8 top-16 h-56 w-56 rounded-[3rem] bg-accent/70 blur-[2px]" />
      <div className="absolute right-40 top-52 h-32 w-32 rounded-full bg-ink/80" />
      <div className="absolute right-16 top-72 h-20 w-20 rotate-12 rounded-2xl bg-gold/80" />
    </div>
  );
}

class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <GradientFallback /> : this.props.children;
  }
}

export default function HeroScene() {
  return (
    <GLBoundary>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.95} />
        <directionalLight position={[4, 6, 6]} intensity={1.7} />
        <directionalLight position={[-6, -3, -4]} intensity={0.5} color="#FFD9C7" />
        <pointLight position={[0, -4, 2]} intensity={0.35} color="#FFB020" />
        <Shapes />
      </Canvas>
    </GLBoundary>
  );
}

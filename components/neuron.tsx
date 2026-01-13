"use client";
import { Neuron as NeuronType } from "@/types/network";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh } from "three";

export default function Neuron({
  neuron,
  color,
  isActive = false,
}: {
  neuron: NeuronType;
  color: string;
  isActive?: boolean;
}) {
  const meshRef = useRef<Mesh>(null);
  /**
   * useFrame hook - runs every frame (animation loop)
   *
   * @param state - contains clock, camera, scene, etc.
   * @param delta - time since last frame (in seconds)
   */
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Animate active neurons
    if (isActive) {
      // Pulse effect: scale grows and shrinks
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(scale);
    } else {
      // Return to normal size
      meshRef.current.scale.lerp({ x: 1, y: 1, z: 1 } as any, 0.1);
    }
  });
  return (
    <mesh ref={meshRef} position={neuron.position} castShadow receiveShadow>
      {/* 
        SphereGeometry arguments: [radius, widthSegments, heightSegments]
        - radius: size of the sphere
        - widthSegments: how many horizontal divisions (more = smoother)
        - heightSegments: how many vertical divisions
      */}
      <sphereGeometry args={[0.15, 16, 16]} />

      {/* 
        MeshStandardMaterial - physically-based rendering (PBR)
        - Reacts realistically to lights
        - emissive: makes it glow (doesn't need light)
        - emissiveIntensity: how strong the glow is
      */}
      <meshStandardMaterial
        color={color}
        emissive={isActive ? color : "#000000"}
        emissiveIntensity={isActive ? 0.5 : 0}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

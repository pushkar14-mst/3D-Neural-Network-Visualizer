"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Vector3,
  BufferGeometry,
  Points,
  PointsMaterial,
  BufferAttribute,
} from "three";
import * as THREE from "three";
import { Connection as ConnectionType } from "@/types/network";

interface Particle {
  connectionIndex: number;
  progress: number;
  speed: number;
}

export default function DataFlowParticles({
  connections,
  neuronPositions,
  speed = 1,
  particlesPerConnection = 3,
}: {
  connections: ConnectionType[];
  neuronPositions: Map<string, [number, number, number]>;
  speed?: number;
  particlesPerConnection?: number;
}) {
  const pointsRef = useRef<Points>(null);

  // Filter only active connections
  const activeConnections = useMemo(() => {
    return connections.filter((c) => c.active);
  }, [connections]);

  // Create particles data structure
  const particles = useMemo(() => {
    const particleList: Particle[] = [];

    activeConnections.forEach((_, index) => {
      for (let i = 0; i < particlesPerConnection; i++) {
        particleList.push({
          connectionIndex: index,
          progress: i / particlesPerConnection,
          speed: 0.5 + Math.random() * 0.5,
        });
      }
    });

    return particleList;
  }, [activeConnections, particlesPerConnection]);

  // Create geometry with proper BufferAttribute
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(particles.length * 3);

    // Initialize positions (will be updated in animation loop)
    for (let i = 0; i < particles.length; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }

    geo.setAttribute("position", new BufferAttribute(positions, 3));

    return geo;
  }, [particles.length]);

  // Animate particles
  useFrame((state, delta) => {
    if (!pointsRef.current || particles.length === 0) return;

    const positionsAttribute = pointsRef.current.geometry.attributes.position;

    particles.forEach((particle, i) => {
      // Update particle progress
      particle.progress += delta * speed * particle.speed;

      // Loop back to start
      if (particle.progress > 1) {
        particle.progress = 0;
      }

      // Get connection
      const connection = activeConnections[particle.connectionIndex];
      if (!connection) return;

      const sourcePos = neuronPositions.get(connection.sourceNeuronId);
      const targetPos = neuronPositions.get(connection.targetNeuronId);

      if (!sourcePos || !targetPos) return;

      // Interpolate position
      const x =
        sourcePos[0] + (targetPos[0] - sourcePos[0]) * particle.progress;
      const y =
        sourcePos[1] + (targetPos[1] - sourcePos[1]) * particle.progress;
      const z =
        sourcePos[2] + (targetPos[2] - sourcePos[2]) * particle.progress;

      // Update buffer
      const index = i * 3;
      positionsAttribute.array[index] = x;
      positionsAttribute.array[index + 1] = y;
      positionsAttribute.array[index + 2] = z;
    });

    positionsAttribute.needsUpdate = true;
  });

  if (particles.length === 0) return null;

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.1}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

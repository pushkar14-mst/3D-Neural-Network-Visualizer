"use client";

import { useRef, useMemo } from "react";
import { Vector3, LineBasicMaterial } from "three";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { Connection as ConnectionType } from "@/types/network";

/**
 * Connection Component - Renders a line between two neurons
 * Using @react-three/drei's Line component (much cleaner!)
 */

export default function Connection({
  connection,
  sourcePosition,
  targetPosition,
  isActive = false,
}: {
  connection: ConnectionType;
  sourcePosition: [number, number, number];
  targetPosition: [number, number, number];
  isActive?: boolean;
}) {
  const lineRef = useRef<THREE.Line>(null);

  /**
   * Create line points
   */
  const points = useMemo(() => {
    return [new Vector3(...sourcePosition), new Vector3(...targetPosition)];
  }, [sourcePosition, targetPosition]);

  /**
   * Color based on connection weight
   * Positive weights = blue, Negative weights = red
   */
  const color = useMemo(() => {
    if (isActive) return "#ffffff";
    return connection.weight > 0 ? "#3b82f6" : "#ef4444";
  }, [connection.weight, isActive]);

  /**
   * Opacity based on weight strength
   */
  const opacity = Math.abs(connection.weight) * 0.3 + 0.1;

  // Animate active connections
  useFrame((state) => {
    if (!lineRef.current || !isActive) return;

    // Pulse the line when active
    const material = lineRef.current.material as LineBasicMaterial;
    if (material && material.opacity !== undefined) {
      material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 5) * 0.3;
    }
  });

  return (
    <Line
      // @ts-ignore
      ref={lineRef}
      points={points}
      color={color}
      transparent
      opacity={isActive ? 0.8 : opacity}
      lineWidth={1}
    />
  );
}

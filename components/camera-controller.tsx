"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

/**
 * CameraController - Smooth camera transitions
 *
 * CAMERA CONCEPTS:
 * - Lerp (Linear Interpolation): Smooth movement between points
 * - Look-at: Point camera at a target
 * - Easing: Non-linear interpolation for natural movement
 */

export default function CameraController({
  targetPosition,
  targetLookAt,
  enabled = true,
}: {
  targetPosition?: [number, number, number];
  targetLookAt?: [number, number, number];
  enabled?: boolean;
}) {
  const { camera } = useThree();
  const targetRef = useRef(new Vector3());
  const lookAtRef = useRef(new Vector3());

  useEffect(() => {
    if (targetPosition) {
      targetRef.current.set(...targetPosition);
    }
    if (targetLookAt) {
      lookAtRef.current.set(...targetLookAt);
    }
  }, [targetPosition, targetLookAt]);

  useFrame(() => {
    if (!enabled) return;

    // Smooth camera position transition (lerp)
    if (targetPosition) {
      camera.position.lerp(targetRef.current, 0.05);
    }

    // Smooth camera look-at transition
    if (targetLookAt) {
      const currentLookAt = new Vector3();
      camera.getWorldDirection(currentLookAt);
      currentLookAt.add(camera.position);

      currentLookAt.lerp(lookAtRef.current, 0.05);
      camera.lookAt(currentLookAt);
    }
  });

  return null; // This component doesn't render anything
}

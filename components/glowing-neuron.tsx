"use client";

import { useRef, useMemo } from "react";
import { Mesh, ShaderMaterial } from "three";
import { useFrame } from "@react-three/fiber";
import { Neuron as NeuronType } from "@/types/network";

/**
 * GlowingNeuron - Neuron with custom shader for glow effect
 *
 * SHADER CONCEPTS:
 * - Vertex Shader: Runs for each vertex, transforms positions
 * - Fragment Shader: Runs for each pixel, determines color
 * - Uniforms: Variables passed from JavaScript to shaders
 * - Varyings: Data passed from vertex shader to fragment shader
 */

export default function GlowingNeuron({
  neuron,
  color,
  isActive = false,
}: {
  neuron: NeuronType;
  color: string;
  isActive?: boolean;
}) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  /**
   * Custom Shader Material
   *
   * GLSL (OpenGL Shading Language)
   * - Runs directly on the GPU
   * - Much faster than CPU for visual effects
   */
  const shaderMaterial = useMemo(() => {
    return {
      uniforms: {
        // Variables we can change from JavaScript
        time: { value: 0 },
        glowColor: { value: [0.2, 0.5, 1.0] }, // RGB (0-1)
        glowIntensity: { value: 0.0 },
        baseColor: { value: [0.2, 0.5, 1.0] },
      },

      // VERTEX SHADER - transforms vertex positions
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Pass data to fragment shader
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          // Transform vertex to screen space
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      // FRAGMENT SHADER - determines pixel color
      fragmentShader: `
        uniform float time;
        uniform vec3 glowColor;
        uniform float glowIntensity;
        uniform vec3 baseColor;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Fresnel effect - glow at edges
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
          
          // Pulse effect
          float pulse = sin(time * 3.0) * 0.5 + 0.5;
          
          // Combine base color with glow
          vec3 finalColor = baseColor + glowColor * fresnel * glowIntensity;
          
          // Add pulsing to active neurons
          finalColor += glowColor * pulse * glowIntensity * 0.5;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    };
  }, []);

  // Convert hex color to RGB (0-1 range)
  const rgbColor = useMemo(() => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return [r, g, b];
  }, [color]);

  // Update shader uniforms every frame
  useFrame((state) => {
    if (!materialRef.current) return;

    // Update time for animations
    materialRef.current.uniforms.time.value = state.clock.elapsedTime;

    // Update glow intensity based on active state
    const targetIntensity = isActive ? 1.0 : 0.0;
    materialRef.current.uniforms.glowIntensity.value +=
      (targetIntensity - materialRef.current.uniforms.glowIntensity.value) *
      0.1;

    // Update colors
    materialRef.current.uniforms.baseColor.value = rgbColor;
    materialRef.current.uniforms.glowColor.value = rgbColor;

    // Scale animation
    if (meshRef.current) {
      const scale = isActive
        ? 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2
        : 1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={neuron.position}>
      <sphereGeometry args={[0.15, 32, 32]} />
      <shaderMaterial ref={materialRef} {...shaderMaterial} />
    </mesh>
  );
}

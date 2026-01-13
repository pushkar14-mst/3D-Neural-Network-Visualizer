"use client";

import { Text } from "@react-three/drei";
import { NetworkLayer } from "@/types/network";

/**
 * LayerLabel - 3D text label for each layer
 *
 * THREE.JS CONCEPTS:
 * - Text rendering in 3D space
 * - Billboard effect (text always faces camera)
 */

export default function LayerLabel({ layer }: { layer: NetworkLayer }) {
  return (
    <group
      position={[layer.position[0], layer.position[1] + 2, layer.position[2]]}
    >
      {/* 
        Text component from drei
        - Automatically generates geometry for text
        - fontSize, color, anchorX/Y for alignment
      */}
      <Text
        fontSize={0.3}
        color={layer.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {layer.name}
      </Text>

      {/* Neuron count subtitle */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.15}
        color="#9ca3af"
        anchorX="center"
        anchorY="middle"
      >
        {layer.neuronCount} neurons
      </Text>
    </group>
  );
}

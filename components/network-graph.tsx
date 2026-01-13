"use client";

import { useMemo, useState, useEffect } from "react";

import { NeuralNetwork } from "@/types/network";
import Connection from "./connections";
import DataFlowParticles from "./data-flow-particles";
import Neuron from "./neuron";
import LayerLabel from "./layer-label";

/**
 * NetworkGraph Component
 *
 * Renders the complete neural network with animations
 */

export default function NetworkGraph({
  network,
  isInferencing = false,
}: {
  network: NeuralNetwork;
  isInferencing?: boolean; // Are we running inference?
}) {
  const [activeNeurons, setActiveNeurons] = useState<Set<string>>(new Set());
  const [activeConnections, setActiveConnections] = useState<Set<string>>(
    new Set()
  );

  /**
   * Create a lookup map for fast neuron position access
   */
  const neuronPositions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();

    network.layers.forEach((layer) => {
      layer.neurons.forEach((neuron) => {
        map.set(neuron.id, neuron.position);
      });
    });

    return map;
  }, [network]);

  /**
   * Simulate inference - activate neurons layer by layer
   */
  useEffect(() => {
    if (!isInferencing) {
      setActiveNeurons(new Set());
      setActiveConnections(new Set());
      return;
    }

    let layerIndex = 0;
    const interval = setInterval(() => {
      if (layerIndex >= network.layers.length) {
        layerIndex = 0;
        setActiveNeurons(new Set());
        setActiveConnections(new Set());
        return;
      }

      const layer = network.layers[layerIndex];

      // Activate neurons in current layer
      const newActiveNeurons = new Set(layer.neurons.map((n) => n.id));
      setActiveNeurons(newActiveNeurons);

      // Activate connections from previous layer to current layer
      if (layerIndex > 0) {
        const prevLayer = network.layers[layerIndex - 1];
        const connectionsToActivate = network.connections.filter(
          (conn) =>
            prevLayer.neurons.some((n) => n.id === conn.sourceNeuronId) &&
            layer.neurons.some((n) => n.id === conn.targetNeuronId)
        );
        setActiveConnections(new Set(connectionsToActivate.map((c) => c.id)));
      }

      layerIndex++;
    }, 800); // Activate new layer every 800ms

    return () => clearInterval(interval);
  }, [isInferencing, network]);

  /**
   * Create connections array with active state
   */
  const connectionsWithActiveState = useMemo(() => {
    return network.connections.map((conn) => ({
      ...conn,
      active: activeConnections.has(conn.id),
    }));
  }, [network.connections, activeConnections]);

  return (
    <group>
      {/* Render all connections first (so they appear behind neurons) */}
      {connectionsWithActiveState.map((connection) => {
        const sourcePos = neuronPositions.get(connection.sourceNeuronId);
        const targetPos = neuronPositions.get(connection.targetNeuronId);

        if (!sourcePos || !targetPos) return null;

        return (
          <Connection
            key={connection.id}
            connection={connection}
            sourcePosition={sourcePos}
            targetPosition={targetPos}
            isActive={connection.active}
          />
        );
      })}

      {/* Animated particles flowing through connections */}
      <DataFlowParticles
        connections={connectionsWithActiveState}
        neuronPositions={neuronPositions}
        speed={1.5}
        particlesPerConnection={3}
      />

      {/* Render all neurons */}
      {network.layers.map((layer) => (
        <group key={layer.id}>
          {layer.neurons.map((neuron) => (
            <Neuron
              key={neuron.id}
              neuron={neuron}
              color={layer.color}
              isActive={activeNeurons.has(neuron.id)}
            />
          ))}
        </group>
      ))}

      {/* Layer labels */}
      {network.layers.map((layer) => (
        <LayerLabel key={`label-${layer.id}`} layer={layer} />
      ))}
    </group>
  );
}

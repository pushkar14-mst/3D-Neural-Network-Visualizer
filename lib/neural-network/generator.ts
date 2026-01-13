import {
  NetworkLayer,
  NeuralNetwork,
  Neuron,
  Connection,
  LayerType,
  NetworkConfig,
} from "@/types/network";

/**
 * Neural Network Generator
 *
 * This generates the 3D positions and structure for visualizing a neural network
 */

// Color mapping for different layer types
const LAYER_COLORS: Record<LayerType, string> = {
  input: "#10b981", // Green
  dense: "#3b82f6", // Blue
  conv2d: "#8b5cf6", // Purple
  pooling: "#f59e0b", // Orange
  dropout: "#6b7280", // Gray
  flatten: "#ec4899", // Pink
  output: "#ef4444", // Red
};

const DEFAULT_CONFIG: NetworkConfig = {
  layerSpacing: 4,
  neuronSpacing: 0.8,
  maxNeuronsPerLayer: 20, // Don't visualize more than 20 neurons per layer
};

/**
 * Generate neurons for a layer in a circular arrangement
 */
function generateNeuronsForLayer(
  layer: { type: LayerType; neuronCount: number; id: string },
  layerIndex: number,
  config: NetworkConfig
): Neuron[] {
  const neurons: Neuron[] = [];
  const { neuronSpacing, layerSpacing } = config;

  // Limit neurons for visualization
  const visualNeuronCount = Math.min(
    layer.neuronCount,
    config.maxNeuronsPerLayer
  );

  // Position neurons in a circular pattern
  const radius = (visualNeuronCount * neuronSpacing) / (2 * Math.PI);

  for (let i = 0; i < visualNeuronCount; i++) {
    const angle = (i / visualNeuronCount) * Math.PI * 2;

    const neuron: Neuron = {
      id: `${layer.id}-neuron-${i}`,
      position: [
        layerIndex * layerSpacing, // x: layer position
        Math.cos(angle) * radius, // y: circular arrangement
        Math.sin(angle) * radius, // z: circular arrangement
      ],
      activation: 0,
      layerId: layer.id,
    };

    neurons.push(neuron);
  }

  return neurons;
}

/**
 * Generate connections between two layers
 */
function generateConnections(
  sourceLayer: NetworkLayer,
  targetLayer: NetworkLayer,
  density: number = 0.3 // What % of possible connections to create
): Connection[] {
  const connections: Connection[] = [];

  sourceLayer.neurons.forEach((sourceNeuron) => {
    targetLayer.neurons.forEach((targetNeuron) => {
      // Randomly create connections based on density
      if (Math.random() < density) {
        connections.push({
          id: `${sourceNeuron.id}-${targetNeuron.id}`,
          sourceNeuronId: sourceNeuron.id,
          targetNeuronId: targetNeuron.id,
          weight: Math.random() * 2 - 1, // Random weight between -1 and 1
          active: false,
        });
      }
    });
  });

  return connections;
}

/**
 * Generate a complete neural network structure
 */
export function generateNetwork(
  architecture: { type: LayerType; neuronCount: number; name: string }[],
  config: Partial<NetworkConfig> = {}
): NeuralNetwork {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Generate layers
  const layers: NetworkLayer[] = architecture.map((layerSpec, index) => {
    const layerId = `layer-${index}`;
    const neurons = generateNeuronsForLayer(
      { ...layerSpec, id: layerId },
      index,
      finalConfig
    );

    // Calculate layer center position
    const layerCenterY =
      neurons.reduce((sum, n) => sum + n.position[1], 0) / neurons.length;
    const layerCenterZ =
      neurons.reduce((sum, n) => sum + n.position[2], 0) / neurons.length;

    return {
      id: layerId,
      type: layerSpec.type,
      name: layerSpec.name,
      neurons,
      neuronCount: layerSpec.neuronCount,
      position: [index * finalConfig.layerSpacing, layerCenterY, layerCenterZ],
      color: LAYER_COLORS[layerSpec.type],
    };
  });

  // Generate connections between adjacent layers
  const connections: Connection[] = [];
  for (let i = 0; i < layers.length - 1; i++) {
    const layerConnections = generateConnections(layers[i], layers[i + 1]);
    connections.push(...layerConnections);
  }

  return {
    id: `network-${Date.now()}`,
    name: "Neural Network",
    layers,
    connections,
  };
}

/**
 * Preset architectures for quick testing
 */
export const PRESET_ARCHITECTURES = {
  simple: [
    { type: "input" as LayerType, neuronCount: 4, name: "Input" },
    { type: "dense" as LayerType, neuronCount: 8, name: "Hidden 1" },
    { type: "dense" as LayerType, neuronCount: 8, name: "Hidden 2" },
    { type: "output" as LayerType, neuronCount: 3, name: "Output" },
  ],

  cnn: [
    { type: "input" as LayerType, neuronCount: 16, name: "Input (28x28)" },
    { type: "conv2d" as LayerType, neuronCount: 12, name: "Conv2D" },
    { type: "pooling" as LayerType, neuronCount: 8, name: "MaxPool" },
    { type: "flatten" as LayerType, neuronCount: 10, name: "Flatten" },
    { type: "dense" as LayerType, neuronCount: 6, name: "Dense" },
    { type: "output" as LayerType, neuronCount: 10, name: "Output" },
  ],
};

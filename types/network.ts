/**
 * Neural Network Types
 *
 * These define the structure of our neural network visualization
 */

// Types of layers in a neural network
export type LayerType =
  | "input" // Input layer (receives data)
  | "dense" // Fully connected layer
  | "conv2d" // Convolutional layer (for images)
  | "pooling" // Pooling layer (downsampling)
  | "dropout" // Dropout layer (regularization)
  | "flatten" // Flatten layer (reshape)
  | "output"; // Output layer (predictions)

// Represents a single neuron in 3D space
export interface Neuron {
  id: string;
  position: [number, number, number]; // x, y, z coordinates
  activation: number; // 0-1 (how active the neuron is)
  layerId: string; // which layer it belongs to
}

// Represents a connection between two neurons
export interface Connection {
  id: string;
  sourceNeuronId: string;
  targetNeuronId: string;
  weight: number; // -1 to 1 (strength of connection)
  active: boolean; // is data flowing through this connection?
}

// Represents a layer in the network
export interface NetworkLayer {
  id: string;
  type: LayerType;
  name: string;
  neurons: Neuron[];
  neuronCount: number;
  position: [number, number, number]; // Layer's center position
  color: string; // Visual color for this layer type
}

// The complete network structure
export interface NeuralNetwork {
  id: string;
  name: string;
  layers: NetworkLayer[];
  connections: Connection[];
}

// Configuration for network generation
export interface NetworkConfig {
  layerSpacing: number; // Distance between layers
  neuronSpacing: number; // Distance between neurons in a layer
  maxNeuronsPerLayer: number; // For visualization (don't show 1000+ neurons)
}

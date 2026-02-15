# 3D Neural Network Visualizer

An interactive 3D visualization tool for understanding neural network architectures built with Three.js and React.

## Tech Stack

- React
- TypeScript
- Three.js / React Three Fiber
- Tailwind CSS
- Framer Motion

## Features

- Interactive 3D visualization of neural network layers
- Support for multiple network architectures (feedforward, CNN)
- Real-time neuron activation visualization
- Adjustable camera controls (orbit, zoom, pan)
- Data flow animation through the network
- Layer-by-layer network breakdown
- Customizable network parameters

## How It Works

The visualizer takes a neural network architecture definition and renders it in 3D space. Each layer is represented as a circle of neurons (spheres), with connections (lines) between layers. When you run inference, you can see data flowing through the network layer by layer.

## Problems Faced and Solutions

### 1. Positioning Neurons in 3D Space

**Problem**: Needed to arrange neurons in a visually clear way that shows network structure.

**Solution**: Used parametric circle equations to position neurons within each layer. Each layer forms a circle in the YZ plane, spaced along the X-axis. This creates a clear left-to-right flow through the network.

```typescript
const angle = (i / neuronCount) * Math.PI * 2;
const radius = (neuronCount * spacing) / (2 * Math.PI);

const position = [
  layerIndex * layerSpacing, // X: layer depth
  Math.cos(angle) * radius, // Y: vertical on circle
  Math.sin(angle) * radius, // Z: depth on circle
];
```

### 2. Performance with Large Networks

**Problem**: Rendering thousands of neurons and connections caused frame rate drops.

**Solution**: Implemented several optimizations:

- Limited visual neurons per layer to 20 even if the actual layer has more
- Used instanced meshes for repeated geometry
- Simplified connection rendering by only showing selected connections
- Added level-of-detail switching based on camera distance

### 3. Making Abstract Math Tangible

**Problem**: Neural networks are mathematical abstractions. Making them understandable visually was challenging.

**Challenge**: How to show what a "neuron" actually does in a way that's intuitive.

**Solution**:

- Color-coded neurons by activation level (darker = inactive, brighter = active)
- Animated particles flowing through connections during inference
- Added layer labels and neuron counts
- Implemented pulsing animations on active neurons
- Created a step-by-step inference mode

### 4. Camera Controls and Perspective

**Problem**: Users getting lost in 3D space or not knowing how to navigate.

**Solution**: Added OrbitControls from Three.js with sensible defaults:

- Auto-rotation disabled by default
- Set min/max zoom distances
- Constrained vertical rotation to prevent disorientation
- Added a "reset camera" button
- Started with an angled view that shows depth

## Setup Instructions

1. Clone the repository

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open http://localhost:3000

## Usage

1. Select a pre-defined architecture or create a custom one
2. Click "Visualize" to render the 3D network
3. Use mouse to rotate, zoom, and pan the camera
4. Click "Run Inference" to see data flow through the network
5. Hover over neurons to see details
6. Use layer controls to highlight specific parts of the network

## Customization

You can define custom architectures by specifying layer sizes:

```typescript
const architecture = {
  input: 4, // 4 input neurons
  hidden: [8, 8], // 2 hidden layers with 8 neurons each
  output: 3, // 3 output neurons
};
```

## Key Learnings

- Three.js camera positioning requires understanding of 3D coordinate systems
- Performance optimization is critical for real-time 3D rendering
- Abstract concepts need multiple visual cues to be understandable
- Parametric equations are useful for arranging objects in 3D space
- User controls need sensible constraints to prevent confusion
- Animation timing is crucial for showing sequential processes

## Future Improvements

- Add support for recurrent neural networks (RNN/LSTM)
- Implement weight visualization on connections
- Add training animation showing weights updating
- Export network as image or video
- Add VR support for immersive exploration

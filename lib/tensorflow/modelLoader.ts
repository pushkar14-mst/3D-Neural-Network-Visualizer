import * as tf from "@tensorflow/tfjs";
import { LayerType } from "@/types/network";

/**
 * TensorFlow.js Model Loader
 *
 * Loads real neural network models and extracts their architecture
 */

export interface TFLayerInfo {
  name: string;
  type: LayerType;
  neuronCount: number;
  inputShape?: number[];
  outputShape?: number[];
  kernelSize?: number[];
  units?: number;
}

/**
 * Map TensorFlow layer types to our LayerType enum
 */
function mapTFLayerType(tfLayerType: string): LayerType {
  const mapping: Record<string, LayerType> = {
    InputLayer: "input",
    Dense: "dense",
    Conv2D: "conv2d",
    MaxPooling2D: "pooling",
    AveragePooling2D: "pooling",
    Dropout: "dropout",
    Flatten: "flatten",
    GlobalAveragePooling2D: "pooling",
  };

  return mapping[tfLayerType] || "dense";
}

/**
 * Calculate neuron count for visualization based on layer type
 */
function calculateNeuronCount(layer: tf.layers.Layer): number {
  const outputShape = layer.outputShape as number[];

  if (!outputShape || outputShape.length === 0) return 8;

  // For conv layers, use number of filters
  if (layer.getClassName() === "Conv2D") {
    const config = layer.getConfig() as any;
    return config.filters || 16;
  }

  // For dense layers, use units
  if (layer.getClassName() === "Dense") {
    const config = layer.getConfig() as any;
    return config.units || 10;
  }

  // For other layers, estimate from output shape
  if (outputShape.length === 2) {
    // [batch, units]
    return Math.min(outputShape[1] || 8, 20); // Cap at 20 for visualization
  } else if (outputShape.length === 4) {
    // [batch, height, width, channels]
    return Math.min(outputShape[3] || 8, 20);
  }

  return 8; // Default
}

/**
 * Get input shape from a layer (handles different layer types)
 */
function getLayerInputShape(layer: tf.layers.Layer): number[] | undefined {
  try {
    // Try to get from inputSpec first
    if (layer.inputSpec && layer.inputSpec.length > 0) {
      const spec = layer.inputSpec[0];
      if ("shape" in spec && spec.shape) {
        return spec.shape as number[];
      }
    }

    // For input layers, use batchInputShape
    if ("batchInputShape" in layer) {
      return (layer as any).batchInputShape as number[];
    }

    return undefined;
  } catch (e) {
    return undefined;
  }
}

/**
 * Extract layer information from a TensorFlow model
 */
export function extractModelArchitecture(model: tf.LayersModel): TFLayerInfo[] {
  const layers: TFLayerInfo[] = [];

  if (!model.layers || model.layers.length === 0) {
    console.warn("Model has no layers or layers are not accessible");
    return layers;
  }

  model.layers.forEach((layer, index) => {
    const config = layer.getConfig() as any;
    const className = layer.getClassName();

    const layerInfo: TFLayerInfo = {
      name: config.name || `Layer ${index}`,
      type: mapTFLayerType(className),
      neuronCount: calculateNeuronCount(layer),
      inputShape: getLayerInputShape(layer),
      outputShape: layer.outputShape as number[] | undefined,
    };

    // Add layer-specific info
    if (className === "Conv2D") {
      layerInfo.kernelSize = config.kernelSize;
    }

    if (className === "Dense") {
      layerInfo.units = config.units;
    }

    layers.push(layerInfo);
  });

  return layers;
}

/**
 * Create a mock architecture for MobileNet (since we can't access internal layers)
 */
function createMobileNetArchitecture(): TFLayerInfo[] {
  return [
    { name: "Input", type: "input", neuronCount: 3, inputShape: [224, 224, 3] },
    { name: "Conv1", type: "conv2d", neuronCount: 32, kernelSize: [3, 3] },
    { name: "DepthwiseConv1", type: "conv2d", neuronCount: 32 },
    { name: "Conv2", type: "conv2d", neuronCount: 64 },
    { name: "DepthwiseConv2", type: "conv2d", neuronCount: 64 },
    { name: "Conv3", type: "conv2d", neuronCount: 128 },
    { name: "DepthwiseConv3", type: "conv2d", neuronCount: 128 },
    { name: "Conv4", type: "conv2d", neuronCount: 128 },
    { name: "DepthwiseConv4", type: "conv2d", neuronCount: 128 },
    { name: "Conv5", type: "conv2d", neuronCount: 256 },
    { name: "DepthwiseConv5", type: "conv2d", neuronCount: 256 },
    { name: "Conv6", type: "conv2d", neuronCount: 256 },
    { name: "GlobalAvgPool", type: "pooling", neuronCount: 256 },
    { name: "Dense", type: "dense", neuronCount: 1000, units: 1000 },
    { name: "Output", type: "output", neuronCount: 1000 },
  ];
}

/**
 * Load a pre-trained model from TensorFlow Hub or local
 */
export async function loadModel(modelName: string): Promise<{
  model: tf.LayersModel | any; // Allow any for wrapped models like MobileNet
  architecture: TFLayerInfo[];
}> {
  try {
    // Load model based on name
    switch (modelName) {
      case "mobilenet": {
        // Load MobileNet (image classification)
        const mobilenet = await import("@tensorflow-models/mobilenet");
        const mobilenetModel = await mobilenet.load({
          version: 1,
          alpha: 0.25,
        });

        // MobileNet doesn't expose internal layers, so we use a mock architecture
        const architecture = createMobileNetArchitecture();

        return { model: mobilenetModel, architecture };
      }

      case "toxicity": {
        // Load Toxicity model (text classification)
        const toxicity = await import("@tensorflow-models/toxicity");
        const toxicityModel = await toxicity.load(0.9, [
          "identity_attack",
          "insult",
          "obscene",
          "severe_toxicity",
          "sexual_explicit",
          "threat",
        ]);

        // Try to extract architecture, or use mock if not available
        let architecture: TFLayerInfo[] = [];

        if ((toxicityModel as any).model?.layers) {
          architecture = extractModelArchitecture((toxicityModel as any).model);
        } else {
          // Mock architecture for toxicity
          architecture = [
            { name: "Input", type: "input", neuronCount: 768 },
            { name: "LSTM1", type: "dense", neuronCount: 128 },
            { name: "LSTM2", type: "dense", neuronCount: 128 },
            { name: "Dense", type: "dense", neuronCount: 64, units: 64 },
            { name: "Output", type: "output", neuronCount: 6 },
          ];
        }

        return { model: toxicityModel, architecture };
      }

      default:
        throw new Error(`Unknown model: ${modelName}`);
    }
  } catch (error) {
    console.error("Error loading model:", error);
    throw error;
  }
}

/**
 * Run inference on a model
 * Note: This works differently for MobileNet vs raw tf.LayersModel
 */
export async function runInference(
  model: any, // Can be MobileNet, ToxicityClassifier, or tf.LayersModel
  input: tf.Tensor | HTMLImageElement
): Promise<{
  prediction: any;
  layerActivations: Map<string, number[]>;
}> {
  const layerActivations = new Map<string, number[]>();

  try {
    // Check if it's a MobileNet model
    if (model.classify) {
      // MobileNet has a classify method
      const predictions = await model.classify(input as HTMLImageElement);
      return {
        prediction: predictions,
        layerActivations,
      };
    }

    // Check if it's a ToxicityClassifier
    if (model.classify && typeof input === "string") {
      const predictions = await model.classify([input as any]);
      return {
        prediction: predictions,
        layerActivations,
      };
    }

    // If it's a raw tf.LayersModel
    if (model.layers) {
      const layerOutputs = model.layers.map((layer: any) => layer.output);

      const activationModel = tf.model({
        inputs: model.input,
        outputs: layerOutputs as tf.SymbolicTensor[],
      });

      const activations = activationModel.predict(
        input as tf.Tensor
      ) as tf.Tensor[];

      for (let i = 0; i < model.layers.length; i++) {
        const layer = model.layers[i];
        const activation = activations[i];
        const values = await activation.data();
        const sampledValues = Array.from(values).slice(0, 20);
        layerActivations.set(layer.name, sampledValues);
      }

      const prediction = activations[activations.length - 1];
      activations.slice(0, -1).forEach((t) => t.dispose());

      return { prediction, layerActivations };
    }

    throw new Error("Unknown model type");
  } catch (error) {
    console.error("Inference error:", error);
    throw error;
  }
}

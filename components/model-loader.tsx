"use client";

import { useState } from "react";
import { loadModel, TFLayerInfo } from "@/lib/tensorflow/modelLoader";
import * as tf from "@tensorflow/tfjs";

/**
 * ModelLoader - UI for loading TensorFlow models
 */

const AVAILABLE_MODELS = [
  {
    id: "mobilenet",
    name: "MobileNet",
    description: "Image classification (1000 classes)",
    size: "~4 MB",
  },
  // We'll keep it simple with just MobileNet for now
  // Can add more models later
];

export default function ModelLoader({
  onModelLoaded,
}: {
  onModelLoaded: (architecture: TFLayerInfo[], model: tf.LayersModel) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedModel, setLoadedModel] = useState<string | null>(null);

  const handleLoadModel = async (modelId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Set backend to WebGL for better performance
      await tf.setBackend("webgl");
      await tf.ready();

      const { model, architecture } = await loadModel(modelId);

      setLoadedModel(modelId);
      onModelLoaded(architecture, model);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load model");
      console.error("Model loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white">
      <h3 className="font-bold text-lg mb-3">Load Real Model</h3>

      {error && (
        <div className="mb-3 p-2 bg-red-500/20 border border-red-500 rounded text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {AVAILABLE_MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => handleLoadModel(model.id)}
            disabled={loading}
            className={`w-full p-3 rounded text-left transition-colors ${
              loadedModel === model.id
                ? "bg-green-600"
                : loading
                ? "bg-gray-700 opacity-50 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <div className="font-semibold">{model.name}</div>
            <div className="text-xs text-gray-300 mt-1">
              {model.description}
            </div>
            <div className="text-xs text-gray-400 mt-1">{model.size}</div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-3 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          <p className="text-sm mt-2">Loading model...</p>
        </div>
      )}

      {loadedModel && !loading && (
        <div className="mt-3 p-2 bg-green-500/20 border border-green-500 rounded text-sm">
          ✓ Model loaded successfully
        </div>
      )}
    </div>
  );
}

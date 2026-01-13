"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useState, useEffect, useMemo } from "react";
import ModelLoader from "./model-loader";
import ImageUploader from "./image-uploader";
import { TFLayerInfo } from "@/lib/tensorflow/modelLoader";
import { runInference } from "@/lib/tensorflow/modelLoader";
import * as tf from "@tensorflow/tfjs";
import {
  generateNetwork,
  PRESET_ARCHITECTURES,
} from "@/lib/neural-network/generator";
import { NeuralNetwork } from "@/types/network";
import { useLayerFocus } from "@/hooks/useFocusLayer";
import CameraController from "./camera-controller";
import NetworkGraph from "./network-graph";
import Effects from "./effects";

export default function Scene() {
  const [network, setNetwork] = useState<NeuralNetwork | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<"simple" | "cnn">(
    "simple"
  );
  const [isInferencing, setIsInferencing] = useState(false);
  const [useShaders, setUseShaders] = useState(true);
  const [showParticles, setShowParticles] = useState(true);
  const [tfModel, setTFModel] = useState<tf.LayersModel | null>(null);
  const [tfArchitecture, setTFArchitecture] = useState<TFLayerInfo[] | null>(
    null
  );
  const [useRealModel, setUseRealModel] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<string | null>(
    null
  );

  const {
    focusedLayerIndex,
    focusOnLayer,
    getCameraPositionForLayer,
    getOverviewCamera,
  } = useLayerFocus();

  const handleModelLoaded = (
    architecture: TFLayerInfo[],
    model: tf.LayersModel
  ) => {
    setTFArchitecture(architecture);
    setTFModel(model);

    // Convert TF architecture to our network format
    const tfNetwork = generateNetwork(
      architecture.map((layer) => ({
        type: layer.type,
        neuronCount: layer.neuronCount,
        name: layer.name,
      }))
    );

    setNetwork(tfNetwork);
    setUseRealModel(true);
  };
  const handleImageProcessed = async (
    image: HTMLImageElement,
    imageUrl: string
  ) => {
    if (!tfModel) return;

    setIsInferencing(true);

    try {
      const { prediction } = await runInference(tfModel, image);

      // MobileNet returns an array of predictions
      if (Array.isArray(prediction) && prediction.length > 0) {
        const topPrediction = prediction[0];
        setCurrentPrediction(
          `${topPrediction.className} (${(
            topPrediction.probability * 100
          ).toFixed(1)}%)`
        );
      }
    } catch (error) {
      console.error("Inference error:", error);
      setCurrentPrediction("Error during inference");
    } finally {
      setTimeout(() => setIsInferencing(false), 3000);
    }
  };
  // Generate network
  useEffect(() => {
    const generatedNetwork = generateNetwork(
      PRESET_ARCHITECTURES[selectedPreset]
    );
    setNetwork(generatedNetwork);
  }, [selectedPreset]);

  // Calculate camera position based on focus
  const cameraSettings = useMemo(() => {
    if (!network) return null;

    if (focusedLayerIndex !== null && network.layers[focusedLayerIndex]) {
      return getCameraPositionForLayer(
        network.layers[focusedLayerIndex],
        network.layers
      );
    }

    return getOverviewCamera(network.layers);
  }, [
    network,
    focusedLayerIndex,
    getCameraPositionForLayer,
    getOverviewCamera,
  ]);

  if (!network) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading network...
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-950">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[12, 8, 12]} fov={60} />

        {/* Camera animation controller */}
        {cameraSettings && (
          <CameraController
            targetPosition={cameraSettings.position}
            targetLookAt={cameraSettings.lookAt}
            enabled={focusedLayerIndex !== null}
          />
        )}

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#6366f1" />
        <pointLight position={[10, -10, 10]} intensity={0.3} color="#ec4899" />

        {/* Network */}
        <NetworkGraph network={network} isInferencing={isInferencing} />

        {/* Post-processing effects */}
        <Effects />

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={50}
          enabled={focusedLayerIndex === null} // Disable when focused
        />
      </Canvas>

      {/* UI Controls */}
      <div className="absolute top-4 left-4 space-y-4 max-w-xs overflow-y-auto max-h-[90vh]">
        {/* Architecture selector */}
        <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white">
          <h2 className="font-bold text-lg mb-3">Neural Network Visualizer</h2>
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Architecture:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPreset("simple")}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  selectedPreset === "simple"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setSelectedPreset("cnn")}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  selectedPreset === "cnn"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                CNN
              </button>
            </div>
          </div>
        </div>

        {/* Inference control */}
        <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white">
          <button
            onClick={() => setIsInferencing(!isInferencing)}
            className={`w-full px-4 py-2 rounded font-medium transition-colors ${
              isInferencing
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isInferencing ? "⏸ Stop Inference" : "▶ Run Inference"}
          </button>
        </div>

        {/* Visual options */}
        <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white">
          <h3 className="font-semibold mb-2 text-sm">Visual Options:</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={useShaders}
                onChange={(e) => setUseShaders(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Custom Shaders (Glow)</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showParticles}
                onChange={(e) => setShowParticles(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Data Flow Particles</span>
            </label>
          </div>
        </div>

        {/* Layer focus */}
        <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white">
          <h3 className="font-semibold mb-2 text-sm">Focus on Layer:</h3>
          <div className="space-y-1">
            <button
              onClick={() => focusOnLayer(null)}
              className={`w-full px-3 py-1 rounded text-sm transition-colors ${
                focusedLayerIndex === null
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Overview
            </button>
            {network.layers.map((layer, index) => (
              <button
                key={layer.id}
                onClick={() => focusOnLayer(index)}
                className={`w-full px-3 py-1 rounded text-sm transition-colors text-left ${
                  focusedLayerIndex === index
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </div>
        <ModelLoader onModelLoaded={handleModelLoaded} />

        {/* Image Uploader */}
        <ImageUploader
          onImageProcessed={handleImageProcessed}
          disabled={!tfModel}
        />

        {/* Prediction Result */}
        {currentPrediction && (
          <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white">
            <h3 className="font-semibold mb-2 text-sm">Prediction:</h3>
            <p className="text-green-400 text-sm">{currentPrediction}</p>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg text-white">
          <h3 className="font-semibold mb-2 text-sm">Mode:</h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setUseRealModel(false);
                const presetNetwork = generateNetwork(
                  PRESET_ARCHITECTURES[selectedPreset]
                );
                setNetwork(presetNetwork);
              }}
              className={`px-3 py-1 rounded text-sm ${
                !useRealModel ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => setUseRealModel(true)}
              disabled={!tfModel}
              className={`px-3 py-1 rounded text-sm ${
                useRealModel ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
              } ${!tfModel && "opacity-50 cursor-not-allowed"}`}
            >
              Real Model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

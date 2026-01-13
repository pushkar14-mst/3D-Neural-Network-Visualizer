import { useState, useCallback } from "react";
import { NetworkLayer } from "@/types/network";

/**
 * Custom hook for focusing on specific layers
 *
 * Returns camera position and look-at target for a given layer
 */

export function useLayerFocus() {
  const [focusedLayerIndex, setFocusedLayerIndex] = useState<number | null>(
    null
  );

  const getCameraPositionForLayer = useCallback(
    (
      layer: NetworkLayer,
      allLayers: NetworkLayer[]
    ): {
      position: [number, number, number];
      lookAt: [number, number, number];
    } => {
      const layerPos = layer.position;

      // Position camera to the side and above the layer
      const cameraPosition: [number, number, number] = [
        layerPos[0],
        layerPos[1] + 5,
        layerPos[2] + 8,
      ];

      // Look at the layer center
      const lookAt: [number, number, number] = [
        layerPos[0],
        layerPos[1],
        layerPos[2],
      ];

      return { position: cameraPosition, lookAt };
    },
    []
  );

  const focusOnLayer = useCallback((index: number | null) => {
    setFocusedLayerIndex(index);
  }, []);

  const getOverviewCamera = useCallback(
    (
      allLayers: NetworkLayer[]
    ): {
      position: [number, number, number];
      lookAt: [number, number, number];
    } => {
      // Calculate network center
      const centerX = (allLayers.length - 1) * 2;

      return {
        position: [centerX, 8, 12],
        lookAt: [centerX, 0, 0],
      };
    },
    []
  );

  return {
    focusedLayerIndex,
    focusOnLayer,
    getCameraPositionForLayer,
    getOverviewCamera,
  };
}

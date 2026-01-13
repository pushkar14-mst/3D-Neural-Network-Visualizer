"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * Post-Processing Effects
 *
 * POST-PROCESSING CONCEPTS:
 * - Runs after the scene is rendered
 * - Applies screen-space effects (affects entire image)
 * - Bloom: Makes bright areas glow
 * - Vignette: Darkens edges of screen
 */

export default function Effects() {
  return (
    <EffectComposer>
      {/* 
        Bloom Effect - Makes bright objects glow
        - luminanceThreshold: How bright something must be to glow (0-1)
        - intensity: How strong the glow is
        - levels: Quality of the effect (more = better but slower)
      */}
      <Bloom
        luminanceThreshold={0.2} // Objects brighter than this glow
        intensity={1.5} // Glow strength
        levels={9} // Quality levels
        mipmapBlur // Smooth blur
      />

      {/* 
        Vignette Effect - Darkens screen edges
        Creates focus on the center
      */}
      <Vignette
        offset={0.5} // Size of dark area
        darkness={0.5} // How dark
      />
    </EffectComposer>
  );
}

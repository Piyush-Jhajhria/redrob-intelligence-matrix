export const ParticleShader = {
  vertexShader: `
    uniform float uTime;
    uniform float uSearchIntensity;
    attribute float aSpeed;
    attribute vec3 aTargetPosition;
    varying vec3 vPosition;
    varying float vHighlight;

    void main() {
      vPosition = position;
      
      // Compute progressive interpolation toward the high-prestige core cluster
      float transition = sin(uTime * aSpeed * 0.3) * 0.5 + 0.5;
      vec3 mixedPosition = mix(position, aTargetPosition, transition * uSearchIntensity);
      
      // Add continuous wave micro-fluctuations to mimic continuous ingestion
      mixedPosition.y += sin(uTime * aSpeed + mixedPosition.x * 2.0) * 0.15;
      
      vec4 mvPosition = modelViewMatrix * vec4(mixedPosition, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Implement precise perspective level of detail (LOD) particle sizing
      gl_PointSize = (12.0 / -mvPosition.z) * (1.0 + transition * 1.5);
      vHighlight = transition;
    }
  `,
  fragmentShader: `
    varying vec3 vPosition;
    varying float vHighlight;

    void main() {
      // Coordinate transformation to mold squares into perfect anti-aliased circles
      float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
      if (distanceToCenter > 0.5) discard;
      
      // Dynamic color interpolation between electric cyan and soft luxury-gold
      vec3 coreColor = vec3(0.02, 0.73, 0.83); // Deep Cyan
      vec3 targetColor = vec3(0.98, 0.75, 0.14); // Soft Luxury Gold
      vec3 finalColor = mix(coreColor, targetColor, vHighlight);
      
      // Inject a clean holographic glow factor
      float alpha = smoothstep(0.5, 0.1, distanceToCenter) * 0.8;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};
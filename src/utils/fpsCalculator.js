export function createFpsCalculator() {
  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 0;

  return {
    tick() {
      frameCount += 1;
      const now = performance.now();
      const elapsed = now - lastTime;

      if (elapsed >= 1000) {
        fps = Math.round((frameCount * 1000) / elapsed);
        frameCount = 0;
        lastTime = now;
      }

      return fps;
    },
    getFps() {
      return fps;
    },
    reset() {
      frameCount = 0;
      lastTime = performance.now();
      fps = 0;
    },
  };
}

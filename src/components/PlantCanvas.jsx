import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { PlantStudio, webglAvailable } from "../three/PlantStudio";

// React wrapper around the imperative three.js studio.
const PlantCanvas = forwardRef(function PlantCanvas({ config, interactive = true, autoRotate = true, className = "", fallback }, ref) {
  const box = useRef(null);
  const studio = useRef(null);
  const [supported] = useState(webglAvailable);

  useEffect(() => {
    if (!supported || !box.current) return;
    studio.current = new PlantStudio(box.current, { interactive, autoRotate });
    return () => {
      studio.current?.dispose();
      studio.current = null;
    };
  }, [supported, interactive, autoRotate]);

  useEffect(() => {
    studio.current?.setConfig(config);
  }, [config, supported, interactive, autoRotate]);

  useImperativeHandle(ref, () => ({ snapshot: () => studio.current?.snapshot() }), []);

  if (!supported) return fallback || null;
  return <div ref={box} className={className} />;
});

export default PlantCanvas;

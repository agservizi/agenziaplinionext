const DRACO_CDN =
  "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

export const DRACO_DECODER_PATH = DRACO_CDN;

/** Lazy GLTF loader with Draco for future assets in public/models/ */
export async function createGLTFLoader() {
  const [{ DRACOLoader }, { GLTFLoader }] = await Promise.all([
    import("three/examples/jsm/loaders/DRACOLoader.js"),
    import("three/examples/jsm/loaders/GLTFLoader.js"),
  ]);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_CDN);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  return loader;
}

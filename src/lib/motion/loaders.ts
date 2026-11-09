/** Self-hosted Draco decoder (no gstatic request before/without consent). */
const DRACO_LOCAL = "/draco/";

export const DRACO_DECODER_PATH = DRACO_LOCAL;

/** Lazy GLTF loader with Draco + Meshopt for compressed assets in public/models/ */
export async function createGLTFLoader() {
  const [{ DRACOLoader }, { GLTFLoader }, meshoptModule] = await Promise.all([
    import("three/examples/jsm/loaders/DRACOLoader.js"),
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/libs/meshopt_decoder.module.js"),
  ]);

  const { MeshoptDecoder } = meshoptModule;
  if (MeshoptDecoder?.ready) {
    await MeshoptDecoder.ready;
  }

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_LOCAL);

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  if (MeshoptDecoder) {
    loader.setMeshoptDecoder(MeshoptDecoder);
  }

  return loader;
}

import * as THREE from './vendor/three.module.js';

// A satin gift bow, drawn as a ribbon rather than an unrelated 3D object.
export function mountRibbon(host) {
  if (!host) return () => {};
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.className = 'satin-canvas';
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 30);
  camera.position.set(0, 0, 7.4);
  const bow = new THREE.Group();
  scene.add(bow);
  const material = new THREE.MeshPhysicalMaterial({ color: 0xb88c66, roughness: .38, metalness: .38, clearcoat: .35, side: THREE.DoubleSide });
  const geometries = [];
  function ribbon(points, width) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const vertices = [], uvs = [], indices = [];
    const n = 100;
    for (let i=0; i<=n; i++) {
      const t = i/n, p = curve.getPoint(t), tangent = curve.getTangent(t);
      const across = new THREE.Vector3(-tangent.y, tangent.x, .22*Math.sin(t*Math.PI*2)).normalize();
      const w = width*(.85+.15*Math.sin(t*Math.PI));
      for (const side of [-1,1]) {
        const v = p.clone().addScaledVector(across, side*w/2);
        vertices.push(v.x,v.y,v.z); uvs.push(t,(side+1)/2);
      }
      if (i<n) { const j=i*2; indices.push(j,j+1,j+2,j+1,j+3,j+2); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    geo.setIndex(indices); geo.computeVertexNormals(); geometries.push(geo);
    bow.add(new THREE.Mesh(geo,material));
  }
  ribbon([[0,0,.1],[-.6,.9,0],[-1.5,1,.15],[-1.62,.35,.4],[-.8,-.02,.45],[0,0,.1]],.38);
  ribbon([[0,0,.1],[.6,.9,.2],[1.5,1,0],[1.62,.35,-.2],[.8,-.02,.3],[0,0,.1]],.38);
  ribbon([[-.12,-.02,.1],[-.45,-.6,.2],[-.55,-1.3,-.05],[-1.05,-1.7,.25]],.42);
  ribbon([[.12,-.02,.05],[.5,-.6,-.1],[.7,-1.2,.25],[.5,-1.65,.4]],.42);
  const knotGeo = new THREE.SphereGeometry(.23,24,16); geometries.push(knotGeo);
  const knot = new THREE.Mesh(knotGeo,material); knot.scale.set(.8,.68,1); knot.position.z=.2; bow.add(knot);
  bow.position.y=.15; bow.rotation.set(-.1,-.2,-.08);
  scene.add(new THREE.HemisphereLight(0xfff6e6,0x543342,3));
  const light = new THREE.DirectionalLight(0xfff1d6,4);light.position.set(-3,4,5);scene.add(light);
  const rim = new THREE.DirectionalLight(0xffffff,2);rim.position.set(3,-1,2);scene.add(rim);
  let visible=false, frame=0, disposed=false, last=0;
  const target={x:0,y:0};
  const resize = new ResizeObserver(() => {
    const w=host.clientWidth,h=host.clientHeight;
    renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
  });
  function draw(time) {
    frame=0;
    if (!visible || disposed || document.hidden) return;
    if (time-last>30) {
      bow.rotation.y += ((-.2+target.x*.32+Math.sin(time*.00035)*.12)-bow.rotation.y)*.045;
      bow.rotation.x += ((-.1+target.y*.2)-bow.rotation.x)*.045;
      bow.position.y=.15+Math.sin(time*.00065)*.045;
      renderer.render(scene,camera);last=time;
    }
    frame=requestAnimationFrame(draw);
  }
  const resume = () => { if (visible&&!document.hidden&&!frame&&!disposed) frame=requestAnimationFrame(draw); };
  const observer = new IntersectionObserver(entries => { visible=entries[0].isIntersecting; resume(); },{rootMargin:'80px'});
  const pointer = e => { const r=host.getBoundingClientRect();target.x=(e.clientX-r.left)/r.width-.5;target.y=(e.clientY-r.top)/r.height-.5; };
  const leave = () => { target.x=target.y=0; };
  host.append(renderer.domElement);host.classList.add('has-ribbon');
  resize.observe(host);observer.observe(host);
  host.addEventListener('pointermove',pointer);host.addEventListener('pointerleave',leave);document.addEventListener('visibilitychange',resume);
  const lost = e => { e.preventDefault(); cleanup(); };
  renderer.domElement.addEventListener('webglcontextlost',lost);
  function cleanup() {
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);
    resize.disconnect();observer.disconnect();host.removeEventListener('pointermove',pointer);host.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',resume);
    renderer.domElement.removeEventListener('webglcontextlost',lost);
    geometries.forEach(g=>g.dispose());material.dispose();renderer.dispose();renderer.domElement.remove();host.classList.remove('has-ribbon');
  }
  return cleanup;
}

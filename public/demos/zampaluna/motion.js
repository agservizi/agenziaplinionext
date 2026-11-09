const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
async function start(){
 if(reduce.matches)return;
 const {gsap,ScrollTrigger,Lenis}=window;
 if(!gsap||!ScrollTrigger)return;
 gsap.registerPlugin(ScrollTrigger);
 const mm=gsap.matchMedia();
 mm.add('(prefers-reduced-motion: no-preference)',()=>{
  let lenis;
  const tick=t=>lenis?.raf(t*1000);
  if(Lenis){lenis=new Lenis({duration:1.05,smoothWheel:true,syncTouch:false,anchors:{offset:-100}});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(tick);document.documentElement.classList.add('smooth-active');}
  gsap.timeline({defaults:{ease:'power3.out',duration:1}}).from('.hero-copy .eyebrow',{y:14,autoAlpha:0}).from('h1',{y:45,autoAlpha:0},.1).from('.hero-copy>p,.actions,.hero-bottom',{y:22,autoAlpha:0,stagger:.12},.35).from('.hero-photo img',{scale:.94,autoAlpha:0,duration:1.4},.1);
  document.querySelectorAll('.section-head,.service,.story>div,.visit>div,.faq>h2,details').forEach(el=>gsap.from(el,{y:35,autoAlpha:0,duration:.85,scrollTrigger:{trigger:el,start:'top 91%',once:true}}));
  gsap.to('.seal',{rotation:8,y:-20,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
  document.querySelectorAll('.service img,.story-photo img').forEach(el=>gsap.fromTo(el,{objectPosition:'50% 35%'},{objectPosition:'50% 65%',ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1}}));
  gsap.to('.reading-progress',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.2}});
  const refresh=()=>ScrollTrigger.refresh();window.addEventListener('load',refresh,{once:true});document.fonts.ready.then(refresh);
  return()=>{gsap.ticker.remove(tick);lenis?.destroy();document.documentElement.classList.remove('smooth-active')};
 });
 if(fine.matches){document.querySelectorAll('.service').forEach(card=>{const img=card.querySelector('img');card.addEventListener('pointermove',e=>{if(reduce.matches)return;const b=card.getBoundingClientRect();gsap.to(img,{rotationY:((e.clientX-b.left)/b.width-.5)*5,rotationX:-((e.clientY-b.top)/b.height-.5)*4,duration:.65,overwrite:'auto',transformPerspective:900})});card.addEventListener('pointerleave',()=>gsap.to(img,{rotationX:0,rotationY:0,duration:.7}));});}
 try{await pawScene()}catch(e){/* The original paw illustration remains available without WebGL. */}
}
async function pawScene(){
 const THREE=await import('./assets/vendor/three.module.js');
 if(reduce.matches)return;
 const host=document.querySelector('.paw-stage');if(!host)return;
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(145,145);renderer.setClearColor(0,0);renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);host.classList.add('ready');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,30);camera.position.z=6;
 scene.add(new THREE.HemisphereLight(0xfff4d5,0x243f34,3));const light=new THREE.DirectionalLight(0xffffff,4);light.position.set(-3,4,5);scene.add(light);
 const paw=new THREE.Group(),material=new THREE.MeshStandardMaterial({color:0xca592f,roughness:.42,metalness:.05}),geometry=new THREE.SphereGeometry(1,24,16);
 function pad(x,y,sx,sy,rotation=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,0);m.scale.set(sx,sy,.23);m.rotation.z=rotation;paw.add(m)}
 pad(0,-.3,.63,.48);pad(-.76,.3,.25,.35,.4);pad(-.3,.77,.25,.35,.15);pad(.3,.77,.25,.35,-.15);pad(.76,.3,.25,.35,-.4);scene.add(paw);
 let visible=true,raf=0,tx=0,ty=0,last=0;
 const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible&&!raf)raf=requestAnimationFrame(draw)});observer.observe(host);
 host.parentElement.addEventListener('pointermove',e=>{const b=host.getBoundingClientRect();tx=Math.max(-.4,Math.min(.4,(e.clientX-b.left-b.width/2)/250));ty=Math.max(-.3,Math.min(.3,(e.clientY-b.top-b.height/2)/250))});
 host.parentElement.addEventListener('pointerleave',()=>{tx=0;ty=0});
 function draw(t){raf=0;if(!visible||document.hidden||reduce.matches)return;if(t-last>32){paw.rotation.y+=(tx-paw.rotation.y)*.08;paw.rotation.x+=(-ty-paw.rotation.x)*.08;paw.rotation.z=Math.sin(t*.0006)*.08;paw.position.y=Math.sin(t*.001)*.05;renderer.render(scene,camera);last=t}raf=requestAnimationFrame(draw)}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!raf)raf=requestAnimationFrame(draw)});
 reduce.addEventListener('change',e=>{if(e.matches){cancelAnimationFrame(raf);observer.disconnect();geometry.dispose();material.dispose();renderer.dispose();host.classList.remove('ready');renderer.domElement.remove()}});
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);host.classList.remove('ready')});raf=requestAnimationFrame(draw);
}
if(window.ivaIntroPending)document.addEventListener('iva:intro-complete',start,{once:true});else start();

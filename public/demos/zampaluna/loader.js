/* User-provided dog footage, keyed to transparent animated WebP. */
(()=>{
 const script=document.currentScript,src=script?.dataset.dog;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let seen=false;try{seen=sessionStorage.getItem('iva-intro')==='1'}catch{}
 if(!src||seen||reduced)return;
 window.ivaIntroPending=true;
 document.documentElement.classList.add('iva-intro-pending');
 let finished=false,close=()=>{finished=true;release()},timer;
 function release(){window.ivaIntroPending=false;document.documentElement.classList.remove('iva-intro-pending');document.dispatchEvent(new Event('iva:intro-complete'))}
 const dog=new Image();dog.alt='';dog.src=src;
 dog.onerror=()=>{clearTimeout(timer);close()};
 dog.onload=()=>{
  if(finished)return;
  const style=document.createElement('style');style.textContent=`.iva-loader{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:#f6f3e9;color:#243f34;transition:opacity .65s,visibility .65s}.iva-loader.is-done{opacity:0;visibility:hidden}.iva-loader-inner{width:min(440px,78vw);text-align:center}.iva-loader-title{font-family:'Libre Caslon Display',Georgia,serif;font-size:40px}.iva-loader-caption{font:11px 'DM Sans',sans-serif;letter-spacing:2px;text-transform:uppercase;margin:15px 0 10px}.iva-loader-walk{height:150px;position:relative;margin-top:30px}.iva-loader-dog{position:absolute;bottom:0;left:0;width:205px;height:150px;object-fit:contain;transform:translateX(-65px);transition:left .2s linear}.iva-loader-track{height:3px;background:#d5dacb;overflow:hidden}.iva-loader-fill{height:100%;background:#ca592f;width:0;transition:width .2s linear}.iva-loader-meta{display:flex;justify-content:space-between;margin-top:12px;font:11px 'DM Sans',sans-serif}.iva-loader-skip{border:0;background:none;color:inherit;text-decoration:underline;cursor:pointer;padding:15px;font:12px 'DM Sans',sans-serif;margin-top:30px}`;
  document.head.append(style);
  const overlay=document.createElement('div');overlay.className='iva-loader';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Benvenuto da Zampaluna');overlay.innerHTML='<div class="iva-loader-inner"><div class="iva-loader-title">Zampaluna</div><div class="iva-loader-caption">Un piccolo passo. Siamo da te.</div><div class="iva-loader-walk"></div><div class="iva-loader-track" role="progressbar" aria-label="Caricamento delle risorse iniziali" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="iva-loader-fill"></div></div><div class="iva-loader-meta"><span>Prepariamo il tuo benvenuto</span><span class="iva-loader-value">0%</span></div><button class="iva-loader-skip">Entra subito</button></div>';
  dog.className='iva-loader-dog';overlay.querySelector('.iva-loader-walk').append(dog);document.body.append(overlay);
  const priorFocus=document.activeElement,targets=[...document.body.children].filter(e=>e!==overlay&&e.tagName!=='DIALOG'&&!['SCRIPT','STYLE'].includes(e.tagName));const previous=targets.map(e=>e.inert);targets.forEach(e=>e.inert=true);
  const oldOverflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
  const button=overlay.querySelector('button');button.focus({preventScroll:true});let completed=0;const total=3,start=performance.now();
  let shown=0,target=0,animationFrame=0;
 function paint(value){overlay.querySelector('[role=progressbar]').setAttribute('aria-valuenow',String(value));overlay.querySelector('.iva-loader-value').textContent=value+'%';overlay.querySelector('.iva-loader-fill').style.width=value+'%';dog.style.left=`calc(${value} * (100% - 120px) / 100)`}
  function progress(value){target=Math.max(target,value);if(!animationFrame)animationFrame=requestAnimationFrame(animateProgress)}
  function animateProgress(){animationFrame=0;shown+=Math.max(.25,(target-shown)*.065);shown=Math.min(target,shown);paint(Math.round(shown));if(shown<target)animationFrame=requestAnimationFrame(animateProgress)}
  close=()=>{if(finished)return;finished=true;clearTimeout(timer);cancelAnimationFrame(animationFrame);paint(100);setTimeout(()=>{targets.forEach((e,i)=>e.inert=previous[i]);document.documentElement.style.overflow=oldOverflow;overlay.classList.add('is-done');try{sessionStorage.setItem('iva-intro','1')}catch{};if(priorFocus?.isConnected&&priorFocus!==document.body)priorFocus.focus({preventScroll:true});release();setTimeout(()=>{overlay.remove();style.remove()},700)},200)};
  button.addEventListener('click',close);overlay.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Tab'){e.preventDefault();button.focus()}});
  function resourceDone(){completed++;progress(Math.min(90,Math.round(completed/total*90)));if(completed===total)setTimeout(close,Math.max(0,2800-(performance.now()-start)))}
  resourceDone();
  const hero=document.querySelector('.hero-photo img');if(!hero||hero.complete)resourceDone();else{const done=()=>{hero.removeEventListener('load',done);hero.removeEventListener('error',done);resourceDone()};hero.addEventListener('load',done,{once:true});hero.addEventListener('error',done,{once:true})}
  (document.fonts?.ready??Promise.resolve()).then(resourceDone,resourceDone);
 };
 // A delayed or failed asset must never create an overlay after the deadline.
 clearTimeout(timer);timer=setTimeout(()=>close(),6500);
})();

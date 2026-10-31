'use strict';
// © 2026 Sania Labbé (Valkyrie) – Tous droits réservés
const CARS=[
 {id:'rose',nom:'Rose',col:'#ff6fcf',sp:'Rayon de cœur',spd:'repousse et charme'},
 {id:'bleu',nom:'Bleue',col:'#4fb6ff',sp:'Éclat de cristal',spd:'ralentit et fait glisser'},
 {id:'rouge',nom:'Rouge',col:'#ff4b3a',sp:'Traînée de feu',spd:'recul puissant'},
 {id:'vert',nom:'Verte',col:'#4fd65a',sp:'Lianes',spd:'enracine la cible'},
 {id:'violet',nom:'Violette',col:'#a35bff',sp:'Vortex trou noir',spd:'attire les voitures'},
 {id:'or',nom:'Dorée',col:'#ffc93a',sp:'Rayon éclair',spd:'rapide, étourdit'}];
const SPCD=6, WCD=[2.2,4,1.6], ROUND=180, AR=900; // arena radius (île flottante, bords ouverts)
const EMB={rose:'heart',bleu:'diamond',rouge:'fire',vert:'leaf',violet:'star',or:'bolt'};let outOrder=[],T=0;
const imgs={};function li(k,s){const i=new Image();i.onload=()=>imgs[k]=i;i.src=s;}
li('arena','assets/arena.webp');li('bg','assets/bg1.webp');CARS.forEach(c=>li(c.id,'assets/car_'+c.id+'.webp'));
const cv=document.getElementById('c'),ctx=cv.getContext('2d');let W,H,DPR;
function rs(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;}addEventListener('resize',rs);rs();
const $=id=>document.getElementById(id);let sel=0,state='menu',cars=[],shots=[],fx=[],tLeft=0,last=0;
// menu
const bgTest=new Image();bgTest.onload=()=>{$('menu').classList.add('bgimg');$('menu').style.setProperty('--bg','url(assets/bg1.webp)');$('over').classList.add('bgimg');$('over').style.setProperty('--bg','url(assets/bg2.webp)');};bgTest.src='assets/bg1.webp';
CARS.forEach((c,i)=>{const d=document.createElement('div');d.className='car'+(i?'':' sel');
 const p=document.createElement('canvas');p.width=p.height=70;const g=p.getContext('2d');g.translate(35,35);drawCar(g,c,0,28);
 d.append(p);d.insertAdjacentHTML('beforeend',`<b>${c.nom}</b><span>⚡ ${c.sp}</span><br><small>${c.spd}</small>`);
 d.onclick=()=>{sel=i;document.querySelectorAll('.car').forEach((e,j)=>e.classList.toggle('sel',j==i));};$('cars').append(d);});
function drawCar(g,c,a,r){g.save();g.rotate(a);const im=imgs[c.id];
 if(im){g.beginPath();g.arc(0,0,r,0,7);g.clip();g.drawImage(im,-r,-r,2*r,2*r);g.restore();g.save();g.rotate(a);}
 else{g.fillStyle='#222';g.beginPath();g.arc(0,0,r,0,7);g.fill();g.fillStyle=c.col;g.beginPath();g.ellipse(0,0,r*.85,r*.7,0,0,7);g.fill();
  g.fillStyle='#fff8';g.beginPath();g.arc(r*.35,0,r*.22,0,7);g.fill();emblem(g,EMB[c.id],r*.38,c.id=='rouge');}
 g.strokeStyle='#ffd86b';g.lineWidth=c.id=='rouge'?5:3;g.beginPath();g.arc(0,0,r,0,7);g.stroke();
 g.fillStyle='#fff';g.beginPath();g.moveTo(r+6,0);g.lineTo(r-2,-6);g.lineTo(r-2,6);g.fill();g.restore();}
function emblem(g,t,s,gold){g.save();g.rotate(Math.PI/2);g.lineWidth=2;g.strokeStyle=gold?'#ffd700':'#fff';
 if(t=='heart'){g.fillStyle='#fff';g.beginPath();g.moveTo(0,s*.6);g.bezierCurveTo(-s*1.2,-s*.2,-s*.5,-s*1,0,-s*.35);g.bezierCurveTo(s*.5,-s*1,s*1.2,-s*.2,0,s*.6);g.fill();g.fillStyle='#ff2f9a';g.beginPath();g.arc(0,-s*.1,s*.25,0,7);g.fill();}
 else if(t=='diamond'){g.fillStyle='#dff6ff';g.beginPath();g.moveTo(0,-s);g.lineTo(s*.7,-s*.2);g.lineTo(0,s);g.lineTo(-s*.7,-s*.2);g.closePath();g.fill();g.stroke();}
 else if(t=='fire'){g.fillStyle='#ffb000';g.beginPath();g.moveTo(0,-s*1.1);g.quadraticCurveTo(s*.9,0,s*.4,s*.8);g.lineTo(-s*.4,s*.8);g.quadraticCurveTo(-s*.9,0,0,-s*1.1);g.fill();g.stroke();g.fillStyle='#ff3a00';g.beginPath();g.arc(0,s*.35,s*.3,0,7);g.fill();}
 else if(t=='leaf'){g.fillStyle='#d9ffcf';g.beginPath();g.ellipse(0,0,s*.45,s*.9,.5,0,7);g.fill();}
 else if(t=='star'){g.fillStyle='#fff3a0';star(g,0,0,s*.9,s*.4);}
 else{g.fillStyle='#fff';g.beginPath();g.moveTo(s*.2,-s);g.lineTo(-s*.4,s*.1);g.lineTo(0,s*.1);g.lineTo(-s*.2,s);g.lineTo(s*.4,-s*.1);g.lineTo(0,-s*.1);g.fill();}
 g.restore();}
function star(g,x,y,R,r){g.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,d=i%2?r:R;g.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d);}g.closePath();g.fill();}
function heart(g,x,y,s){g.beginPath();g.moveTo(x,y+s*.6);g.bezierCurveTo(x-s*1.2,y-s*.2,x-s*.5,y-s,x,y-s*.35);g.bezierCurveTo(x+s*.5,y-s,x+s*1.2,y-s*.2,x,y+s*.6);g.fill();}
// décor fixe du sol (cœurs, étoiles, formes)
const DECO=[];{let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;for(let i=0;i<46;i++){const a=rnd()*7,d=Math.sqrt(rnd())*(AR-70);DECO.push({x:Math.cos(a)*d,y:Math.sin(a)*d,t:['h','s','d','c'][i%4],s:16+rnd()*26,col:['#ff7fe0','#ffe36b','#7fe8ff','#b98bff','#8dff9a'][i%5],ph:rnd()*7});}}
const CLOUDS=[];for(let i=0;i<70;i++){const a=i/70*Math.PI*2;CLOUDS.push({a,d:AR+90+(i*37%5)*45,r:80+(i*53%4)*30});}
const FALLS=[0.3,1.2,2.1,3.0,3.9,4.8,5.6].map(a=>({a}));
// input
const keys={};let joy={x:0,y:0},fire=[0,0,0,0];
addEventListener('keydown',e=>{keys[e.code]=1;const m={Space:0,KeyJ:0,KeyK:1,KeyL:2,KeyE:3,KeyI:3}[e.code];if(m!=null){fire[m]=1;e.preventDefault();}if(e.code.startsWith('Arrow'))e.preventDefault();});
addEventListener('keyup',e=>keys[e.code]=0);
const st=$('stick'),kn=$('knob');let sid=null;
function sm(t){const r=st.getBoundingClientRect();let x=t.clientX-r.left-70,y=t.clientY-r.top-70;const l=Math.hypot(x,y);if(l>55){x*=55/l;y*=55/l;}kn.style.left=45+x+'px';kn.style.top=45+y+'px';joy={x:x/55,y:y/55};}
st.addEventListener('touchstart',e=>{e.preventDefault();sid=e.changedTouches[0].identifier;sm(e.changedTouches[0]);},{passive:false});
st.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier==sid)sm(t);},{passive:false});
st.addEventListener('touchend',e=>{for(const t of e.changedTouches)if(t.identifier==sid){sid=null;joy={x:0,y:0};kn.style.left=kn.style.top='45px';}});
document.querySelectorAll('#btns button').forEach(b=>{const f=e=>{e.preventDefault();fire[+b.dataset.w]=1;};b.addEventListener('touchstart',f,{passive:false});b.addEventListener('mousedown',f);});
const isTouch='ontouchstart'in window||navigator.maxTouchPoints>0;
// game
function start(){cars=CARS.map((c,i)=>{const a=i/6*Math.PI*2;return{c,x:Math.cos(a)*450,y:Math.sin(a)*450,vx:0,vy:0,a:a+Math.PI,r:38,
 me:i==sel,score:0,out:0,fall:0,rest:null,lastHit:null,m:1,cd:[0,0,0,0],freeze:0,skid:0,slow:0,stun:0,root:0,charm:0,ai:{t:0,tx:0,ty:0}}});
 shots=[];fx=[];outOrder=[];tLeft=ROUND;state='play';$('menu').classList.add('hidden');$('over').classList.add('hidden');$('touch').classList.toggle('hidden',!isTouch);
 $('spBtn').textContent=CARS[sel].sp.split(' ')[0];}
$('play').onclick=start;$('again').onclick=()=>{state='menu';$('over').classList.add('hidden');$('menu').classList.remove('hidden');$('touch').classList.add('hidden');};
function shoot(k,w){if(k.cd[w]>0||k.freeze>0||k.stun>0)return;const ca=Math.cos(k.a),sa=Math.sin(k.a),x=k.x+ca*(k.r+12),y=k.y+sa*(k.r+12);
 if(w==0){k.cd[0]=WCD[0];shots.push({o:k,t:'balle',x,y,vx:ca*700,vy:sa*700,r:22,life:1.6});}
 else if(w==1){k.cd[1]=WCD[1];shots.push({o:k,t:'filet',x,y,vx:ca*550,vy:sa*550,r:18,life:1.2});}
 else if(w==2){k.cd[2]=WCD[2];shots.push({o:k,t:'glace',x,y,vx:ca*800,vy:sa*800,r:9,life:1});}
 else{k.cd[3]=SPCD;const id=k.c.id;
  if(id=='violet'){fx.push({t:'vortex',x:k.x+ca*220,y:k.y+sa*220,life:2.5,o:k});}
  else if(id=='or'){fx.push({t:'eclair',x:k.x,y:k.y,a:k.a,life:.25});cars.forEach(o=>{if(o==k)return;const dx=o.x-k.x,dy=o.y-k.y,along=dx*ca+dy*sa,perp=Math.abs(-dx*sa+dy*ca);if(along>0&&along<700&&perp<o.r+15)hit(k,o,'eclair');});}
  else shots.push({o:k,t:id,x,y,vx:ca*650,vy:sa*650,r:id=='rouge'?20:16,life:1.3});}}
function hit(src,o,t){src.score+=t=='balle'||t=='rouge'?20:10;const dx=o.x-src.x,dy=o.y-src.y,l=Math.hypot(dx,dy)||1,nx=dx/l,ny=dy/l;
 switch(t){case'balle':o.vx+=nx*1150;o.vy+=ny*1150;o.lastHit=src;break;case'filet':o.freeze=2;o.vx=o.vy=0;break;case'glace':o.skid=3.5;o.vx+=nx*250;o.vy+=ny*250;break;
 case'bleu':o.skid=3;o.slow=3;o.vx+=nx*400;o.vy+=ny*400;break;case'rouge':o.vx+=nx*1400;o.vy+=ny*1400;o.lastHit=src;break;case'eclair':o.stun=1;o.vx+=nx*500;o.vy+=ny*500;break;
 case'vert':o.root=2.5;o.vx=o.vy=0;break;case'rose':o.vx+=nx*800;o.vy+=ny*800;o.charm=3;break;}
 fx.push({t:'boom',x:o.x,y:o.y,life:.4,col:{balle:'#fff',filet:'#ddd',glace:'#9ef',bleu:'#6cf',rouge:'#f60',vert:'#3c3',rose:'#f6c',eclair:'#ff0'}[t]});}
function aiCtl(k,dt){const ai=k.ai;ai.t-=dt;let tg=null,bd=1e9;
 const dc=Math.hypot(k.x,k.y);if(dc>AR-220){const want=Math.atan2(-k.y,-k.x);let da=((want-k.a+Math.PI*3)%(Math.PI*2))-Math.PI;return{turn:Math.max(-1,Math.min(1,da*3)),thr:Math.abs(da)<1.2?1:.2};}
 cars.forEach(o=>{if(o!=k&&!o.out){const d=Math.hypot(o.x-k.x,o.y-k.y);if(d<bd){bd=d;tg=o;}}});
 if(!tg)return{turn:0,thr:0};
 // viser un point légèrement côté centre de la cible pour la pousser vers le bord
 const tl=Math.hypot(tg.x,tg.y)||1,px=tg.x-tg.x/tl*40,py=tg.y-tg.y/tl*40;const want=Math.atan2(py-k.y,px-k.x);let da=((want-k.a+Math.PI*3)%(Math.PI*2))-Math.PI;
 const aligned=Math.abs(da)<.25;if(aligned&&Math.random()<dt*1.5)shoot(k,Math.floor(Math.random()*4));
 return{turn:Math.max(-1,Math.min(1,da*3)),thr:Math.abs(da)<1.4?1:.4};}
function update(dt){tLeft-=dt;T+=dt;if(tLeft<=0)return end();
 for(const k of cars){if(k.out){updOut(k,dt);continue;}k.cd=k.cd.map(v=>Math.max(0,v-dt));['freeze','skid','slow','stun','root','charm'].forEach(s=>k[s]=Math.max(0,k[s]-dt));
  let turn=0,thr=0;
  if(k.me){let jx=joy.x,jy=joy.y;if(keys.ArrowLeft||keys.KeyA)turn=-1;if(keys.ArrowRight||keys.KeyD)turn=1;if(keys.ArrowUp||keys.KeyW)thr=1;if(keys.ArrowDown||keys.KeyS)thr=-.6;
   if(Math.hypot(jx,jy)>.2){const want=Math.atan2(jy,jx);let da=((want-k.a+Math.PI*3)%(Math.PI*2))-Math.PI;turn=Math.max(-1,Math.min(1,da*3));thr=Math.hypot(jx,jy);}
   fire.forEach((f,w)=>{if(f)shoot(k,w);});fire=[0,0,0,0];}
  else{const c=aiCtl(k,dt);turn=c.turn;thr=c.thr;}
  if(k.charm>0){turn=Math.sin(performance.now()/150+k.x)*1.5;}
  if(k.freeze>0||k.stun>0||k.root>0){turn=0;thr=0;}
  k.a+=turn*3.2*dt;const acc=(k.slow>0?380:750)*thr;k.vx+=Math.cos(k.a)*acc*dt;k.vy+=Math.sin(k.a)*acc*dt;
  const grip=k.skid>0?.25:2.6;// lateral friction
  const ca=Math.cos(k.a),sa=Math.sin(k.a),f=k.vx*ca+k.vy*sa,l=-k.vx*sa+k.vy*ca,nl=l*Math.exp(-grip*dt*3),nf=f*Math.exp(-(k.skid>0?.3:1.2)*dt);
  k.vx=ca*nf-sa*nl;k.vy=sa*nf+ca*nl;if(k.freeze>0||k.root>0){k.vx=k.vy=0;}
  k.x+=k.vx*dt;k.y+=k.vy*dt;const d=Math.hypot(k.x,k.y);if(d>AR){if(cars.filter(o=>!o.out).length>1)eliminate(k);else{k.x*=(AR-1)/d;k.y*=(AR-1)/d;k.vx=-k.vx;k.vy=-k.vy;}}}
 const alive=cars.filter(k=>!k.out);if(alive.length<=1&&!cars.some(k=>k.out&&k.fall>0))return end();
 // bumper collisions
 for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){const a=cars[i],b=cars[j];if(a.out||b.out)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<a.r+b.r&&d>0){
  const nx=dx/d,ny=dy/d,ov=a.r+b.r-d;a.x-=nx*ov/2;a.y-=ny*ov/2;b.x+=nx*ov/2;b.y+=ny*ov/2;const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
  if(rv<0){const e=1.5,J=-(1+e)*rv/(1/a.m+1/b.m)+160;a.vx-=J/a.m*nx;a.vy-=J/a.m*ny;b.vx+=J/b.m*nx;b.vy+=J/b.m*ny;if(a.freeze>0||a.root>0){b.vx+=J*.3*nx;b.vy+=J*.3*ny;}if(b.freeze>0||b.root>0){a.vx-=J*.3*nx;a.vy-=J*.3*ny;}const fa=Math.hypot(a.vx,a.vy)<Math.hypot(b.vx,b.vy);(fa?a:b).lastHit=fa?b:a;const sa_=a.vx*nx+a.vy*ny;if(Math.abs(rv)>120){(Math.hypot(a.vx,a.vy)<Math.hypot(b.vx,b.vy)?b:a).score+=5;fx.push({t:'boom',x:a.x+nx*a.r,y:a.y+ny*a.r,life:.3,col:'#ffd86b'});}}}}
 for(const s of shots){if(s.o.out)s.life=0;s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;for(const o of cars)if(o!=s.o&&!o.out&&s.life>0&&Math.hypot(o.x-s.x,o.y-s.y)<o.r+s.r){hit(s.o,o,s.t);s.life=0;}if(Math.hypot(s.x,s.y)>AR+150)s.life=0;}
 shots=shots.filter(s=>s.life>0);
 for(const f of fx){f.life-=dt;if(f.t=='vortex')cars.forEach(o=>{if(o==f.o||o.out)return;const dx=f.x-o.x,dy=f.y-o.y,d=Math.hypot(dx,dy);if(d<380&&d>5){o.vx+=dx/d*900*dt;o.vy+=dy/d*900*dt;if(d<60)f.o.score+=dt*10;}});}
 fx=fx.filter(f=>f.life>0);}
function eliminate(k){k.out=1;k.fall=1;const a=Math.atan2(k.y,k.x);k.rest={x:Math.cos(a)*(AR+170),y:Math.sin(a)*(AR+170)};k.fx0=k.x;k.fy0=k.y;
 k.vx=k.vy=0;outOrder.push(k);if(k.lastHit&&!k.lastHit.out)k.lastHit.score+=50;fx.push({t:'txt',x:k.x,y:k.y,life:1.5,txt:'BOING !'});}
function updOut(k,dt){if(k.fall>0){k.fall=Math.max(0,k.fall-dt*1.3);const p=1-k.fall;k.x=k.fx0+(k.rest.x-k.fx0)*p;k.y=k.fy0+(k.rest.y-k.fy0)*p;}}
function end(){state='over';$('touch').classList.add('hidden');const alive=cars.filter(k=>!k.out).sort((a,b)=>Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y));const r=[...alive,...[...outOrder].reverse()];
 $('winner').textContent=(alive.length>1?'⏱ Temps écoulé ! ':'')+(r[0].me?'🏆 Tu as gagné !':'🏆 Gagnante : voiture '+r[0].c.nom);
 $('ranking').innerHTML='<b>Classement (gagnante d\'abord)</b><br>'+r.map((k,i)=>`${i+1}. ${k.c.nom}${k.me?' (toi)':''}${k.out?' — éliminée '+(outOrder.indexOf(k)+1)+'<sup>e</sup>':' — dernière debout !'} · ${Math.round(k.score)} pts`).join('<br>');$('over').classList.remove('hidden');}
function cloud(g,x,y,r,col){g.fillStyle=col;for(const[dx,dy,k]of[[0,0,1],[-.8,.2,.7],[.8,.15,.75],[-.35,-.45,.7],[.4,-.4,.65]]){g.beginPath();g.arc(x+dx*r,y+dy*r,r*k,0,7);g.fill();}}
function draw(){ctx.setTransform(DPR,0,0,DPR,0,0);
 // ciel coucher de soleil + arc-en-ciel
 const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#7ec8ff');sky.addColorStop(.5,'#ffb3e0');sky.addColorStop(1,'#ffcf8a');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 if(state!='play'&&!cars.length)return;
 ctx.save();ctx.globalAlpha=.45;const rc=['#ff3b3b','#ff9a2e','#ffe93b','#4fe05a','#3bb6ff','#7a5bff'];ctx.lineWidth=Math.max(8,W/90);rc.forEach((c,i)=>{ctx.strokeStyle=c;ctx.beginPath();ctx.arc(W/2,H*.95,Math.max(W,H)*.75-i*ctx.lineWidth,Math.PI*1.08,Math.PI*1.92);ctx.stroke();});ctx.restore();
 const me=cars.find(k=>k.me),sc=Math.min(W,H)/(W<700?1150:1750);const cx=me.out?0:me.x*.45,cy=me.out?0:me.y*.45;ctx.save();ctx.translate(W/2,H/2);ctx.scale(sc,sc);ctx.translate(-cx,-cy);
 const t=performance.now()/1000;
 // nuages (arrière)
 for(const c of CLOUDS)cloud(ctx,Math.cos(c.a)*(c.d+40),Math.sin(c.a)*(c.d+40)+Math.sin(t+c.a*3)*6,c.r,'#f7a8d8');
 // dessous de l'île
 ctx.fillStyle='#8a5a9e';ctx.beginPath();ctx.ellipse(0,60,AR*.97,AR*.97,0,0,7);ctx.fill();
 // cascades
 for(const f of FALLS){const x=Math.cos(f.a)*AR,y=Math.sin(f.a)*AR,nx=Math.cos(f.a),ny=Math.sin(f.a);const g=ctx.createLinearGradient(x,y,x+nx*200,y+ny*200);g.addColorStop(0,'#bff6ffee');g.addColorStop(1,'#bff6ff00');ctx.fillStyle=g;
  ctx.save();ctx.translate(x,y);ctx.rotate(f.a);ctx.fillRect(-10,-28,200,56);ctx.fillStyle='#fff9';for(let i=0;i<4;i++)ctx.fillRect(((t*160+i*50)%200),-20+i*12,22,4);ctx.restore();}
 // sol de l'île
 ctx.save();ctx.beginPath();ctx.arc(0,0,AR,0,7);ctx.clip();
 if(imgs.arena){const im=imgs.arena,s=2*AR/Math.min(im.width,im.height);ctx.drawImage(im,-im.width*s/2,-im.height*s/2,im.width*s,im.height*s);}
 else{const g=ctx.createRadialGradient(0,0,50,0,0,AR);g.addColorStop(0,'#c08bff');g.addColorStop(.7,'#8f5be0');g.addColorStop(1,'#5b2fa8');ctx.fillStyle=g;ctx.fillRect(-AR,-AR,2*AR,2*AR);
  ctx.strokeStyle='#ffffff30';ctx.lineWidth=3;for(let r=150;r<AR;r+=150){ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.stroke();}
  for(const d of DECO){ctx.globalAlpha=.55+.35*Math.sin(t*2+d.ph);ctx.fillStyle=d.col;ctx.shadowColor=d.col;ctx.shadowBlur=18;
   if(d.t=='h')heart(ctx,d.x,d.y,d.s);else if(d.t=='s')star(ctx,d.x,d.y,d.s,d.s*.45);else if(d.t=='d'){ctx.beginPath();ctx.moveTo(d.x,d.y-d.s);ctx.lineTo(d.x+d.s*.7,d.y);ctx.lineTo(d.x,d.y+d.s);ctx.lineTo(d.x-d.s*.7,d.y);ctx.fill();}else{ctx.beginPath();ctx.arc(d.x,d.y,d.s*.6,0,7);ctx.fill();}}
  ctx.globalAlpha=1;ctx.shadowBlur=0;}
 ctx.restore();
 // bord : herbe/fleurs, pas de mur
 ctx.strokeStyle='#7be38a';ctx.lineWidth=12;ctx.setLineDash([30,14]);ctx.beginPath();ctx.arc(0,0,AR-6,0,7);ctx.stroke();ctx.setLineDash([]);
 // zone danger
 ctx.strokeStyle='#ff3b6b55';ctx.lineWidth=4;ctx.setLineDash([12,12]);ctx.beginPath();ctx.arc(0,0,AR-150,0,7);ctx.stroke();ctx.setLineDash([]);
 // nuages (avant)
 for(const c of CLOUDS)if(c.d>AR+150)cloud(ctx,Math.cos(c.a)*(c.d+60),Math.sin(c.a)*(c.d+60)+Math.sin(t*1.3+c.a*5)*8,c.r*.8,'#ffd1ec');
 for(const f of fx){ctx.globalAlpha=Math.min(1,f.life*3);
  if(f.t=='vortex'){ctx.fillStyle='#000';ctx.beginPath();ctx.arc(f.x,f.y,50,0,7);ctx.fill();ctx.strokeStyle='#a35bff';ctx.lineWidth=4;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(f.x,f.y,80+i*60+(performance.now()/10%60),0,7);ctx.stroke();}}
  else if(f.t=='txt'){ctx.fillStyle='#fff';ctx.strokeStyle='#ff2f9a';ctx.lineWidth=6;ctx.font='bold 48px sans-serif';ctx.textAlign='center';ctx.strokeText(f.txt,f.x,f.y-(1.5-f.life)*60);ctx.fillText(f.txt,f.x,f.y-(1.5-f.life)*60);}
  else if(f.t=='eclair'){ctx.strokeStyle='#ff0';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(f.x,f.y);for(let i=1;i<=8;i++){const d=i*87;ctx.lineTo(f.x+Math.cos(f.a)*d+(Math.random()-.5)*30,f.y+Math.sin(f.a)*d+(Math.random()-.5)*30);}ctx.stroke();}
  else{ctx.fillStyle=f.col;ctx.beginPath();ctx.arc(f.x,f.y,(0.5-f.life)*120+10,0,7);ctx.fill();}ctx.globalAlpha=1;}
 for(const s of shots){const C={balle:'#fff',filet:'#eee',glace:'#9ef',bleu:'#6cf',rouge:'#f60',vert:'#3c3',rose:'#f6c'}[s.t];ctx.fillStyle=C;
  if(s.t=='filet'){ctx.strokeStyle=C;ctx.lineWidth=2;ctx.strokeRect(s.x-s.r,s.y-s.r,2*s.r,2*s.r);ctx.beginPath();ctx.moveTo(s.x-s.r,s.y);ctx.lineTo(s.x+s.r,s.y);ctx.moveTo(s.x,s.y-s.r);ctx.lineTo(s.x,s.y+s.r);ctx.stroke();}
  else if(s.t=='rose'){ctx.font='36px serif';ctx.textAlign='center';ctx.fillText('💖',s.x,s.y+12);}
  else{ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill();if(s.t=='rouge'){ctx.fillStyle='#f604';ctx.beginPath();ctx.arc(s.x-s.vx*.05,s.y-s.vy*.05,s.r*1.3,0,7);ctx.fill();}}}
 for(const k of cars){ctx.save();ctx.translate(k.x,k.y);
  if(k.out){const p=1-k.fall,sc2=k.fall>0?1-.35*Math.sin(p*Math.PI):1,bo=k.fall>0?0:Math.abs(Math.sin(t*3))*Math.max(0,1-(t-(k.t0||(k.t0=t)))/2)*30;ctx.translate(0,-bo);ctx.scale(sc2,sc2);
   ctx.globalAlpha=.6;ctx.filter='grayscale(0.8)';drawCar(ctx,k.c,k.a+(k.fall>0?p*6:0),k.r);ctx.filter='none';ctx.globalAlpha=1;
   ctx.fillStyle='#ffe36b';for(let i=0;i<3;i++){const aa=t*3+i*2.1;star(ctx,Math.cos(aa)*34,-k.r-14+Math.sin(aa)*10,10,4.5);}
   ctx.fillStyle='#fff';ctx.strokeStyle='#c0207a';ctx.lineWidth=4;ctx.font='bold 20px sans-serif';ctx.textAlign='center';ctx.strokeText('Éliminé',0,k.r+26);ctx.fillText('Éliminé',0,k.r+26);ctx.restore();continue;}
  drawCar(ctx,k.c,k.a,k.r);
  if(k.freeze>0){ctx.fillStyle='#ffffff30';ctx.beginPath();ctx.arc(0,0,k.r+12,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;for(let i=-40;i<=40;i+=16){ctx.beginPath();ctx.moveTo(i,-44);ctx.lineTo(i,44);ctx.moveTo(-44,i);ctx.lineTo(44,i);ctx.stroke();}}
  if(k.skid>0){ctx.strokeStyle='#9ef';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,k.r+8,0,7);ctx.stroke();}
  if(k.root>0){ctx.strokeStyle='#2a2';ctx.lineWidth=6;ctx.beginPath();for(let i=0;i<6;i++){ctx.moveTo(0,0);ctx.quadraticCurveTo(Math.cos(i)*60,Math.sin(i)*20,Math.cos(i)*50,Math.sin(i)*50);}ctx.stroke();}
  if(k.stun>0){ctx.font='24px serif';ctx.fillText('⚡',-10,-k.r-8);}if(k.charm>0){ctx.font='24px serif';ctx.fillText('💕',-12,-k.r-8);}
  ctx.fillStyle='#fff';ctx.strokeStyle='#5b2fa8';ctx.lineWidth=4;ctx.font='bold 18px sans-serif';ctx.textAlign='center';const lb=(k.me?'TOI · ':'')+k.c.nom;ctx.strokeText(lb,0,k.r+24);ctx.fillText(lb,0,k.r+24);
  if(k.me){ctx.fillStyle='#0008';ctx.fillRect(-40,-k.r-20,80,8);ctx.fillStyle=k.cd[0]>0?'#f84':'#4f4';ctx.fillRect(-40,-k.r-20,80*(1-k.cd[0]/WCD[0]),8);}
  ctx.restore();}
 ctx.restore();
 // HUD
 const narrow=W<560,hb=narrow?58:44,alive=cars.filter(k=>!k.out).length;ctx.fillStyle='#0009';ctx.fillRect(0,0,W,hb);ctx.fillStyle='#ffd86b';ctx.font='bold 18px sans-serif';ctx.textAlign='left';ctx.fillText('⏱ '+Math.ceil(tLeft)+' s',10,26);
 ctx.textAlign=narrow?'right':'center';ctx.fillText('🚗 En jeu : '+alive+'/6 · '+Math.round(me.score)+' pts',narrow?W-10:W/2,26);
 ctx.font='11px sans-serif';ctx.textAlign=narrow?'center':'right';ctx.fillText('© 2026 Sania Labbé (Valkyrie) · Projet Valkyrie',narrow?W/2:W-10,narrow?49:27);
 if(me.out){ctx.fillStyle='#fff';ctx.strokeStyle='#c0207a';ctx.lineWidth=5;ctx.font='bold 26px sans-serif';ctx.textAlign='center';ctx.strokeText('Tu es tombée sur les nuages ! 💫',W/2,hb+50);ctx.fillText('Tu es tombée sur les nuages ! 💫',W/2,hb+50);}
 const names=['Balle géante','Filet','Glace',me.c.sp],max=[WCD[0],WCD[1],WCD[2],SPCD];const y0=isTouch?(W<560?64:54):H-30;
 names.forEach((n,i)=>{const x=10+i*Math.min(170,(W-20)/4),w=Math.min(160,(W-20)/4-8);ctx.fillStyle='#0008';ctx.fillRect(x,y0,w,20);ctx.fillStyle=me.cd[i]>0?'#f84':'#4f4';ctx.fillRect(x,y0,w*(1-me.cd[i]/max[i]),20);
  ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.textAlign='left';ctx.fillText((me.cd[i]>0&&i==0?'Recharge… ':'')+n,x+4,y0+15);});
 document.querySelectorAll('#btns button').forEach((b,i)=>b.classList.toggle('cd',me.cd[i]>0));}
function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;if(state=='play')update(dt);draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
window.__game={start,get state(){return state},get cars(){return cars},end};

'use strict';
// © 2026 Sania Labbé (Valkyrie) – Tous droits réservés
const CARS=[
 {id:'rose',nom:'Rose',col:'#ff6fcf',sp:'Rayon de cœur',spd:'repousse et charme'},
 {id:'bleu',nom:'Bleue',col:'#4fb6ff',sp:'Éclat de cristal',spd:'ralentit et fait glisser'},
 {id:'rouge',nom:'Rouge',col:'#ff4b3a',sp:'Traînée de feu',spd:'recul puissant'},
 {id:'vert',nom:'Verte',col:'#4fd65a',sp:'Lianes',spd:'enracine la cible'},
 {id:'violet',nom:'Violette',col:'#a35bff',sp:'Vortex trou noir',spd:'attire les voitures'},
 {id:'or',nom:'Dorée',col:'#ffc93a',sp:'Rayon éclair',spd:'rapide, étourdit'}];
const SPCD=6, WCD=[2.2,4,1.6], ROUND=90, AR=900; // arena radius
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
  g.fillStyle='#fff8';g.beginPath();g.arc(r*.25,0,r*.3,0,7);g.fill();}
 g.strokeStyle='#ffd86b';g.lineWidth=3;g.beginPath();g.arc(0,0,r,0,7);g.stroke();
 g.fillStyle='#fff';g.beginPath();g.moveTo(r+6,0);g.lineTo(r-2,-6);g.lineTo(r-2,6);g.fill();g.restore();}
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
 me:i==sel,score:0,cd:[0,0,0,0],freeze:0,skid:0,slow:0,stun:0,root:0,charm:0,ai:{t:0,tx:0,ty:0}}});
 shots=[];fx=[];tLeft=ROUND;state='play';$('menu').classList.add('hidden');$('over').classList.add('hidden');$('touch').classList.toggle('hidden',!isTouch);
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
 switch(t){case'balle':o.vx+=nx*650;o.vy+=ny*650;break;case'filet':o.freeze=2;o.vx=o.vy=0;break;case'glace':o.skid=3;break;
 case'bleu':o.skid=3;o.slow=3;break;case'rouge':o.vx+=nx*1100;o.vy+=ny*1100;break;case'eclair':o.stun=1;o.vx=o.vy=0;break;
 case'vert':o.root=2.5;o.vx=o.vy=0;break;case'rose':o.vx+=nx*600;o.vy+=ny*600;o.charm=3;break;}
 fx.push({t:'boom',x:o.x,y:o.y,life:.4,col:{balle:'#fff',filet:'#ddd',glace:'#9ef',bleu:'#6cf',rouge:'#f60',vert:'#3c3',rose:'#f6c',eclair:'#ff0'}[t]});}
function aiCtl(k,dt){const ai=k.ai;ai.t-=dt;let tg=null,bd=1e9;cars.forEach(o=>{if(o!=k){const d=Math.hypot(o.x-k.x,o.y-k.y);if(d<bd){bd=d;tg=o;}}});
 const want=Math.atan2(tg.y-k.y,tg.x-k.x);let da=((want-k.a+Math.PI*3)%(Math.PI*2))-Math.PI;
 const aligned=Math.abs(da)<.25;if(aligned&&Math.random()<dt*1.5)shoot(k,Math.floor(Math.random()*4));
 return{turn:Math.sign(da),thr:Math.hypot(k.x,k.y)>AR-150?.6:1};}
function update(dt){tLeft-=dt;if(tLeft<=0)return end();
 for(const k of cars){k.cd=k.cd.map(v=>Math.max(0,v-dt));['freeze','skid','slow','stun','root','charm'].forEach(s=>k[s]=Math.max(0,k[s]-dt));
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
  k.x+=k.vx*dt;k.y+=k.vy*dt;const d=Math.hypot(k.x,k.y);if(d>AR-k.r){const nx=k.x/d,ny=k.y/d;k.x=nx*(AR-k.r);k.y=ny*(AR-k.r);const vn=k.vx*nx+k.vy*ny;if(vn>0){k.vx-=1.8*vn*nx;k.vy-=1.8*vn*ny;}}}
 // bumper collisions
 for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++){const a=cars[i],b=cars[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d<a.r+b.r&&d>0){
  const nx=dx/d,ny=dy/d,ov=a.r+b.r-d;a.x-=nx*ov/2;a.y-=ny*ov/2;b.x+=nx*ov/2;b.y+=ny*ov/2;const rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
  if(rv<0){const imp=-1.6*rv/2+120;a.vx-=imp*nx;a.vy-=imp*ny;b.vx+=imp*nx;b.vy+=imp*ny;const sa_=a.vx*nx+a.vy*ny;if(Math.abs(rv)>120){(Math.hypot(a.vx,a.vy)<Math.hypot(b.vx,b.vy)?b:a).score+=5;fx.push({t:'boom',x:a.x+nx*a.r,y:a.y+ny*a.r,life:.3,col:'#ffd86b'});}}}}
 for(const s of shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;for(const o of cars)if(o!=s.o&&s.life>0&&Math.hypot(o.x-s.x,o.y-s.y)<o.r+s.r){hit(s.o,o,s.t);s.life=0;}if(Math.hypot(s.x,s.y)>AR)s.life=0;}
 shots=shots.filter(s=>s.life>0);
 for(const f of fx){f.life-=dt;if(f.t=='vortex')cars.forEach(o=>{if(o==f.o)return;const dx=f.x-o.x,dy=f.y-o.y,d=Math.hypot(dx,dy);if(d<380&&d>5){o.vx+=dx/d*900*dt;o.vy+=dy/d*900*dt;if(d<60)f.o.score+=dt*10;}});}
 fx=fx.filter(f=>f.life>0);}
function end(){state='over';$('touch').classList.add('hidden');const r=[...cars].sort((a,b)=>b.score-a.score);
 $('winner').textContent=r[0].me?'🏆 Tu as gagné !':'🏆 Gagnante : voiture '+r[0].c.nom;
 $('ranking').innerHTML=r.map((k,i)=>`${i+1}. ${k.c.nom}${k.me?' (toi)':''} — ${Math.round(k.score)} pts`).join('<br>');$('over').classList.remove('hidden');}
function draw(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#120a26';ctx.fillRect(0,0,W,H);if(state!='play'&&!cars.length)return;
 const me=cars.find(k=>k.me),sc=Math.min(W,H)/1150*1.4;ctx.save();ctx.translate(W/2,H/2);ctx.scale(sc,sc);ctx.translate(-me.x*.5,-me.y*.5);
 ctx.save();ctx.beginPath();ctx.arc(0,0,AR,0,7);ctx.clip();
 if(imgs.arena){const im=imgs.arena,s=2*AR/Math.min(im.width,im.height);ctx.globalAlpha=.55;ctx.drawImage(im,-im.width*s/2,-im.height*s/2,im.width*s,im.height*s);ctx.globalAlpha=1;}
 else{const g=ctx.createRadialGradient(0,0,50,0,0,AR);g.addColorStop(0,'#6b3fb0');g.addColorStop(1,'#2a1550');ctx.fillStyle=g;ctx.fillRect(-AR,-AR,2*AR,2*AR);
  ctx.strokeStyle='#fff2';ctx.lineWidth=2;for(let r=150;r<AR;r+=150){ctx.beginPath();ctx.arc(0,0,r,0,7);ctx.stroke();}}
 ctx.restore();ctx.strokeStyle='#ffd86b';ctx.lineWidth=14;ctx.beginPath();ctx.arc(0,0,AR,0,7);ctx.stroke();ctx.strokeStyle='#ff6fcf';ctx.lineWidth=5;ctx.stroke();
 for(const f of fx){ctx.globalAlpha=Math.min(1,f.life*3);
  if(f.t=='vortex'){ctx.fillStyle='#000';ctx.beginPath();ctx.arc(f.x,f.y,50,0,7);ctx.fill();ctx.strokeStyle='#a35bff';ctx.lineWidth=4;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(f.x,f.y,80+i*60+(performance.now()/10%60),0,7);ctx.stroke();}}
  else if(f.t=='eclair'){ctx.strokeStyle='#ff0';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(f.x,f.y);for(let i=1;i<=8;i++){const d=i*87;ctx.lineTo(f.x+Math.cos(f.a)*d+(Math.random()-.5)*30,f.y+Math.sin(f.a)*d+(Math.random()-.5)*30);}ctx.stroke();}
  else{ctx.fillStyle=f.col;ctx.beginPath();ctx.arc(f.x,f.y,(0.5-f.life)*120+10,0,7);ctx.fill();}ctx.globalAlpha=1;}
 for(const s of shots){const C={balle:'#fff',filet:'#eee',glace:'#9ef',bleu:'#6cf',rouge:'#f60',vert:'#3c3',rose:'#f6c'}[s.t];ctx.fillStyle=C;
  if(s.t=='filet'){ctx.strokeStyle=C;ctx.lineWidth=2;ctx.strokeRect(s.x-s.r,s.y-s.r,2*s.r,2*s.r);ctx.beginPath();ctx.moveTo(s.x-s.r,s.y);ctx.lineTo(s.x+s.r,s.y);ctx.moveTo(s.x,s.y-s.r);ctx.lineTo(s.x,s.y+s.r);ctx.stroke();}
  else if(s.t=='rose'){ctx.font='36px serif';ctx.textAlign='center';ctx.fillText('💖',s.x,s.y+12);}
  else{ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill();if(s.t=='rouge'){ctx.fillStyle='#f604';ctx.beginPath();ctx.arc(s.x-s.vx*.05,s.y-s.vy*.05,s.r*1.3,0,7);ctx.fill();}}}
 for(const k of cars){ctx.save();ctx.translate(k.x,k.y);drawCar(ctx,k.c,k.a,k.r);
  if(k.freeze>0){ctx.strokeStyle='#fff';ctx.lineWidth=2;for(let i=-40;i<=40;i+=16){ctx.beginPath();ctx.moveTo(i,-44);ctx.lineTo(i,44);ctx.moveTo(-44,i);ctx.lineTo(44,i);ctx.stroke();}}
  if(k.skid>0){ctx.strokeStyle='#9ef';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,k.r+8,0,7);ctx.stroke();}
  if(k.root>0){ctx.strokeStyle='#2a2';ctx.lineWidth=6;ctx.beginPath();for(let i=0;i<6;i++){ctx.moveTo(0,0);ctx.quadraticCurveTo(Math.cos(i)*60,Math.sin(i)*20,Math.cos(i)*50,Math.sin(i)*50);}ctx.stroke();}
  if(k.stun>0){ctx.font='24px serif';ctx.fillText('⚡',-10,-k.r-8);}if(k.charm>0){ctx.font='24px serif';ctx.fillText('💕',-12,-k.r-8);}
  ctx.fillStyle='#fff';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText((k.me?'TOI · ':'')+Math.round(k.score),0,k.r+24);
  if(k.me){ctx.fillStyle='#0008';ctx.fillRect(-40,-k.r-20,80,8);ctx.fillStyle=k.cd[0]>0?'#f84':'#4f4';ctx.fillRect(-40,-k.r-20,80*(1-k.cd[0]/WCD[0]),8);}
  ctx.restore();}
 ctx.restore();
 // HUD
 ctx.fillStyle='#0009';ctx.fillRect(0,0,W,44);ctx.fillStyle='#ffd86b';ctx.font='bold 20px sans-serif';ctx.textAlign='left';ctx.fillText('⏱ '+Math.ceil(tLeft)+' s',12,29);
 ctx.textAlign='center';ctx.fillText('Score : '+Math.round(me.score),W/2,29);ctx.textAlign='right';ctx.font='12px sans-serif';ctx.fillText('© 2026 Sania Labbé (Valkyrie)',W-10,27);
 const names=['Balle géante','Filet','Glace',me.c.sp],max=[WCD[0],WCD[1],WCD[2],SPCD];const y0=isTouch?54:H-30;
 names.forEach((n,i)=>{const x=10+i*Math.min(170,(W-20)/4),w=Math.min(160,(W-20)/4-8);ctx.fillStyle='#0008';ctx.fillRect(x,y0,w,20);ctx.fillStyle=me.cd[i]>0?'#f84':'#4f4';ctx.fillRect(x,y0,w*(1-me.cd[i]/max[i]),20);
  ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.textAlign='left';ctx.fillText((me.cd[i]>0&&i==0?'Recharge… ':'')+n,x+4,y0+15);});
 document.querySelectorAll('#btns button').forEach((b,i)=>b.classList.toggle('cd',me.cd[i]>0));}
function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;if(state=='play')update(dt);draw();requestAnimationFrame(loop);}requestAnimationFrame(loop);
window.__game={start,get state(){return state}};

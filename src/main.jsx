import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Compass, Gamepad2, Menu, Mountain, Orbit, Plane, Sparkles, Trees, Waves, X, Plus, Pencil, Trash2, Save, ImagePlus } from 'lucide-react';
import * as THREE from 'three';
import './style.css';

const worlds = [
  { id:'01', name:'Kevin', subtitle:'LAUT TANPA BATAS', headline:'Tanpa peta.\nTanpa batas.', note:'Ada laut yang belum bernama, pulau yang cuma muncul sekali seabad, dan kru yang bikin perjalanan terasa seperti rumah.', palette:'ocean', icon:Waves, image:'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=76', detail:'KEBEBASAN / KRU / CAKRAWALA', stamp:'ARUNGI LAUT' },
  { id:'02', name:'Halim', subtitle:'TEMPAT AWAN BERISTIRAHAT', headline:'Tenang adalah\nkeajaiban.', note:'Fuji di kejauhan, kabut yang bergerak pelan, dan pagi yang rasanya bisa berlangsung selamanya.', palette:'fuji', icon:Mountain, image:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=76', detail:'KABUT / HENING / LANGIT', stamp:'NEGERI KETENANGAN' },
  { id:'03', name:'Leonel', subtitle:'PETUALANGAN DIMULAI', headline:'Satu nyawa\nlagi.', note:'Side quest yang nggak ada di walkthrough, pixel yang hilang, dan checkpoint yang selalu muncul di saat tepat.', palette:'pixel', icon:Gamepad2, image:'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=76', detail:'PIXEL / MISI / LANJUT', stamp:'MULAI PETUALANGAN' },
  { id:'04', name:'Galih', subtitle:'HIJAU DI ANTARA KITA', headline:'Tersesatlah.\nBertumbuh liar.', note:'Hutan yang nggak peduli jam berapa sekarang. Cahaya yang jatuh di lumut. Jalan pulang yang boleh ditunda.', palette:'forest', icon:Trees, image:'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=76', detail:'PAKU / BUMI / JELAJAH', stamp:'TINGGAL SEJENAK' },
  { id:'05', name:'Kafi', subtitle:'MELAMPAUI KEBIASAAN', headline:'Perjalanan\ndimulai di sini.', note:'Di atas awan, semua kota kelihatan seperti kemungkinan. Dan setiap landasan adalah alasan untuk berangkat lagi.', palette:'flight', icon:Plane, image:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=76', detail:'KETINGGIAN / GERAK / PULANG', stamp:'KEBERANGKATAN BERIKUTNYA' },
];

function useReveal(){
  useEffect(()=>{
    const nodes=[...document.querySelectorAll('[data-reveal]')];
    if(!('IntersectionObserver' in window)){nodes.forEach(n=>n.classList.add('is-visible'));return}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.13,rootMargin:'0px 0px -35px 0px'});
    nodes.forEach(n=>io.observe(n)); return ()=>io.disconnect();
  },[]);
}
function MotionSystem(){
  useEffect(()=>{
    let raf=0;
    const update=()=>{
      cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{
        const max=document.documentElement.scrollHeight-window.innerHeight;
        document.documentElement.style.setProperty('--scroll',`${max>0?window.scrollY/max*100:0}%`);
        document.querySelectorAll('[data-parallax]').forEach(el=>{const r=el.getBoundingClientRect();const center=r.top+r.height/2-window.innerHeight/2;el.style.setProperty('--parallax',`${center * -0.055}px`)});
      });
    };
    update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('scroll',update);window.removeEventListener('resize',update)};
  },[]);
  return <div className="progress-line"/>;
}
function Header(){const loc=useLocation();const [open,setOpen]=useState(false);useEffect(()=>setOpen(false),[loc.pathname]);return <header className="site-nav"><Link className="wordmark" to="/"><span className="mark"><Orbit size={17}/></span><span>ODD WORLDS<small>ARSIP LIMA DUNIA</small></span></Link><button className="menu-toggle" onClick={()=>setOpen(!open)} aria-label="Buka atau tutup menu">{open?<X/>:<Menu/>}</button><nav className={open?'nav-links nav-open':'nav-links'}><Link className={loc.pathname==='/'?'nav-active':''} to="/">Dunia kami <span>01</span></Link><Link className={loc.pathname==='/archive'?'nav-active':''} to="/archive">Absensi kelas <ArrowUpRight size={14}/></Link><span className="nav-status"><i/> LIMA DUNIA KAMI</span></nav></header>}


function EarthGlobe(){
 const host=useRef(null);
 useEffect(()=>{
  const node=host.current;if(!node)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderer,scene,camera,globe,atmosphere,frame=0,observer,alive=true;
  try{
   scene=new THREE.Scene();
   camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.z=4.25;
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:window.devicePixelRatio<2,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(node.clientWidth||420,node.clientHeight||420);
   renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x000000,0);node.appendChild(renderer.domElement);
   const group=new THREE.Group();scene.add(group);
   const addGlobe=(texture)=>{if(!alive){texture?.dispose?.();return}if(texture)texture.colorSpace=THREE.SRGBColorSpace;const material=new THREE.MeshStandardMaterial({map:texture||null,color:texture?0xffffff:0x8ebbe8,roughness:1,metalness:0});globe=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),material);group.add(globe);render();};
   // Coba tekstur daring; bila gagal, buat tekstur Bumi sederhana secara lokal agar tidak menjadi bola hitam.
   const loader=new THREE.TextureLoader();loader.crossOrigin='anonymous';
   loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',texture=>addGlobe(texture),undefined,()=>{
    if(!alive)return;
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');
    const ocean=ctx.createLinearGradient(0,0,0,512);ocean.addColorStop(0,'#174c80');ocean.addColorStop(.48,'#267bb1');ocean.addColorStop(1,'#0b315d');ctx.fillStyle=ocean;ctx.fillRect(0,0,1024,512);
    // Bentuk daratan sederhana pada peta equirectangular (fallback lokal, tidak butuh internet).
    const land=(pts,fill='#77a978')=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#b4cf9b';ctx.lineWidth=2;ctx.stroke()};
    land([[80,105],[120,70],[180,62],[220,92],[205,125],[240,146],[218,175],[185,182],[170,225],[145,265],[120,220],[105,176],[75,145]],'#7ca77a');
    land([[205,245],[245,250],[275,285],[260,345],[230,405],[210,370],[215,320]],'#8ab07a');
    land([[410,95],[455,65],[515,76],[555,110],[600,102],[655,125],[675,160],[640,183],[605,170],[570,205],[530,190],[495,220],[470,185],[435,170]],'#84a97b');
    land([[490,215],[525,235],[540,290],[520,350],[490,325],[475,275]],'#9bb783');
    land([[640,270],[685,240],[735,250],[770,282],[748,320],[710,340],[675,310]],'#86ab77');
    land([[760,360],[790,350],[820,375],[800,395]],'#9cb98a');
    land([[835,100],[875,80],[910,95],[930,130],[900,155],[865,140]],'#82a879');
    // Awan halus agar permukaan tidak tampak polos.
    ctx.globalAlpha=.23;ctx.strokeStyle='#e7f5ff';ctx.lineWidth=10;[[90,130,190,105],[130,155,240,145],[430,135,570,120],[480,155,630,160],[650,285,755,270],[170,310,235,325],[810,115,910,130]].forEach(([x,y,x2,y2])=>{ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+30,y-18,x2-25,y2+18,x2,y2);ctx.stroke()});ctx.globalAlpha=1;
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;addGlobe(texture);
   });
   const light=new THREE.DirectionalLight(0xffffff,2.6);light.position.set(-2,1.4,3);scene.add(light);scene.add(new THREE.AmbientLight(0x719dc9,.75));
   atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.055,48,32),new THREE.ShaderMaterial({vertexShader:'varying vec3 vNormal; void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vNormal; void main(){float rim=pow(0.72-max(dot(normalize(vNormal),vec3(0.0,0.0,1.0)),0.0),2.4);gl_FragColor=vec4(0.20,0.62,1.0,rim*0.8);}',blending:THREE.AdditiveBlending,side:THREE.BackSide,transparent:true,depthWrite:false}));group.add(atmosphere);
   const resize=()=>{if(!alive)return;const w=Math.max(1,node.clientWidth),h=Math.max(1,node.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};
   const ro=new ResizeObserver(resize);ro.observe(node);
   let visible=true;observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;if(visible&&!reduced)animate()}, {threshold:.01});observer.observe(node);
   const render=()=>{if(!alive)return;renderer.render(scene,camera)};
   const animate=()=>{if(!alive||reduced||!visible)return;globe&&(globe.rotation.y+=.0018);atmosphere.rotation.y+=.0018;render();frame=requestAnimationFrame(animate)};
   render();if(!reduced)animate();
   return()=>{alive=false;cancelAnimationFrame(frame);ro.disconnect();observer?.disconnect();scene.traverse(o=>{o.geometry?.dispose();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{m.map?.dispose();m.dispose()})}});renderer.dispose();renderer.domElement.remove()};
  }catch(err){console.warn('Earth renderer fallback:',err)}
 },[]);
 return <div className="earth-three" ref={host} aria-label="Bumi 3D berputar" role="img"/>;
}

function Hero(){return <section className="hero" id="top"><div className="hero-noise"/><div className="hero-topline"><span><b className="tiny-star">✳</b> DUNIA IMAJINASI KAMI</span><span>LAHIR DI ANTARA KELAS & CERITA / 2026</span></div><div className="hero-copy"><p className="eyebrow">LIMA TEMAN, LIMA CARA MELIHAT DUNIA</p><h1>Kami tak pernah<br/>muat di <em>satu dunia.</em></h1><div className="hero-bottom"><p>Jadi kami bikin lima.<br/>Ini semesta kecil milik kami.</p><a className="round-down" href="#intro" aria-label="Gulir ke pengantar"><ArrowDown size={21}/></a></div></div><div className="hero-art earth-art" data-parallax aria-label="Bumi dari luar angkasa">
  <div className="earth-halo"></div><div className="earth-orbit earth-orbit-one"></div><div className="earth-orbit earth-orbit-two"></div>
  <EarthGlobe/>
  <span className="earth-label earth-label-one">BUMI / 001</span><span className="earth-label earth-label-two">RUMAH, UNTUK SAAT INI</span>
  <span className="earth-star earth-star-one">✳</span><span className="earth-star earth-star-two">✦</span>
</div><div className="hero-index"><span>GULIR UNTUK MELIHAT DUNIA</span><span>↓ &nbsp; 01—05</span></div></section>}
function Intro(){return <section className="intro section-wrap" id="intro" data-reveal><div className="intro-aside"><span className="eyebrow">CATATAN DARI KAMI</span><span className="vertical-rule"/><span className="side-count">01 / 06</span></div><div className="intro-main"><h2>Satu kelompok.<br/><em>Dunia berbeda.</em></h2><div className="intro-description"><span className="asterisk">✳</span><p>Lima nama, lima cara melihat dunia. Bukan karakter yang sempurna, bukan cerita yang selesai. Cuma teman-teman yang punya imajinasi terlalu luas buat ditaruh di satu halaman.</p></div></div></section>}
function WorldCard({world,index}){const Icon=world.icon;return <article className={`world-card world-${world.palette}`} data-reveal style={{'--delay':`${index*90}ms`}}><div className="world-image" data-parallax style={{'--world-image':`url("${world.image}")`}}><div className="image-tint"/><div className="image-grain"/><div className="image-top"><span>{world.id} <i>/</i> LIMA DUNIA</span><span className="world-icon"><Icon size={17}/></span></div><span className="image-stamp">{world.stamp}</span><span className="image-coordinate">OW—{world.id} / 2026</span><div className="image-center-mark"><span>{world.id}</span><div/></div></div><div className="world-info"><div className="world-info-top"><span className="eyebrow">{world.subtitle}</span><span className="world-name">{world.name}<span>®</span></span></div><h3>{world.headline.split('\n').map((line,i)=><React.Fragment key={line}>{i>0&&<br/>}{line}</React.Fragment>)}</h3><p>{world.note}</p><div className="world-bottom"><span>{world.detail}</span><span className="world-arrow"><ArrowUpRight size={19}/></span></div></div></article>}
function Worlds(){return <section className="worlds section-wrap" id="worlds"><div className="section-title" data-reveal><div><span className="eyebrow">CATATAN DUNIA / 001—005</span><h2>Pilih <em>duniamu.</em></h2></div><p>SETIAP DUNIA PUNYA<br/>ATURAN MAIN SENDIRI.</p></div><div className="world-list">{worlds.map((world,i)=><WorldCard key={world.id} world={world} index={i}/>)}</div></section>}
function PhotoSlot({large=false}){const [photo,setPhoto]=useState(null);const [name,setName]=useState('');const input=useRef(null);useEffect(()=>()=>{if(photo)URL.revokeObjectURL(photo)},[photo]);const handle=e=>{const f=e.target.files?.[0];if(!f)return;if(photo)URL.revokeObjectURL(photo);setPhoto(URL.createObjectURL(f));setName(f.name)};return <div className={`photo-slot ${large?'photo-large':''} ${photo?'photo-filled':''}`} onClick={()=>input.current?.click()} role="button" tabIndex="0" onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')input.current?.click()}}><input ref={input} type="file" accept="image/*" onChange={handle} aria-label="Pilih foto bersama"/>{photo?<><img src={photo} alt="Foto bersama"/><span className="photo-selected">{name} · KLIK UNTUK MENGGANTI</span></>:<><div className="photo-crosshair cross-tl"/><div className="photo-crosshair cross-tr"/><div className="photo-crosshair cross-bl"/><div className="photo-crosshair cross-br"/><div className="photo-placeholder-icon"><Sparkles size={24}/></div><span className="photo-main-label">{large?'KAMI BERLIMA':'FOTO KALIAN DI SINI'}</span><span className="photo-sub-label">Klik untuk menambahkan foto asli kalian</span><span className="photo-coordinates">K / H / L / G / K &nbsp; — &nbsp; 001</span></>}</div>}
function Together(){return <section className="together section-wrap" data-reveal><div className="together-head"><span className="eyebrow">06 / BAGIAN YANG PALING BERARTI</span><span className="eyebrow">SATU BINGKAI, LIMA CERITA</span></div><div className="together-layout"><div className="together-copy"><span className="together-star">✳</span><p className="eyebrow team-kicker">TIM KAMI / 2026</p><h2>Ndugal<br/><em>Racing.</em></h2><p>Berawal dari satu kelas, jadi satu tim. Inilah Ndugal Racing — teman-teman dengan cerita, gaya, dan dunia masing-masing.</p><span className="made-by">SATU TIM. BANYAK CERITA. ↗</span></div><figure className="team-photo-card"><img src="/team-ndugal-racing.jpeg" alt="Foto tim Ndugal Racing bersama di kelas"/><div className="team-photo-shade"/><span className="team-photo-index">NDUGAL RACING / TEAM PORTRAIT</span><figcaption><span>NDUGAL RACING</span><span>EST. 2026 · LIMA DUNIA, SATU TIM</span></figcaption><span className="team-photo-corner team-corner-a"/><span className="team-photo-corner team-corner-b"/><span className="team-photo-corner team-corner-c"/><span className="team-photo-corner team-corner-d"/></figure></div></section>}
function Footer(){return <footer className="footer"><div className="footer-big">SAMPAI<br/><em>DUNIA BERIKUTNYA.</em><span>✳</span></div><div className="footer-bottom"><Link to="/" className="wordmark footer-mark"><span className="mark"><Orbit size={16}/></span><span>ODD WORLDS<small>ARSIP LIMA DUNIA</small></span></Link><span>DIBUAT BERLIMA, DENGAN SEDIKIT BANTUAN SEMESTA.</span><a href="#top">KEMBALI KE ATAS ↑</a></div></footer>}
function Home(){useReveal();return <main><Hero/><Intro/><Worlds/><Together/><section className="archive-cta" data-reveal><div><span className="eyebrow">CERITA YANG TAK PUNYA BATAS</span><h2>Simpan hal-hal<br/><em>kecil yang ajaib.</em></h2></div><Link to="/archive" className="cta-link">Buka absensi sekolah <ArrowUpRight size={18}/></Link><div className="cta-orbit"><Orbit size={78}/></div></section><Footer/></main>}
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
async function apiRequest(path, options={}) {
 const response = await fetch(`${API_BASE}/api${path}`, {
  headers: {'Content-Type':'application/json', ...(options.headers||{})},
  ...options,
 });
 const data = await response.json().catch(()=>({message:'Balasan server tidak valid.'}));
 if (!response.ok) throw new Error(data.message || 'Permintaan ke server gagal.');
 return data;
}
function Archive(){
 useReveal();
 const [rows,setRows]=useState([]);
 const [editing,setEditing]=useState(null);
 const [form,setForm]=useState({name:'',kelas:'',date:new Date().toISOString().slice(0,10),status:'Hadir',note:''});
 const [notice,setNotice]=useState('');
 const [query,setQuery]=useState('');
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const loadRows=async()=>{
  setLoading(true);
  try { const data=await apiRequest('/absensi'); setRows(data.data||[]); setNotice('Data absensi berhasil dimuat dari basis data.'); }
  catch(err){setNotice(`Gagal terhubung ke basis data: ${err.message} Pastikan alamat API sudah diatur di Vercel.`);}
  finally {setLoading(false);}
 };
 useEffect(()=>{loadRows();},[]);
 const reset=()=>{setEditing(null);setForm({name:'',kelas:'',date:new Date().toISOString().slice(0,10),status:'Hadir',note:''})};
 const submit=async e=>{
  e.preventDefault(); if(!form.name.trim()||!form.kelas.trim()||!form.date)return;
  setSaving(true);
  try {
   const payload={name:form.name.trim(),kelas:form.kelas.trim(),date:form.date,status:form.status,note:form.note.trim()};
   if(editing){await apiRequest(`/absensi/${editing}`,{method:'PUT',body:JSON.stringify(payload)});setNotice('Data absensi berhasil diperbarui di basis data.');}
   else {await apiRequest('/absensi',{method:'POST',body:JSON.stringify(payload)});setNotice('Data absensi berhasil ditambahkan ke basis data.');}
   reset(); await loadRows();
  } catch(err){setNotice(`Gagal menyimpan: ${err.message}`)} finally {setSaving(false)}
 };
 const edit=r=>{setEditing(r.id);setForm({name:r.name,kelas:r.kelas,date:r.date,status:r.status,note:r.note||''});document.querySelector('#attendance-editor')?.scrollIntoView({behavior:'smooth',block:'start'})};
 const remove=async id=>{if(!window.confirm('Hapus data absensi ini?'))return;try{await apiRequest(`/absensi/${id}`,{method:'DELETE'});if(editing===id)reset();setNotice('Data absensi berhasil dihapus.');await loadRows()}catch(err){setNotice(`Gagal menghapus: ${err.message}`)}};
 const filtered=rows.filter(r=>[r.name,r.kelas,r.status,r.date,r.note].join(' ').toLowerCase().includes(query.toLowerCase()));
 const count=status=>rows.filter(r=>r.status===status).length;
 return <main className="archive-page attendance-page">
  <section className="archive-hero archive-hero-crud"><div className="archive-hero-orb earth-archive-art"><EarthGlobe/><span className="earth-archive-label earth-archive-label-a">BUMI / 001</span><span className="earth-archive-label earth-archive-label-b">RUMAH KITA</span><span className="earth-archive-ring"></span></div><span className="eyebrow"><i className="status-dot"/> PENGELOLAAN ABSENSI SEKOLAH</span><h1>Catat hadir.<br/>Rapikan <em>kelas.</em></h1><p>Catat kehadiran, cari siswa, dan kelola data kelas dalam satu tempat.</p><div className="archive-hero-bottom"><span>KELOLA ABSENSI SISWA</span><span>02 / 02</span></div></section>
  <section className="memory-section section-wrap">
   <div className="attendance-stats" data-reveal><div><span>Jumlah data</span><strong>{rows.length}</strong></div><div><span>Hadir</span><strong>{count('Hadir')}</strong></div><div><span>Izin</span><strong>{count('Izin')}</strong></div><div><span>Sakit</span><strong>{count('Sakit')}</strong></div><div><span>Alpa</span><strong>{count('Alpa')}</strong></div></div>
   <div className="crud-heading" data-reveal><div><span className="eyebrow">PENGELOLAAN DATA</span><h2>Daftar <em>absensi.</em></h2><p className="crud-subtitle">Tambah, edit, cari, dan hapus data siswa.</p></div><a href="#attendance-editor" className="cta-link"><Plus size={17}/> Tambah siswa</a></div>
   <div className="crud-layout attendance-layout">
    <form id="attendance-editor" className="memory-editor" onSubmit={submit} data-reveal>
      <div className="editor-top"><span className="eyebrow">{editing?'UBAH DATA SISWA':'FORMULIR ABSENSI'}</span><span className="editor-number">{editing?'EDIT':'BARU / 001'}</span></div>
      <h3>{editing?'Edit data absensi':'Masukkan kehadiran'}</h3>
      <label>Nama siswa<input required maxLength="120" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nama lengkap siswa"/></label>
      <div className="editor-row"><label>Kelas<input required maxLength="50" value={form.kelas} onChange={e=>setForm({...form,kelas:e.target.value})} placeholder="Contoh: XI RPL 1"/></label><label>Tanggal<input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label></div>
      <label>Status kehadiran<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Hadir</option><option>Izin</option><option>Sakit</option><option>Alpa</option></select></label>
      <label>Catatan (opsional)<textarea rows="3" maxLength="300" value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Keterangan singkat..."/></label>
      <div className="editor-actions"><button className="save-memory" type="submit" disabled={saving}><Save size={16}/>{saving?'Menyimpan…':editing?'Simpan perubahan':'Simpan absensi'}</button>{editing&&<button type="button" className="cancel-edit" onClick={reset}>Batal</button>}</div>
      {notice&&<p className="editor-notice" role="status">{notice}</p>}
      <p className="privacy-note">Data absensi disimpan di MySQL Railway dan dapat diakses dari perangkat yang berbeda.</p>
    </form>
    <div className="memory-results attendance-results" data-reveal><div className="results-top"><span className="eyebrow">DATA SISWA</span><span>{String(filtered.length).padStart(2,'0')} BARIS</span></div>
      <label className="attendance-search">Cari nama, kelas, tanggal, atau status<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ketik untuk mencari..."/></label>
      {loading?<div className="empty-memories"><h3>Memuat data…</h3><p>Mengambil data dari basis data.</p></div>:filtered.length===0?<div className="empty-memories"><Sparkles size={27}/><h3>Data tidak ditemukan.</h3><p>Coba kata kunci lain atau tambahkan data baru.</p></div>:<div className="attendance-table-wrap"><table className="attendance-table"><thead><tr><th>Nama / Kelas</th><th>Tanggal</th><th>Status</th><th>Catatan</th><th>Aksi</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td><strong>{r.name}</strong><small>{r.kelas}</small></td><td>{r.date}</td><td><span className={`attendance-status status-${r.status.toLowerCase()}`}>{r.status}</span></td><td className="attendance-note">{r.note||'—'}</td><td><div className="crud-actions"><button type="button" onClick={()=>edit(r)}><Pencil size={14}/> Edit</button><button type="button" className="delete-action" onClick={()=>remove(r.id)}><Trash2 size={14}/> Hapus</button></div></td></tr>)}</tbody></table></div>}
      <div className="attendance-footnote">DATA TERSIMPAN DI BASIS DATA</div>
    </div>
   </div>
   <div className="archive-return" data-reveal><span className="eyebrow">KEMBALI KE WEBSITE UTAMA</span><Link to="/" className="return-link"><ArrowLeft size={16}/> Kembali ke dunia kami</Link></div>
  </section><Footer/></main>
}
function App(){return <BrowserRouter><MotionSystem/><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/archive" element={<Archive/>}/></Routes></BrowserRouter>}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);

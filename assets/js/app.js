/* ============================================================
   UNIMAGDALENA · Unimagdalena en Cifras
   app.js — Tablero de indicadores por factor
   ------------------------------------------------------------
   Carga data/datos_indicadores.json y renderiza:
   - Navegación por factores (sidebar & drawer móvil)
   - Tarjetas de indicador con sparkline
   - Vista de tabla responsiva
   - Modal de detalle con gráfico grande + serie 2020–2025
   ============================================================ */

const ACCENT = '#0183EF';   // serie de datos (azul institucional)
const GOLD   = '#FF9400';   // punto final / referencia
const NACIONAL = '#8295AB'; // serie de referencia "Nacional"

let DB = null;
let DETALLE = {};   // detalle oficial por factor (definición + características)
let YEARS = [];
let curFactor = 0;   // índice del factor activo
let curInd = 0;      // índice del indicador activo dentro del factor

/* ---------- Enrutado de páginas ---------- */
const PAGES = ['inicio', 'factores', 'metodologia', 'datos'];
let curPage = 'inicio';

function showPage(page){
  if(!PAGES.includes(page)) page = 'inicio';
  curPage = page;
  document.querySelectorAll('.page').forEach(s =>
    s.classList.toggle('is-active', s.id === 'page-' + page));
  document.querySelectorAll('#pageNav .nav__item').forEach(b =>
    b.classList.toggle('is-active', b.dataset.page === page));
  
  // Cierre automático del menú móvil al navegar
  closeMobileMenu();

  if(page === 'factores') renderFactores();
  else if(page === 'inicio') renderInicio();
  else if(page === 'datos') renderDatos();
  else if(page === 'metodologia') renderMetodologia();
  
  const contentEl = document.querySelector('.content');
  if(contentEl) contentEl.scrollTo({top:0});
  window.scrollTo({top:0});
}

function router(){
  const h = (location.hash || '').replace(/^#\/?/, '');
  showPage(h || 'inicio');
}

/* ---------- Menú Móvil (Drawer) ---------- */
function openMobileMenu(){
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sbOverlay');
  const btn = document.getElementById('mbMenuBtn');
  if(sb) sb.classList.add('is-open');
  if(ov) ov.classList.add('is-active');
  if(btn) btn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('no-scroll');
}

function closeMobileMenu(){
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sbOverlay');
  const btn = document.getElementById('mbMenuBtn');
  if(sb) sb.classList.remove('is-open');
  if(ov) ov.classList.remove('is-active');
  if(btn) btn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('no-scroll');
}

function toggleMobileMenu(){
  const sb = document.getElementById('sidebar');
  if(sb && sb.classList.contains('is-open')) closeMobileMenu();
  else openMobileMenu();
}

/* ---------- Formato ---------- */
function fmt(v, pct){
  if(v === null || v === undefined) return '—';
  if(pct) return (v*100).toFixed(1).replace(/\.0$/, '') + '%';
  if(Math.abs(v) >= 1000) return v.toLocaleString('es-CO', {maximumFractionDigits:0});
  if(Number.isInteger(v)) return v.toString();
  return v.toLocaleString('es-CO', {maximumFractionDigits:2});
}
function lastVal(a){ for(let i=a.length-1;i>=0;i--) if(a[i]!==null) return {v:a[i],i}; return {v:null,i:-1}; }
function firstVal(a){ for(let i=0;i<a.length;i++) if(a[i]!==null) return {v:a[i],i}; return {v:null,i:-1}; }
function trend(vals){
  const f=firstVal(vals), l=lastVal(vals);
  if(f.v===null||l.v===null||f.i===l.i) return {dir:'flat',pct:0};
  if(f.v===0) return {dir:l.v>0?'up':'flat',pct:0};
  const p=((l.v-f.v)/Math.abs(f.v))*100;
  return {dir:p>0.5?'up':p<-0.5?'down':'flat', pct:p};
}

/* ---------- Sparkline (mini gráfico de tarjeta) ---------- */
function sparkline(vals, w=278, h=46){
  const pts = vals.map((v,i)=>({v,i})).filter(p=>p.v!==null);
  if(pts.length<2) return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="xMidYMid meet"></svg>';
  const xs=vals.length-1, mn=Math.min(...pts.map(p=>p.v)), mx=Math.max(...pts.map(p=>p.v)), rng=mx-mn||1;
  const X=i=>8+(i/xs)*(w-16), Y=v=>h-6-((v-mn)/rng)*(h-14);
  let d='';pts.forEach((p,k)=>{d+=(k?'L':'M')+X(p.i).toFixed(1)+' '+Y(p.v).toFixed(1)+' ';});
  const area=d+'L'+X(pts[pts.length-1].i).toFixed(1)+' '+h+' L'+X(pts[0].i).toFixed(1)+' '+h+' Z';
  const last=pts[pts.length-1];
  return '<svg width="100%" height="'+h+'" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="xMidYMid meet">'+
    '<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+ACCENT+'" stop-opacity="0.18"/><stop offset="1" stop-color="'+ACCENT+'" stop-opacity="0"/></linearGradient></defs>'+
    '<path d="'+area+'" fill="url(#sg)"/>'+
    '<path d="'+d+'" fill="none" stroke="'+ACCENT+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<circle cx="'+X(last.i).toFixed(1)+'" cy="'+Y(last.v).toFixed(1)+'" r="3.4" fill="'+GOLD+'"/></svg>';
}

/* ---------- Gráfico grande (modal) ---------- */
function bigChart(vals, pct){
  const w=760, h=310, pad={l:58,r:22,t:26,b:36};
  const pts=vals.map((v,i)=>({v,i})).filter(p=>p.v!==null);
  if(pts.length<2) return '<div class="empty">Datos insuficientes para graficar</div>';
  const mn0=Math.min(...pts.map(p=>p.v)), mx0=Math.max(...pts.map(p=>p.v));
  const pv=(mx0-mn0)*0.12 || Math.abs(mx0)*0.1 || 1;
  const mn=mn0-pv, mx=mx0+pv, rng=mx-mn||1;
  const X=i=>pad.l+(i/(vals.length-1))*(w-pad.l-pad.r), Y=v=>h-pad.b-((v-mn)/rng)*(h-pad.t-pad.b);
  let line='';pts.forEach((p,k)=>{line+=(k?'L':'M')+X(p.i).toFixed(1)+' '+Y(p.v).toFixed(1)+' ';});
  const area=line+'L'+X(pts[pts.length-1].i).toFixed(1)+' '+(h-pad.b)+' L'+X(pts[0].i).toFixed(1)+' '+(h-pad.b)+' Z';
  let grid='';const N=4;
  for(let g=0;g<=N;g++){const gv=mn+(rng*g/N), gy=Y(gv);
    grid+='<line x1="'+pad.l+'" y1="'+gy.toFixed(1)+'" x2="'+(w-pad.r)+'" y2="'+gy.toFixed(1)+'" stroke="#DCE5EE"/>';
    grid+='<text x="'+(pad.l-9)+'" y="'+(gy+4).toFixed(1)+'" text-anchor="end" font-size="11" fill="#8295AB" font-family="Inter">'+fmt(gv,pct)+'</text>';}
  let xl='';YEARS.forEach((yr,i)=>{xl+='<text x="'+X(i).toFixed(1)+'" y="'+(h-13)+'" text-anchor="middle" font-size="11.5" fill="#51637A" font-family="Outfit" font-weight="600">'+yr+'</text>';});
  let dots='';pts.forEach(p=>{dots+='<circle cx="'+X(p.i).toFixed(1)+'" cy="'+Y(p.v).toFixed(1)+'" r="4.2" fill="#fff" stroke="'+ACCENT+'" stroke-width="2.5"/>';
    dots+='<text x="'+X(p.i).toFixed(1)+'" y="'+(Y(p.v)-12).toFixed(1)+'" text-anchor="middle" font-size="11" font-weight="700" fill="#14243A" font-family="Outfit">'+fmt(p.v,pct)+'</text>';});
  return '<svg width="100%" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="xMidYMid meet" style="max-width:100%">'+
    '<defs><linearGradient id="ba" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+ACCENT+'" stop-opacity="0.15"/><stop offset="1" stop-color="'+ACCENT+'" stop-opacity="0"/></linearGradient></defs>'+
    grid+'<path d="'+area+'" fill="url(#ba)"/>'+
    '<path d="'+line+'" fill="none" stroke="'+ACCENT+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'+dots+xl+'</svg>';
}

/* ---------- Accesores de estado ---------- */
function currentFactor(){ return DB.factors[curFactor]; }
function currentInd(){ return currentFactor().indicators[curInd]; }

/* ---------- Dropdown personalizado (barra de filtros) ---------- */
function escHtml(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

let ddFactor = null, ddInd = null;

function makeDropdown(root, labelId, onSelect){
  root.innerHTML =
    '<button type="button" class="dd__btn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="'+labelId+'">'+
      '<span class="dd__val"></span>'+
      '<svg class="dd__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'+
    '</button>'+
    '<div class="dd__menu" role="listbox" hidden></div>';
  const btn=root.querySelector('.dd__btn');
  const valEl=root.querySelector('.dd__val');
  const menu=root.querySelector('.dd__menu');
  let items=[], selected=0, activeIdx=0;

  const opts=()=>menu.querySelectorAll('.dd__opt');
  function setValue(){ const t=items[selected]||''; valEl.textContent=t; btn.title=t; }
  function renderMenu(){
    menu.innerHTML=items.map((t,i)=>
      '<div class="dd__opt'+(i===selected?' is-sel':'')+'" role="option" data-i="'+i+'" '+
      'title="'+escHtml(t)+'" aria-selected="'+(i===selected)+'">'+escHtml(t)+'</div>').join('');
    opts().forEach(o=>{
      o.onclick=()=>{ choose(+o.dataset.i); };
    });
  }
  function markActive(){ opts().forEach((o,i)=>o.classList.toggle('is-active',i===activeIdx)); }
  function open(){
    if(!items.length) return;
    menu.hidden=false; btn.setAttribute('aria-expanded','true');
    menu.style.left='0'; menu.style.right='auto';
    if(menu.getBoundingClientRect().right > window.innerWidth-8){ menu.style.left='auto'; menu.style.right='0'; }
    activeIdx=selected; markActive();
    const el=opts()[activeIdx]; if(el) el.scrollIntoView({block:'nearest'});
    document.addEventListener('mousedown',onDoc,true);
    document.addEventListener('touchstart',onDoc,true);
  }
  function close(){
    menu.hidden=true;
    btn.setAttribute('aria-expanded','false');
    document.removeEventListener('mousedown',onDoc,true);
    document.removeEventListener('touchstart',onDoc,true);
  }
  function onDoc(e){ if(!root.contains(e.target)) close(); }
  function choose(i){ selected=i; setValue(); renderMenu(); close(); btn.focus(); onSelect(i); }

  btn.onclick=()=>{ menu.hidden?open():close(); };
  btn.onkeydown=e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      e.preventDefault();
      if(menu.hidden){ open(); return; }
      activeIdx=Math.max(0,Math.min(items.length-1,activeIdx+(e.key==='ArrowDown'?1:-1)));
      markActive(); opts()[activeIdx].scrollIntoView({block:'nearest'});
    } else if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      if(menu.hidden) open(); else choose(activeIdx);
    } else if(e.key==='Escape'){ close(); }
  };

  return {
    setItems(newItems, sel){ items=newItems||[]; selected=Math.max(0,Math.min(items.length-1,sel||0)); setValue(); renderMenu(); },
    close
  };
}

/* ---------- Render de la página Factores ---------- */
function renderFactores(){
  const f=currentFactor();
  if(curInd >= f.indicators.length) curInd = 0;
  // Banda oscura
  document.getElementById('fEyebrow').textContent='Factor '+f.n;
  document.getElementById('fTitle').textContent=f.factor;
  document.getElementById('fSub').textContent=
    f.indicators.length+' indicador'+(f.indicators.length===1?'':'es')+' · evolución '+YEARS[0]+'–'+YEARS[YEARS.length-1];
  // Dropdowns de la barra de filtros
  ddFactor.setItems(DB.factors.map(x=>String(x.n).padStart(2,'0')+' · '+x.factor), curFactor);
  ddInd.setItems(f.indicators.map(x=>x.name), curInd);
  renderContent();
}

/* ---------- Contenido del indicador (gráfico + 2 KPIs) ---------- */
function renderContent(){
  const ind=currentInd();
  const years=YEARS, vals=ind.values;
  const fi=firstVal(vals), la=lastVal(vals), t=trend(vals);
  const dcls=t.dir==='up'?'up':t.dir==='down'?'down':'flat';
  const arrow=t.dir==='up'?'▲':t.dir==='down'?'▼':'▬', sign=t.pct>0?'+':'';

  document.getElementById('content').innerHTML=
    '<div class="fx-view">'+
      '<div class="fx-chart">'+
        '<div class="fx-chart__head">'+
          '<span class="fx-chart__title">'+ind.name+'</span>'+
          (ind.dual ?
            '<div class="fx-legend">'+
              '<span class="fx-leg"><i style="background:'+ACCENT+'"></i>Unimagdalena</span>'+
              '<span class="fx-leg"><i style="background:'+NACIONAL+'"></i>Nacional</span>'+
            '</div>' : '')+
        '</div>'+
        '<div class="chart-host" id="chartHost"></div>'+
      '</div>'+
      '<div class="fx-kpis">'+
        '<div class="fx-kpi fx-kpi--final">'+
          '<span class="fx-kpi__eyebrow">Valor final</span>'+
          '<b class="fx-kpi__val">'+fmt(la.v,ind.pct)+'</b>'+
          '<span class="fx-kpi__year">'+(la.i>=0?years[la.i]:'sin dato')+'</span>'+
          '<span class="fx-kpi__delta '+dcls+'">'+arrow+' '+sign+t.pct.toFixed(1)+'%'+
            (fi.i>=0?' <em>vs '+years[fi.i]+'</em>':'')+'</span>'+
        '</div>'+
        '<div class="fx-kpi fx-kpi--start">'+
          '<span class="fx-kpi__eyebrow">Valor inicial</span>'+
          '<b class="fx-kpi__val">'+fmt(fi.v,ind.pct)+'</b>'+
          '<span class="fx-kpi__year">'+(fi.i>=0?years[fi.i]:'sin dato')+'</span>'+
          '<span class="fx-kpi__tag">Punto de partida</span>'+
        '</div>'+
      '</div>'+
    '</div>';

  mountChart(document.getElementById('chartHost'), ind, years);
}

/* ---------- Gráfico responsivo con ResizeObserver ---------- */
let chartRO = null;

function mountChart(host, ind, years){
  const draw=()=>{
    const w=host.clientWidth, h=host.clientHeight;
    if(w<10||h<10) return;
    const tipo = ind.chart==='barras' ? 'barras' : 'linea';
    host.innerHTML = tipo==='barras'
      ? buildBarSVG(ind, years, w, h)
      : buildLineSVG(ind, years, w, h);
  };
  draw();
  if(chartRO) chartRO.disconnect();
  chartRO = new ResizeObserver(draw);
  chartRO.observe(host);
}

/* Ejes + grilla horizontal compartidos */
function chartFrame(w, h, mn, mx, pct, pad){
  const rng=mx-mn||1;
  const Y=v=>h-pad.b-((v-mn)/rng)*(h-pad.t-pad.b);
  let grid='';const N=4;
  const fontSize = w < 420 ? '10' : '11';
  for(let g=0;g<=N;g++){const gv=mn+(rng*g/N), gy=Y(gv);
    grid+='<line x1="'+pad.l+'" y1="'+gy.toFixed(1)+'" x2="'+(w-pad.r)+'" y2="'+gy.toFixed(1)+'" stroke="#DCE5EE"/>';
    grid+='<text x="'+(pad.l-7)+'" y="'+(gy+4).toFixed(1)+'" text-anchor="end" font-size="'+fontSize+'" fill="#8295AB" font-family="Inter">'+fmt(gv,pct)+'</text>';}
  return {Y, grid};
}

/* ---- Gráfico de LÍNEA ---- */
function buildLineSVG(ind, years, w, h){
  const vals=ind.values, pct=ind.pct;
  const pad={l:w<420?46:58, r:w<420?14:22, t:24, b:32};
  const pts=vals.map((v,i)=>({v,i})).filter(p=>p.v!==null);
  if(pts.length<2) return '<div class="empty">Datos insuficientes para graficar</div>';

  const ref = (ind.dual && Array.isArray(ind.values_ref)) ? ind.values_ref : null;
  let allv=pts.map(p=>p.v);
  if(ref) allv=allv.concat(ref.filter(v=>v!==null));
  const mn0=Math.min(...allv), mx0=Math.max(...allv);
  const pv=(mx0-mn0)*0.12 || Math.abs(mx0)*0.1 || 1;
  const mn=mn0-pv, mx=mx0+pv;
  const n=vals.length-1||1;
  const X=i=>pad.l+(i/n)*(w-pad.l-pad.r);
  const {Y, grid}=chartFrame(w,h,mn,mx,pct,pad);

  let line='';pts.forEach((p,k)=>{line+=(k?'L':'M')+X(p.i).toFixed(1)+' '+Y(p.v).toFixed(1)+' ';});
  const area=line+'L'+X(pts[pts.length-1].i).toFixed(1)+' '+(h-pad.b)+' L'+X(pts[0].i).toFixed(1)+' '+(h-pad.b)+' Z';
  
  const labelFontSz = w < 420 ? '9.5' : '11';
  let dots='';pts.forEach(p=>{
    dots+='<circle cx="'+X(p.i).toFixed(1)+'" cy="'+Y(p.v).toFixed(1)+'" r="4" fill="#fff" stroke="'+ACCENT+'" stroke-width="2.5"/>';
    dots+='<text x="'+X(p.i).toFixed(1)+'" y="'+(Y(p.v)-10).toFixed(1)+'" text-anchor="middle" font-size="'+labelFontSz+'" font-weight="700" fill="#14243A" font-family="Outfit">'+fmt(p.v,pct)+'</text>';
  });
  const last=pts[pts.length-1];
  const endDot='<circle cx="'+X(last.i).toFixed(1)+'" cy="'+Y(last.v).toFixed(1)+'" r="4.8" fill="'+GOLD+'"/>';

  let refLine='';
  if(ref){
    const rp=ref.map((v,i)=>({v,i})).filter(p=>p.v!==null);
    if(rp.length>1){
      let rl='';rp.forEach((p,k)=>{rl+=(k?'L':'M')+X(p.i).toFixed(1)+' '+Y(p.v).toFixed(1)+' ';});
      refLine='<path d="'+rl+'" fill="none" stroke="'+NACIONAL+'" stroke-width="2.2" stroke-dasharray="5 4" stroke-linecap="round" stroke-linejoin="round"/>'+
        rp.map(p=>'<circle cx="'+X(p.i).toFixed(1)+'" cy="'+Y(p.v).toFixed(1)+'" r="3.4" fill="#fff" stroke="'+NACIONAL+'" stroke-width="2"/>').join('');
    }
  }

  const yrFontSz = w < 420 ? '10' : '11.5';
  let xl='';years.forEach((yr,i)=>{
    xl+='<text x="'+X(i).toFixed(1)+'" y="'+(h-10)+'" text-anchor="middle" font-size="'+yrFontSz+'" fill="#51637A" font-family="Outfit" font-weight="600">'+yr+'</text>';
  });

  return '<svg width="100%" height="100%" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none">'+
    '<defs><linearGradient id="ba" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+ACCENT+'" stop-opacity="0.15"/><stop offset="1" stop-color="'+ACCENT+'" stop-opacity="0"/></linearGradient></defs>'+
    grid+'<path d="'+area+'" fill="url(#ba)"/>'+refLine+
    '<path d="'+line+'" fill="none" stroke="'+ACCENT+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'+dots+endDot+xl+'</svg>';
}

/* ---- Gráfico de BARRAS ---- */
function buildBarSVG(ind, years, w, h){
  const vals=ind.values, pct=ind.pct;
  const pad={l:w<420?46:58, r:w<420?14:22, t:26, b:32};
  const pts=vals.map((v,i)=>({v,i})).filter(p=>p.v!==null);
  if(!pts.length) return '<div class="empty">Sin datos para graficar</div>';
  const mx0=Math.max(...pts.map(p=>p.v), 0);
  const mn=Math.min(0, ...pts.map(p=>p.v));
  const mx=mx0*1.12 || 1;
  const n=vals.length;
  const plotW=w-pad.l-pad.r, slot=plotW/n;
  const barW=Math.min(slot*0.55, 48);
  const cx=i=>pad.l+slot*i+slot/2;
  const {Y, grid}=chartFrame(w,h,mn,mx,pct,pad);
  const base=Y(mn);
  const lastI=pts[pts.length-1].i;

  const labelFontSz = w < 420 ? '9.5' : '11';
  let bars='';pts.forEach(p=>{
    const x=cx(p.i)-barW/2, y=Y(p.v), bh=Math.max(0, base-y);
    const col=p.i===lastI ? '#004A87' : ACCENT;
    bars+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+barW.toFixed(1)+'" height="'+bh.toFixed(1)+'" rx="3" fill="'+col+'"/>';
    bars+='<text x="'+cx(p.i).toFixed(1)+'" y="'+(y-6).toFixed(1)+'" text-anchor="middle" font-size="'+labelFontSz+'" font-weight="700" fill="#14243A" font-family="Outfit">'+fmt(p.v,pct)+'</text>';
  });

  const yrFontSz = w < 420 ? '10' : '11.5';
  let xl='';years.forEach((yr,i)=>{
    xl+='<text x="'+cx(i).toFixed(1)+'" y="'+(h-10)+'" text-anchor="middle" font-size="'+yrFontSz+'" fill="#51637A" font-family="Outfit" font-weight="600">'+yr+'</text>';
  });

  return '<svg width="100%" height="100%" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none">'+grid+bars+xl+'</svg>';
}

function closeModal(){
  const ov = document.getElementById('overlay');
  if(ov) ov.classList.remove('show');
  document.body.classList.remove('no-scroll');
}

/* ---------- Página INICIO ---------- */
function goToFactor(i){ curFactor=i; curInd=0; location.hash='/factores'; }

const ICO={
  identidad:'<path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6z"/><path d="M12 8v4M9.5 10.5 12 12l2.5-1.5"/>',
  gobierno:'<path d="M3 21h18M5 21V10M19 21V10M4 10l8-6 8 6M9 21v-6h6v6"/>',
  sostenible:'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 22c0-4 3-7 7-8"/>',
  calidad:'<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="m8.5 12 2.2 2.2L15.5 9.7"/>',
  academicos:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M19 3v16M8 7h7M8 11h7"/>',
  investigacion:'<path d="M9 3h6M10 3v6l-4.5 8A2 2 0 0 0 7.3 20h9.4a2 2 0 0 0 1.8-3L14 9V3"/><path d="M8.5 14h7"/>',
  extension:'<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/>',
  visibilidad:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
  bienestar:'<path d="M22 12h-4l-2.5 7-5-16L8 12H2"/>',
  profesores:'<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v5M8 21h8M8.5 8.5 11 11l4-4"/>',
  estudiantes:'<path d="M12 3 2 8l10 5 10-5-10-5z"/><path d="M6 10.5V15c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5M22 8v5"/>',
  egresados:'<circle cx="12" cy="8" r="5"/><path d="M8.5 12.2 7 22l5-3 5 3-1.5-9.8"/>',
  gochev:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  mstack:'<path d="M12 3 2 8.5 12 14l10-5.5L12 3Z"/><path d="m2 12.5 10 5.5 10-5.5"/>',
  mhist:'<path d="M4 4v16h16"/><rect x="7" y="11" width="2.6" height="6" rx=".6"/><rect x="11.7" y="8" width="2.6" height="9" rx=".6"/><rect x="16.4" y="12.5" width="2.6" height="4.5" rx=".6"/>',
  mcal:'<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M8.4 15.6l2.2-2.2 2 2 2.4-2.9"/>',
  dl:'<path d="M12 3v12M7 11l5 5 5-5M5 20h14"/>',
  sheet:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>',
  gochevdown:'<path d="m6 9 6 6 6-6"/>'
};

const FACTORES_INFO=[
  {n:1, ico:'identidad', color:'#0A4174', short:'Identidad institucional',
   desc:'Valora la coherencia entre la misión, el proyecto educativo y las decisiones de la Universidad, y cómo su naturaleza pública y su arraigo territorial se traducen en resultados e impactos verificables sobre las personas, el conocimiento y el territorio del Magdalena y el Caribe.'},
  {n:2, ico:'gobierno', color:'#1E6FB8', short:'Gobierno y transparencia',
   desc:'Evalúa la arquitectura de gobierno, participación e integridad institucional: estructuras de dirección, actualización de estatutos y políticas, rendición de cuentas y decisiones basadas en evidencia, en coherencia con su naturaleza de universidad estatal.'},
  {n:3, ico:'sostenible', color:'#0E8A6B', short:'Gestión y sostenibilidad',
   desc:'Da cuenta de las capacidades de gestión, transformación digital, infraestructura y sostenibilidad ambiental y financiera que soportan las funciones misionales. Incluye el crecimiento del presupuesto de ingresos, que pasó de 143.827 a 394.488 millones entre 2020 y 2025.'},
  {n:4, ico:'calidad', color:'#3E9E4E', short:'Aseguramiento de la calidad',
   desc:'Articula la cultura de autoevaluación y la mejora permanente con un Sistema Interno de Aseguramiento de la Calidad capaz de evidenciar resultados e impactos. Su madurez se refleja en la renovación de la acreditación institucional, que pasó de cuatro a seis años de vigencia.'},
  {n:5, ico:'academicos', color:'#8A9A1B', short:'Procesos académicos',
   desc:'Analiza la evolución de los procesos formativos, pedagógicos y de evaluación: actualización curricular, flexibilidad, innovación pedagógica, plurilingüismo y transformación digital, pasando de diseños y normas a resultados verificables en aprendizaje, permanencia y graduación.'},
  {n:6, ico:'investigacion', color:'#C98A12', short:'Investigación e innovación',
   desc:'Valora la capacidad de investigar, innovar, desarrollar tecnología y crear con pertinencia académica, territorial y social. Refleja el crecimiento de investigadores reconocidos por Minciencias, grupos categorizados, recursos externos y producción científica indexada.'},
  {n:7, ico:'extension', color:'#D9662C', short:'Extensión e impacto social',
   desc:'Examina las capacidades de extensión, proyección social y relacionamiento con el entorno: proyectos estratégicos, alianzas, regionalización de oportunidades y servicios que transforman las capacidades académicas en contribuciones al desarrollo social, económico, ambiental y cultural del territorio.'},
  {n:8, ico:'visibilidad', color:'#C64B5A', short:'Visibilidad e internacionalización',
   desc:'Da cuenta de la inserción de la Universidad en comunidades académicas, científicas y de cooperación nacionales e internacionales: convenios, redes, movilidad, reconocimientos y posicionamiento en rankings, fortaleciendo las funciones misionales sin perder su identidad territorial.'},
  {n:9, ico:'bienestar', color:'#B24A8E', short:'Bienestar institucional',
   desc:'Concibe el bienestar como un sistema institucional de cuidado orientado al desarrollo humano, la permanencia, la inclusión y la salud física y mental. Bajo el principio “La Gente es Primero”, evolucionó de una oferta de servicios a un sistema articulado con enfoque diferencial y preventivo.'},
  {n:10, ico:'profesores', color:'#7A54C0', short:'Comunidad de profesores',
   desc:'Reconoce al profesorado como eje de la calidad académica. Evalúa la selección, vinculación, formación y estímulos docentes, con avances como el nuevo Estatuto Profesoral, los concursos públicos de méritos, la cualificación doctoral y el crecimiento de la producción científica.'},
  {n:11, ico:'estudiantes', color:'#3F5AB0', short:'Comunidad de estudiantes',
   desc:'Ubica al estudiante como centro del proyecto educativo. Analiza el tránsito de una lógica de cobertura a un modelo integral de transformación educativa y social, con una matrícula que creció de 22.361 a 29.741 estudiantes entre 2020 y 2025 y avances en acceso, permanencia y graduación.'},
  {n:12, ico:'egresados', color:'#1596A6', short:'Comunidad de egresados',
   desc:'Reconoce a los egresados como expresión de los resultados del proyecto educativo. Evalúa el seguimiento y caracterización de sus trayectorias, los mecanismos de relacionamiento permanente y la formación a lo largo de la vida, apoyados en el Centro de Egresados y el Observatorio Laboral para la Educación.'}
];

function svgIco(name){
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(ICO[name]||'')+'</svg>';
}

function renderInicio(){
  const totalInd = DB.factors.reduce((s,f)=>s+f.indicators.length,0);
  const per = YEARS[0]+'–'+YEARS[YEARS.length-1];

  const tile=(stripe,ico,ibg,ic,label,num,desc)=>
    '<div class="ih-tile" style="--stripe:'+stripe+'">'+
      '<div class="ih-tile__top">'+
        '<span class="ih-tile__ico" style="--ibg:'+ibg+';--ic:'+ic+'">'+svgIco(ico)+'</span>'+
        '<span class="ih-tile__label">'+label+'</span>'+
      '</div>'+
      '<b class="ih-tile__num">'+num+'</b>'+
      '<span class="ih-tile__desc">'+desc+'</span>'+
    '</div>';

  document.getElementById('inicioContent').innerHTML=
    '<div class="ih-hero">'+
      '<span class="ih-pill">'+per+'</span>'+
      '<h1 class="ih-title">UNIMAGDALENA<br>EN CIFRAS</h1>'+
      '<div class="ih-sub">Indicadores por factor</div>'+
      '<p class="ih-desc">La evolución de la Universidad entre 2020 y 2025, contada con datos verificables: '+
      'el tránsito de una universidad de procesos a una <b>universidad de resultados e impactos</b>.</p>'+
      '<div class="ih-actions">'+
        '<button class="ih-btn ih-btn--primary" id="ihFactores">Explorar factores</button>'+
        '<button class="ih-btn ih-btn--ghost" id="ihMetodo">Ver metodología</button>'+
      '</div>'+
    '</div>'+
    '<div class="ih-tiles">'+
      tile('#0183EF','mstack','#E6F1FB','#185FA5','Factores',DB.factors.length,'Factores del modelo de acreditación')+
      tile('#A5CA00','mhist','#EAF3DE','#3B6D11','Indicadores',totalInd,'Indicadores con serie histórica')+
      tile('#FF9400','mcal','#FAEEDA','#854F0B','Periodo',YEARS.length+' años','Serie continua '+per)+
    '</div>';

  document.getElementById('ihFactores').onclick=()=>{ location.hash='/factores'; };
  document.getElementById('ihMetodo').onclick=()=>{ location.hash='/metodologia'; };
}

/* Modal grande de detalle del factor */
function openFactorPanel(i){
  const f=FACTORES_INFO[i];
  const full=DB.factors[i] ? DB.factors[i].factor : f.short;
  const cnt=DB.factors[i] ? DB.factors[i].indicators.length : 0;
  const det=DETALLE[f.n];
  const panel=document.getElementById('ptPanel');
  if(!panel) return;
  panel.style.setProperty('--fc', f.color);

  let carsHTML='';
  if(det && det.caracteristicas && det.caracteristicas.length){
    carsHTML='<div class="fdlg__section">Características de alta calidad</div>'+
      det.caracteristicas.map(c=>
        '<div class="fdlg__car">'+
          '<div class="fdlg__car-h"><span class="fdlg__car-n">'+c.n+'</span>'+
          '<h4>'+escHtml(c.titulo)+'</h4></div>'+
          (c.descripcion?'<p>'+escHtml(c.descripcion)+'</p>':'')+
          (c.aspectos&&c.aspectos.length?'<ul>'+c.aspectos.map(a=>'<li>'+escHtml(a)+'</li>').join('')+'</ul>':'')+
        '</div>').join('');
  }
  const intro = (det && det.definicion) ? escHtml(det.definicion) : f.desc;

  panel.innerHTML=
    '<div class="fdlg__head">'+
      '<span class="fdlg__ico">'+svgIco(f.ico)+'</span>'+
      '<div class="fdlg__titles"><span class="fdlg__eyebrow">Factor '+f.n+' · Acreditación institucional</span>'+
      '<h2>'+escHtml(f.short)+'</h2></div>'+
      '<button class="fdlg__close" aria-label="Cerrar" onclick="closeFactorPanel()">&times;</button>'+
    '</div>'+
    '<div class="fdlg__body">'+
      '<div class="fdlg__full">'+escHtml(full)+'</div>'+
      '<p class="fdlg__def">'+intro+'</p>'+
      carsHTML+
    '</div>'+
    '<div class="fdlg__foot">'+
      '<span class="fdlg__src">Fuente: CNA · Lineamientos de acreditación institucional en alta calidad</span>'+
      '<button class="fdlg__cta" data-i="'+i+'">'+(cnt===1?'Ver el indicador del factor':'Ver los '+cnt+' indicadores del factor')+' '+svgIco('gochev')+'</button>'+
    '</div>';
  panel.querySelector('.fdlg__cta').onclick=()=>goToFactor(i);
  panel.scrollTop=0;
  const body=panel.querySelector('.fdlg__body'); if(body) body.scrollTop=0;
  
  const ov = document.getElementById('ptOverlay');
  if(ov) ov.classList.add('show');
  panel.classList.add('show');
  panel.setAttribute('aria-hidden','false');
  document.body.classList.add('no-scroll');
}

function closeFactorPanel(){
  const p=document.getElementById('ptPanel'); if(!p) return;
  p.classList.remove('show'); p.setAttribute('aria-hidden','true');
  const o=document.getElementById('ptOverlay'); if(o) o.classList.remove('show');
  document.body.classList.remove('no-scroll');
}

/* ---------- Página METODOLOGÍA ---------- */
function renderMetodologia(){
  const cards=FACTORES_INFO.map((f,i)=>{
    const cnt=DB.factors[i] ? DB.factors[i].indicators.length : 0;
    return '<button class="pt-card" data-i="'+i+'" style="--fc:'+f.color+'">'+
      '<span class="pt-card__ico">'+svgIco(f.ico)+'</span>'+
      '<span class="pt-card__num">'+String(f.n).padStart(2,'0')+'</span>'+
      '<span class="pt-card__name">'+escHtml(f.short)+'</span>'+
      '<span class="pt-card__cnt">'+cnt+' indicador'+(cnt===1?'':'es')+'</span>'+
      '<span class="pt-card__go">'+svgIco('gochev')+'</span>'+
    '</button>';
  }).join('');

  document.getElementById('metodologiaContent').innerHTML=
    '<div class="doc doc--fill">'+
      '<div class="doc-hero">'+
        '<div class="eyebrow">Metodología</div>'+
        '<h1>Los 12 factores de acreditación</h1>'+
        '<p>Guía para explorar los indicadores institucionales de la Universidad del Magdalena, '+
        'organizados según el modelo de acreditación en alta calidad (Acuerdo CESU 01 de 2025). '+
        'Haz clic en un factor para leer su alcance y saltar a sus indicadores.</p>'+
      '</div>'+
      '<div class="pt-grid pt-grid--flow">'+cards+'</div>'+
    '</div>'+
    '<div class="pt-overlay" id="ptOverlay"></div>'+
    '<div class="fdlg" id="ptPanel" role="dialog" aria-modal="true" aria-hidden="true"></div>';

  document.querySelectorAll('#metodologiaContent .pt-card').forEach(c=>c.onclick=()=>openFactorPanel(+c.dataset.i));
  const ov = document.getElementById('ptOverlay');
  if(ov) ov.onclick=closeFactorPanel;
}

/* ---------- Página DATOS ---------- */
let datosQuery='';
let datosFactor=-1;

function renderDatos(){
  const rows=[];
  DB.factors.forEach((f,fi)=>f.indicators.forEach((ind,ii)=>rows.push({f, ind, fi, ii})));
  const total=rows.length;
  const q=datosQuery.toLowerCase();
  const filtered=rows.filter(r=>{
    if(datosFactor>=0 && r.fi!==datosFactor) return false;
    if(q && !(r.ind.name.toLowerCase().includes(q) || r.f.factor.toLowerCase().includes(q))) return false;
    return true;
  });

  const per=YEARS[0]+'–'+YEARS[YEARS.length-1];
  const sub = datosFactor>=0
    ? 'Factor '+DB.factors[datosFactor].n+' · '+DB.factors[datosFactor].indicators.length+' indicadores · '+per
    : DB.factors.length+' factores · '+total+' indicadores · '+per;

  const yh=YEARS.map((y,i)=>'<th class="dz-yr'+(i===YEARS.length-1?' dz-yr--last':'')+'">'+y+'</th>').join('');

  const body=filtered.map(r=>{
    const cells=r.ind.values.map((v,i)=>{
      const last=i===YEARS.length-1, cls='dz-yr'+(last?' dz-yr--last':'');
      return v===null ? '<td class="'+cls+' dz-na">—</td>' : '<td class="'+cls+'">'+fmt(v,r.ind.pct)+'</td>';
    }).join('');
    return '<tr>'+
      '<td class="dz-fac">'+String(r.f.n).padStart(2,'0')+'</td>'+
      '<td class="dz-name"><button class="dz-link" data-fi="'+r.fi+'" data-ii="'+r.ii+'" title="Ver en Factores">'+escHtml(r.ind.name)+'</button></td>'+
      cells+'</tr>';
  }).join('');

  document.getElementById('datosContent').innerHTML=
    '<div class="datos-head">'+
      '<div><div class="eyebrow">Datos</div>'+
      '<h2>Tabla completa de indicadores</h2>'+
      '<p>'+sub+'</p></div>'+
      '<div class="datos-dl">'+
        '<a class="btn-dl btn-dl--primary" href="data/datos_indicadores.json" download>'+svgIco('dl')+'JSON</a>'+
        '<button class="btn-dl" id="dlCsv" type="button">'+svgIco('sheet')+'CSV</button>'+
      '</div>'+
    '</div>'+
    '<div class="dz-controls">'+
      '<div class="search dz-search">'+
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>'+
        '<input id="datosQ" placeholder="Buscar indicador o factor…" value="'+escHtml(datosQuery)+'">'+
      '</div>'+
      '<span id="ddDatosLbl" class="sr-only">Filtrar por factor</span>'+
      '<div class="dd dz-dd" id="ddDatos"></div>'+
    '</div>'+
    '<div class="dz-table-wrap">'+
      '<table class="dz-tbl"><thead><tr>'+
        '<th class="dz-fac">Fac.</th><th class="dz-name">Indicador</th>'+yh+
      '</tr></thead>'+
      '<tbody>'+(body||'<tr><td colspan="'+(YEARS.length+2)+'" class="empty">Sin coincidencias.</td></tr>')+'</tbody></table>'+
    '</div>'+
    '<div class="dz-count">Mostrando '+filtered.length+' de '+total+'</div>';

  const inp=document.getElementById('datosQ');
  inp.oninput=e=>{ datosQuery=e.target.value; const pos=e.target.selectionStart; renderDatos();
    const nq=document.getElementById('datosQ'); if(nq){ nq.focus(); nq.setSelectionRange(pos,pos); } };
  
  const dd=makeDropdown(document.getElementById('ddDatos'),'ddDatosLbl', sel=>{ datosFactor=sel-1; renderDatos(); });
  dd.setItems(['Todos los factores'].concat(
    DB.factors.map(f=>String(f.n).padStart(2,'0')+' · '+f.factor)), datosFactor+1);
  
  document.getElementById('dlCsv').onclick=downloadCSV;
  document.querySelectorAll('#datosContent .dz-link').forEach(b=>b.onclick=()=>{
    curFactor=+b.dataset.fi; curInd=+b.dataset.ii; location.hash='/factores';
  });
}

function downloadCSV(){
  const head=['N Factor','Factor','Indicador',...YEARS].join(';');
  const lines=[head];
  DB.factors.forEach(f=>f.indicators.forEach(ind=>{
    const cells=[f.n, '"'+f.factor.replace(/"/g,'""')+'"', '"'+ind.name.replace(/"/g,'""')+'"',
      ...ind.values.map(v=>v===null?'':String(v).replace('.',','))];
    lines.push(cells.join(';'));
  }));
  const blob=new Blob(['﻿'+lines.join('\r\n')], {type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download='unimagdalena_indicadores_2020-2025.csv';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

/* ---------- Colapsar/expandir el sidebar (Escritorio) ---------- */
function setSidebarCollapsed(on){
  const layout = document.querySelector('.layout');
  if(layout) layout.classList.toggle('is-collapsed', on);
  const btn=document.getElementById('sbToggle');
  if(btn){
    btn.setAttribute('aria-label', on?'Expandir menú':'Contraer menú');
    btn.title = on?'Expandir menú':'Contraer menú';
  }
  try{ localStorage.setItem('sbCollapsed', on?'1':'0'); }catch(e){}
}

/* ---------- Eventos globales ---------- */
function wireEvents(){
  document.querySelectorAll('#pageNav .nav__item').forEach(b =>
    b.onclick = () => { location.hash = '/' + b.dataset.page; });
  window.addEventListener('hashchange', router);

  // Manejo del menú hamburguesa móvil
  const mbBtn = document.getElementById('mbMenuBtn');
  if(mbBtn) mbBtn.onclick = toggleMobileMenu;

  const sbOv = document.getElementById('sbOverlay');
  if(sbOv) sbOv.onclick = closeMobileMenu;

  // Sidebar colapsable en escritorio
  let collapsed=false;
  try{ collapsed = localStorage.getItem('sbCollapsed')==='1'; }catch(e){}
  setSidebarCollapsed(collapsed);
  
  const sbToggle = document.getElementById('sbToggle');
  if(sbToggle) sbToggle.onclick=()=>
    setSidebarCollapsed(!document.querySelector('.layout').classList.contains('is-collapsed'));
  
  const overlay = document.getElementById('overlay');
  if(overlay) overlay.onclick=e=>{ if(e.target.id==='overlay') closeModal(); };
  
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeModal(); closeFactorPanel(); closeMobileMenu(); } });

  // Dropdowns de la barra de filtros en Factores
  ddFactor = makeDropdown(document.getElementById('ddFactor'), 'ddFactorLbl', i=>{ curFactor=i; curInd=0; renderFactores(); });
  ddInd = makeDropdown(document.getElementById('ddInd'), 'ddIndLbl', i=>{ curInd=i; renderContent(); });
}

/* ---------- Merge de pares con serie Nacional ---------- */
function mergeNacional(){
  DB.factors.forEach(f=>{
    const byName={};
    f.indicators.forEach(ind=>{ byName[ind.name.trim()]=ind; });
    const keep=[];
    f.indicators.forEach(ind=>{
      const m=ind.name.match(/^(.+?)\s*\(Nacional\)\s*$/i);
      if(m){
        const base=byName[m[1].trim()];
        if(base){ base.values_ref=ind.values; base.dual=true; base.chart='linea'; return; }
      }
      keep.push(ind);
    });
    f.indicators=keep;
  });
}

/* ---------- Arranque ---------- */
async function init(){
  try{
    const res = await fetch('data/datos_indicadores.json', {cache:'no-cache'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    DB = await res.json();
  }catch(err){
    const contentEl = document.getElementById('content');
    if(contentEl){
      contentEl.innerHTML =
        '<div class="empty">No se pudo cargar <b>data/datos_indicadores.json</b>.<br>'+
        'Abre el proyecto desde un servidor local (ver README): <code>python -m http.server 8000</code></div>';
    }
    console.error(err);
    return;
  }
  YEARS = DB.years;
  mergeNacional();
  try{
    const rd = await fetch('data/factores_detalle.json', {cache:'no-cache'});
    if(rd.ok){ (await rd.json()).factores.forEach(f=>DETALLE[f.n]=f); }
  }catch(e){ /* detalle opcional */ }
  wireEvents();
  router();
}

document.addEventListener('DOMContentLoaded', init);

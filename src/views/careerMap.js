import { S, selectedCareerNode, setSelectedCareerNode } from '../core/state.js';
import { CAREER_STATUS_CFG } from '../core/constants.js';
import { getComputedStatus, openCareerSubDetail } from './career.js';

const CM = { NW:148, NH:44, HGAP:36, VGAP:12, HEADER:66, M:16 };
let _cmT = {x:0,y:0,s:0.72};

export function renderCareerMap() {
  const el = document.getElementById('career-map-container');
  if (!el) return;
  const subs = S.career.subjects;

  // Agrupar por columna: col = (year-1)*2 + (semester-1)
  const cols = {};
  for (let i = 0; i < 10; i++) cols[i] = [];
  subs.forEach(s => cols[(s.year-1)*2 + (s.semester-1)].push(s));

  const COL_W = CM.NW + CM.HGAP, ROW_H = CM.NH + CM.VGAP;
  const maxRows = Math.max(...Object.values(cols).map(c => c.length));
  const SVG_W = CM.M * 2 + 10 * COL_W;
  const SVG_H = CM.HEADER + maxRows * ROW_H + CM.M;

  // Posiciones de nodos
  const posMap = {};
  Object.entries(cols).forEach(([ci, colSubs]) => {
    colSubs.forEach((s, row) => {
      posMap[s.id] = { x: CM.M + parseInt(ci) * COL_W, y: CM.HEADER + row * ROW_H };
    });
  });

  // Marcadores SVG (flechas)
  const defs = `<defs>
    <marker id="cm-arr" markerWidth="7" markerHeight="7" refX="5.5" refY="2.5" orient="auto">
      <path d="M0,0 L0,5 L6,2.5 z" fill="rgba(255,255,255,0.2)"/>
    </marker>
    <marker id="cm-arr-in" markerWidth="7" markerHeight="7" refX="5.5" refY="2.5" orient="auto">
      <path d="M0,0 L0,5 L6,2.5 z" fill="#f87171"/>
    </marker>
    <marker id="cm-arr-out" markerWidth="7" markerHeight="7" refX="5.5" refY="2.5" orient="auto">
      <path d="M0,0 L0,5 L6,2.5 z" fill="#4ade80"/>
    </marker>
  </defs>`;

  // Cabeceras de columna
  const headers = Array.from({length:10}, (_,ci) => {
    if (!cols[ci].length) return '';
    const year = Math.floor(ci/2)+1, sem = (ci%2)+1;
    const cx = CM.M + ci * COL_W + CM.NW/2;
    return `
      <text x="${cx}" y="18" text-anchor="middle" fill="rgba(165,180,252,.85)"
        font-size="10" font-weight="700" font-family="Inter,sans-serif" letter-spacing=".06em">${year}° AÑO</text>
      <text x="${cx}" y="33" text-anchor="middle" fill="rgba(165,180,252,.45)"
        font-size="9" font-family="Inter,sans-serif">${sem}° sem</text>
      <line x1="${CM.M + ci*COL_W}" y1="42" x2="${CM.M + ci*COL_W + CM.NW}" y2="42"
        stroke="rgba(99,102,241,.2)" stroke-width="1"/>`;
  }).join('');

  // Aristas (inter-columna únicamente)
  const edgeSvg = subs.flatMap(tgt =>
    (tgt.correlatives.toCurse || []).map(srcId => {
      const sp = posMap[srcId], tp = posMap[tgt.id];
      if (!sp || !tp) return '';
      const srcSub = subs.find(x => x.id === srcId);
      if (!srcSub) return '';
      const srcCol = (srcSub.year-1)*2 + (srcSub.semester-1);
      const tgtCol = (tgt.year-1)*2  + (tgt.semester-1);
      if (srcCol === tgtCol) return ''; // omitir intra-columna
      const sx = sp.x + CM.NW, sy = sp.y + CM.NH/2;
      const tx = tp.x,          ty = tp.y + CM.NH/2;
      const mid = (tx - sx) * 0.42;
      return `<path class="cm-edge" data-src="${srcId}" data-tgt="${tgt.id}"
        d="M${sx},${sy} C${sx+mid},${sy},${tx-mid},${ty},${tx},${ty}"
        fill="none" stroke="rgba(255,255,255,.15)" stroke-width="1.5" marker-end="url(#cm-arr)"/>`;
    })
  ).join('');

  // Nodos
  const nodeSvg = subs.map(s => {
    const p = posMap[s.id]; if (!p) return '';
    const cs = getComputedStatus(s);
    const cfg = CAREER_STATUS_CFG[cs] || CAREER_STATUS_CFG.pendiente;
    const cx = p.x + CM.NW/2;
    const short = s.name.length > 19 ? s.name.slice(0,18)+'…' : s.name;
    return `
    <g class="cm-node" data-id="${s.id}" onclick="handleCareerNodeClick('${s.id}')" style="cursor:pointer;">
      <rect class="cm-node-rect" data-id="${s.id}"
        x="${p.x}" y="${p.y}" width="${CM.NW}" height="${CM.NH}" rx="6"
        fill="${cfg.bg}" stroke="${cfg.color}" stroke-width="1.5" stroke-opacity=".55"/>
      <text x="${cx}" y="${p.y+16}" text-anchor="middle" fill="${cfg.color}"
        font-size="10" font-weight="700" font-family="Inter,sans-serif" pointer-events="none">${short}</text>
      <text x="${cx}" y="${p.y+30}" text-anchor="middle" fill="${cfg.color}" opacity=".55"
        font-size="8.5" font-family="Inter,sans-serif" pointer-events="none">${cfg.label}</text>
      ${s.grade !== null ? `
        <rect x="${p.x+CM.NW-24}" y="${p.y+3}" width="21" height="14" rx="3"
          fill="${s.grade>=4?'rgba(74,222,128,.25)':'rgba(248,113,113,.25)'}"/>
        <text x="${p.x+CM.NW-13}" y="${p.y+14}" text-anchor="middle"
          fill="${s.grade>=4?'#4ade80':'#f87171'}"
          font-size="9.5" font-weight="800" font-family="Inter,sans-serif" pointer-events="none">${s.grade}</text>
      ` : ''}
    </g>`;
  }).join('');

  el.innerHTML = `
    <div class="cm-toolbar">
      <button class="btn btn-ghost btn-sm" onclick="cmZoom(.15)">＋</button>
      <button class="btn btn-ghost btn-sm" onclick="cmZoom(-.15)">－</button>
      <button class="btn btn-ghost btn-sm" onclick="cmReset()" title="Centrar la vista del mapa">Centrar Mapa</button>
      <span style="font-size:11px;color:var(--text2);margin-left:8px;">Arrastrá · Rueda · Click en materia</span>
    </div>
    <div class="cm-canvas" id="cm-canvas" style="cursor:grab;overflow:hidden;">
      <svg id="cm-svg" xmlns="http://www.w3.org/2000/svg"
           width="${SVG_W}" height="${SVG_H}"
           style="display:block;transform-origin:0 0;will-change:transform;">
        ${defs}
        <g id="cm-g">${edgeSvg}${headers}${nodeSvg}</g>
      </svg>
    </div>`;

  cmApplyTransform();
  setupCmPanZoom();
}

function cmApplyTransform() {
  const svg = document.getElementById('cm-svg');
  if (svg) svg.style.transform = `translate(${_cmT.x}px,${_cmT.y}px) scale(${_cmT.s})`;
}
function cmZoom(d) { _cmT.s = Math.max(.22, Math.min(2.5, _cmT.s+d)); cmApplyTransform(); }
function cmReset() { _cmT = {x:0,y:0,s:.72}; cmApplyTransform(); }

function setupCmPanZoom() {
  const canvas = document.getElementById('cm-canvas');
  if (!canvas) return;
  let drag=false, ox,oy,otx,oty;
  canvas.onmousedown = e => {
    if (e.target.closest('.cm-node')) return;
    drag=true; ox=e.clientX; oy=e.clientY; otx=_cmT.x; oty=_cmT.y;
    canvas.style.cursor='grabbing'; e.preventDefault();
  };
  const mm = e => { if(!drag) return; _cmT.x=otx+e.clientX-ox; _cmT.y=oty+e.clientY-oy; cmApplyTransform(); };
  const mu = () => { drag=false; const c=document.getElementById('cm-canvas'); if(c) c.style.cursor='grab'; };
  window.addEventListener('mousemove', mm);
  window.addEventListener('mouseup', mu);
  canvas.onwheel = e => { e.preventDefault(); cmZoom(e.deltaY>0?-.08:.08); };
}

function handleCareerNodeClick(id) {
  setSelectedCareerNode(id);
  const sub = S.career.subjects.find(x => x.id === id);
  if (!sub) return;
  const needed  = new Set(sub.correlatives.toCurse || []);
  const unlocks = new Set(S.career.subjects.filter(x => (x.correlatives.toCurse||[]).includes(id)).map(x=>x.id));

  document.querySelectorAll('.cm-edge').forEach(e => {
    const src = e.dataset.src, tgt = e.dataset.tgt;
    if      (tgt === id) { e.style.stroke='#f87171'; e.setAttribute('marker-end','url(#cm-arr-in)');  e.style.opacity='1'; }
    else if (src === id) { e.style.stroke='#4ade80'; e.setAttribute('marker-end','url(#cm-arr-out)'); e.style.opacity='1'; }
    else                 { e.style.stroke='rgba(255,255,255,.06)'; e.setAttribute('marker-end','url(#cm-arr)'); e.style.opacity='.4'; }
  });
  document.querySelectorAll('.cm-node-rect').forEach(r => {
    const nid = r.dataset.id;
    r.style.opacity = (nid===id || needed.has(nid) || unlocks.has(nid)) ? '1' : '0.28';
  });
  openCareerSubDetail(id);
}

function clearCmHighlight() {
  document.querySelectorAll('.cm-edge').forEach(e => {
    e.style.stroke='rgba(255,255,255,.15)'; e.style.opacity='1';
    e.setAttribute('marker-end','url(#cm-arr)');
  });
  document.querySelectorAll('.cm-node-rect').forEach(r => { r.style.opacity='1'; });
  setSelectedCareerNode(null);
}

window.cmZoom = cmZoom;
window.cmReset = cmReset;
window.handleCareerNodeClick = handleCareerNodeClick;

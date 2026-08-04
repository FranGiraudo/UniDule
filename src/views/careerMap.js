// Pure Career Map Renderer
// This file does not depend on the global state (S) or business logic.

const CM = { NW:148, NH:44, HGAP:36, VGAP:12, HEADER:66, M:16 };
let _cmT = {x:0,y:0,s:0.72};
let _subjects = [];
let _onNodeClick = null;

/**
 * Renderiza el mapa en un contenedor.
 * @param {string} containerId ID del contenedor DOM
 * @param {Array} subjects Lista de materias: { id, name, year, semester, layout_row (opcional), grade, cfg: { bg, color, label }, correlatives: { toCurse: [] } }
 * @param {Function} onNodeClick Callback al hacer click en un nodo
 */
export function renderCareerMap(containerId, subjects, onNodeClick) {
  const el = document.getElementById(containerId);
  if (!el) return;
  _subjects = subjects;
  _onNodeClick = onNodeClick;

  // 1. Asignar columna base
  subjects.forEach(s => {
    const sem = s.semester === 0 ? 1 : s.semester;
    s._col = (s.year-1)*2 + (sem-1);
  });

  // 2. Ordenar materias para procesarlas consistentemente
  subjects.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.semester !== b.semester) return a.semester - b.semester;
    const aRow = a.layout_row !== undefined && a.layout_row !== null ? a.layout_row : 999;
    const bRow = b.layout_row !== undefined && b.layout_row !== null ? b.layout_row : 999;
    return aRow - bRow;
  });

  // 3. Algoritmo de colisión en grilla (occupancy grid)
  const grid = {};
  const isOccupied = (c, r) => grid[c] && grid[c][r];
  const markOccupied = (c, r) => { if (!grid[c]) grid[c] = {}; grid[c][r] = true; };

  subjects.forEach(s => {
    let prefRow = s.layout_row !== undefined && s.layout_row !== null ? s.layout_row : 0;
    while (true) {
      let collision = isOccupied(s._col, prefRow);
      if (s.semester === 0 && isOccupied(s._col + 1, prefRow)) collision = true;
      if (!collision) {
        s.layout_row = prefRow;
        markOccupied(s._col, prefRow);
        if (s.semester === 0) markOccupied(s._col + 1, prefRow);
        break;
      }
      prefRow++;
    }
  });

  // 4. Reconstruir objeto cols para el resto del código
  const cols = {};
  for (let i = 0; i < 10; i++) cols[i] = [];
  subjects.forEach(s => {
    if (cols[s._col]) cols[s._col].push(s);
  });

  const COL_W = CM.NW + CM.HGAP, ROW_H = CM.NH + CM.VGAP;
  const maxRows = Math.max(...Object.values(cols).map(c => {
    return c.length > 0 ? Math.max(...c.map(s => s.layout_row)) + 1 : 0;
  }));
  const SVG_W = CM.M * 2 + 10 * COL_W;
  const SVG_H = CM.HEADER + maxRows * ROW_H + CM.M;

  // Posiciones de nodos
  const posMap = {};
  Object.entries(cols).forEach(([ci, colSubs]) => {
    colSubs.forEach(s => {
      posMap[s.id] = { x: CM.M + parseInt(ci) * COL_W, y: CM.HEADER + s.layout_row * ROW_H };
    });
  });

  // Marcadores SVG
  const defs = `<defs>
    <linearGradient id="glass-gradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
    <marker id="cm-arr" markerWidth="6" markerHeight="6" refX="3" refY="3">
      <circle cx="3" cy="3" r="2.5" fill="rgba(165,180,252,0.6)"/>
    </marker>
    <marker id="cm-arr-in" markerWidth="6" markerHeight="6" refX="3" refY="3">
      <circle cx="3" cy="3" r="2.5" fill="#f87171"/>
    </marker>
    <marker id="cm-arr-out" markerWidth="6" markerHeight="6" refX="3" refY="3">
      <circle cx="3" cy="3" r="2.5" fill="#4ade80"/>
    </marker>
  </defs>`;

  // Cabeceras
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

  // Aristas
  const edgeSvg = subjects.flatMap(tgt =>
    (tgt.correlatives.toCurse || []).map(srcId => {
      const sp = posMap[srcId], tp = posMap[tgt.id];
      if (!sp || !tp) return '';
      const srcSub = subjects.find(x => x.id === srcId);
      if (!srcSub) return '';
      const srcCol = (srcSub.year-1)*2 + ((srcSub.semester===0?1:srcSub.semester)-1);
      const tgtCol = (tgt.year-1)*2  + ((tgt.semester===0?1:tgt.semester)-1);
      if (srcCol === tgtCol) return '';
      const srcW = srcSub.semester === 0 ? CM.NW * 2 + CM.HGAP : CM.NW;
      const sx = sp.x + srcW, sy = sp.y + CM.NH/2;
      const tx = tp.x,          ty = tp.y + CM.NH/2;
      const mid = (tx - sx) * 0.42;
      return `<path class="cm-edge" data-src="${srcId}" data-tgt="${tgt.id}"
        d="M${sx},${sy} C${sx+mid},${sy},${tx-mid},${ty},${tx},${ty}"
        fill="none" stroke="rgba(165,180,252,.3)" stroke-width="2" stroke-linecap="round" marker-end="url(#cm-arr)"/>`;
    })
  ).join('');

  // Nodos
  const nodeSvg = subjects.map(s => {
    const p = posMap[s.id]; if (!p) return '';
    const cfg = s.cfg || { bg: '#333', color: '#fff', label: '' };
    const isAnual = s.semester === 0;
    const w = isAnual ? CM.NW * 2 + CM.HGAP : CM.NW;
    const cx = p.x + w/2;
    const short = s.name.length > (isAnual?40:19) ? s.name.slice(0,(isAnual?39:18))+'…' : s.name;
    const showGrade = s.grade !== null && s.grade !== undefined && !isNaN(parseFloat(s.grade)) && (s.status === 'aprobada' || s.status === 'aprobado' || s.status === 'promocionado');
    
    return `
    <g class="cm-node" data-id="${s.id}" onclick="_internalNodeClick('${s.id}')" style="cursor:pointer;">
      <rect class="cm-node-rect" data-id="${s.id}" filter="url(#node-shadow)"
        x="${p.x}" y="${p.y}" width="${w}" height="${CM.NH}" rx="8"
        fill="${cfg.bg}" stroke="${cfg.color}" stroke-width="1.2" stroke-opacity="0.9"/>
        
      <path d="M${p.x},${p.y+8} Q${p.x},${p.y} ${p.x+8},${p.y} L${p.x+w-8},${p.y} Q${p.x+w},${p.y} ${p.x+w},${p.y+8} L${p.x+w},${p.y+20} L${p.x},${p.y+20} Z" 
            fill="url(#glass-gradient)" opacity="0.08" pointer-events="none"/>
            
      <text x="${cx}" y="${p.y+18}" text-anchor="middle" fill="${cfg.color}"
        font-size="10.5" font-weight="700" font-family="Inter,sans-serif" letter-spacing="0.02em" pointer-events="none">${short}</text>
      
      <text x="${cx}" y="${p.y+31}" text-anchor="middle" fill="${cfg.color}" opacity="0.8"
        font-size="8" font-family="Inter,sans-serif" font-weight="600" letter-spacing="0.08em" text-transform="uppercase" pointer-events="none">${cfg.label}</text>
      
      ${showGrade ? `
        <rect x="${p.x+w-26}" y="${p.y+5}" width="21" height="14" rx="4"
          fill="${s.grade>=4?'rgba(74,222,128,.15)':'rgba(248,113,113,.15)'}" 
          stroke="${s.grade>=4?'rgba(74,222,128,.5)':'rgba(248,113,113,.5)'}" stroke-width="1"/>
        <text x="${p.x+w-15.5}" y="${p.y+15.5}" text-anchor="middle"
          fill="${s.grade>=4?'#4ade80':'#f87171'}"
          font-size="9" font-weight="800" font-family="Inter,sans-serif" pointer-events="none">${s.grade}</text>
      ` : ''}
    </g>`;
  }).join('');

  el.innerHTML = `
    <div class="cm-toolbar">
      <button class="btn btn-ghost btn-sm" onclick="_cmZoom(.15)">＋</button>
      <button class="btn btn-ghost btn-sm" onclick="_cmZoom(-.15)">－</button>
      <button class="btn btn-ghost btn-sm" onclick="_cmReset()" title="Centrar la vista del mapa">Centrar Mapa</button>
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
  canvas.ontouchstart = e => {
    if (e.target.closest('.cm-node') || e.touches.length !== 1) return;
    drag=true; ox=e.touches[0].clientX; oy=e.touches[0].clientY; otx=_cmT.x; oty=_cmT.y;
  };

  const mm = e => { if(!drag) return; _cmT.x=otx+e.clientX-ox; _cmT.y=oty+e.clientY-oy; cmApplyTransform(); };
  const tm = e => { 
    if(!drag || e.touches.length !== 1) return; 
    _cmT.x=otx+e.touches[0].clientX-ox; _cmT.y=oty+e.touches[0].clientY-oy; 
    cmApplyTransform(); 
    e.preventDefault(); 
  };
  
  const mu = () => { drag=false; const c=document.getElementById('cm-canvas'); if(c) c.style.cursor='grab'; };
  
  window.addEventListener('mousemove', mm);
  window.addEventListener('touchmove', tm, { passive: false });
  window.addEventListener('mouseup', mu);
  window.addEventListener('touchend', mu);
  canvas.onwheel = e => { e.preventDefault(); cmZoom(e.deltaY>0?-.08:.08); };
}

window._internalNodeClick = function(id) {
  if (_onNodeClick) _onNodeClick(id);
};
window._cmZoom = cmZoom;
window._cmReset = cmReset;

export function highlightCareerMapNodes(id, neededIds, unlockIds) {
  document.querySelectorAll('.cm-edge').forEach(e => {
    const src = e.dataset.src, tgt = e.dataset.tgt;
    if      (tgt === id) { e.style.stroke='#f87171'; e.setAttribute('marker-end','url(#cm-arr-in)');  e.style.opacity='1'; }
    else if (src === id) { e.style.stroke='#4ade80'; e.setAttribute('marker-end','url(#cm-arr-out)'); e.style.opacity='1'; }
    else                 { e.style.stroke='rgba(165,180,252,.1)'; e.setAttribute('marker-end','url(#cm-arr)'); e.style.opacity='.4'; }
  });
  document.querySelectorAll('.cm-node-rect').forEach(r => {
    const nid = r.dataset.id;
    r.style.opacity = (nid===id || neededIds.has(nid) || unlockIds.has(nid)) ? '1' : '0.28';
  });
}

export function clearCmHighlight() {
  document.querySelectorAll('.cm-edge').forEach(e => {
    e.style.stroke='rgba(165,180,252,.3)'; e.style.opacity='1';
    e.setAttribute('marker-end','url(#cm-arr)');
  });
  document.querySelectorAll('.cm-node-rect').forEach(r => { r.style.opacity='1'; });
}

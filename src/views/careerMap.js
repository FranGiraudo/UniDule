// Pure Career Map Renderer
// This file does not depend on the global state (S) or business logic.

const CM = { NW:156, NH:48, HGAP:32, VGAP:14, HEADER:72, M:16 };
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

  // Palette adaptada al tema activo
  const isPS1 = document.documentElement.style.getPropertyValue('--bg').trim() === '#D8D5CE'
             || document.documentElement.style.getPropertyValue('--primary').trim() === '#CC2929';

  const V = isPS1 ? {
    // ─── Keychron / PS1 ────────────────────────────────────────────
    bg:          '#D8D5CE',   // platino limpio PS1/Keychron
    nodeFill:    '#E2DFD8',   // tecla cream casi blanca → pendiente
    nodeFillBloq:'#9A9892',   // gris plata → bloqueada
    nodeFillDisp:'#E8A020',   // △ ámbar → disponible
    nodeFillC:   '#1A6FCC',   // × azul PS1 → cursando
    nodeFillR:   '#B0308C',   // □ magenta → regular
    nodeFillA:   '#CC2929',   // ● rojo ESC → aprobada
    nodeStroke:  '#A8A49C',
    nodeStrokeA: '#8B1A1A',
    textDark:    '#1A1208',
    textLight:   '#F5F0E8',
    textMuted:   '#5C4F3A',
    edge:        'rgba(80,60,40,.35)',
    edgeIn:      '#CC2929',
    edgeOut:     '#1A6FCC',
    header:      '#4A3F2F',
    headerSub:   '#7A6B52',
    divider:     'rgba(80,60,40,.3)',
    shadow:      'rgba(30,20,10,.22)',
    gradeGood:   '#1A6FCC',
    gradeBad:    '#CC2929',
  } : {
    // ─── IBM Model M sepia (resto de temas) ─────────────────────────
    bg:          '#EBE6D6',
    nodeFill:    '#D8D2BE',
    nodeFillBloq:'#6E6558',
    nodeFillDisp:'#B8973A',
    nodeFillC:   '#4A7C8D',
    nodeFillR:   '#8B4A7A',
    nodeFillA:   '#C0392B',
    nodeStroke:  '#A09070',
    nodeStrokeA: '#922B1F',
    textDark:    '#2C1810',
    textLight:   '#F5EFE0',
    textMuted:   '#7A6B52',
    edge:        'rgba(120,95,65,.28)',
    edgeIn:      '#C0392B',
    edgeOut:     '#4A7C59',
    header:      '#8B7355',
    headerSub:   '#A09070',
    divider:     'rgba(120,95,65,.25)',
    shadow:      'rgba(44,24,16,.18)',
    gradeGood:   '#4A7C59',
    gradeBad:    '#C0392B',
  };

  // Marcadores SVG
  const defs = `<defs>
    <style>@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&amp;display=swap');</style>
    <filter id="node-shadow" x="-15%" y="-15%" width="130%" height="140%">
      <feDropShadow dx="1" dy="3" stdDeviation="3" flood-color="${V.shadow}" flood-opacity="1"/>
    </filter>
    <filter id="canvas-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="multiply" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic" operator="in"/>
    </filter>
    <marker id="cm-arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polyline points="0,0 5,3.5 0,7" fill="none" stroke="${V.edge}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <marker id="cm-arr-in" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polyline points="0,0 5,3.5 0,7" fill="none" stroke="${V.edgeIn}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <marker id="cm-arr-out" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
      <polyline points="0,0 5,3.5 0,7" fill="none" stroke="${V.edgeOut}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <pattern id="scanlines" patternUnits="userSpaceOnUse" width="4" height="4">
      <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(44,24,16,.04)" stroke-width="1"/>
    </pattern>
  </defs>`;

  // Cabeceras vintage
  const headers = Array.from({length:10}, (_,ci) => {
    if (!cols[ci].length) return '';
    const year = Math.floor(ci/2)+1, sem = (ci%2)+1;
    const cx = CM.M + ci * COL_W + CM.NW/2;
    const colX = CM.M + ci*COL_W;
    return `
      <text x="${cx}" y="20" text-anchor="middle" fill="${V.header}"
        font-size="9.5" font-weight="700" font-family="'IBM Plex Mono',monospace" letter-spacing=".12em">${year}° AÑO</text>
      <text x="${cx}" y="36" text-anchor="middle" fill="${V.headerSub}"
        font-size="8.5" font-family="'IBM Plex Mono',monospace" letter-spacing=".08em">${sem}° SEM</text>
      <line x1="${colX + 4}" y1="46" x2="${colX + CM.NW - 4}" y2="46"
        stroke="${V.divider}" stroke-width="1" stroke-dasharray="3,3"/>`;
  }).join('');

  // Aristas vintage (sepia)
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
      const tx = tp.x,        ty = tp.y + CM.NH/2;
      const mid = (tx - sx) * 0.42;
      return `<path class="cm-edge" data-src="${srcId}" data-tgt="${tgt.id}"
        d="M${sx},${sy} C${sx+mid},${sy},${tx-mid},${ty},${tx},${ty}"
        fill="none" stroke="${V.edge}" stroke-width="1.5" stroke-linecap="round"
        stroke-dasharray="none" marker-end="url(#cm-arr)"/>`;
    })
  ).join('');

  // Nodos estilo vintage keycap
  const nodeSvg = subjects.map(s => {
    const p = posMap[s.id]; if (!p) return '';
    const isAnual = s.semester === 0;
    const w = isAnual ? CM.NW * 2 + CM.HGAP : CM.NW;
    const cx = p.x + w/2;
    const short = s.name.length > (isAnual?42:20) ? s.name.slice(0,(isAnual?41:19))+'…' : s.name;
    const showGrade = s.grade !== null && s.grade !== undefined && !isNaN(parseFloat(s.grade)) && s.status === 'aprobada';

    // Determinar colores según estado real
    let nodeFill, nodeStroke, textColor, statusLabel;
    const computedStatus = s.computedStatus || s.status || 'pendiente';
    switch(computedStatus) {
      case 'aprobada':   nodeFill = V.nodeFillA;    nodeStroke = V.nodeStrokeA;              textColor = V.textLight; statusLabel = 'APROBADA';  break;
      case 'regular':    nodeFill = V.nodeFillR;    nodeStroke = isPS1?'#7A1A60':'#6B4A70'; textColor = V.textLight; statusLabel = 'REGULAR';   break;
      case 'cursando':   nodeFill = V.nodeFillC;    nodeStroke = isPS1?'#0F4A8A':'#2A5060'; textColor = V.textLight; statusLabel = 'CURSANDO';  break;
      case 'bloqueada':  nodeFill = V.nodeFillBloq; nodeStroke = isPS1?'#4A4038':'#554842'; textColor = V.textLight; statusLabel = 'BLOQUEADA'; break;
      case 'disponible': nodeFill = V.nodeFill;     nodeStroke = V.nodeStroke;               textColor = V.textDark;  statusLabel = 'DISPONIBLE'; break;
      default:           nodeFill = V.nodeFill;     nodeStroke = V.nodeStroke;               textColor = V.textDark;  statusLabel = '';
    }

    // Keycap bevel: borde inferior más oscuro, superior más claro
    const bevelTop   = `rgba(255,255,255,0.35)`;
    const bevelBot   = `rgba(0,0,0,0.22)`;
    const innerX = p.x + 3, innerY = p.y + 3;
    const innerW = w - 6, innerH = CM.NH - 6;

    return `
    <g class="cm-node" data-id="${s.id}" onclick="_internalNodeClick('${s.id}')" style="cursor:pointer;">
      <!-- Sombra bevel inferior -->
      <rect x="${p.x + 1}" y="${p.y + 3}" width="${w}" height="${CM.NH}"
        rx="5" fill="${bevelBot}" pointer-events="none"/>
      <!-- Cuerpo principal -->
      <rect class="cm-node-rect" data-id="${s.id}" filter="url(#node-shadow)"
        x="${p.x}" y="${p.y}" width="${w}" height="${CM.NH}" rx="5"
        fill="${nodeFill}" stroke="${nodeStroke}" stroke-width="1.5"/>
      <!-- Borde superior bevel claro -->
      <line x1="${p.x + 5}" y1="${p.y + 1}" x2="${p.x + w - 5}" y2="${p.y + 1}"
        stroke="${bevelTop}" stroke-width="1" stroke-linecap="round" pointer-events="none"/>
      <!-- Borde izquierdo bevel claro -->
      <line x1="${p.x + 1}" y1="${p.y + 5}" x2="${p.x + 1}" y2="${p.y + CM.NH - 5}"
        stroke="${bevelTop}" stroke-width="1" stroke-linecap="round" pointer-events="none"/>
      <!-- Área interior (keycap legend area) -->
      <rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}"
        rx="3" fill="rgba(0,0,0,0.06)" pointer-events="none"/>
      <!-- Nombre materia -->
      <text x="${cx}" y="${p.y + 20}" text-anchor="middle" fill="${textColor}"
        font-size="10" font-weight="700" font-family="'IBM Plex Mono',monospace"
        letter-spacing="0.01em" pointer-events="none">${short}</text>
      <!-- Label estado -->
      ${statusLabel ? `<text x="${cx}" y="${p.y + 35}" text-anchor="middle" fill="${textColor}" opacity="0.65"
        font-size="7.5" font-family="'IBM Plex Mono',monospace" font-weight="600" letter-spacing="0.12em"
        pointer-events="none">${statusLabel}</text>` : ''}
      <!-- Nota -->
      ${showGrade ? `
        <rect x="${p.x + w - 24}" y="${p.y + 4}" width="19" height="13" rx="2"
          fill="${s.grade >= 4 ? 'rgba(74,124,89,.25)' : 'rgba(192,57,43,.25)'}" 
          stroke="${s.grade >= 4 ? V.gradeGood : V.gradeBad}" stroke-width="1.2"/>
        <text x="${p.x + w - 14.5}" y="${p.y + 14}" text-anchor="middle"
          fill="${s.grade >= 4 ? V.gradeGood : V.gradeBad}"
          font-size="8.5" font-weight="700" font-family="'IBM Plex Mono',monospace"
          pointer-events="none">${s.grade}</text>
      ` : ''}
    </g>`;
  }).join('');

  el.innerHTML = `
    <div class="cm-toolbar">
      <button class="btn btn-ghost btn-sm" onclick="_cmZoom(.15)">＋</button>
      <button class="btn btn-ghost btn-sm" onclick="_cmZoom(-.15)">－</button>
      <button class="btn btn-ghost btn-sm" onclick="_cmReset()" title="Centrar la vista del mapa">Centrar Mapa</button>
      <span style="font-size:11px;color:var(--text2);margin-left:8px;">Arrastrá · Rueda · Click en materia</span>
      <div class="cm-legend">
        <div class="cm-legend-item"><div class="cm-legend-dot" style="background:${V.nodeFill};border:1px solid ${V.nodeStroke};"></div>Disponible</div>
        <div class="cm-legend-item"><div class="cm-legend-dot" style="background:${V.nodeFillBloq};"></div>Bloqueada</div>
        <div class="cm-legend-item"><div class="cm-legend-dot" style="background:${V.nodeFillC};"></div>Cursando</div>
        <div class="cm-legend-item"><div class="cm-legend-dot" style="background:${V.nodeFillR};"></div>Regular</div>
        <div class="cm-legend-item"><div class="cm-legend-dot" style="background:${V.nodeFillA};"></div>Aprobada</div>
      </div>
    </div>
    <div class="cm-canvas" id="cm-canvas" style="cursor:grab;overflow:hidden;">
      <svg id="cm-svg" xmlns="http://www.w3.org/2000/svg"
           width="${SVG_W}" height="${SVG_H}"
           style="display:block;transform-origin:0 0;will-change:transform;">
        ${defs}
        <!-- Parchment background -->
        <rect width="${SVG_W}" height="${SVG_H}" fill="${V.bg}"/>
        <rect width="${SVG_W}" height="${SVG_H}" fill="url(#scanlines)" pointer-events="none"/>
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
  canvas.onwheel = e => { e.preventDefault(); cmZoom(e.deltaY>0?-.03:.03); };
}

window._internalNodeClick = function(id) {
  if (_onNodeClick) _onNodeClick(id);
};
window._cmZoom = cmZoom;
window._cmReset = cmReset;

export function highlightCareerMapNodes(id, neededIds, unlockIds) {
  document.querySelectorAll('.cm-edge').forEach(e => {
    const src = e.dataset.src, tgt = e.dataset.tgt;
    if      (tgt === id) { e.style.stroke='#C0392B'; e.setAttribute('marker-end','url(#cm-arr-in)');  e.style.opacity='1'; e.style.strokeWidth='2'; }
    else if (src === id) { e.style.stroke='#4A7C59'; e.setAttribute('marker-end','url(#cm-arr-out)'); e.style.opacity='1'; e.style.strokeWidth='2'; }
    else                 { e.style.stroke='rgba(120,95,65,.12)'; e.setAttribute('marker-end','url(#cm-arr)'); e.style.opacity='.3'; e.style.strokeWidth='1.5'; }
  });
  document.querySelectorAll('.cm-node-rect').forEach(r => {
    const nid = r.dataset.id;
    r.style.opacity = (nid===id || neededIds.has(nid) || unlockIds.has(nid)) ? '1' : '0.22';
  });
}

export function clearCmHighlight() {
  document.querySelectorAll('.cm-edge').forEach(e => {
    e.style.stroke='rgba(120,95,65,.28)'; e.style.opacity='1'; e.style.strokeWidth='1.5';
    e.setAttribute('marker-end','url(#cm-arr)');
  });
  document.querySelectorAll('.cm-node-rect').forEach(r => { r.style.opacity='1'; });
}

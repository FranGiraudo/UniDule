import { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from "../../store/useStore";
import type { Subject } from '../../types';

const CM = { NW: 156, NH: 48, HGAP: 32, VGAP: 14, HEADER: 72, M: 16 };
const COL_W = CM.NW + CM.HGAP;
const ROW_H = CM.NH + CM.VGAP;

interface NodePos {
  x: number;
  y: number;
  w: number;
}

export function MapTab({ onSelectSubject }: { onSelectSubject: (id: string) => void }) {
  const { career, theme } = useStore();
  const subjects = career?.subjects || [];
  
  const [transform, setTransform] = useState({ x: 0, y: 0, s: 0.72 });
  const [hoverId, setHoverId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // --- Pan and Zoom logic ---
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setTransform(t => ({ ...t, s: Math.max(0.22, Math.min(2.5, t.s + (e.deltaY > 0 ? -0.03 : 0.03))) }));
    };
    
    const svgEl = svgRef.current?.parentElement;
    if (svgEl) {
      svgEl.addEventListener('wheel', handleWheel, { passive: false });
      return () => svgEl.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest('.cm-node')) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startTx = transform.x;
    const startTy = transform.y;
    
    const handlePointerMove = (ev: PointerEvent) => {
      setTransform(t => ({ ...t, x: startTx + ev.clientX - startX, y: startTy + ev.clientY - startY }));
    };
    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // --- Layout logic ---
  const { posMap, cols, SVG_W, SVG_H } = useMemo(() => {
    const sList = [...subjects].map(s => {
      const sem = s.period === 0 ? 1 : (s.period || 1);
      return { ...s, _col: (s.year - 1) * 2 + (sem - 1) };
    });

    sList.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      if (a.period !== b.period) return (a.period || 0) - (b.period || 0);
      const aRow = a.layout_row ?? 999;
      const bRow = b.layout_row ?? 999;
      return aRow - bRow;
    });

    const grid: Record<number, Record<number, boolean>> = {};
    const isOccupied = (c: number, r: number) => grid[c] && grid[c][r];
    const markOccupied = (c: number, r: number) => { if (!grid[c]) grid[c] = {}; grid[c][r] = true; };

    sList.forEach(s => {
      let prefRow = s.layout_row ?? 0;
      while (true) {
        let collision = isOccupied(s._col, prefRow);
        if (s.period === 0 && isOccupied(s._col + 1, prefRow)) collision = true;
        if (!collision) {
          s.layout_row = prefRow;
          markOccupied(s._col, prefRow);
          if (s.period === 0) markOccupied(s._col + 1, prefRow);
          break;
        }
        prefRow++;
      }
    });

    const cols: Record<number, typeof sList> = {};
    for (let i = 0; i < 10; i++) cols[i] = [];
    sList.forEach(s => { if (cols[s._col]) cols[s._col].push(s); });

    const maxR = Math.max(...Object.values(cols).map(c => c.length > 0 ? Math.max(...c.map(s => s.layout_row)) + 1 : 0), 0);
    const sw = CM.M * 2 + 10 * COL_W;
    const sh = CM.HEADER + maxR * ROW_H + CM.M;

    const pm: Record<string, NodePos> = {};
    Object.entries(cols).forEach(([ci, colSubs]) => {
      colSubs.forEach(s => {
        const isAnual = s.period === 0;
        const w = isAnual ? CM.NW * 2 + CM.HGAP : CM.NW;
        pm[s.id] = { x: CM.M + parseInt(ci) * COL_W, y: CM.HEADER + s.layout_row * ROW_H, w };
      });
    });

    return { posMap: pm, cols, SVG_W: sw, SVG_H: sh };
  }, [subjects]);

  // --- Colors & Theme ---
  const isPS1 = theme === 'keychron_ps1';
  const V = isPS1 ? {
    bg: '#D8D5CE', nodeFill: '#E2DFD8', nodeFillBloq: '#9A9892', nodeFillDisp: '#E8A020',
    nodeFillC: '#1A6FCC', nodeFillR: '#B0308C', nodeFillA: '#CC2929',
    nodeStroke: '#A8A49C', nodeStrokeA: '#8B1A1A',
    textDark: '#1A1208', textLight: '#F5F0E8', textMuted: '#5C4F3A',
    edge: 'rgba(80,60,40,.35)', edgeIn: '#CC2929', edgeOut: '#1A6FCC',
    header: '#4A3F2F', headerSub: '#7A6B52', divider: 'rgba(80,60,40,.3)',
    shadow: 'rgba(30,20,10,.22)', gradeGood: '#1A6FCC', gradeBad: '#CC2929',
  } : {
    bg: '#EBE6D6', nodeFill: '#D8D2BE', nodeFillBloq: '#6E6558', nodeFillDisp: '#B8973A',
    nodeFillC: '#4A7C8D', nodeFillR: '#8B4A7A', nodeFillA: '#C0392B',
    nodeStroke: '#A09070', nodeStrokeA: '#922B1F',
    textDark: '#2C1810', textLight: '#F5EFE0', textMuted: '#7A6B52',
    edge: 'rgba(120,95,65,.28)', edgeIn: '#C0392B', edgeOut: '#4A7C59',
    header: '#8B7355', headerSub: '#A09070', divider: 'rgba(120,95,65,.25)',
    shadow: 'rgba(44,24,16,.18)', gradeGood: '#4A7C59', gradeBad: '#C0392B',
  };

  const getStatusStyle = (s: Subject) => {
    switch(s.status) {
      case 'aprobada': return { bg: V.nodeFillA, stroke: V.nodeStrokeA, text: V.textLight, label: 'APROBADA' };
      case 'regular': return { bg: V.nodeFillR, stroke: isPS1 ? '#7A1A60' : '#6B4A70', text: V.textLight, label: 'REGULAR' };
      case 'cursando': return { bg: V.nodeFillC, stroke: isPS1 ? '#0F4A8A' : '#2A5060', text: V.textLight, label: 'CURSANDO' };
      default: return { bg: V.nodeFill, stroke: V.nodeStroke, text: V.textDark, label: 'DISPONIBLE' };
    }
  };

  const neededByHover = useMemo(() => {
    if (!hoverId) return new Set<string>();
    const sub = subjects.find(s => s.id === hoverId);
    return new Set(sub?.correlatives || []);
  }, [hoverId, subjects]);

  const unlockedByHover = useMemo(() => {
    if (!hoverId) return new Set<string>();
    return new Set(subjects.filter(s => s.correlatives?.includes(hoverId)).map(s => s.id));
  }, [hoverId, subjects]);

  return (
    <div className="fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="cm-toolbar" style={{ display: 'flex', gap: '8px', padding: '12px', background: 'var(--card2)', borderBottom: '1px solid var(--border)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setTransform(t => ({ ...t, s: Math.min(2.5, t.s + 0.15) }))}>＋</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setTransform(t => ({ ...t, s: Math.max(0.22, t.s - 0.15) }))}>－</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setTransform({ x: 0, y: 0, s: 0.72 })}>Centrar Mapa</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: V.nodeFillDisp }}></div>Disponible</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: V.nodeFillC }}></div>Cursando</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: V.nodeFillR }}></div>Regular</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: V.nodeFillA }}></div>Aprobada</div>
        </div>
      </div>

      <div className="cm-canvas" style={{ flex: 1, overflow: 'hidden', cursor: 'grab' }} onPointerDown={handlePointerDown}>
        <svg 
          ref={svgRef}
          width={SVG_W} height={SVG_H}
          style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.s})`, transformOrigin: '0 0', willChange: 'transform' }}
        >
          <defs>
            <filter id="node-shadow" x="-15%" y="-15%" width="130%" height="140%">
              <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor={V.shadow} floodOpacity="1"/>
            </filter>
            <marker id="cm-arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <circle cx="3" cy="3" r="2.5" fill={V.edge} />
            </marker>
            <marker id="cm-arr-in" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <circle cx="3" cy="3" r="2.5" fill={V.edgeIn} />
            </marker>
            <marker id="cm-arr-out" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <circle cx="3" cy="3" r="2.5" fill={V.edgeOut} />
            </marker>
          </defs>

          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill={V.bg}/>

          <g>
            {/* EDGES */}
            {subjects.map(tgt => 
              (tgt.correlatives || []).map(srcId => {
                const sp = posMap[srcId];
                const tp = posMap[tgt.id];
                if (!sp || !tp) return null;
                const srcSub = subjects.find(x => x.id === srcId);
                if (!srcSub) return null;
                
                const sx = sp.x + sp.w;
                const sy = sp.y + CM.NH / 2;
                const tx = tp.x;
                const ty = tp.y + CM.NH / 2;
                const mid = (tx - sx) * 0.42;

                let stroke = V.edge;
                let marker = "url(#cm-arr)";
                let opacity = 1;
                let sw = 1.5;

                if (hoverId) {
                  if (tgt.id === hoverId) {
                    stroke = V.edgeIn; marker = "url(#cm-arr-in)"; opacity = 1; sw = 2;
                  } else if (srcId === hoverId) {
                    stroke = V.edgeOut; marker = "url(#cm-arr-out)"; opacity = 1; sw = 2;
                  } else {
                    opacity = 0.2;
                  }
                }

                return (
                  <path 
                    key={`${srcId}-${tgt.id}`}
                    d={`M${sx},${sy} C${sx+mid},${sy},${tx-mid},${ty},${tx},${ty}`}
                    fill="none" stroke={stroke} strokeWidth={sw} opacity={opacity}
                    markerEnd={marker}
                  />
                );
              })
            )}

            {/* HEADERS */}
            {Array.from({ length: 10 }).map((_, ci) => {
              if (!cols[ci] || !cols[ci].length) return null;
              const year = Math.floor(ci / 2) + 1;
              const sem = (ci % 2) + 1;
              const cx = CM.M + ci * COL_W + CM.NW / 2;
              const colX = CM.M + ci * COL_W;
              return (
                <g key={`header-${ci}`}>
                  <text x={cx} y={20} textAnchor="middle" fill={V.header} fontSize={9.5} fontWeight={700} fontFamily="'IBM Plex Mono',monospace">{year}° AÑO</text>
                  <text x={cx} y={36} textAnchor="middle" fill={V.headerSub} fontSize={8.5} fontFamily="'IBM Plex Mono',monospace">{sem}° SEM</text>
                  <line x1={colX + 4} y1={46} x2={colX + CM.NW - 4} y2={46} stroke={V.divider} strokeWidth={1} strokeDasharray="3,3" />
                </g>
              );
            })}

            {/* NODES */}
            {subjects.map(s => {
              const p = posMap[s.id];
              if (!p) return null;
              
              const cx = p.x + p.w / 2;
              const short = s.name.length > 20 ? s.name.slice(0, 19) + '…' : s.name;
              const st = getStatusStyle(s);

              let opacity = 1;
              if (hoverId && hoverId !== s.id && !neededByHover.has(s.id) && !unlockedByHover.has(s.id)) {
                opacity = 0.25;
              }

              return (
                <g 
                  key={s.id} 
                  className="cm-node" 
                  style={{ cursor: 'pointer', opacity }}
                  onMouseEnter={() => setHoverId(s.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => onSelectSubject(s.id)}
                >
                  <rect x={p.x + 1} y={p.y + 3} width={p.w} height={CM.NH} rx={5} fill="rgba(0,0,0,0.22)" pointerEvents="none" />
                  <rect filter="url(#node-shadow)" x={p.x} y={p.y} width={p.w} height={CM.NH} rx={5} fill={st.bg} stroke={st.stroke} strokeWidth={1.5} />
                  
                  <line x1={p.x + 5} y1={p.y + 1} x2={p.x + p.w - 5} y2={p.y + 1} stroke="rgba(255,255,255,0.35)" strokeWidth={1} strokeLinecap="round" pointerEvents="none" />
                  <line x1={p.x + 1} y1={p.y + 5} x2={p.x + 1} y2={p.y + CM.NH - 5} stroke="rgba(255,255,255,0.35)" strokeWidth={1} strokeLinecap="round" pointerEvents="none" />
                  
                  <rect x={p.x + 3} y={p.y + 3} width={p.w - 6} height={CM.NH - 6} rx={3} fill="rgba(0,0,0,0.06)" pointerEvents="none" />
                  
                  <text x={cx} y={p.y + 20} textAnchor="middle" fill={st.text} fontSize={10} fontWeight={700} fontFamily="'IBM Plex Mono',monospace" pointerEvents="none">{short}</text>
                  <text x={cx} y={p.y + 35} textAnchor="middle" fill={st.text} opacity={0.65} fontSize={7.5} fontWeight={600} fontFamily="'IBM Plex Mono',monospace" letterSpacing="0.12em" pointerEvents="none">{st.label}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

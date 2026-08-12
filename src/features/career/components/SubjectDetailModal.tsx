import { useState } from 'react';
import { useStore } from '../../../shared/store/useStore';
import { getComputedStatus, CAREER_STATUS_CFG } from '../lib/utils';
import { updateSubjectProgress } from '../lib/api';
import { X, Save } from 'lucide-react';

interface Props {
  subjectId: string;
  onClose: () => void;
}

export function SubjectDetailModal({ subjectId, onClose }: Props) {
  const { career } = useStore();

  // Find subject or elective
  const subject = career?.subjects?.find(
    (s) => s.id === subjectId || (s as any).code === subjectId,
  );
  const elective = career?.electives?.find((e) => e.id === subjectId || e.code === subjectId);

  const target = subject || elective;
  const isElective = !!elective;

  const initialStatus = target
    ? target.status ||
      (isElective
        ? target.status || 'pendiente'
        : getComputedStatus(target as any, career?.subjects || []))
    : 'pendiente';

  const [status, setStatus] = useState<string>(initialStatus);
  const [grade, setGrade] = useState<string>(target?.grade != null ? target.grade.toString() : '');
  const [regDate, setRegDate] = useState<string>(target?.regDate || '');
  const [expDate, setExpDate] = useState<string>(target?.expDate || '');
  const [loading, setLoading] = useState(false);

  const autoUpdateExpDate = (dateVal: string) => {
    if (!dateVal) return;
    const d = new Date(dateVal + 'T00:00:00');
    d.setMonth(d.getMonth() + 18);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setExpDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleRegDateChange = (val: string) => {
    setRegDate(val);
    autoUpdateExpDate(val);
  };

  const handleSave = async () => {
    if (!target) return;
    setLoading(true);
    try {
      let finalGrade = null;
      let finalReg = null;
      let finalExp = null;

      if (status === 'aprobada') {
        const gv = parseFloat(grade);
        finalGrade = isNaN(gv) ? null : Math.min(10, Math.max(0, gv));
      }

      if (status === 'regular' || status === 'aprobada') {
        finalReg = regDate;
        finalExp = expDate;
        if (status === 'regular' && !finalReg) {
          const now = new Date();
          finalReg = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const expObj = new Date(now.getFullYear() + 1, now.getMonth() + 6, now.getDate());
          finalExp = `${expObj.getFullYear()}-${String(expObj.getMonth() + 1).padStart(2, '0')}-${String(expObj.getDate()).padStart(2, '0')}`;
        }
      }

      await updateSubjectProgress(
        target.id,
        isElective ? 'elective' : 'subject',
        status,
        finalGrade,
        finalReg,
        finalExp,
      );
      onClose();
    } catch (e) {
      console.error(e);
      alert('Error al guardar cambios');
    } finally {
      setLoading(false);
    }
  };

  if (!target) return null;

  const cfg =
    CAREER_STATUS_CFG[status as keyof typeof CAREER_STATUS_CFG] || CAREER_STATUS_CFG.pendiente;
  const credits = isElective ? elective.credits : subject?.credits || 0;
  const yearStr = isElective
    ? `Área: ${elective.category}`
    : `${subject?.year}° Año · ${subject?.period === 0 ? 'Anual' : subject?.period + '° Semestre'}`;

  // Correlatives logic
  const renderCorrItem = (depId: string) => {
    const dep = career?.subjects?.find((s) => s.id === depId);
    if (!dep) return null;
    const dcs = getComputedStatus(dep, career?.subjects || []);
    const dc =
      CAREER_STATUS_CFG[dcs as keyof typeof CAREER_STATUS_CFG] || CAREER_STATUS_CFG.pendiente;
    return (
      <div
        key={dep.id}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            background: dc.bg,
            color: dc.color,
            border: `1px solid ${dc.border}`,
          }}
        >
          {dc.label}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text)' }}>{dep.name}</span>
      </div>
    );
  };

  const toCurse = !isElective ? subject?.correlatives || [] : [];
  const unlocks = !isElective
    ? career?.subjects?.filter((s) => (s.correlatives || []).includes(subject!.id)) || []
    : [];

  return (
    <div className="modal-bd" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-box modal-sm fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '90%' }}
      >
        <div className="m-header">
          <div>
            <div className="modal-title" style={{ fontSize: '1.15rem' }}>
              {target.name}
            </div>
            <div className="modal-subtitle" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
              {yearStr} · {credits || 0} créditos
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="m-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ alignSelf: 'flex-start' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
              }}
            >
              {cfg.label}
            </span>
          </div>

          <div>
            <label className="f-label">Estado Académico</label>
            <select className="f-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pendiente">Pendiente (Bloqueada/Disponible)</option>
              <option value="cursando">Cursando</option>
              <option value="regular">Regular</option>
              <option value="aprobada">Aprobada / Promocionada</option>
            </select>
          </div>

          {status === 'aprobada' && (
            <div className="fade-in">
              <label className="f-label">Nota final (0 – 10)</label>
              <input
                type="number"
                className="f-input"
                min="0"
                max="10"
                step="0.5"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Ej: 8"
                style={{ fontSize: '20px', fontWeight: 800, textAlign: 'center' }}
              />
            </div>
          )}

          {(status === 'regular' || status === 'aprobada') && (
            <div
              className="fade-in"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
            >
              <div>
                <label className="f-label">Regularidad</label>
                <input
                  type="date"
                  className="f-input"
                  value={regDate}
                  onChange={(e) => handleRegDateChange(e.target.value)}
                />
              </div>
              <div>
                <label className="f-label">Vencimiento</label>
                <input
                  type="date"
                  className="f-input"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {!isElective && (
            <>
              <div
                style={{
                  marginTop: '4px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border)',
                }}
              >
                <div className="f-label" style={{ marginBottom: '8px' }}>
                  Para cursar (necesitás regular)
                </div>
                {toCurse.length > 0 ? (
                  toCurse.map((depId) => renderCorrItem(depId))
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>Sin correlativas</div>
                )}
              </div>

              <div>
                <div className="f-label" style={{ marginBottom: '8px' }}>
                  Desbloquea (al regularizar)
                </div>
                {unlocks.length > 0 ? (
                  unlocks.map((dep) => renderCorrItem(dep.id))
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--text2)' }}>—</div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="m-footer">
          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              'Guardando...'
            ) : (
              <>
                <Save size={16} /> Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

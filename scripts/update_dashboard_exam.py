import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Icons import
    content = content.replace(
        "import { Book, CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react';",
        "import { Book, CheckCircle2, Clock, AlertTriangle, Circle, GraduationCap } from 'lucide-react';"
    )

    # 2. Logic for next exam
    exam_logic = """
  // Next Exam Logic (MEJ-017)
  const nextExams = tasks
    .filter(t => !t.done && t.dueDate && (t.type.toLowerCase().includes('parcial') || t.type.toLowerCase().includes('final') || t.type.toLowerCase().includes('examen')))
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1));
  const nextExam = nextExams.length > 0 ? nextExams[0] : null;

  const [examSecs, setExamSecs] = useState<number | null>(null);
  
  useEffect(() => {
    if (!nextExam || !nextExam.dueDate) return;
    const updateCountdown = () => {
      const examDate = new Date(nextExam.dueDate + 'T00:00:00');
      const diff = Math.floor((examDate.getTime() - Date.now()) / 1000);
      setExamSecs(diff > 0 ? diff : 0);
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [nextExam]);

  const pad = (n: number) => String(n).padStart(2, '0');
"""
    # Insert before getNextClass()
    content = content.replace("  const getNextClass = () => {", exam_logic + "\n  const getNextClass = () => {")

    # 3. Remove the old `pad` definition since we moved it up
    content = content.replace("  const pad = (n: number) => String(n).padStart(2, '0');\n", "")

    # 4. Insert the UI banner
    banner_ui = """
        {/* EXAM COUNTDOWN BANNER (MEJ-017) */}
        {nextExam && examSecs !== null && examSecs > 0 && examSecs <= 30 * 86400 && (
          <div className="fade-in" style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
            borderRadius: '16px',
            padding: '20px 24px',
            color: 'white',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(239,68,68,0.25)',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GraduationCap size={14} /> Próximo {nextExam.type}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                {nextExam.title}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px', fontWeight: 600 }}>
                 {subjects.find(s => s.id === nextExam.subjectId)?.name || 'Materia'}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px 4px', borderRadius: '12px', minWidth: '64px' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>{Math.floor(examSecs / 86400)}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', marginTop: '2px' }}>Días</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px 4px', borderRadius: '12px', minWidth: '64px' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>{pad(Math.floor((examSecs % 86400) / 3600))}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', marginTop: '2px' }}>Hrs</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px 4px', borderRadius: '12px', minWidth: '64px' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, lineHeight: 1 }}>{pad(Math.floor((examSecs % 3600) / 60))}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', marginTop: '2px' }}>Min</span>
              </div>
            </div>
          </div>
        )}

        {/* Próxima Clase */}
"""
    content = content.replace("        {/* Próxima Clase */}", banner_ui)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_file('/home/frangiraudo/Proyectos/UniDule/src/pages/Dashboard.tsx')

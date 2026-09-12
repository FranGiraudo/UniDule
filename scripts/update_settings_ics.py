import re

with open('src/pages/Settings.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add Calendar to lucide imports if not there
if "Calendar" not in text:
    text = text.replace("import { BookOpen,", "import { Calendar, BookOpen,")

ics_logic = """
  const handleExportICS = () => {
    let ics = "BEGIN:VCALENDAR\\nVERSION:2.0\\nPRODID:-//UniDule//ES\\n";
    
    const getNextDate = (dayOfWeek: number) => {
      const d = new Date();
      d.setDate(d.getDate() + ((dayOfWeek - d.getDay() + 7) % 7));
      return d;
    };
    
    const formatICSDate = (date: Date | string, timeStr: string) => {
      const [h, m] = timeStr.split(':');
      const d = new Date(date);
      d.setHours(Number(h), Number(m), 0);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const dayMap: Record<string, number> = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 0 };
    const rruleDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

    subjects.forEach(sub => {
      sub.schedules?.forEach(sc => {
        const jsDay = dayMap[sc.day as string];
        if (jsDay === undefined) return;
        const nextDate = getNextDate(jsDay);
        
        ics += "BEGIN:VEVENT\\n";
        ics += `UID:${sc.id}@unidule.com\\n`;
        ics += `SUMMARY:${sub.name}\\n`;
        ics += `DESCRIPTION:${sc.type}\\\\nRoom: ${sub.room || ''}\\n`;
        ics += `DTSTART:${formatICSDate(nextDate, sc.startTime)}\\n`;
        ics += `DTEND:${formatICSDate(nextDate, sc.endTime)}\\n`;
        ics += `RRULE:FREQ=WEEKLY;BYDAY=${rruleDays[jsDay]}\\n`;
        ics += "END:VEVENT\\n";
      });
    });

    userEvents.forEach(e => {
      ics += "BEGIN:VEVENT\\n";
      ics += `UID:${e.id}@unidule.com\\n`;
      ics += `SUMMARY:${e.title}\\n`;
      
      if (e.isRecurring && e.dayOfWeek) {
         const jsDay = e.dayOfWeek === 7 ? 0 : e.dayOfWeek;
         const nextDate = getNextDate(jsDay);
         ics += `DTSTART:${formatICSDate(nextDate, e.startTime)}\\n`;
         ics += `DTEND:${formatICSDate(nextDate, e.endTime)}\\n`;
         ics += `RRULE:FREQ=WEEKLY;BYDAY=${rruleDays[jsDay]}\\n`;
      } else if (e.date) {
         // Create local date but interpret as local time
         const parts = e.date.split('-');
         const d = new Date(Number(parts[0]), Number(parts[1])-1, Number(parts[2]));
         ics += `DTSTART:${formatICSDate(d, e.startTime)}\\n`;
         ics += `DTEND:${formatICSDate(d, e.endTime)}\\n`;
      }
      ics += "END:VEVENT\\n";
    });

    ics += "END:VCALENDAR";

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'unidule-horarios.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo .ics generado con éxito. Ábrelo en Google Calendar para importar tus horarios.');
  };
"""
text = text.replace("  const handleExportData = () => {", ics_logic + "\n  const handleExportData = () => {")

ics_ui = """
        {/* CALENDARIO E ICS */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h3
            style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Calendar size={20} style={{ color: 'var(--primary)' }} /> Sincronización de Calendario
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1rem' }}>
            Exporta tus horarios de cursada y eventos diarios para verlos en Google Calendar, Apple Calendar o Outlook.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleExportICS}>
              Descargar Archivo .ics
            </button>
          </div>
        </div>
"""

# Insert before COMPARTIR
text = text.replace("{/* COMPARTIR */}", ics_ui + "\n        {/* COMPARTIR */}")

with open('src/pages/Settings.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

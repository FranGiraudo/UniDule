import type { Subject, Task, UserEvent } from '../types';

export function exportICS(subjects: Subject[], tasks: Task[], userEvents: UserEvent[]) {
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UniDule//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n') + '\r\n';

  const formatICSDate = (dateStr: string, timeStr: string) => {
    // dateStr: YYYY-MM-DD, timeStr: HH:MM
    const [y, m, d] = dateStr.split('-');
    const [hh, mm] = timeStr.split(':');
    return `${y}${m}${d}T${hh}${mm}00`; // Local time, assuming floating time is okay for university schedules
  };

  const getDayInitial = (dayName: string) => {
    const map: Record<string, string> = {
      'Lunes': 'MO', 'Martes': 'TU', 'Miércoles': 'WE', 'Jueves': 'TH',
      'Viernes': 'FR', 'Sábado': 'SA', 'Domingo': 'SU'
    };
    return map[dayName] || 'MO';
  };

  // 1. Recurring Classes
  const semesterStart = new Date().toISOString().split('T')[0]; // Simplify: start from today
  const semesterEnd = new Date();
  semesterEnd.setMonth(semesterEnd.getMonth() + 4);
  const endStr = semesterEnd.toISOString().split('T')[0].replace(/-/g, '') + 'T000000Z';

  subjects.filter(s => s.status === 'cursando').forEach(sub => {
    sub.schedules?.forEach(sc => {
      ics += [
        'BEGIN:VEVENT',
        `UID:class-${sub.id}-${sc.id}@unidule`,
        `SUMMARY:${sub.name} (${sc.type})`,
        `LOCATION:${sub.room || ''}`,
        `DTSTART:${formatICSDate(semesterStart, sc.startTime)}`,
        `DTEND:${formatICSDate(semesterStart, sc.endTime)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${getDayInitial(String(sc.day))};UNTIL=${endStr}`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    });
  });

  // 2. Exams (Tasks)
  tasks.forEach(t => {
    if ((t.type.toLowerCase().includes('parcial') || t.type.toLowerCase().includes('final')) && t.dueDate && t.startTime && t.endTime) {
      const sub = subjects.find(s => s.id === t.subjectId);
      ics += [
        'BEGIN:VEVENT',
        `UID:exam-${t.id}@unidule`,
        `SUMMARY:${t.title} - ${sub?.name || 'Examen'}`,
        `DTSTART:${formatICSDate(t.dueDate, t.startTime)}`,
        `DTEND:${formatICSDate(t.dueDate, t.endTime)}`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    }
  });

  // 3. One-off Events
  userEvents.forEach(e => {
    if (e.date && e.startTime && e.endTime && !e.isRecurring) {
      ics += [
        'BEGIN:VEVENT',
        `UID:event-${e.id}@unidule`,
        `SUMMARY:${e.title}`,
        `DTSTART:${formatICSDate(e.date, e.startTime)}`,
        `DTEND:${formatICSDate(e.date, e.endTime)}`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    } else if (e.isRecurring && e.startTime && e.endTime) {
      const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const jsDay = e.dayOfWeek === 7 || e.dayOfWeek == null ? 0 : e.dayOfWeek;
      ics += [
        'BEGIN:VEVENT',
        `UID:event-${e.id}@unidule`,
        `SUMMARY:${e.title}`,
        `DTSTART:${formatICSDate(semesterStart, e.startTime)}`,
        `DTEND:${formatICSDate(semesterStart, e.endTime)}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${days[jsDay]};UNTIL=${endStr}`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    }
  });

  ics += 'END:VCALENDAR';

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'UniDule_Horarios.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

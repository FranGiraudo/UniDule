const fs = require('fs');
let content = fs.readFileSync('.antigravity_context.md', 'utf8');

content = content.replace(
  "- Implementar envío de notificaciones y recordatorios.",
  "- [x] Implementar envío de notificaciones y recordatorios (Clases a 15 mins)."
);

content = content.replace(
  "- Crear una sección de \"Estadísticas\" (Stats) para ver cuántas horas se estudió, cuántas veces se cumplieron actividades extra (ej. gym) en la semana, e integrarlo a futuro con el sueño.",
  "- [x] Crear una sección de \"Estadísticas\" (Stats) para ver cuántas horas se estudió, cuántas veces se cumplieron actividades extra (ej. gym) en la semana.\n- [ ] Integrar estadísticas con un tracker de sueño a futuro."
);

content = content.replace(
  "- Permitir marcar actividades y rutinas como \"completadas\" para sumar a las estadísticas. Estas marcas deberían reiniciarse al terminar el día o la semana según corresponda.",
  "- [x] Permitir marcar actividades y rutinas como \"completadas\" para sumar a las estadísticas."
);

fs.writeFileSync('.antigravity_context.md', content);

# UniDule

Gestor académico personal y planificador de carrera universitaria para estudiantes.

**Demo en producción:** [unidule.vercel.app](https://unidule.vercel.app)

---

## Descripción

UniDule centraliza la organización de la vida universitaria en una sola interfaz: control de cursadas, cálculo de correlatividades, seguimiento de regularidades, agenda semanal con fechas reales, matriz de tareas y temporizador de estudio con ambientación sonora.

Está construida con React 19 y TypeScript sobre Vite, utilizando Zustand para el manejo de estado en memoria y Supabase como backend relacional con políticas de seguridad a nivel de fila (Row Level Security).

---

## Funcionalidades

### Carrera y Correlatividades
- **Árbol de correlativas:** Determina automáticamente si una materia está disponible para cursar, disponible para final, regularizada, aprobada o bloqueada según tu historial.
- **Simulador de avance:** Permite probar escenarios de aprobación con resolución de equivalencias dinámicas para planificar inscripciones a próximos semestres.
- **Electivas y seminarios:** Seguimiento de créditos acumulados y cursos extracurriculares requeridos por el plan de estudio.

### Materias y Cursada
- **Control de inasistencias:** Configuración de faltas máximas toleradas y cálculo de margen restante para evitar pérdidas de regularidad.
- **Evaluaciones y promedio ponderado:** Carga de notas de parciales y trabajos prácticos con pesos porcentuales configurables.
- **Apuntes integrados:** Cuaderno de notas por materia con formato Markdown.

### Finales y Regularidades
- **Panel de finales pendientes:** Vista centralizada de materias con cursada regularizada.
- **Alerta de vencimiento:** Advertencia preventiva cuando una regularidad está a menos de 90 días de caducar.
- **Mesas de examen:** Registro de turnos de examen e intentos consumidos.

### Horarios y Calendario
- **Vista semanal y mensual:** Grilla horaria con fechas reales navegable por semana y mes.
- **Eventos extracurriculares:** Soporte para actividades no académicas (trabajo, gimnasio, estudio) con etiquetas y recurrencia semanal.
- **Exportación iCalendar (.ics):** Descarga de calendarios compatibles con Google Calendar, Apple Calendar y Outlook para sincronización en móvil y escritorio.

### Modo Estudio (Pomodoro)
- **Temporizador adaptable:** Intervalos personalizables (25/5, 50/10 o libre) y modo a pantalla completa sin distracciones.
- **Generador de audio ambiente:** Síntesis procedural de ruido blanco y lluvia utilizando Web Audio API nativo (sin archivos pesados ni consumo de datos).
- **Asociación a exámenes:** Registro de horas de estudio vinculadas directamente a la preparación de un parcial o final.
- **Checklist de temas:** Lista de conceptos para tachar durante cada sesión.

### Tareas y Matriz de Eisenhower
- **Priorización en 4 cuadrantes:** Clasificación de pendientes según urgencia e importancia.
- **Sincronización:** Vinculación directa con fechas de entrega y exámenes cargados en las materias.

---

## Stack Tecnológico

- **Frontend:** React 19, TypeScript, React Router v7, Vite
- **Estado Global:** Zustand
- **Backend & Auth:** Supabase (PostgreSQL, Auth con JWT, Row Level Security)
- **Audio:** Web Audio API (generación sintética)
- **Iconos:** Lucide React
- **Estilos:** CSS variables nativo (sistema multitema con modo oscuro, claro y variantes de contraste)
- **Testing:** Vitest, React Testing Library
- **Despliegue:** Vercel

---

## Estructura del Proyecto

```text
src/
├── features/               # Módulos de dominio
│   ├── career/             # Mapa curricular, correlatividades y simulación
│   ├── events/             # Gestión de actividades extracurriculares
│   ├── subjects/           # Materias activas, notas, faltas y notas
│   └── tasks/              # Tareas y matriz de Eisenhower
├── pages/                  # Vistas principales (Dashboard, Schedule, Study, etc.)
├── shared/                 # Componentes y lógica transversal
│   ├── components/         # Layouts, modales y diálogos globales
│   ├── context/            # AuthProvider y ThemeProvider
│   ├── hooks/              # useDataSync (sincronización con Supabase)
│   ├── lib/                # Utilidades, audioGenerator, exportación ICS, temas
│   ├── store/              # Stores Zustand (useStore, useDialogs)
│   └── types/              # Definiciones TypeScript
└── test/                   # Configuración y utilidades de testing
```

---

## Instalación Local

### Requisitos previos
- Node.js 18+
- npm o pnpm

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/FranGiraudo/UniDule.git
   cd UniDule
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env.local
   ```
   Y completa las variables con tu proyecto de Supabase:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

4. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación quedará disponible en `http://localhost:5173`.

---

## Comandos Útiles

```bash
npm run dev           # Servidor local de desarrollo
npm run build         # Verificación de tipos con tsc y build para producción
npm run preview       # Previsualizar build de producción localmente
npm run test:run      # Ejecución de tests con Vitest
npm run test:coverage # Reporte de cobertura de tests
npm run lint          # Análisis estático de código con ESLint
npm run format        # Formateo de código con Prettier
```

---

## Licencia

Distribuido bajo licencia MIT o académica para uso personal y de código abierto.

# 🎓 UniDule

<div align="center">

  **Tu centro de comando académico personal y definitivo.**  
  *Organiza tus cursadas, correlatividades, exámenes, agenda, hábitos y sesiones de estudio en una única aplicación fluida, moderna y personalizable.*

  <br />

  [![Live Demo](https://img.shields.io/badge/Demo%20en%20Vivo-unidule.vercel.app-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://unidule.vercel.app)

  <br />

  [![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Zustand](https://img.shields.io/badge/Zustand-5.0-443e38?style=flat-square&logo=zustand&logoColor=white)](https://zustand-demo.pmnd.rs/)
  [![Vitest](https://img.shields.io/badge/Tested%20with-Vitest-FCC72B?style=flat-square&logo=vitest&logoColor=black)](https://vitest.dev/)
  [![PWA Ready](https://img.shields.io/badge/PWA-Ready-10b981?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
  [![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://unidule.vercel.app)

</div>

---

## 🌐 Aplicación en Vivo

UniDule se encuentra desplegada y disponible para su uso en producción:

👉 **[https://unidule.vercel.app](https://unidule.vercel.app)**

---

## 💡 ¿Qué es UniDule?

**UniDule** es una plataforma web progresiva (PWA) de gestión académica integral diseñada por y para estudiantes universitarios. Nace para resolver la dispersión de información habitual en la vida académica: fechas de exámenes, asistencia a clases, planes de correlatividades, apuntes, tareas y hábitos de estudio.

Con una arquitectura cliente-servidor reactiva, interfaz ultra rápida construida sobre **React 19** y almacenamiento seguro en tiempo real con **Supabase**, UniDule centraliza todas tus herramientas en un solo lugar, sin fricciones ni sobrecarga cognitiva.

---

## ✨ Características Principales

### 📊 1. Dashboard Inteligente
- **Próxima Clase al Instante:** Widget dinámico con cuenta regresiva en tiempo real indicando materia, aula y docente.
- **Resumen del Día:** Visualización clara de cursadas y tareas pendientes para hoy.
- **Alertas Tempranas:** Alerta de riesgo de inasistencias (faltas máximas) y vencimiento de regularidades (≤90 días).
- **Cuenta Regresiva de Exámenes:** Temporizador destacado para tus próximos parciales y finales.
- **Checklist de Hábitos Diarios:** Seguimiento de rutinas que se reinicia automáticamente cada medianoche.

### 🗺️ 2. Mapa de Carrera y Correlatividades
- **Árbol de Correlatividades Dinámico:** Cálculo automático del estado de cada materia (*Cursando*, *Regular*, *Aprobada*, *Disponible para cursar*, *Disponible para final* o *Bloqueada*).
- **Seguimiento de Créditos:** Control de avance respecto a los requerimientos del plan de estudios.
- **Simulador de Avance de Carrera:** Proyección de qué materias se habilitan al aprobar exámenes pendientes con resolución de equivalencias.
- **Electivas y Seminarios:** Módulo para cargar materias optativas, talleres y horas de extensión.

### 📚 3. Gestión de Materias y Calificaciones
- **Ficha Completa de Cursada:** Código, docente, aula, correo de contacto y horario semanal.
- **Control Riguroso de Asistencia:** Contador de inasistencias con límite de faltas y semáforo visual de riesgo.
- **Apuntes en Markdown:** Bloc de notas integrado por materia con previsualización en vivo.
- **Calificaciones y Promedio Ponderado:** Registro de notas de exámenes, trabajos prácticos y cálculo de promedio con pesos.

### 🎓 4. Módulo Especializado de Finales
- **Panel de Regularidades:** Lista filtrada de materias regulares pendientes de aprobación final.
- **Vencimiento de Regularidad:** Control de fechas límite para no perder la condición de regular.
- **Mesas e Intentos:** Registro de turnos de examen e intentos restantes.
- **Vinculación con Estudio:** Posibilidad de vincular sesiones de preparación directamente a cada mesa.

### 📅 5. Agenda y Calendario Multivista
- **Vistas Semanal y Mensual:** Visualización con fechas reales para organizar toda tu semana o planificar el mes.
- **Eventos Extracurriculares:** Carga de actividades no académicas (gimnasio, trabajo, hobbies, estudio) con etiquetas y colores.
- **Sincronización de Calendario (.ics):** Exportación compatible con Google Calendar, Apple Calendar y Outlook para contar con recordatorios nativos en tu teléfono o computadora.

### ⏱️ 6. Asistente de Estudio, Pomodoro y Sonido Ambiente
- **Temporizador Personalizable:** Modos de concentración (25/5, 50/10 o intervalos personalizados).
- **Modo Do Not Disturb (DND):** Vista a pantalla completa enfocada 100% en el estudio para minimizar distracciones.
- **Generador Procedural de Sonido:** Ruido blanco y sonido de lluvia sintetizados nativamente mediante **Web Audio API** (sin descargas pesadas de audio ni consumo de ancho de banda).
- **Checklist de Temas:** Lista de conceptos para tachar mientras estudias.
- **Historial de Sesiones:** Registro auditable y editable del tiempo dedicado a cada materia o examen.

### 🎯 7. Matriz de Eisenhower para Tareas
- Clasificación de tareas en 4 cuadrantes: *Urgente & Importante (Hacer)*, *No Urgente & Importante (Planificar)*, *Urgente & No Importante (Delegar)*, y *No Urgente & No Importante (Descartar)*.
- Sincronización automática de parciales y entregas registradas en las materias.

### 📈 8. Estadísticas y Gamificación
- **Rachas de Estudio (Streaks):** Contador de días consecutivos cumpliendo metas de estudio.
- **Métricas Globales:** Promedio general, materias aprobadas, porcentaje de carrera completado y horas dedicadas.

### 🎨 9. Personalización y Temas
- Colección de más de 8 temas cuidadosamente diseñados:
  - 🌙 **Midnight Dark** (por defecto)
  - 💎 **Emerald Obsidian**
  - 🧛 **Dracula Purple**
  - ⚡ **Cyberpunk Neon**
  - 🔴 **Crimson Red**
  - ☀️ **Enterprise Light**
  - 🌅 **Sunset Amber**
  - 🌸 **Sakura Blossom**
  - 🍭 **Algodón de Azúcar**
  - 🌌 **Amanecer Morado**

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) | Renderizado concurrente y UI declarativa de última generación |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) | Tipado estático riguroso y autocompletado en todo el proyecto |
| **Bundler & Tooling** | [Vite 8](https://vitejs.dev/) | HMR ultra veloz y optimización del bundle de producción |
| **Enrutamiento** | [React Router v7](https://reactrouter.com/) | Navegación SPA fluida y control de rutas protegidas |
| **Estado Global** | [Zustand](https://zustand-demo.pmnd.rs/) | Store reactivo, minimalista y sin boilerplate innecesario |
| **Backend & Base de Datos** | [Supabase](https://supabase.com/) | PostgreSQL gestionado, Row Level Security (RLS) y Autenticación JWT |
| **Iconografía** | [Lucide React](https://lucide.dev/) | Set de iconos vectoriales modernos y consistentes |
| **Audio Síntesis** | [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Generación procedural en tiempo real de ruido blanco y lluvia |
| **Testing** | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) | Pruebas unitarias y de integración de componentes y lógica de negocio |
| **Despliegue** | [Vercel](https://vercel.com/) | Hosting global con CI/CD automatizado |

---

## 📂 Estructura del Proyecto

El código está estructurado siguiendo una arquitectura orientada a **Features**:

```text
UniDule/
├── public/                 # Favicon, assets estáticos y manifiesto PWA
├── src/
│   ├── assets/             # Recursos gráficos e ilustraciones
│   ├── docs/               # Documentación interna (auditorías, mejoras, arquitectura)
│   ├── features/           # Módulos de dominio de la aplicación
│   │   ├── career/         # Mapa de carrera, correlativas, simulador
│   │   ├── events/         # Gestión de eventos extracurriculares
│   │   ├── subjects/       # Materias activas, notas, faltas, apuntes
│   │   └── tasks/          # Tareas, matriz de Eisenhower, parciales
│   ├── pages/              # Vistas principales de la aplicación
│   │   ├── Auth.tsx        # Login y registro de usuarios
│   │   ├── Career.tsx      # Vista de plan de estudios y electivas
│   │   ├── Dashboard.tsx   # Panel central del estudiante
│   │   ├── Events.tsx      # Agenda de eventos
│   │   ├── Finals.tsx      # Mesa de exámenes y finales
│   │   ├── Schedule.tsx    # Horario semanal y calendario mensual
│   │   ├── Settings.tsx    # Perfil, preferencias y exportación ICS
│   │   ├── Stats.tsx       # Estadísticas académicas y rachas
│   │   ├── Study.tsx       # Pomodoro, DND y sonido ambiente
│   │   ├── Subjects.tsx    # Vista general de cursadas
│   │   └── Tasks.tsx       # Lista de tareas y matriz de Eisenhower
│   ├── shared/             # Código compartido y transversal
│   │   ├── components/     # Layouts (Sidebar, Topbar) y modales comunes
│   │   ├── context/        # AuthProvider y ThemeProvider
│   │   ├── hooks/          # Hooks compartidos (useDataSync)
│   │   ├── lib/            # Utilidades, audioGenerator, ics export, themes
│   │   ├── store/          # Store global Zustand (useStore, useDialogs)
│   │   └── types/          # Definiciones TypeScript de dominio
│   ├── test/               # Setup y mocks de Vitest
│   ├── App.tsx             # Enrutador principal y layout
│   ├── main.tsx            # Punto de entrada de la aplicación
│   └── style.css           # Sistema de diseño con variables CSS
├── supabase/               # Esquema de base de datos SQL y políticas RLS
└── package.json            # Scripts y dependencias
```

---

## 🚀 Instalación y Ejecución Local

Para clonar y correr UniDule en tu entorno local, sigue estos pasos:

### 1. Clonar el repositorio

```bash
git clone https://github.com/frang/UniDule.git
cd UniDule
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env.local
```

Configura tus credenciales de Supabase en `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173` para empezar a usar la aplicación.

---

## 🧪 Scripts Disponibles

En el directorio del proyecto puedes ejecutar:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con Vite |
| `npm run build` | Compila TypeScript y genera el build de producción en `dist/` |
| `npm run preview` | Previsualiza localmente el build de producción |
| `npm run test` | Ejecuta la suite de pruebas en modo interactivo con Vitest |
| `npm run test:run` | Ejecuta todos los tests una sola vez |
| `npm run test:coverage` | Genera el reporte de cobertura de código |
| `npm run lint` | Analiza el código en busca de errores con ESLint |
| `npm run lint:fix` | Corrige automáticamente problemas de linting |
| `npm run format` | Aplica formato a todo el código fuente con Prettier |

---

## 🔒 Seguridad y Privacidad

UniDule utiliza **Row Level Security (RLS)** en PostgreSQL a través de Supabase:
- Cada usuario autenticado tiene acceso exclusivamente a sus propios registros (`user_id = auth.uid()`).
- Los tokens de sesión se gestionan mediante JWT seguro.
- No se envían datos analíticos invasivos ni se comparten credenciales con terceros.

---

## 📱 Progressive Web App (PWA)

UniDule está optimizada como **PWA**:
- Puedes instalarla como aplicación nativa en tu dispositivo móvil (Android / iOS) o escritorio (Chrome, Edge, macOS).
- Funciona en pantalla completa con interfaz adaptada y navegación táctil intuitiva.

---

## 📄 Licencia

Este proyecto se distribuye bajo fines académicos y de código abierto.

<div align="center">
  <sub>Desarrollado con ❤️ para transformar la experiencia universitaria.</sub><br />
  <sub>Visita la aplicación: <strong><a href="https://unidule.vercel.app">unidule.vercel.app</a></strong></sub>
</div>

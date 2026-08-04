# Prompt de Migración y Arquitectura para Claude

> **Instrucciones:** Copia y pega todo el texto dentro de este bloque en Claude.

---

Actúa como un Arquitecto de Software Fullstack Senior experto en PostgreSQL, Supabase, Vercel y JavaScript (Vanilla/Vite).

Tengo la aplicación web **UniSchedule** que actualmente funciona bajo una filosofía *Local-First*, guardando todo el estado global de la app en un único objeto `S` en `localStorage`. Quiero migrarla a una arquitectura **Serverless / BaaS en Vercel + Supabase**, agregando soporte multiusuario para que mis compañeros de la facultad puedan registrarse, tener sus propios datos y gestionar su carrera de forma independiente.

Actualmente, la estructura de datos que maneja el frontend en memoria (`S`) es la siguiente:

```typescript
interface GlobalState {
  profile: { name: string; career: string; theme: string };
  subjects: ActiveSubject[]; // Agenda del cuatrimestre actual, horarios y parciales
  tasks: Task[]; // Pendientes, entregas y fechas de exámenes
  career: { 
    subjects: CareerSubject[]; 
    electives: CareerElective[]; 
    seminars: CareerSeminar[]; 
  }; // Plan de estudio completo, correlativas e historial académico
}

interface ActiveSubject { 
  id: string; 
  code: string; 
  name: string; 
  color: string; 
  schedule: Array<{ day: number; type: string; room: string; time: string }>; 
  grades: Array<{ id: string; title: string; grade: number; date: string; weight: number }>; 
}

interface Task { 
  id: string; 
  title: string; 
  subjectId: string | null; 
  type: string; 
  dueDate: string | null; 
  notes: string; 
  done: boolean; 
  gradeId: string | null; 
}

interface CareerSubject { 
  id: string; 
  code: string; 
  name: string; 
  year: number; 
  semester: number; 
  credits: number; 
  status: string; 
  grade: number | null; 
  regDate: string | null; 
  expDate: string | null; 
  correlatives: { toCurse: string[]; toPass: string[] }; 
}

interface CareerElective { 
  id: string; 
  code: string; 
  name: string; 
  category: string; 
  credits: number; 
  status: string; 
  grade: number | null; 
}

interface CareerSeminar { 
  id: string; 
  code: string; 
  name: string; 
  category: string; 
  hours: number; 
  status: string; 
  date: string; 
  notes: string; 
}
```

🎯 Requerimientos Específicos del Proyecto

1. Reorganización y Arquitectura de Archivos
Actualmente la aplicación tiene todos sus archivos en la raíz del proyecto. Necesito reorganizar la estructura para que sea modular, mantenible y limpia.
Propón y aplica una estructura de carpetas profesional (ejemplo: /src/services, /src/components, /src/styles, /src/utils, etc.).
Separa estrictamente la lógica de comunicación con la base de datos de la lógica de renderizado visual y manipulación del DOM.

2. Base de Datos en Supabase (PostgreSQL)
Diseño Catálogo Global vs. Instancia de Usuario:
Define un Catálogo Global (Templates) para las materias estáticas de la carrera (global_subjects), optativas y seminarios, incluyendo sus metadatos (nombre, código, créditos, año, semestre, correlatividades).
Diseña las tablas de Instancia del Usuario relacionándolas con auth.users.id para guardar únicamente los datos dinámicos del alumno (status, grade, regDate, expDate, horarios, asistencias, tareas), evitando duplicar la información de la carrera.

Seguridad y Privacidad (RLS):
Configura políticas de Row Level Security (RLS) para que el catálogo global sea de lectura pública y las tablas privadas de cada usuario solo permitan ALL cuando auth.uid() = user_id.

Automatización:
Incluye una función/trigger en PostgreSQL que, al momento en que un nuevo usuario se registre mediante auth.users, le inicialice de forma automática sus registros del plan de carrera en estado 'pendiente'.

3. Adaptador / Capa de Datos en JS
Crea un servicio/módulo centralizado en JavaScript que interactúe con el cliente de Supabase.
Implementa una función fetchFullState() que consulte las tablas de Supabase y reconstruya exactamente el objeto S en memoria con el tipo GlobalState, de modo que no sea necesario refactorizar masivamente la UI existente.
Implementa funciones de sincronización/actualización para materias, horarios, notas y tareas (syncSubjectProgress, saveTask, updateGrade, etc.).

📋 Reglas Estrictas de Entrega
Scripts SQL para Supabase:
Entrégame un único script SQL unificado y completo listo para copiar y ejecutar en el SQL Editor de Supabase (creación de Tablas, Claves Foráneas, Enums, Políticas RLS, Triggers e Índices).

Código Frontend Modularizado:
Genera todos y cada uno de los archivos del proyecto especificando su ruta relativa exacta según la nueva estructura propuesta (ejemplo: // src/services/supabaseClient.js, // src/services/dataService.js, etc.).
No resumas, recortes ni uses comentarios explicativos como // ... resto del código. Devuelve los archivos completamente desarrollados y funcionales.

Instrucciones de Despliegue:
Muestra el árbol conceptual de la nueva carpeta del proyecto.
Proporciona una guía breve para la configuración de las variables de entorno (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY) en el panel de Vercel y en desarrollo local.

-- ==========================================
-- SCRIPT SQL PARA UNISCHEDULE (SUPABASE)
-- ==========================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLAS GLOBALES (CATÁLOGO DE LA CARRERA)
-- ==========================================

-- Catálogo de Materias Oficiales
CREATE TABLE global_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    credits INTEGER NOT NULL,
    correlatives JSONB DEFAULT '{"toCurse": [], "toPass": []}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Catálogo de Optativas
CREATE TABLE global_electives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en globales (Lectura pública)
ALTER TABLE global_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_electives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Materias globales son de lectura pública" ON global_subjects FOR SELECT USING (true);
CREATE POLICY "Optativas globales son de lectura pública" ON global_electives FOR SELECT USING (true);

-- ==========================================
-- TABLAS PRIVADAS (INSTANCIA DEL USUARIO)
-- ==========================================

-- Perfiles de usuario
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    career VARCHAR(255) DEFAULT 'Ingeniería en Informática',
    theme VARCHAR(50) DEFAULT 'dark',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Progreso Académico (estado de las materias y optativas)
-- Nota: En lugar de crear 50 registros vacíos al inicio, usamos LEFT JOIN.
-- Solo se crea un registro aquí cuando el estado cambia a algo distinto de 'pendiente'.
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    global_id VARCHAR(50) NOT NULL, -- Referencia al id (string o UUID) de la materia
    type VARCHAR(20) NOT NULL CHECK (type IN ('subject', 'elective')),
    status VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    grade NUMERIC(4,2),
    reg_date DATE,
    exp_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, global_id)
);

-- Seminarios creados por el usuario
CREATE TABLE user_seminars (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    hours INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'aprobada',
    date VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Agenda del Cuatrimestre Actual (ActiveSubjects)
CREATE TABLE user_active_subjects (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(20) NOT NULL,
    professor VARCHAR(255),
    room VARCHAR(100),
    email VARCHAR(255),
    max_absences INTEGER DEFAULT 6,
    absences INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'cursando',
    allows_promotion BOOLEAN DEFAULT false,
    schedule JSONB DEFAULT '[]'::jsonb, -- [{day, type, room, time}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notas parciales (Grades)
CREATE TABLE user_grades (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    active_subject_id VARCHAR(50) NOT NULL REFERENCES user_active_subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    grade NUMERIC(4,2) NOT NULL,
    date VARCHAR(20),
    weight NUMERIC(4,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tareas y Eventos
CREATE TABLE user_tasks (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    subject_id VARCHAR(50), -- Puede referenciar a user_active_subjects.id o global_subjects.id
    type VARCHAR(50) NOT NULL,
    due_date DATE,
    notes TEXT,
    done BOOLEAN DEFAULT false,
    grade_id VARCHAR(50) REFERENCES user_grades(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ==========================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_active_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas universales para que el usuario solo vea/edite sus propios datos
CREATE POLICY "Users can manage their own profile" ON user_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own seminars" ON user_seminars FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own active subjects" ON user_active_subjects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own grades" ON user_grades FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own tasks" ON user_tasks FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS Y FUNCIONES (AUTOMATIZACIÓN)
-- ==========================================

-- Función para inicializar el perfil del usuario recién registrado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, career, theme)
  VALUES (new.id, split_part(new.email, '@', 1), 'Ingeniería en Informática', 'dark');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función anterior
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Nota sobre la inicialización del plan (materias pendientes):
-- En lugar de un trigger pesado que inserte 40 registros vacíos en user_progress, 
-- la aplicación usará un LEFT JOIN entre global_subjects y user_progress. 
-- Así, si no hay registro, el estado asumido será 'pendiente'. Esto es mucho más 
-- eficiente y profesional en arquitecturas SQL.

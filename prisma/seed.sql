-- LEGACY / REFERENCIAL - NO USAR COMO FLUJO OPERATIVO
-- Este archivo se mantiene solo con fines historicos y de auditoria tecnica.
-- El flujo oficial de onboarding es:
-- 1) Prisma migrations (deploy/status con MIGRATION_DATABASE_URL cuando aplique)
-- 2) npm run seed (prisma/seed.ts, sin usuarios reales)
-- 3) npm run bootstrap:admin (creacion del primer ADMIN real)
--
-- prisma/seed.sql — Seeding historico de TerraNova Academy
-- No ejecutar en produccion ni como instalacion principal.

-- 1. Create Admin User
INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "updatedAt")
VALUES (
    'admin_user_01', 
    'director@terranova.edu.pe', 
    '$2a$12$D.m7R6c0v/T6M1U/7B.R7e31gXG/1h/8h.H.X.X.X.X.X.X.X.X.', 
    'Director Terranova', 
    'ADMIN',
    NOW()
) ON CONFLICT ("email") DO NOTHING;

-- 2. Create Academic Year 2025
INSERT INTO "AcademicYear" ("id", "year", "startDate", "endDate", "active")
VALUES (
    'academic_year_2025', 
    2025, 
    '2025-03-01', 
    '2025-12-20', 
    TRUE
) ON CONFLICT ("year") DO NOTHING;

-- 3. Create Grade Levels
INSERT INTO "GradeLevel" ("id", "name", "level", "order")
VALUES
    ('gl_inicial_1',  '1er Año Inicial',  'INICIAL',    1),
    ('gl_inicial_2',  '2do Año Inicial',  'INICIAL',    2),
    ('gl_inicial_3',  '3er Año Inicial',  'INICIAL',    3),
    ('gl_primaria_1', '1er Grado',        'PRIMARIA',   4),
    ('gl_primaria_2', '2do Grado',        'PRIMARIA',   5),
    ('gl_primaria_3', '3er Grado',        'PRIMARIA',   6),
    ('gl_primaria_4', '4to Grado',        'PRIMARIA',   7),
    ('gl_primaria_5', '5to Grado',        'PRIMARIA',   8),
    ('gl_primaria_6', '6to Grado',        'PRIMARIA',   9),
    ('gl_secund_1',   '1ro Secundaria',   'SECUNDARIA', 10),
    ('gl_secund_2',   '2do Secundaria',   'SECUNDARIA', 11),
    ('gl_secund_3',   '3ro Secundaria',   'SECUNDARIA', 12),
    ('gl_secund_4',   '4to Secundaria',   'SECUNDARIA', 13),
    ('gl_secund_5',   '5to Secundaria',   'SECUNDARIA', 14)
ON CONFLICT ("name") DO NOTHING;

-- 4. Create Sections (Linked to 2025)
-- We use a simple strategy to link them
INSERT INTO "Section" ("id", "name", "gradeLevelId", "academicYearId")
SELECT 
    'sec_' || id, 
    'Sección A', 
    id, 
    'academic_year_2025'
FROM "GradeLevel"
ON CONFLICT ("gradeLevelId", "academicYearId") DO NOTHING;

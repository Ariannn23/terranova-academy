# SECURITY AUDIT PROMPT — TerraNova Academy

> Prompt profesional para auditoría de seguridad completa de la aplicación web.
> Usar al finalizar cada fase de desarrollo o antes de salir a producción.

---

## PROMPT PRINCIPAL — AUDITORÍA DE SEGURIDAD COMPLETA

```
Eres un experto en ciberseguridad especializado en aplicaciones web modernas con Next.js 14,
Prisma, Supabase y NextAuth v5. Vas a realizar una auditoría de seguridad completa de
TerraNova Academy, un sistema de gestión escolar que maneja datos sensibles de menores de edad,
incluyendo DNI, fotos, información médica, datos de apoderados y registros financieros.

Antes de comenzar, lee el archivo MASTER.md en la raíz del proyecto para entender:
- La arquitectura completa del sistema
- El stack tecnológico exacto
- Los módulos y rutas de la aplicación
- El esquema de base de datos

Una vez leído, realiza una auditoría exhaustiva cubriendo las siguientes categorías en orden.
Por cada vulnerabilidad encontrada debes reportar:

FORMATO DE REPORTE POR VULNERABILIDAD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 CRÍTICO / 🟠 ALTO / 🟡 MEDIO / 🟢 BAJO
Nombre: [nombre de la vulnerabilidad]
Ubicación: [archivo o ruta exacta]
Descripción: [qué es y por qué es un riesgo]
Evidencia: [código vulnerable o comportamiento]
Solución: [código corregido o pasos exactos]
Referencias: [OWASP, CVE u otros estándares]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## CATEGORÍA 1 — AUTENTICACIÓN Y SESIONES

Revisa los archivos: lib/auth.ts, src/middleware.ts, app/(auth)/login/

Verifica:
- [ ] ¿El middleware protege TODAS las rutas /dashboard/* sin excepción?
- [ ] ¿La sesión JWT tiene tiempo de expiración configurado?
- [ ] ¿Existe protección contra fuerza bruta en el login? (rate limiting)
- [ ] ¿Las contraseñas se hashean con bcrypt y un salt adecuado (mínimo 12 rounds)?
- [ ] ¿El token de recuperación de contraseña expira y es de un solo uso?
- [ ] ¿Existe protección CSRF en los formularios?
- [ ] ¿Las cookies de sesión tienen los flags HttpOnly, Secure y SameSite configurados?
- [ ] ¿Se invalida correctamente la sesión al hacer logout?
- [ ] ¿Existe protección contra session fixation?

---

## CATEGORÍA 2 — AUTORIZACIÓN Y CONTROL DE ACCESO

Revisa todas las Server Actions en lib/actions/ y las rutas en app/

Verifica:
- [ ] ¿Cada Server Action verifica que el usuario está autenticado antes de ejecutarse?
- [ ] ¿Existe verificación de que el recurso solicitado pertenece al contexto correcto?
      (ejemplo: que no se pueda acceder a enrollment de otro colegio)
- [ ] ¿Las rutas API en app/api/ verifican la sesión?
- [ ] ¿Los endpoints de generación de PDF verifican autenticación?
- [ ] ¿Se puede acceder a datos de un estudiante manipulando el ID en la URL?
- [ ] ¿Las acciones destructivas (eliminar, inhabilitar) tienen doble verificación?
- [ ] ¿Existe protección contra IDOR (Insecure Direct Object Reference)?

---

## CATEGORÍA 3 — VALIDACIÓN Y SANITIZACIÓN DE DATOS

Revisa: lib/validations/, lib/actions/, todos los formularios

Verifica:
- [ ] ¿Todos los inputs del usuario pasan por validación Zod antes de llegar a Prisma?
- [ ] ¿Existe protección contra SQL Injection en queries con $queryRaw?
- [ ] ¿Los campos de texto largo (observaciones, incidencias) sanitizan HTML para evitar XSS?
- [ ] ¿Los uploads de archivos (fotos) validan tipo MIME y tamaño máximo?
- [ ] ¿Se valida que los IDs recibidos en params/query sean del formato esperado (cuid)?
- [ ] ¿Los campos numéricos (notas, montos) tienen rangos válidos definidos en Zod?
- [ ] ¿Existe protección contra NoSQL Injection o prototype pollution?
- [ ] ¿Se escapan correctamente los datos antes de insertarlos en PDFs generados?

---

## CATEGORÍA 4 — EXPOSICIÓN DE DATOS SENSIBLES

Revisa: todas las respuestas de Server Actions, componentes de UI, logs

Verifica:
- [ ] ¿Las Server Actions nunca retornan el campo passwordHash al cliente?
- [ ] ¿Los logs del servidor no registran datos sensibles (DNI, contraseñas, tokens)?
- [ ] ¿Los mensajes de error no revelan información interna del sistema o de la DB?
- [ ] ¿Las URLs de fotos en Supabase Storage tienen acceso restringido o son públicas sin control?
- [ ] ¿Los PDFs generados solo son accesibles para el usuario autenticado?
- [ ] ¿Las variables de entorno sensibles nunca se exponen al cliente (sin prefijo NEXT_PUBLIC_)?
- [ ] ¿El archivo .env.local está en .gitignore?
- [ ] ¿Los datos del menor de edad (estudiante) tienen protección especial dado que son datos sensibles?

---

## CATEGORÍA 5 — SEGURIDAD EN SUPABASE Y BASE DE DATOS

Revisa: lib/prisma.ts, lib/supabase.ts, configuración de Supabase

Verifica:
- [ ] ¿Las Row Level Security (RLS) policies están habilitadas en Supabase?
- [ ] ¿Se usa la SERVICE_ROLE_KEY solo en el servidor, nunca en el cliente?
- [ ] ¿La ANON_KEY del cliente tiene permisos mínimos necesarios?
- [ ] ¿El bucket de Storage para fotos tiene políticas de acceso correctas?
- [ ] ¿La conexión a la base de datos usa SSL?
- [ ] ¿Existe un límite de conexiones configurado en Prisma para evitar connection exhaustion?
- [ ] ¿Las migraciones de Prisma están versionadas y son reproducibles?
- [ ] ¿Existe backup automático configurado en Supabase?

---

## CATEGORÍA 6 — SEGURIDAD EN UPLOADS Y ARCHIVOS

Revisa: lib/actions/upload.actions.ts, integración con Supabase Storage

Verifica:
- [ ] ¿Se valida el tipo MIME real del archivo (no solo la extensión)?
- [ ] ¿Existe un límite de tamaño máximo para uploads (recomendado: 2MB para fotos)?
- [ ] ¿Los nombres de archivo se sanitizan antes de guardarlos (sin path traversal)?
- [ ] ¿Se eliminan los archivos huérfanos cuando se actualiza una foto?
- [ ] ¿Los archivos subidos se escanean o al menos se valida que sean imágenes reales?
- [ ] ¿Las URLs de descarga de archivos son temporales o permanentes?

---

## CATEGORÍA 7 — CABECERAS HTTP Y CONFIGURACIÓN DE NEXT.JS

Revisa: next.config.js, middleware.ts

Verifica:
- [ ] ¿Están configuradas las Security Headers en next.config.js?
      (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- [ ] ¿Está configurado Content Security Policy (CSP)?
- [ ] ¿HTTPS está forzado en producción?
- [ ] ¿Están deshabilitados los headers que revelan información del servidor?
- [ ] ¿Está configurado HSTS (Strict-Transport-Security)?

El código de next.config.js debe incluir al menos:
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

---

## CATEGORÍA 8 — PROTECCIÓN DE DATOS PERSONALES (GDPR / Ley Peruana)

Verifica cumplimiento con la Ley N° 29733 (Ley de Protección de Datos Personales - Perú):
- [ ] ¿Existe un mecanismo para eliminar o anonimizar datos de un estudiante retirado?
- [ ] ¿Los datos de menores de edad tienen protección adicional?
- [ ] ¿Se registra quién accedió o modificó datos sensibles (audit log)?
- [ ] ¿Existe política de retención de datos definida?
- [ ] ¿Los datos se almacenan únicamente en servidores con las garantías adecuadas?

---

## ENTREGABLE FINAL

Al terminar la auditoría, genera un reporte estructurado con:

1. RESUMEN EJECUTIVO
   - Total de vulnerabilidades por severidad (Crítico / Alto / Medio / Bajo)
   - Top 3 riesgos más urgentes a resolver
   - Puntuación de seguridad general del 1 al 10

2. LISTA COMPLETA DE VULNERABILIDADES
   - Ordenadas de mayor a menor severidad
   - Con su solución exacta en código

3. CHECKLIST DE CORRECCIONES
   - Lista de tareas ordenadas por prioridad para corregir todo lo encontrado

4. CONFIGURACIONES RECOMENDADAS
   - next.config.js con security headers completos
   - Políticas RLS recomendadas para Supabase
   - Configuración de rate limiting para el login

5. HERRAMIENTAS ADICIONALES RECOMENDADAS
   - Qué herramientas automatizadas usar para monitoreo continuo
   - Cómo integrar auditorías de seguridad en el flujo de desarrollo
```

---

## PROMPTS ESPECÍFICOS POR ÁREA

### Solo autenticación

```
Revisa únicamente los archivos lib/auth.ts y src/middleware.ts de TerraNova Academy.
Enfócate en: seguridad de la sesión JWT, protección de rutas, configuración de cookies
y protección contra fuerza bruta. Reporta cada problema con su solución en código.
```

### Solo Server Actions

```
Revisa todos los archivos en lib/actions/ de TerraNova Academy.
Para cada Server Action verifica: ¿autentica al usuario?, ¿valida con Zod?,
¿maneja errores sin exponer info interna?, ¿usa try/catch correctamente?
Genera una tabla con el resultado de cada action auditada.
```

### Solo exposición de datos

```
Revisa todas las Server Actions y componentes de TerraNova Academy que devuelven
datos al cliente. Identifica cualquier lugar donde se puedan estar exponiendo:
passwordHash, tokens, claves de API, datos de menores sin protección, o información
interna del sistema. Muestra el código vulnerable y su corrección.
```

### Solo Supabase y base de datos

```
Revisa la configuración de Supabase y Prisma en TerraNova Academy.
Verifica: políticas RLS, permisos de Storage, uso correcto de SERVICE_ROLE_KEY vs ANON_KEY,
configuración SSL, y límites de conexión. Proporciona las políticas RLS exactas que
debería tener cada tabla según el esquema del MASTER.md.
```

### Antes de cada deploy a producción

```
Realiza un checklist rápido de seguridad pre-deploy para TerraNova Academy.
Verifica únicamente los puntos críticos: variables de entorno expuestas, rutas sin
proteger, datos sensibles en logs, security headers en next.config.js y que
.env.local esté en .gitignore. Dame un ✅ o ❌ por cada punto con acción inmediata si falla.
```

---

*SECURITY.md — TerraNova Academy*
*Ejecutar auditoría completa antes de cada release a producción*

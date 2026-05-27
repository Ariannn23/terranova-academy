# Sprint 17F — README Final Hardening

## Objetivo del Sprint
Reforzar `README.md` para que sea lo más robusto, claro y operativo posible para cualquier nuevo desarrollador que clone el proyecto TerraNova Academy. Este sprint es exclusivamente de documentación; no modifica lógica de negocio, schema, migraciones, componentes, auth ni Server Actions.

## Rama Git
`feature/sprint-17f-readme-final-hardening`

## Secciones Agregadas o Reforzadas en README.md

### Nuevas secciones completas:

1. **Estado actual del proyecto**: Tabla con resultados de todas las validaciones recientes (`validate`, `generate`, `lint`, `tsc`, `test:run`, `test:integration`, `test:e2e base`, `build`). Aclara que los 11 skipped de E2E son comportamiento esperado hasta configurar base aislada.

2. **Checklist de primera instalación**: Lista de tareas paso a paso para que un nuevo desarrollador no omita ningún paso crítico (clone, Node, npm install, `.env.local`, migraciones, seed, bootstrap, dev, login).

3. **Ejemplo de .env.local**: Bloque de código con valores de ejemplo sin secretos reales. Incluye advertencia explícita de no subir el archivo y rotar credenciales expuestas.

4. **Comandos Prisma por terminal**: Comandos separados para **Git Bash** y **PowerShell**, cubriendo carga de variables de entorno, sustitución de `DATABASE_URL` por `MIGRATION_DATABASE_URL`, y ejecución de `migrate status`, `migrate deploy` y `generate`.

5. **Flujo para base Supabase existente**: Pasos concretos para trabajar sobre la base Supabase del proyecto sin riesgo de perder datos ni ejecutar comandos destructivos.

6. **Advertencia sobre base nueva desde cero**: Sección que explica por qué el baseline actual no es una migración inicial limpia y qué implicaciones tiene para instalaciones en bases vacías.

7. **Seed base y primer ADMIN**: Explicación detallada del comportamiento de `npm run seed` y `npm run bootstrap:admin`, incluyendo fallbacks de contraseña, idempotencia y restricciones de seguridad.

8. **Gestión de usuarios**: Documentación de reglas de negocio del módulo: dominio institucional, validación de nombre, contraseña temporal, activación/desactivación, y validación de `User.active` en login y layout protegido.

9. **Guía de validación post-instalación**: Lista de verificación para confirmar que la instalación fue exitosa (Prisma, dev server, login, dashboard, módulos).

10. **Guía para pruebas E2E autenticadas**: Pasos concretos para habilitar el modo autenticado de Playwright con base aislada.

11. **Troubleshooting**: Casos reales documentados: `.next` corrompido, `migrate status` colgado, `P3005`, columnas/tablas faltantes, `EADDRINUSE`, tests con `stderr`.

12. **Reglas de seguridad**: Lista consolidada de restricciones de seguridad operativa.

13. **Flujo de trabajo con ramas**: Convención de nombres, validaciones obligatorias antes de merge, y reglas de disciplina técnica.

14. **Documentación interna**: Explicación del rol de `README.md` vs `docs/arrangements/` y reglas de mantenimiento.

15. **Roadmap técnico inmediato**: 6 ítems priorizados para los próximos sprints.

### Secciones reforzadas/reorganizadas:
- Estructura principal ahora usa árbol de directorios en lugar de lista plana.
- Variables de entorno ahora incluyen tabla descriptiva.
- Stack técnico es más completo (NextAuth, Supabase Storage, Resend).
- `Que NO hacer` y `Pendientes técnicos` actualizados.

## Validaciones Ejecutadas

| Validación | Resultado |
|---|---|
| `prisma validate` | ✅ `The schema is valid 🚀` |
| `prisma generate` | ✅ Cliente generado correctamente |
| `npm run lint` | ✅ `No ESLint warnings or errors` |
| `npx tsc --noEmit` | ✅ Sin errores de tipos |
| `npm run test:run` | ✅ 188/188 tests pasados |

## Pendientes
- Ninguno en este sprint. El README queda en estado completamente funcional y operativo.
- Los pendientes técnicos del proyecto se documentan en la sección **Roadmap técnico inmediato** del propio README.

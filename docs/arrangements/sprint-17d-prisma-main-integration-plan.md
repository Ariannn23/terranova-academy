# Sprint 17D — Estrategia Prisma final e integracion controlada hacia main

## 1) Objetivo

Definir una estrategia segura para corregir el desalineamiento entre `main` y la rama funcional actual, y decidir como manejar migraciones Prisma (en especial el baseline creado en Sprint 17A), sin realizar cambios destructivos ni merges directos.

## 2) Problema detectado (resumen)

El repositorio tiene dos realidades:

- `main` esta desactualizado y no representa el estado funcional actual (sin migraciones, schema desfasado, seeds legacy inseguros).
- La rama funcional (17B/17C) contiene el estado real (schema actualizado, migraciones, seed base seguro y bootstrap admin).

## 3) Estado de main (diagnostico)

De acuerdo con Sprint 17C:

- `main` **no contiene** `prisma/migrations/`.
- `main` tenia `schema.prisma` **desfasado** respecto del codigo actual (faltaban: `User.active`, `PaymentTransaction`, `AuditLog`, `Section.capacity`).
- `main` conserva seeds legacy inseguros/referenciales que pueden confundir el onboarding (ej. referencias a `Admin1234!` en scripts/SQL legacy).

**Conclusión**: `main` no debe usarse para onboarding ni deploy hasta integracion controlada.

## 4) Estado de la rama funcional (diagnostico)

En la rama funcional actual:

- `prisma/schema.prisma` incluye:
  - `User.active`
  - `PaymentTransaction`
  - `AuditLog`
  - `Section.capacity`
- `prisma/migrations/` existe y contiene:
  - baseline `20260524000000_baseline_existing_database`
  - migraciones incrementales posteriores (capacity, payment tx, audit log, user active)
- `prisma/seed.ts` es seed base (sin usuarios reales).
- `scripts/bootstrap-admin.ts` crea primer ADMIN real con confirmacion.
- `scripts/seed-e2e.ts` usa solo `E2E_DATABASE_URL`.
- `.env.example` esta actualizado y sin secretos.

## 5) Riesgo del baseline (punto critico)

Hallazgo confirmado (Sprint 17C):

- El baseline `20260524000000_baseline_existing_database` **incluye `Section.capacity`**.
- Existe migracion incremental `20260525142000_add_capacity_to_section` que tambien intenta agregar la columna.

Riesgo:

- En una **base vacia**, el orden baseline -> add_capacity_to_section puede fallar con:
  - `column "capacity" already exists`

Esto afecta directamente el objetivo de “onboarding desde cero” con `migrate deploy`.

## 6) Opciones evaluadas (Prisma strategy)

### Opcion A — Mantener baseline y migraciones actuales (tal cual)

**Ventajas**
- Mantiene compatibilidad con la base Supabase ya regularizada (resolvio P3005).
- Minimos cambios inmediatos.

**Riesgos**
- Onboarding “base vacia” no garantizado por duplicidad baseline vs incremental (ej. capacity).
- Riesgo de confusion para nuevos devs sobre que significa baseline.

### Opcion B — Crear migracion inicial limpia (squash / initial schema)

**Ventajas**
- Mejor experiencia para onboarding desde cero.
- `migrate deploy` en base vacia deberia ser determinista.

**Riesgos**
- Requiere plan cuidadoso para bases existentes (resolve/baseline) sin perder historial.
- Puede implicar reestructurar migraciones, y no debe hacerse sin aprobacion.

### Opcion C — Mantener baseline solo para base existente + flujo alternativo para base nueva

**Ventajas**
- No toca la base existente.
- Permite documentar dos flujos (base existente vs base nueva) sin reescribir historia inmediatamente.

**Riesgos**
- Aumenta complejidad documental/operativa.
- Si no se separa bien, puede confundir aun mas.

## 7) Estrategia recomendada (propuesta)

**Recomendacion**: adoptar una estrategia por fases:

### Fase 1 (inmediata, para integracion a main): Opcion C controlada

1. **Mantener baseline en repo por ahora** (no borrar ni mover en este sprint).
2. **Documentar claramente** que baseline existe para compatibilidad con base existente (P3005) y que puede no ser apropiado como “initial migration”.
3. Definir en onboarding dos escenarios:
   - **Base existente**: flujo actual con baseline ya resuelto/seguimiento `_prisma_migrations` (caso Supabase del proyecto).
   - **Base nueva**: requiere plan/decisiones adicionales (ver Fase 2).

Objetivo: poder integrar la rama funcional a `main` sin reescribir historia en caliente.

### Fase 2 (sprint futuro, para garantizar base nueva): Opcion B

1. Diseñar una **migracion inicial limpia** (o estrategia de “squash” controlada).
2. Decidir que hacer con baseline y migraciones duplicadas (ej. capacity):
   - mantener baseline fuera del camino de base nueva; o
   - reemplazar baseline por initial; o
   - reordenar/aplicar guards (solo si se aprueba).

**Nota**: Esta fase requiere aprobacion explicita antes de modificar migraciones.

## 8) Respuestas obligatorias (baseline, init-schema.sql, seed.sql)

1. **El baseline debe seguir en `prisma/migrations`?**
   - Por ahora: **si**, pero documentado como “compatibilidad con base existente”.
2. **Conviene moverlo fuera de migrations?**
   - No en esta fase sin plan. Posible en Fase 2.
3. **Conviene crear migracion inicial limpia?**
   - **Si**, como objetivo de Fase 2 (onboarding desde cero real).
4. **Como manejar base Supabase existente?**
   - Mantener el enfoque actual: `migrate deploy` sobre `MIGRATION_DATABASE_URL` (5432), y usar `migrate resolve` solo cuando sea estrictamente necesario (como en 17A).
5. **Como manejar base nueva desde cero?**
   - A corto plazo: no garantizarlo con baseline+incrementales; documentar limitacion.
   - A mediano plazo: crear initial migration limpia (Fase 2).
6. **Que debe pasar antes de integrar a main?**
   - PR/merge controlado, validaciones completas, y documentacion de onboarding actualizada, incluyendo advertencias baseline/legacy.

### init-schema.sql

- Estado: probablemente referencial/legacy (no se usa en scripts automáticos).
- Recomendacion: mantener solo si se documenta como referencia; en Fase 2 decidir si se archiva/mueve.

### seed.sql

- Estado: legacy (SQL editor) y puede confundir.
- Recomendacion: mantener pero marcar como “NO USAR” o mover a legacy en sprint futuro (no hacerlo ahora).

## 9) Plan de integracion controlada hacia main

Objetivo: que `main` reciba el estado funcional actual sin riesgos.

Plan:

1. Confirmar ramas base listas:
   - `feature/sprint-17b-user-password-fixes` (funcional)
   - `feature/sprint-17c-prisma-onboarding-audit` (docs/auditoria)
2. Crear PR(s) hacia `main` (sin merge directo):
   - PR 1: “Sincronizacion funcional (Prisma + seeds seguros + scripts)”
   - PR 2: “Docs onboarding y auditorias (17C/17D)”
3. En el PR de sincronizacion, asegurar que `main` reciba:
   - `prisma/schema.prisma`
   - `prisma/migrations/`
   - `prisma/seed.ts` (seed base seguro)
   - `scripts/bootstrap-admin.ts`
   - `scripts/seed-e2e.ts`
   - `scripts/run-e2e.mjs`
   - `.env.example` actualizado
   - fixes de seguridad/usuarios/contraseñas
4. Ejecutar validaciones antes de merge:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm run test:run`
   - `npm run test:integration`
   - `npm run test:e2e -- --reporter=list` (con puerto libre)
   - `npm run build`
5. Post-merge:
   - No desplegar hasta que onboarding quede documentado y se evalúe el plan de Fase 2 para base nueva.

## 10) Riesgos

- Baseline puede romper base vacia por duplicidad con incrementales.
- `seed.sql`/`init-schema.sql` pueden confundir onboarding si no se rotulan como legacy.
- Integrar features a `main` sin PR/validaciones puede reintroducir el estado desalineado.

## 11) Decisiones que requieren aprobacion del usuario

1. Iniciar Fase 2: crear una migracion inicial limpia (squash) para base nueva.
2. Definir politica final de baseline:
   - mantenerlo solo para base existente, o
   - moverlo a legacy, o
   - reemplazarlo por initial.
3. Decidir si `seed.sql` e `init-schema.sql` se marcan como “NO USAR” o se mueven a carpeta legacy (cambio de repo/documentacion).

## 12) Validaciones ejecutadas

Recomendadas para ejecutar en esta rama (no destructivas):

- `npx.cmd prisma validate`
- `npx.cmd prisma generate`
- `npm.cmd run lint`
- `npx.cmd tsc --noEmit`
- `npm.cmd run test:run`
- `npm.cmd run build`


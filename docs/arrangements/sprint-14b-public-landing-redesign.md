# Sprint 14B — Rediseño landing pública según bocetos

## Objetivo del sprint

Rediseñar la landing pública de TerraNova Academy (`/`) usando como referencia visual los bocetos entregados. El objetivo es convertir `src/app/page.tsx` en una landing institucional completa, profesional y navegable, con secciones públicas.

## Rama usada

`feature/sprint-14b-public-landing-redesign`

## Bocetos usados como referencia

Se utilizaron 4 referencias visuales principales para el diseño:
1. **Inicio:** Hero con la frase “Educación que trasciende, tecnología que conecta.”, mockup del portal y tarjetas de beneficios.
2. **Nuestra Propuesta:** Hero institucional, sección “El Modelo TerraNova”, y Valores Fundamentales.
3. **Admisiones:** Proceso de admisión en 3 pasos, formulario visual de consulta y preguntas frecuentes.
4. **Contacto:** Información directa, horario de atención, formulario de contacto y mapa.

## Estructura final de la landing

Se implementó una landing de una sola página (Single Page Application approach) con navegación por anclas para no afectar rutas existentes:
- `#inicio`
- `#propuesta`
- `#admisiones`
- `#contacto`

## Secciones implementadas

- `PublicHeader`: Cabecera con logo, enlaces internos y botón "Intranet" hacia `/login`.
- `HeroSection`: Sección inicial basada en el boceto "Inicio", con título principal y componentes visuales (`PortalMockup`).
- `BenefitsSection`: Tarjetas con iconos detallando la Plataforma, Niveles e Innovación Tecnológica.
- `ExcellenceSection`: Bloque visual de excelencia educativa.
- `ProposalSection`: Sección con la filosofía "Forjando el futuro...", El Modelo TerraNova y los valores institucionales (diseño basado en los bocetos).
- `AdmissionsSection`: Proceso de admisión, preguntas frecuentes y formulario visual de contacto.
- `ContactSection`: Información directa, horarios, y formulario visual con mapa isométrico simulado.
- `PublicFooter`: Pie de página oscuro con enlaces rápidos e información legal.

## Archivos modificados

- `src/app/page.tsx`: Reescritura completa agregando las nuevas secciones y la navegación por anclas.
- `docs/arrangements/sprint-14b-public-landing-redesign.md`: Este documento.

## Decisiones de diseño

- **Navegación:** Se optó por una landing de una sola página con scroll por anclas para no crear nuevas rutas de App Router en este sprint.
- **Tipografía y Estilos:** Se respetaron los colores verde institucional (Emerald en Tailwind) y oscuros (Slate) para los fondos.
- **Botón Intranet:** Se enlazó a `/login` sin modificar en lo absoluto la estructura o el flujo de autenticación, asegurando el acceso de los usuarios existentes.
- **Responsive:** Se usaron grillas (`grid-cols`) y flexbox (`flex-wrap`, `md:flex`) para garantizar adaptabilidad móvil y de escritorio.
- **Formularios:** Quedaron con tipo visual (`type="button"`) y sin acciones de servidor ni peticiones a Prisma para cumplir los requisitos de solo enfocarse en el rediseño frontend.
- **Imágenes:** Se usaron elementos CSS e iconos de `lucide-react` para recrear las interfaces o secciones de imágenes, sin usar URLs externas como fue indicado.

## Qué quedó visual solamente

- Los formularios de la sección `#admisiones` y `#contacto`.
- El mapa isométrico en la sección de contacto (implementado con `linear-gradient`).
- El `PortalMockup` de la sección heroico, que no carga datos reales.

## Qué quedó pendiente

- En un sprint futuro de CMS / Frontend público, se podrán conectar los formularios de contacto con un endpoint backend o servicio de correos como Resend.
- Eventualmente dividir la landing en múltiples páginas si el SEO lo demanda tras las pruebas E2E.

## Validaciones ejecutadas

| Comando | Estado |
|---|---|
| `npm.cmd run lint` | Exitoso |
| `npx.cmd tsc --noEmit` | Exitoso |
| `npm.cmd run test:run` | Exitoso |
| `npm.cmd run test:integration` | Exitoso |
| `npm.cmd run test:coverage` | Exitoso |
| `npm.cmd run build` | Exitoso |

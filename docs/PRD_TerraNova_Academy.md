# Documento de Definición de Producto y Especificación Técnica (PRD)
**Proyecto:** TerraNova Academy
**Versión:** 1.0.0
**Rol Objetivo:** Software Architecture & Product Management

---

## 1. Visión del Producto

### ¿Qué problemática resuelve?
Las instituciones educativas modernas (particularmente en Latinoamérica) sufren de una ineficiencia administrativa crónica provocada por la fragmentación tecnológica. La información de los estudiantes se dispersa: los pagos viven en Excel, la asistencia en hojas físicas de los docentes, las notas en sistemas arcaicos desconectados, y el registro conductual (incidencias) en cuadernos físicos de coordinación. Esto genera pérdida de historial a largo plazo, altísimos márgenes de error en la cobranza, falta de control real en la morosidad y un desgaste abrumador para el personal que debe consolidar reportes a mano para los padres de familia.

### ¿Cómo lo hace?
**TerraNova Academy** aborda esta fricción mediante la centralización operativa en un *Dashboard ERP (Enterprise Resource Planning)* multicapa en la nube. Conecta y cruza en tiempo real todos los dominios escolares (Matrículas, Notas, Pagos, Asistencia e Incidencias). Al registrar un pago, automáticamente se levanta el bloqueo financiero; al registrar faltas reiteradas, se activa la alerta en coordinación. Toda interacción muta el estado del alumno de forma sincronizada y segura.

### ¿Cuál es su fin?
El propósito cardinal del sistema es **modernizar la gestión escolar mediante trazabilidad absoluta** (académica y financiera), agilizando el trabajo del personal administrativo y docente. TerraNova permite que la institución destine menos tiempo al papeleo y consolidación de datos, mitigando pérdidas por morosidad no detectada, y garantizando un historial inmutable del ciclo de vida del estudiante dentro del colegio.

---

## 2. Requisitos Funcionales (Granularidad Alta)

A continuación, se listan **38 requisitos funcionales** estrictamente granulares y uniatómicos que componen la espina dorsal funcional del sistema:

**🛡️ Autenticación y Seguridad**
*   **RF-01:** El sistema debe permitir el inicio de sesión mediante credenciales verificadas (email y contraseña).
*   **RF-02:** El sistema debe proteger las rutas internas del dashboard validando la existencia de una sesión activa (Middleware de Autenticación).
*   **RF-03:** El sistema debe restringir el acceso a módulos específicos y acciones destructivas evaluando el rol del usuario autenticado (ej. Administrador, Recepción, Docente).

**🎓 Gestión de Estudiantes (Matrículas y Perfiles)**
*   **RF-04:** El sistema debe permitir la creación de un nuevo perfil de estudiante alojando sus datos personales (DNI, nombres, género, fecha de nacimiento).
*   **RF-05:** El sistema debe permitir la carga asíncrona de la fotografía de perfil del estudiante, previsualizándola y limitando el tamaño del archivo a 10MB.
*   **RF-06:** El sistema debe permitir asociar los perfiles de uno o múltiples apoderados al perfil de un estudiante.
*   **RF-07:** El sistema debe permitir marcar y gestionar a un apoderado específico como el "contacto principal" del estudiante.
*   **RF-08:** El sistema debe proveer un proceso guiado (wizard modular de 3 pasos) para matricular a un estudiante inactivo en un año escolar activo.
*   **RF-09:** El sistema debe bloquear y deshabilitar la interacción de matriculación para las secciones cuyo aforo límite alcance o supere su capacidad máxima definida.
*   **RF-10:** El sistema debe consolidar en una sola vista de "Perfil" todo el historial transaccional del estudiante (notas, pagos, asistencias, incidencias).

**🏫 Gestión Académica (Grados y Secciones)**
*   **RF-11:** El sistema debe permitir configurar niveles académicos jerárquicos de la institución (Inicial, Primaria, Secundaria).
*   **RF-12:** El sistema debe permitir asociar secciones o "aulas" (ej. "A", "B", "C") pertenecientes a un grado académico específico.
*   **RF-13:** El sistema debe requerir que se defina la variable límite de "Capacidad Numérica Máxima" en la creación de una sección.
*   **RF-14:** El sistema debe calcular y mostrar matemáticamente la disponibilidad de vacantes (Capacidad - Ocupados) en tiempo real al explorar las secciones.
*   **RF-15:** El sistema debe permitir asociar la malla de cursos (currícula) impartidos en un grado académico.

**📊 Evaluación Académica (Notas)**
*   **RF-16:** El sistema debe proveer una cuadrícula interactiva (Grid Pivot Table) para el ingreso rápido y masivo de calificaciones por alumno, curso y periodo.
*   **RF-17:** El sistema debe automatizar el cálculo del promedio final anual del estudiante y del curso en función a las notas ingresadas por periodo (P1, P2, P3, P4).
*   **RF-18:** El sistema debe presentar indicadores visuales (alertas o colores de celda) al detectar una calificación desaprobatoria temporal o permanente.
*   **RF-19:** El sistema debe generar y permitir la previsualización individual de la Boleta de Notas y el historial académico estructurado del estudiante matriculado.

**📅 Control de Asistencia**
*   **RF-20:** El sistema debe permitir el registro masivo por sección del estado de asistencia diario (Presente, Ausente, Tardanza, Justificado).
*   **RF-21:** El sistema debe presentar el historial estadístico individual e inmutable de la asistencia del estudiante a través de un componente de Calendario.
*   **RF-22:** El sistema debe calcular dinámicamente el porcentaje acumulado (Tasa General) de ausencias basado en los días lectivos hábiles.
*   **RF-23:** El sistema debe levantar alertas visuales automáticas (tipo semáforo) para directivos cuando un estudiante exceda el umbral crónico tolerado de faltas en el mes.

**💰 Gestión Financiera (Pagos)**
*   **RF-24:** El sistema debe generar automáticamente de forma asíncrona todo el cronograma anual de cuotas (obligaciones de pago) cuando una matrícula es exitosamente confirmada en el Wizard.
*   **RF-25:** El sistema debe permitir al usuario administrativo registrar pagos de manera parcial, deduciendo la deuda pendiente de la cuota seleccionada.
*   **RF-26:** El sistema debe liquidar y cerrar la cuota (Estado: PAGADO) si se registra el pago total o el monto cubre completamente lo adeudado.
*   **RF-27:** El sistema debe mutar periódicamente el estado de las obligaciones financieras pendientes a "VENCIDO" si sobrepasan la fecha de vencimiento configurada previamente y no presentan su cancelación.
*   **RF-28:** El sistema debe proveer un modal detallado que renderice virtualmente el "Comprobante/Recibo Físico" del pago procesado para consulta inmediata.
*   **RF-29:** El sistema debe agrupar todas las finanzas para proyectar resúmenes consolidados y estadísticas globales de ingresos frente a carteras morosas (deuda no recuperada).

**⚖️ Gestión Conductual (Incidencias e Inhabilitaciones)**
*   **RF-30:** El sistema debe disponer de un formulario para asentar oficialmente una incidencia conductual del estudiante en la bitácora escolar.
*   **RF-31:** El sistema debe requerir que cada incidencia sea categorizada obligatoriamente como "LEVE", "MODERADO" o "GRAVE".
*   **RF-32:** El sistema debe habilitar el registro de las intervenciones, actas o medidas correctivas dictadas tras producirse la incidencia descrita.
*   **RF-33:** El sistema debe permitir registrar explícitamente y fundamentar en acta digital un proceso de "Inhabilitación Académica" del alumno.
*   **RF-34:** El sistema debe reflejar la consecuencia inmediata de la Inhabilitación impidiendo acciones a nivel visual sobre dicho estudiante mediante cambios en su "Badge de Status".

**📑 Exportaciones y Reportes (Interoperabilidad)**
*   **RF-35:** El sistema debe exponer un motor para procesar y exportar a formato Excel estandarizado la recopilación de todas las notas de alumnos por sección y periodo.
*   **RF-36:** El sistema debe exportar a formato de Excel matricial el informe consolidado mensual de inasistencias de un aula en particular.
*   **RF-37:** El sistema debe descargar una hoja de balances financieros en formato Excel (ingresos operativos versus deficiencias de liquidez por pensión) para usos contables de la gerencia año tras año.
*   **RF-38:** El sistema debe implementar globalmente una barra de búsqueda predictiva utilizando técnicas de optimización (debounce request) para filtrar y seleccionar estudiantes por Nombre y DNI instantáneamente sin saturar la red.

---

## 3. Historias de Usuario Principales (User Stories)

> **Formato:** *Como [Rol], quiero [Acción] para [Beneficio]*

1. **US-01 / Matriculación Centralizada**
   - **Como** Recepcionista o Secretaria, **quiero** usar un asistente estructurado para enlazar a un estudiante inactivo con su respectiva sección académica, **para** que se emita instantáneamente la matriz de sus 10 obligaciones de pago sin tener que hacerlo a mano.
   - *Criterios de Aceptación:* El sistema bloquea el avance al paso 2 si no se busca y selecciona un alumno. El sistema restringe la selección si el aforo sobrepasó su límite numérico (capacidad cubierta).

2. **US-02 / Registro Ágil de Notas**
   - **Como** Docente Coordinador, **quiero** visualizar el listado de mis 30 alumnos bajo un formato de hoja de cálculo (grid), **para** transcribir rápidamente e insertar las calificaciones del mes evitando abrir formularios por cada estudiante independientemente.
   - *Criterios de Aceptación:* El Guardar se realiza en lotes (batch mutation). La grilla calcula inmediatamente el promedio modificado tras cambiar un valor en la interfaz antes incluso de recargar las mutaciones de Server Action al final del flujo.

3. **US-03 / Reporte Financiero de Morosidad**
   - **Como** Directora o Gerente de Administración, **quiero** poder detectar rápidamente a través de la UI del dashboard el consolidado acumulado de cuotas "Vencidas" frente a lo "Pagado", **para** tomar acciones proactivas sobre la falta de liquidez del colegio o iniciar bloqueos/comunicaciones.
   - *Criterios de Aceptación:* Uso de métricas procesables con SQL en backend (Date Truc, Sumatorias por Status). Ninguna data personal de los agentes debe exponerse allí directamente. Carga asincrónica (sin bloquear la UI).

4. **US-04 / Pase Rápido de Asistencia**
   - **Como** Auxiliar, **quiero** seleccionar una sección, recibir la nómina completa del día y marcar botones booleanos, **para** asentar los registros de asistencia en menos de 2 minutos después del toque de campana.
   - *Criterios de Aceptación:* Por defecto todas las nóminas inician preconfiguradas en "Presente" a no ser que se marquen activamente en la UI como Tardanzas u Ausencias. Modificable el mismo día (Upsert).

5. **US-05 / Alerta Crítica de Condición Hábito-Conductual**
   - **Como** Coordinador Académico, **quiero** poder asentar de manera irrevocable que un estudiante agredió física o verbalmente dentro del colegio etiquetándolo como Incidencia "GRAVE", **para** tener evidencia trazable ante una posible expulsión avalada del estudiante.
   - *Criterios de Aceptación:* Requiere proveer obligatoriamente una fecha de incidente. Toda alerta grave queda inserta en el perfil (ProfileIncidentsTab) imposibilitando que el antecedente se elimine al iniciar un nuevo ciclo escolar.

6. **US-06 / Restricción por Inhabilitación**
   - **Como** Promotor Escolar, **quiero** modificar el status de Matrícula de un estudiante regular a "Inhabilitado", **para** congelar y vetar temporalmente los procesos académicos asociados al infractor (ya sea falta de pago crítico, actas de disciplina extremas, etc).
   - *Criterios de Aceptación:* Un usuario matriculado puede ser transmutado a la fuerza en Inhabilitado por disciplina e inhabilitado permanentemente.

7. **US-07 / Generación Recibos Operacionales Verificados**
   - **Como** Padre de familia/Cajero Administrativo, **quiero** consultar el estado de cuenta inmutable final y abrir un comprobante del pago registrado parcial o completo, **para** ratificar y compartir la constancia con una firma electrónica ante aclaraciones.
   - *Criterios de Aceptación:* Modal de Recibos provisto de detalle de fechas de emisión, montos deducidos y monto total. 

8. **US-08 / Descarga Excel de Notas (Interoperabilidad MINEDU/SIAGIE)**
   - **Como** Directora o Secretaria, **quiero** presionar un botón para extraer la data completa de calificaciones trimestrales convertida en Excel estandarizado, **para** luego utilizar esa sábana e importar directamente los valores en la plataforma macro del Estado si así lo demando.
   - *Criterios de Aceptación:* Documento Excel generado en base 64 y forzado hacia stream de descarga en navegador sin almacenar ficheros basura en el disco del servidor AppRouter. 

9. **US-09 / Perfil 360° Omnicanal**
   - **Como** Director o Tutor, **quiero** buscar el DNI del alumno y percibir de un plumazo sus deudas presentes, sus inasistencias acumuladas y su tutor de contacto principal, **para** contactarme telefónicamente en directo si ocurre una urgencia sin brincar a través de 6 ventanas del ERp.
   - *Criterios de Aceptación:* Vista con Tabs que englobe: Identidad, Apoderados, Notas, Asistencia, Finanzas e Historial Disciplinar, procesado con `Promise.all` e infiriendo `Prisma.PromiseReturnType`.

10. **US-10 / Optimización con Debounce Search**
    - **Como** Trabajador de Recepción y Admisiones, **quiero** usar la barra de búsqueda que va localizando al alumno con mis pulsaciones en el DNI **para** encontrarlo instantáneamente, ahorrando micro-tareas repetitivas en colas presenciales de padres con reclamos diarios.
    - *Criterios de Aceptación:* Se aplica un Debounce de 500ms antes de disparar las llamadas por red HTTP `searchStudentsForPayment` para proteger el Backend.

11. **US-11 / Registro Fotográfico Optimizante**
    - **Como** Encargada de Identidad del Colegio, **quiero** que al crear desde 0 la ficha matricial de un nuevo postulante yo pueda subirle allí mismo la fotografía que extraigo de mi sistema, **para** generar avatares y documentos ricos contextualmente sin usar placeholders por defecto.
    - *Criterios de Aceptación:* Manejado localmente como un `FormData`. Uso extensivo de las optimizaciones gráficas del SDK de Supabase Storage. Límite local pre-validatido a tamaño 10MB en Javascript impidiendo fallo abrupto.

12. **US-12 / Control Parcial o Desdoblamiento Financiero**
    - **Como** Administrador Económico Operacional, **quiero** procesar liquidaciones de los padres por depósitos bancarios divididos en partes de su cuota real asignada, **para** que el Dashboard mantenga el saldo real pendiente de aquella pensión evitando cálculos manuales por cobrar.
    - *Criterios de Aceptación:* Estado de obligación transita de Pendiente a Pendiente reduciendo su Payload o a estado Pagado si el Payment Partial se equipara.

---

## 4. Stack Tecnológico (Tech Stack)

La infraestructura general sigue modernas convenciones de la web modular y escalable para preservar el Time-To-Market corto con estrictos tipajes, basando su solidez en React + Node:

*   **⚡ Framework Core:** `Next.js 14/15` (App Router). Explotando extensamente los SSR (Server-Side Rendering) y layouts anidados para un ruteo relámpago, dividiendo lógicamente los archivos por domino de negocios (carpetas de Módulos `/src/components/modules`).
*   **🛠️ Lenguaje Principal:** `TypeScript`. Impone verificación estática y evita toda mutación no declarada mediante tipado riguroso de objetos, mitigando crasheos in-vivo.
*   **🎨 Estilos y UI:**
    *   `Tailwind CSS`: Utility-first en línea (cero pesados archivos styles tradicionales).
    *   `shadcn/ui`: Adopción de componentes reutilizables extraídos por bloque, controlando la accesibilidad a nivel de la interfaz (Radix UI subyacente).
    *   `Lucide Icons`: Sistema unificado y dinámico de SVG Iconography.
*   **🔒 Validaciones y Formularios:** `react-hook-form` administrando las transacciones de contexto UI sumado a integraciones con el engine de schemas asíncronos en `Zod` (en la capa de mutación antes de chocar con la base SQL).
*   **📦 Base de Datos y ORM:** 
    *   `Prisma ORM`: Modelador de esquema, migrator y Object Relational Mapper tipo seguro, controlando las conexiones en paralelo (resolviendo queries N+1 y haciendo batch operacionales transaccionales).
    *   `PostgreSQL`: Motor de BBDD relacional, configurado usualmente bajo la plataforma de DaaS (Supabase Postgres o Neon DB).
*   **🏗️ Paradigma de Arquitectura Interno:** Extenso uso arquitectónico de **Server Actions** ejecutándose bajo funciones puente invisibles sin requerir enjambres pesados de `app/api/.../route.ts` REST puras, agilizando enormemente el puente de red e impidiendo ataques CSRF. Custom Hooks por módulo encapsulando control de ciclo vital en cliente `(\_components y hooks)`.

---

## 5. Esquema y Relaciones de Datos (Core ER Diagram Spec)

El modelo de datos implementa una estrategia canónica jerárquica con dependencias fuertes (Delete en cascada/Restricts), donde la Entidad `Enrollment` (Matrícula) funciona como pivote transaccional masivo de historiales.

**🔹 Entidades Base Estáticas**
1.  **`User`**: Operatividad del Personal del colegio.
    *   *Maneja:* Email, Password_Hash, Rol administrativo (ADMIN, DOCENTE, COORDINADOR).
2.  **`AcademicYear`**: Año de operaciones o ejercicio (ej. "2024", "2025"). (Relación principal de inicio y fechas tope).
3.  **`GradeLevel`** & **`Section`**: Niveles Macro (Primaria/Secundaria) y divisiones Micro estáticas ("1ro A"). 
    *   *Contiene:* Aforos numéricos duros (`capacity`), y su carga ocupada. Relación de jerarquía `1:N` (1 Nivel dispone de N Secciones concurrentes).
4.  **`Course`**: Clases, Mallas curriculares que serán acopladas a Grados específicos.

**🔹 Entidades "Humanas" (Personal Identificativo)**
5.  **`Student`**: Entidad maestra biológica. 
    *   *Atributos únicos:* UUID generados, DNI (unique), status vital/histórico, PhotoURL en la Nube, Dates.
6.  **`Guardian`**: Apoderados (Relación N:N abstractamente implementada). Un Guardian (Madre) engloba a 2 Students y 1 Student posee vinculación hacia un Padre y una Madre. Requieren flag booleano `isPrimary`.

**🔹 El Núcleo de Trazabilidad: `Enrollment` (Matrícula)**
7.  **`Enrollment`**: Entidad Pivote Transaccional Fuerte. Relaciona inherentemente `1` estudiante (`Student`), bajo `1` sección de clase (`Section`) dentro una ventana temporal de `1` ciclo (`AcademicYear`).
    *   Posee Foreign Keys (Claves foráneas) hacia las 3 entidades superiores, y expone su propio UID como base subyacente de la que dependerán todas las métricas fluctuantes.

**🔹 Entidades Fluctuantes o Satélites de Consecuencia (Dependientes del Pivot Enrollment)**
8.  **`Payment`**: Tabla vinculada restrictivamente a la Matrícula. Controla cuotas de cobros (`amount`, `dueDate`, `statusENUM`). Relación directa de Matrícula (1:`N` Cuotas).
9.  **`Attendance`**: El registro condicional del día. Asociado a la Matrícula e interconectado a una entidad satélite paralela llamada genéricamente `CalendarEvent` que dicta la globalidad del día hábil.
10. **`Grade`**: Tabla compuesta de Intersección. Depende lógicamente de un `Enrollment`, intersectado con el conocimiento del `Course` a un `Period` discreto de revisión evaluativa (P1/P2/P3...).
11. **`Incident` & `Disability`**: Entidades auditoras separadas de comportamiento (Conducta) y limitación de derechos (Morosidad Inhabilitada) enroscadas en cadena temporal al `Enrollment` vigente permitiéndole una traza insobornable por si los alumnos repitieran cursos o volvieran del traslado.

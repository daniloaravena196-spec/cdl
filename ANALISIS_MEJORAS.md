# Análisis de mejoras para CDL (Calendario de Días Libres)

## Resumen ejecutivo

El proyecto está muy bien encaminado en UX visual, funcionalidades clave (login, roles, sincronización en tiempo real, exportación PDF/WhatsApp) y soporte móvil. Aun así, hay oportunidades claras para **subir robustez, seguridad, mantenibilidad y escalabilidad**.

Prioridad sugerida:
1. Seguridad de acceso y reglas de datos.
2. Modularización del código (CSS/JS) y eliminación de lógica acoplada.
3. Accesibilidad y calidad de interacción multi-dispositivo.
4. Estrategia de errores, observabilidad y pruebas automáticas.
5. Rendimiento y consistencia de datos en escenarios concurrentes.

---

## 1) Seguridad y control de acceso (prioridad alta)

### 1.1 Rol de admin hardcodeado por email
Actualmente el admin depende de comparar contra un email fijo (`ADMIN_EMAIL`). Esto es frágil y poco escalable.

**Mejora**
- Definir roles en backend (custom claims de Firebase Auth o colección `users/{uid}` con rol firmado por reglas).
- Validar permisos desde reglas de Firestore y no solo desde UI.

### 1.2 Protección insuficiente solo en frontend
El frontend oculta botones y evita acciones para supervisor, pero eso **no reemplaza** reglas de seguridad en Firestore.

**Mejora**
- Reglas Firestore estrictas:
  - Admin: write/read en `calendars/*`.
  - Supervisor: solo read.
- Documentar las reglas y versionarlas.

### 1.3 Exposición de configuración Firebase en cliente
La config pública no es un problema por sí sola en Firebase, pero sin reglas sólidas aumenta riesgo de abuso.

**Mejora**
- Verificar App Check.
- Limitar dominios autorizados y endurecer reglas.

---

## 2) Arquitectura y mantenibilidad (prioridad alta)

### 2.1 Archivo monolítico (HTML+CSS+JS masivo)
Todo está en un solo documento, lo que dificulta mantenimiento, revisión y testeo.

**Mejora**
- Separar en módulos:
  - `styles/` (base, layout, components, responsive).
  - `scripts/` (`auth.js`, `store.js`, `scheduler.js`, `ui.js`, `export.js`, `touch.js`).
- Definir un patrón de estado central (store simple o reducer).

### 2.2 Alta mezcla de lógica de negocio con render
La generación de turnos, mutaciones y render se entremezclan con eventos DOM.

**Mejora**
- Crear capa “core” pura (sin DOM) para:
  - reglas de asignación,
  - validaciones,
  - operaciones de mover/agregar/quitar.
- Dejar la UI solo como adaptador.

### 2.3 Uso extenso de `window.*` y handlers inline `onclick`
Hace difícil rastrear dependencias y aumenta acoplamiento.

**Mejora**
- Migrar a `addEventListener` centralizado.
- Evitar handlers inline en HTML.

---

## 3) Integridad de datos y concurrencia (prioridad alta)

### 3.1 Escrituras de documento completo
Se sobrescribe estado completo del mes (`workers`, `schedJson`) con `setDoc`.

**Riesgo**
- Si dos admins editan casi al mismo tiempo, puede haber pérdida de cambios.

**Mejora**
- Usar transacciones o estrategia de merge por operaciones.
- Guardar `updatedAt` + `updatedBy` + versión incremental para detectar conflictos.

### 3.2 Modelo de `schedJson` serializado
Se serializa JSON por limitación de claves con guion.

**Mejora**
- Cambiar modelo de datos:
  - `days: { "1": ["Ana","Luis"], ... }` o
  - subcolección `calendars/{month}/days/{day}`.
- Evitar parse/stringify manual y errores silenciosos.

### 3.3 Dependencia del nombre como identificador
`name` se usa como key lógica para asignaciones.

**Riesgo**
- Cambios de nombre o duplicados generan inconsistencias.

**Mejora**
- Introducir `workerId` estable (UUID).
- Mostrar nombre como atributo editable, no como PK.

---

## 4) Algoritmo de planificación (prioridad media-alta)

### 4.1 Asignación aleatoria con reintentos
`assignBlocks` usa intentos aleatorios (hasta 10k). Funciona para casos pequeños, pero no garantiza óptimo/justicia.

**Mejora**
- Implementar algoritmo determinista con backtracking ligero o heurística por carga diaria.
- Añadir “seed” para reproducibilidad (útil para depurar y comparar resultados).

### 4.2 Falta de reglas avanzadas de negocio
Actualmente solo considera máximo por día y bloques de 2.

**Mejora**
- Reglas opcionales:
  - evitar fines de semana consecutivos por persona,
  - balance semanal,
  - preferencias/indisponibilidades,
  - límites por antigüedad/rol.

---

## 5) UX y accesibilidad (prioridad media)

### 5.1 Accesibilidad de teclado y lectores
Muchos elementos interactivos dependen de mouse/touch (drag, doble clic, long press).

**Mejora**
- Soporte full teclado:
  - foco visible consistente,
  - acciones equivalentes con teclado,
  - ARIA labels para botones icónicos.
- Revisar contraste real (WCAG AA) en estados secundarios.

### 5.2 Feedback y estados de carga
Hay buen uso de toast/splash, pero faltan estados más “accionables”.

**Mejora**
- Mensajes de error con causa + acción sugerida.
- Distinción clara entre:
  - guardado local pendiente,
  - sincronizado remoto,
  - conflicto detectado.

### 5.3 Dependencia de doble clic para eliminar en desktop
El doble clic no siempre es obvio.

**Mejora**
- Añadir icono o menú contextual también en desktop.

---

## 6) Rendimiento (prioridad media)

### 6.1 Re-render global frecuente
En muchas acciones se rehace gran parte de la UI completa.

**Mejora**
- Render incremental por sección afectada.
- Memoización de búsquedas repetidas (`workers.find(...)` en loops).

### 6.2 Recursos externos sin estrategia de resiliencia
Fonts, Firebase y jsPDF cargan desde CDN.

**Mejora**
- `preconnect`/`dns-prefetch` para dominios externos.
- Manejo de fallback si jsPDF no carga.

---

## 7) Calidad, pruebas y observabilidad (prioridad alta)

### 7.1 Sin suite de pruebas
No hay validación automática visible de reglas críticas.

**Mejora**
- Tests unitarios para:
  - `assignBlocks`,
  - `addDay/moveDay/rmDay`,
  - validaciones de límite por día.
- Tests de integración para roles y sincronización.

### 7.2 Falta de linting/formateo automatizado
**Mejora**
- Añadir ESLint + Prettier + Stylelint.
- Hooks de pre-commit.

### 7.3 Observabilidad mínima
`console.*` ayuda, pero no alcanza producción.

**Mejora**
- Logging estructurado + métricas básicas:
  - fallos de auth,
  - fallos de sync,
  - tiempos de render/export.

---

## 8) Exportación PDF / WhatsApp (prioridad media)

### 8.1 Lógica densa en una sola función
`buildPDFDoc` es grande y difícil de mantener.

**Mejora**
- Dividir en utilidades:
  - `drawHeader`, `drawCalendarGrid`, `drawSummaryTable`, etc.

### 8.2 Compartir archivo depende de capacidades del navegador
Está bien resuelto con fallback a texto, pero conviene mayor claridad al usuario.

**Mejora**
- Informar explícitamente cuando se comparte solo texto y no adjunto PDF.

---

## 9) Roadmap recomendado (rápido y pragmático)

### Sprint 1 (impacto inmediato)
- Reglas Firestore por rol + migración de rol hardcodeado.
- Refactor mínimo a módulos JS (`auth/store/scheduler/ui`).
- Tests unitarios del motor de asignación y operaciones de calendario.

### Sprint 2
- Modelo de datos con IDs estables por trabajador.
- Manejo de conflictos y versiones de documento.
- Mejoras de accesibilidad (teclado/ARIA).

### Sprint 3
- Render incremental + optimizaciones.
- Export PDF modular y cobertura de pruebas E2E básicas.

---

## Conclusión

El proyecto ya está **muy bien logrado en experiencia de uso y funcionalidad**. Lo que más le falta “pulir” para nivel producción robusta es: **seguridad real por reglas, arquitectura modular, integridad de datos concurrentes y pruebas automatizadas**. Con esos cuatro frentes, CDL pasaría de una app funcional a una plataforma sólida y mantenible.

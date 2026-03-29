# CDL React (migración inicial)

Esta base migra el proyecto monolítico a React + TypeScript con enfoque en:

- separación por módulos (`core`, `components`, `state`),
- motor de planificación desacoplado del DOM,
- validaciones explícitas de reglas,
- soporte de roles en UI (`admin` / `supervisor`),
- pruebas unitarias del scheduler.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run test`

## Qué está implementado de las mejoras

1. **Arquitectura modular**: división por capas.
2. **Motor testeable**: `generateSchedule` y `moveAssignment` en `core/`.
3. **Validación de integridad**: límites por día y cumplimiento por trabajador.
4. **Base para escalado**: proyecto React/Vite listo para continuar con Firebase, reglas y exportaciones.

## Próximos pasos recomendados

- Integrar Firebase Auth + Firestore con reglas por rol en backend.
- Añadir accesibilidad avanzada (atajos de teclado, ARIA completa, foco dirigido).
- Migrar exportaciones PDF/WhatsApp como módulo independiente.
- Añadir tests de integración (UI + persistencia).

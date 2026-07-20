# Mission: Operar y evolucionar nuestro sistema de entrega

## Why

Poder llevar cambios desde una necesidad real hasta producción de forma segura y frecuente, sin depender del agente para entender el pipeline, diagnosticar una falla o recuperar el servicio. Usar ese entendimiento para diseñar y evolucionar un SDLC que siga funcionando cuando participe un equipo.

## Success looks like

- Explicar el recorrido completo desde GitHub Issue hasta producción y qué evidencia exige cada gate.
- Diagnosticar una corrida fallida, identificar el stage responsable y decidir si corregir, detener o recuperar.
- Desplegar y hacer rollback promoviendo artefactos inmutables sin recompilar.
- Diseñar cambios al SDLC evaluando feedback, estabilidad, throughput y complejidad.
- Usar métricas DORA para detectar el próximo cuello de botella sin convertirlas en objetivos vacíos.

## Constraints

- El sistema real de este repositorio es el laboratorio de aprendizaje.
- Frontend estático en TypeScript; GitHub Actions y Vercel Hobby.
- Sin dependencias pagas para el flujo base.
- Commits atómicos con Conventional Commits y scope obligatorio.
- Explicaciones en español mediante artefactos HTML visuales e interactivos.

## Out of scope

- Backend, bases de datos y migraciones hasta que el producto los necesite.
- Kubernetes o infraestructura distribuida por anticipado.
- Ceremonias de proceso que no produzcan feedback ejecutable.

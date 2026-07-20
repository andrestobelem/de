# CI/CD y ciclo de desarrollo — Recursos

## Knowledge

- [The Deployment Pipeline — Dave Farley (2007)](https://continuousdelivery.com/wp-content/uploads/2010/01/The-Deployment-Pipeline-by-Dave-Farley-2007.pdf)
  Fuente primaria del modelo de pipeline: cada cambio es un candidato, los gates agregan evidencia y el artefacto se promueve sin recompilar. Usar como fundamento del mapa completo.
- [Deployment Pipeline Patterns — Continuous Delivery](https://continuousdelivery.com/implementing/patterns/)
  Patrones mantenidos por la comunidad de Continuous Delivery. Usar para build único, promoción y diseño de stages.
- [Continuous Integration — Continuous Delivery](https://continuousdelivery.com/foundations/continuous-integration/)
  Define integración frecuente, cambios pequeños, tests automáticos y reparación inmediata de `main`. Usar para evaluar nuestra práctica de integración.
- [Workflow artifacts — GitHub Docs](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
  Referencia oficial para transportar outputs entre jobs. Usar al razonar sobre `release.tgz`, retención e inmutabilidad.
- [Deployments and environments — GitHub Docs](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments)
  Controles oficiales para ambientes, secretos y protection rules. Usar al endurecer staging/production.
- [Vercel CLI: deploy](https://vercel.com/docs/cli/deploy) y [promote](https://vercel.com/docs/cli/promote)
  Contratos oficiales de `--prebuilt` y promoción de un deployment existente. Usar para implementar preview → production sin rebuild.
- [DORA software delivery performance metrics](https://dora.dev/guides/dora-metrics/)
  Definiciones oficiales de throughput e instability. Usar para evaluar el sistema después de tener datos reales.
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  Especificación del formato que el repositorio exige con scope. Usar para mantener historia navegable y automatizable.
- [Playwright: web server](https://playwright.dev/docs/test-webserver)
  Referencia oficial del seam de navegador que prueba el artefacto servido por HTTP. Usar para acceptance y smoke tests.

## Wisdom (Communities)

- [Continuous Delivery Foundation](https://cd.foundation/community/)
  Comunidad centrada en prácticas y tooling de entrega. Usar para contrastar decisiones operativas con experiencias de otros equipos.
- [Vercel Community](https://community.vercel.com/)
  Foro oficial para límites, incidentes y comportamiento real de la plataforma. Usar cuando la documentación no explique un problema de deployment.

## Gaps

- Todavía no conocemos tamaño del equipo, frecuencia objetivo ni tolerancia al riesgo; no corresponde fijar gates humanos o SLOs hasta tener ese contexto.
- Falta una línea base de uso real y métricas de entrega; primero debemos observar varias entregas y al menos un recovery drill.

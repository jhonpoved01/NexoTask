# Calidad y seguridad local de NexoTask

## Objetivo

NexoTask utiliza un flujo de calidad equivalente al empleado en Orion, adaptado a JavaScript, npm workspaces y Vite. El objetivo es detectar defectos, regresiones, problemas de mantenibilidad y dependencias vulnerables antes de integrar cambios.

## Matriz de equivalencias

| Orion | NexoTask | Función |
| --- | --- | --- |
| Checkstyle | ESLint | Calidad y reglas de código |
| SpotBugs | SonarJS | Posibles errores y mantenibilidad |
| JUnit | Vitest | Pruebas automatizadas |
| Semgrep | Semgrep, pendiente de CI | Seguridad estática |
| Maven Verify | `npm run verify` | Quality Gate local |

## Herramientas activas

- ESLint con configuración plana.
- Reglas recomendadas de ESLint.
- SonarJS.
- Vitest en entorno Node.
- Cobertura V8.
- Madge para ciclos.
- `npm audit` con severidad alta.
- Build de producción con Vite.
- `npm run verify` como verificación integral.

## Herramientas pendientes

- Semgrep.
- GitHub Actions.
- SonarCloud o SonarQube.
- Pruebas automatizadas de interfaz.
- Pruebas automatizadas de accesibilidad.
- Quality Gate definitivo de cobertura.

No existe todavía un umbral global de cobertura. La cobertura inicial se limita a `filtros.js`, `ordenamiento.js` y `http.js`, que son los módulos incluidos en esta fase.

## Comandos

Desde la raíz del monorepo:

```bash
npm run lint
npm run lint:fix
npm run test
npm run test:coverage
npm run lint:cycles
npm run security:audit
npm run build
npm run verify
```

- `lint`: analiza el workspace frontend sin modificar archivos.
- `lint:fix`: aplica correcciones automáticas de ESLint. El resultado debe revisarse.
- `test`: ejecuta Vitest una sola vez desde la raíz.
- `test:coverage`: ejecuta pruebas y genera `frontend/coverage/`.
- `lint:cycles`: detecta dependencias circulares en `frontend/src`.
- `security:audit`: falla ante vulnerabilidades altas o críticas.
- `build`: delega en `build:frontend`.
- `verify`: ejecuta lint, pruebas, ciclos, audit y build en ese orden.

Desde `frontend/` también están disponibles:

```bash
npm run lint
npm run lint:fix
npm run test
npm run test:run
npm run test:coverage
```

En `frontend/`, `npm run test` es interactivo; el comando raíz usa `test:run` para que el Quality Gate siempre finalice.

## ESLint y SonarJS

Los errores de sintaxis, variables no utilizadas, comparaciones no estrictas, código inalcanzable, `eval` y `debugger` bloquean el control.

Los registros `console.error` y `console.warn` están permitidos para fallos. Otros usos de consola producen advertencia. Las reglas de mantenibilidad con mayor posibilidad de ajuste inicial se mantienen como advertencias:

- complejidad cognitiva;
- strings duplicados;
- funciones idénticas.

No deben desactivarse reglas para silenciar hallazgos. Una excepción futura debe incluir evidencia del falso positivo y justificación en este documento.

## Cobertura

Los reportes se generan en `frontend/coverage/`, que está ignorado por Git. Se informan:

- statements;
- branches;
- functions;
- lines.

No se fija un umbral en esta fase para evitar pruebas artificiales. El Quality Gate definitivo debe definirse después de ampliar cobertura a servicios y módulos de interfaz.

## Seguridad de dependencias

`npm run security:audit` ejecuta:

```bash
npm audit --audit-level=high
```

No se permite usar `npm audit fix`, `--force` o actualizaciones automáticas para ocultar vulnerabilidades. Cada hallazgo debe clasificarse por severidad, dependencia directa o transitiva, disponibilidad de corrección y riesgo de actualización.

### Estado de la fase 3

Durante la configuración se detectaron y corrigieron mediante overrides explícitos:

- `body-parser@1.20.5` → `1.20.6`, dependencia transitiva de `json-server`, severidad baja.
- `brace-expansion@5.0.6` → `5.0.8`, dependencia transitiva de ESLint, SonarJS y Madge, severidad alta.
- `postcss@8.5.15` → `8.5.23`, dependencia transitiva de Vite y Madge, severidad alta.

Permanece un hallazgo de severidad baja en `esbuild@0.27.7`, dependencia transitiva anidada de Vite. El escenario afecta al servidor de desarrollo en Windows y permite lectura de archivos mediante una solicitud preparada. No bloquea `--audit-level=high`; actualizarlo de forma forzada podría romper la alineación entre Vite, sus binarios opcionales y esbuild. Debe revisarse al actualizar Vite y no se debe exponer el servidor de desarrollo a redes no confiables.

## Flujo antes de commit

1. Revisar `git status`.
2. Ejecutar `npm run verify`.
3. Revisar `git diff`.
4. Realizar pruebas manuales cuando haya cambios visuales.
5. Hacer el commit manualmente.

## Política de fallos

Un fallo no debe ignorarse:

1. Identificar el control y el mensaje relevante.
2. Clasificarlo como configuración, código, dependencia o entorno.
3. Corregirlo si pertenece al alcance actual.
4. Documentarlo si requiere otra fase.
5. Volver a ejecutar el control afectado y después `npm run verify`.

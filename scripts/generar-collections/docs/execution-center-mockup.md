# Execution Center

## Objetivo

Rediseñar la experiencia de `Probar flujo` para que deje de verse como una consola textual
y pase a funcionar como un **Execution Center** visual, entendible y mantenible.

Esto aplica **solo al botón `Probar flujo`**.

`Generar JSON` debe seguir enfocado en exportar la collection Postman y no en mostrar la ejecución.

## Intención de producto

La pantalla de ejecución tiene que transmitir, de un vistazo:

- qué paso se está ejecutando;
- qué paso terminó bien o mal;
- cuánto demoró cada request;
- qué variables nuevas produjo cada paso;
- cuál fue el request/response exacto de cada método.

La inspiración visual recomendada es una mezcla de:

- GitHub Actions
- Chrome DevTools
- n8n
- Figma

## Layout principal

La pantalla se divide en tres zonas:

1. Centro superior:
   Un dashboard con métricas de ejecución.

2. Centro:
   El flujo visual vivo, usando los mismos nodos del builder pero con estado de ejecución.

3. Panel derecho:
   Timeline, variables globales y acciones rápidas.

Debajo del flujo:

- detalle del paso seleccionado;
- tabs estilo DevTools;
- preview de request, response, headers, variables y logs.

## Comportamiento funcional

### 1. Flujo vivo

Cada nodo cambia de estado mientras corre:

- `idle`
- `running`
- `success`
- `error`
- `skipped`

También cambian las conexiones entre nodos:

- gris: todavía no ejecutado
- amarillo/azul: ejecutando
- verde: completado
- rojo: error

### 2. Dashboard superior

Mostrar:

- ejecución número;
- estado general;
- duración total;
- pasos totales;
- pasos exitosos;
- pasos con error;
- requests HTTP;
- variables creadas;
- warnings.

### 3. Timeline lateral

Mostrar un timeline vertical con:

- hora;
- nombre del paso;
- estado;
- duración;
- evento de finalización del flujo.

Al hacer clic en un evento del timeline, se debe seleccionar ese paso en el detalle.

### 4. Panel del paso

Cuando el usuario selecciona un nodo o un evento del timeline, abajo debe abrirse el detalle del paso.

Tabs sugeridas:

- `Resumen`
- `Request`
- `Response`
- `Headers`
- `Variables`
- `Logs`

### 5. Variables

No mostrar una lista plana eterna.

Separar:

- variables creadas en este paso;
- variables globales acumuladas;
- diff respecto al paso anterior.

Usar tarjetas compactas con:

- nombre
- valor
- tipo

Si hay muchas variables, agregar buscador.

### 6. Consola opcional

La consola textual puede seguir existiendo, pero como un panel secundario o exportable.

No debe ser la experiencia principal.

## Estilo visual

- interfaz clara, blanca, amplia y profesional;
- bordes suaves;
- sombras livianas;
- tipografía sobria;
- colores de estado bien consistentes;
- animaciones sutiles.

Estados recomendados:

- `success`: verde
- `running`: violeta/azul
- `error`: rojo
- `warning`: amarillo
- `idle`: gris

## Restricciones técnicas

- mantener compatibilidad con el builder actual;
- reutilizar en lo posible los nodos ya existentes del canvas;
- no mezclar lógica visual del Execution Center dentro de un único archivo gigante;
- separar estado, render y acciones en módulos pequeños;
- dejar nombres de clases y funciones claros;
- documentar decisiones relevantes con comentarios cortos y útiles.

## Roadmap sugerido

### V1

- dashboard superior;
- flujo vivo con estado por nodo;
- color de conexiones;
- timeline lateral;
- detalle del paso con tabs;
- variables creadas por paso;
- request/response renderizados prolijos.

### V2

- historial de ejecuciones;
- reejecutar desde un paso;
- exportar ejecución en JSON/HTML/PDF;
- replay de ejecución.

### V3

- diff entre ejecuciones;
- modo debug paso a paso;
- métricas agregadas por endpoint;
- persistencia completa de ejecuciones.

## Prompt breve para otro Codex

> Rediseña la experiencia del botón `Probar flujo` del generador de collections para convertirla en un `Execution Center` visual. La exportación de `Generar JSON` no debe cambiar su objetivo. Usa un layout de tres zonas: dashboard y flujo en el centro, timeline y variables/acciones a la derecha, detalle del paso abajo con tabs tipo DevTools (`Resumen`, `Request`, `Response`, `Headers`, `Variables`, `Logs`). El flujo debe verse vivo: nodos y conexiones cambian de color según estado (`idle`, `running`, `success`, `error`, `skipped`). Mostrar tiempos por paso, variables nuevas por paso y JSON renderizado prolijo. Mantén una arquitectura mantenible: separar estado, render y acciones en módulos chicos, con nombres claros y comentarios útiles.

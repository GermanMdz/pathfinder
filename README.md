# Indoor AR Wayfinding

Sistema de navegación indoor para edificios o empresas con instalaciones grandes. El usuario escanea un código QR ubicado en un punto físico del edificio, indica a dónde quiere llegar, y el sistema lo guía paso a paso hasta el destino — en una primera versión mediante instrucciones textuales, y en una segunda etapa mediante una flecha superpuesta en la cámara (Realidad Aumentada) que indica la dirección a seguir.

## La idea

1. El usuario escanea un QR físico ubicado en un punto conocido del edificio (hall, pasillo, entrada de piso, etc.). Ese QR identifica un **nodo** dentro del grafo del edificio — su ubicación actual.
2. Escribe o selecciona su destino (ej: "Sala de reuniones 4B", "Baños piso 2").
3. El sistema calcula la ruta más corta entre el nodo actual y el nodo destino, atravesando el grafo del edificio (pasillos, escaleras, ascensores).
4. Se le muestra la primera instrucción (ej: "Segui derecho hasta las escaleras").
5. Al llegar, presiona un botón **"Estoy allí"**, que solicita la siguiente instrucción (ej: "Subí al piso 3").
6. El proceso se repite hasta llegar al destino final.
7. **(Fase 2)** En lugar de solo texto, se le muestra una flecha superpuesta en la cámara del celular (AR) que apunta físicamente hacia la próxima dirección a seguir, calculada en base a la orientación real del dispositivo.

## Por qué este enfoque

El edificio se modela como un **grafo**: cada punto relevante (QR, escalera, ascensor, cruce de pasillos, destino) es un nodo, y cada conexión caminable entre dos puntos es una relación con un peso (distancia/costo). Esto permite resolver la navegación con algoritmos clásicos de caminos mínimos (Dijkstra) sobre una estructura que se presta naturalmente a un motor de base de datos orientado a grafos.

## Objetivos del proyecto

Además de resolver el problema de navegación, este proyecto busca ser una instancia de aprendizaje de tecnologías nuevas para mí:

- **Neo4j** y el lenguaje de consultas **Cypher**, como motor de base de datos orientado a grafos.
- **GraphQL** (vía Apollo Server) como capa de API, en lugar de REST.
- Implementación propia del algoritmo de **Dijkstra** para pathfinding, en vez de depender de una librería, para entender bien su funcionamiento interno.

## Roadmap

### Fase 1 — Pathfinding (foco actual)
- [ ] Modelar el edificio como grafo en Neo4j (nodos: `Node` con tipo `qr_point` | `stairs` | `elevator` | `junction` | `destination`; relaciones: `CONNECTS_TO` con propiedades `weight` y `type`)
- [ ] Implementar Dijkstra propio en TypeScript, consumiendo los datos traídos desde Neo4j vía Cypher
- [ ] Exponer la lógica mediante GraphQL (Apollo Server + `neo4j-driver`, resolvers escritos a mano)
- [ ] Traducir la ruta calculada (secuencia de nodos/relaciones) a instrucciones legibles paso a paso
- [ ] Frontend simple (Next.js + Apollo Client) que consuma el backend: selector de destino, instrucción actual, botón "Estoy allí"

### Fase 2 — AR
- [ ] Lectura de QR en el navegador (`html5-qrcode` o similar) para identificar el nodo de origen
- [ ] Investigar WebXR Device API para overlay de AR en navegador (alternativa: AR.js si hay problemas de compatibilidad)
- [ ] Cálculo de orientación del dispositivo (`DeviceOrientationEvent`) para determinar el ángulo de la flecha respecto al próximo nodo
- [ ] Reemplazar las instrucciones textuales por la flecha AR superpuesta en cámara

## Stack tecnológico

| Parte | Tecnología |
|---|---|
| Base de datos | Neo4j (Aura, cloud managed) |
| Backend | Node.js + Express + Apollo Server (GraphQL) |
| Driver DB | `neo4j-driver` (oficial) |
| Pathfinding | Implementación propia de Dijkstra en TypeScript |
| Frontend | Next.js + Apollo Client |
| QR (fase 2) | `html5-qrcode` |
| AR (fase 2) | WebXR Device API (alternativa: AR.js) |
| Hosting backend | Render |
| Hosting frontend | Vercel |
| Hosting DB | Neo4j Aura |

## Estado actual

🚧 En desarrollo — Fase 1 (pathfinding).

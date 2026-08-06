# PROJECT_SPEC.md

> Version: 1.0
>
> Project: OptiObra Intelligence Engine
>
> Author: ChatGPT
>
> Status: Draft
>
> Last Update: August 2026

---

# 1. Introducción

## 1.1 Visión

OptiObra Intelligence Engine será el motor de inteligencia artificial encargado de proporcionar capacidades avanzadas de análisis, interpretación y generación de conocimiento para el sistema OptiObra.

No será un simple generador de reportes.

Será una plataforma modular de inteligencia especializada en proyectos de construcción.

El objetivo es convertir los datos registrados por el sistema principal en información útil para ingenieros, residentes, supervisores y administradores.

El sistema deberá evolucionar con el tiempo para convertirse en un asistente inteligente capaz de:

- Generar reportes automáticos.
- Analizar tendencias.
- Detectar riesgos.
- Identificar retrasos.
- Analizar productividad.
- Explicar cambios.
- Responder preguntas.
- Recomendar acciones.

Todo ello utilizando modelos LLM ejecutados completamente de forma local.

---

# 2. Objetivos

## Objetivo Principal

Diseñar un motor de inteligencia desacoplado del backend principal que sea capaz de transformar información estructurada proveniente de OptiObra en conocimiento útil utilizando modelos LLM ejecutados localmente.

---

## Objetivos Específicos

El sistema deberá poder:

✓ Generar reportes ejecutivos

✓ Generar reportes diarios

✓ Generar reportes semanales

✓ Generar reportes mensuales

✓ Generar conclusiones

✓ Detectar anomalías

✓ Detectar riesgos

✓ Analizar avances

✓ Analizar materiales

✓ Generar observaciones

✓ Comparar periodos

✓ Responder preguntas sobre proyectos (Fase futura)

✓ Implementar RAG (Fase futura)

---

# 3. Filosofía del Proyecto

Este proyecto seguirá cuatro principios fundamentales.

## 3.1 La IA nunca será la dueña de los datos

Toda la información provendrá del Backend Django.

La IA nunca accederá directamente a:

- MySQL
- MariaDB
- PostgreSQL
- Supabase

La IA únicamente recibirá un contexto previamente preparado.

---

## 3.2 Python hace los cálculos

La IA NO calculará:

- porcentajes
- diferencias
- estadísticas
- promedios
- tendencias matemáticas

Todo cálculo determinístico será realizado por Python.

La IA solamente interpretará resultados.

---

## 3.3 El modelo es reemplazable

El sistema nunca dependerá de un modelo específico.

Debe ser posible cambiar:

Qwen

↓

Llama

↓

Gemma

↓

Mistral

↓

Otro modelo

sin modificar el resto del proyecto.

---

## 3.4 Arquitectura Modular

Cada módulo tendrá una única responsabilidad.

No existirán clases gigantes.

No existirán archivos de miles de líneas.

Cada componente deberá ser fácilmente testeable.

---

# 4. Arquitectura General

                      Angular

                         │

                         ▼

                  Backend Django

        CRUD + Auth + Base de Datos

                         │

                         ▼

                 Context Builder

                         │

                    JSON Limpio

                         │

                         ▼

          OptiObra Intelligence Engine

                 FastAPI + Python

                         │

                         ▼

              Prompt Construction

                         │

                         ▼

                 llama.cpp Server

                         │

                         ▼

           Qwen 3 8B GGUF Q4_K_M

                         │

                         ▼

                 Respuesta Markdown

---

# 5. Alcance del Proyecto

## Primera Versión

La primera versión únicamente deberá generar reportes ejecutivos.

No se implementará:

- Chat
- Predicciones
- RAG
- Embeddings
- OCR
- Procesamiento de imágenes

El objetivo será obtener una base sólida.

---

# Segunda Versión

Se añadirá:

- Chat IA
- Reportes inteligentes
- Comparación temporal
- Estadísticas

---

# Tercera Versión

Se añadirá:

- RAG

- Documentación técnica

- Manuales

- Reglamentos

- ISO

- Normativas

---

# Cuarta Versión

Sistema completo de inteligencia.

- Predicción de retrasos

- Predicción de consumo

- Optimización de materiales

- Detección de riesgos

- Asistente técnico

---

# 6. Hardware Objetivo

Servidor Principal

CPU

Intel Xeon E5-2680 v4

14 Núcleos

28 Hilos

RAM

20 GB DDR4

GPU

Ninguna

Sistema Operativo

Ubuntu Server LTS

Docker

Sí

---

# 7. Modelo de IA

Modelo seleccionado

Qwen 3 8B Instruct

Formato

GGUF

Cuantización

Q4_K_M

Backend

llama.cpp

No se utilizarán APIs externas.

No se utilizarán servicios cloud.

Todo el procesamiento será local.

---

# 8. Justificación del Modelo

Qwen ofrece actualmente una de las mejores capacidades en español entre los modelos abiertos de su tamaño.

Las razones de su elección son:

- Excelente redacción técnica.
- Buen razonamiento.
- Bajo consumo de memoria.
- Compatible con GGUF.
- Excelente rendimiento en CPU.
- Muy buena comprensión del español.

---

# 9. Restricciones

El sistema NO deberá:

Conectarse directamente a la base de datos.

Modificar información.

Tomar decisiones automáticamente.

Ejecutar acciones.

Modificar proyectos.

Eliminar información.

Actualizar registros.

La IA únicamente analiza.

Nunca ejecuta operaciones de negocio.

---

# 10. Requisitos No Funcionales

Disponibilidad

99%

Tiempo máximo para generar un reporte

10 segundos

Consumo máximo de RAM

12 GB

Tiempo de inicio

Menor a 30 segundos

Logs

Obligatorios

Pruebas

Obligatorias

Docker

Obligatorio

---

# 11. Principios SOLID

Todo el proyecto deberá respetar:

S - Single Responsibility Principle

O - Open Closed Principle

L - Liskov Substitution Principle

I - Interface Segregation

D - Dependency Inversion

---

# 12. Estándares de Código

Python 3.13

Type Hints obligatorios

Pydantic obligatorio

Docstrings Google Style

Black

Ruff

Pytest

No utilizar funciones de más de 80 líneas.

No utilizar clases de más de 300 líneas.

Evitar archivos superiores a 500 líneas.

---

# 13. Convenciones

Todos los nombres deberán utilizar inglés.

Ejemplo

ProjectAnalyzer

NO

AnalizadorProyecto

---

Endpoints

snake_case

Variables

snake_case

Clases

PascalCase

Constantes

UPPER_CASE

---

# 14. Gestión del Estado

El servicio será completamente stateless.

Toda la información necesaria llegará en la petición.

No existirán sesiones.

No existirán usuarios internos.

No se almacenará contexto entre solicitudes.

---

# 15. Objetivo del MVP

El MVP será considerado terminado cuando:

✓ Django pueda enviar un JSON.

✓ El motor genere un reporte.

✓ El reporte sea coherente.

✓ El tiempo sea menor a 10 segundos.

✓ Todo funcione localmente.

✓ El modelo sea reemplazable.

✓ Todo esté dockerizado.

---

Fin de la Parte 1.
---

# PART 2 - Software Architecture

# 16. Arquitectura General del Software

OptiObra Intelligence Engine seguirá una arquitectura limpia inspirada en:

- Clean Architecture
- Domain Driven Design (DDD)
- Hexagonal Architecture
- SOLID

El objetivo principal es que el modelo LLM, FastAPI, Django y cualquier tecnología externa puedan cambiarse sin afectar la lógica del negocio.

La dependencia siempre apuntará hacia el dominio.

Nunca al contrario.

La arquitectura seguirá esta dirección:

Presentation

↓

Application

↓

Domain

↓

Infrastructure

Nunca se permitirá que el dominio conozca detalles de FastAPI, llama.cpp, Ollama o cualquier proveedor.

---

# 17. Estructura del Repositorio

La estructura oficial será la siguiente.

```

optiobra-intelligence/

│

├── app/

│ ├── api/

│ │ ├── routes/

│ │ ├── middleware/

│ │ ├── dependencies/

│ │ └── exceptions/

│

│ ├── application/

│ │ ├── services/

│ │ ├── use_cases/

│ │ └── dto/

│

│ ├── domain/

│ │ ├── report/

│ │ ├── project/

│ │ ├── material/

│ │ ├── analysis/

│ │ ├── recommendation/

│ │ └── common/

│

│ ├── infrastructure/

│ │ ├── llm/

│ │ ├── cache/

│ │ ├── templates/

│ │ ├── parser/

│ │ └── persistence/

│

│ ├── providers/

│

│ ├── prompts/

│

│ ├── schemas/

│

│ ├── utils/

│

│ ├── config/

│

│ └── main.py

│

├── tests/

├── docs/

├── docker/

├── scripts/

├── Dockerfile

├── docker-compose.yml

└── README.md

```

---

# 18. Capas

## API Layer

Responsabilidad

Recibir peticiones HTTP.

Validar.

Responder.

Nada más.

Nunca contendrá lógica de negocio.

Ejemplo

```

POST /report

↓

Validar Request

↓

ReportService

↓

Return Response

```

---

## Application Layer

Es la capa que coordina todo.

Aquí viven los casos de uso.

Ejemplos

GenerateExecutiveReport

GenerateWeeklyReport

AnalyzeProject

AnalyzeMaterials

CompareProgress

No contiene reglas de negocio complejas.

Simplemente coordina.

---

## Domain Layer

Es el corazón del proyecto.

Aquí viven todas las reglas.

Por ejemplo

ProjectAnalyzer

MaterialAnalyzer

RiskAnalyzer

RecommendationEngine

No deben importar FastAPI.

No deben importar requests.

No deben importar HTTP.

---

## Infrastructure Layer

Todo lo externo.

Aquí vivirán

llama.cpp

Redis

Archivos Markdown

Jinja2

Logging

Cache

Lectura de templates

etc.

---

# 19. Flujo de Datos

El flujo completo será:

```

Cliente

↓

FastAPI

↓

Pydantic Validation

↓

Use Case

↓

Context Builder

↓

Prompt Builder

↓

LLM Provider

↓

Markdown Parser

↓

Response DTO

↓

HTTP Response

```

Nunca se saltarán pasos.

---

# 20. Separación de Responsabilidades

Cada componente tendrá una única función.

Ejemplo

ReportService

Generar reportes.

Nada más.

PromptService

Construir prompts.

Nada más.

ContextService

Transformar JSON.

Nada más.

LLMService

Hablar con el modelo.

Nada más.

---

# 21. Casos de Uso

Todos los casos de uso deberán vivir en

application/use_cases

Ejemplo

```

GenerateExecutiveReport

GenerateDailyReport

GenerateWeeklyReport

GenerateMonthlyReport

AnalyzeRisk

AnalyzeProgress

AnalyzeMaterials

```

Cada caso de uso será independiente.

---

# 22. DTOs

Los DTO nunca serán los mismos objetos del dominio.

Ejemplo

Request

↓

ReportRequestDTO

↓

Domain Objects

↓

ResponseDTO

Nunca reutilizar modelos.

---

# 23. Context Builder

Este será probablemente el componente más importante del proyecto.

La IA jamás verá directamente los modelos de Django.

El Context Builder recibirá únicamente JSON.

Su responsabilidad será construir un contexto inteligente.

Entrada

```

Proyecto

Avances

Materiales

Historial

```

Salida

```

Context

```

Ejemplo

```json
{
  "project": {
    "name": "...",
    "status": "...",
    "progress": 67
  },

  "activities": [...],

  "materials": [...],

  "statistics": {...},

  "alerts": [...],

  "timeline": [...],

  "summary": {...}
}
```

El objetivo es reducir al mínimo el trabajo del modelo.

---

# 24. Prompt Builder

Nunca escribir prompts concatenando strings.

Se utilizarán templates.

Ejemplo

```

System Prompt

+

Role Prompt

+

Task Prompt

+

Context

+

Output Instructions

```

↓

Prompt Final

---

# 25. Prompt Templates

Todos los prompts vivirán en

```

prompts/

```

Ejemplo

```

executive.md

daily.md

weekly.md

monthly.md

risk.md

system.md

construction_expert.md

```

Nunca se escribirán prompts dentro del código.

---

# 26. Prompt Composition

Los prompts deberán construirse dinámicamente.

Ejemplo

```

System

↓

Role

↓

Task

↓

Rules

↓

Context

↓

Output Format

```

Esto permitirá reutilizar componentes.

---

# 27. Context Compression

Antes de enviar información al modelo.

El sistema deberá:

Eliminar campos innecesarios.

Eliminar duplicados.

Ordenar cronológicamente.

Agrupar eventos.

Calcular estadísticas.

Reducir tamaño del prompt.

La IA no debe recibir ruido.

---

# 28. LLM Provider

El proyecto nunca dependerá directamente de llama.cpp.

Existirá una interfaz.

```

LLMProvider

```

Con el método

```

generate()

```

Implementaciones

```

LlamaCppProvider

OllamaProvider

OpenAIProvider

MockProvider

```

Aunque inicialmente solo se implemente LlamaCppProvider.

---

# 29. Servicios

La carpeta application/services contendrá.

ReportService

ContextService

PromptService

MarkdownService

CacheService

HealthService

Cada servicio tendrá una única responsabilidad.

---

# 30. Analizadores del Dominio

El dominio estará dividido en pequeños analizadores.

Ejemplo

ProjectAnalyzer

Responsable de interpretar el estado del proyecto.

MaterialAnalyzer

Responsable de detectar cambios de materiales.

RiskAnalyzer

Detecta posibles riesgos.

ProgressAnalyzer

Analiza tendencias.

RecommendationEngine

Genera recomendaciones objetivas.

Todos trabajan antes de llamar al LLM.

---

# 31. Orquestador

El caso de uso GenerateExecutiveReport actuará como orquestador.

Su flujo será:

Validar Request

↓

Construir Contexto

↓

Ejecutar Analizadores

↓

Construir Prompt

↓

Enviar al LLM

↓

Validar Respuesta

↓

Generar DTO

↓

Responder

---

# 32. Qué hace Python

Python deberá realizar cualquier operación determinística.

Ejemplos

Calcular diferencias.

Calcular porcentajes.

Detectar stock bajo.

Ordenar cronológicamente.

Agrupar actividades.

Detectar fechas.

Contar eventos.

Generar estadísticas.

Todo esto NO debe hacerlo el LLM.

---

# 33. Qué hace el LLM

Interpretar.

Relacionar hechos.

Redactar.

Detectar patrones cualitativos.

Escribir conclusiones.

Explicar riesgos.

Generar observaciones.

Nunca hacer cálculos.

---

# 34. Principio Fundamental

El modelo no piensa sobre datos crudos.

Piensa sobre información ya procesada.

La calidad del Context Builder será mucho más importante que el tamaño del modelo.

Este principio deberá mantenerse durante toda la vida del proyecto.

---

Fin de la Parte 2.
---

# PART 3 - API Contract & Context Pipeline

# 35. Filosofía de Integración

El Intelligence Engine NO conoce la base de datos.

NO conoce Django.

NO conoce MySQL.

NO conoce modelos ORM.

El Intelligence Engine únicamente entiende un lenguaje:

JSON.

Todo dato recibido debe haber sido preparado previamente por el Backend.

---

# 36. Flujo Completo

El flujo oficial será:

Usuario

↓

Angular

↓

Django Backend

↓

Consulta Base de Datos

↓

Construcción de Contexto

↓

POST /api/v1/report

↓

OptiObra Intelligence

↓

LLM

↓

Markdown

↓

Django

↓

Angular

---

# 37. API Versioning

Todas las rutas deberán estar versionadas.

Ejemplo

/api/v1/

En futuras versiones

/api/v2/

/api/v3/

Nunca romper compatibilidad.

---

# 38. Endpoints Iniciales

## Health

GET

/api/v1/health

Respuesta

200 OK

---

## Información

GET

/api/v1/info

Devuelve

- versión
- modelo activo
- proveedor
- uptime

---

## Reporte Ejecutivo

POST

/api/v1/report/executive

---

## Reporte Diario

POST

/api/v1/report/daily

---

## Reporte Semanal

POST

/api/v1/report/weekly

---

## Reporte Mensual

POST

/api/v1/report/monthly

---

# 39. Endpoints Futuros

POST

/api/v1/chat

POST

/api/v1/analyze

POST

/api/v1/risk

POST

/api/v1/materials

POST

/api/v1/schedule

GET

/api/v1/models

---

# 40. Contrato Principal

Todos los reportes recibirán el mismo objeto.

```json
{
  "project": {},

  "activities": [],

  "materials": [],

  "statistics": {},

  "alerts": [],

  "timeline": [],

  "metadata": {}
}
```

La diferencia será únicamente el endpoint.

---

# 41. Project Object

```json
{
  "id": 1,

  "name": "Hospital Norte",

  "location": "Bogotá",

  "status": "En progreso",

  "current_progress": 65,

  "planned_progress": 70,

  "start_date": "...",

  "estimated_finish": "...",

  "last_update": "..."
}
```

Nunca enviar datos innecesarios.

---

# 42. Activities

Cada actividad representa un evento importante.

```json
{
    "date":"2026-08-06",

    "activity":"Fundición",

    "description":"Se completó el bloque A",

    "responsible":"Carlos",

    "progress_before":62,

    "progress_after":65
}
```

---

# 43. Materials

```json
{
    "material":"Cemento",

    "category":"Construcción",

    "previous_quantity":320,

    "current_quantity":180,

    "difference":-140,

    "critical":false
}
```

Python calculará

difference

critical

Nunca la IA.

---

# 44. Statistics

```json
{
    "activities_count":12,

    "material_changes":18,

    "critical_materials":2,

    "average_progress":5,

    "total_progress":65
}
```

Todo calculado previamente.

---

# 45. Alerts

Las alertas son reglas determinísticas.

Ejemplo

```json
[
    {

        "type":"LOW_STOCK",

        "message":"Arena por debajo del mínimo"

    }
]
```

La IA únicamente las interpreta.

---

# 46. Timeline

Ejemplo

```json
[
    {

        "date":"2026-08-01",

        "event":"Inicio cimentación"

    },

    {

        "date":"2026-08-03",

        "event":"Llegada de acero"

    }
]
```

Orden cronológico obligatorio.

---

# 47. Metadata

Información de la solicitud.

```json
{
    "generated_at":"...",

    "language":"es",

    "report_type":"executive",

    "timezone":"America/Bogota"
}
```

---

# 48. Context Builder

El Backend Django construirá el contexto.

Nunca el Intelligence Engine.

Flujo

Proyecto

↓

Avances

↓

Materiales

↓

Historial

↓

Indicadores

↓

Context JSON

↓

Intelligence Engine

---

# 49. Adaptadores Django

Se recomienda crear una carpeta exclusiva.

backend/

services/

ai/

context_builder.py

No mezclar esta lógica con las Views.

---

# 50. Context Builder Responsibilities

Debe

Consultar modelos.

Agrupar datos.

Ordenar.

Calcular.

Normalizar.

Eliminar ruido.

Nunca generar lenguaje natural.

---

# 51. Información Obligatoria

Cada solicitud debe contener.

Proyecto

Actividades

Materiales

Indicadores

Metadata

Si falta alguno.

Responder 400.

---

# 52. Información Opcional

Fotografías (Futuro)

Clima

Bitácora

Cronograma

Costos

Incidentes

Normativas

---

# 53. Reglas del Contexto

Nunca enviar

IDs internos innecesarios.

Objetos Django.

JSON enormes.

Campos nulos.

Duplicados.

Información repetida.

---

# 54. Tamaño Máximo

El contexto no debería superar

50 KB

Si supera ese tamaño.

El Backend deberá resumir información.

No el modelo.

---

# 55. Context Quality

El contexto debe ser

Preciso.

Ordenado.

Determinístico.

Cronológico.

Sin redundancias.

Mientras mejor sea el contexto.

Mejor será el reporte.

---

# 56. Flujo Interno del Intelligence Engine

Request

↓

Pydantic

↓

Validate

↓

Context Validation

↓

Prompt Builder

↓

LLM Provider

↓

Markdown Validator

↓

Response

---

# 57. Validaciones

Antes de llamar al modelo.

Validar

Proyecto existe.

Hay actividades.

Formato correcto.

Fechas válidas.

Progreso válido.

Porcentajes entre 0 y 100.

---

# 58. Respuesta

El modelo devolverá Markdown.

Ejemplo

# Resumen Ejecutivo

...

## Actividades

...

## Materiales

...

## Riesgos

...

## Conclusiones

...

Nunca HTML.

Nunca PDF.

Nunca JSON generado por el modelo.

---

# 59. Response Object

```json
{
    "success":true,

    "report":"# Reporte ...",

    "model":"Qwen3-8B",

    "duration_ms":5832,

    "prompt_tokens":1821,

    "completion_tokens":814
}
```

---

# 60. Errores

Formato único.

```json
{
    "success":false,

    "error":"INVALID_CONTEXT",

    "message":"Activities field is missing."
}
```

Nunca devolver errores internos.

Nunca stacktrace.

---

# 61. Objetivo del Contrato

El Intelligence Engine debe poder recibir exactamente el mismo JSON aunque el backend cambie completamente.

Si en cinco años Django es reemplazado por otro framework.

El contrato NO deberá cambiar.

Ese será el mayor indicador de una buena arquitectura.

---

Fin de la Parte 3.
---

# PART 4 - Prompt Engine & Intelligence Layer

# 62. Filosofía del Prompt Engine

El Prompt Engine es el componente responsable de construir el prompt final que será enviado al modelo.

Su función NO es generar texto.

Su función es ensamblar correctamente diferentes componentes para producir un prompt consistente.

El Prompt Engine deberá ser completamente independiente del modelo utilizado.

Nunca deberá contener referencias específicas a:

- Qwen
- Llama
- Gemma
- Mistral

Debe funcionar para cualquier modelo compatible.

---

# 63. Objetivos

El Prompt Engine debe:

- Reutilizar componentes.
- Evitar duplicación.
- Facilitar mantenimiento.
- Permitir agregar nuevos tipos de reporte.
- Facilitar internacionalización.
- Mantener consistencia entre respuestas.

---

# 64. Arquitectura

El prompt nunca será un archivo gigante.

Se construirá mediante bloques.

```

System Prompt

↓

Role Prompt

↓

Task Prompt

↓

Rules Prompt

↓

Context

↓

Output Instructions

↓

Prompt Final

```

Cada bloque tiene una única responsabilidad.

---

# 65. Estructura

```

prompts/

system/

system.md

safety.md

roles/

construction_engineer.md

site_manager.md

project_manager.md

tasks/

executive.md

daily.md

weekly.md

monthly.md

risk.md

analysis.md

rules/

general.md

anti_hallucination.md

style.md

output/

markdown.md

json.md

```

Nunca escribir prompts dentro del código.

---

# 66. PromptService

Responsabilidades

- Cargar templates.
- Sustituir variables.
- Ensamblar bloques.
- Validar longitud.
- Devolver prompt final.

Nunca llamar al modelo.

---

# 67. Orden de Construcción

Todo prompt seguirá este orden.

1.

System

↓

2.

Role

↓

3.

Task

↓

4.

Rules

↓

5.

Context

↓

6.

Output

Nunca cambiar este orden.

---

# 68. System Prompt

Define la identidad permanente del modelo.

Ejemplo

"Eres un asistente especializado en ingeniería civil y gestión de proyectos de construcción.

Tu trabajo consiste en interpretar información previamente procesada y redactar reportes técnicos claros y objetivos."

Nunca incluir datos del proyecto.

Nunca incluir contexto.

---

# 69. Role Prompt

El rol cambia según el endpoint.

Ejemplo

Executive Report

↓

Ingeniero Residente

Risk Analysis

↓

Supervisor HSEQ

Material Analysis

↓

Jefe de Almacén

Schedule Analysis

↓

Director de Proyecto

El rol determina el enfoque del reporte.

---

# 70. Task Prompt

Explica qué debe hacer.

Ejemplo

Genera un reporte ejecutivo basado únicamente en la información suministrada.

Resume el estado del proyecto.

Identifica riesgos.

Explica los avances.

Genera conclusiones.

No inventes información.

---

# 71. Rules Prompt

Define restricciones.

Ejemplo

Nunca inventes datos.

Nunca supongas fechas.

Nunca modifiques porcentajes.

Nunca hagas cálculos.

Nunca menciones información inexistente.

Si falta información.

Indícalo explícitamente.

---

# 72. Context

El contexto siempre será el último bloque antes del formato de salida.

Ejemplo

Proyecto

Actividades

Materiales

Indicadores

Alertas

Timeline

Nunca incluir explicaciones.

Solo datos.

---

# 73. Output Instructions

Ejemplo

Responder únicamente en Markdown.

No utilizar HTML.

No utilizar tablas salvo que sean necesarias.

No utilizar emojis.

No utilizar listas excesivamente largas.

Utilizar títulos de segundo nivel.

---

# 74. Variables

Los templates utilizarán Jinja2.

Ejemplo

```

Proyecto:

{{ project.name }}

Estado:

{{ project.status }}

```

Nunca concatenar strings manualmente.

---

# 75. Context Injection

El contexto nunca será incrustado mediante replace().

Siempre utilizar templates.

Esto evita errores.

---

# 76. Anti Hallucination

Todo prompt incluirá reglas.

Ejemplo

No inventes información.

Si un dato no existe.

Escribe

"Información no disponible."

No completes valores faltantes.

No supongas cantidades.

No supongas materiales.

No supongas actividades.

---

# 77. Temperatura

Por defecto

0.2

Objetivo

Reducir creatividad.

Aumentar precisión.

Los reportes deben ser técnicos.

No literarios.

---

# 78. Longitud

Los reportes tendrán límites.

Executive

600 palabras máximo.

Daily

400

Weekly

800

Monthly

1200

Nunca generar documentos enormes.

---

# 79. Estilo

Formal.

Profesional.

Objetivo.

Ingeniería.

No utilizar lenguaje comercial.

No exagerar resultados.

No emitir opiniones personales.

---

# 80. Tono

Correcto

"Durante el periodo evaluado se registró un incremento del avance."

Incorrecto

"Excelente trabajo del equipo."

El modelo nunca felicita.

Nunca critica.

Nunca juzga.

---

# 81. Evidencia

Toda afirmación debe estar respaldada por el contexto.

Ejemplo

Correcto

"El inventario de cemento disminuyó."

Porque existe el dato.

Incorrecto

"El proyecto presenta problemas logísticos."

Si el contexto no lo demuestra.

---

# 82. Recomendaciones

Las recomendaciones deberán comenzar con

"Se recomienda..."

Nunca

"Debe hacerse..."

No imponer decisiones.

---

# 83. Interpretación

El modelo sí puede interpretar relaciones.

Ejemplo

Disminuyó el cemento.

Aumentó el avance.

↓

Interpretación válida

"El consumo de cemento es coherente con las actividades ejecutadas."

---

# 84. Relaciones Permitidas

Puede relacionar

Materiales ↔ Actividades

Avances ↔ Fechas

Alertas ↔ Riesgos

Indicadores ↔ Conclusiones

---

# 85. Relaciones Prohibidas

Nunca afirmar

Causas.

Responsabilidades.

Culpables.

Costos.

Problemas legales.

Incidentes.

A menos que aparezcan explícitamente.

---

# 86. Formato de Reporte Ejecutivo

Siempre deberá contener

# Resumen Ejecutivo

## Estado del Proyecto

## Actividades Relevantes

## Materiales

## Riesgos

## Observaciones

## Recomendaciones

## Conclusión

Nunca alterar el orden.

---

# 87. Formato Diario

Resumen

Actividades

Materiales

Incidencias

Observaciones

---

# 88. Formato Semanal

Resumen

Comparación

Avances

Materiales

Riesgos

Conclusiones

---

# 89. Formato Mensual

Estado General

Análisis

Indicadores

Materiales

Tendencias

Recomendaciones

Conclusiones

---

# 90. Reutilización

El Prompt Engine debe permitir reutilizar bloques.

Ejemplo

System Prompt

+

Construction Engineer

+

Executive Task

+

General Rules

+

Markdown Output

↓

Executive Report

Mientras que

System Prompt

+

Site Manager

+

Risk Task

+

General Rules

+

Markdown Output

↓

Risk Report

Sin duplicar contenido.

---

# 91. Preparación para RAG

El Prompt Engine deberá reservar un bloque para conocimiento externo.

Orden futuro

System

↓

Role

↓

Task

↓

Rules

↓

Knowledge

↓

Context

↓

Output

Aunque inicialmente el bloque Knowledge estará vacío.

---

# 92. Objetivo del Prompt Engine

El Prompt Engine debe ser capaz de construir cualquier tipo de prompt del sistema simplemente cambiando bloques de configuración.

Nunca deberá modificarse el código fuente para crear un nuevo tipo de reporte.

Bastará con agregar un nuevo template.

---

Fin de la Parte 4.
---

# PART 5 - Context Enrichment Engine

# 93. Introducción

El Context Enrichment Engine será el componente más importante del Intelligence Engine.

No será el LLM.

No será FastAPI.

No será Django.

Será el componente encargado de transformar datos estructurados en conocimiento estructurado.

El objetivo es reducir al máximo el trabajo del modelo.

Mientras más inteligente sea el Context Enrichment Engine, menor será la dependencia del tamaño del modelo.

---

# 94. Filosofía

El LLM no debe actuar como una calculadora.

El LLM no debe actuar como un motor estadístico.

El LLM no debe detectar diferencias.

El LLM no debe buscar patrones matemáticos.

Todo ello deberá hacerse previamente.

El modelo únicamente deberá:

- interpretar
- redactar
- resumir
- relacionar
- recomendar

---

# 95. Pipeline

Todo reporte seguirá el siguiente flujo.

Raw Context

↓

Validation

↓

Normalization

↓

Analysis Plugins

↓

Statistics

↓

Alerts

↓

Timeline Builder

↓

Summary Builder

↓

Enriched Context

↓

Prompt Engine

↓

LLM

---

# 96. Objetivos

El Enrichment Engine deberá:

✓ Reducir tokens.

✓ Eliminar ruido.

✓ Detectar anomalías.

✓ Detectar tendencias.

✓ Generar indicadores.

✓ Agrupar información.

✓ Clasificar eventos.

✓ Preparar conocimiento para el modelo.

---

# 97. Componentes

El módulo estará compuesto por los siguientes servicios.

ValidationService

NormalizationService

TimelineBuilder

StatisticsBuilder

AlertBuilder

SummaryBuilder

PluginManager

ContextOptimizer

Cada servicio tendrá una única responsabilidad.

---

# 98. Validation Service

Responsabilidad

Verificar que el contexto recibido sea válido.

Debe comprobar:

- campos obligatorios
- tipos
- fechas
- porcentajes
- listas vacías
- consistencia

Nunca modificar datos.

Solo validar.

---

# 99. Normalization Service

Convierte datos heterogéneos en un formato uniforme.

Ejemplo

"En progreso"

↓

IN_PROGRESS

Otro ejemplo

"Cemento"

↓

cement

Otro ejemplo

"05/08/2026"

↓

2026-08-05

El modelo siempre recibirá información consistente.

---

# 100. Timeline Builder

Responsabilidad

Construir una cronología ordenada.

Entrada

Actividades

Historiales

Cambios de materiales

Salida

Timeline unificado.

Ejemplo

01 Ago

Inicio de cimentación

↓

03 Ago

Ingreso de acero

↓

05 Ago

Fundición bloque A

↓

07 Ago

Incremento del avance

---

# 101. Statistics Builder

Toda estadística será calculada aquí.

Ejemplos

Número de actividades.

Variación del avance.

Consumo promedio.

Cambios de materiales.

Duración.

Cantidad de alertas.

Nunca calcular estadísticas dentro del LLM.

---

# 102. Summary Builder

Responsabilidad

Generar pequeños resúmenes estructurados.

Ejemplo

```json
{
    "activities_summary": {

        "total":18,

        "completed":15,

        "pending":3

    }
}
```

No redacta texto.

Solo resume datos.

---

# 103. Alert Builder

Genera alertas objetivas.

Ejemplos

LOW_STOCK

NEGATIVE_PROGRESS

DELAY

NO_ACTIVITY

EXCESSIVE_CONSUMPTION

MISSING_INFORMATION

Las reglas son determinísticas.

Nunca dependen del modelo.

---

# 104. Context Optimizer

Antes de llamar al modelo.

Eliminar

Duplicados.

Información irrelevante.

Campos nulos.

Objetos vacíos.

Información repetida.

El objetivo es reducir tokens.

---

# 105. Plugin System

Todo análisis se implementará mediante plugins.

Nunca modificando el núcleo.

---

# 106. Interfaz

```python
class AnalyzerPlugin:

    def analyze(
        self,
        context
    ) -> AnalysisResult:
        ...
```

Todos los plugins implementarán esta interfaz.

---

# 107. Plugin Manager

Responsabilidad

Descubrir plugins.

Ejecutarlos.

Recoger resultados.

Fusionarlos.

El núcleo nunca conocerá qué plugins existen.

---

# 108. Plugins Iniciales

ProjectAnalyzer

MaterialAnalyzer

ProgressAnalyzer

TimelineAnalyzer

StatisticsAnalyzer

AlertAnalyzer

RecommendationAnalyzer

---

# 109. Project Analyzer

Responsabilidades

Analizar estado.

Detectar cambios.

Interpretar progreso.

Verificar cronograma.

Generar indicadores.

Nunca redactar.

---

# 110. Material Analyzer

Responsabilidades

Detectar consumo.

Detectar faltantes.

Comparar inventario.

Calcular diferencias.

Clasificar materiales.

---

# 111. Progress Analyzer

Responsabilidades

Comparar periodos.

Detectar estancamiento.

Detectar aceleración.

Detectar retrocesos.

Calcular tendencia.

---

# 112. Timeline Analyzer

Responsabilidades

Ordenar eventos.

Agrupar actividades.

Eliminar duplicados.

Construir historia del proyecto.

---

# 113. Recommendation Analyzer

No utiliza IA.

Genera recomendaciones determinísticas.

Ejemplo

Arena crítica

↓

Recomendación

Solicitar reposición.

El modelo podrá reformularla.

Pero no inventarla.

---

# 114. Trend Detection

Toda tendencia será calculada previamente.

Ejemplo

```text
62

↓

63

↓

65

↓

67
```

Resultado

```json
{
    "trend":"positive"
}
```

---

# 115. Stagnation Detection

Ejemplo

```text
65

↓

65

↓

65

↓

65
```

Resultado

```json
{
    "stagnation":true,

    "days":10
}
```

---

# 116. Consumption Detection

Entrada

Arena

350

↓

120

Salida

```json
{
    "variation":-230,

    "critical":true,

    "consumption":"high"
}
```

---

# 117. Threshold Engine

Todos los límites estarán centralizados.

Ejemplo

LOW_STOCK = 100

HIGH_CONSUMPTION = 30%

STAGNATION_DAYS = 7

Nunca escribir números mágicos.

---

# 118. Rules Engine

El sistema utilizará reglas configurables.

Ejemplo

IF

stock < minimum

↓

LOW_STOCK

Otro

IF

days_without_progress > 5

↓

PROJECT_DELAY

Las reglas deberán poder cambiarse sin modificar el código.

---

# 119. Future Rules

En el futuro se podrán cargar desde YAML.

Ejemplo

```yaml
rules:

  low_stock:

    threshold:100

  stagnation:

    days:5
```

---

# 120. AnalysisResult

Todos los plugins devolverán el mismo objeto.

Ejemplo

```python
AnalysisResult

name

priority

findings

statistics

alerts

recommendations
```

Esto simplifica la agregación.

---

# 121. Enriched Context

El Prompt Engine nunca recibirá el contexto original.

Siempre recibirá un contexto enriquecido.

Ejemplo

```json
{
    "project": {},

    "statistics": {},

    "alerts": [],

    "timeline": [],

    "analysis": {

        "progress": {},

        "materials": {},

        "recommendations": {}

    }
}
```

---

# 122. Principio de Oro

El modelo nunca debe descubrir información.

Debe recibir información ya descubierta.

El modelo únicamente la transforma en lenguaje natural.

---

# 123. Métricas

El Enrichment Engine deberá registrar:

Tiempo de análisis.

Plugins ejecutados.

Alertas generadas.

Contexto original.

Contexto final.

Reducción de tokens.

Estas métricas servirán para optimizar el sistema.

---

# 124. Objetivo

El éxito del Intelligence Engine no dependerá del tamaño del modelo.

Dependerá de la calidad del contexto enriquecido.

El Context Enrichment Engine será considerado el verdadero cerebro del sistema.

---

Fin de la Parte 5.
---

# PART 6 - LLM Engine & Inference Infrastructure

# 125. Objetivo

El LLM Engine será el único componente autorizado para comunicarse con el modelo de lenguaje.

Ningún otro módulo podrá realizar llamadas directas al servidor de inferencia.

Esto garantiza:

- Desacoplamiento.
- Facilidad para cambiar de modelo.
- Facilidad para cambiar de proveedor.
- Mejor control de errores.
- Métricas centralizadas.
- Caché compartida.

---

# 126. Arquitectura

                     Prompt Engine
                           │
                           ▼
                     LLM Service
                           │
                           ▼
                    Provider Interface
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  LlamaCppProvider   OllamaProvider   MockProvider
                           │
                           ▼
                    llama.cpp Server
                           │
                           ▼
                Qwen 3 8B GGUF Q4_K_M

---

# 127. Responsabilidades del LLM Engine

El LLM Engine deberá:

- Construir la petición.
- Enviar prompts.
- Recibir respuestas.
- Medir tiempos.
- Gestionar errores.
- Aplicar reintentos.
- Registrar métricas.
- Gestionar caché.
- Validar la salida.

Nunca generará prompts.

Nunca modificará el contexto.

Nunca accederá a la base de datos.

---

# 128. Provider Interface

Todos los proveedores deberán implementar la misma interfaz.

Ejemplo:

generate(prompt)

health()

model_info()

token_count()

close()

El resto del sistema nunca conocerá qué proveedor está utilizando.

---

# 129. LlamaCppProvider

Será la implementación por defecto.

Responsabilidades:

- Comunicación HTTP.
- Configuración de parámetros.
- Gestión de timeouts.
- Validación de respuestas.
- Conversión al formato interno.

---

# 130. Model Configuration

Toda la configuración deberá almacenarse en archivos externos.

Ejemplo:

config/model.yaml

Nunca codificar valores directamente en Python.

---

# 131. Parámetros Iniciales

Modelo

Qwen 3 8B Instruct

Formato

GGUF

Cuantización

Q4_K_M

Backend

llama.cpp

---

# 132. Configuración Recomendada

temperature: 0.2

top_p: 0.9

top_k: 40

repeat_penalty: 1.1

max_tokens: 1200

seed: fijo (configurable)

Estos valores deberán ser modificables sin recompilar.

---

# 133. Context Window

El sistema deberá detectar automáticamente el contexto máximo soportado por el modelo.

Nunca asumir un tamaño fijo.

Si el contexto supera el límite:

- resumir;
- eliminar ruido;
- comprimir.

Nunca truncar información arbitrariamente.

---

# 134. Timeout

Toda petición tendrá un timeout configurable.

Valor inicial recomendado:

30 segundos.

Si el tiempo se supera:

Cancelar.

Registrar error.

Responder adecuadamente.

---

# 135. Retries

El sistema podrá realizar un único reintento automático cuando:

- falle la conexión;
- el servidor no responda;
- ocurra un timeout temporal.

Nunca realizar reintentos infinitos.

---

# 136. Health Check

El LLM Engine deberá exponer un método:

health()

Que verifique:

- servidor disponible;
- modelo cargado;
- tiempo de respuesta;
- memoria disponible.

---

# 137. Warm-up

Al iniciar el servicio:

- verificar conexión;
- cargar el modelo;
- realizar una inferencia mínima.

Objetivo:

Reducir la latencia de la primera petición.

---

# 138. Model Manager

Responsabilidades:

- conocer el modelo activo;
- conocer la cuantización;
- conocer la ruta del modelo;
- detectar cambios;
- exponer información.

---

# 139. Caché

El sistema implementará una caché de respuestas.

Clave:

hash(prompt)

Valor:

respuesta generada.

Objetivo:

Evitar regenerar reportes idénticos.

---

# 140. Estrategia de Caché

TTL recomendado:

10 minutos.

La caché deberá poder deshabilitarse.

---

# 141. Token Counter

Antes de enviar un prompt.

Calcular:

- tokens estimados;
- tamaño del contexto;
- porcentaje utilizado.

Registrar estas métricas.

---

# 142. Output Validator

Antes de devolver una respuesta.

Validar:

- no vacía;
- formato Markdown;
- longitud mínima;
- longitud máxima.

Si falla:

Generar error controlado.

---

# 143. Markdown Validator

Comprobar:

- encabezados principales;
- estructura esperada;
- ausencia de HTML;
- ausencia de bloques prohibidos.

---

# 144. Logging

Registrar:

- hora;
- modelo;
- duración;
- tokens;
- endpoint;
- éxito/error.

Nunca registrar información sensible.

---

# 145. Observabilidad

Cada petición generará métricas.

Ejemplo:

request_duration_ms

prompt_tokens

completion_tokens

cache_hit

provider

model

temperature

---

# 146. Benchmark

El proyecto incluirá un módulo para medir rendimiento.

Debe permitir:

- medir velocidad;
- comparar modelos;
- comparar parámetros;
- comparar cuantizaciones.

---

# 147. Configuración del Xeon

Configuración inicial recomendada.

CPU:

Intel Xeon E5-2680 v4

Threads:

28

llama.cpp

--threads 24

Reservar algunos hilos para FastAPI y el sistema operativo.

---

# 148. Gestión de Memoria

Nunca cargar múltiples modelos simultáneamente.

Solo un modelo activo.

Liberar memoria correctamente al apagar.

---

# 149. Streaming

Inicialmente:

Deshabilitado.

El reporte deberá generarse completo.

En versiones futuras podrá habilitarse para el chat.

---

# 150. Manejo de Errores

Errores esperados:

- servidor no disponible;
- modelo inexistente;
- timeout;
- contexto demasiado grande;
- respuesta inválida.

Todos deberán convertirse en errores de dominio.

Nunca exponer errores internos.

---

# 151. Modo Mock

Para pruebas automáticas.

Implementar un MockProvider.

Devuelve respuestas predefinidas.

No requiere modelo.

No requiere llama.cpp.

---

# 152. Seguridad

Nunca permitir:

- ejecución de comandos;
- lectura de archivos arbitrarios;
- acceso a Internet desde el modelo.

El modelo trabajará exclusivamente con el contexto recibido.

---

# 153. Escalabilidad

El diseño permitirá incorporar nuevos proveedores.

Ejemplos:

- Ollama.
- vLLM.
- LM Studio.
- TensorRT-LLM.
- OpenAI (solo si se decide en el futuro).

Sin modificar la lógica del negocio.

---

# 154. Objetivo Final

El resto del sistema deberá poder cambiar de modelo simplemente modificando un archivo de configuración.

El dominio nunca deberá saber si el reporte fue generado por:

- Qwen.
- Llama.
- Gemma.
- Mistral.
- Otro modelo.

El Intelligence Engine siempre trabajará contra una interfaz estable.

---

Fin de la Parte 6.
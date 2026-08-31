// Temarios de referencia para exámenes de admisión estandarizados en México
// (EXANI-I/II del CENEVAL, PAA del College Board). Son áreas y temas típicos
// de este tipo de examen, redactados con conocimiento general — NO son el
// temario oficial vigente descargado de CENEVAL, College Board ni de
// ninguna institución. Se muestra el aviso correspondiente en la UI
// (StandardizedTopicsPicker, AdmissionTargetPicker) y se repite aquí para
// quien edite esta lista en el futuro.
export interface StandardizedTopicTemplate {
  id: string;
  // Código corto de la familia de examen — se usa para agrupar plantillas y
  // para nombrar la materia que se autogenera al elegir una universidad
  // destino (ver admissionExamService.ts). `examGroup` es la etiqueta larga
  // para mostrar en UI.
  familyId: string;
  examGroup: string;
  label: string;
  topics: string[];
}

export const STANDARDIZED_TOPIC_TEMPLATES: StandardizedTopicTemplate[] = [
  {
    id: "exani2-matematico",
    familyId: "EXANI-II",
    examGroup: "EXANI-II (ingreso a licenciatura)",
    label: "Pensamiento matemático",
    topics: [
      "Aritmética y proporcionalidad",
      "Álgebra básica",
      "Funciones y su representación gráfica",
      "Geometría y trigonometría",
      "Probabilidad",
      "Estadística descriptiva",
      "Interpretación de datos y gráficas",
    ],
  },
  {
    id: "exani2-lectora",
    familyId: "EXANI-II",
    examGroup: "EXANI-II (ingreso a licenciatura)",
    label: "Comprensión lectora",
    topics: [
      "Idea principal y propósito del texto",
      "Inferencias y conclusiones",
      "Vocabulario en contexto",
      "Estructura y coherencia textual",
      "Comparación entre textos",
      "Identificación de argumentos y falacias",
    ],
  },
  {
    id: "exani2-cientifico",
    familyId: "EXANI-II",
    examGroup: "EXANI-II (ingreso a licenciatura)",
    label: "Pensamiento científico",
    topics: [
      "Método científico y diseño experimental",
      "Interpretación de resultados y evidencia",
      "Conceptos básicos de física",
      "Conceptos básicos de química",
      "Conceptos básicos de biología",
      "Razonamiento causal",
    ],
  },
  {
    id: "exani1-matematicas",
    familyId: "EXANI-I",
    examGroup: "EXANI-I (ingreso a bachillerato)",
    label: "Habilidad matemática",
    topics: [
      "Operaciones con números enteros y fraccionarios",
      "Álgebra elemental",
      "Geometría plana",
      "Proporcionalidad y porcentajes",
      "Sucesiones y patrones",
      "Lectura de tablas y gráficas",
    ],
  },
  {
    id: "exani1-espanol",
    familyId: "EXANI-I",
    examGroup: "EXANI-I (ingreso a bachillerato)",
    label: "Español y redacción",
    topics: [
      "Comprensión de lectura",
      "Ortografía y puntuación",
      "Gramática y sintaxis",
      "Coherencia y cohesión textual",
      "Tipos de texto",
      "Vocabulario",
    ],
  },
  // PAA (Prueba de Aptitud Académica) del College Board — usada por Tec de
  // Monterrey, UDEM y otras universidades privadas. A diferencia de EXANI,
  // es una prueba de razonamiento/aptitud, no de contenido curricular por
  // materia — por eso las áreas de abajo son de habilidades, no de temas.
  {
    id: "paa-verbal",
    familyId: "PAA",
    examGroup: "PAA (College Board — Tec de Monterrey, UDEM y otras privadas)",
    label: "Razonamiento verbal",
    topics: [
      "Analogías verbales",
      "Comprensión de lectura",
      "Completar oraciones",
      "Antónimos y sinónimos en contexto",
      "Vocabulario",
    ],
  },
  {
    id: "paa-matematico",
    familyId: "PAA",
    examGroup: "PAA (College Board — Tec de Monterrey, UDEM y otras privadas)",
    label: "Razonamiento matemático",
    topics: [
      "Razonamiento aritmético",
      "Álgebra básica",
      "Geometría y medición",
      "Comparación cuantitativa",
      "Interpretación de datos",
    ],
  },
  {
    id: "paa-redaccion",
    familyId: "PAA",
    examGroup: "PAA (College Board — Tec de Monterrey, UDEM y otras privadas)",
    label: "Redacción indirecta",
    topics: [
      "Corrección de errores gramaticales",
      "Coherencia y cohesión de párrafos",
      "Uso de conectores",
      "Puntuación",
    ],
  },
];

// Universidad destino → familia de examen que le toca (ver investigación en
// la conversación del proyecto): Tec y UDEM usan la PAA del College Board;
// UANL usa el EXANI-II de CENEVAL directo. UANL agrega además un módulo
// específico por carrera del que no hay temario público verificable — no
// se incluye aquí por esa razón.
export interface AdmissionTarget {
  id: string;
  name: string;
  familyId: string;
}

export const ADMISSION_TARGETS: AdmissionTarget[] = [
  { id: "tec", name: "Tec de Monterrey", familyId: "PAA" },
  { id: "udem", name: "UDEM", familyId: "PAA" },
  { id: "uanl", name: "UANL", familyId: "EXANI-II" },
  { id: "otra-privada", name: "Otra universidad privada", familyId: "PAA" },
  { id: "otra-publica", name: "Otra universidad pública", familyId: "EXANI-II" },
  { id: "bachillerato", name: "Ingreso a bachillerato / prepa", familyId: "EXANI-I" },
];

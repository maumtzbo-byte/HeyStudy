// Temarios de referencia para exámenes de admisión estandarizados en México
// (EXANI-I/II del CENEVAL y equivalentes). Son áreas y temas típicos de este
// tipo de examen, redactados con conocimiento general — NO son el temario
// oficial vigente descargado de CENEVAL ni de ninguna institución. Se
// muestra el aviso correspondiente en la UI (StandardizedTopicsPicker) y se
// repite aquí para quien edite esta lista en el futuro.
export interface StandardizedTopicTemplate {
  id: string;
  label: string;
  examGroup: string;
  topics: string[];
}

export const STANDARDIZED_TOPIC_TEMPLATES: StandardizedTopicTemplate[] = [
  {
    id: "exani2-matematico",
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
];

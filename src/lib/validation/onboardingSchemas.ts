import { z } from "zod";
import { ADMISSION_TARGETS } from "@/lib/data/standardizedExams";

// Solo prepa/universidad/otro: es lo que el producto realmente sirve (ver
// el propio landing — "Hecho para prepa, universidad y exámenes de
// admisión"). Ofrecer primaria/secundaria en el selector invitaba a niños
// muy por debajo del público real a crear una cuenta, sin ningún control
// de edad. El enum de Prisma conserva PRIMARIA/SECUNDARIA por compatibilidad
// con filas existentes; aquí simplemente no se ofrecen como opción nueva.
export const educationLevels = ["PREPARATORIA", "UNIVERSIDAD", "OTRO"] as const;

// Personalización: si el estudiante prefiere video, el plan de estudio le
// sugiere videos de YouTube para sus temas más débiles (ver videoService.ts).
export const studyMethods = ["VIDEOS", "LECTURA", "PRACTICA", "MIXTO"] as const;

// Link de suscripción de calendario (ICS/webcal) de la plataforma de la
// escuela — cualquiera que la exporte (Toddle, Classroom, Canvas, Moodle,
// etc.). Opcional: muchos estudiantes no lo tendrán a la mano al
// registrarse, y también se puede agregar después desde el perfil.
export const schoolCalendarUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || z.string().url().safeParse(v).success, "Ese link no se ve válido")
  .transform((v) => (v === "" ? null : v));

// Examen de admisión al que se está preparando, si aplica. Es lo que
// permite que el dashboard nazca con un temario real cargado en vez de con
// seis ceros: al elegir uno, el onboarding siembra las áreas de esa familia
// de examen (ver onboardingService), sin gastar una llamada de IA.
const admissionTargetIds = ADMISSION_TARGETS.map((t) => t.id) as [string, ...string[]];

export const onboardingSchema = z
  .object({
    displayName: z.string().min(1, "Cuéntanos cómo te llamas").max(80),
    educationLevel: z.enum(educationLevels),
    preferredStudyMethod: z.enum(studyMethods),
    admissionTargetId: z
      .string()
      .nullish()
      .transform((v) => (v && v !== "" ? v : null))
      .refine((v) => v === null || admissionTargetIds.includes(v), "Ese examen no está en la lista"),
    subjectNames: z.array(z.string().min(1).max(60)).max(20, "Máximo 20 materias"),
    schoolCalendarUrl: schoolCalendarUrlSchema,
    ageConfirmed: z
      .string()
      .nullish()
      .refine((v) => v === "on", "Confirma tu edad y los términos para continuar"),
  })
  // Las materias dejan de ser obligatorias cuando hay examen de admisión:
  // a quien sólo se está preparando para la PAA pedirle además que teclee
  // sus materias de la escuela es fricción sin valor, y de todos modos va a
  // terminar con una materia sembrada. Lo que sí se exige es al menos una
  // de las dos cosas, para que nadie llegue al dashboard sin nada que hacer.
  .superRefine((data, ctx) => {
    if (!data.admissionTargetId && data.subjectNames.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["subjectNames"],
        message: "Agrega al menos una materia, o elige el examen de admisión que vas a presentar",
      });
    }
  });

export type OnboardingInput = z.infer<typeof onboardingSchema>;

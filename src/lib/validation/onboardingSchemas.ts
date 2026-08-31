import { z } from "zod";

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

export const onboardingSchema = z.object({
  displayName: z.string().min(1, "Cuéntanos cómo te llamas").max(80),
  educationLevel: z.enum(educationLevels),
  preferredStudyMethod: z.enum(studyMethods),
  subjectNames: z
    .array(z.string().min(1).max(60))
    .min(1, "Agrega al menos una materia")
    .max(20, "Máximo 20 materias"),
  schoolCalendarUrl: schoolCalendarUrlSchema,
  ageConfirmed: z
    .string()
    .nullish()
    .refine((v) => v === "on", "Confirma tu edad y los términos para continuar"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

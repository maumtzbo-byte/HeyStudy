import { z } from "zod";

export const educationLevels = ["PRIMARIA", "SECUNDARIA", "PREPARATORIA", "UNIVERSIDAD", "OTRO"] as const;

export const onboardingSchema = z.object({
  displayName: z.string().min(1, "Cuéntanos cómo te llamas").max(80),
  educationLevel: z.enum(educationLevels),
  subjectNames: z
    .array(z.string().min(1).max(60))
    .min(1, "Agrega al menos una materia")
    .max(20, "Máximo 20 materias"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

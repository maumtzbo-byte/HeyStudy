// Nombre del bucket de Supabase Storage para Study Drops — compartido entre
// el servicio (server-only, sube/borra/firma) y el formulario de subida
// (cliente, sube directo a Storage con la signed URL). Un solo lugar para
// que no diverjan si el bucket cambia de nombre.
export const STUDY_DROPS_BUCKET = "study-drops";

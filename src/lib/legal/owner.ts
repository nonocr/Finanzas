// Quién responde por Finanzas y sus datos («responsable de la base de datos», Ley 8968 art. 3 h y art. 5.1 h: hay
// que informar su «identidad y dirección»). Lo muestran la Política de privacidad, los Términos y /eliminar-cuenta.
//
// PENDIENTE (lo decide la dueña; ver docs/legal/revision-legal.md): mientras un campo esté en null, los documentos
// usan un texto genérico que no inventa datos («una persona particular en Costa Rica» y «responde a cualquier correo
// de Finanzas»). Ese texto genérico NO cumple del todo el art. 5.1 h: complétalo antes de publicar en las tiendas.
// - name: nombre de la persona (o empresa) responsable, como debe figurar públicamente.
// - address: dirección de contacto (puede ser un apartado o domicilio para notificaciones; que lo valide un abogado).
// - email: correo para ejercer derechos y pedir la eliminación de la cuenta (también va en las fichas de las tiendas).
export interface LegalOwner {
  name: string | null;
  address: string | null;
  email: string | null;
}

export const LEGAL_OWNER: LegalOwner = {
  name: null,
  address: null,
  email: null,
};

// src/app/api/seed/route.ts
// DESHABILITADO: este endpoint HTTP queda desactivado permanentemente.
// Alternativa canonica: `npm run seed` (prisma/seed.ts).
// El seed no debe exponerse como endpoint HTTP por razones de seguridad.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "Este endpoint esta deshabilitado. Usar el script interno: npm run seed",
    },
    { status: 410 },
  );
}

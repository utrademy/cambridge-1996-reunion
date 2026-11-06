import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isVercelBlobConfigured } from "@/lib/blobStorage";

export const ADMIN_SESSION_COOKIE = "cambridge96_admin_session";

export async function isAuthorizedAdminRequest(): Promise<{
  authorized: boolean;
  email: string;
  role: "admin" | "editor";
  mode: "vercel-blob" | "github-static";
}> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const mode = isVercelBlobConfigured() ? "vercel-blob" : "github-static";

  if (sessionCookie === "authenticated-admin") {
    return {
      authorized: true,
      email: "comite1996@newcambridge1996.local",
      role: "admin",
      mode,
    };
  }

  return {
    authorized: false,
    email: "",
    role: "editor",
    mode,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, passcode } = body as {
      action?: "login" | "logout";
      passcode?: string;
    };

    const cookieStore = await cookies();

    if (action === "logout") {
      cookieStore.delete(ADMIN_SESSION_COOKIE);
      return NextResponse.json({ ok: true });
    }

    const expectedPasscode =
      process.env.ADMIN_PASSCODE ||
      process.env.ADMIN_DEMO_PASSCODE ||
      "cambridge1996-demo";

    if (!passcode || passcode.trim() !== expectedPasscode) {
      return NextResponse.json(
        { error: "Clave de administrador incorrecta." },
        { status: 401 }
      );
    }

    cookieStore.set(ADMIN_SESSION_COOKIE, "authenticated-admin", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return NextResponse.json({
      ok: true,
      email: "comite1996@newcambridge1996.local",
      role: "admin",
    });
  } catch {
    return NextResponse.json(
      { error: "Error al procesar autenticación." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { contentRepository } from "@/lib/contentRepository";
import { isAuthorizedAdminRequest } from "../auth/route";

export async function GET() {
  const auth = await isAuthorizedAdminRequest();
  if (!auth.authorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const backup = await contentRepository.exportBackupBundle();

  return new NextResponse(JSON.stringify(backup, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="cambridge-1996-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}

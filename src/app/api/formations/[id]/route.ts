import { NextResponse } from "next/server";
import { remove } from "@/lib/json-db";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const success = remove("formations", params.id);
  return NextResponse.json({ ok: success });
}

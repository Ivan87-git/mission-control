import { NextRequest, NextResponse } from "next/server";
import { getProjectCanonicalDataByMcId } from "@/lib/vault";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getProjectCanonicalDataByMcId(id);
  if (!data) return NextResponse.json({ error: "No canonical vault data found" }, { status: 404 });
  return NextResponse.json(data);
}

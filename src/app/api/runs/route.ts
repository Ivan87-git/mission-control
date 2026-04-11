import { NextRequest, NextResponse } from "next/server";
import { getMissionRuns } from "@/lib/runs";

export async function GET(req: NextRequest) {
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "25", 10), 100);
  const projectId = req.nextUrl.searchParams.get("project_id");
  const runs = getMissionRuns(limit, projectId);
  return NextResponse.json(runs);
}

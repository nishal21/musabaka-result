import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ResultsPdfDocument } from "@/lib/pdf-document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ itemId: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { itemId } = await ctx.params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      judge1: true,
      judge2: true,
      participants: {
        orderBy: { slNo: "asc" },
        include: { scores: true },
      },
    },
  });
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = item.participants.map((p) => {
    const s1 = p.scores.find((s) => s.judgeId === item.judge1Id);
    const s2 = p.scores.find((s) => s.judgeId === item.judge2Id);
    const total =
      s1?.mark != null && s2?.mark != null ? s1.mark + s2.mark : null;
    return {
      slNo: p.slNo,
      chestNo: p.chestNo,
      codeLetter: p.codeLetter,
      j1Mark: s1?.mark ?? null,
      j2Mark: s2?.mark ?? null,
      total,
      j1Grade: s1?.grade ?? null,
      j2Grade: s2?.grade ?? null,
      remark: [s1?.remark && `J1: ${s1.remark}`, s2?.remark && `J2: ${s2.remark}`]
        .filter(Boolean)
        .join(" | "),
      placement: p.placement,
    };
  });

  const buffer = await renderToBuffer(
    ResultsPdfDocument({
      itemName: item.name,
      itemCode: item.code,
      judge1Name: item.judge1.name,
      judge2Name: item.judge2.name,
      rows,
    }),
  );

  const filename = `${item.code}-results.pdf`;
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { SITE } from "@/lib/site";
import { placementLabel } from "@/lib/utils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} placements`;

const colors: Record<number, string> = { 1: "#008d36", 2: "#0088cc", 3: "#a62126" };

export default async function Image({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: {
      name: true,
      code: true,
      publishedAt: true,
      participants: {
        where: { placement: { gte: 1, lte: 3 } },
        orderBy: { placement: "asc" },
        select: { chestNo: true, placement: true },
      },
    },
  });
  const published = Boolean(item?.publishedAt);
  const podium = published ? (item?.participants ?? []) : [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fbfaf7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", height: 16 }}>
          <div style={{ flex: 1, background: colors[1] }} />
          <div style={{ flex: 1, background: colors[2] }} />
          <div style={{ flex: 1, background: colors[3] }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, padding: "48px 64px" }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4, color: "#475569" }}>
            {SITE.name.toUpperCase()}
          </div>
          {item?.code ? (
            <div style={{ marginTop: 18, fontSize: 26, fontWeight: 700, color: colors[2], letterSpacing: 3 }}>
              {item.code}
            </div>
          ) : null}
          <div
            style={{
              marginTop: 6,
              fontSize: 64,
              fontWeight: 800,
              color: "#0f172a",
              textAlign: "center",
              lineHeight: 1.1,
              maxWidth: 1050,
            }}
          >
            {item?.name ?? "Results"}
          </div>
          {podium.length > 0 ? (
            <div style={{ display: "flex", gap: 28, marginTop: 44 }}>
              {podium.map((p) => (
                <div
                  key={`${p.placement}-${p.chestNo}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: 260,
                    padding: "22px 0",
                    borderRadius: 24,
                    background: "#ffffff",
                    border: `4px solid ${colors[p.placement ?? 1]}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: "#fff",
                      background: colors[p.placement ?? 1],
                      padding: "4px 20px",
                      borderRadius: 999,
                    }}
                  >
                    {placementLabel(p.placement ?? 0)}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 20, color: "#64748b", letterSpacing: 2 }}>CHEST NO</div>
                  <div style={{ fontSize: 64, fontWeight: 800, color: colors[p.placement ?? 1] }}>{p.chestNo}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ marginTop: 48, fontSize: 32, color: "#64748b" }}>
              {published ? "Placements announced" : "Results coming soon"}
            </div>
          )}
        </div>
      </div>
    ),
    size,
  );
}

import { AppHeader, Button, EmptyState, LinkButton, PageTitle } from "@/components/ui/primitives";
import { ItemsBoard } from "@/components/ItemsBoard";
import { adminLogoutAction } from "@/lib/actions";
import { ensureAdminSeeded, prisma } from "@/lib/db";
import { judgeLink } from "@/lib/utils";

export default async function AdminDashboardPage() {
  await ensureAdminSeeded();
  const items = await prisma.item.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      judge1: true,
      judge2: true,
      submissions: true,
      _count: { select: { participants: true } },
    },
  });

  const board = items.map((item) => {
    const done = (id: string) =>
      Boolean(item.submissions.find((s) => s.judgeId === id)?.submittedAt);
    const j1Done = done(item.judge1Id);
    const j2Done = done(item.judge2Id);
    const status = item.publishedAt
      ? ("published" as const)
      : j1Done && j2Done && item._count.participants > 0
        ? ("ready" as const)
        : item._count.participants > 0
          ? ("scoring" as const)
          : ("draft" as const);
    return {
      id: item.id,
      name: item.name,
      code: item.code,
      participants: item._count.participants,
      judge1: item.judge1.name,
      judge2: item.judge2.name,
      j1Done,
      j2Done,
      status,
      judgeUrl: judgeLink(item.privateToken),
    };
  });

  const stats = [
    { label: "Items", value: board.length, tone: "text-ink" },
    { label: "Scoring", value: board.filter((b) => b.status === "scoring").length, tone: "text-brand-blue" },
    { label: "Ready", value: board.filter((b) => b.status === "ready").length, tone: "text-brand-green" },
    { label: "Published", value: board.filter((b) => b.status === "published").length, tone: "text-ink" },
  ];

  return (
    <div className="min-h-dvh">
      <AppHeader
        nav
        active="items"
        right={
          <form action={adminLogoutAction}>
            <Button variant="ghost" size="sm" type="submit">
              Logout
            </Button>
          </form>
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <PageTitle
          title="Items"
          sub="Create, score, place and publish."
          action={<LinkButton href="/admin/items/new">+ New item</LinkButton>}
        />

        {board.length === 0 ? (
          <EmptyState
            title="No items yet"
            body="Add judges first, then create an item and assign two of them."
            action={<LinkButton href="/admin/items/new">Create first item</LinkButton>}
          />
        ) : (
          <>
            <dl className="card mb-6 grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
              {stats.map((s) => (
                <div key={s.label} className="px-4 py-3.5 sm:px-5">
                  <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink-muted">{s.label}</dt>
                  <dd className={`tabular mt-0.5 font-display text-2xl font-extrabold ${s.tone}`}>{s.value}</dd>
                </div>
              ))}
            </dl>
            <ItemsBoard items={board} />
          </>
        )}
      </main>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui";
import { Icon } from "@/components/icon";
import { formatDuration, formatRelative } from "@/lib/utils";

export default async function SessionsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const sessions = await prisma.streamSession.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: "desc" },
    take: 200,
  });
  return (
    <div className="page-shell fade-in">
      <div className="page-head">
        <div>
          <h1 className="text-h1">Sessions</h1>
          <p>Recent translation sessions, with anonymized metrics.</p>
        </div>
      </div>
      {sessions.length === 0 ? (
        <Card>
          <div style={{ padding: 48, textAlign: "center" }}>
            <Icon name="history" size={36} className="text-faint" />
            <h3 className="text-h3" style={{ margin: "12px 0 6px" }}>
              No sessions yet
            </h3>
            <p className="text-muted text-sm">Sessions appear here as you stream.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Duration</th>
                <th>Pair</th>
                <th>Chars</th>
                <th>Deepgram</th>
                <th>DeepL</th>
                <th>Errors</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{formatRelative(s.startedAt)}</td>
                  <td>{formatDuration(s.durationSec)}</td>
                  <td className="text-mono text-sm">
                    {s.sourceLanguage} → {s.targetLanguage}
                  </td>
                  <td className="text-tnum">{s.charsTranslated?.toLocaleString() ?? "—"}</td>
                  <td className="text-tnum text-muted">{s.deepgramReqCount ?? "—"}</td>
                  <td className="text-tnum text-muted">{s.deeplReqCount ?? "—"}</td>
                  <td className="text-tnum text-muted">{s.errorCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

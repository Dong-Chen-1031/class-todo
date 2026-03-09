export interface Homework {
  id?: string;
  subject: string;
  deadline: string;
  name: string;
}

const BADGE_PALETTE = [
  "bg-red-100 text-red-700 ring-red-200",
  "bg-blue-100 text-blue-700 ring-blue-200",
  "bg-indigo-100 text-indigo-700 ring-indigo-200",
  "bg-cyan-100 text-cyan-700 ring-cyan-200",
  "bg-green-100 text-green-700 ring-green-200",
  "bg-emerald-100 text-emerald-700 ring-emerald-200",
  "bg-amber-100 text-amber-700 ring-amber-200",
  "bg-orange-100 text-orange-700 ring-orange-200",
  "bg-purple-100 text-purple-700 ring-purple-200",
  "bg-pink-100 text-pink-700 ring-pink-200",
  "bg-rose-100 text-rose-700 ring-rose-200",
  "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-200",
  "bg-teal-100 text-teal-700 ring-teal-200",
  "bg-sky-100 text-sky-700 ring-sky-200",
  "bg-lime-100 text-lime-700 ring-lime-200",
  "bg-yellow-100 text-yellow-700 ring-yellow-200",
];

function subjectBadge(subject: string): string {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
  }
  return BADGE_PALETTE[hash % BADGE_PALETTE.length];
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function DueBadge({
  dateStr,
  isHistory,
}: {
  dateStr: string;
  isHistory?: boolean;
}) {
  const days = getDaysUntil(dateStr);
  if (isHistory) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-500/10">
        已結束
      </span>
    );
  }
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-500/10">
        <span>逾期</span>{" "}
        <span className="text-[10px]">({Math.abs(days)} 天)</span>
      </span>
    );
  }
  if (days === 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600 ring-1 ring-inset ring-orange-500/10">
        今天截止
      </span>
    );
  if (days === 1)
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-600 ring-1 ring-inset ring-amber-500/10">
        明天截止
      </span>
    );
  if (days <= 3)
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-600 ring-1 ring-inset ring-yellow-500/10">
        {days} 天後
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500">
      {days} 天後
    </span>
  );
}

function HomeworkCard({
  hw,
  isHistory,
}: {
  hw: Homework;
  isHistory?: boolean;
}) {
  const days = getDaysUntil(hw.deadline);
  const isOverdue = !isHistory && days < 0;
  const badgeClass = subjectBadge(hw.subject);

  return (
    <div
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/5 hover:ring-blue-100 ${
        isOverdue ? "opacity-60 bg-slate-50/50" : ""
      } ${isHistory ? "opacity-80 bg-slate-50/50" : ""}`}
    >
      <div className="flex items-start sm:items-center gap-4 min-w-0">
        <span
          className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold tracking-widest ring-1 ring-inset ${badgeClass}`}
        >
          {hw.subject}
        </span>
        <span className="text-lg font-semibold text-slate-800 transition-colors group-hover:text-blue-600 wrap-break-word line-clamp-2">
          {hw.name}
        </span>
      </div>
      <div className="shrink-0 flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1 mt-2 sm:mt-0">
        <p className="text-sm font-medium text-slate-500 order-2 sm:order-1">
          {formatDate(hw.deadline)}
        </p>
        <div className="order-1 sm:order-2">
          <DueBadge dateStr={hw.deadline} isHistory={isHistory} />
        </div>
      </div>
    </div>
  );
}

export default function HomeworkList({
  homeworks,
  isHistory = false,
}: {
  homeworks: Homework[];
  isHistory?: boolean;
}) {
  const upcoming = homeworks.filter((h) => getDaysUntil(h.deadline) >= 0);
  const overdue = homeworks.filter((h) => getDaysUntil(h.deadline) < 0);

  if (homeworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-4xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-50"></div>
          <span className="text-4xl relative z-10">🎉</span>
        </div>
        <p className="text-xl font-bold text-slate-800">目前沒有待繳作業</p>
        <p className="mt-2 text-sm text-slate-500">
          太棒了！去享受你的休息時間吧！
        </p>
      </div>
    );
  }

  if (isHistory) {
    return (
      <div className="space-y-3">
        {homeworks.map((hw, i) => (
          <HomeworkCard
            key={hw.id || `history-${i}`}
            hw={hw}
            isHistory={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* overdue */}
      {overdue.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-red-400">
            已逾期 ({overdue.length})
          </h2>
          <div className="space-y-3">
            {overdue.map((hw, i) => (
              <HomeworkCard key={hw.id || `overdue-${i}`} hw={hw} />
            ))}
          </div>
        </section>
      )}

      {/* upcoming */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-400">
            待繳作業 ({upcoming.length})
          </h2>
          <div className="space-y-3">
            {upcoming.map((hw, i) => (
              <HomeworkCard key={hw.id || `upcoming-${i}`} hw={hw} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

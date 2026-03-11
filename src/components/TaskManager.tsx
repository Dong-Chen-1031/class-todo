import { useState, useCallback, useEffect } from "react";
import HomeworkList, { type Homework } from "./HomeworkList";

interface TaskManagerProps {
  initialHomeworks: Homework[];
}

export default function TaskManager({ initialHomeworks }: TaskManagerProps) {
  const [tab, setTab] = useState<"active" | "history">("active");
  const [historyHw, setHistoryHw] = useState<Homework[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (currentCursor: string | null) => {
      if (isLoading || (!hasMore && currentCursor !== null)) return;
      setIsLoading(true);
      setError(null);
      try {
        const url = currentCursor
          ? `/api/history?cursor=${encodeURIComponent(currentCursor)}`
          : "/api/history";

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("取得歷史資料失敗");
        }
        const data = await res.json();
        setHistoryHw((prev) =>
          currentCursor ? [...prev, ...data.homeworks] : data.homeworks,
        );
        setCursor(data.next_cursor || null);
        setHasMore(data.has_more);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, hasMore],
  );

  // Load initial history when switching tab
  useEffect(() => {
    if (
      tab === "history" &&
      historyHw.length === 0 &&
      hasMore &&
      !isLoading &&
      !error
    ) {
      fetchHistory(null);
    }
  }, [tab, historyHw.length, hasMore, isLoading, error, fetchHistory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-sm ring-1 ring-blue-200">
            <span className="text-xl leading-none">
              {tab === "active" ? "📚" : "🗂️"}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">
            {tab === "active" ? "任務清單" : "歷史作業"}
          </h2>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab("active")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "active"
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            待繳作業
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "history"
                ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            歷史作業
          </button>
        </div>
      </div>

      {tab === "active" ? (
        <HomeworkList homeworks={initialHomeworks} />
      ) : (
        <div className="space-y-6">
          {error ? (
            <p className="text-sm text-red-500 font-medium text-center">
              ⚠️ {error}
            </p>
          ) : (
            <>
              {historyHw.length > 0 ? (
                <HomeworkList homeworks={historyHw} isHistory={true} />
              ) : (
                !isLoading && (
                  <div className="text-center py-10 text-slate-500">
                    沒有歷史作業
                  </div>
                )
              )}

              {hasMore && (
                <div className="flex justify-center pt-2 pb-6">
                  <button
                    onClick={() => fetchHistory(cursor)}
                    disabled={isLoading}
                    className="px-5 py-2.5 rounded-xl bg-slate-50 text-slate-600 text-sm font-semibold ring-1 ring-inset ring-slate-200 hover:bg-slate-100 hover:text-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "載入中..." : "載入更多"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

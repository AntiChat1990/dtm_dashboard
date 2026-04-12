import Link from "next/link";

export const KeepingPrrEmptyState = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg rounded-2xl border border-zinc-300 bg-white/85 p-6 text-center text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200">
        <p className="text-lg font-semibold">Нет данных для раздела &quot;Остатки и обороты&quot;</p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Добавьте файлы формата <code className="font-mono">.xlsx</code> в{" "}
          <code className="font-mono">excel_data/keeping_prr/&lt;склад&gt;</code>.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          Открыть дашборд выручки
        </Link>
      </div>
    </main>
  );
};

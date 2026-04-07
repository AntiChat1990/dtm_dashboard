export const EmptyState = () => {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md rounded-2xl border border-zinc-300 bg-white/80 p-6 text-center text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200">
        Не найдены Excel-файлы в папке <code className="font-mono">excel_data</code>.
      </div>
    </main>
  );
};

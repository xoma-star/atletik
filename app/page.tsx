export default async function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  const {visitors} = await fetch(`${baseUrl}/api/stats`).then(r => r.json());

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        Кол-во посетителей: {visitors}
      </main>
    </div>
  );
}

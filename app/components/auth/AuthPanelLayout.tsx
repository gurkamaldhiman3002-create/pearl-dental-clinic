import type { ReactNode } from "react";

export default function AuthPanelLayout({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="flex min-h-screen items-center bg-slate-50 px-6 py-12 text-slate-900 lg:px-8">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-blue-950 p-8 text-white sm:p-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-sky-200">
            Pearl Dental Clinic
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-5 leading-7 text-blue-100">{description}</p>
        </div>

        <div className="p-8 sm:p-10">{children}</div>
      </section>
    </main>
  );
}

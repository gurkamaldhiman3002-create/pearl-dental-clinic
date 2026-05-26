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
    <main className="pearl-editorial flex min-h-screen items-center bg-[#fbf8f1] px-6 py-12 text-[#303937] lg:px-8">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-[#eadfcf] bg-[#fffdf9] shadow-xl shadow-[#183f41]/10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-[#183f41] p-8 text-white sm:p-10">
          <p className="mb-3 text-sm font-semibold text-[#dfc58c]">
            Pearl Dental Clinic
          </p>
          <h1 className="text-4xl text-white sm:text-5xl">{title}</h1>
          <p className="mt-5 leading-7 text-[#eee6da]">{description}</p>
          <p className="pearl-handwritten mt-10 text-3xl text-[#dfc58c]">
            My care... your smile
          </p>
        </div>

        <div className="p-8 sm:p-10">{children}</div>
      </section>
    </main>
  );
}

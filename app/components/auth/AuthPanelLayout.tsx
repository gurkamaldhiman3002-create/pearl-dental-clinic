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
    <main className="pearl-editorial pearl-page-gradient flex min-h-screen items-center px-6 py-12 text-[#24302F] lg:px-8">
      <section className="pearl-surface mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-gradient-to-br from-[#173D3F] to-[#204B4D] p-8 text-white sm:p-10">
          <p className="pearl-kicker pearl-kicker-light mb-3">
            Pearl Dental Clinic
          </p>
          <h1 className="pearl-section-title text-white">{title}</h1>
          <p className="mt-5 leading-7 text-[#eee6da]">{description}</p>
          <p className="pearl-handwritten mt-10 text-3xl text-[#C9A86A]">
            My care... your smile
          </p>
        </div>

        <div className="p-8 sm:p-10">{children}</div>
      </section>
    </main>
  );
}

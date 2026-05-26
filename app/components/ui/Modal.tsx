import type { ReactNode } from "react";

export default function Modal({
  children,
  eyebrow,
  label,
  maxWidth = "2xl",
  onClose,
  title,
}: {
  children: ReactNode;
  eyebrow?: string;
  label?: string;
  maxWidth?: "xl" | "2xl";
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#183f41]/45 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-label={label ?? title}
        aria-modal="true"
        className={`max-h-full w-full overflow-y-auto rounded-2xl border border-[#eadfcf] bg-[#fffdf9] shadow-2xl shadow-[#183f41]/20 ${
          maxWidth === "xl" ? "max-w-xl" : "max-w-2xl"
        }`}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-[#eadfcf] px-6 py-5">
          <div>
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase text-[#86632f]">
                {eyebrow}
              </p>
            ) : null}
            <h3
              className={`pearl-serif text-3xl text-[#183f41] ${
                eyebrow ? "mt-1" : ""
              }`}
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadfcf] text-lg text-slate-500 transition hover:border-[#dbc59b] hover:bg-[#f5efe4] hover:text-[#23575a]"
            aria-label="Close"
          >
            x
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

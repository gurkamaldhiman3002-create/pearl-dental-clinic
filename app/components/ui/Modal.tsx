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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-blue-950/45 px-4 py-8 backdrop-blur-sm"
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
        className={`max-h-full w-full overflow-y-auto rounded-lg border border-sky-100 bg-white shadow-2xl shadow-blue-950/20 ${
          maxWidth === "xl" ? "max-w-xl" : "max-w-2xl"
        }`}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-sky-100 px-6 py-5">
          <div>
            {eyebrow ? (
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
                {eyebrow}
              </p>
            ) : null}
            <h3
              className={`text-xl font-bold text-blue-950 ${
                eyebrow ? "mt-1" : ""
              }`}
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-100 text-lg text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
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

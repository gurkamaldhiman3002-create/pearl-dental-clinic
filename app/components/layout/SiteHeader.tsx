"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavigationLink = {
  href: string;
  label: string;
};

const navLinks: NavigationLink[] = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#booking", label: "Book Appointment" },
  { href: "/#contact", label: "Contact" },
  { href: "/feedback", label: "Feedback" },
];

const accountLinks: NavigationLink[] = [
  { href: "/patient/dashboard", label: "Patient Dashboard" },
  { href: "/patient/login", label: "Patient Login" },
  { href: "/admin", label: "Admin Portal" },
];

function getPathFromHref(href: string) {
  return href.split("#")[0] || "/";
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const isActive = (href: string) => {
    const [path, targetHash] = href.split("#");
    const normalizedPath = path || "/";

    if (targetHash) {
      return pathname === normalizedPath && hash === `#${targetHash}`;
    }

    if (normalizedPath === "/") {
      return pathname === "/" && !hash;
    }

    return pathname === getPathFromHref(href);
  };

  const navLinkClass = (href: string) => {
    if (href === "/#booking") {
      return `rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
        isActive(href)
          ? "bg-[#183f41] text-white"
          : "bg-[#205356] text-white hover:bg-[#183f41] hover:shadow-md"
      }`;
    }

    return `rounded-full px-4 py-2.5 text-sm font-semibold transition ${
      isActive(href)
        ? "bg-[#f2e8d7] text-[#183f41]"
        : "text-[#596562] hover:bg-[#f5efe4] hover:text-[#183f41]"
    }`;
  };

  const isAccountActive =
    pathname.startsWith("/patient") || pathname.startsWith("/admin");

  return (
    <header className="pearl-header sticky top-0 z-40 border-b border-[#e8dcc8]/85 bg-[#fbf8f1]/88 shadow-sm shadow-[#183f41]/[0.04] backdrop-blur-xl supports-[backdrop-filter]:bg-[#fbf8f1]/82">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-fit items-center gap-3 text-[#183f41]"
          onClick={() => setIsOpen(false)}
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#183f41] p-1 shadow-sm shadow-[#183f41]/15">
            <Image
              alt="Pearl Dental Clinic logo"
              className="h-full w-full object-contain"
              height={34}
              src="/images/logo.png.jpeg"
              width={41}
            />
          </span>
          <span>
            <span className="pearl-serif block text-2xl leading-5">
              Pearl Dental
            </span>
            <span className="mt-1 block text-xs font-semibold text-[#86632f]">
              Clinic
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:gap-2 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center lg:flex">
          <div className="relative">
            <button
              suppressHydrationWarning
              type="button"
              onClick={() =>
                setIsAccountOpen((currentValue) => !currentValue)
              }
              className={`flex items-center gap-2.5 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                isAccountActive || isAccountOpen
                  ? "border-[#d1b577] bg-[#f5efe4] text-[#183f41]"
                  : "border-[#ddcaa5] text-[#23575a] hover:border-[#c9a563] hover:bg-[#f5efe4]"
                }`}
              aria-expanded={isAccountOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ede2cd] text-xs font-bold text-[#23575a]">
                AC
              </span>
              <span>Account</span>
              <span className="text-xs text-[#66706c]">v</span>
            </button>

            {isAccountOpen ? (
              <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-xl border border-[#eadfcf] bg-[#fffdf9] p-2 shadow-xl shadow-[#183f41]/10">
                <p className="px-3 pb-2 pt-1 text-xs font-semibold text-[#86632f]">
                  Account
                </p>
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsAccountOpen(false)}
                    className={`block rounded-md px-3 py-3 text-sm font-semibold transition ${
                      isActive(link.href)
                        ? "bg-[#f2e8d7] text-[#183f41]"
                        : "text-[#596562] hover:bg-[#f5efe4] hover:text-[#183f41]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((currentValue) => !currentValue)}
            className="flex items-center gap-2 rounded-full border border-[#ddcaa5] px-4 py-2.5 text-sm font-semibold text-[#23575a] transition hover:border-[#c9a563] hover:bg-[#f5efe4]"
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            <span className="flex flex-col gap-1" aria-hidden="true">
              <span className="h-0.5 w-4 rounded-full bg-current" />
              <span className="h-0.5 w-4 rounded-full bg-current" />
              <span className="h-0.5 w-4 rounded-full bg-current" />
            </span>
            {isOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-[#e8dcc8]/85 bg-[#fbf8f1]/95 px-5 py-5 shadow-lg shadow-[#183f41]/5 backdrop-blur-xl sm:px-6 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={navLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mx-auto mt-5 grid max-w-7xl gap-2 border-t border-[#eadfcf] pt-5">
            <p className="px-3 text-xs font-semibold text-[#86632f]">
              Account
            </p>
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={navLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

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
          ? "bg-blue-800 text-white"
          : "bg-blue-700 text-white hover:bg-blue-800 hover:shadow-md"
      }`;
    }

    return `rounded-full px-4 py-2.5 text-sm font-semibold transition ${
      isActive(href)
        ? "bg-blue-50 text-blue-800"
        : "text-slate-600 hover:bg-sky-50 hover:text-blue-800"
    }`;
  };

  const isAccountActive =
    pathname.startsWith("/patient") || pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 border-b border-blue-100/80 bg-white/80 shadow-sm shadow-blue-950/[0.03] backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-fit items-center gap-3 text-blue-950"
          onClick={() => setIsOpen(false)}
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-blue-950 p-1 shadow-sm shadow-blue-950/15">
            <Image
              alt="Pearl Dental Clinic logo"
              className="h-full w-full object-contain"
              height={34}
              src="/images/logo.png.jpeg"
              width={41}
            />
          </span>
          <span>
            <span className="block text-lg font-bold leading-5 tracking-normal">
              Pearl Dental
            </span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
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
              type="button"
              onClick={() =>
                setIsAccountOpen((currentValue) => !currentValue)
              }
              className={`flex items-center gap-2.5 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                isAccountActive || isAccountOpen
                  ? "border-blue-300 bg-blue-50 text-blue-800"
                  : "border-blue-200 text-blue-800 hover:border-blue-400 hover:bg-blue-50"
                }`}
              aria-expanded={isAccountOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
                AC
              </span>
              <span>Account</span>
              <span className="text-xs text-slate-500">v</span>
            </button>

            {isAccountOpen ? (
              <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-lg border border-blue-100 bg-white p-2 shadow-xl shadow-blue-950/10">
                <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
                  Account
                </p>
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsAccountOpen(false)}
                    className={`block rounded-md px-3 py-3 text-sm font-semibold transition ${
                      isActive(link.href)
                        ? "bg-blue-50 text-blue-800"
                        : "text-slate-600 hover:bg-sky-50 hover:text-blue-800"
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
            className="flex items-center gap-2 rounded-full border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:border-blue-400 hover:bg-blue-50"
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
        <div className="border-t border-blue-100/80 bg-white/95 px-5 py-5 shadow-lg shadow-blue-950/5 backdrop-blur-xl sm:px-6 lg:hidden">
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

          <div className="mx-auto mt-5 grid max-w-7xl gap-2 border-t border-blue-50 pt-5">
            <p className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
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

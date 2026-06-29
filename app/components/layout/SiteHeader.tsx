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
  { href: "/#services", label: "Treatments" },
  { href: "/#about", label: "About" },
  { href: "/#reviews", label: "Reviews" },
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
    return `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive(href)
        ? "bg-[#EFE4D4] text-[#063B35]"
        : "text-[#6B746F] hover:bg-[#EFE4D4] hover:text-[#063B35]"
    }`;
  };

  const isAccountActive =
    pathname.startsWith("/patient") || pathname.startsWith("/admin");

  return (
    <header className="pearl-header sticky top-0 z-40 border-b border-[rgba(198,161,91,0.28)] bg-[#F7F1E8]/88 shadow-sm shadow-[#063B35]/[0.04] backdrop-blur-xl supports-[backdrop-filter]:bg-[#F7F1E8]/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-fit items-center gap-3 text-[#063B35]"
          onClick={() => setIsOpen(false)}
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[#063B35] p-1 shadow-sm shadow-[#063B35]/15">
            <Image
              alt="Pearl Dental Clinic logo"
              className="h-full w-full object-contain"
              height={34}
              src="/images/logo.png"
              width={41}
            />
          </span>
          <span>
            <span className="pearl-serif block text-2xl leading-5">
              Pearl Dental
            </span>
            <span className="mt-1 block text-xs font-semibold text-[#C6A15B]">
              Clinic
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-[rgba(198,161,91,0.22)] bg-[#FFFCF7]/62 px-2 py-1.5 shadow-sm shadow-[#063B35]/[0.03] lg:flex xl:gap-2">
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

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/#booking"
            className="rounded-full bg-[#063B35] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#063B35]/15 transition hover:-translate-y-0.5 hover:bg-[#0E4A43] hover:shadow-md hover:shadow-[#063B35]/15"
          >
            Book Appointment
          </Link>
          <div className="relative">
            <button
              suppressHydrationWarning
              type="button"
              onClick={() =>
                setIsAccountOpen((currentValue) => !currentValue)
              }
              className={`flex items-center gap-2.5 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                isAccountActive || isAccountOpen
                  ? "border-[rgba(198,161,91,0.42)] bg-[#EFE4D4] text-[#063B35]"
                  : "border-[rgba(198,161,91,0.28)] bg-[#FFFCF7]/55 text-[#063B35] hover:border-[#C6A15B] hover:bg-[#EFE4D4]"
                }`}
              aria-expanded={isAccountOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFE4D4] text-[#063B35]">
                <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6" />
                </svg>
              </span>
              <span>Account</span>
              <svg aria-hidden="true" className="h-3.5 w-3.5 text-[#6B746F]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isAccountOpen ? (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-[rgba(198,161,91,0.28)] bg-[#FFFCF7] shadow-[0_24px_70px_rgba(6,59,53,0.10)]">
                <div className="border-b border-[rgba(198,161,91,0.18)] px-4 py-3">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#C6A15B]">
                    My Account
                  </p>
                </div>
                <div className="p-2">
                  {accountLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsAccountOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        isActive(link.href)
                          ? "bg-[#EFE4D4] text-[#063B35]"
                          : "text-[#6B746F] hover:bg-[#EFE4D4] hover:text-[#063B35]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((currentValue) => !currentValue)}
            className="flex items-center gap-2 rounded-full border border-[rgba(198,161,91,0.36)] bg-[#FFFCF7]/55 px-4 py-2.5 text-sm font-semibold text-[#063B35] transition hover:border-[#C6A15B] hover:bg-[#EFE4D4]"
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
        <div className="border-t border-[rgba(198,161,91,0.28)] bg-[#F7F1E8]/96 px-5 py-5 shadow-lg shadow-[#063B35]/[0.05] backdrop-blur-xl sm:px-6 lg:hidden">
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
            <Link
              href="/#booking"
              onClick={() => setIsOpen(false)}
              className="mt-2 rounded-full bg-[#063B35] px-5 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-[#063B35]/15"
            >
              Book Appointment
            </Link>
          </nav>

          <div className="mx-auto mt-5 grid max-w-7xl gap-2 border-t border-[rgba(198,161,91,0.28)] pt-5">
            <p className="px-3 text-xs font-semibold text-[#C6A15B]">
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

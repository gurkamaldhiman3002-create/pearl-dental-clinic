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
        ? "bg-[#F2ECE3] text-[#173D3F]"
        : "text-[#5D6E6D] hover:bg-[#F2ECE3] hover:text-[#173D3F]"
    }`;
  };

  const isAccountActive =
    pathname.startsWith("/patient") || pathname.startsWith("/admin");

  return (
    <header className="pearl-header sticky top-0 z-40 border-b border-[rgba(201,168,106,0.22)] bg-[#F8F5EF]/86 shadow-sm shadow-black/[0.03] backdrop-blur-xl supports-[backdrop-filter]:bg-[#F8F5EF]/78">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-fit items-center gap-3 text-[#173D3F]"
          onClick={() => setIsOpen(false)}
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-[#173D3F] p-1 shadow-sm shadow-black/10">
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
            <span className="mt-1 block text-xs font-semibold text-[#C9A86A]">
              Clinic
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-[rgba(201,168,106,0.18)] bg-white/55 px-2 py-1.5 shadow-sm shadow-black/[0.02] lg:flex xl:gap-2">
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
            className="rounded-full bg-[#173D3F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#204B4D] hover:shadow-md"
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
                  ? "border-[rgba(201,168,106,0.38)] bg-[#F2ECE3] text-[#173D3F]"
                  : "border-[rgba(201,168,106,0.26)] bg-white/45 text-[#173D3F] hover:border-[#C9A86A] hover:bg-[#F2ECE3]"
                }`}
              aria-expanded={isAccountOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F2ECE3] text-xs font-bold text-[#173D3F]">
                AC
              </span>
              <span>Account</span>
              <span className="text-xs text-[#5D6E6D]">v</span>
            </button>

            {isAccountOpen ? (
              <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-[rgba(201,168,106,0.22)] bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <p className="px-3 pb-2 pt-1 text-xs font-semibold text-[#C9A86A]">
                  Account
                </p>
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsAccountOpen(false)}
                    className={`block rounded-md px-3 py-3 text-sm font-semibold transition ${
                      isActive(link.href)
                        ? "bg-[#F2ECE3] text-[#173D3F]"
                        : "text-[#5D6E6D] hover:bg-[#F2ECE3] hover:text-[#173D3F]"
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
            className="flex items-center gap-2 rounded-full border border-[rgba(201,168,106,0.34)] bg-white/45 px-4 py-2.5 text-sm font-semibold text-[#173D3F] transition hover:border-[#C9A86A] hover:bg-[#F2ECE3]"
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
        <div className="border-t border-[rgba(201,168,106,0.22)] bg-[#F8F5EF]/96 px-5 py-5 shadow-lg shadow-black/[0.04] backdrop-blur-xl sm:px-6 lg:hidden">
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
              className="mt-2 rounded-full bg-[#173D3F] px-5 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-black/10"
            >
              Book Appointment
            </Link>
          </nav>

          <div className="mx-auto mt-5 grid max-w-7xl gap-2 border-t border-[rgba(201,168,106,0.22)] pt-5">
            <p className="px-3 text-xs font-semibold text-[#C9A86A]">
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

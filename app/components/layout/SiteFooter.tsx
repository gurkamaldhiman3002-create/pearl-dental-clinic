import Image from "next/image";
import Link from "next/link";
import { clinicHours, clinicInformation } from "@/app/lib/clinicContent";

type FooterLink = {
  href: string;
  label: string;
};

const quickLinks: FooterLink[] = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#booking", label: "Book Appointment" },
  { href: "/#contact", label: "Contact" },
];

const serviceLinks = [
  "Digital X-Ray",
  "Dental Implants",
  "Root Canal Treatment",
  "Teeth Whitening",
  "Cosmetic Dentistry",
];

const accountLinks: FooterLink[] = [
  { href: "/patient/login", label: "Patient Login" },
  { href: "/patient/signup", label: "Create Patient Account" },
  { href: "/patient/dashboard", label: "Patient Dashboard" },
  { href: "/admin", label: "Admin Portal" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-blue-900 bg-blue-950 px-6 py-12 text-blue-100 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.95fr_1fr_1.1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-white/10 p-1 shadow-sm">
              <Image
                alt="Pearl Dental Clinic logo"
                className="h-full w-full object-contain"
                height={34}
                src="/images/logo.png.jpeg"
                width={41}
              />
            </span>
            <span>
              <span className="block text-lg font-bold leading-5">
                Pearl Dental
              </span>
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                Clinic
              </span>
            </span>
          </Link>
          <p className="mt-5 text-base font-semibold text-cyan-200">
            {clinicInformation.slogan}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-blue-200">
            Professional dental care by {clinicInformation.dentistName},{" "}
            {clinicInformation.qualification}.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
            Quick Links
          </p>
          <nav className="mt-5 grid gap-3 text-sm">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
            Services
          </p>
          <div className="mt-5 grid gap-3 text-sm">
            {serviceLinks.map((service) => (
              <Link
                key={service}
                href="/#services"
                className="transition hover:text-white"
              >
                {service}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
            Patient &amp; Admin
          </p>
          <nav className="mt-5 grid gap-3 text-sm">
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
            Visit &amp; Contact
          </p>
          <div className="mt-5 space-y-3 text-sm leading-6 text-blue-200">
            <div>
              {clinicInformation.addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            {clinicHours.map((row) => (
              <p key={`${row.day}-${row.hours}`}>
                {row.day}: {row.hours}
              </p>
            ))}
            <p>{clinicInformation.timeZoneLabel} (India Standard Time)</p>
            <a
              href={clinicInformation.phoneHref}
              className="block font-semibold text-white transition hover:text-cyan-300"
            >
              {clinicInformation.phoneDisplay}
            </a>
            <a
              href={clinicInformation.emailHref}
              className="block text-cyan-200 transition hover:text-white"
            >
              {clinicInformation.email}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-blue-300 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; 2026 Pearl Dental Clinic. All rights reserved.</p>
        <p>{clinicInformation.slogan}</p>
      </div>
    </footer>
  );
}

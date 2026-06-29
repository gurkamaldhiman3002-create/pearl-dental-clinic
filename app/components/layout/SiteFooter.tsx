import Image from "next/image";
import Link from "next/link";
import { clinicHours, clinicInformation } from "@/app/lib/clinicContent";

type FooterLink = {
  href: string;
  label: string;
};

const quickLinks: FooterLink[] = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Treatments" },
  { href: "/#about", label: "About" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#booking", label: "Book Appointment" },
  { href: "/#contact", label: "Contact" },
  { href: "/feedback", label: "Share Feedback" },
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
    <footer className="pearl-footer border-t border-[#0E4A43] bg-[#063B35] px-6 py-14 text-[#F7F1E8] lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.95fr_1fr_1.1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/10 p-1 shadow-sm">
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
          <p className="pearl-handwritten mt-5 text-3xl text-[#C6A15B]">
            {clinicInformation.slogan}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-7 text-[#E6DCCD]">
            A neighborhood dental clinic in Patiala, where{" "}
            {clinicInformation.dentistName} cares for children, parents, and
            grandparents with time and patience.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-[#C6A15B]">
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
          <p className="text-sm font-semibold text-[#C6A15B]">
            Treatments
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
          <p className="text-sm font-semibold text-[#C6A15B]">
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
          <p className="text-sm font-semibold text-[#C6A15B]">
            Visit &amp; Contact
          </p>
          <div className="mt-5 space-y-3 text-sm leading-6 text-[#E6DCCD]">
            <div>
              <p className="font-semibold text-white">
                {clinicInformation.name}
              </p>
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
              className="block font-semibold text-white transition hover:text-[#C6A15B]"
            >
              {clinicInformation.phoneDisplay}
            </a>
            <a
              href={clinicInformation.emailHref}
              className="block text-[#C6A15B] transition hover:text-white"
            >
              {clinicInformation.email}
            </a>
            <a
              className="block text-[#C6A15B] transition hover:text-white"
              href={clinicInformation.mapHref}
              rel="noreferrer"
              target="_blank"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-sm text-[#c9c0b0] sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; 2026 Pearl Dental Clinic. All rights reserved.</p>
        <p>{clinicInformation.slogan}</p>
      </div>
    </footer>
  );
}

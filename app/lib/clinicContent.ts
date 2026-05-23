export type ServiceIconName =
  | "xray"
  | "implant"
  | "root"
  | "crown"
  | "laser"
  | "polish"
  | "whitening"
  | "denture"
  | "camera"
  | "cosmetic"
  | "extraction"
  | "equipment"
  | "gentle"
  | "family"
  | "approval";

export const clinicInformation = {
  addressLines: [
    "H. no. 155B, Pearl Dental Clinic,",
    "155, Sarabha Nagar Lane no. 1,",
    "St. 9B, Opp, Patiala,",
    "Punjab 147001, India",
  ],
  degreeImagePath: "/images/degree.png",
  dentistName: "Dr. Sukhpreet Virdy",
  email: "pearldentalclinic.india@gmail.com",
  emailHref: "mailto:pearldentalclinic.india@gmail.com",
  mapEmbedUrl:
    "https://www.google.com/maps?q=H.%20no.%20155B%2C%20Pearl%20Dental%20Clinic%2C%20155%2C%20Sarabha%20Nagar%20Lane%20no.%201%2C%20St.%209B%2C%20Opp%2C%20Patiala%2C%20Punjab%20147001%2C%20India&output=embed",
  name: "Pearl Dental Clinic",
  phoneDisplay: "+91 80541 86836",
  phoneHref: "tel:+918054186836",
  qualification: "Bachelor of Dental Surgery (B.D.S.)",
  slogan: "My care... your smile",
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST",
  whatsappHref: "https://wa.me/918054186836",
} as const;

export const services: {
  title: string;
  icon: ServiceIconName;
  description: string;
}[] = [
  {
    title: "Digital X-Ray",
    icon: "xray",
    description:
      "High-resolution imaging for faster diagnosis and precise treatment planning.",
  },
  {
    title: "Dental Implants",
    icon: "implant",
    description:
      "Durable tooth replacement options designed for comfort, function, and confidence.",
  },
  {
    title: "Root Canal Treatment",
    icon: "root",
    description:
      "Focused care to relieve infection, reduce pain, and preserve natural teeth.",
  },
  {
    title: "Crown and Bridge Work",
    icon: "crown",
    description:
      "Custom restorations that protect damaged teeth and replace missing ones.",
  },
  {
    title: "Laser Filling",
    icon: "laser",
    description:
      "Modern cavity repair with a precise, minimally invasive treatment approach.",
  },
  {
    title: "Scaling & Polishing",
    icon: "polish",
    description:
      "Thorough plaque removal and polishing for healthier gums and a cleaner smile.",
  },
  {
    title: "Teeth Whitening",
    icon: "whitening",
    description:
      "Professional brightening treatments for a noticeably fresher smile.",
  },
  {
    title: "Complete and Partial Denture",
    icon: "denture",
    description:
      "Comfortable removable tooth replacement options tailored to your bite.",
  },
  {
    title: "Intraoral Camera",
    icon: "camera",
    description:
      "Detailed chairside imaging that helps you see and understand your care.",
  },
  {
    title: "Cosmetic Dentistry",
    icon: "cosmetic",
    description:
      "Smile-enhancing treatments focused on balance, shape, shade, and confidence.",
  },
  {
    title: "Tooth Extraction",
    icon: "extraction",
    description:
      "Careful removal when a tooth cannot be restored, with clear aftercare guidance.",
  },
];

export const treatmentOptions = services.map((service) => service.title);

export const trustBadges: {
  title: string;
  description: string;
  icon: ServiceIconName;
}[] = [
  {
    title: "Modern Equipment",
    description: "Digital diagnostics and precision-focused treatment tools.",
    icon: "equipment",
  },
  {
    title: "Gentle Care",
    description: "Comfort-led consultations and clear treatment guidance.",
    icon: "gentle",
  },
  {
    title: "Family Dentistry",
    description: "Thoughtful dental support for every stage of life.",
    icon: "family",
  },
  {
    title: "Appointment Approval System",
    description: "Request online and follow your confirmed appointment status.",
    icon: "approval",
  },
];

export const certifications = [
  "Bachelor of Dental Surgery (B.D.S.)",
  "Qualified dental care by Dr. Sukhpreet Virdy",
  "Professional consultation and treatment planning",
  "Modern diagnostic and restorative dentistry",
];

export const testimonials = [
  {
    quote:
      "The appointment request was simple, and the confirmation process made planning my visit feel effortless.",
    patient: "Maya R.",
    treatment: "Scaling & Polishing",
  },
  {
    quote:
      "Everything was explained calmly before my root canal treatment. I felt comfortable and informed throughout.",
    patient: "Daniel T.",
    treatment: "Root Canal Treatment",
  },
  {
    quote:
      "A friendly clinic with a clean, modern approach. My whitening consultation was detailed and never rushed.",
    patient: "Sofia L.",
    treatment: "Teeth Whitening",
  },
];

export const frequentlyAskedQuestions = [
  {
    question: "How do I request an appointment?",
    answer:
      "Choose a treatment, submit your preferred date and time, and our team will review the request. You can follow the appointment status from your patient dashboard.",
  },
  {
    question: "Do I need an account before booking?",
    answer:
      "You may submit a request directly. Creating a patient account lets you see linked appointment history and approval updates in your dashboard.",
  },
  {
    question: "What should I bring to my first visit?",
    answer:
      "Please bring a photo ID, any insurance information, and relevant dental records or X-rays if they are available.",
  },
  {
    question: "Can the website advise me about dental symptoms?",
    answer:
      "Our online tools provide general clinic information only. Please contact the clinic directly for professional dental advice or urgent concerns.",
  },
];

export const clinicHours = [
  { day: "Monday - Saturday", hours: "10:30 AM - 2:00 PM" },
  { day: "Monday - Saturday", hours: "4:00 PM - 6:30 PM" },
];

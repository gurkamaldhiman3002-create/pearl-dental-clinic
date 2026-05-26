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
      "A clear look at what is happening beneath the tooth, so we can explain it together.",
  },
  {
    title: "Dental Implants",
    icon: "implant",
    description:
      "Options for replacing a missing tooth, discussed carefully around your comfort and needs.",
  },
  {
    title: "Root Canal Treatment",
    icon: "root",
    description:
      "Care for a troubled tooth, with each step explained gently before we begin.",
  },
  {
    title: "Crown and Bridge Work",
    icon: "crown",
    description:
      "Restorations made to protect weakened teeth or fill a gap in your smile.",
  },
  {
    title: "Laser Filling",
    icon: "laser",
    description:
      "A thoughtful approach to filling cavities while keeping the visit as comfortable as possible.",
  },
  {
    title: "Scaling & Polishing",
    icon: "polish",
    description:
      "A familiar cleaning visit to help your gums feel healthier and your mouth feel fresh.",
  },
  {
    title: "Teeth Whitening",
    icon: "whitening",
    description:
      "Whitening guidance for patients who would like a naturally brighter smile.",
  },
  {
    title: "Complete and Partial Denture",
    icon: "denture",
    description:
      "Removable tooth replacement planned with attention to fit, eating, and everyday comfort.",
  },
  {
    title: "Intraoral Camera",
    icon: "camera",
    description:
      "A close-up view that helps you understand what the dentist is seeing.",
  },
  {
    title: "Cosmetic Dentistry",
    icon: "cosmetic",
    description:
      "Small and considered improvements for people who feel self-conscious about their smile.",
  },
  {
    title: "Tooth Extraction",
    icon: "extraction",
    description:
      "When removal is needed, we talk you through the visit and the care afterwards.",
  },
];

export const treatmentOptions = services.map((service) => service.title);

export const trustBadges: {
  title: string;
  description: string;
  icon: ServiceIconName;
}[] = [
  {
    title: "Dr. Sukhpreet Virdy",
    description: "B.D.S. dental care with time to listen first.",
    icon: "gentle",
  },
  {
    title: "Children and adults",
    description: "One familiar clinic for the whole family.",
    icon: "family",
  },
  {
    title: "Morning and evening visits",
    description: "Monday to Saturday appointments in Patiala.",
    icon: "approval",
  },
  {
    title: "Sarabha Nagar, Patiala",
    description: "A nearby clinic when your family needs a dentist.",
    icon: "equipment",
  },
];

export const familyReasons = [
  {
    title: "We take questions seriously",
    description:
      "Before starting anything, Dr. Virdy explains what is needed in simple language and gives you time to ask.",
  },
  {
    title: "We try to reply the same day",
    description:
      "If you call with a concern, we make an effort to get back to you the same day and help arrange a visit.",
  },
  {
    title: "Families often send families",
    description:
      "Many people find Pearl Dental Clinic through a relative or neighbour who already feels comfortable here.",
  },
];

export const testimonials = [
  {
    quote:
      "Our family has been coming from Sarabha Nagar for some time. Doctor explains everything simply and never rushes us.",
    patient: "Manpreet K.",
    treatment: "Family patient, Sarabha Nagar",
  },
  {
    quote:
      "I was honestly very scared of a root canal. Dr. Virdy spoke calmly through the visit, and it felt much easier than I imagined.",
    patient: "Gurpreet S.",
    treatment: "Root canal patient, Patiala",
  },
  {
    quote:
      "My son was nervous before his appointment. She spoke to him gently, and by the end he was smiling again.",
    patient: "Navneet K.",
    treatment: "Parent of a young patient",
  },
];

export const frequentlyAskedQuestions = [
  {
    question: "Does a root canal hurt?",
    answer:
      "It is natural to worry about a root canal. We first examine the tooth, explain what will happen, and do our best to keep you comfortable throughout the visit.",
  },
  {
    question: "What if I am nervous about treatment?",
    answer:
      "Please tell us. Many people feel anxious at the dentist. We can take things slowly, explain each step before we begin, and pause whenever you need a moment.",
  },
  {
    question: "Do you see children too?",
    answer:
      "Yes. We welcome children and families, and we try to make early dental visits gentle, simple, and unhurried.",
  },
  {
    question: "How can I request an appointment?",
    answer:
      "Fill in the form on this page or message us on WhatsApp with a preferred time. We will check availability and get back to you before confirming your visit.",
  },
];

export const clinicHours = [
  { day: "Monday - Saturday", hours: "10:30 AM - 2:00 PM" },
  { day: "Monday - Saturday", hours: "4:00 PM - 6:30 PM" },
];

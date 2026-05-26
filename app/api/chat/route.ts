import OpenAI from "openai";
import {
  clinicHours,
  clinicInformation,
  services,
} from "@/app/lib/clinicContent";
import type { ChatRequestMessage } from "@/app/types/chat";

export const runtime = "nodejs";

type ChatRequest = {
  message?: string;
  messages?: ChatRequestMessage[];
};

const professionalAdviceResponse =
  "Please contact Pearl Dental Clinic directly for professional dental advice.";

const systemPrompt =
  'You are the friendly front-desk assistant for Pearl Dental Clinic in Patiala, where Dr. Sukhpreet Virdy (B.D.S.) cares for local families. Answer warmly, clearly, and briefly about services, appointment steps, hours, contact information, and general treatment explanations. You must not diagnose dental problems, recommend medicines, or give medical advice. If the patient mentions severe pain, bleeding, swelling, infection, medicine, emergency, diagnosis, or treatment decision, respond: "Please contact Pearl Dental Clinic directly for professional dental advice."';

const clinicFacts = `
Pearl Dental Clinic facts:
- Slogan: "${clinicInformation.slogan}".
- Dentist: ${clinicInformation.dentistName}, ${clinicInformation.qualification}.
- Services: ${services.map((service) => service.title).join(", ")}.
- Appointment process: patients select a treatment, provide contact details, choose a preferred date and time, and submit the request. Requests start as pending until the clinic approves or rejects them.
- Clinic hours (${clinicInformation.timeZoneLabel}): ${clinicHours.map(({ day, hours }) => `${day}: ${hours}`).join("; ")}.
- Contact information: ${clinicInformation.addressLines.join(" ")}. Phone: ${clinicInformation.phoneDisplay}. Email: ${clinicInformation.email}.
`;

const professionalAdvicePattern =
  /\b(severe pain|bleeding|swelling|infection|medicine|medication|emergency|diagnos(e|is|ed)|treatment decision|should i|do i need|prescribe|antibiotic|painkiller)\b/i;

function shouldUseProfessionalAdviceResponse(message: string) {
  return professionalAdvicePattern.test(message);
}

function sanitizeMessages(messages: ChatRequestMessage[]) {
  return messages
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        message.content.trim(),
    )
    .slice(-10)
    .map((message) => `${message.role}: ${message.content.trim()}`)
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const messages = body.messages ?? [];
    const latestUserMessage =
      body.message?.trim() ||
      [...messages]
        .reverse()
        .find((message) => message.role === "user")
        ?.content.trim();

    if (!latestUserMessage) {
      return Response.json(
        { error: "Please enter a question for the clinic assistant." },
        { status: 400 },
      );
    }

    if (shouldUseProfessionalAdviceResponse(latestUserMessage)) {
      return Response.json({ message: professionalAdviceResponse });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "OpenAI API key is not configured on the server." },
        { status: 500 },
      );
    }

    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      instructions: systemPrompt,
      input: `${clinicFacts}
Conversation:
${sanitizeMessages(messages)}

Latest patient message:
${latestUserMessage}`,
      max_output_tokens: 300,
      store: false,
    });

    return Response.json({
      message:
        response.output_text?.trim() ||
        "I could not generate a response. Please contact the clinic directly.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The AI assistant could not respond right now.";

    return Response.json(
      { error: `AI assistant error: ${message}` },
      { status: 500 },
    );
  }
}

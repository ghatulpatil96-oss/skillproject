import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { CONTACT_EMAIL } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions, feedback, or partnership inquiries for the SkillBridge team — we reply within two working days.",
};

export default function ContactPage() {
  return (
    <main>
      <TopBar title="Contact" />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <span className="chip bg-accent/10 text-accent">We read everything</span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">Get in touch</h1>
        <p className="mt-4 text-ink-2">
          Questions about roadmaps or tests, recruiter plans, college
          partnerships, or feedback on the product — send it over. We reply
          within two working days, or email us directly at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <div className="mt-10">
          <ContactForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}

import { sendEmail } from "../lib/email";

async function main(): Promise<void> {
  const address = process.argv[2]?.trim();
  if (!address) {
    console.error("Usage: npm run email:test -- <address>");
    process.exitCode = 2;
    return;
  }

  const email = await sendEmail({
    to: address,
    kind: "delivery-test",
    subject: "SkillBridge email delivery test",
    title: "Email delivery test",
    bodyHtml: "<p>This is a test email from SkillBridge.</p>",
    text: "This is a test email from SkillBridge.",
  });

  if (email.status === "sent" && email.providerId) {
    console.log(`Resend response id: ${email.providerId}`);
    return;
  }

  console.error(`Email was not delivered: ${email.error ?? "No Resend response id was returned."}`);
  process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(
    `Email test failed: ${error instanceof Error ? error.message : "Unexpected error."}`
  );
  process.exitCode = 1;
});

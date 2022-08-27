interface MailConfig {
  driver: "ses" | "nodemailer";
}

export default {
  driver:
    process.env.NODE_ENV === "test"
      ? "nodemailer"
      : process.env.MAIL_DRIVER || "nodemailer",
} as MailConfig;

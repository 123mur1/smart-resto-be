import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  private transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: true,
    logger: true,
    connectionTimeout: 120000,
    socketTimeout: 120000,
  } as nodemailer.TransportOptions);

  constructor() {
    // verify on startup so Render logs show connectivity/auth issues early
    this.transporter
      .verify()
      .then(() => this.logger.log("SMTP transporter verified"))
      .catch((err) => this.logger.error("SMTP transporter verify failed", err));
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      this.logger.log(`Sending email to ${to} using ${process.env.EMAIL_USER}`);
      const info = await this.transporter.sendMail({
        from: `"MedLink Rwanda" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info?.messageId ?? "(no messageId)"}`);
    } catch (error) {
      // log full error so Render logs show the root cause (timeout / auth / DNS)
      this.logger.error("Error sending email", error as any);
      throw new InternalServerErrorException("Error sending email");
    }
  }
}

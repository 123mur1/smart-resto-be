import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import * as nodemailer from "nodemailer";

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  fromEmail?: string;
  fromName: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly mailConfig: MailConfig;
  private transporter?: nodemailer.Transporter;

  constructor() {
    this.mailConfig = this.buildMailConfig();
    this.initializeTransporter();
  }

  private buildMailConfig(): MailConfig {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT ?? 465);
    const secure =
      process.env.SMTP_SECURE !== undefined
        ? process.env.SMTP_SECURE === "true"
        : port === 465;

    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_USER || user;
    const fromName = process.env.SMTP_FROM_NAME || "Smart Cafeteria";

    return { host, port, secure, user, pass, fromEmail, fromName };
  }

  private initializeTransporter() {
    if (!this.mailConfig.user || !this.mailConfig.pass) {
      this.logger.error(
        "SMTP credentials missing. Set SMTP_USER/SMTP_PASS or EMAIL_USER/EMAIL_PASS."
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: this.mailConfig.host,
      port: this.mailConfig.port,
      secure: this.mailConfig.secure,
      auth: {
        user: this.mailConfig.user,
        pass: this.mailConfig.pass,
      },
      debug: true,
      logger: true,
      connectionTimeout: 120000,
      socketTimeout: 120000,
      tls: { rejectUnauthorized: false },
    } as nodemailer.TransportOptions);

    this.transporter
      .verify()
      .then(() => this.logger.log("SMTP transporter verified"))
      .catch((err) => this.logger.error("SMTP transporter verify failed", err));
  }

  async sendMail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      throw new InternalServerErrorException(
        "Email service not configured. Contact the administrator."
      );
    }

    try {
      this.logger.log(`Sending email to ${to} using ${this.mailConfig.user}`);
      const info = await this.transporter.sendMail({
        from: `"${this.mailConfig.fromName}" <${this.mailConfig.fromEmail}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent: ${info?.messageId ?? "(no messageId)"}`);
    } catch (error) {
      this.logger.error("Error sending email", error as any);
      throw new InternalServerErrorException("Error sending email");
    }
  }
}

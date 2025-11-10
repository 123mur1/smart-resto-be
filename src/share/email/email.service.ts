import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    debug: true,
    logger: true,
    connectionTimeout: 120000,
    socketTimeout: 120000,
  } as nodemailer.TransportOptions);

  async sendMail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"MedLink Rwanda" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      throw new InternalServerErrorException("Error sending email");
    }
  }
}

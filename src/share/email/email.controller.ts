import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiQuery, ApiBody } from "@nestjs/swagger";
import { MailService } from "./email.service";

@ApiTags("email")
@Controller("email")
export class EmailController {
  constructor(private readonly mailService: MailService) {}

  @Get("test")
  @ApiOperation({ summary: "Test email configuration" })
  @ApiQuery({ name: "to", required: true, description: "Email address to send test email to" })
  async testEmail(@Query("to") to: string) {
    try {
      const subject = "Test Email - Smart Campus Restaurant";
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #06b6d4;">Email Configuration Test</h2>
          <p>This is a test email from your Smart Campus Restaurant system.</p>
          <p>If you received this email, your SMTP configuration is working correctly! ✅</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `;

      await this.mailService.sendMail(to, subject, html);
      return {
        success: true,
        message: `Test email sent successfully to ${to}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Failed to send test email",
        error: error.message || "Unknown error",
        hint: "Check your SMTP configuration in .env file (SMTP_USER, SMTP_PASS, etc.)",
      };
    }
  }
}


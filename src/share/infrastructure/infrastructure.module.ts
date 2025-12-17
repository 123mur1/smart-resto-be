import { Global, Module } from "@nestjs/common";

import { MailService } from "../email/email.service";
import { EmailController } from "../email/email.controller";
import { InfrastructureService } from "./infrastructure.service";

@Global()
@Module({
  imports: [],
  controllers: [EmailController],
  providers: [InfrastructureService, MailService],
  exports: [InfrastructureService, MailService],
})
export class InfrastructureModule {}

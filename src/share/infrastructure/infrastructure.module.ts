import { Global, Module } from "@nestjs/common";

import { MailService } from "../email/email.service";
import { InfrastructureService } from "./infrastructure.service";

@Global()
@Module({
  imports: [],
  providers: [InfrastructureService, MailService],
  exports: [InfrastructureService, MailService],
})
export class InfrastructureModule {}

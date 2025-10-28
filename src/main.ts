import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("My API")
    .setDescription(
      "API documentation for the Smart Campus Restaurant Management System — a digital system for managing meal access, users, and staff."
    )
    .setVersion("0.1")
    .addBearerAuth() // enables JWT auth support in Swagger UI
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ✅ Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTOs
      forbidNonWhitelisted: true, // Throw error for unexpected properties
      transform: true, // Automatically transform payloads to DTO instances
    })
  );

  await app.listen(process.env.PORT ?? 3003);
  console.log(
    `🚀 Application is running on: http://localhost:${process.env.PORT ?? 3003}`
  );
  console.log(
    `📘 Swagger docs available at: http://localhost:${process.env.PORT ?? 3003}/api/docs`
  );
}

void bootstrap();

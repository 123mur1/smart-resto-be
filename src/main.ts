import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for all origins
  app.enableCors({
    origin: "*", // allow requests from any URL
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true, // optional: needed if using cookies or Authorization headers
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("My API")
    .setDescription(
      "API documentation for the Smart Campus Restaurant Management System — a digital system for managing meal access, users, and staff."
    )
    .setVersion("0.1")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
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

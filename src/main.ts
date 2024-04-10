import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { ConfigService } from "@nestjs/config";
import { Logger } from "nestjs-pino";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.useLogger(app.get(Logger));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `registry-${Math.floor(Math.random() * 1000)}`,
        brokers: [configService.get<string>("KAFKA_BROKER") || "localhost:9092"],
      },
      consumer: {
        heartbeatInterval: 5000,
        rebalanceTimeout: 5000,
        groupId: "registry-consumer",
      },
    },
  });

  await app.startAllMicroservices();
}
bootstrap();

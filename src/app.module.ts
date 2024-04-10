import { Module } from "@nestjs/common";
import { RegistryController } from "./registry/registry.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { RegistryService } from "./registry/registry.service";
import { ConfigModule } from "@nestjs/config";
import { LoggerModule } from "nestjs-pino";

@Module({
  imports: [LoggerModule.forRoot(), PrismaModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [RegistryController],
  providers: [RegistryService],
})
export class AppModule {}

import { Injectable } from "@nestjs/common";
import { PaymentRegistryDto } from "./dto";
import { PrismaService } from "src/prisma/prisma.service";
import { Status } from "@prisma/client";
import { RegistryResponse } from "./responses";
import { PinoLogger } from "nestjs-pino";

@Injectable()
export class RegistryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RegistryService.name);
  }

  async registerPayment(dto: PaymentRegistryDto): Promise<RegistryResponse> {
    this.logger.info(
      {
        user: {
          id: dto?.userId || "unknown",
        },
        movie: {
          id: dto?.movieId || "unknown",
        },
        payment: {
          total: dto?.total || "unknown",
          amount: dto?.amount || "unknown",
          status: dto?.status || "unknown",
        },
      },
      "Register payment",
    );

    const status = await this.setPaymentToDatabase(dto);

    if (status === Status.ERROR) {
      return {
        status,
      };
    }

    this.logger.info(
      {
        user: {
          id: dto.userId,
        },
        movie: {
          id: dto.movieId,
        },
        payment: {
          total: dto.total,
          amount: dto.amount,
          status: dto.status,
        },
        registryStatus: status,
      },
      "Registered payment",
    );

    return {
      status,
    };
  }

  async setPaymentToDatabase(dto: PaymentRegistryDto): Promise<Status> {
    const payment = await this.prismaService.payment
      .create({
        data: {
          userId: dto.userId,
          movieId: dto.movieId,
          total: dto.total,
          amount: dto.amount,
          status: dto.status,
        },
      })
      .catch((e) => {
        this.logger.debug(e, "Failed to register payment");
        this.logger.error(
          {
            user: {
              id: dto?.userId || "unknown",
            },
            movie: {
              id: dto?.movieId || "unknown",
            },
            payment: {
              total: dto?.total || "unknown",
              amount: dto?.amount || "unknown",
              status: dto?.status || "unknown",
            },
          },
          "Failed to register payment. Payment not registered",
        );
        return null;
      });

    if (!payment) {
      return Status.ERROR;
    }

    return Status.SUCCESS;
  }
}

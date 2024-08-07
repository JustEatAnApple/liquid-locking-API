import { Module } from "@nestjs/common";
import { LiquidLockingController } from "./liquid-locking.controller";
import { ServicesModule } from "@libs/services";
import { LiquidLockingService } from "@libs/services/liquid-locking/liquid-locking.service";

@Module({
    imports: [
        ServicesModule,
    ],
    providers: [
        LiquidLockingService,
    ],
    controllers: [
        LiquidLockingController,
    ],
})

export class LiquidLockingModule { }

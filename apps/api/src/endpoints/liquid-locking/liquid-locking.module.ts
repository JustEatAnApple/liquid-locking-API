import { Module } from "@nestjs/common";
import { LiquidLockingController } from "./liquid-locking.controller";
import { ServicesModule } from "@libs/services";
import { LiquidLockingService } from "@libs/services/liquid-locking/liquid-locking.service";
import { DynamicModuleUtils } from "@libs/common";

@Module({
    imports: [
        ServicesModule,
        DynamicModuleUtils.getCachingModule(),
    ],
    providers: [
        DynamicModuleUtils.getNestJsApiConfigService(),
        LiquidLockingService,
        DynamicModuleUtils.getNestJsApiConfigService()
    ],
    controllers: [
        LiquidLockingController,
    ],
})

export class LiquidLockingModule { }

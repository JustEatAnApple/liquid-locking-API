import { Module } from "@nestjs/common";
import { DynamicModuleUtils } from "@libs/common";
import { LiquidLockingModule } from "./liquid-locking/liquid-locking.module";
import { LiquidLockingController } from "./liquid-locking/liquid-locking.controller";

@Module({
  imports: [
    LiquidLockingModule,
  ],
  providers: [
    DynamicModuleUtils.getNestJsApiConfigService(),
  ],
  controllers: [
    LiquidLockingController
  ]
})
export class EndpointsModule { }

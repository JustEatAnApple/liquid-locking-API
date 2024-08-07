import { Module } from "@nestjs/common";
import { DynamicModuleUtils } from "@libs/common";
import { LiquidLockingModule } from "./liquid-locking/liquid-locking.module";

@Module({
  imports: [
    LiquidLockingModule,
  ],
  providers: [
    DynamicModuleUtils.getNestJsApiConfigService(),
  ],
})
export class EndpointsModule { }

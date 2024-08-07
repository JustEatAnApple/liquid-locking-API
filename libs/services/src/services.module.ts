import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '@libs/database';
import { DynamicModuleUtils, NetworkConfigModule } from '@libs/common';
import { LiquidLockingService } from './liquid-locking/liquid-locking.service';

@Global()
@Module({
  imports: [
    NetworkConfigModule,
    DatabaseModule,
    DynamicModuleUtils.getCachingModule(),
  ],
  providers: [
    LiquidLockingService,
  ],
  exports: [
    LiquidLockingService,
  ],
})
export class ServicesModule { }

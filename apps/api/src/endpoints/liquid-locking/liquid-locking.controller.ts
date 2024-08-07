import { LiquidLockingService } from "@libs/services/liquid-locking/liquid-locking.service";
import { WhitelistedTokensOutput, UnbondPeriodOutput } from "@libs/entities/entities/properties";
import { Controller, Get } from "@nestjs/common";

@Controller()
export class LiquidLockingController {
    constructor(
        private readonly liquidlockingService: LiquidLockingService,
    ) { }

    // whitelist[] or whitelist that has [] inside?
    @Get("/whitelistedTokens")
    async getWhitelistedTokens(): Promise<WhitelistedTokensOutput[]> {
        return await this.liquidlockingService.getWhitelistedTokens();
    }
    @Get("/unbondPeriod")
    async getUnbondPeriod(): Promise<UnbondPeriodOutput> {
        return await this.liquidlockingService.getUnbondPeriod();
    }

}

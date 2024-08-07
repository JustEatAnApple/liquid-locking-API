import { LiquidLockingService } from "@libs/services/liquid-locking/liquid-locking.service";
import { WhitelistedTokensOutput, UnbondPeriodOutput, TokenIdentifier, EsdtTokenPayment } from "@libs/entities/entities/properties";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";

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

    @Get("/unlockedTokens")
    async getUnlockedTokens(): Promise<TokenIdentifier[]> {
        return await this.liquidlockingService.getUnlockedTokens();
    }

    @Get("/unlockedTokens/amounts")
    async getUnlockedTokenAmounts(): Promise<TokenIdentifier[]> {
        return await this.liquidlockingService.getUnlockedTokenAmounts();
    }

    @Post('/unlockTokens')
    @ApiBody({ type: [EsdtTokenPayment] })
    async unlockTokens(@Body() body: EsdtTokenPayment[]) {
        await this.liquidlockingService.unlockTokens(body);
    }
}

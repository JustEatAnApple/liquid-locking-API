import { LiquidLockingService } from "@libs/services/liquid-locking/liquid-locking.service";
import { TokenIdentifierList, UnbondPeriodOutput } from "@libs/entities/entities/properties";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { NativeAuth, NativeAuthGuard } from "@multiversx/sdk-nestjs-auth";

@Controller()
// @UseGuards(NativeAuthGuard)
export class LiquidLockingController {
    constructor(
        private readonly liquidlockingService: LiquidLockingService,
    ) { }

    // whitelist[] or whitelist that has [] inside?
    @Get("/whitelistedTokens")
    async getWhitelistedTokens(
    ): Promise<TokenIdentifierList> {
        return await this.liquidlockingService.getWhitelistedTokens();
    }
    @Get("/unbondPeriod")
    async getUnbondPeriod(): Promise<UnbondPeriodOutput> {
        return await this.liquidlockingService.getUnbondPeriod();
    }

    @Post("/unbond")
    @UseGuards(NativeAuthGuard)
    generateUnbondTransaction(
        @NativeAuth('address') address: string,
        @Body() body: TokenIdentifierList,
    ): any {
        console.log('Received address:', address);
        console.log('Received body:', JSON.stringify(body, null, 2)); // Log the body
        return this.liquidlockingService.generateUnbondTransaction(address, body);
    }

    @Post("/unbondTx")
    @UseGuards(NativeAuthGuard)
    sendUnbondTransaction(
        @NativeAuth('address') address: string,
        @Body() body: TokenIdentifierList,
    ): any {
        console.log('Received address:', address);
        console.log('Received body:', JSON.stringify(body, null, 2)); // Log the body
        return this.liquidlockingService.sendUnbondTransaction(address, body);
    }

}

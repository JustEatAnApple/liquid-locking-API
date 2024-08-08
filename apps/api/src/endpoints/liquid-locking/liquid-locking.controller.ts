import { LiquidLockingService } from "@libs/services/liquid-locking/liquid-locking.service";
import { TokenIdentifierList, UnbondPeriodOutput, PaymentList, LockedTokensOutput, LockedTokenAmountsOutput } from "@libs/entities/entities/properties";
import { Body, Controller, Get, Param, Post, UseGuards  } from "@nestjs/common";
import { NativeAuth, NativeAuthGuard } from "@multiversx/sdk-nestjs-auth";


@Controller()
// @UseGuards(NativeAuthGuard)
export class LiquidLockingController {
    constructor(
        private readonly liquidlockingService: LiquidLockingService,
    ) { }

    @Get("/whitelistedTokens")
    async getWhitelistedTokens(
    ): Promise<TokenIdentifierList> {
        return await this.liquidlockingService.getWhitelistedTokens();
    }
    @Get("/unbondPeriod")
    async getUnbondPeriod(): Promise<UnbondPeriodOutput> {
        return await this.liquidlockingService.getUnbondPeriod();
    }

    @UseGuards(NativeAuthGuard)
    @Get("/unlockedTokens/:address")
    async getUnlockedTokens(
        @NativeAuth('address')
        @Param('address') address: string): Promise<TokenIdentifierList> {
        console.log('unlockedTokens controller');
        return await this.liquidlockingService.getUnlockedTokens(address);
    }

    @UseGuards(NativeAuthGuard)
    @Get("/unlockedTokens/amounts/:address")
    async getUnlockedTokenAmounts(
        @NativeAuth('address')
        @Param('address') address: string,
    ): Promise<TokenIdentifierList> {
        return await this.liquidlockingService.getUnlockedTokenAmounts(address);
    }

    @UseGuards(NativeAuthGuard)
    @Get("/lockedTokens/:address")
    async getLokedTokens(
        @NativeAuth('address') 
        @Param('address') address: string) : Promise<LockedTokensOutput[]> {
        return await this.liquidlockingService.getLockedTokens(address);
    }

    @UseGuards(NativeAuthGuard)
    @Get("/lockedTokenAmounts/amounts/:address")
    async getLokedTokenAmounts(
        @NativeAuth('address')
        @Param('address') address: string) : Promise<LockedTokenAmountsOutput[]> {
        return await this.liquidlockingService.getLockedTokenAmounts(address);
    }

    @Post("/lock")
    @UseGuards(NativeAuthGuard)
    generateLockTransaction(
        @NativeAuth('address') address: string,
        @Body() body: PaymentList,
    ): any {
        console.log('Received address:', address);
        console.log('Received body:', JSON.stringify(body, null, 2)); // Log the body
        return this.liquidlockingService.generateLockTransaction(address, body);
    }

    @Post("/lockTx")
    @UseGuards(NativeAuthGuard)
    sendLockTransaction(
        @NativeAuth('address') address: string,
        @Body() body: PaymentList,
    ): any {
        console.log('Received address:', address);
        console.log('Received body:', JSON.stringify(body, null, 2)); // Log the body
        return this.liquidlockingService.sendLockTransaction(address, body);
    }

    @Post("/unlock")
    @UseGuards(NativeAuthGuard)
    generateUnlockTransaction(
        @NativeAuth('address') address: string,
        @Body() body: PaymentList,
    ): any {
        console.log('Received address:', address);
        console.log('Received body:', JSON.stringify(body, null, 2)); // Log the body
        return this.liquidlockingService.generateUnlockTransaction(address, body);
    }

    @Post("/unlockTx")
    @UseGuards(NativeAuthGuard)
    sendUnlockTransaction(
        @NativeAuth('address') address: string,
        @Body() body: PaymentList,
    ): any {
        console.log('Received address:', address);
        console.log('Received body:', JSON.stringify(body, null, 2)); // Log the body
        return this.liquidlockingService.sendUnlockTransaction(address, body);
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

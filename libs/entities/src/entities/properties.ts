import { ApiProperty } from '@nestjs/swagger';

export class TokenIdentifier {
    @ApiProperty()
    tokenID!: string;
}

export class WhitelistedTokensOutput {
    @ApiProperty({ type: [TokenIdentifier] })
    tokens!: TokenIdentifier[];
}

export class UnbondPeriodOutput {
    @ApiProperty()
    unbondPeriod!: number;
}

export class UnlockedTokenAmounts {
    @ApiProperty()
    tokenID!: string;

    // @ApiProperty()
}

export class EsdtTokenPayment {
    @ApiProperty()
    tokenID!: string;

    @ApiProperty()
    nonce!: number;

    @ApiProperty()
    amount!: number
}
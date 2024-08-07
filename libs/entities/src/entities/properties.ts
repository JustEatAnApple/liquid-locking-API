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

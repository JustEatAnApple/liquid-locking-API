import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class Payment {
    @ApiProperty()
    @IsString()
    token_identifier!: string;

    @ApiProperty()
    @IsNumber()
    token_nonce!: number;

    @ApiProperty()
    @IsNumber()
    amount!: number;
}

export class PaymentList {
    @ApiProperty({ type: [Payment] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Payment)
    tokens!: Payment[];
}

export class TokenIdentifier {
    @ApiProperty()
    @IsString()
    token_identifier!: string;
}

export class TokenIdentifierList {
    @ApiProperty({ type: [TokenIdentifier] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TokenIdentifier)
    tokens!: TokenIdentifier[];
}

export class UnbondPeriodOutput {
    @ApiProperty()
    @IsNumber()
    unbondPeriod!: number;
}

export class UnlockedToken {
    @ApiProperty()
    token!: Payment
    @ApiProperty()
    unbond_epoch!: number
}

export class UnlockedTokens {
    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TokenIdentifier)
    tokens!: TokenIdentifier[];
}
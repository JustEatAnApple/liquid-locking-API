import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TokenIdentifier {
    @ApiProperty()
    @IsString()
    tokenID!: string;
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

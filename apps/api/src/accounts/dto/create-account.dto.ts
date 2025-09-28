import { IsString, MaxLength, IsOptional, IsNumber } from "class-validator";

export class CreateAccountDto {
    @IsString() @MaxLength(64)
    name!: string;

    @IsString()
    type!: string;

    @IsOptional() @IsNumber()
    openingBalance?: number;
}
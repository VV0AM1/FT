import { IsString, IsBoolean, IsOptional } from "class-validator";

export class CreateRuleDto {
    @IsString()
    contains!: string;

    @IsString()
    categoryId!: string;

    @IsOptional() @IsBoolean()
    active?: boolean = true;
}
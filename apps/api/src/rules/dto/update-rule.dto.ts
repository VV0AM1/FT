import { IsOptional, IsString, IsBoolean } from "class-validator";

export class UpdateRuleDto {
    @IsOptional() @IsString()
    contains?: string;

    @IsOptional() @IsString()
    categoryId?: string;

    @IsOptional() @IsBoolean()
    active?: boolean;
}
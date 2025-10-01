import { IsString, IsBoolean, IsOptional, IsInt, Min } from "class-validator";
export class CreateRuleDto {
    @IsString() contains!: string;
    @IsString() categoryId!: string;
    @IsOptional() @IsBoolean() active?: boolean = true;
    @IsOptional() @IsBoolean() isRegex?: boolean = false;
    @IsOptional() @IsInt() @Min(0) priority?: number = 100;
}
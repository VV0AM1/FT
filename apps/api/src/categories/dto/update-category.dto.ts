import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCategoryDto {
    @IsOptional() @IsString() @MaxLength(64)
    name?: string;

    @IsOptional() @IsString()
    parentId?: string | null;
}
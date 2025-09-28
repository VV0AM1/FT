import { IsOptional, IsString, MaxLength } from "class-validator";

export class CreateCategoryDto {
    @IsString() @MaxLength(64)
    name!: string;

    @IsOptional() @IsString()
    parentId?: string;
}
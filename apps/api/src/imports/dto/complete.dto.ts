import { IsString, IsInt, Min } from "class-validator";
export class CompleteUploadDto {
    @IsString() key!: string;
    @IsString() filename!: string;
    @IsString() contentType!: string;
    @IsInt() @Min(1) size!: number;
}
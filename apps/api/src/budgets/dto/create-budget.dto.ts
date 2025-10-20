import { IsEnum, IsOptional, IsString, IsNumber } from "class-validator";

export enum BudgetPeriod {
    MONTH = "MONTH",
    YEAR = "YEAR",
}

export class CreateBudgetDto {
    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsEnum(BudgetPeriod)
    period!: BudgetPeriod;

    @IsNumber()
    amount!: number;
}
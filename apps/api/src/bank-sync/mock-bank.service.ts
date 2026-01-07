import { Injectable } from "@nestjs/common";
import { faker } from "@faker-js/faker";

export interface MockTransaction {
    id: string;
    date: Date;
    amount: number;
    description: string;
    category: string;
}

@Injectable()
export class MockBankService {
    /**
     * Generates a list of fake transactions
     * @param count Number of transactions to generate
     */
    generateTransactions(count: number = 5): MockTransaction[] {
        const transactions: MockTransaction[] = [];
        for (let i = 0; i < count; i++) {
            const isExpense = Math.random() > 0.3; // 70% expenses
            const amount = isExpense
                ? -parseFloat(faker.finance.amount({ min: 5, max: 200, dec: 2 }))
                : parseFloat(faker.finance.amount({ min: 1000, max: 3000, dec: 2 }));

            transactions.push({
                id: faker.string.uuid(),
                date: faker.date.recent({ days: 30 }),
                amount,
                description: isExpense ? faker.company.name() : "Salary / Transfer",
                category: isExpense ? faker.commerce.department() : "Income",
            });
        }
        return transactions;
    }
}

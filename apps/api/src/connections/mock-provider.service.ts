import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

@Injectable()
export class MockProviderService {
    institutions = [
        { id: "mock_1", name: "Mock National Bank", logo: "🏦" },
        { id: "mock_2", name: "FinTecho", logo: "💳" },
    ];

    async listInstitutions() {
        return this.institutions;
    }

    async getAccounts(_accessToken: string) {
        return [
            { externalId: "acc_" + randomUUID(), name: "Checking", type: "CHECKING", balance: 1234.56 },
            { externalId: "acc_" + randomUUID(), name: "Savings", type: "SAVINGS", balance: 9876.54 },
        ];
    }

    async getTransactions(_accessToken: string, _accountExternalId: string, count = 50) {
        const names = ["Coffee Shop", "Grocery", "Uber", "Restaurant", "Gym", "Salary", "Refund", "Electric Bill", "Netflix"];
        const rows = Array.from({ length: count }).map((_, i) => {
            const day = (i % 28) + 1;
            const date = new Date(Date.UTC(2025, 7, day));
            const desc = names[i % names.length];
            const amount = i % 7 === 0 ? 1200 : -(Math.random() * 100 + 1).toFixed(2) as any;
            return { Date: date.toISOString().slice(0, 10), Description: desc, Amount: Number(amount) };
        });
        return rows;
    }
}
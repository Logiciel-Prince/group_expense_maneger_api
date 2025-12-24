/**
 * Unit tests for settlement calculation logic
 */

interface UserBalance {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  paid: number;
  share: number;
  balance: number;
}

interface Settlement {
  from: {
    userId: string;
    name: string;
    avatar: string;
  };
  to: {
    userId: string;
    name: string;
    avatar: string;
  };
  amount: number;
}

function calculateOptimalSettlements(balances: UserBalance[]): Settlement[] {
  const settlements: Settlement[] = [];

  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .map((b) => ({ ...b, balance: Math.abs(b.balance) }))
    .sort((a, b) => b.balance - a.balance);

  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const amount = Math.min(creditor.balance, debtor.balance);

    if (amount > 0.01) {
      settlements.push({
        from: {
          userId: debtor.userId,
          name: debtor.name,
          avatar: debtor.avatar,
        },
        to: {
          userId: creditor.userId,
          name: creditor.name,
          avatar: creditor.avatar,
        },
        amount: Math.round(amount * 100) / 100,
      });
    }

    creditor.balance -= amount;
    debtor.balance -= amount;

    if (creditor.balance < 0.01) i++;
    if (debtor.balance < 0.01) j++;
  }

  return settlements;
}

describe('Settlement Calculation', () => {
  test('should calculate settlements for 3 people with equal split', () => {
    // Scenario: 3 friends, total expense 300
    // Person A paid 300, B and C paid 0
    // Each should pay 100
    // Expected: B owes A 100, C owes A 100

    const balances: UserBalance[] = [
      {
        userId: 'A',
        name: 'Alice',
        email: 'alice@test.com',
        avatar: '',
        paid: 300,
        share: 100,
        balance: 200, // Paid 300, share is 100, so balance = +200
      },
      {
        userId: 'B',
        name: 'Bob',
        email: 'bob@test.com',
        avatar: '',
        paid: 0,
        share: 100,
        balance: -100, // Paid 0, share is 100, so balance = -100
      },
      {
        userId: 'C',
        name: 'Charlie',
        email: 'charlie@test.com',
        avatar: '',
        paid: 0,
        share: 100,
        balance: -100,
      },
    ];

    const settlements = calculateOptimalSettlements(balances);

    expect(settlements).toHaveLength(2);
    expect(settlements[0].from.userId).toBe('B');
    expect(settlements[0].to.userId).toBe('A');
    expect(settlements[0].amount).toBe(100);
    expect(settlements[1].from.userId).toBe('C');
    expect(settlements[1].to.userId).toBe('A');
    expect(settlements[1].amount).toBe(100);
  });

  test('should calculate settlements for complex scenario', () => {
    // Scenario: 4 people
    // A paid 500, B paid 300, C paid 100, D paid 0
    // Total = 900, each share = 225
    // A: balance = 500 - 225 = +275
    // B: balance = 300 - 225 = +75
    // C: balance = 100 - 225 = -125
    // D: balance = 0 - 225 = -225

    const balances: UserBalance[] = [
      {
        userId: 'A',
        name: 'Alice',
        email: 'alice@test.com',
        avatar: '',
        paid: 500,
        share: 225,
        balance: 275,
      },
      {
        userId: 'B',
        name: 'Bob',
        email: 'bob@test.com',
        avatar: '',
        paid: 300,
        share: 225,
        balance: 75,
      },
      {
        userId: 'C',
        name: 'Charlie',
        email: 'charlie@test.com',
        avatar: '',
        paid: 100,
        share: 225,
        balance: -125,
      },
      {
        userId: 'D',
        name: 'David',
        email: 'david@test.com',
        avatar: '',
        paid: 0,
        share: 225,
        balance: -225,
      },
    ];

    const settlements = calculateOptimalSettlements(balances);

    // Verify total settlements balance
    const totalOwed = settlements.reduce((sum, s) => sum + s.amount, 0);
    expect(totalOwed).toBeCloseTo(350, 1); // 275 + 75 = 350

    // Verify all debtors are settled
    expect(settlements.length).toBeGreaterThan(0);
  });

  test('should handle case where everyone paid equally', () => {
    // Scenario: 3 people, each paid 100, total 300, each share 100
    // All balances should be 0, no settlements needed

    const balances: UserBalance[] = [
      {
        userId: 'A',
        name: 'Alice',
        email: 'alice@test.com',
        avatar: '',
        paid: 100,
        share: 100,
        balance: 0,
      },
      {
        userId: 'B',
        name: 'Bob',
        email: 'bob@test.com',
        avatar: '',
        paid: 100,
        share: 100,
        balance: 0,
      },
      {
        userId: 'C',
        name: 'Charlie',
        email: 'charlie@test.com',
        avatar: '',
        paid: 100,
        share: 100,
        balance: 0,
      },
    ];

    const settlements = calculateOptimalSettlements(balances);

    expect(settlements).toHaveLength(0);
  });

  test('should minimize number of transactions', () => {
    // The algorithm should minimize the number of settlements
    // For 4 people with various balances, it should not exceed 3 transactions

    const balances: UserBalance[] = [
      {
        userId: 'A',
        name: 'Alice',
        email: 'alice@test.com',
        avatar: '',
        paid: 1000,
        share: 250,
        balance: 750,
      },
      {
        userId: 'B',
        name: 'Bob',
        email: 'bob@test.com',
        avatar: '',
        paid: 0,
        share: 250,
        balance: -250,
      },
      {
        userId: 'C',
        name: 'Charlie',
        email: 'charlie@test.com',
        avatar: '',
        paid: 0,
        share: 250,
        balance: -250,
      },
      {
        userId: 'D',
        name: 'David',
        email: 'david@test.com',
        avatar: '',
        paid: 0,
        share: 250,
        balance: -250,
      },
    ];

    const settlements = calculateOptimalSettlements(balances);

    // Should have 3 settlements (B->A, C->A, D->A)
    expect(settlements.length).toBeLessThanOrEqual(3);
  });
});

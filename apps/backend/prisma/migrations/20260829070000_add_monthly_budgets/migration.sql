CREATE TYPE "BudgetSection" AS ENUM ('INCOME', 'EXPENSES', 'MEALS', 'HOMECOMING', 'PENDING');

CREATE TABLE "monthly_budgets" (
  "id" TEXT NOT NULL, "month" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, "userId" TEXT NOT NULL,
  CONSTRAINT "monthly_budgets_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "budget_items" (
  "id" TEXT NOT NULL, "section" "BudgetSection" NOT NULL, "name" TEXT NOT NULL,
  "budget" INTEGER NOT NULL DEFAULT 0, "actual" INTEGER NOT NULL DEFAULT 0, "amount" INTEGER NOT NULL DEFAULT 0,
  "done" BOOLEAN NOT NULL DEFAULT false, "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  "monthlyBudgetId" TEXT NOT NULL, CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "monthly_budgets_userId_month_key" ON "monthly_budgets"("userId", "month");
CREATE INDEX "budget_items_monthlyBudgetId_section_position_idx" ON "budget_items"("monthlyBudgetId", "section", "position");
ALTER TABLE "monthly_budgets" ADD CONSTRAINT "monthly_budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_monthlyBudgetId_fkey" FOREIGN KEY ("monthlyBudgetId") REFERENCES "monthly_budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

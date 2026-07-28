import { useOutletContext } from "react-router-dom";
import AddExpenseForm from "../components/AddExpenseForm";
import ExpenseList from "../components/ExpenseList";
import AccountsPanel from "../components/AccountsPanel";
import PredictionCard from "../components/PredictionCard";
import AnomalyStrip from "../components/AnomalyStrip";
import GreetingRow from "../components/GreetingRow";
import CategoryBreakdownCard from "../components/CategoryBreakdownCard";
import SpendingTrendCard from "../components/SpendingTrendCard";
import BudgetsCard from "../components/BudgetsCard";
import BudgetAlertStrip from "../components/BudgetAlertStrip";
import RecurringCard from "../components/RecurringCard";

function Dashboard() {
  const { loading, error, ...data } = useOutletContext();
  const {
    email,
    expenses,
    accounts,
    prediction,
    anomalies,
    recurring,
    budgets,
    baseCurrency,
    isDemo,
    syncing,
    onExpenseAdded,
    onExpenseDeleted,
    onDismissAnomaly,
    onBudgetSet,
    onBudgetRemoved,
    onSync,
    onAccountDisconnected,
    onReceiptChange,
    reload,
  } = data;

  return (
    <main className="px-[30px] pt-5 pb-[34px] flex flex-col gap-6">
      {loading ? (
        <p className="text-ink-muted text-center">Loading…</p>
      ) : error ? (
        <p className="text-accent-deep text-center">{error}</p>
      ) : (
        <>
          <GreetingRow
            accounts={accounts}
            expenses={expenses}
            budgets={budgets}
            baseCurrency={baseCurrency}
            email={email}
          />
          <AccountsPanel
            accounts={accounts}
            onConnected={reload}
            onSync={onSync}
            onDisconnect={onAccountDisconnected}
            syncing={syncing}
            isDemo={isDemo}
          />
          <AnomalyStrip
            anomalies={anomalies}
            baseCurrency={baseCurrency}
            onDismiss={onDismissAnomaly}
          />
          <BudgetAlertStrip expenses={expenses} budgets={budgets} baseCurrency={baseCurrency} />
          <PredictionCard prediction={prediction} baseCurrency={baseCurrency} />
          <CategoryBreakdownCard expenses={expenses} baseCurrency={baseCurrency} />
          <SpendingTrendCard expenses={expenses} baseCurrency={baseCurrency} />
          <BudgetsCard
            expenses={expenses}
            baseCurrency={baseCurrency}
            budgets={budgets}
            onSet={onBudgetSet}
            onRemove={onBudgetRemoved}
          />
          <RecurringCard recurring={recurring} baseCurrency={baseCurrency} />
          <AddExpenseForm onAdded={onExpenseAdded} baseCurrency={baseCurrency} />
          <ExpenseList
            expenses={expenses}
            baseCurrency={baseCurrency}
            onDelete={onExpenseDeleted}
            onReceiptChange={onReceiptChange}
            anomalyIds={new Set(anomalies.map((anomaly) => anomaly.id))}
            recurringIds={
              new Set(
                (recurring?.series ?? []).flatMap((entry) => entry.expense_ids ?? [])
              )
            }
            isDemo={isDemo}
          />
        </>
      )}
    </main>
  );
}

export default Dashboard;

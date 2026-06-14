import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type {
  HealthScore,
  Insights,
  BalanceForecast,
  Transaction,
  Cashflow,
  MonthlyComparison,
} from '../types';
import * as analyticsService from '../services/analytics.service';
import * as transactionService from '../services/transaction.service';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ScoreCard from '../components/dashboard/ScoreCard';
import BalanceSummary from '../components/dashboard/BalanceSummary';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import CashflowChart from '../components/dashboard/CashflowChart';
import ComparisonCard from '../components/dashboard/ComparisonCard';
import InsightCard from '../components/dashboard/InsightCard';
import ForecastCard from '../components/dashboard/ForecastCard';
import RecentTransactions from '../components/dashboard/RecentTransactions';

export default function DashboardPage() {
  const { user } = useAuth();
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [forecast, setForecast] = useState<BalanceForecast | null>(null);
  const [cashflow, setCashflow] = useState<Cashflow | null>(null);
  const [comparison, setComparison] = useState<MonthlyComparison | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [scoreData, insightsData, forecastData, cashflowData, comparisonData, transactionsData] =
          await Promise.all([
            analyticsService.getHealthScore(),
            analyticsService.getInsights(),
            analyticsService.getBalanceForecast(),
            analyticsService.getCashflow(),
            analyticsService.getMonthlyComparison(),
            transactionService.getAll({ limit: 5 }),
          ]);

        setHealthScore(scoreData);
        setInsights(insightsData);
        setForecast(forecastData);
        setCashflow(cashflowData);
        setComparison(comparisonData);
        setRecentTransactions(transactionsData.data);
      } catch {
        setError('Erro ao carregar dados do dashboard. Verifique se o servidor esta rodando.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-accent-rose text-lg font-medium mb-2">Ops!</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'Usuario';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          Olá, {firstName}!
        </h2>
        <p className="text-text-secondary text-sm mt-1">
          Aqui está o resumo das suas finanças.
        </p>
      </div>

      {healthScore && (
        <BalanceSummary
          totalReceitas={healthScore.totalReceitas}
          totalDespesas={healthScore.totalDespesas}
          saldo={healthScore.saldo}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {healthScore && <ScoreCard data={healthScore} />}
        </div>
        <div className="lg:col-span-2">
          {insights && (
            <CategoryPieChart
              categorias={insights.categorias}
              totalGasto={insights.totalGasto}
            />
          )}
        </div>
      </div>

      {cashflow && <CashflowChart meses={cashflow.meses} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {forecast && <ForecastCard data={forecast} />}
        {comparison && <ComparisonCard data={comparison} />}
      </div>

      {insights && <InsightCard dicas={insights.dicas} />}

      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}

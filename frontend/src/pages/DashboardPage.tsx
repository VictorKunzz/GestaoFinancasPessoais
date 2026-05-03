import Card from '../components/ui/Card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Dashboard
        </h3>
        <p className="text-text-secondary">
          Em breve: Score de saúde, gráficos, insights e previsão de saldo.
        </p>
      </Card>
    </div>
  );
}

import Card from '../components/ui/Card';

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Metas
        </h3>
        <p className="text-text-secondary">
          Em breve: Cards de metas com barra de progresso e previsão de conclusão.
        </p>
      </Card>
    </div>
  );
}

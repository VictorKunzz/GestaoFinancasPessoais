import Card from '../components/ui/Card';

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Transações
        </h3>
        <p className="text-text-secondary">
          Em breve: Tabela de transações com filtros e CRUD completo.
        </p>
      </Card>
    </div>
  );
}

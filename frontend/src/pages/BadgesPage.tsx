import Card from '../components/ui/Card';

export default function BadgesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Conquistas
        </h3>
        <p className="text-text-secondary">
          Em breve: Grid de medalhas com status conquistada/bloqueada.
        </p>
      </Card>
    </div>
  );
}

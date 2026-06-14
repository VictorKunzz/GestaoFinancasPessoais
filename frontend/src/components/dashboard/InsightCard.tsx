import { Lightbulb } from 'lucide-react';
import Card from '../ui/Card';

interface InsightCardProps {
  dicas: string[];
}

export default function InsightCard({ dicas }: InsightCardProps) {
  if (dicas.length === 0) {
    return null;
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-accent-amber/15 rounded-xl">
          <Lightbulb className="text-accent-amber" size={18} />
        </div>
        <h3 className="text-sm font-medium text-text-secondary">Insights do Mês</h3>
      </div>

      <ul className="space-y-3">
        {dicas.map((dica, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber mt-1.5 flex-shrink-0" />
            {dica}
          </li>
        ))}
      </ul>
    </Card>
  );
}

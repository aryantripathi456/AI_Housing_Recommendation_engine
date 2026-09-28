import type { Persona, Property } from '../../types/property';
import PropertyCard from './PropertyCard';

interface Props {
  properties: Property[];
  persona: Persona;
  savedIds: string[];
  selectedId: string | null;
  onToggleSave: (id: string) => void;
  onOpen: (id: string) => void;
  onSelect: (id: string) => void;
  compareIds?: string[];
  onToggleCompare?: (id: string) => void;
}

export function PropertyGridSkeleton() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading properties">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">
          <div className="skeleton h-52 w-full" />
          <div className="space-y-3 p-5">
            <div className="skeleton h-5 w-2/3 rounded-lg" />
            <div className="skeleton h-4 w-1/2 rounded-lg" />
            <div className="skeleton h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PropertyGrid(props: Props) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {props.properties.map((p, i) => (
        <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 5) * 0.07}s` }}>
          <PropertyCard
            property={p}
            persona={props.persona}
            saved={props.savedIds.includes(p.id)}
            selected={p.id === props.selectedId}
            onToggleSave={props.onToggleSave}
            onOpen={props.onOpen}
            onSelect={props.onSelect}
            compareSelected={props.compareIds?.includes(p.id)}
            onToggleCompare={props.onToggleCompare}
          />
        </div>
      ))}
    </div>
  );
}

import { WIDGETS, type WidgetId, type WidgetVisibility } from '../widgetVisibility.ts';

interface WidgetTogglesProps {
  visibility: WidgetVisibility;
  onToggle: (id: WidgetId) => void;
}

function WidgetToggles({ visibility, onToggle }: WidgetTogglesProps) {
  return (
    <fieldset className="flex flex-wrap justify-center gap-4 rounded-xl border border-border bg-white px-4 py-3">
      <legend className="px-1 text-sm font-medium text-muted">Show widgets</legend>
      {WIDGETS.map((widget) => (
        <label key={widget.id} className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={visibility[widget.id]}
            onChange={() => onToggle(widget.id)}
            className="size-4 accent-accent"
          />
          {widget.label}
        </label>
      ))}
    </fieldset>
  );
}

export default WidgetToggles;

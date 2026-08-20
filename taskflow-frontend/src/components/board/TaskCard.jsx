import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, isPast, isToday } from "date-fns";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";

const LABEL_COLORS = { teal: "teal", amber: "amber", rose: "rose", brand: "brand" };

export default function TaskCard({ task, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id, data: { type: "task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const checklistDone = task.checklist?.filter((c) => c.done).length ?? 0;
  const checklistTotal = task.checklist?.length ?? 0;

  const dueBadge = task.dueDate
    ? {
        label: format(new Date(task.dueDate), "MMM d"),
        tone: isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate))
          ? "rose"
          : isToday(new Date(task.dueDate))
          ? "amber"
          : "brand",
      }
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      className={`group cursor-grab rounded-xl border border-white/[0.08] bg-white/[0.045] p-3
        backdrop-blur-md transition-all duration-150 ease-out
        hover:border-brand-400/40 hover:bg-white/[0.07] hover:shadow-glow-brand active:cursor-grabbing
        ${isDragging ? "rotate-2 scale-[1.03] opacity-90 shadow-glass-lg" : ""}`}
    >
      {task.labels?.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {task.labels.map((l) => (
            <Badge key={l.name} color={LABEL_COLORS[l.color] || "brand"}>
              {l.name}
            </Badge>
          ))}
        </div>
      )}

      <p className="text-sm font-medium leading-snug">{task.title}</p>

      {(dueBadge || checklistTotal > 0 || task.assignees?.length > 0) && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-mist-100/50">
            {dueBadge && (
              <Badge color={dueBadge.tone}>
                {dueBadge.tone === "rose" ? "⚠ " : "🗓 "}
                {dueBadge.label}
              </Badge>
            )}
            {checklistTotal > 0 && (
              <span className="flex items-center gap-1">
                ☑ {checklistDone}/{checklistTotal}
              </span>
            )}
          </div>

          {task.assignees?.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignees.slice(0, 3).map((a) => (
                <Avatar key={a._id} name={a.name} size="sm" ring />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

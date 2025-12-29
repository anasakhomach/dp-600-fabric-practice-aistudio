import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragDropQuestion as DragDropQuestionType, UserProgress } from '../types';
import { CheckCircle2, XCircle, GripVertical, Lightbulb, ArrowRight } from 'lucide-react';
import QuestionContextImage from './QuestionContextImage';

interface Props {
  question: DragDropQuestionType;
  existingAnswer?: UserProgress;
  onAnswer: (questionId: number, selectedIds: string[], isCorrect: boolean, mapping?: Record<string, string>) => void;
  onNext?: () => void;
}

interface DraggableItemProps {
  id: string;
  content: string;
  isSubmitted: boolean;
  isCorrect?: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, content, isSubmitted, isCorrect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isSubmitted });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-grab active:cursor-grabbing
        ${isSubmitted
          ? isCorrect
            ? 'bg-green-50 border-green-300'
            : 'bg-red-50 border-red-300'
          : 'bg-white border-slate-200 hover:border-fabric-300 hover:shadow-md'
        }
        ${isDragging ? 'shadow-lg ring-2 ring-fabric-400' : ''}
      `}
    >
      <GripVertical size={20} className="text-slate-400 flex-shrink-0" />
      <span className="text-slate-700">{content}</span>
      {isSubmitted && (
        isCorrect
          ? <CheckCircle2 size={20} className="ml-auto text-green-500" />
          : <XCircle size={20} className="ml-auto text-red-500" />
      )}
    </div>
  );
};

interface DropZoneProps {
  id: string;
  label: string;
  assignedItem?: { id: string; content: string };
  isSubmitted: boolean;
  isCorrect?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ id, label, assignedItem, isSubmitted, isCorrect }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    disabled: isSubmitted,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`p-4 rounded-xl border-2 border-dashed min-h-[80px] transition-all
      ${isOver ? 'ring-2 ring-fabric-400 border-fabric-400 bg-fabric-50' : ''}
      ${isSubmitted
        ? isCorrect
          ? 'border-green-400 bg-green-50/50'
          : 'border-red-400 bg-red-50/50'
        : 'border-slate-300 bg-slate-50'
      }
    `}>
      <div className="text-sm font-semibold text-slate-600 mb-2">{label}</div>
      {assignedItem && (
        <div className={`p-3 rounded-lg border ${isSubmitted
          ? isCorrect ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
          : 'bg-white border-slate-200'
        }`}>
          {assignedItem.content}
        </div>
      )}
    </div>
  );
};

const DragDropQuestionComponent: React.FC<Props> = ({
  question,
  existingAnswer,
  onAnswer,
  onNext,
}) => {
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    if (existingAnswer?.dragDropMapping) {
      setMapping(existingAnswer.dragDropMapping);
      setIsSubmitted(true);
    } else {
      setMapping({});
      setIsSubmitted(false);
    }
  }, [question.id, existingAnswer]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      // Check if dropped on a target zone
      const targetId = question.targets.find(t => t.id === over.id)?.id;
      if (targetId) {
        setMapping(prev => ({
          ...prev,
          [active.id as string]: targetId,
        }));
      }
    }
  };

  const handleSubmit = () => {
    const isCorrect = Object.entries(question.correctMapping).every(
      ([itemId, targetId]) => mapping[itemId] === targetId
    ) && Object.keys(mapping).length === Object.keys(question.correctMapping).length;

    setIsSubmitted(true);
    onAnswer(question.id, [], isCorrect, mapping);
  };

  const isCorrect = existingAnswer?.isCorrect ?? false;
  const allItemsMapped = Object.keys(mapping).length === question.items.length;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
      {/* Question Text */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-medium text-slate-900 leading-relaxed">
          {question.text}
        </h2>
        <div className="mt-4 text-sm text-slate-500 font-medium bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
          Drag items to their correct targets
        </div>

        {question.exhibitUrl && <div className="mt-4"><QuestionContextImage imageUrl={question.exhibitUrl} /></div>}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* Items to drag */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Items</h3>
            <SortableContext
              items={question.items.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {question.items.filter(item => !Object.keys(mapping).includes(item.id)).map((item) => (
                  <DraggableItem
                    key={item.id}
                    id={item.id}
                    content={item.content}
                    isSubmitted={isSubmitted}
                  />
                ))}
              </div>
            </SortableContext>
          </div>

          {/* Drop targets */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Targets</h3>
            <div className="space-y-3">
              {question.targets.map((target) => {
                const assignedItemId = Object.entries(mapping).find(([_, tId]) => tId === target.id)?.[0];
                const assignedItem = question.items.find(i => i.id === assignedItemId);
                const isTargetCorrect = isSubmitted && question.correctMapping[assignedItemId || ''] === target.id;

                return (
                  <DropZone
                    key={target.id}
                    id={target.id}
                    label={target.label}
                    assignedItem={assignedItem}
                    isSubmitted={isSubmitted}
                    isCorrect={isTargetCorrect}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="p-4 rounded-xl border-2 border-fabric-400 bg-white shadow-xl">
              {question.items.find(i => i.id === activeId)?.content}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Feedback Section */}
      {isSubmitted && (
        <div className={`mt-8 overflow-hidden rounded-2xl border shadow-sm ${isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              {isCorrect ? (
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                  <CheckCircle2 size={24} />
                </div>
              ) : (
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <XCircle size={24} />
                </div>
              )}
              <h3 className={`font-bold text-xl ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                {isCorrect ? "Correct Answer" : "Incorrect"}
              </h3>
            </div>
            
            <div className="pl-14">
              <div className="flex gap-2 items-start text-slate-700 leading-relaxed bg-white/60 p-4 rounded-xl border border-slate-100/50">
                <Lightbulb className="flex-shrink-0 text-yellow-500 mt-1" size={20} />
                <p>{question.explanation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-end pt-8">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allItemsMapped}
            className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5
              ${allItemsMapped
                ? 'bg-gradient-to-r from-fabric-600 to-blue-600 text-white hover:shadow-fabric-500/30'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
            `}
          >
            Check Answer
          </button>
        ) : (
          onNext && (
            <button
              onClick={onNext}
              className="group flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Next Question <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default DragDropQuestionComponent;

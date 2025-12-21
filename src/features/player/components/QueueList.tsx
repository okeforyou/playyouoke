import React from "react";
import { ListMusic, Trash2, GripVertical } from "lucide-react";
import { usePlayerStore } from "../stores/usePlayerStore";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
const SortableItem = ({ track, index, isCurrent, isPlaying, removeFromQueue, setCurrentIndex }: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: track.uuid });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`p-3 flex gap-3 group transition-colors ${isCurrent ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-base-200 border-l-4 border-transparent bg-base'}`}
        // Do NOT put onClick on the whole LI if dragging. 
        // Better to have play button or allow click on content area.
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="flex items-center text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing px-1"
            >
                <GripVertical size={16} />
            </div>

            <div
                className="w-6 text-center text-text-muted text-sm font-mono pt-1 cursor-pointer"
                onClick={() => setCurrentIndex(index)}
            >
                {isCurrent && isPlaying ? <div className="animate-pulse">▶</div> : index + 1}
            </div>

            <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => setCurrentIndex(index)}
            >
                <h4 className={`font-medium text-sm truncate ${isCurrent ? 'text-primary' : 'text-text-base'}`}>
                    {track.title || "Unknown Track"}
                </h4>
                <p className="text-xs text-text-muted truncate">
                    {track.author || "Unknown Artist"}
                </p>
            </div>

            <button
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all p-1"
                onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(track.uuid);
                }}
            >
                <Trash2 size={16} />
            </button>
        </li>
    );
};

export const QueueList = () => {
    const { queue, currentIndex, removeFromQueue, setCurrentIndex, reorderQueue, isPlaying } = usePlayerStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = queue.findIndex((item) => item.uuid === active.id);
            const newIndex = queue.findIndex((item) => item.uuid === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                // IMPORTANT: If we move the CURRENTLY PLAYING track, we must update currentIndex?
                // Actually, currentIndex is an integer index. If items shift, that index points to a different song.
                // We typically track "current Video ID" rather than Index for robustness, 
                // but Store relies on currentIndex.
                // Let's reorder first.

                const newQueue = arrayMove(queue, oldIndex, newIndex);
                reorderQueue(newQueue);

                // Adjust Current Index if needed
                // Only if the moved item was the current one, or if we moved something AHEAD/BEHIND current one.
                // Simplest: Find where currentVideo ended up.
                const currentUuid = queue[currentIndex]?.uuid;
                const newCurrentIndex = newQueue.findIndex(q => q.uuid === currentUuid);
                if (newCurrentIndex !== -1 && newCurrentIndex !== currentIndex) {
                    setCurrentIndex(newCurrentIndex);
                }
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-base/50">
            <div className="p-3 font-bold text-sm uppercase tracking-wide text-text-muted border-b border-border flex justify-between items-center bg-base sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <ListMusic size={16} />
                    <span>Queue</span>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {queue?.length || 0}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                {(!queue || queue.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted gap-2 opacity-50">
                        <ListMusic size={48} strokeWidth={1} />
                        <p>Queue is empty</p>
                        <p className="text-xs">Add songs to start singing!</p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={queue.map(q => q.uuid)}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul className="divide-y divide-border">
                                {queue.map((track, index) => (
                                    <SortableItem
                                        key={track.uuid}
                                        track={track}
                                        index={index}
                                        isCurrent={index === currentIndex}
                                        isPlaying={isPlaying}
                                        removeFromQueue={removeFromQueue}
                                        setCurrentIndex={setCurrentIndex}
                                    />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
};

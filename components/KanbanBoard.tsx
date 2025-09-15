import React, { useState, useMemo } from 'react';
import type { KanbanTask, KanbanColumnId, TeamMember } from '../types';
import { TaskPriority } from '../types';

interface KanbanBoardProps {
    columns: Record<KanbanColumnId, { id: KanbanColumnId; title: string; taskIds: string[] }>;
    tasks: KanbanTask[];
    teamMembers: TeamMember[];
    onUpdateTaskStatus: (taskId: string, sourceColId: KanbanColumnId, destColId: KanbanColumnId, sourceIndex: number, destIndex: number) => void;
    onAddTask: (task: Omit<KanbanTask, 'id' | 'column'>) => void;
}

const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.Alta]: 'bg-red-500',
    [TaskPriority.Media]: 'bg-yellow-500',
    [TaskPriority.Baixa]: 'bg-blue-500',
};

const AddTaskForm: React.FC<{ teamMembers: TeamMember[], onAddTask: (task: Omit<KanbanTask, 'id' | 'column'>) => void }> = ({ teamMembers, onAddTask }) => {
    const [title, setTitle] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Media);
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && assigneeId && dueDate) {
            onAddTask({ title, assigneeId, priority, dueDate });
            setTitle('');
            setAssigneeId('');
            setPriority(TaskPriority.Media);
            setDueDate('');
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-2 bg-brand-secondary rounded-lg mb-4 border border-brand-accent/50">
            <input type="text" placeholder="Título da tarefa" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-brand-primary p-2 rounded-md border border-gray-300 text-brand-text text-sm focus:ring-brand-accent focus:border-brand-accent" />
            <div className="grid grid-cols-2 gap-2">
                <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} required className="w-full bg-brand-primary p-2 rounded-md border border-gray-300 text-brand-text text-sm focus:ring-brand-accent focus:border-brand-accent">
                    <option value="" disabled>Responsável...</option>
                    {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
                <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} required className="w-full bg-brand-primary p-2 rounded-md border border-gray-300 text-brand-text text-sm focus:ring-brand-accent focus:border-brand-accent">
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full bg-brand-primary p-2 rounded-md border border-gray-300 text-brand-text text-sm focus:ring-brand-accent focus:border-brand-accent" />
            <button type="submit" className="w-full bg-brand-accent hover:bg-red-500 text-white font-bold py-2 rounded transition text-sm">Adicionar Tarefa</button>
        </form>
    );
}


const TaskCard: React.FC<{ task: KanbanTask; assignee?: TeamMember }> = ({ task, assignee }) => {
    return (
        <div 
            draggable 
            className="bg-brand-secondary p-3 rounded-lg shadow-md mb-3 cursor-grab active:cursor-grabbing border-l-4 border-brand-accent"
        >
            <p className="font-semibold text-brand-text mb-2 break-words">{task.title}</p>
            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                    {assignee && <img src={assignee.avatar} alt={assignee.name} className="w-6 h-6 rounded-full" />}
                    <span className="text-brand-light">{assignee?.name || '...'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-brand-light text-xs">{new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                    <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`} title={`Prioridade: ${task.priority}`}></div>
                </div>
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{ 
    column: { id: KanbanColumnId; title: string; taskIds: string[] };
    tasks: KanbanTask[]; 
    teamMembers: TeamMember[];
    onAddTask: (task: Omit<KanbanTask, 'id' | 'column'>) => void;
    handleDragStart: (e: React.DragEvent, taskId: string, sourceColId: KanbanColumnId, index: number) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent, destColId: KanbanColumnId) => void;
    handleDragEnter: (e: React.DragEvent, destColId: KanbanColumnId, index: number) => void;
}> = ({ column, tasks, teamMembers, onAddTask, handleDragStart, handleDragOver, handleDrop, handleDragEnter }) => {
    
    return (
        <div 
            className="bg-brand-primary rounded-lg p-3 w-full flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
        >
            <h4 className="text-lg font-bold text-brand-text mb-4 px-2">{column.title} ({tasks.length})</h4>
            {column.id === 'todo' && <AddTaskForm teamMembers={teamMembers} onAddTask={onAddTask} />}
            <div className="overflow-y-auto flex-grow min-h-[200px] -mr-2 pr-2">
                 {tasks.map((task, index) => {
                    const assignee = teamMembers.find(m => m.id === task.assigneeId);
                    return (
                        <div 
                            key={task.id}
                            onDragStart={(e) => handleDragStart(e, task.id, column.id, index)}
                            onDragEnter={(e) => handleDragEnter(e, column.id, index)}
                        >
                            <TaskCard task={task} assignee={assignee} />
                        </div>
                    );
                })}
                 <div onDragEnter={(e) => handleDragEnter(e, column.id, tasks.length)} className="h-1 flex-shrink-0"></div>
            </div>
        </div>
    );
};


const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, tasks, teamMembers, onUpdateTaskStatus, onAddTask }) => {
    const tasksById = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks]);

    const dragItem = React.useRef<any>(null);
    const dragOverItem = React.useRef<any>(null);
    
    const handleDragStart = (e: React.DragEvent, taskId: string, sourceColId: KanbanColumnId, index: number) => {
        dragItem.current = { taskId, sourceColId, index };
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', taskId); // For Firefox compatibility
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e: React.DragEvent, destColId: KanbanColumnId, index: number) => {
        e.preventDefault();
        dragOverItem.current = { destColId, index };
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (dragItem.current && dragOverItem.current) {
            onUpdateTaskStatus(
                dragItem.current.taskId,
                dragItem.current.sourceColId,
                dragOverItem.current.destColId,
                dragItem.current.index,
                dragOverItem.current.index
            );
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };
    
    return (
        <div className="bg-brand-secondary p-6 rounded-lg shadow-lg h-full flex flex-col">
            <h3 className="text-xl font-bold text-brand-text mb-4">Gerenciamento de Equipe (Kanban)</h3>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
                {(Object.keys(columns) as KanbanColumnId[]).map(columnId => {
                    const column = columns[columnId];
                    const columnTasks = column.taskIds.map(taskId => tasksById.get(taskId)!).filter(Boolean);
                    
                    return (
                        <KanbanColumn 
                            key={column.id}
                            column={column}
                            tasks={columnTasks}
                            teamMembers={teamMembers}
                            onAddTask={onAddTask}
                            handleDragStart={handleDragStart}
                            handleDragOver={handleDragOver}
                            handleDrop={handleDrop}
                            handleDragEnter={handleDragEnter}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default KanbanBoard;
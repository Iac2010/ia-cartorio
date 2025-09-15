import React, { useState, useMemo } from 'react';
import type { KanbanTask, KanbanColumnId, TeamMember } from '../types';
import { TaskPriority } from '../types';

interface KanbanBoardProps {
    columns: Record<KanbanColumnId, { id: KanbanColumnId; title: string; taskIds: string[] }>;
    tasks: KanbanTask[];
    teamMembers: TeamMember[];
    onUpdateTaskStatus: (taskId: string, sourceColId: KanbanColumnId, destColId: KanbanColumnId, sourceIndex: number, destIndex: number) => void;
    onAddTask: (task: Omit<KanbanTask, 'id' | 'column'>) => void;
    onDeleteTask: (taskId: string) => void;
    onTaskClick: (task: KanbanTask) => void;
    companyLogo: string | null;
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


const TaskCard: React.FC<{ task: KanbanTask; assignee?: TeamMember; isBeingDragged: boolean; onClick: () => void; onDelete: () => void; }> = ({ task, assignee, isBeingDragged, onClick, onDelete }) => {
    return (
        <div 
            draggable 
            onClick={onClick}
            className={`bg-brand-secondary p-3 rounded-lg shadow-md mb-3 cursor-pointer active:cursor-grabbing border-l-4 border-brand-accent relative group transition-opacity ${isBeingDragged ? 'opacity-40' : 'opacity-100'}`}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm('Tem certeza que deseja excluir esta tarefa?')){
                        onDelete();
                    }
                }}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-300 text-gray-600 hover:bg-status-alert hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Excluir Tarefa"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <p className="font-semibold text-brand-text mb-2 break-words pr-4">{task.title}</p>
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
    isDraggingOver: boolean;
    draggedTaskId: string | null;
    onAddTask: (task: Omit<KanbanTask, 'id' | 'column'>) => void;
    onDeleteTask: (taskId: string) => void;
    onTaskClick: (task: KanbanTask) => void;
    handleDragStart: (e: React.DragEvent, taskId: string, sourceColId: KanbanColumnId, index: number) => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent, destColId: KanbanColumnId) => void;
    handleDragEnter: (e: React.DragEvent, destColId: KanbanColumnId) => void;
    handleDragLeave: (e: React.DragEvent) => void;
}> = ({ column, tasks, teamMembers, isDraggingOver, draggedTaskId, onAddTask, onDeleteTask, onTaskClick, handleDragStart, handleDragOver, handleDrop, handleDragEnter, handleDragLeave }) => {
    
    return (
        <div 
            className={`bg-brand-primary rounded-lg p-3 w-full flex flex-col transition-colors ${isDraggingOver ? 'bg-brand-accent/10' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragEnter={(e) => handleDragEnter(e, column.id)}
            onDragLeave={handleDragLeave}
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
                        >
                            <TaskCard 
                                task={task} 
                                assignee={assignee} 
                                isBeingDragged={draggedTaskId === task.id}
                                onClick={() => onTaskClick(task)}
                                onDelete={() => onDeleteTask(task.id)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const KanbanBoard: React.FC<KanbanBoardProps> = ({ columns, tasks, teamMembers, onUpdateTaskStatus, onAddTask, onDeleteTask, onTaskClick, companyLogo }) => {
    const tasksById = useMemo(() => new Map(tasks.map(t => [t.id, t])), [tasks]);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [isDraggingOverCol, setIsDraggingOverCol] = useState<KanbanColumnId | null>(null);
    const dragItem = React.useRef<any>(null);
    const dragOverItem = React.useRef<any>(null);
    
    const handleDragStart = (e: React.DragEvent, taskId: string, sourceColId: KanbanColumnId, index: number) => {
        dragItem.current = { taskId, sourceColId, index };
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', taskId);
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e: React.DragEvent, destColId: KanbanColumnId) => {
        e.preventDefault();
        setIsDraggingOverCol(destColId);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        setIsDraggingOverCol(null);
    };
    
    const handleDrop = (e: React.DragEvent, destColumnId: KanbanColumnId) => {
        e.preventDefault();
        
        // Simplified drop logic: We will find the index based on the drop position
        const target = e.target as HTMLElement;
        const dropTargetCard = target.closest('[draggable="true"]');
        let destIndex = columns[destColumnId].taskIds.length; // Default to the end
        
        if (dropTargetCard && dropTargetCard.parentElement) {
            const children = Array.from(dropTargetCard.parentElement.children);
            destIndex = children.indexOf(dropTargetCard);
        }

        if (dragItem.current) {
            onUpdateTaskStatus(
                dragItem.current.taskId,
                dragItem.current.sourceColId,
                destColumnId,
                dragItem.current.index,
                destIndex
            );
        }
        dragItem.current = null;
        setDraggedTaskId(null);
        setIsDraggingOverCol(null);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=800,width=1000');
        if (printWindow) {
            const logoHtml = companyLogo ? `<img src="${companyLogo}" alt="Logo" style="height: 50px; margin-bottom: 20px;" />` : '';
            
            const columnHtml = (Object.keys(columns) as KanbanColumnId[]).map(columnId => {
                const column = columns[columnId];
                const columnTasks = column.taskIds.map(taskId => tasksById.get(taskId)!).filter(Boolean);
                if (columnTasks.length === 0) return '';
                
                const taskRows = columnTasks.map(task => {
                    const assignee = teamMembers.find(m => m.id === task.assigneeId);
                    return `
                        <tr>
                            <td>${task.title}</td>
                            <td>${assignee?.name || 'N/A'}</td>
                            <td>${task.priority}</td>
                            <td>${new Date(task.dueDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                        </tr>
                    `;
                }).join('');

                return `
                    <div class="column">
                        <h2>${column.title} (${columnTasks.length})</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Tarefa</th>
                                    <th>Responsável</th>
                                    <th>Prioridade</th>
                                    <th>Prazo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${taskRows}
                            </tbody>
                        </table>
                    </div>
                `;
            }).join('');


            printWindow.document.write(`
                <html>
                <head>
                    <title>Relatório de Tarefas Kanban</title>
                    <style>
                        body { font-family: sans-serif; margin: 20px; color: #1e293b; }
                        h1, h2 { color: #1e293b; }
                        .column { margin-bottom: 30px; page-break-inside: avoid; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                        th { background-color: #f2f2f2; }
                        @media print { body { -webkit-print-color-adjust: exact; } }
                    </style>
                </head>
                <body>
                    ${logoHtml}
                    <h1>Relatório de Tarefas - ${new Date().toLocaleDateString('pt-BR')}</h1>
                    ${columnHtml}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };
    
    return (
        <div className="bg-brand-secondary p-6 rounded-lg shadow-lg h-full flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-brand-text">Gerenciamento de Equipe (Kanban)</h3>
                <button onClick={handlePrint} className="bg-brand-light/80 hover:bg-brand-light text-white font-bold py-1 px-3 rounded transition text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5z" /></svg>
                    Imprimir Tarefas
                </button>
            </div>
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
                            isDraggingOver={isDraggingOverCol === column.id}
                            draggedTaskId={draggedTaskId}
                            onAddTask={onAddTask}
                            onDeleteTask={onDeleteTask}
                            onTaskClick={onTaskClick}
                            handleDragStart={handleDragStart}
                            handleDragOver={handleDragOver}
                            handleDrop={handleDrop}
                            handleDragEnter={handleDragEnter}
                            handleDragLeave={handleDragLeave}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default KanbanBoard;
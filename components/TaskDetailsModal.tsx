import React, { useState, useEffect } from 'react';
import type { KanbanTask, TeamMember } from '../types';
import { TaskPriority } from '../types';

interface TaskDetailsModalProps {
  task: KanbanTask;
  teamMembers: TeamMember[];
  onClose: () => void;
  onSave: (updatedTask: KanbanTask) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ task, teamMembers, onClose, onSave }) => {
  const [title, setTitle] = useState(task.title);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate);

  useEffect(() => {
    setTitle(task.title);
    setAssigneeId(task.assigneeId);
    setPriority(task.priority);
    setDueDate(task.dueDate);
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && assigneeId && dueDate) {
      onSave({
        ...task,
        title,
        assigneeId,
        priority,
        dueDate,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-brand-secondary rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-brand-text">Editar Tarefa</h2>
          <button onClick={onClose} className="text-brand-light hover:text-brand-text">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto bg-brand-primary flex-grow">
            <div className="space-y-4">
                 <div>
                    <label htmlFor="title" className="block text-sm font-medium text-brand-text mb-1">Título da Tarefa</label>
                    <input 
                        type="text" 
                        id="title"
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        required 
                        className="w-full bg-brand-secondary p-2 rounded-md border border-gray-300 text-brand-text focus:ring-brand-accent focus:border-brand-accent" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="assignee" className="block text-sm font-medium text-brand-text mb-1">Responsável</label>
                        <select 
                            id="assignee"
                            value={assigneeId} 
                            onChange={e => setAssigneeId(e.target.value)} 
                            required 
                            className="w-full bg-brand-secondary p-2 rounded-md border border-gray-300 text-brand-text focus:ring-brand-accent focus:border-brand-accent"
                        >
                            <option value="" disabled>Selecione...</option>
                            {teamMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-brand-text mb-1">Prioridade</label>
                        <select 
                            id="priority"
                            value={priority} 
                            onChange={e => setPriority(e.target.value as TaskPriority)} 
                            required 
                            className="w-full bg-brand-secondary p-2 rounded-md border border-gray-300 text-brand-text focus:ring-brand-accent focus:border-brand-accent"
                        >
                            {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                 </div>
                 <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-brand-text mb-1">Prazo</label>
                    <input 
                        type="date" 
                        id="dueDate"
                        value={dueDate} 
                        onChange={e => setDueDate(e.target.value)} 
                        required 
                        className="w-full bg-brand-secondary p-2 rounded-md border border-gray-300 text-brand-text focus:ring-brand-accent focus:border-brand-accent" 
                    />
                 </div>
            </div>
        </form>
        
        <div className="p-4 bg-brand-secondary border-t border-gray-200 mt-auto flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-brand-text font-bold py-2 px-4 rounded transition"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            onClick={handleSubmit} 
            className="bg-brand-accent hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
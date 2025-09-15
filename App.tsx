import React, { useState, useCallback } from 'react';
import type { ProjectPoint, FinancialData, CostEntry, UpdatePointDetailsPayload, KanbanTask, KanbanColumnId } from './types';
import { PointStatus, PointType } from './types';
import { createDefaultPoint, FINANCIAL_DATA, INITIAL_KANBAN_TASKS, TEAM_MEMBERS, INITIAL_KANBAN_COLUMNS } from './constants';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import FloorPlan from './components/FloorPlan';
import { CostCenterDashboard } from './components/Dashboard';
import { ProjectTimeline } from './components/ProjectStatus';
import KanbanBoard from './components/KanbanBoard';
import PointDetailsModal from './components/PointDetailsModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [points, setPoints] = useState<ProjectPoint[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData>(FINANCIAL_DATA);
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>(INITIAL_KANBAN_TASKS);
  const [kanbanColumns, setKanbanColumns] = useState(INITIAL_KANBAN_COLUMNS);
  const [selectedPoint, setSelectedPoint] = useState<ProjectPoint | null>(null);
  const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const handlePointSelect = (pointId: string | null) => {
    if (pointId === null) {
      setSelectedPoint(null);
      return;
    }
    const point = points.find((p) => p.id === pointId);
    setSelectedPoint(point || null);
  };

  const addPoint = useCallback((type: PointType, coords: { x: number, y: number }) => {
    const defaultPointData = createDefaultPoint(type);
    const newPoint: ProjectPoint = {
      ...defaultPointData,
      id: `${type}-${Date.now()}`,
      coords,
    };
    setPoints(prevPoints => [...prevPoints, newPoint]);
  }, []);

  const deletePoint = (pointId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ponto? A ação não pode ser desfeita.')) {
      setPoints(prevPoints => prevPoints.filter(p => p.id !== pointId));
      setSelectedPoint(null); // Fecha o modal após a exclusão
    }
  };

  const updatePointStatus = (pointId: string, newStatus: PointStatus, newChecklist: { name: string; done: boolean; }[]) => {
      setPoints(prevPoints => {
          const newPoints = prevPoints.map(p =>
              p.id === pointId ? { ...p, status: newStatus, checklist: newChecklist } : p
          );
          const updatedPoint = newPoints.find(p => p.id === pointId)!;
          setSelectedPoint(updatedPoint);
          return newPoints;
      });
  };
  
  const updatePointDetails = useCallback((pointId: string, details: UpdatePointDetailsPayload) => {
      setPoints(prevPoints => {
        const newPoints = prevPoints.map(p => 
            p.id === pointId ? { ...p, notes: details.notes, photos: details.photos } : p
        );
        const updatedPoint = newPoints.find(p => p.id === pointId);
        if (updatedPoint) {
            setSelectedPoint(updatedPoint);
        }
        return newPoints;
      });
  }, []);

  const updatePointPosition = useCallback((pointId: string, coords: { x: number; y: number }) => {
    setPoints(prevPoints =>
      prevPoints.map(p =>
        p.id === pointId ? { ...p, coords } : p
      )
    );
  }, []);
  
  const addCostEntry = useCallback((newEntry: Omit<CostEntry, 'id'>) => {
    setFinancialData(prevData => ({
        ...prevData,
        costEntries: [
            ...prevData.costEntries,
            { ...newEntry, id: Date.now() }
        ]
    }));
  }, []);

  const deleteCostEntry = useCallback((entryId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este custo?')) {
        setFinancialData(prevData => ({
            ...prevData,
            costEntries: prevData.costEntries.filter(entry => entry.id !== entryId)
        }));
    }
  }, []);

  const handleAddTask = useCallback((task: Omit<KanbanTask, 'id' | 'column'>) => {
      const newTask: KanbanTask = {
          ...task,
          id: `task-${Date.now()}`,
          column: 'todo'
      };
      setKanbanTasks(prev => [...prev, newTask]);
      setKanbanColumns(prev => ({
          ...prev,
          todo: {
              ...prev.todo,
              taskIds: [...prev.todo.taskIds, newTask.id]
          }
      }))
  }, []);

    const handleUpdateTaskStatus = useCallback((taskId: string, sourceColumnId: KanbanColumnId, destColumnId: KanbanColumnId, sourceIndex: number, destIndex: number) => {
        if (sourceColumnId === destColumnId && sourceIndex === destIndex) return;

        setKanbanColumns(prevColumns => {
            const newColumns = { ...prevColumns };

            // Remove from source column
            const sourceTaskIds = Array.from(newColumns[sourceColumnId].taskIds);
            const [movedTaskId] = sourceTaskIds.splice(sourceIndex, 1);
            newColumns[sourceColumnId] = {
                ...newColumns[sourceColumnId],
                taskIds: sourceTaskIds,
            };
            
            // Add to destination column
            if (sourceColumnId === destColumnId) {
                // If moving within the same column, the array is already modified
                sourceTaskIds.splice(destIndex, 0, movedTaskId);
            } else {
                const destTaskIds = Array.from(newColumns[destColumnId].taskIds);
                destTaskIds.splice(destIndex, 0, movedTaskId);
                newColumns[destColumnId] = {
                    ...newColumns[destColumnId],
                    taskIds: destTaskIds,
                };
            }
            
            return newColumns;
        });

        setKanbanTasks(prevTasks => prevTasks.map(task => 
            task.id === taskId ? { ...task, column: destColumnId } : task
        ));
    }, []);

    const handleDeleteTask = useCallback((taskId: string) => {
        // Use functional updates to avoid stale state issues.
        
        // 1. Remove the task from the global task list
        setKanbanTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    
        // 2. Remove the task ID from whichever column it's in.
        setKanbanColumns(prevColumns => {
            const newColumns = { ...prevColumns };
            
            // Find which column contains the taskId and create a new taskIds array for it.
            for (const columnId in newColumns) {
                const key = columnId as KanbanColumnId;
                const originalTaskIds = newColumns[key].taskIds;
                
                if (originalTaskIds.includes(taskId)) {
                    // If the task is found, update this column with a filtered taskIds list.
                    newColumns[key] = {
                        ...newColumns[key],
                        taskIds: originalTaskIds.filter(id => id !== taskId),
                    };
                    // Since a task can only be in one column, we can stop.
                    break; 
                }
            }
            
            return newColumns;
        });
    }, []);

  const handleUpdateTask = useCallback((updatedTask: KanbanTask) => {
      setKanbanTasks(prev => prev.map(task => (task.id === updatedTask.id ? updatedTask : task)));
  }, []);
  
  const handleLogoUpload = useCallback((logoDataUrl: string) => {
    setCompanyLogo(logoDataUrl);
  }, []);


  return (
    <div className="flex h-screen bg-brand-primary">
      <Sidebar isOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header companyLogo={companyLogo} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-brand-primary rounded-tl-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min">
                
                <section id="planta" className="lg:col-span-3 lg:row-span-2 md:col-span-2 md:row-span-2 bg-brand-secondary p-4 rounded-lg shadow-lg flex flex-col min-h-[550px]">
                    <FloorPlan points={points} onPointSelect={handlePointSelect} onAddPoint={addPoint} onUpdatePointPosition={updatePointPosition} />
                </section>

                <section id="custos" className="lg:col-span-1 lg:row-span-2 md:col-span-2">
                     <CostCenterDashboard 
                        financialData={financialData}
                        onAddCostEntry={addCostEntry}
                        onDeleteCostEntry={deleteCostEntry}
                        companyLogo={companyLogo}
                    />
                </section>
                
                <section id="cronograma" className="lg:col-span-2 md:col-span-2">
                    <ProjectTimeline points={points} />
                </section>
                
                <section id="kanban" className="lg:col-span-2 md:col-span-2 flex flex-col">
                    <KanbanBoard 
                        columns={kanbanColumns}
                        tasks={kanbanTasks}
                        teamMembers={TEAM_MEMBERS}
                        onUpdateTaskStatus={handleUpdateTaskStatus}
                        onAddTask={handleAddTask}
                        onDeleteTask={handleDeleteTask}
                        onTaskClick={(task) => setEditingTask(task)}
                        companyLogo={companyLogo}
                    />
                </section>

                <section id="configuracoes" className="lg:col-span-4 md:col-span-2">
                    <Settings onLogoUpload={handleLogoUpload} currentLogo={companyLogo} />
                </section>

            </div>
        </main>
      </div>
       {selectedPoint && (
        <PointDetailsModal 
          point={selectedPoint} 
          onClose={() => handlePointSelect(null)}
          onUpdateStatus={updatePointStatus}
          onUpdateDetails={updatePointDetails}
          onDelete={deletePoint}
        />
      )}
      {editingTask && (
        <TaskDetailsModal
            task={editingTask}
            teamMembers={TEAM_MEMBERS}
            onClose={() => setEditingTask(null)}
            onSave={(updatedTask) => {
                handleUpdateTask(updatedTask);
                setEditingTask(null);
            }}
        />
      )}
    </div>
  );
};

export default App;
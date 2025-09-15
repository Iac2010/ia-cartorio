import React, { useMemo } from 'react';
import type { ProjectPoint } from '../types';
import { PointStatus, PointType } from '../types';
import { PROJECT_PHASES } from '../constants';

interface ProjectTimelineProps {
    points: ProjectPoint[];
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ points }) => {
    
    const phaseStats = useMemo(() => {
        return PROJECT_PHASES.map(phase => {
            // For final phase, use all points. Otherwise, filter by relevant types.
            const relevantPoints = phase.relevantPointTypes.length > 0 
                ? points.filter(p => phase.relevantPointTypes.includes(p.type))
                : points;

            const total = relevantPoints.length;
            const stats = {
                [PointStatus.Completed]: 0,
                [PointStatus.InProgress]: 0,
                [PointStatus.Pending]: 0,
                [PointStatus.Alert]: 0,
            };

            relevantPoints.forEach(p => {
                if (stats[p.status] !== undefined) {
                    stats[p.status]++;
                }
            });

            const progress = total > 0 ? (stats[PointStatus.Completed] / total) * 100 : 0;
            
            let phaseStatus: 'pending' | 'inProgress' | 'completed' = 'pending';
            if (progress === 100 && total > 0) {
                phaseStatus = 'completed';
            } else {
                const hasActivity = relevantPoints.some(
                    p => p.status === PointStatus.InProgress || p.status === PointStatus.Completed
                );
                if (hasActivity) {
                    phaseStatus = 'inProgress';
                }
            }

            return {
                name: phase.name,
                progress,
                totalPoints: total,
                stats,
                status: phaseStatus,
            };
        });
    }, [points]);

    const StatusIcon = ({ status }: { status: 'pending' | 'inProgress' | 'completed' }) => {
        const iconBaseClasses = "w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-brand-primary";
        const svgClasses = "h-5 w-5 text-white";

        if (status === 'completed') {
            return (
                <div className={`${iconBaseClasses} bg-status-completed`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={svgClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
            );
        }
        if (status === 'inProgress') {
            return (
                <div className={`${iconBaseClasses} bg-status-progress`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={svgClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
            );
        }
        return (
            <div className={`${iconBaseClasses} bg-status-pending`}>
                 <div className="w-3 h-3 bg-brand-primary rounded-full"></div>
            </div>
        );
    };

    const StatusLegend = ({ stats }: { stats: { [key in PointStatus]: number } }) => (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-3 text-brand-light">
            <span className="flex items-center font-medium"><div className="w-2.5 h-2.5 rounded-full bg-status-completed mr-1.5"></div> Concluído: {stats[PointStatus.Completed]}</span>
            <span className="flex items-center font-medium"><div className="w-2.5 h-2.5 rounded-full bg-status-progress mr-1.5"></div> Em Andamento: {stats[PointStatus.InProgress]}</span>
            <span className="flex items-center font-medium"><div className="w-2.5 h-2.5 rounded-full bg-status-pending mr-1.5"></div> Pendente: {stats[PointStatus.Pending]}</span>
            {stats[PointStatus.Alert] > 0 && <span className="flex items-center font-medium text-status-alert"><div className="w-2.5 h-2.5 rounded-full bg-status-alert mr-1.5"></div> Alerta: {stats[PointStatus.Alert]}</span>}
        </div>
    );
    
    return (
        <div className="bg-brand-secondary p-6 rounded-lg shadow-lg h-full">
            <h3 className="text-xl font-bold text-brand-text mb-6">Linha do Tempo do Projeto</h3>
            <div className="relative pl-4">
                {/* Vertical line */}
                <div className="absolute top-0 left-8 w-0.5 h-full bg-brand-primary rounded"></div>
                
                {phaseStats.map((phase) => (
                    <div key={phase.name} className="relative pl-10 pb-8 last:pb-0">
                        {/* Status Icon on the line */}
                        <div className="absolute top-0 left-4">
                           <StatusIcon status={phase.status} />
                        </div>

                        {/* Phase Details */}
                        <div className="bg-brand-primary p-4 rounded-lg ml-6">
                             <p className="text-base font-bold text-brand-text">{phase.name}</p>
                             <p className="text-sm text-brand-light mb-3">{phase.stats[PointStatus.Completed]} de {phase.totalPoints} pontos concluídos</p>
                             <div className="w-full bg-gray-300 rounded-full h-3">
                                <div className="bg-brand-accent h-3 rounded-full transition-all duration-500" style={{ width: `${phase.progress}%` }}></div>
                             </div>
                             <StatusLegend stats={phase.stats} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

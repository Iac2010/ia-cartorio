
import React from 'react';
import type { ProjectPoint, ProjectPhase, FinancialData, TeamMember, KanbanTask, KanbanColumnId } from './types';
import { PointStatus, PointType, TaskPriority } from './types';

// Placeholder icons
const NetworkIcon: React.FC<{className?: string}> = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a10 10 0 0114.142 0M12 3v1m0 16v.01"/></svg>);
const PhoneIcon: React.FC<{className?: string}> = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>);
const CctvIcon: React.FC<{className?: string}> = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>);
const Cctv360Icon: React.FC<{className?: string}> = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>);
const RackIcon: React.FC<{className?: string}> = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>);
const VgaHdmiIcon: React.FC<{className?: string}> = ({className}) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>);

export const POINT_ICONS: Record<PointType, React.FC<{className?: string}>> = {
  [PointType.Network]: NetworkIcon,
  [PointType.Phone]: PhoneIcon,
  [PointType.Cctv]: CctvIcon,
  [PointType.Cctv360]: Cctv360Icon,
  [PointType.Rack]: RackIcon,
  [PointType.VgaHdmi]: VgaHdmiIcon
};

const networkChecklist = [ {name: 'Lançamento do Cabo', done: false}, {name: 'Conectorização', done: false}, {name: 'Montagem do Espelho', done: false}, {name: 'Teste de Conectividade', done: false} ];
const phoneChecklist = [ {name: 'Lançamento do Cabo', done: false}, {name: 'Conectorização', done: false}, {name: 'Montagem do Espelho', done: false}, {name: 'Teste de Linha', done: false} ];
const cctvChecklist = [ {name: 'Lançamento do Cabo', done: false}, {name: 'Fixação da Câmera', done: false}, {name: 'Conectorização', done: false}, {name: 'Configuração', done: false} ];
const hdmiChecklist = [ {name: 'Lançamento do Cabo', done: false}, {name: 'Conectorização', done: false}, {name: 'Montagem do Espelho', done: false}, {name: 'Teste de Sinal', done: false} ];
const rackChecklist = [ {name: 'Montagem da Estrutura', done: true}, {name: 'Instalação dos Patch Panels', done: false}, {name: 'Instalação dos Switches', done: false}, {name: 'Organização de Cabos', done: false} ];

const utpMaterial = (qty: number) => [{materialId: 'utp', quantity: qty}, {materialId: 'keystone', quantity: 1}, {materialId: 'rj45', quantity: 1}];

export const createDefaultPoint = (type: PointType): Omit<ProjectPoint, 'id' | 'coords'> => {
  const basePoint = {
    name: `Novo Ponto ${type}`,
    room: 'Não definido',
    status: PointStatus.Pending,
    notes: '',
    photos: []
  };

  switch (type) {
    case PointType.Network:
      return { ...basePoint, type, checklist: [...networkChecklist], materials: utpMaterial(1) };
    case PointType.Phone:
      return { ...basePoint, type, checklist: [...phoneChecklist], materials: utpMaterial(1) };
    case PointType.Cctv:
      return { ...basePoint, type, checklist: [...cctvChecklist], materials: [{materialId: 'utp', quantity: 1}, {materialId: 'camera-dome', quantity: 1}] };
    case PointType.Cctv360:
      return { ...basePoint, type, checklist: [...cctvChecklist], materials: [{materialId: 'utp', quantity: 1}, {materialId: 'camera-360', quantity: 1}] };
    case PointType.VgaHdmi:
        return { ...basePoint, type, checklist: [...hdmiChecklist], materials: [{materialId: 'hdmi-cable', quantity: 1}] };
    case PointType.Rack:
        return { ...basePoint, name: 'Novo Rack', type, checklist: [...rackChecklist], materials: [{materialId: 'switch-24', quantity: 1}] };
    default:
        return { ...basePoint, type, checklist: [], materials: [] };
  }
};


export const INITIAL_POINTS: ProjectPoint[] = [];

export const FINANCIAL_DATA: FinancialData = {
    budget: 0,
    materials: 0,
    labor: 0,
    costEntries: [],
};

export const PROJECT_PHASES: ProjectPhase[] = [
    { name: 'Fase 1: Lançamento de Cabeamento', relevantPointTypes: [PointType.Network, PointType.Phone, PointType.VgaHdmi, PointType.Cctv, PointType.Cctv360] },
    { name: 'Fase 2: Montagem do Rack e Patch Panels', relevantPointTypes: [PointType.Rack] },
    { name: 'Fase 3: Instalação de Câmeras e Pontos de Acesso', relevantPointTypes: [PointType.Cctv, PointType.Cctv360] },
    { name: 'Fase 4: Conectorização e Montagem dos Pontos', relevantPointTypes: [PointType.Network, PointType.Phone, PointType.VgaHdmi] },
    { name: 'Fase 5: Configuração e Testes Finais', relevantPointTypes: [] } // Testes finais englobam todos.
];

export const TEAM_MEMBERS: TeamMember[] = [
    { id: '1', name: 'João Silva', avatar: 'https://i.pravatar.cc/150?u=joao' },
    { id: '2', name: 'Maria Oliveira', avatar: 'https://i.pravatar.cc/150?u=maria' },
    { id: '3', name: 'Carlos Pereira', avatar: 'https://i.pravatar.cc/150?u=carlos' },
    { id: '4', name: 'Ana Costa', avatar: 'https://i.pravatar.cc/150?u=ana' },
];

export const INITIAL_KANBAN_TASKS: KanbanTask[] = [];

export const INITIAL_KANBAN_COLUMNS: Record<KanbanColumnId, { id: KanbanColumnId; title: string; taskIds: string[] }> = {
    todo: {
        id: 'todo',
        title: 'A Fazer',
        taskIds: [],
    },
    inprogress: {
        id: 'inprogress',
        title: 'Em Andamento',
        taskIds: [],
    },
    done: {
        id: 'done',
        title: 'Concluído',
        taskIds: [],
    },
};


export enum PointStatus {
  Pending = 'Pendente',
  InProgress = 'Em Andamento',
  Completed = 'Concluído',
  Alert = 'Alerta',
}

export enum PointType {
  Network = 'Rede',
  Phone = 'Telefone',
  VgaHdmi = 'VGA/HDMI',
  Cctv = 'CFTV',
  Cctv360 = 'CFTV 360',
  Rack = 'Rack',
}

export interface ChecklistItem {
  name: string;
  done: boolean;
}

export interface MaterialUsage {
  materialId: string;
  quantity: number;
}

export interface ProjectPoint {
  id: string;
  name: string;
  room: string;
  type: PointType;
  status: PointStatus;
  coords: { x: number; y: number };
  checklist: ChecklistItem[];
  materials: MaterialUsage[];
  notes: string;
  photos: string[];
}

export interface UpdatePointDetailsPayload {
    notes: string;
    photos: string[];
}

export interface ProjectPhase {
    name: string;
    relevantPointTypes: PointType[];
}

export enum CostCategory {
    Transportation = 'Transporte',
    Tools = 'Ferramentas',
    Permits = 'Licenças',
    Other = 'Outros',
}

export interface CostEntry {
    id: number;
    date: string;
    description: string;
    amount: number;
    category: CostCategory;
}

export interface FinancialData {
    budget: number;
    materials: number;
    labor: number;
    costEntries: CostEntry[];
}

export enum TaskPriority {
    Baixa = 'Baixa',
    Media = 'Média',
    Alta = 'Alta'
}

export type KanbanColumnId = 'todo' | 'inprogress' | 'done';

export interface TeamMember {
    id: string;
    name: string;
    avatar: string;
}

export interface KanbanTask {
    id: string;
    title: string;
    assigneeId: string;
    priority: TaskPriority;
    dueDate: string;
    column: KanbanColumnId;
}

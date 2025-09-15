

import React, { useState, useRef } from 'react';
import type { ProjectPoint } from '../types';
import { PointType } from '../types';
import { POINT_ICONS } from '../constants';

interface FloorPlanProps {
  points: ProjectPoint[];
  onPointSelect: (pointId: string) => void;
  onAddPoint: (type: PointType, coords: { x: number, y: number }) => void;
  onUpdatePointPosition: (pointId: string, coords: { x: number, y: number }) => void;
}

interface FloorPlanPage {
  id: string;
  name: string;
  image: string | null;
}

const statusColors: { [key: string]: string } = {
  'Pendente': 'bg-status-pending',
  'Em Andamento': 'bg-status-progress',
  'Concluído': 'bg-status-completed',
  'Alerta': 'bg-status-alert',
};

const statusTextColors: { [key: string]: string } = {
    'Pendente': 'text-status-pending',
    'Em Andamento': 'text-status-progress',
    'Concluído': 'text-status-completed',
    'Alerta': 'text-status-alert',
};

const pointTypeFilters = [
    { name: 'Rede e Telefonia', types: [PointType.Network, PointType.Phone, PointType.VgaHdmi] },
    { name: 'CFTV', types: [PointType.Cctv, PointType.Cctv360] },
    { name: 'Rack (CPD)', types: [PointType.Rack] },
];

const AddPointToolbar: React.FC<{ onSelectPointType: (type: PointType) => void; activeType: PointType | null }> = ({ onSelectPointType, activeType }) => {
    const pointTypes = Object.values(PointType);
    return (
        <div className="bg-brand-primary p-2 rounded-lg flex gap-2">
            <span className="text-brand-text font-semibold self-center mr-2">Adicionar Ponto:</span>
            {pointTypes.map(type => {
                const Icon = POINT_ICONS[type];
                const isActive = activeType === type;
                return (
                    <button
                        key={type}
                        title={`Adicionar ${type}`}
                        onClick={() => onSelectPointType(type)}
                        className={`w-10 h-10 p-2 rounded-md flex items-center justify-center transition ${isActive ? 'bg-brand-accent scale-110' : 'bg-gray-200 hover:bg-brand-accent'}`}
                    >
                        <Icon className={isActive ? "text-white" : "text-brand-text"} />
                    </button>
                )
            })}
        </div>
    )
};


const FloorPlan: React.FC<FloorPlanProps> = ({ points, onPointSelect, onAddPoint, onUpdatePointPosition }) => {
    const [activeFilters, setActiveFilters] = useState<PointType[]>(Object.values(PointType));
    const [showSecurityLayer, setShowSecurityLayer] = useState<boolean>(false);
    
    const [floorPlans, setFloorPlans] = useState<FloorPlanPage[]>([
        { id: 'plan1', name: 'P1', image: null },
        { id: 'plan2', name: 'P2', image: null },
    ]);
    const [activePlanId, setActivePlanId] = useState<string>('plan1');
    
    const [placementMode, setPlacementMode] = useState<PointType | null>(null);
    const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const isDraggingRef = useRef(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const floorPlanRef = useRef<HTMLDivElement>(null);

    const toggleFilter = (types: PointType[]) => {
        const allPresent = types.every(t => activeFilters.includes(t));
        if (allPresent) {
            setActiveFilters(activeFilters.filter(t => !types.includes(t)));
        } else {
            setActiveFilters([...activeFilters, ...types]);
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFloorPlans(prevPlans => 
                    prevPlans.map(plan => 
                        plan.id === activePlanId ? { ...plan, image: reader.result as string } : plan
                    )
                );
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handlePlanClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!placementMode || !floorPlanRef.current) return;
        
        const rect = floorPlanRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        
        onAddPoint(placementMode, { x, y });
        setPlacementMode(null);
    };
    
    const handleSelectPointType = (type: PointType) => {
        setPlacementMode(prev => prev === type ? null : type);
    }

    const handleDragStart = (e: React.MouseEvent, pointId: string) => {
        e.preventDefault();
        setDraggingPointId(pointId);
        isDraggingRef.current = false;
        document.body.style.cursor = 'grabbing';
    };

    const handleDragMove = (e: React.MouseEvent) => {
        if (!draggingPointId || !floorPlanRef.current) return;
        
        isDraggingRef.current = true;
        
        const rect = floorPlanRef.current.getBoundingClientRect();
        
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;

        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        onUpdatePointPosition(draggingPointId, { x, y });
    };

    const handleDragEnd = () => {
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 50);
        setDraggingPointId(null);
        document.body.style.cursor = 'default';
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));

    const addFloorPlan = () => {
        const newPlanNumber = floorPlans.length + 1;
        const newPlan: FloorPlanPage = {
            id: `plan${newPlanNumber}`,
            name: `P${newPlanNumber}`,
            image: null,
        };
        setFloorPlans(prevPlans => [...prevPlans, newPlan]);
        setActivePlanId(newPlan.id);
    };

    const activePlan = floorPlans.find(p => p.id === activePlanId);
    const visiblePoints = points.filter(p => activeFilters.includes(p.type));
  
    const currentCustomPlan = activePlan?.image;
    const defaultPlanImage = "url('https://i.postimg.cc/wMPyQ3C2/base-floor-plan.png')";
    const defaultOtherPlanImage = "url('https://i.postimg.cc/d1mX3d7f/planta-baixa-vazia.png')";
    const securityPlanImage = "url('https://i.postimg.cc/7ZpY6YjM/planta-seguranca.png')";
  
    let floorPlanImage: string;
    if (currentCustomPlan) {
        floorPlanImage = `url(${currentCustomPlan})`;
    } else if (activePlanId === 'plan1') {
        floorPlanImage = showSecurityLayer ? securityPlanImage : defaultPlanImage;
    } else {
        floorPlanImage = defaultOtherPlanImage;
    }

  return (
    <div className="h-full flex flex-col">
        <h1 className="text-3xl font-bold text-brand-text mb-4">Planta Baixa Interativa - {activePlan ? `Planta ${activePlan.name}` : ''}</h1>
        
        <div className="mb-4 flex flex-wrap gap-2 items-center">
            <AddPointToolbar onSelectPointType={handleSelectPointType} activeType={placementMode} />
            <div className="border-l border-gray-300 h-6 mx-2"></div>
            <div className="bg-brand-primary p-2 rounded-lg flex gap-2 items-center">
                <span className="text-brand-text font-semibold self-center mr-2">Zoom:</span>
                <button
                    onClick={handleZoomOut}
                    title="Diminuir Zoom"
                    className="w-10 h-10 p-2 rounded-md flex items-center justify-center bg-gray-200 hover:bg-brand-accent transition disabled:opacity-50 disabled:cursor-not-allowed group"
                    disabled={zoomLevel <= 0.5}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-brand-text group-hover:text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                </button>
                <span className="text-brand-text font-semibold w-16 text-center tabular-nums">
                    {Math.round(zoomLevel * 100)}%
                </span>
                <button
                    onClick={handleZoomIn}
                    title="Aumentar Zoom"
                    className="w-10 h-10 p-2 rounded-md flex items-center justify-center bg-gray-200 hover:bg-brand-accent transition disabled:opacity-50 disabled:cursor-not-allowed group"
                    disabled={zoomLevel >= 3}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-brand-text group-hover:text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
            </div>
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2 items-center">
            <button onClick={() => setActiveFilters(Object.values(PointType))} className="px-4 py-2 text-sm bg-brand-text text-white rounded-md hover:opacity-80 transition">Mostrar Todos</button>
            <button onClick={() => setActiveFilters([])} className="px-4 py-2 text-sm bg-gray-300 text-brand-text rounded-md hover:bg-gray-400 transition">Esconder Todos</button>
            {pointTypeFilters.map(filter => (
                 <button 
                    key={filter.name}
                    onClick={() => toggleFilter(filter.types)}
                    className={`px-4 py-2 text-sm rounded-md transition ${filter.types.every(t => activeFilters.includes(t)) ? 'bg-brand-accent text-white' : 'bg-brand-primary text-brand-light hover:bg-brand-accent hover:text-white'}`}
                >
                    {filter.name}
                </button>
            ))}
             <div className="border-l border-gray-300 h-6 mx-2"></div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
            />
            <button 
                onClick={triggerFileUpload}
                className="px-4 py-2 text-sm bg-brand-light text-white rounded-md hover:opacity-80 transition flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span>Upload Planta {activePlan?.name}</span>
            </button>
             <button
                onClick={() => setShowSecurityLayer(!showSecurityLayer)}
                disabled={activePlanId !== 'plan1'}
                className={`px-4 py-2 text-sm rounded-md transition flex items-center gap-2 ${showSecurityLayer ? 'bg-brand-accent text-white' : 'bg-brand-primary text-brand-light hover:bg-brand-accent hover:text-white'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-primary disabled:hover:text-brand-light`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.015h-.008v-.015z" />
                </svg>
                <span>Planta de Segurança</span>
            </button>
        </div>

        <div className="flex-grow flex">
            <div className="flex flex-col items-center p-2 space-y-4 bg-brand-primary rounded-l-lg">
                {floorPlans.map((plan) => (
                    <button
                    key={plan.id}
                    onClick={() => setActivePlanId(plan.id)}
                    title={`Planta ${plan.name}`}
                    className={`w-12 h-12 font-bold text-xl rounded-lg flex items-center justify-center transition-all duration-200 ${
                        activePlanId === plan.id
                        ? 'bg-brand-accent text-white shadow-md'
                        : 'bg-brand-secondary text-brand-light hover:bg-brand-accent hover:text-white'
                    }`}
                    >
                    {plan.name}
                    </button>
                ))}
                 <button
                    onClick={addFloorPlan}
                    title="Adicionar nova planta"
                    className="w-12 h-12 font-bold text-2xl rounded-lg flex items-center justify-center bg-gray-200 text-brand-text hover:bg-brand-accent hover:text-white transition-all duration-200"
                >
                    +
                </button>
            </div>
            
            <div className="flex-grow bg-gray-200 rounded-r-lg shadow-inner p-4 overflow-auto relative">
                <div 
                    ref={floorPlanRef}
                    onClick={handlePlanClick}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    className={`relative bg-white shadow-md bg-center bg-no-repeat bg-contain transition-transform duration-200 ${draggingPointId ? 'cursor-grabbing' : ''}`}
                    style={{ 
                        backgroundImage: floorPlanImage, 
                        width: '1200px', 
                        height: '848px', 
                        cursor: placementMode ? 'crosshair' : 'default',
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top left'
                    }}
                >
                    {visiblePoints.map(point => {
                        const Icon = POINT_ICONS[point.type];
                        const colorClass = statusTextColors[point.status];
                        return (
                            <div 
                                key={point.id} 
                                style={{ left: `${point.coords.x}%`, top: `${point.coords.y}%` }} 
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab"
                                onMouseDown={(e) => handleDragStart(e, point.id)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDraggingRef.current) {
                                        onPointSelect(point.id);
                                    }
                                }}
                            >
                                <div
                                    className={`group flex flex-col items-center`}
                                    title={`${point.name} - ${point.status}`}
                                >
                                    <div className={`w-8 h-8 p-1.5 rounded-full flex items-center justify-center transition-transform group-hover:scale-125 ${statusColors[point.status]}`}>
                                        <Icon className="text-white w-full h-full" />
                                    </div>
                                    <span className={`mt-1 text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full bg-brand-text/80 text-white ${colorClass} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                        {point.id}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
};

export default FloorPlan;
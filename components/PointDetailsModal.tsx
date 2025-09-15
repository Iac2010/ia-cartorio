import React, { useState, useEffect } from 'react';
import type { ProjectPoint, UpdatePointDetailsPayload } from '../types';
import { PointStatus } from '../types';

interface PointDetailsModalProps {
  point: ProjectPoint;
  onClose: () => void;
  onUpdateStatus: (pointId: string, newStatus: PointStatus, newChecklist: { name: string; done: boolean; }[]) => void;
  onUpdateDetails: (pointId: string, details: UpdatePointDetailsPayload) => void;
  onDelete: (pointId: string) => void;
}

const statusColors: { [key: string]: string } = {
  [PointStatus.Pending]: 'border-status-pending text-status-pending',
  [PointStatus.InProgress]: 'border-status-progress text-status-progress',
  [PointStatus.Completed]: 'border-status-completed text-status-completed',
  [PointStatus.Alert]: 'border-status-alert text-status-alert',
};

const PointDetailsModal: React.FC<PointDetailsModalProps> = ({ point, onClose, onUpdateStatus, onUpdateDetails, onDelete }) => {
  const [checklist, setChecklist] = useState(point.checklist);
  const [notes, setNotes] = useState(point.notes);
  const [photos, setPhotos] = useState(point.photos);

  useEffect(() => {
    setChecklist(point.checklist);
    setNotes(point.notes);
    setPhotos(point.photos);
  }, [point]);

  const handleChecklistChange = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index].done = !newChecklist[index].done;
    setChecklist(newChecklist);

    const allDone = newChecklist.every(item => item.done);
    const someDone = newChecklist.some(item => item.done);
    let newStatus = point.status;

    if (allDone) {
      newStatus = PointStatus.Completed;
    } else if (someDone) {
      newStatus = PointStatus.InProgress;
    } else {
      newStatus = PointStatus.Pending;
    }
    
    onUpdateStatus(point.id, newStatus, newChecklist);
  };
  
  const handleAddPhoto = () => {
    setPhotos(prevPhotos => [...prevPhotos, `https://picsum.photos/seed/${point.id}-${Date.now()}/400/300`]);
  }
  
  const handleSaveAndClose = () => {
    onUpdateDetails(point.id, { notes, photos });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-brand-secondary rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-brand-text">{point.name}</h2>
            <p className="text-brand-light">{point.room}</p>
          </div>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full border-2 ${statusColors[point.status]}`}>
            {point.status}
          </span>
        </div>
        
        <div className="p-6 overflow-y-auto bg-brand-primary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-brand-text mb-3">Checklist de Execução</h3>
                    <div className="space-y-2">
                        {checklist.map((item, index) => (
                            <label key={index} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                type="checkbox"
                                checked={item.done}
                                onChange={() => handleChecklistChange(index)}
                                className="h-5 w-5 rounded bg-brand-secondary border-gray-300 text-brand-accent focus:ring-brand-accent"
                                />
                                <span className={item.done ? 'text-gray-400 line-through' : 'text-brand-text'}>
                                {item.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-brand-text mb-3">Observações e Fotos</h3>
                    <textarea 
                        className="w-full bg-brand-secondary p-2 rounded-md border border-gray-300 text-brand-text text-sm focus:ring-brand-accent focus:border-brand-accent" 
                        rows={3}
                        placeholder="Adicione observações aqui..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                     <div className="mt-2 grid grid-cols-3 gap-2">
                        {photos.map((photo, index) => (
                            <img key={index} src={photo} alt={`Foto ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                        ))}
                        <button onClick={handleAddPhoto} className="w-full h-24 bg-brand-secondary border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-brand-light cursor-pointer hover:bg-gray-100 transition">
                            + Foto
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="p-4 bg-brand-secondary border-t border-gray-200 mt-auto flex justify-between">
          <button 
            onClick={() => onDelete(point.id)} 
            className="bg-status-alert/80 hover:bg-status-alert text-white font-bold py-2 px-4 rounded transition flex items-center gap-2"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Excluir Ponto
          </button>
          <button onClick={handleSaveAndClose} className="bg-brand-accent hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition">
            Salvar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointDetailsModal;
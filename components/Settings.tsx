import React, { useRef } from 'react';

interface SettingsProps {
    onLogoUpload: (logoDataUrl: string) => void;
    currentLogo: string | null;
}

const Settings: React.FC<SettingsProps> = ({ onLogoUpload, currentLogo }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onLogoUpload(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-brand-secondary p-6 rounded-lg shadow-lg h-full">
            <h3 className="text-xl font-bold text-brand-text mb-4">Configurações</h3>
            <div className="bg-brand-primary p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-brand-text mb-3">Logomarca da Empresa</h4>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-brand-secondary rounded-md flex items-center justify-center border border-gray-200">
                        {currentLogo ? (
                            <img src={currentLogo} alt="Logomarca da Empresa" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <span className="text-xs text-brand-light text-center">Sem Logo</span>
                        )}
                    </div>
                    <div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <button
                            onClick={triggerFileUpload}
                            className="bg-brand-accent hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition"
                        >
                            Fazer Upload da Logomarca
                        </button>
                        <p className="text-xs text-brand-light mt-2">Use imagens PNG, JPG ou SVG.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

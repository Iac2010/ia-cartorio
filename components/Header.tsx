
import React from 'react';

interface HeaderProps {
  companyLogo: string | null;
}

const Header: React.FC<HeaderProps> = ({ companyLogo }) => {
  return (
    <header className="bg-brand-secondary p-4 shadow-md z-10 flex items-center gap-4">
      {companyLogo && (
        <img src={companyLogo} alt="Logomarca da Empresa" className="h-8 w-auto" />
      )}
      <h1 className="text-xl font-semibold text-brand-text">Projeto Cartório Campo Grande 2</h1>
    </header>
  );
};

export default Header;
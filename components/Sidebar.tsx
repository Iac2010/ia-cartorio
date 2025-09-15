import React, { useState, useEffect, useRef } from 'react';

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm6-11a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;


interface SidebarProps {
  isOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const navItems = [
  { href: '#planta', icon: <HomeIcon />, label: 'Planta Baixa' },
  { href: '#custos', icon: <ChartPieIcon />, label: 'Central de Custo' },
  { href: '#cronograma', icon: <CalendarIcon />, label: 'Cronograma' },
  { href: '#kanban', icon: <UsersIcon />, label: 'Gerenciamento de Equipe' },
  { href: '#configuracoes', icon: <SettingsIcon />, label: 'Configurações' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setSidebarOpen }) => {
  const [activeSection, setActiveSection] = useState<string>('#planta');
  const observer = useRef<IntersectionObserver | null>(null);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const sectionId = href.substring(1);
    const mainPanel = document.querySelector('main');
    const section = document.getElementById(sectionId);
    if (section && mainPanel) {
        // We need to calculate the offset from the top of the scrollable container
        const scrollTop = mainPanel.scrollTop;
        const sectionTop = section.offsetTop;
        
        mainPanel.scrollTo({
            top: sectionTop - 20, // 20px offset from the top
            behavior: 'smooth'
        });
        setActiveSection(href);
    }
  };

  useEffect(() => {
    const options = {
      root: document.querySelector('main'), // observe within the main scrollable area
      rootMargin: '0px 0px -50% 0px',
      threshold: 0.1 
    };

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(`#${entry.target.id}`);
        }
      });
    }, options);

    const sections = document.querySelectorAll('main section');
    sections.forEach(section => observer.current?.observe(section));

    return () => {
      sections.forEach(section => observer.current?.unobserve(section));
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 h-full bg-brand-secondary text-brand-light flex flex-col transition-all duration-300 z-20 shadow-lg ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className={`flex items-center p-4 border-b border-gray-200 ${isOpen ? 'justify-between' : 'justify-center'}`}>
         {isOpen && <span className="text-xl font-bold text-brand-text">IA Company</span>}
         <button onClick={() => setSidebarOpen(!isOpen)} className="text-brand-light hover:text-brand-text">
            {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
         </button>
      </div>
      <nav className="flex-grow mt-4">
        {navItems.map(item => {
          const isActive = activeSection === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className={`flex items-center py-3 my-1 transition-colors relative ${isOpen ? 'px-4' : 'px-5 justify-center'} ${isActive ? 'text-brand-accent font-semibold' : 'hover:bg-brand-accent/10 hover:text-brand-accent'}`}
              title={item.label}
            >
              {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-brand-accent rounded-r-full"></div>}
              {item.icon}
              {isOpen && <span className="ml-4">{item.label}</span>}
            </a>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
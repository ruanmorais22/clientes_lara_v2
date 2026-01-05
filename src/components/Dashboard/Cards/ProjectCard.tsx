import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Project, Folder } from '../../../types';
import { ImageIcon, Trash2, Move } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  folders: Folder[];
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onMove: (folderId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, folders, onClick, onDelete, onMove }) => {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (showMoveMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX - 110
      });
    }
  }, [showMoveMenu]);


  return (
    <div
      onClick={onClick}
      className="group bg-[#0F1E36] rounded-xl border border-white/5 hover:border-[#D4AF37]/30 shadow-xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col active:scale-95 md:active:scale-100"
    >
      <div className="relative w-full pb-[100%] bg-[#051024] overflow-hidden">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.name}
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-700">
            <ImageIcon size={32} className="md:w-12 md:h-12" />
          </div>
        )}
        <div className="absolute top-1 right-1 md:top-2 md:right-2 flex gap-1 z-10">
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowMoveMenu(!showMoveMenu);
              }}
              className="bg-black/50 backdrop-blur-sm border border-white/50 text-white p-1.5 md:p-2 rounded-lg"
            >
              <Move size={12} className="md:w-[14px] md:h-[14px]" />
            </button>
            {showMoveMenu && createPortal(
              <div
                className="absolute right-0 mt-2 w-48 bg-[#0F1E36] border border-white/10 rounded-md shadow-lg z-20"
                style={{ top: menuPosition.top, left: menuPosition.left }}
              >
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(folder.id);
                      setShowMoveMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#051024]"
                  >
                    {folder.name}
                  </button>
                ))}
              </div>,
              document.body
            )}
          </div>
          <button
            onClick={onDelete}
            className="bg-black/50 backdrop-blur-sm border border-red-500/50 text-red-400 p-1.5 md:p-2 rounded-lg"
          >
            <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
          </button>
        </div>
      </div>
      <div className="p-3 md:p-4 border-t border-white/5 bg-[#0F1E36]">
        <h4 className="font-poppins font-bold text-white text-xs md:text-base truncate text-center group-hover:text-[#D4AF37] transition-colors">
          {project.name}
        </h4>
      </div>
    </div>
  );
};

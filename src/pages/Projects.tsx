import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Check, ArrowUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Editor, { Block } from '../components/Editor';

type Project = {
  id: string;
  title: string;
  blocks: Block[];
};

const DEFAULT_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'LOKI Project',
    blocks: [
      { id: 'b1', type: 'text', content: '<h1 class="text-4xl font-serif font-bold mb-6 text-brand-orange">LOKI Project</h1><p class="text-xl text-gray-600 mb-8">A minimalist design exploration focusing on clean lines and subtle interactions.</p>', x: 50, y: 50, zIndex: 1 },
      { id: 'b2', type: 'image', content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', x: 50, y: 200, zIndex: 2 }
    ]
  },
  {
    id: '2',
    title: 'Make Us Care',
    blocks: [
      { id: 'b3', type: 'text', content: '<h1 class="text-4xl font-serif font-bold mb-6 text-brand-green">Make Us Care</h1><p class="text-xl text-gray-600 mb-8">A campaign focused on environmental awareness and sustainable living.</p>', x: 50, y: 50, zIndex: 1 },
      { id: 'b4', type: 'image', content: 'https://images.unsplash.com/photo-1466692476877-396416fd4622?q=80&w=2671&auto=format&fit=crop', x: 50, y: 200, zIndex: 2 }
    ]
  }
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Yield to browser to allow fast route transition
      await new Promise(resolve => setTimeout(resolve, 0));
      const saved = localStorage.getItem('my_projects');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProjects(parsed);
          if (parsed.length > 0) setActiveProjectId(parsed[0].id);
        } catch (e) {
          setActiveProjectId(DEFAULT_PROJECTS[0].id);
        }
      } else {
        setActiveProjectId(DEFAULT_PROJECTS[0].id);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timeoutId = setTimeout(() => {
      localStorage.setItem('my_projects', JSON.stringify(projects));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [projects, isLoading]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-bg-warm flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleAddProject = () => {
    const newProject: Project = {
      id: uuidv4(),
      title: '新项目',
      blocks: [{ id: uuidv4(), type: 'text', content: '<h1 class="text-4xl font-serif font-bold mb-6 text-gray-800">新项目标题</h1><p class="text-xl text-gray-600">在这里开始描述你的项目...</p>', x: 50, y: 50, zIndex: 1 }]
    };
    setProjects([newProject, ...projects]);
    setActiveProjectId(newProject.id);
    startEditing(newProject.id, newProject.title);
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newProjects = projects.filter(p => p.id !== id);
    setProjects(newProjects);
    if (activeProjectId === id && newProjects.length > 0) {
      setActiveProjectId(newProjects[0].id);
    } else if (newProjects.length === 0) {
      setActiveProjectId('');
    }
  };

  const startEditing = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEditing = (id: string) => {
    if (editTitle.trim()) {
      setProjects(projects.map(p => p.id === id ? { ...p, title: editTitle } : p));
    }
    setEditingId(null);
  };

  const handleBlocksChange = (newBlocks: Block[]) => {
    if (!activeProjectId) return;
    setProjects(projects.map(p => p.id === activeProjectId ? { ...p, blocks: newBlocks } : p));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full pl-4 pr-8 py-24 flex gap-12 items-start min-h-screen bg-bg-warm relative">
      {/* Left Column: Project List */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r-[3px] border-gray-200 pr-6 sticky top-24 h-[calc(100vh-8rem)] relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-4xl font-bold text-gray-900">我的项目</h2>
          <button 
            onClick={handleAddProject}
            className="p-2 rounded-full hover:bg-brand-orange/10 text-brand-orange transition-colors"
            title="添加新项目"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          <AnimatePresence>
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeProjectId === project.id
                    ? 'bg-white shadow-md border border-gray-100 scale-105 z-10'
                    : 'hover:bg-gray-50 text-gray-500 hover:text-gray-800'
                }`}
                onClick={() => setActiveProjectId(project.id)}
              >
                {editingId === project.id ? (
                  <div className="flex items-center w-full gap-2" onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEditing(project.id)}
                      className="flex-1 bg-transparent border-b border-brand-orange focus:outline-none text-lg font-medium px-1"
                    />
                    <button onClick={() => saveEditing(project.id)} className="text-brand-green hover:scale-110 transition-transform">
                      <Check size={20} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={`font-medium truncate pr-8 text-left w-full text-xl ${activeProjectId === project.id ? 'text-brand-orange font-bold' : ''}`}>
                      {project.title}
                    </span>
                    <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); startEditing(project.id, project.title); }}
                        className="p-1 text-gray-400 hover:text-brand-green transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="p-1 text-gray-400 hover:text-brand-red transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {projects.length === 0 && (
            <div className="text-center text-gray-400 mt-8 text-sm">
              暂无项目，点击右上角添加
            </div>
          )}
        </div>

        {/* Back to Top Button inside sidebar at bottom right */}
        <button
          onClick={scrollToTop}
          className="absolute bottom-0 right-6 p-3 bg-white text-gray-400 rounded-full shadow-sm border border-gray-100 hover:shadow-md hover:text-brand-orange transition-all z-50"
          title="回到顶部"
        >
          <ArrowUp size={20} />
        </button>
      </div>

      {/* Right Column: Project Content Editor */}
      <div className="flex-1 pb-32">
        <AnimatePresence mode="wait">
          {activeProject ? (
            <motion.div
              key={activeProject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Editor 
                initialBlocks={activeProject.blocks} 
                onChange={handleBlocksChange}
              />
            </motion.div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 font-serif text-xl">
              请选择或创建一个项目
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

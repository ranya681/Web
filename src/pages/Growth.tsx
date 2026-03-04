import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor, { Block } from '../components/Editor';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_GROWTH_BLOCKS: Block[] = [
  { id: uuidv4(), type: 'text', content: '<h1 class="text-5xl font-serif font-bold mb-8 text-brand-green">个人成长</h1><p class="text-2xl text-gray-600 mb-12 leading-relaxed">在这里记录我的学习轨迹、思考感悟和成长瞬间。</p>', x: 50, y: 50, zIndex: 1 },
  { id: uuidv4(), type: 'image', content: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2670&auto=format&fit=crop', x: 50, y: 300, zIndex: 2 },
  { id: uuidv4(), type: 'text', content: '<h2 class="text-3xl font-serif font-bold mt-12 mb-6 text-brand-orange">2024年的目标</h2><ul class="list-disc pl-6 space-y-4 text-xl text-gray-700"><li>掌握前端全栈开发技能</li><li>完成至少3个独立设计项目</li><li>保持每周阅读一本书的习惯</li></ul>', x: 50, y: 600, zIndex: 3 }
];

export default function Growth() {
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_GROWTH_BLOCKS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      const saved = localStorage.getItem('my_growth');
      if (saved) {
        try {
          setBlocks(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timeoutId = setTimeout(() => {
      localStorage.setItem('my_growth', JSON.stringify(blocks));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [blocks, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto px-6 py-16 min-h-[calc(100vh-6rem)]"
    >
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-16 min-h-[80vh]">
        <Editor initialBlocks={blocks} onChange={setBlocks} />
      </div>
    </motion.div>
  );
}

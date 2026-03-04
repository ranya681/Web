import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Type, Trash2, GripHorizontal } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, useDragControls } from 'framer-motion';

export type Block = {
  id: string;
  type: 'text' | 'image';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  zIndex: number;
};

interface EditorProps {
  initialBlocks?: Block[];
  onChange?: (blocks: Block[]) => void;
}

interface BlockItemProps {
  block: Block;
  containerRef: React.RefObject<HTMLDivElement>;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
  bringToFront: (id: string) => void;
  handleImageUpload: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BlockItem: React.FC<BlockItemProps> = ({ 
  block, 
  containerRef, 
  updateBlock, 
  removeBlock, 
  bringToFront, 
  handleImageUpload 
}) => {
  const controls = useDragControls();

  const startResize = (e: React.PointerEvent, currentWidth: number | undefined) => {
    e.preventDefault();
    e.stopPropagation();
    bringToFront(block.id);
    const startX = e.clientX;
    const startWidth = currentWidth || (block.type === 'text' ? 300 : 400);

    const onMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(100, startWidth + deltaX);
      updateBlock(block.id, { width: newWidth });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <motion.div
      drag
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragConstraints={containerRef}
      onPointerDown={() => bringToFront(block.id)}
      onDragEnd={(e, info) => {
        updateBlock(block.id, { 
          x: block.x + info.offset.x, 
          y: block.y + info.offset.y 
        });
      }}
      initial={{ x: block.x, y: block.y }}
      animate={{ x: block.x, y: block.y }}
      style={{ zIndex: block.zIndex, width: block.width }}
      className="absolute top-0 left-0 group"
    >
      {/* Drag Handle */}
      <div 
        className="absolute -top-8 left-0 bg-white border border-gray-200 rounded-t-lg px-3 py-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-50 flex items-center justify-center shadow-sm text-gray-400 hover:text-gray-600"
        onPointerDown={(e) => controls.start(e)}
        title="拖动"
      >
        <GripHorizontal size={16} />
      </div>

      {/* Delete Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
        className="absolute -top-8 right-0 bg-white text-gray-400 hover:text-brand-red p-1.5 rounded-t-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-gray-200"
        title="删除"
      >
        <Trash2 size={16} />
      </button>

      {block.type === 'text' ? (
        <div className="relative bg-transparent group/text">
          <div
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => updateBlock(block.id, { content: e.currentTarget.innerHTML })}
            className="editor-content w-full min-h-[2rem] outline-none text-lg leading-relaxed text-gray-700 font-sans p-4 rounded-xl hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-orange/20 transition-all border border-transparent hover:border-gray-300 cursor-text"
            placeholder="输入文字..."
            dangerouslySetInnerHTML={{ __html: block.content }}
            onPointerDown={(e) => e.stopPropagation()} // Allow text selection
          />
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover/text:opacity-100 z-10 flex items-end justify-end p-1"
            onPointerDown={(e) => startResize(e, block.width)}
          >
            <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400"></div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-gray-50 border-2 border-transparent hover:border-gray-300 transition-colors group/img">
          {block.content ? (
            <img src={block.content} alt="Uploaded" className="w-full h-auto object-cover pointer-events-none" />
          ) : (
            <label className="flex flex-col items-center justify-center p-12 cursor-pointer text-gray-500 hover:text-gray-700 w-full h-full min-h-[200px]">
              <ImageIcon size={48} className="mb-4 opacity-50" />
              <span className="font-medium">点击上传图片</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(block.id, e)} />
            </label>
          )}
          
          {/* Image Controls */}
          {block.content && (
            <label className="absolute top-2 left-2 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-medium px-3 py-1.5 rounded-md text-sm z-10 hover:bg-black/70">
              更换
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(block.id, e)} />
            </label>
          )}
          
          {/* Resize Handle */}
          <div 
            className="absolute bottom-0 right-0 w-6 h-6 bg-white/80 backdrop-blur-sm border-t border-l border-gray-200 cursor-se-resize opacity-0 group-hover/img:opacity-100 rounded-tl-lg z-10 flex items-center justify-center"
            onPointerDown={(e) => startResize(e, block.width)}
            title="拖动缩放"
          >
            <div className="w-2 h-2 border-r-2 border-b-2 border-gray-500"></div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function Editor({ initialBlocks = [], onChange }: EditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current?.(blocks);
  }, [blocks]);

  const bringToFront = (id: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setBlocks(blocks.map(b => b.id === id ? { ...b, zIndex: newZIndex } : b));
  };

  const addBlock = (type: 'text' | 'image') => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    const newBlock: Block = { 
      id: uuidv4(), 
      type, 
      content: '', 
      x: 50, 
      y: 50, 
      width: type === 'text' ? 300 : 400,
      zIndex: newZIndex 
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateBlock(id, { content: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex gap-2 bg-white shadow-sm border border-gray-100 rounded-xl p-2 self-start sticky top-28 z-40">
        <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-orange/10 hover:text-brand-orange transition-colors text-sm font-medium text-gray-600">
          <Type size={16} /> 添加文字
        </button>
        <button onClick={() => addBlock('image')} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-brand-green/10 hover:text-brand-green transition-colors text-sm font-medium text-gray-600">
          <ImageIcon size={16} /> 添加图片
        </button>
      </div>

      {/* Canvas */}
      <div 
        ref={containerRef}
        className="relative w-full min-h-[1200px] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
      >
        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
            点击上方按钮添加内容，支持自由拖拽和缩放
          </div>
        )}
        
        {blocks.map((block) => (
          <BlockItem
            key={block.id}
            block={block}
            containerRef={containerRef}
            updateBlock={updateBlock}
            removeBlock={removeBlock}
            bringToFront={bringToFront}
            handleImageUpload={handleImageUpload}
          />
        ))}
      </div>
    </div>
  );
}

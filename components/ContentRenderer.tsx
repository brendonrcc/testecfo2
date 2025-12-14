
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ContentBlock } from '../types.ts';
import { 
  Copy, 
  Check, 
  ChevronDown, 
  MessageSquare, 
  SendHorizontal,
  Info,
  AlertTriangle,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

interface ContentRendererProps {
  blocks: ContentBlock[];
}

interface BlockStatus {
  isClicked: boolean;
  isSkipped: boolean;
}

const processBlocks = (blocks: ContentBlock[]) => {
  const nodeMap = new Map<string, ContentBlock>();
  const sequence: string[] = []; 

  const traverse = (nodes: ContentBlock[]) => {
    nodes.forEach(node => {
      nodeMap.set(node.id, node);
      // Incluído 'p' na sequência de rastreamento de clique
      if (node.type === 'leaf' && ['line', 'title', 'mp', 'p'].includes(node.tag || '')) {
        sequence.push(node.id);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  };

  traverse(blocks);
  return { nodeMap, sequence };
};

const CopyableText: React.FC<{ 
  block: ContentBlock; 
  status: BlockStatus; 
  onInteract: (id: string) => void;
}> = ({ block, status, onInteract }) => {
  const [copied, setCopied] = useState(false);
  const isTitle = block.tag === 'title';
  const isQuestion = block.tag === 'p';

  const handleInteraction = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(block.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onInteract(block.id);
  };

  // Renderização específica para Títulos
  if (isTitle) {
    return (
      <div className={`flex items-start justify-between py-4 mb-2 gap-4 rounded-lg -mx-3 px-3 transition-colors ${status.isSkipped ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400' : 'hover:bg-slate-50 dark:hover:bg-dark-hover text-slate-700 dark:text-slate-200'}`}>
        <div className="flex flex-col gap-1 w-full">
          {status.isSkipped && (
            <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
              <AlertTriangle size={10} /> Não copiado
            </span>
          )}
          <h3 className={`font-bold text-xl leading-tight ${status.isSkipped ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
            {block.content}
          </h3>
        </div>
        <button 
          onClick={handleInteraction}
          className="flex-shrink-0 text-slate-400 hover:text-brand transition-colors p-2 rounded-lg"
          title="Copiar Título"
        >
          {copied ? <Check size={20} className="text-brand" /> : <Copy size={20} />}
        </button>
      </div>
    );
  }

  // Renderização específica para Questões (Card Flat sem efeitos)
  if (isQuestion) {
    return (
      <div 
        onClick={handleInteraction}
        className={`relative rounded-xl mb-4 border transition-colors cursor-pointer group select-none
          ${status.isSkipped
            ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
            : 'bg-indigo-50/30 border-indigo-100 hover:bg-indigo-50/50 dark:bg-indigo-500/5 dark:border-indigo-500/20 dark:hover:bg-indigo-500/10'
          }
        `}
      >
         <div className="p-4 flex items-start gap-4">
              {/* Coluna do Ícone */}
              <div className="shrink-0">
                  <div className={`p-2 rounded-lg
                      ${status.isSkipped 
                          ? 'bg-red-100 text-red-500 dark:bg-red-900/30' 
                          : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'}
                  `}>
                      <HelpCircle size={18} strokeWidth={2.5} />
                  </div>
              </div>

              {/* Coluna do Conteúdo */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-0.5">
                  <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest 
                          ${status.isSkipped ? 'text-red-500' : 'text-indigo-500 dark:text-indigo-400'}
                      `}>
                          {status.isSkipped ? 'Pulo Detectado' : 'Questão'}
                      </span>
                  </div>
                  <p className={`text-[15px] font-medium leading-relaxed break-words
                      ${status.isSkipped ? 'text-red-700 dark:text-red-300' : 'text-slate-700 dark:text-slate-200'}
                  `}>
                      {block.content}
                  </p>
              </div>

              {/* Coluna da Ação */}
              <button
                  className={`shrink-0 p-2 rounded-lg transition-all self-start
                      ${copied
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'text-slate-300 group-hover:text-indigo-500 dark:text-slate-600 dark:group-hover:text-indigo-400'}
                  `}
              >
                  {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
              </button>
         </div>
      </div>
    );
  }

  // Renderização Padrão (Linhas Normais)
  return (
    <div 
      className={`flex items-start justify-between py-2 mb-1 gap-4 group rounded-lg -mx-2 px-2 transition-colors cursor-pointer ${getContainerClass(status)}`}
      onClick={handleInteraction}
    >
      <div className="w-full flex items-start gap-3">
        <div className="flex flex-col w-full">
            {status.isSkipped && (
            <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 mb-1">
                <AlertTriangle size={10} /> Pulo detectado
            </span>
            )}
            <div className="font-sans text-[15px] leading-relaxed whitespace-pre-wrap break-words font-medium">
            {block.content}
            </div>
        </div>
      </div>
      
      <button 
        className={`flex-shrink-0 transition-all p-1.5 rounded-lg ${
          copied 
            ? 'text-brand' 
            : status.isSkipped 
              ? 'text-red-400'
              : 'text-slate-300 dark:text-slate-600 group-hover:text-brand'
        }`}
        title="Copiar Linha"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
};

const getContainerClass = (status: BlockStatus) => {
    if (status.isSkipped) {
        return 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400';
    }
    return 'hover:bg-slate-50 dark:hover:bg-dark-hover text-slate-700 dark:text-slate-200';
};

const ResponseBlock: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex gap-4 py-4 my-3 px-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
    <MessageCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-600 dark:text-yellow-500" />
    <div className="flex flex-col">
        <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider mb-1">Resposta Sugerida</span>
        <span className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
        "{text}"
        </span>
    </div>
  </div>
);

const PrivateMessage: React.FC<{ block: ContentBlock; status: BlockStatus; onInteract: (id: string) => void }> = ({ block, status, onInteract }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSend = () => {
    if (!nickname.trim()) return;
    setSendState('sending');
    onInteract(block.id);
    setTimeout(() => {
      setSendState('sent');
      setTimeout(() => {
        setIsOpen(false);
        setSendState('idle');
        setNickname('');
      }, 1500);
    }, 800);
  };

  if (!isOpen) {
    return (
      <div className="py-2 mb-2">
        <button 
          onClick={() => setIsOpen(true)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-medium text-sm border
            ${status.isSkipped 
                ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100' 
                : 'bg-slate-50 border-slate-200 dark:bg-dark-element dark:border-dark-hover text-slate-600 hover:bg-slate-100 dark:hover:bg-dark-hover dark:text-slate-300'
            }`}
        >
          {status.isSkipped && <AlertTriangle size={16} />}
          <MessageSquare size={16} />
          {status.isSkipped ? 'Enviar MP (Anterior pulada)' : 'Enviar MP'}
        </button>
      </div>
    );
  }

  return (
    <div className="my-2 p-4 bg-brand/5 dark:bg-brand/10 rounded-xl animate-fade-in border border-brand/10">
      <div className="flex items-center gap-2 mb-2 text-xs font-bold text-brand uppercase tracking-wider">
        <MessageSquare size={14} />
        Destinatário
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nickname..."
          className="flex-grow px-4 py-2 text-sm bg-white dark:bg-dark-element rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700"
          autoFocus
        />
        <button
          onClick={handleSend}
          disabled={!nickname.trim() || sendState !== 'idle'}
          className="flex items-center justify-center w-10 h-10 bg-brand text-white rounded-lg hover:bg-brand-hover disabled:opacity-50"
        >
          {sendState === 'sent' ? <Check size={18} /> : <SendHorizontal size={18} />}
        </button>
      </div>
    </div>
  );
};

const Instruction: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex gap-2.5 py-2 my-1 px-1 opacity-80 hover:opacity-100 transition-opacity">
    <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
      {text}
    </span>
  </div>
);

const Spoiler: React.FC<{ block: ContentBlock; childrenNodes: React.ReactNode }> = ({ block, childrenNodes }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isOuter = block.level === 1;

  const title = block.content && block.content.trim() !== '' 
    ? block.content 
    : (isOuter ? 'Conteúdo Expandível' : 'Detalhes');

  return (
    <div className={`my-3 rounded-xl overflow-hidden transition-all duration-300 border
      ${isOuter 
        ? 'bg-slate-50 dark:bg-dark-element border-slate-200 dark:border-white/5' 
        : 'bg-white/50 dark:bg-dark-surface ml-4 border-slate-100 dark:border-white/5'}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors
          ${isOpen ? 'bg-slate-100 dark:bg-dark-hover' : 'hover:bg-slate-100 dark:hover:bg-dark-hover'}
        `}
      >
        <span className={`font-bold ${isOuter ? 'text-slate-800 dark:text-slate-200 text-base' : 'text-slate-700 dark:text-slate-300 text-sm'}`}>
          {title}
        </span>
        <span className={`transition-transform duration-300 text-slate-400 dark:text-slate-500 ${isOpen ? 'rotate-180 text-brand' : ''}`}>
          <ChevronDown size={20} />
        </span>
      </button>
      
      {isOpen && (
        <div className={`p-4 animate-fade-in`}>
          {childrenNodes}
        </div>
      )}
    </div>
  );
};

export const ContentRenderer: React.FC<ContentRendererProps> = ({ blocks }) => {
  const { nodeMap, sequence } = useMemo(() => processBlocks(blocks), [blocks]);
  
  const [clickedIds, setClickedIds] = useState<Set<string>>(new Set());
  
  const skippedIds = useMemo(() => {
    if (clickedIds.size === 0) return new Set<string>();
    const skipped = new Set<string>();
    let maxIndex = -1;
    sequence.forEach((id, idx) => {
      if (clickedIds.has(id)) maxIndex = idx;
    });

    if (maxIndex === -1) return skipped;

    for (let i = 0; i < maxIndex; i++) {
      const candidateId = sequence[i];
      if (clickedIds.has(candidateId)) continue;

      let nextClickedId: string | null = null;
      for (let j = i + 1; j <= maxIndex; j++) {
        if (clickedIds.has(sequence[j])) {
          nextClickedId = sequence[j];
          break;
        }
      }

      if (!nextClickedId) {
        skipped.add(candidateId); 
        continue;
      }

      const candidateNode = nodeMap.get(candidateId);
      const clickedNode = nodeMap.get(nextClickedId);

      if (!candidateNode || !clickedNode) continue;

      const getLineage = (node: ContentBlock): ContentBlock[] => {
        const chain = [node];
        let curr = node;
        while (curr.parentId) {
          const parent = nodeMap.get(curr.parentId);
          if (parent) {
            chain.unshift(parent);
            curr = parent;
          } else {
            break;
          }
        }
        return chain;
      };

      const lineageC = getLineage(candidateNode);
      const lineageN = getLineage(clickedNode);

      let lcaIndex = -1;
      const minLen = Math.min(lineageC.length, lineageN.length);
      for (let k = 0; k < minLen; k++) {
        if (lineageC[k].id === lineageN[k].id) {
          lcaIndex = k;
        } else {
          break;
        }
      }

      if (lcaIndex > -1 && lcaIndex < lineageC.length - 1 && lcaIndex < lineageN.length - 1) {
        const divergenceC = lineageC[lcaIndex + 1]; 
        const divergenceN = lineageN[lcaIndex + 1]; 
        if (divergenceC.type === 'group' && divergenceN.type === 'group') {
           continue; 
        }
      }
      skipped.add(candidateId);
    }

    return skipped;
  }, [clickedIds, sequence, nodeMap]);

  const handleInteract = useCallback((id: string) => {
    setClickedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const renderBlock = (block: ContentBlock) => {
    const status: BlockStatus = {
      isClicked: clickedIds.has(block.id),
      isSkipped: skippedIds.has(block.id)
    };

    switch (block.tag) {
      case 'title':
      case 'line':
      case 'p': 
        return <CopyableText key={block.id} block={block} status={status} onInteract={handleInteract} />;
      case 'mp':
        return <PrivateMessage key={block.id} block={block} status={status} onInteract={handleInteract} />;
      case 'att':
        return <Instruction key={block.id} text={block.content || ''} />;
      case 'rep':
        return <ResponseBlock key={block.id} text={block.content || ''} />;
      case 's1':
      case 's3':
        return (
          <Spoiler key={block.id} block={block} childrenNodes={
             block.children?.map(child => renderBlock(child))
          } />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {blocks.map(block => renderBlock(block))}
    </div>
  );
};

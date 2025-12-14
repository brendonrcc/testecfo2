import { RawRow, ContentBlock } from '../types.ts';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const parseRowsToBlocks = (rows: RawRow[]): ContentBlock[] => {
  let i = 0;

  const parseLevel = (untilTags: string[] = [], parentId?: string): ContentBlock[] => {
    const currentBlocks: ContentBlock[] = [];

    while (i < rows.length) {
      const row = rows[i];
      const tag = row.tag.toLowerCase();

      if (untilTags.includes(tag)) {
        return currentBlocks;
      }

      const currentId = generateId();

      if (tag === 's1') {
        i++; 
        const children = parseLevel(['s2'], currentId);
        currentBlocks.push({
          id: currentId,
          parentId: parentId,
          type: 'group',
          tag: 's1',
          content: row.content,
          children,
          level: 1
        });
        i++; 
      } else if (tag === 's3') {
        i++; 
        const children = parseLevel(['s4'], currentId);
        currentBlocks.push({
          id: currentId,
          parentId: parentId,
          type: 'group',
          tag: 's3',
          content: row.content,
          children,
          level: 2
        });
        i++; 
      } else if (tag === 's2' || tag === 's4') {
        return currentBlocks;
      } else {
        currentBlocks.push({
          id: currentId,
          parentId: parentId,
          type: 'leaf',
          tag: tag as any,
          content: row.content
        });
        i++;
      }
    }
    return currentBlocks;
  };

  return parseLevel();
};
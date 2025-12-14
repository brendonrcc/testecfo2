import { SHEET_ID, AUTH_GID, HISTORY_GID, RawRow, User, ClassHistoryEntry } from '../types.ts';

const parseCSVLine = (text: string): string[] => {
  const result: string[] = [];
  let start = 0;
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"') {
      inQuotes = !inQuotes;
    } else if (text[i] === ',' && !inQuotes) {
      let field = text.substring(start, i);
      if (field.startsWith('"') && field.endsWith('"')) {
        field = field.substring(1, field.length - 1).replace(/""/g, '"');
      }
      result.push(field.trim());
      start = i + 1;
    }
  }
  let lastField = text.substring(start);
  if (lastField.startsWith('"') && lastField.endsWith('"')) {
    lastField = lastField.substring(1, lastField.length - 1).replace(/""/g, '"');
  }
  result.push(lastField.trim());
  return result;
};

const fetchCSV = async (gid: string): Promise<string[][]> => {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data from Google Sheets');
  }
  const text = await response.text();
  const lines = text.split(/\r?\n/);
  return lines.map(parseCSVLine);
};

export const loginUser = async (nickname: string): Promise<User | null> => {
  try {
    const rows = await fetchCSV(AUTH_GID);
    const normalizedNick = nickname.toLowerCase().trim();
    
    for (const row of rows) {
      if (row.length < 2) continue;
      const role = row[0];
      const name = row[1];
      
      if (name.toLowerCase().trim() === normalizedNick) {
        return { nickname: name, role: role };
      }
    }
    return null;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const fetchClassContent = async (gid: string): Promise<RawRow[]> => {
  try {
    const rows = await fetchCSV(gid);
    return rows.map(row => ({
      tag: row[0]?.toLowerCase().trim() || '',
      content: row[1] || ''
    })).filter(r => r.tag !== '');
  } catch (error) {
    console.error("Content Fetch Error:", error);
    throw error;
  }
};

export const fetchClassHistory = async (): Promise<ClassHistoryEntry[]> => {
  try {
    const rows = await fetchCSV(HISTORY_GID);
    return rows.slice(1).map(row => ({
      endTime: row[0] || '',
      startTime: row[1] || '',
      className: row[2] || '',
      professor: row[3] || '',
      students: row[4] || '',
      verdict: row[5] || '',
      score: row[7] || '', 
      adminActivity: row[8] || '' 
    })).filter(entry => entry.className !== ''); 
  } catch (error) {
    console.error("History Fetch Error:", error);
    throw error;
  }
};


export enum AppState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  CLASS_VIEW = 'CLASS_VIEW',
}

export type ViewState = 
  // Common
  | 'home' 
  // Professores
  | 'classes' 
  | 'reports' 
  | 'history' 
  | 'correction' 
  | 'manual_prof'
  // Avaliadores
  | 'evaluations'
  | 'eval_reports'
  | 'eval_history'
  | 'manual_eval'
  // Fiscalizadores
  | 'eligibility'
  | 'audit_reports'
  | 'audit_history'
  | 'manual_audit';

export interface User {
  nickname: string;
  role: string;
}

export interface ClassCategory {
  id: string;
  name: string;
  gid: string;
  description?: string;
  icon?: string;
}

export type TagType = 'title' | 'line' | 'att' | 'mp' | 's1' | 's2' | 's3' | 's4' | 'rep' | 'p';

export interface RawRow {
  tag: string;
  content: string;
}

export interface ContentBlock {
  id: string;
  parentId?: string;
  type: 'leaf' | 'group';
  tag?: TagType;
  content?: string; // For leaf nodes
  children?: ContentBlock[]; // For groups (spoilers)
  level?: number; // 1 for outer spoiler, 2 for inner
}

export interface ClassHistoryEntry {
  endTime: string;      // A
  startTime: string;    // B
  className: string;    // C
  professor: string;    // D
  students: string;     // E
  verdict: string;      // F
  score: string;        // H
  adminActivity: string; // I
}

export const SHEET_ID = "11A7T6hsWiiGX0it2lrjPrp4r2j4I65wj-IOfLGi8tQg";
export const AUTH_GID = "1512246214";
export const HISTORY_GID = "552818815";

export const CLASSES: ClassCategory[] = [
  { id: 'admin', name: 'Administração e Tecnologia do Fórum', gid: '0', description: 'Gestão administrativa e protocolos.' },
  { id: 'mil_sci', name: 'Ciências Militares', gid: '971998757', description: 'Táticas, estratégias e estudos de campo.' },
  { id: 'mil_career', name: 'Carreira Militar', gid: '303472444', description: 'Guia de progressão e hierarquia.' },
  { id: 'practice', name: 'Práticas Militares e Legislação', gid: '1700831677', description: 'Treinamentos práticos e simulações.' },
];
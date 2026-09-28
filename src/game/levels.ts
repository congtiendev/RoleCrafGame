// Xu ly level DUNG CHUNG cho moi level. Noi dung level (src/content/levels.ts) chi la du lieu: them level = them phan tu
// vao mang do, khong viet code rieng. Dieu kien / mau cau dang du lieu: src/game/conditions.ts.
import DATA from '../content/levels.ts';
import { check, fill } from './conditions.ts';
import type { Line, Tier } from '../content/schema.ts';
import type { Run } from './types.ts';
import type { Report } from './campaign.ts';
import type { SummaryFacts } from './summary.ts';

// Thu tu choi = thu tu trong mang; level sau ke thua trang thai level truoc (rules.ts: beginLevel)
export const LEVELS = DATA;
export const levelById = (id: string | undefined) => LEVELS.find(l => l.id === id) || null;

// Dong thoai hien theo trang thai: ifFlag = chi khi co co, unlessFlag = an khi co co, when = dieu kien
export const visibleLines = (lines: Line[], run: Run) => lines.filter(l =>
  (!l.ifFlag || run.flags[l.ifFlag]) && !(l.unlessFlag && run.flags[l.unlessFlag]) && check(l.when, run));

// Cau thay cau mau theo hanh trinh that (phan bien S16). line.answer = { from?, unless?, text }:
// from = 'best' | 'worst' -> d = quyet dinh dau tien trong bao cao (khong co -> giu cau mau); unless dung -> giu cau mau;
// con lai -> text (mau cau, {d.label}...). null = giu cau mau.
export function answerText(line: Line, run: Run, rep: Partial<Pick<Report, 'best' | 'worst'>>): string | null {
  const a = line.answer;
  if (!a) return null;
  const d = a.from ? rep[a.from]?.[0] : undefined;
  if (a.from && !d) return null;
  const ctx = { ...run, d };
  return check(a.unless ?? false, ctx) ? null : fill(a.text, ctx);
}

// Xep loai tong ket: loai dau tien khop dieu kien (x = so lieu tong ket, summary.ts)
export const pickTier = (tiers: Tier[], x: Partial<SummaryFacts>) => tiers.find(t => check(t.when, x));

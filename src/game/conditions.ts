// Dieu kien va mau cau DANG DU LIEU (JSON thuan, khong co ham): noi dung game luu DB / tra qua API duoc,
// engine (frontend hoac backend) dien giai giong nhau. Dung cho level (src/game/levels.ts) va ket thuc campaign.
//
// Dieu kien (thieu = luon dung):
//   { all: [..] } | { any: [..] } | { not: dk } | { atLeast: n, of: [..] }   ghep dieu kien
//   { flag: 'ten_co' }                                                      co dang bat (ctx.flags)
//   { choice: 'P2_S08_CUSTOMER_COMPLAINT', is: 'A' }                         lua chon da chon (ctx.choices)
//   { var: 'metrics.team_morale', lt: 40 }                                  so sanh gia tri theo duong dan trong ctx:
//                                                                           lt lte gt gte eq ne in; chi co var = gia tri co / khac rong
// ctx: phien choi (metrics, flags, choices, resources), so lieu tong ket level (them risk, budget, dangers, zeroRating),
// hoac them `d` = mot quyet dinh trong bao cao (cau tra loi phan bien).

import type { Condition, Scalar } from '../content/schema.ts';

// ctx: doi tuong bat ky (phien choi, so lieu tong ket...); doc theo duong dan 'metrics.team_morale'
export type Ctx = object;
type Op = 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'ne' | 'in';

const get = (o: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((v, k) => (v == null ? undefined : (v as Record<string, unknown>)[k]), o);
// gia tri khong phai so (undefined...) -> so sanh sai, giong JS (undefined < 20 === false)
const OPS: Record<Op, (a: unknown, b: never) => boolean> = {
  lt: (a, b: number) => (a as number) < b, lte: (a, b: number) => (a as number) <= b,
  gt: (a, b: number) => (a as number) > b, gte: (a, b: number) => (a as number) >= b,
  eq: (a, b: Scalar) => a === b, ne: (a, b: Scalar) => a !== b, in: (a, b: Scalar[]) => b.includes(a as Scalar),
};

export function check(c: Condition | undefined, ctx: Ctx): boolean {
  if (c == null || c === true) return true;
  if (c === false) return false;
  if ('all' in c) return c.all.every(x => check(x, ctx));
  if ('any' in c) return c.any.some(x => check(x, ctx));
  if ('not' in c) return !check(c.not, ctx);
  if ('atLeast' in c) return c.of.filter(x => check(x, ctx)).length >= c.atLeast;
  if ('flag' in c) return !!get(ctx, `flags.${c.flag}`);
  if ('choice' in c) return get(ctx, `choices.${c.choice}`) === c.is;
  if ('var' in c) {
    const v = get(ctx, c.var), op = (Object.keys(OPS) as Op[]).find(k => k in c);
    return op ? OPS[op](v, c[op] as never) : !!v;
  }
  throw new Error(`Điều kiện không hợp lệ: ${JSON.stringify(c)}`);
}

// Mau cau: {duong.dan|loc|loc} lay gia tri trong ctx; loc: lower (chu dau viet thuong), firstSentence (cau dau tien)
const FILTERS: Record<string, (t: string) => string> = {
  lower: t => t.charAt(0).toLowerCase() + t.slice(1),
  firstSentence: t => t.split(/(?<=\.)\s/)[0],
};
export const fill = (tpl: string, ctx: Ctx): string => tpl.replace(/\{([\w.]+)((?:\|\w+)*)\}/g, (_m, path: string, fs: string) =>
  fs.split('|').filter(Boolean).reduce((v, f) => FILTERS[f](v), String(get(ctx, path) ?? '')));

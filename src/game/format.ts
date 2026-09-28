// Dinh dang so lieu chi so de hien thi (HUD, bang ket qua, bao cao).
import { METRIC } from '../content/metrics.ts';
import type { Metric, MetricKey } from '../content/schema.ts';
import type { Change } from './types.ts';

// Hien thi so lieu thuc te: fmt('budget', 85) = '85.000.000 VND', fmt('project_progress', 40) = '24/60 ngày',
// fmt('team_morale', 70) = '70%'. fmtNum = phan so (ti le van kem %; don vi chu – VND, ngày – HUD hien o dong rieng);
// fmtDelta = muc tang/giam co dau, khong kem tong (+3 ngày / −15.000.000 VND), sign = false thi bo dau
const NUM = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });   // 0,6 ngay x 3 = 1,8 ngay
const scaled = (m: Metric, v: number) => NUM.format(Math.round(v) * (m.scale || 1));
export const fmtNum = (key: MetricKey, v: number) => {
  const m = METRIC[key];
  return m.unit === '%' ? `${Math.round(v)}%` : m.of ? `${scaled(m, v)}/${scaled(m, m.max)}` : scaled(m, v);
};
export const fmt = (key: MetricKey, v: number) => METRIC[key].unit === '%' ? fmtNum(key, v) : `${fmtNum(key, v)} ${METRIC[key].unit}`;
export const fmtDelta = (key: MetricKey, d: number, sign = true) => {
  const m = METRIC[key], s = sign ? (d > 0 ? '+' : d < 0 ? '−' : '') : '';
  return m.unit === '%' ? `${s}${Math.abs(d)}%` : `${s}${scaled(m, Math.abs(d))} ${m.unit}`;
};

// Mau cua mot thay doi: tot (xanh) / xau (do), rui ro thi nguoc lai
export const isGood = (c: Change) => (c.to > c.from) !== !!METRIC[c.key].bad;

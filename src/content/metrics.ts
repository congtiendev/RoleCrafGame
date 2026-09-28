// Chi so cua phien choi (docs/KICH_BAN_ROLECRAFT_PM60.md muc 3). Them / doi chi so o day; luat cong/tru: src/game/rules.ts,
// hien thi so lieu: src/game/format.ts.
// icon = o chi so trong sheet F; bad = diem cao la bat loi (rui ro); group = nhom tren HUD (du an / con nguoi);
// hint = loi giai thich trong tour huong dan lan dau (play/HudTour.tsx)
// unit / scale = so lieu thuc te (xem fmt): quy luu theo trieu dong (scale 1e6 -> hien 100.000.000 VND); tien do quy ra
// so ngay tren ke hoach 60 ngay (1 diem = 0,6 ngay), of = hien kem tong (24/60); cac chi so con lai la %
import type { Metric, MetricGroup, MetricKey, ResourceKey } from './schema.ts';

export const METRICS: Metric[] = [
  { key: 'budget', label: 'Quỹ dự án', short: 'Quỹ', icon: 'stat_budget', init: 100, min: -100, max: 200, group: 'project', unit: 'VND', scale: 1e6,
    hint: 'Ngân sách của dự án: 100.000.000 VND cho cả 60 ngày. Thuê người, mua công cụ, xử lý sự cố đều tốn quỹ; xuống dưới 0 là vượt ngân sách.' },
  { key: 'project_progress', label: 'Tiến độ', short: 'Tiến độ', icon: 'stat_progress', init: 40, min: 0, max: 100, group: 'project', unit: 'ngày', scale: 0.6, of: true,
    hint: 'Khối lượng đã hoàn thành, quy ra số ngày trên kế hoạch 60 ngày. Nhận bàn giao đã xong 24/60 ngày; khách đang chờ demo.' },
  { key: 'product_quality', label: 'Chất lượng', short: 'Chất lượng', icon: 'stat_quality', init: 60, min: 0, max: 100, group: 'project', unit: '%',
    hint: 'Tỉ lệ test case đạt, hiện là 60%. Chất lượng thấp dễ sinh lỗi, sự cố và khiếu nại về sau.' },
  { key: 'project_risk', label: 'Rủi ro dự án', short: 'Rủi ro', icon: 'stat_risk', init: 10, min: 0, max: 100, bad: true, group: 'project', unit: '%',
    hint: 'Khả năng dự án gặp sự cố hoặc trễ hạn, hiện là 10%. Chỉ số duy nhất càng cao càng bất lợi; rủi ro tích lại sẽ bùng ra ở giai đoạn sau.' },
  { key: 'team_morale', label: 'Tinh thần đội ngũ', short: 'Tinh thần', icon: 'stat_morale', init: 70, min: 0, max: 100, group: 'people', unit: '%',
    hint: 'Mức hài lòng của team qua khảo sát nội bộ, hiện là 70%. Tinh thần xuống thấp thì dễ sai sót, thậm chí có người nghỉ việc.' },
  { key: 'client_trust', label: 'Niềm tin khách hàng', short: 'Khách hàng', icon: 'stat_client', init: 60, min: 0, max: 100, group: 'people', unit: '%',
    hint: 'Mức hài lòng của khách hàng (CSAT), hiện là 60%. Mất niềm tin thì mọi thay đổi đều khó đàm phán.' },
  { key: 'management_trust', label: 'Niềm tin quản lý', short: 'Quản lý', icon: 'stat_management', init: 50, min: 0, max: 100, group: 'people', unit: '%',
    hint: 'Mức tín nhiệm của Anh Minh dành cho bạn, hiện là 50%. Chỉ số này ảnh hưởng trực tiếp đến kết quả thử việc ngày 60.' },
];
export const METRIC_GROUPS: MetricGroup[] = [{ id: 'project', label: 'Dự án' }, { id: 'people', label: 'Con người' }];
export const METRIC = Object.fromEntries(METRICS.map(m => [m.key, m])) as Record<MetricKey, Metric>;

// Tai nguyen dau game (khong hien tren HUD): so nguoi trong team, muc cong cu (lua chon `add` / `set` thay doi)
export const START_RESOURCES: Record<ResourceKey, number> = { team_size: 3, tooling_level: 0 };

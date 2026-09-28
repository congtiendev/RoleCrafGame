// Dan nhan vat dung chung cho moi level (dong thoai `who`, `cast` cua tinh huong tro toi id o day).
// NPC co sprite (npcAtlas.ts: Huy, Minh, Lan, Hiep, Linh, Ha) dung trong canh + chan dung that; con lai hien bang the UI tam (the + huy hieu chu cai)
// desc = vai tro trong du an (docs/KICH_BAN_ROLECRAFT_PM60.md muc 2), hien tren the nhan vien (screens/play/StaffCard.tsx); client = nguoi ben khach hang
import type { CastMember } from './schema.ts';

export const CAST: Record<string, CastMember> = {
  MINH: { name: 'Anh Minh', role: 'Trưởng phòng / PM Lead', tint: '#5b8def', desc: 'Bàn giao dự án, giao việc và chủ trì đánh giá thử việc 60 ngày.' },
  HUY: { name: 'Huy', role: 'Backend Developer', tint: '#f2a03d', desc: 'Developer chủ chốt, giỏi nhưng thích tự quyết; ứng viên Technical Lead.' },
  LAN: { name: 'Lan', role: 'BA / QA', tint: '#e46fa1', desc: 'Phụ trách requirement, tài liệu, chất lượng và quy trình.' },
  NAM: { name: 'Nam', role: 'Frontend Developer', tint: '#57c08a', desc: 'Nhiệt tình nhưng còn thiếu kinh nghiệm.' },
  HIEP: { name: 'Anh Hiệp', role: 'Khách hàng / Product Owner', tint: '#9b7bea', desc: 'Đại diện khách hàng, quan tâm deadline và giá trị kinh doanh.', client: true },
  HA: { name: 'Chị Hà', role: 'HR', tint: '#e0a458', desc: 'Bên nhân sự, cùng Anh Minh đánh giá kết quả thử việc 60 ngày.' },
  LINH: { name: 'Chị Linh', role: 'Sales Executive', tint: '#3a9bd9', desc: 'Phụ trách kinh doanh, thúc đẩy cơ hội hợp đồng với khách hàng.' },
};

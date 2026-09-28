// 6 nang luc quan ly (docs/KICH_BAN_ROLECRAFT_PM60.md muc 3 – Nang luc): ma dung trong `competency` cua lua chon.
import type { CompetencyCode } from './schema.ts';

export const COMPETENCY: Record<CompetencyCode, string> = {
  SCOPE: 'Quản trị phạm vi và thay đổi',
  RESOURCE: 'Quản trị nguồn lực và ngân sách',
  RISK: 'Quản trị rủi ro và chất lượng',
  PEOPLE: 'Lãnh đạo và phát triển đội ngũ',
  STAKEHOLDER: 'Giao tiếp với khách hàng và quản lý',
  DECISION: 'Ra quyết định và chịu trách nhiệm',
};

// Khuyen nghi hoc tap tiep theo theo nang luc yeu nhat
export const LEARNING: Record<CompetencyCode, string> = {
  SCOPE: 'Quản lý phạm vi: change request, tiêu chí nghiệm thu, chia phase / MVP.',
  RESOURCE: 'Lập kế hoạch nguồn lực: capacity planning, ước lượng effort, cân đối ngân sách.',
  RISK: 'Quản trị rủi ro: risk register, regression / release checklist, xử lý incident.',
  PEOPLE: 'Lãnh đạo đội ngũ: 1-1, feedback, kế hoạch phát triển cá nhân, trao quyền có kiểm soát.',
  STAKEHOLDER: 'Giao tiếp stakeholder: trình bày đánh đổi, quản lý kỳ vọng, báo cáo bằng dữ liệu.',
  DECISION: 'Ra quyết định: phân tích phương án, đánh đổi ngắn hạn – dài hạn, chịu trách nhiệm.',
};

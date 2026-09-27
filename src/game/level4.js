// Noi dung Level 4 – Thu hoach (docs/KICH_BAN_ROLECRAFT_PM60.md muc 7; thoai rut gon = THOAI_MAU.json) + ket thuc campaign (muc 9).
// Cung dinh dang voi level1–3; them rieng cho Level 4:
// - `final`: level cuoi – khong co tong ket level, thay bang ket qua campaign (campaign.js) + man bao cao cuoi.
// - Dong thoai `unlessFlag`: an khi co co (vd S13 C: Nam bi phe binh truoc team -> thay cau hang hai bang cau e de).
// - Dong thoai `when(run)`: dieu kien theo chi so / nhieu co (S16: bang chung va canh bao truoc buoi review).
// - Dong thoai `alt`: { HUY: '...' } – Huy da nghi (absent): cau cua Huy thanh thong bao thieu nhan su chu chot, cau nhac
//   ten Huy doi noi dung (tai lieu muc 2: thoai cua Huy o L3–L4 thay bang thong bao thieu nhan su chu chot).
// - Dong thoai `textFor(run, rep)`: phan bien S16 tra loi theo hanh trinh that (rep = campaignReport); null -> cau mau.
// - Tinh huong `alias`: bo dong tac PM rieng cho canh (S16 mac vest: di, dung, noi).
// Nang luc cua moi lua chon Level 4 la DE XUAT trong tai lieu (V2 chua gan).

const SCOPE_REGRETS = ['P1_S03_SCOPE_CHANGE', 'P3_S10_SALES_OVERCOMMIT', 'P4_S15_CLIENT_EXPANSION'];
const firstSentence = t => (t || '').split(/(?<=\.)\s/)[0];
const lower = t => t.charAt(0).toLowerCase() + t.slice(1);

export const LEVEL4 = {
  id: 'P4_HARVEST', no: 4, phase: 'P4', title: 'THU HOẠCH', days: 'Ngày 46 – 60', day: 46, final: true,
  lead: 'Mười lăm ngày cuối.',
  goal: 'Chuyển kết quả ngắn hạn thành năng lực vận hành bền vững, phát triển đội ngũ, mở rộng hợp tác và bảo vệ kết quả thử việc trước hội đồng đánh giá.',
  absent: { HUY: 'key_developer_left' },

  intro: {
    bg: 'lobby', cast: ['MINH'],
    lines: [
      { who: 'MINH', text: 'Em còn 15 ngày trước buổi đánh giá cuối kỳ.', pm: 'nod', face: 'face_serious', npc: 'serious', npcFace: 'face_serious' },
      { who: 'MINH', text: 'Hãy để các quyết định 15 ngày cuối thành bằng chứng cho năng lực của em.', pm: 'nod', face: 'face_determined', npc: 'encourage', npcFace: 'face_encouraging' },
      { who: 'PM', text: 'Em sẽ chuẩn bị báo cáo bằng dữ liệu thực tế ạ.', pm: 'talk', face: 'face_confident' },
    ],
  },

  scenarios: [
    {
      id: 'P4_S13_OPERATING_SYSTEM', no: 'S13', day: 48, title: 'Xây dựng hệ thống vận hành mới',
      place: 'Phòng họp nội bộ của team', bg: 'internal_meeting', cast: ['MINH', 'LAN', 'HUY', 'NAM'],
      open: [
        { who: 'MINH', text: 'Nếu Huy nghỉ hoặc Lan chuyển dự án, team có tự vận hành được không?', pm: 'nod', npc: 'think', npcFace: 'face_challenge',
          alt: { HUY: 'Huy đã nghỉ. Nếu Lan cũng chuyển dự án, team có tự vận hành được không?' } },
        { who: 'LAN', text: 'Checklist và quy trình deploy vẫn nằm rải rác, có bước chỉ nhắc trong nhóm chat.', pm: 'idle', npc: 'caution', npcFace: 'face_cautious' },
        // dieu kien mo man (tai lieu muc 7 – S13)
        { who: 'LAN', ifFlag: 'deployment_checklist_added', text: 'Sau sự cố mất dữ liệu test, team đã có checklist deploy mới. Tuy nhiên chúng ta chưa thống nhất người chịu trách nhiệm và tiêu chí bắt buộc cho mọi release.', pm: 'nod', npc: 'propose', npcFace: 'face_thinking' },
        { who: 'LAN', ifFlag: 'process_gap_unresolved', text: 'Lỗ hổng lần trước chưa được xử lý. Hôm qua một thành viên lại thao tác nhầm môi trường, may là chưa ảnh hưởng dữ liệu chung.', pm: 'idle', npc: 'worry', npcFace: 'face_anxious', react: { NAM: 'uneasy' } },
        { who: 'SYS', ifFlag: 'key_developer_left', text: 'Không có Senior Developer trong cuộc họp. Một số quyết định kỹ thuật chưa có người đủ thông tin để xác nhận.', pm: 'idle' },
        { who: 'PM', text: 'Làm thêm việc, hay xây lại cách team vận hành?', pm: 'tab_read', face: 'face_thinking' },
      ],
      question: 'Bạn sẽ sử dụng thời gian còn lại như thế nào?',
      choices: [
        {
          id: 'A', label: 'Tập trung chạy deadline, chưa cải tiến quy trình', hint: 'Dồn sức cho output 15 ngày cuối, quy trình để sau.',
          lines: [
            { who: 'PM', text: 'Chỉ còn 15 ngày. Tập trung chạy deadline, quy trình để sau.', pm: 'goahead', face: 'face_determined' },
            { who: 'HUY', text: 'Output tăng trước mắt, nhưng điểm nghẽn cũ sẽ quay lại.', pm: 'idle', npc: 'warn', npcFace: 'face_worried',
              alt: { HUY: 'Thiếu người nắm kiến trúc: không ai đủ thông tin để cảnh báo điểm nghẽn kỹ thuật.' } },
            { who: 'NAM', ifFlag: 'team_ot_14_days', text: 'Team vừa trải qua một giai đoạn làm việc kéo dài. Nếu tiếp tục tăng tốc, em lo mọi người sẽ không giữ được chất lượng.', pm: 'idle', npc: 'worry', npcFace: 'face_worried' },
          ],
          effects: { project_progress: 10, product_quality: -5, project_risk: 15 },
          flags: ['process_not_improved'], competency: { RISK: 0, DECISION: 1 },
          delayed: [{ at: 'P4_S16_FINAL_REVIEW', effects: { management_trust: -10 },
            note: 'Chạy deadline mà chưa cải tiến quy trình: kết quả chưa có nền tảng vận hành bền vững.' }],
          result: 'Số lượng công việc hoàn thành tăng nhanh. Team chưa phải dành thời gian cho tài liệu và quy trình. Chất lượng và khả năng bàn giao tiếp tục phụ thuộc vào cá nhân. Hội đồng đánh giá có thể xem đây là kết quả thiếu bền vững.',
          after: { pm: 'sigh' },
        },
        {
          id: 'B', label: 'Chuẩn hóa quy trình và checklist vận hành', hint: 'Dành hai ngày chuẩn hóa: mỗi bước có người chịu trách nhiệm.',
          lines: [
            { who: 'PM', text: 'Dành hai ngày chuẩn hóa quy trình: mỗi bước có người chịu trách nhiệm.', pm: 'checklist', face: 'face_confident', react: { NAM: 'nod' } },
            { who: 'LAN', text: 'Em sẽ gộp test checklist và tiêu chí nghiệm thu về một chỗ.', pm: 'nod', npc: 'good', npcFace: 'face_bright' },
            { who: 'LAN', ifFlag: 'deployment_checklist_added', text: 'Checklist từ sự cố trước có thể dùng làm nền. Chúng ta không phải bắt đầu lại từ đầu.', pm: 'nod', npc: 'relieved', npcFace: 'face_hopeful' },
          ],
          effects: { project_progress: -5, product_quality: 15, management_trust: 5, project_risk: -10 },
          flags: ['process_standardized'], competency: { RISK: 3, RESOURCE: 2 },
          result: 'Team chậm lại trong ngắn hạn để chuẩn hóa cách làm. Quy trình không còn nằm trong trí nhớ của một cá nhân. Rủi ro deploy và bàn giao giảm. Quản lý có bằng chứng về khả năng xây dựng hệ thống vận hành.',
          after: { pm: 'tab_present' },
        },
        {
          id: 'C', label: 'Trao quyền để team cùng xây dựng cách vận hành', hint: 'Mỗi người sở hữu một phần của cách vận hành.',
          lines: [
            { who: 'PM', text: 'Mỗi người sở hữu một phần: Huy kỹ thuật, Lan chất lượng, Nam onboarding.', pm: 'delegate', face: 'face_confident',
              alt: { HUY: 'Mỗi người sở hữu một phần: Lan chất lượng, Nam onboarding, phần kỹ thuật mình tạm giữ.' }, react: { LAN: 'nod' } },
            { who: 'NAM', unlessFlag: 'junior_publicly_blamed', text: 'Em muốn phụ trách checklist cho thành viên mới.', pm: 'nod', npc: 'eager', npcFace: 'face_eager' },
            { who: 'NAM', ifFlag: 'junior_publicly_blamed', text: 'Em hơi lo mình chưa đủ kinh nghiệm để nhận phần này. Nếu có người review cùng, em sẽ thử.', pm: 'nod', npc: 'hesitant', npcFace: 'face_hesitant' },
          ],
          effects: { team_morale: 15, management_trust: 10, product_quality: 5, project_risk: -5 },
          flags: ['team_ownership'], competency: { PEOPLE: 3, RISK: 2 },
          result: 'Team tham gia trực tiếp vào việc xây dựng cách vận hành. Mức độ chủ động và tinh thần sở hữu tăng. PM giảm phụ thuộc vào việc tự kiểm soát mọi chi tiết. Quy trình được xây dựng chậm hơn nhưng có khả năng được thực hiện thực tế cao hơn.',
          after: { pm: 'clap' },
        },
      ],
      next: 'P4_S14_TEAM_DEVELOPMENT',
    },

    {
      id: 'P4_S14_TEAM_DEVELOPMENT', no: 'S14', day: 52, title: 'Đánh giá và phát triển thành viên',
      place: 'Phòng họp 1-1 và khu vực làm việc của team', bg: 'team_floor', cast: ['MINH', 'HUY', 'NAM', 'LAN'],
      open: [
        { who: 'MINH', text: 'Đánh giá từng người theo kết quả, năng lực và tiềm năng phát triển.', pm: 'nod', npc: 'emph', npcFace: 'face_explain' },
        { who: 'HUY', text: 'Anh muốn lên Technical Lead, không muốn ôm mọi vấn đề khó nữa.', pm: 'idle', npc: 'explain', npcFace: 'face_determined',
          alt: { HUY: 'Huy đã nghỉ: team cần kế hoạch bù khoảng trống năng lực kỹ thuật.' } },
        { who: 'NAM', ifFlag: 'junior_publicly_blamed', text: 'Sau lỗi lần trước, em không chắc team còn tin tưởng giao việc quan trọng cho em không.', pm: 'idle', npc: 'hesitant', npcFace: 'face_unsure' },
        { who: 'NAM', ifFlag: 'deployment_checklist_added', text: 'Em đã hoàn thiện checklist deploy và hỗ trợ team dùng trong các lần release gần đây. Em muốn tiếp tục chịu trách nhiệm phần này.', pm: 'nod', npc: 'proud', npcFace: 'face_proud' },
        { who: 'PM', text: 'Mỗi người một mong muốn... đánh giá sao cho công bằng?', pm: 'tab_read', face: 'face_thinking' },
      ],
      question: 'Bạn sẽ đánh giá và phát triển đội ngũ theo cách nào?',
      choices: [
        {
          id: 'A', label: 'Chỉ đánh giá theo output hiện tại', hint: 'Đo bằng số task, tỷ lệ đúng hạn và số lỗi.',
          lines: [
            { who: 'PM', text: 'Đánh giá theo số task, tỷ lệ đúng hạn và số lỗi.', pm: 'tab_read', face: 'face_serious' },
            { who: 'LAN', text: 'Việc QA ngăn được lỗi sẽ không có ticket nào ghi nhận.', pm: 'idle', npc: 'object', npcFace: 'face_frown', react: { NAM: 'uneasy' } },
          ],
          effects: { project_progress: 5, management_trust: 5, team_morale: -10 },
          flags: ['performance_only_review'], competency: { PEOPLE: 0, DECISION: 1 },
          result: 'Báo cáo đánh giá được hoàn thành nhanh. Tiêu chí dễ đo nhưng thiên về sản lượng. Thành viên không có lộ trình phát triển rõ ràng. Các đóng góp về mentoring, chất lượng và cải tiến bị đánh giá thấp.',
          after: { pm: 'talk' },
        },
        {
          id: 'B', label: 'Xây dựng Individual Development Plan cho từng người', hint: 'Mỗi người một kế hoạch phát triển 90 ngày có tiêu chí đo.',
          lines: [
            { who: 'PM', text: 'Mỗi người có một kế hoạch phát triển 90 ngày với tiêu chí đo rõ ràng.', pm: 'tab_present', face: 'face_confident' },
            { who: 'NAM', text: 'Em đồng ý. Có tiêu chí em sẽ tự theo dõi được tiến bộ.', pm: 'nod', npc: 'happy', npcFace: 'face_happy', react: { LAN: 'good' } },
          ],
          effects: { project_progress: -5, team_morale: 15, product_quality: 5, management_trust: 5 },
          flags: ['development_plan_created'], competency: { PEOPLE: 3, RESOURCE: 2 },
          result: 'Mỗi thành viên có mục tiêu phát triển cụ thể. Việc đánh giá cân bằng giữa kết quả và năng lực. PM cần dành thêm thời gian coaching và theo dõi. Team nhìn thấy cơ hội phát triển trong dự án.',
          after: { pm: 'good' },
        },
        {
          id: 'C', label: 'Giao ownership và quyền quyết định theo vai trò', hint: 'Mỗi vai trò có phạm vi quyết định được ghi rõ.',
          lines: [
            { who: 'PM', text: 'Huy quyết kiến trúc, Lan được chặn release, Nam sở hữu một module.', pm: 'delegate', face: 'face_confident',
              alt: { HUY: 'Lan được chặn release, Nam sở hữu một module, kiến trúc có người mới cùng review.' } },
            { who: 'HUY', text: 'Anh đồng ý nếu phạm vi quyết định được ghi rõ.', pm: 'nod', npc: 'agree', npcFace: 'face_focused',
              alt: { HUY: 'Thiếu người nắm kiến trúc: quyền quyết định kỹ thuật tạm do PM giữ.' } },
            { who: 'NAM', ifFlag: 'junior_publicly_blamed', text: 'Em vẫn hơi lo mắc lỗi. Nếu có checklist và người hỗ trợ ở các mốc quan trọng, em sẽ nhận.', pm: 'nod', npc: 'hesitant', npcFace: 'face_hesitant' },
          ],
          effects: { project_progress: 5, team_morale: 10, management_trust: 10, project_risk: -5 },
          flags: ['ownership_delegated'], competency: { PEOPLE: 3, DECISION: 2 },
          result: 'Team có phạm vi ownership rõ ràng. Quyền quyết định không còn tập trung hoàn toàn ở PM. Tinh thần và khả năng scale team tăng. Cần cơ chế kiểm soát để quyền tự quyết không biến thành làm việc rời rạc.',
          after: { pm: 'clap' },
        },
      ],
      next: 'P4_S15_CLIENT_EXPANSION',
    },

    {
      id: 'P4_S15_CLIENT_EXPANSION', no: 'S15', day: 56, title: 'Khách hàng đề nghị mở rộng hợp tác',
      place: 'Phòng họp với khách hàng', bg: 'client_meeting', cast: ['HIEP', 'LINH', 'LAN', 'HUY'], enter: 'meet_table_listen',
      open: [
        { who: 'HIEP', text: 'Bên anh muốn mở rộng thêm module báo cáo và luồng phê duyệt.', pm: 'meet_table_listen', npc: 'talk', npcFace: 'face_eager' },
        { who: 'LINH', text: 'Cơ hội tốt! Team xác nhận để chị làm báo giá nhé.', pm: 'meet_table_listen', npc: 'cheer', npcFace: 'face_excited' },
        { who: 'LAN', text: 'Phạm vi mới chỉ là mong muốn, chưa có tiêu chí nghiệm thu.', pm: 'meet_table_listen', npc: 'caution', npcFace: 'face_cautious' },
        { who: 'HUY', ifFlag: 'large_project_without_resources', text: 'Team đang chia nguồn lực cho dự án lớn vừa nhận. Nếu thêm module này mà không điều chỉnh ưu tiên, cả ba kế hoạch sẽ cùng bị ảnh hưởng.', pm: 'meet_table_worry', npc: 'warn', npcFace: 'face_worried',
          alt: { HUY: 'Không còn Huy để cân đối phần kỹ thuật: team đang chia người cho dự án lớn vừa nhận, thêm module sẽ ảnh hưởng cả ba kế hoạch.' } },
        { who: 'LAN', ifFlag: 'key_developer_left', text: 'Hiện tại team chưa có người thay thế hoàn toàn phần kỹ thuật chủ chốt. Việc mở rộng cần thêm thời gian đánh giá năng lực thực thi.', pm: 'meet_table_worry', npc: 'worry', npcFace: 'face_worried' },
        { who: 'PM', text: 'Cơ hội lớn, nhưng nhận thế nào cho an toàn?', pm: 'meet_table_worry', face: 'face_thinking' },
      ],
      question: 'Bạn sẽ phản hồi đề nghị mở rộng như thế nào?',
      choices: [
        {
          id: 'A', label: 'Nhận toàn bộ phạm vi để giữ cơ hội', hint: 'Nhận hết ngay, chi tiết làm rõ dần trong lúc triển khai.',
          lines: [
            { who: 'PM', text: 'Bên em nhận toàn bộ, chi tiết làm rõ dần trong lúc triển khai.', pm: 'meet_table_agree', face: 'face_happy', react: { HIEP: 'pleased', LINH: 'cheer' } },
            { who: 'HUY', text: 'Mình đang cam kết khi chưa biết hết phạm vi tích hợp.', pm: 'meet_table_worry', npc: 'warn', npcFace: 'face_worried',
              alt: { HUY: 'Thiếu người nắm kiến trúc: chưa ai đánh giá được phạm vi tích hợp.' } },
          ],
          effects: { budget: 25, client_trust: 10, team_morale: -15, project_risk: 20 },
          flags: ['expansion_unscoped'], competency: { SCOPE: 0, STAKEHOLDER: 1 },
          delayed: [{ at: 'P4_S16_FINAL_REVIEW', effects: { project_risk: 10 },
            note: 'Đã cam kết thêm phạm vi chưa được đánh giá: rủi ro tăng ngay trước buổi review.' }],
          result: 'Cơ hội kinh doanh được giữ ngay lập tức. Khách hàng hài lòng vì nhận được cam kết nhanh. Phạm vi, effort và phụ thuộc chưa được xác minh. Team tiếp tục gánh rủi ro từ cam kết kinh doanh.',
          after: { pm: 'meet_table_worry' },
        },
        {
          id: 'B', label: 'Khảo sát lại và gửi roadmap sau', hint: 'Khảo sát ba ngày rồi gửi roadmap và estimate.',
          lines: [
            { who: 'PM', text: 'Bên em đề xuất khảo sát ba ngày, sau đó gửi roadmap và estimate.', pm: 'meet_table_talk', face: 'face_serious' },
            { who: 'HIEP', text: 'Được, nhưng anh cần mốc cụ thể để trình ngân sách.', pm: 'meet_table_listen', npc: 'talk', npcFace: 'face_conditional' },
          ],
          effects: { project_progress: -5, client_trust: 5, management_trust: 5, project_risk: -10 },
          flags: ['expansion_roadmap_created'], competency: { SCOPE: 2, STAKEHOLDER: 2 },
          result: 'Phạm vi được khảo sát trước khi ký cam kết. Team có thời gian đánh giá kỹ thuật và nguồn lực. Khách hàng phải chờ thêm trước khi có kế hoạch triển khai chính thức. Rủi ro giảm nhưng tốc độ chốt cơ hội chậm hơn.',
          after: { pm: 'meet_table_agree' },
        },
        {
          id: 'C', label: 'Chia phase và chốt phạm vi ưu tiên', hint: 'Phase 1 làm luồng ưu tiên, Phase 2 mở rộng sau nghiệm thu.',
          lines: [
            { who: 'PM', text: 'Chia hai phase: Phase 1 làm luồng báo cáo ưu tiên, Phase 2 mở rộng sau nghiệm thu.', pm: 'meet_table_present', face: 'face_confident' },
            { who: 'LINH', text: 'Chị tách báo giá theo từng phase cho khách dễ duyệt.', pm: 'meet_table_listen', npc: 'agree', npcFace: 'face_charming' },
            { who: 'HIEP', ifFlag: 'mvp_plan_agreed', text: 'Cách chia phase này giống phương án MVP trước và bên anh thấy hiệu quả. Anh đồng ý nếu tiêu chí nghiệm thu của từng phase được ghi rõ.', pm: 'meet_table_listen', npc: 'pleased', npcFace: 'face_satisfied' },
          ],
          effects: { budget: 10, project_progress: 5, client_trust: 15, management_trust: 5, project_risk: -5 },
          flags: ['expansion_phased'], competency: { SCOPE: 3, STAKEHOLDER: 3 },
          result: 'Khách hàng nhận được giá trị sớm với phạm vi rõ ràng. Sales có cơ sở chốt hợp đồng theo giai đoạn. Team kiểm soát được capacity và chất lượng. Roadmap mở rộng vẫn được duy trì.',
          after: { pm: 'meet_table_agree' },
        },
      ],
      next: 'P4_S16_FINAL_REVIEW',
    },

    {
      id: 'P4_S16_FINAL_REVIEW', no: 'S16', day: 60, title: 'Final Review 60 ngày',
      place: 'Phòng họp đánh giá', bg: 'final_review', cast: ['MINH', 'HA'], laterAt: 1,
      alias: { walk: 'formal_walk', idle: 'reflect', talk: 'answer' },      // bo vest (sheet E)
      open: [
        { who: 'NARR', text: 'Anh Minh và Chị Hà bên nhân sự ngồi ở bàn đánh giá.', pm: 'adjust' },
        // Dieu kien mo man S16 khong cong/tru chi so (hau qua cong/tru nam o delayed cua S13 A, S15 A, L3 S12 A)
        { who: 'SYS', title: 'Cảnh báo burnout', when: r => r.flags.team_ot_14_days && r.metrics.team_morale < 40,
          text: 'Team từng OT kéo dài và tinh thần hiện dưới 40%: báo cáo gắn cảnh báo nguy cơ burnout.', pm: 'reflect' },
        { who: 'SYS', title: 'Hội đồng yêu cầu giải trình', ifFlag: 'process_gap_unresolved',
          text: 'Lỗi quy trình sau sự cố push nhầm code (ngày 41) vẫn chưa được xử lý.', pm: 'reflect' },
        { who: 'SYS', title: 'Bằng chứng tích cực', when: r => r.flags.process_standardized || r.flags.team_ownership,
          text: 'Team đã có quy trình và người chịu trách nhiệm cho từng phần vận hành.', pm: 'reflect' },
        { who: 'SYS', title: 'Bằng chứng tích cực', when: r => r.flags.development_plan_created || r.flags.ownership_delegated,
          text: 'Mỗi thành viên có lộ trình phát triển hoặc phạm vi quyết định rõ ràng.', pm: 'reflect' },
        { who: 'HA', text: 'Chị bên nhân sự, sẽ cùng anh Minh đánh giá kết quả thử việc của em.', pm: 'reflect', npc: 'greet', npcFace: 'face_polite_smile' },
        { who: 'MINH', text: 'PM tốt không phải người không gặp vấn đề, mà là người biết chịu trách nhiệm.', pm: 'reflect', npc: 'serious', npcFace: 'face_formal' },
        { who: 'MINH', text: 'Em có 10 phút cho kết quả, quyết định quan trọng và kế hoạch 90 ngày.', pm: 'reflect', npc: 'point', npcFace: 'face_formal' },
        { who: 'PM', text: 'Em xin bắt đầu ạ.', pm: 'bowthank', face: 'face_formal_confident' },
      ],
      question: 'Bạn sẽ trình bày báo cáo thử việc theo cách nào?',
      choices: [
        {
          id: 'A', label: 'Chỉ tập trung vào thành tích', hint: 'Trình bày kết quả tốt, không nhắc tới vấn đề.',
          lines: [
            { who: 'PM', text: 'Team hoàn thành phần lớn kế hoạch, mọi vấn đề đều đã được xử lý.', pm: 'present', face: 'face_formal_confident' },
            { who: 'HA', text: 'Báo cáo chưa nói gì về sự cố production và tải của team.', pm: 'wait', npc: 'talk', npcFace: 'face_skeptical', react: { MINH: 'doubt' } },
          ],
          effects: { management_trust: -15, project_risk: 5 },
          flags: ['final_report_opaque'], competency: { STAKEHOLDER: 0, DECISION: 0 },
          result: 'Báo cáo tạo ấn tượng tích cực ban đầu. Hội đồng thiếu dữ liệu để tin rằng rủi ro đã được kiểm soát. Người chơi bị đánh giá thấp về tính minh bạch và khả năng chịu trách nhiệm.',
          after: { pm: 'wait' },
        },
        {
          id: 'B', label: 'Báo cáo thẳng toàn bộ vấn đề và sai sót', hint: 'Nêu hết sự cố, áp lực và quyết định chưa tốt; nhận trách nhiệm.',
          lines: [
            { who: 'PM', text: 'Dự án có sự cố, áp lực nguồn lực và vài quyết định chưa tốt. Em nhận trách nhiệm.', pm: 'bowthank', face: 'face_formal_neutral' },
            { who: 'MINH', text: 'Minh bạch là tốt, nhưng em cần biến nó thành kế hoạch hành động.', pm: 'reflect', npc: 'concern', npcFace: 'face_concerned' },
          ],
          effects: { management_trust: 5, project_risk: -5 },
          flags: ['final_report_transparent'], competency: { STAKEHOLDER: 1, DECISION: 2 },
          result: 'Hội đồng ghi nhận sự trung thực. Báo cáo thiếu ưu tiên và chưa chứng minh khả năng điều hành. Người chơi nhận trách nhiệm nhưng chưa chuyển hóa thành roadmap rõ ràng.',
          after: { pm: 'reflect' },
        },
        {
          id: 'C', label: 'Báo cáo bằng dữ liệu, bài học và roadmap 90 ngày', hint: 'Kết quả, quyết định lớn, rủi ro còn lại và roadmap 90 ngày.',
          lines: [
            { who: 'PM', text: 'Em báo cáo bốn phần: kết quả, quyết định lớn, rủi ro còn lại và roadmap 90 ngày.', pm: 'present', face: 'face_formal_confident', react: { HA: 'listen' } },
            { who: 'MINH', text: 'Đây là cách một PM chịu trách nhiệm.', pm: 'answer', npc: 'satisfied', npcFace: 'face_approving', react: { HA: 'pleased' } },
          ],
          effects: { management_trust: 15, client_trust: 5, project_risk: -5 },
          flags: ['final_report_structured'], competency: { STAKEHOLDER: 3, DECISION: 3 },
          result: 'Hội đồng có đủ dữ liệu để đánh giá toàn bộ hành trình. Người chơi chứng minh được tư duy hệ thống và khả năng học từ quyết định. Rủi ro còn lại được chuyển thành kế hoạch có người chịu trách nhiệm.',
          after: { pm: 'answer' },
        },
      ],
      // Phan bien sau moi nhanh: cau hoi co dinh; PM tra loi theo hanh trinh that (textFor), khop mau thi dung cau mau
      outro: {
        pm: 'reflect',
        lines: [
          { who: 'HA', text: 'Quyết định nào trong 60 ngày tạo ra ảnh hưởng lớn nhất, và vì sao?', pm: 'reflect', npc: 'talk', npcFace: 'face_probing' },
          { who: 'PM', text: 'Quyết định chia phase với khách hàng: giữ được cơ hội mà team không quá tải.', pm: 'answer', face: 'face_formal_confident',
            textFor: (run, rep) => {
              const d = rep.best[0];
              return !d || (d.no === 'S15' && d.choice === 'C') ? null : `Quyết định "${d.label}" khi ${lower(d.title)}: ${lower(firstSentence(d.result))}`;
            } },
          { who: 'HA', text: 'Nếu được làm lại một quyết định, em sẽ thay đổi điều gì?', pm: 'reflect', npc: 'talk', npcFace: 'face_questioning' },
          { who: 'PM', text: 'Em sẽ làm rõ phạm vi sớm hơn, trước khi hứa với khách hàng.', pm: 'reflect', face: 'face_formal_neutral',
            textFor: (run, rep) => {
              const d = rep.worst[0];
              return !d || d.avg >= 2 || SCOPE_REGRETS.includes(d.id) ? null
                : `Em sẽ không chọn "${d.label}" khi ${lower(d.title)} nữa, mà cân nhắc tác động lên team và khách hàng trước.`;
            } },
          { who: 'HA', text: 'Team hiện tại có vận hành được mà không cần em không?', pm: 'reflect', npc: 'talk', npcFace: 'face_skeptical' },
          { who: 'PM', text: 'Đã có quy trình và người phụ trách từng phần, team có thể tự vận hành.', pm: 'answer', face: 'face_formal_confident',
            textFor: run => (run.flags.process_standardized || run.flags.team_ownership || run.flags.ownership_delegated ? null
              : 'Chưa hẳn. Vài khâu vẫn phụ thuộc vào em; 30 ngày tới em sẽ chuẩn hóa và trao quyền cho từng người.') },
          { who: 'HA', text: 'Ba ưu tiên của em trong 90 ngày tới là gì?', pm: 'reflect', npc: 'talk', npcFace: 'face_listening' },
          { who: 'PM', text: 'Ổn định Phase 1, chuyển giao review cho team, và đo chất lượng sau mỗi release.', pm: 'answer', face: 'face_formal_confident',
            textFor: run => (run.flags.expansion_phased ? null : 'Ổn định bản release hiện tại, chuyển giao review cho team, và đo chất lượng sau mỗi release.') },
          { who: 'NARR', text: 'Chị Hà và Anh Minh trao đổi với nhau...', pm: 'wait', react: { MINH: 'think', HA: 'listen' } },
        ],
      },
      next: 'P4_CAMPAIGN_RESULT',
    },
  ],

  // Ket qua campaign (muc 9): Anh Minh + Chi Ha cong bo ket qua; ma ket qua theo campaign.js (ENDINGS)
  ending: {
    id: 'P4_CAMPAIGN_RESULT', bg: 'final_review', cast: ['MINH', 'HA'],
    lines: {
      PASS_EXCELLENT: [
        { who: 'MINH', text: 'Em không chỉ qua thử việc mà còn giúp team vận hành tốt hơn. Công ty sẽ giao em phạm vi lớn hơn.', pm: 'badge', npc: 'satisfied', npcFace: 'face_proud' },
        { who: 'HA', text: 'Phòng nhân sự sẽ gửi em hợp đồng chính thức và lộ trình phát triển quản lý.', pm: 'badge', npc: 'pleased', npcFace: 'face_congrats' },
        { who: 'PM', text: 'Em cảm ơn ạ!!', pm: 'celebrate', face: 'face_pm_proud', react: { MINH: 'good', HA: 'encourage' } },
      ],
      PASS: [
        { who: 'MINH', text: 'Chúc mừng em đã trở thành PM chính thức. Vẫn còn vài năng lực cần cải thiện.', pm: 'badge', npc: 'encourage', npcFace: 'face_congrats' },
        { who: 'HA', text: 'Phòng nhân sự sẽ gửi em hợp đồng chính thức trong tuần này.', pm: 'badge', npc: 'pleased', npcFace: 'face_warm' },
        { who: 'PM', text: 'Phù... em cảm ơn anh ạ.', pm: 'relieved', face: 'face_pm_happy' },
      ],
      EXTEND_PROBATION: [
        { who: 'MINH', text: 'Em có tiềm năng, nhưng kết quả chưa đủ ổn định. Công ty gia hạn thử việc.', pm: 'nod', npc: 'concern', npcFace: 'face_concerned' },
        { who: 'HA', text: 'Chị sẽ gửi em mục tiêu và tiêu chí đánh giá cho giai đoạn gia hạn.', pm: 'nod', npc: 'sympathetic', npcFace: 'face_sympathetic' },
        { who: 'PM', text: 'Dạ... em sẽ tập trung vào những điểm còn thiếu.', pm: 'sigh', face: 'face_worried' },
      ],
      FAIL: [
        { who: 'MINH', text: 'Công ty chưa thể giao em vai trò PM chính thức ở thời điểm này.', pm: 'nod', npc: 'disappoint', npcFace: 'face_regretful' },
        { who: 'HA', text: 'Chị sẽ hỗ trợ em các thủ tục kết thúc thử việc.', pm: 'sigh', npc: 'comfort', npcFace: 'face_sympathetic' },
        { who: 'PM', text: 'Em hiểu ạ. Cảm ơn anh đã cho em cơ hội.', pm: 'fail', face: 'face_sad' },
        { who: 'NARR', text: 'Ôm thùng đồ ra cửa...', pm: 'fail', exit: 'leave' },
      ],
    },
  },
};

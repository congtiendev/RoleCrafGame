// Noi dung Level 3 – But pha (docs/KICH_BAN_ROLECRAFT_PM60.md muc 6; thoai rut gon = THOAI_MAU.json).
// Cung dinh dang voi level1.js / level2.js; them rieng cho Level 3:
// - Khong co canh mo dau: the Level roi vao thang S09 (dong dan truyen "LEVEL 3 · ..." hien bang the Level, `lead`).
// - `absent`: NPC vang mat tu level nay khi co co (Huy nghi o S07 -> khong con trong canh; tai lieu muc 2).
// - Tinh huong `laterAt`: so dong mo canh noi truoc loi bao hau qua tri hoan (S09: bao su co truoc, roi hau qua cu).
// - Dong thoai `react`: dong tac cua NPC khong noi (nhanh cua Level 3 chi co PM + dan truyen).
// - Tong ket khong co nhan xet cua Anh Minh; hien cac hau qua da quay lai tu giai doan truoc (tai lieu muc 6 – Tong ket).
// Diem lech tai lieu: "Dieu kien mo man" o S10 va "Modifier" o S10 la ban chep lai cua S09 -> chi ap o S09 theo ma tran muc 8.

export const LEVEL3 = {
  id: 'P3_BREAKTHROUGH', no: 3, phase: 'P3', title: 'BỨT PHÁ', days: 'Ngày 31 – 45', day: 31,
  lead: 'Những quyết định cũ bắt đầu quay lại.',
  goal: 'Xử lý khủng hoảng, quản trị stakeholder, phát triển đội ngũ và ra quyết định cấp quản lý.',
  nextLevel: 'Level 4 · Thu hoạch',
  tired: 'team_ot_14_days',                   // HUONG_DAN_KICH_BAN.md muc 7: OT hai tuan -> tu Level 3 dung bo tired_*
  absent: { HUY: 'key_developer_left' },

  scenarios: [
    {
      id: 'P3_S09_PRODUCTION_INCIDENT', no: 'S09', day: 33, title: 'Production Incident',
      place: 'Phòng vận hành · 14:00', bg: 'incident_ops', cast: ['HUY', 'LAN'], laterAt: 1,
      open: [
        { who: 'SYS', text: '14:00 — Production lỗi, khách hàng bị ảnh hưởng.', pm: 'alert', react: { HUY: 'frown', LAN: 'worry' } },
        { who: 'PM', text: 'Release vẫn đang chờ... xử lý thế nào đây?', pm: 'startle', face: 'face_stressed' },
      ],
      // Bo regression o S06 (hau qua tri hoan dat bien the): loi roi vao luong thanh toan
      variants: {
        critical_payment_incident: [
          { who: 'SYS', text: '14:00 — Lỗi luồng thanh toán trên production, khách hàng không giao dịch được.', pm: 'alert', react: { HUY: 'frown', LAN: 'worry' } },
          { who: 'PM', text: 'Release vẫn đang chờ... xử lý thế nào đây?', pm: 'startle', face: 'face_stressed' },
        ],
      },
      question: 'Bạn điều phối sự cố như thế nào?',
      choices: [
        {
          id: 'A', label: 'Cho toàn team dừng việc để xử lý', hint: 'Dồn cả team vào sự cố, các kế hoạch khác tạm dừng.',
          lines: [
            { who: 'PM', text: 'Cả team dừng việc, dồn hết vào sự cố!', pm: 'command', face: 'face_determined', react: { HUY: 'nod', LAN: 'nod' } },
            { who: 'NARR', text: 'Sự cố được ưu tiên, nhưng mọi kế hoạch khác dừng lại.', pm: 'command' },
          ],
          effects: { project_progress: -10, client_trust: 15, project_risk: -10, team_morale: -5 },
          competency: { RISK: 2, RESOURCE: 1 },
          result: 'Sự cố được ưu tiên cao nhưng toàn bộ kế hoạch khác dừng lại.',
          after: { pm: 'sigh' },
        },
        {
          id: 'B', label: 'Chỉ cử một developer xử lý', hint: 'Một người lo sự cố, những người khác giữ tiến độ.',
          lines: [
            { who: 'PM', text: 'Giao một dev xử lý, những người khác giữ tiến độ.', pm: 'delegate', face: 'face_serious', react: { HUY: 'nod' } },
            { who: 'NARR', text: 'Việc khác vẫn chạy, nhưng phục hồi kéo dài.', pm: 'idle', react: { LAN: 'uneasy' } },
          ],
          effects: { client_trust: -5, project_risk: 10 },
          competency: { RISK: 1, RESOURCE: 2 },
          result: 'Công việc khác tiếp tục nhưng thời gian phục hồi kéo dài.',
          after: { pm: 'sigh' },
        },
        {
          id: 'C', label: 'Rollback trước, lập nhóm incident riêng rồi điều tra', hint: 'Khống chế downtime trước, phân vai rõ rồi mới tìm nguyên nhân.',
          lines: [
            { who: 'PM', text: 'Rollback trước, lập nhóm incident rồi mới điều tra.', pm: 'rollback', face: 'face_determined', react: { HUY: 'agree', LAN: 'nod' } },
            { who: 'NARR', text: 'Downtime được khống chế, trách nhiệm được phân rõ.', pm: 'rollback', react: { LAN: 'relieved' } },
          ],
          effects: { project_progress: -5, client_trust: 10, product_quality: 10, project_risk: -15 },
          flags: ['rollback_used'], competency: { RISK: 3, DECISION: 3 },
          result: 'Downtime được khống chế, trách nhiệm và nhịp cập nhật được xác lập.',
          after: { pm: 'relief' },
        },
      ],
      // Sau moi nhanh: PM goi bao khach hang
      outro: { pm: 'phone_call', lines: [{ who: 'PM', text: 'Anh Hiệp ơi, em báo về sự cố chiều nay và cách bên em đã xử lý ạ.', pm: 'phone_call', face: 'face_apologetic' }] },
      next: 'P3_S10_SALES_OVERCOMMIT',
    },

    {
      id: 'P3_S10_SALES_OVERCOMMIT', no: 'S10', day: 37, title: 'Sales hứa quá khả năng',
      place: 'Bàn làm việc của PM', bg: 'dev_corner', cast: ['LINH'],
      open: [
        { who: 'NARR', text: 'Linh ghé qua bàn PM.', pm: 'idle' },
        { who: 'LINH', text: 'Chị chốt với khách rồi: tính năng AI xong trong mười ngày!', pm: 'idle', npc: 'cheer', npcFace: 'face_excited' },
        { who: 'PM', text: 'Mười ngày? Team còn chưa được hỏi!', pm: 'startle', face: 'face_surprised', react: { LINH: 'sheepish' } },
      ],
      question: 'Bạn sẽ xử lý cam kết này như thế nào?',
      choices: [
        {
          id: 'A', label: 'Nhận deadline và tìm cách hoàn thành', hint: 'Giữ lời Sales đã hứa, cả team chạy nước rút.',
          lines: [
            { who: 'PM', text: 'Nhận. Cả team chạy nước rút mười ngày.', pm: 'rally', face: 'face_determined', react: { LINH: 'cheer' } },
            { who: 'NARR', text: 'Cam kết được giữ, nhưng áp lực dồn hết lên team.', pm: 'idle', react: { LINH: 'wink' } },
          ],
          effects: { management_trust: 5, project_progress: 10, team_morale: -15, project_risk: 15 },
          flags: ['sales_deadline_accepted'], competency: { SCOPE: 0, PEOPLE: 0 },
          result: 'Cam kết được giữ trước mắt nhưng áp lực lại chuyển hết sang team.',
          after: { pm: 'sigh' },
        },
        {
          id: 'B', label: 'Nói với khách hàng rằng Sales đã hứa sai', hint: 'Gọi thẳng cho khách: mười ngày là không khả thi.',
          lines: [
            { who: 'PM', text: 'Anh Hiệp, bên Sales đã hứa sai, mười ngày là không khả thi.', pm: 'phone_call', face: 'face_stern', react: { LINH: 'offended' } },
            { who: 'NARR', text: 'Sự thật được nói ra, nhưng tạo thêm xung đột.', pm: 'idle', react: { LINH: 'angry' } },
          ],
          effects: { client_trust: -10, management_trust: -10, team_morale: -5 },
          competency: { STAKEHOLDER: 0, DECISION: 1 },
          result: 'Thông tin thật được nêu ra theo cách tạo thêm xung đột.',
          after: { pm: 'sigh' },
        },
        {
          id: 'C', label: 'Đề xuất MVP 10 ngày và phase 2 có estimate', hint: 'Mười ngày giao bản MVP, phần còn lại estimate thành phase 2.',
          lines: [
            { who: 'PM', text: 'Mười ngày bên em giao MVP, phase 2 có estimate cụ thể.', pm: 'count', face: 'face_confident', react: { LINH: 'nod' } },
            { who: 'NARR', text: 'Kỳ vọng thành cam kết có giới hạn và lộ trình rõ ràng.', pm: 'tab_present', react: { LINH: 'relieved' } },
          ],
          effects: { client_trust: 10, management_trust: 10, project_progress: 5, project_risk: -5 },
          flags: ['mvp_plan_agreed'], competency: { SCOPE: 3, STAKEHOLDER: 3 },
          result: 'Kỳ vọng được chuyển thành một cam kết có giới hạn và lộ trình rõ ràng.',
          after: { pm: 'tab_present' },
        },
      ],
      next: 'P3_S11_JUNIOR_MISTAKE',
    },

    {
      id: 'P3_S11_JUNIOR_MISTAKE', no: 'S11', day: 41, title: 'Thành viên mắc lỗi nghiêm trọng',
      place: 'Khu vận hành · Sáng sớm', bg: 'incident_ops', cast: ['NAM', 'LAN', 'HUY'],
      open: [
        { who: 'NAM', text: 'Em xin lỗi... em push nhầm code, dữ liệu test mất hết rồi.', pm: 'startle', npc: 'apologize', npcFace: 'face_ashamed' },
        { who: 'LAN', text: 'Team sẽ mất gần một ngày để khôi phục.', pm: 'idle', npc: 'worry', npcFace: 'face_worried', react: { NAM: 'uneasy' } },
        { who: 'PM', text: 'Xử lý thế nào cho đúng đây...', pm: 'facepalm', face: 'face_stressed', react: { NAM: 'uneasy' } },
      ],
      question: 'Bạn phản hồi với nhân sự và team thế nào?',
      choices: [
        {
          id: 'A', label: 'Phê bình nhân sự trước team', hint: 'Nói thẳng trước cả team: lỗi lần này là của Nam.',
          lines: [
            { who: 'PM', text: 'Mọi người nghe đây: lỗi lần này là do Nam!', pm: 'scold', face: 'face_stern', react: { NAM: 'apologize', LAN: 'uneasy' } },
            { who: 'NARR', text: 'Team bắt đầu phòng thủ và ngại báo sai sót.', pm: 'crossarms', react: { NAM: 'sigh', LAN: 'uneasy', HUY: 'crossarms' } },
          ],
          effects: { team_morale: -20, project_risk: 5 },
          flags: ['junior_publicly_blamed'], competency: { PEOPLE: 0, RISK: 1 },
          result: 'Team biết lỗi nghiêm trọng nhưng bắt đầu phòng thủ và ngại báo cáo sai sót.',
          after: { pm: 'crossarms' },
        },
        {
          id: 'B', label: 'PM tự xử lý và bỏ qua để giữ hòa khí', hint: 'Tự khôi phục dữ liệu, không nhắc lại chuyện này.',
          lines: [
            { who: 'PM', text: 'Để mình xử lý nốt. Chuyện này bỏ qua nhé.', pm: 'goahead', face: 'face_neutral', react: { NAM: 'thankful' } },
            { who: 'NARR', text: 'Không khí tạm ổn, nhưng nguyên nhân chưa được giải quyết.', pm: 'idle', react: { LAN: 'doubt' } },
          ],
          effects: { team_morale: 5, management_trust: -5, project_risk: 15 },
          flags: ['process_gap_unresolved'], competency: { PEOPLE: 1, RISK: 0 },
          result: 'Không khí tạm ổn nhưng nguyên nhân hệ thống chưa được giải quyết.',
          after: { pm: 'sigh' },
        },
        {
          id: 'C', label: '1-1, phân tích nguyên nhân và bổ sung checklist review/deploy', hint: 'Nói chuyện riêng với Nam, tìm nguyên nhân, thêm checklist deploy.',
          lines: [
            { who: 'PM', text: 'Nam, mình nói chuyện riêng, cùng tìm nguyên nhân rồi thêm checklist deploy.', pm: 'talk', face: 'face_confident', react: { NAM: 'resolve' } },
            { who: 'NARR', text: 'Lỗi được biến thành cải tiến quy trình.', pm: 'checklist', react: { NAM: 'good', LAN: 'good' } },
          ],
          effects: { project_progress: -5, product_quality: 15, team_morale: 5, management_trust: 5, project_risk: -10 },
          flags: ['deployment_checklist_added'], competency: { PEOPLE: 3, RISK: 3 },
          result: 'Nhân sự chịu trách nhiệm nhưng lỗi được chuyển thành cải tiến quy trình.',
          after: { pm: 'checklist' },
        },
      ],
      next: 'P3_S12_BIG_PROJECT',
    },

    {
      id: 'P3_S12_BIG_PROJECT', no: 'S12', day: 45, title: 'Cơ hội nhận dự án lớn',
      place: 'Phòng Anh Minh', bg: 'manager_office', cast: ['MINH'],
      open: [
        { who: 'NARR', text: 'Anh Minh gọi PM lên phòng.', pm: 'idle' },
        { who: 'MINH', text: 'Ban giám đốc muốn team nhận thêm một dự án lớn. Làm tốt thì rất có lợi cho em.', pm: 'nod', npc: 'emph', npcFace: 'face_explain' },
        { who: 'PM', text: 'Nhưng nguồn lực team đang có hạn...', pm: 'count', face: 'face_thinking' },
      ],
      question: 'Bạn đề xuất phương án nào?',
      choices: [
        {
          id: 'A', label: 'Nhận ngay bằng nguồn lực hiện tại', hint: 'Nhận dự án, team hiện tại gánh thêm.',
          lines: [
            { who: 'PM', text: 'Em nhận ngay ạ!', pm: 'thumbs', face: 'face_happy', react: { MINH: 'satisfied' } },
            { who: 'NARR', text: 'Công ty ghi nhận, nhưng tải của team vượt mức an toàn.', pm: 'idle', react: { MINH: 'concern' } },
          ],
          effects: { budget: 20, management_trust: 10, team_morale: -10, project_risk: 20 },
          flags: ['large_project_without_resources'], competency: { RESOURCE: 0, DECISION: 1 },
          // tai lieu muc 8: team de qua tai; truoc Final Review neu tinh than < 40 thi rui ro +10
          delayed: [{ at: 'P4_S16_FINAL_REVIEW', below: { team_morale: 40 }, effects: { project_risk: 10 },
            note: 'Dự án lớn nhận khi thiếu nguồn lực: team quá tải, rủi ro tăng ngay trước buổi đánh giá.' }],
          result: 'Công ty ghi nhận tinh thần nhận việc nhưng tải của team vượt mức an toàn.',
          after: { pm: 'jump', then: 'good' },
        },
        {
          id: 'B', label: 'Từ chối để bảo vệ team hiện tại', hint: 'Giữ nguyên tải cho team, không nhận dự án.',
          lines: [
            { who: 'PM', text: 'Em xin từ chối để bảo vệ team hiện tại.', pm: 'headshake', face: 'face_apologetic', react: { MINH: 'disappoint' } },
            { who: 'NARR', text: 'Team được bảo vệ, nhưng cơ hội bị bỏ lỡ.', pm: 'stop', react: { MINH: 'sigh' } },
          ],
          effects: { team_morale: 10, management_trust: -10, project_risk: -5 },
          competency: { RESOURCE: 2, STAKEHOLDER: 1 },
          result: 'Team được bảo vệ nhưng cơ hội kinh doanh bị từ chối hoàn toàn.',
          after: { pm: 'stop' },
        },
        {
          id: 'C', label: 'Nhận có điều kiện, yêu cầu thêm người và ngân sách triển khai', hint: 'Nhận dự án kèm một nhân sự mới và ngân sách triển khai.',
          lines: [
            { who: 'PM', text: 'Em nhận, nếu có thêm một người và ngân sách triển khai.', pm: 'count', face: 'face_confident', react: { MINH: 'think' } },
            { who: 'NARR', text: 'Cơ hội được nhận kèm điều kiện để làm được.', pm: 'tab_present', react: { MINH: 'satisfied' } },
          ],
          effects: { budget: -15, management_trust: 10, project_progress: 5, project_risk: 5 }, add: { team_size: 1 },
          flags: ['large_project_resourced'], competency: { RESOURCE: 3, STAKEHOLDER: 3 },
          result: 'Cơ hội được tiếp nhận kèm điều kiện năng lực thực thi.',
          after: { pm: 'tab_present' },
        },
      ],
      next: 'P3_SUMMARY',
    },
  ],

  // Tong ket Level 3: khong co nhan xet rieng (tai lieu muc 6); bang bao cao hien hau qua da quay lai tu giai doan truoc.
  // Xep loai: tai lieu khong dinh nghia -> DE XUAT theo rui ro, dau hieu nguy hiem va chi so critical (muc 9).
  summary: {
    id: 'P3_SUMMARY', bg: 'team_floor', cast: [], cta: 'Bắt đầu giai đoạn Thu hoạch',
    tiers: [
      { id: 'crisis', label: 'Khủng hoảng lan rộng', mood: 'bad',
        when: x => x.dangers >= 3 || x.risk >= 70 || x.metrics.team_morale < 30 || x.metrics.client_trust < 30 },
      { id: 'caution', label: 'Cần thận trọng', mood: 'mid',
        when: x => x.dangers >= 1 || x.risk >= 50 || !!x.flags.incident_severity_high },
      { id: 'excellent', label: 'Bứt phá xuất sắc', mood: 'good', when: x => !x.zeroRating && x.risk < 30 },
      { id: 'stable', label: 'Bứt phá vững vàng', mood: 'good', when: () => true },
    ],
    // Co Level 3 de lai hau qua o Level 4 (ma tran muc 8)
    dangerFlags: {
      sales_deadline_accepted: 'Đã nhận deadline mười ngày của Sales, áp lực dồn hết lên team.',
      junior_publicly_blamed: 'Nam bị phê bình trước team; mọi người ngại báo sai sót.',
      process_gap_unresolved: 'Nguyên nhân lỗi push nhầm chưa được xử lý; lỗi quy trình có thể tái diễn.',
      large_project_without_resources: 'Nhận dự án lớn khi chưa có thêm nguồn lực; team dễ quá tải.',
    },
  },
};

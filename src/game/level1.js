// Noi dung Level 1 – Khoi dong (docs/KICH_BAN_ROLECRAFT_PM60.md muc 4; thoai rut gon = THOAI_MAU.json).
// Dong thoai: { who, text, pm?, face? } – who: 'PM' | 'NARR' (dan truyen) | 'SYS' (thong bao he thong) | id trong CAST;
// pm = dong tac PM (src/game/atlas.js); face = chan dung PM (sheet D) khi PM noi;
// npc / npcFace = dong tac / chan dung cua NPC dang noi khi NPC co sprite (src/game/npcAtlas.js, mac dinh talk / face_neutral).
// Lua chon: effects (cong/tru chi so), set (dat tai nguyen), flags, competency, delayed (hau qua tri hoan, xem rules.js;
// note = loi bao "Hau qua tu quyet dinh truoc" hien khi hau qua kich hoat).
// Hieu ung/co/nang luc giu dung ma trong tai lieu (tests/level1.test.js doi chieu tu dong).
// Tinh huong: enter = PM ngoi san o tu the nay khi mo canh (khong di vao), vd hop ban.

// NPC co sprite (npcAtlas.js: Huy, Minh, Lan, Hiep, Linh, Ha) dung trong canh + chan dung that; con lai hien bang the UI tam (the + huy hieu chu cai)
// desc = vai tro trong du an (docs/KICH_BAN_ROLECRAFT_PM60.md muc 2), hien tren the nhan vien (staffCard.js); client = nguoi ben khach hang
export const CAST = {
  MINH: { name: 'Anh Minh', role: 'Trưởng phòng / PM Lead', tint: '#5b8def', desc: 'Bàn giao dự án, giao việc và chủ trì đánh giá thử việc 60 ngày.' },
  HUY: { name: 'Huy', role: 'Backend Developer', tint: '#f2a03d', desc: 'Developer chủ chốt, giỏi nhưng thích tự quyết; ứng viên Technical Lead.' },
  LAN: { name: 'Lan', role: 'BA / QA', tint: '#e46fa1', desc: 'Phụ trách requirement, tài liệu, chất lượng và quy trình.' },
  NAM: { name: 'Nam', role: 'Frontend Developer', tint: '#57c08a', desc: 'Nhiệt tình nhưng còn thiếu kinh nghiệm.' },
  HIEP: { name: 'Anh Hiệp', role: 'Khách hàng / Product Owner', tint: '#9b7bea', desc: 'Đại diện khách hàng, quan tâm deadline và giá trị kinh doanh.', client: true },
  HA: { name: 'Chị Hà', role: 'HR', tint: '#e0a458', desc: 'Bên nhân sự, cùng Anh Minh đánh giá kết quả thử việc 60 ngày.' },
  LINH: { name: 'Chị Linh', role: 'Sales Executive', tint: '#3a9bd9', desc: 'Phụ trách kinh doanh, thúc đẩy cơ hội hợp đồng với khách hàng.' },
};

export const LEVEL1 = {
  id: 'P1_STARTUP', no: 1, phase: 'P1', title: 'KHỞI ĐỘNG', days: 'Ngày 1 – 15', day: 1,
  goal: 'Tiếp quản dự án, quản lý Senior, kiểm soát phạm vi và phân bổ ngân sách.',
  nextLevel: 'Level 2 · Hòa nhập',

  // Mo dau level: sanh cong ty, Anh Minh ban giao (doan dan truyen o man nhap ten da ke boi canh)
  intro: {
    bg: 'lobby', cast: ['MINH'],
    lines: [
      { who: 'MINH', text: 'Dự án xong 40%, PM cũ nghỉ, tài liệu thiếu. Khách muốn demo sau 7 ngày.', pm: 'nod', face: 'face_surprised', npc: 'serious', npcFace: 'face_serious' },
      { who: 'MINH', text: 'Em có team 3 người và ngân sách 100.000.000 VND. Quyết định là của em.', pm: 'nod', face: 'face_serious', npc: 'emph', npcFace: 'face_explain' },
      { who: 'PM', text: 'Em hiểu rồi ạ. Để em gặp team trước.', pm: 'greet', face: 'face_determined' },
    ],
  },

  scenarios: [
    {
      id: 'P1_S01_PROJECT_TAKEOVER', no: 'S01', day: 1, title: 'Team mới, deadline cũ',
      place: 'Khu vực làm việc của team', bg: 'team_floor', cast: ['HUY', 'LAN'],
      open: [
        { who: 'HUY', text: 'Cứ chạy tiếp thì một tuần nữa demo được.', pm: 'tab_read', npc: 'explain', npcFace: 'face_smirk' },
        { who: 'LAN', text: 'Nhưng tài liệu chưa phản ánh hết những gì team đang làm.', pm: 'tab_read', npc: 'caution', npcFace: 'face_cautious' },
        { who: 'PM', text: 'Mình cần quyết định việc đầu tiên...', pm: 'tab_read', face: 'face_worried' },
      ],
      question: 'Việc đầu tiên bạn sẽ làm là gì?',
      choices: [
        {
          id: 'A', label: 'Review toàn bộ dự án', hint: 'Dừng team một ngày để cùng rà soát hiện trạng.',
          lines: [
            { who: 'PM', text: 'Dừng team một ngày để review toàn bộ dự án.', pm: 'wb_write', face: 'face_determined' },
            { who: 'HUY', text: 'Mất một ngày, nhưng cả team thống nhất được hiện trạng.', pm: 'wb_point', npc: 'nod', npcFace: 'face_relieved' },
          ],
          effects: { project_progress: -5, product_quality: 15, management_trust: 5, project_risk: -5 },
          flags: ['project_reviewed'], competency: { RISK: 3, DECISION: 2 },
          // loi the ve sau: S09 team da co so do he thong + checklist rollback
          delayed: [{ at: 'P3_S09_PRODUCTION_INCIDENT', note: 'Sơ đồ hệ thống và checklist rollback từ buổi review ngày 1 giúp team khoanh vùng lỗi nhanh.' }],
          result: 'Team mất một ngày làm việc nhưng xây dựng được sơ đồ hệ thống, phạm vi dự án và checklist rủi ro.',
          after: { pm: 'good' },
        },
        {
          id: 'B', label: 'Tiếp tục làm theo task cũ', hint: 'Không dừng lại, giữ tốc độ để kịp demo.',
          lines: [
            { who: 'PM', text: 'Không dừng, cứ tiếp tục để kịp demo.', pm: 'goahead', face: 'face_confident' },
            { who: 'LAN', text: 'Em vẫn lo vài giả định cũ chưa được kiểm tra.', pm: 'idle', npc: 'worry', npcFace: 'face_worried' },
          ],
          effects: { project_progress: 10, project_risk: 15 },
          flags: ['legacy_review_skipped'], competency: { RISK: 0, DECISION: 1 },
          delayed: [{ at: 'P3_S09_PRODUCTION_INCIDENT', effects: { project_risk: 10 },
            note: 'Những giả định cũ chưa kiểm tra từ ngày 1: team thiếu tài liệu để khoanh vùng sự cố.' }],
          result: 'Tiến độ tăng nhanh nhưng team tiếp tục làm việc dựa trên những thông tin chưa được xác minh.',
          after: { pm: 'sigh' },
        },
        {
          id: 'C', label: 'PM tự đọc tài liệu ngoài giờ', hint: 'Team code tiếp, bạn tự đọc hết tài liệu buổi tối.',
          lines: [
            { who: 'PM', text: 'Mọi người cứ code tiếp, tối nay mình tự đọc hết tài liệu.', pm: 'talk', face: 'face_determined' },
            { who: 'HUY', text: 'Có gì cần làm rõ thì báo anh.', pm: 'nod', npc: 'point', npcFace: 'face_neutral' },
          ],
          effects: { project_progress: 5, management_trust: 3, project_risk: 5 },
          flags: ['pm_overloaded'], competency: { RESOURCE: 1, DECISION: 2 },
          result: 'Công việc không bị gián đoạn nhưng toàn bộ thông tin dự án bắt đầu phụ thuộc vào PM.',
          // canh toi: ca team da ve, PM ngoi go may roi dui mat
          after: { night: true, pm: 'night_type', then: 'night_rub', emo: 'emo_coffee' },
        },
      ],
      next: 'P1_S02_SENIOR_AUTONOMY',
    },

    {
      id: 'P1_S02_SENIOR_AUTONOMY', no: 'S02', day: 5, title: 'Nhân sự giỏi nhưng khó quản lý',
      place: 'Bàn làm việc của Senior Developer', bg: 'senior_desk', cast: ['HUY'],
      open: [
        { who: 'SYS', text: 'Huy vừa đổi cách xử lý một requirement mà chưa báo BA/QA.', pm: 'tab_read' },
        { who: 'HUY', text: 'Thay đổi nhỏ thôi, không cần review đâu.', pm: 'tab_read', npc: 'crossarms', npcFace: 'face_smirk' },
        { who: 'PM', text: 'Nhỏ hay không thì BA/QA cũng chưa biết...', pm: 'nod', face: 'face_worried' },
      ],
      question: 'Bạn sẽ quản lý quyền tự quyết của Senior Developer như thế nào?',
      choices: [
        {
          id: 'A', label: 'Yêu cầu tuân thủ nghiêm quy trình', hint: 'Mọi thay đổi đều phải qua PM và BA/QA duyệt trước.',
          lines: [
            { who: 'PM', text: 'Mọi thay đổi phải được PM và BA/QA duyệt trước.', pm: 'stop', face: 'face_serious' },
            { who: 'HUY', text: 'Việc gì cũng chờ duyệt thì tiến độ sẽ chậm.', pm: 'idle', npc: 'annoyed', npcFace: 'face_annoyed' },
          ],
          effects: { team_morale: -5, product_quality: 10, management_trust: 5 },
          flags: ['senior_restricted'], competency: { PEOPLE: 1, RISK: 2 },
          result: 'Quy trình rõ ràng hơn nhưng Senior cảm thấy chưa được tin tưởng.',
          after: { pm: 'sigh' },
        },
        {
          id: 'B', label: 'Cho Senior toàn quyền', hint: 'Huy hiểu hệ thống nhất, để Huy tự quyết cho nhanh.',
          lines: [
            { who: 'PM', text: 'Anh hiểu hệ thống nhất, anh cứ tự quyết.', pm: 'goahead', face: 'face_happy' },
            { who: 'HUY', text: 'Vậy anh sẽ chủ động xử lý cho kịp tiến độ.', pm: 'idle', npc: 'good', npcFace: 'face_determined' },
          ],
          effects: { project_progress: 10, project_risk: 15 },
          flags: ['senior_uncontrolled'], competency: { PEOPLE: 1, RISK: 0 },
          // S08 mo bang bien the 1: requirement bi sua ma BA chua xac nhan
          delayed: [{ at: 'P2_S08_CUSTOMER_COMPLAINT', variant: 'requirement_changed_without_confirmation', effects: { project_risk: 5 },
            note: 'Thay đổi Huy tự quyết từ ngày 5 chưa từng được BA/QA xác nhận thành requirement.' }],
          result: 'Team làm việc nhanh hơn nhưng không còn ranh giới rõ ràng đối với các thay đổi phạm vi.',
          after: { pm: 'thumbs' },
        },
        {
          id: 'C', label: 'Thiết lập phạm vi tự quyết', hint: 'Ngồi 1-1 thống nhất việc nào Huy tự quyết, việc nào cần review.',
          lines: [
            { who: 'PM', text: 'Mình thống nhất: việc nào anh tự quyết, việc nào phải review.', pm: 'oneone_talk', face: 'face_confident' },
            { who: 'HUY', text: 'Hợp lý. Việc ảnh hưởng requirement anh sẽ đưa ra review.', pm: 'oneone_talk', npc: 'agree', npcFace: 'face_grin' },
          ],
          effects: { project_progress: 5, team_morale: 5, product_quality: 5, management_trust: 5 },
          flags: ['senior_has_guardrails'], competency: { PEOPLE: 3, RISK: 3 },
          result: 'Senior được trao quyền nhưng vẫn có ranh giới kiểm soát rõ ràng.',
          after: { pm: 'good' },
        },
      ],
      next: 'P1_S03_SCOPE_CHANGE',
    },

    {
      id: 'P1_S03_SCOPE_CHANGE', no: 'S03', day: 10, title: 'Khách hàng yêu cầu thêm tính năng',
      place: 'Phòng họp kickoff', bg: 'client_meeting', cast: ['HIEP', 'LAN', 'HUY'], enter: 'meet_table_listen',
      open: [
        { who: 'HIEP', text: 'Anh muốn thêm hai chức năng vào bản demo. Chắc chỉ vài ngày thôi nhỉ?', pm: 'meet_table_listen', npcFace: 'face_assume' },
        { who: 'LAN', text: 'Hai chức năng này nằm ngoài phạm vi đã xác nhận.', pm: 'meet_table_listen', npc: 'firm', npcFace: 'face_firm' },
        { who: 'PM', text: 'Hai chức năng... mà demo chỉ còn vài ngày.', pm: 'meet_table_worry', face: 'face_worried' },
      ],
      question: 'Bạn sẽ phản hồi yêu cầu của khách hàng như thế nào?',
      choices: [
        {
          id: 'A', label: 'Đồng ý ngay', hint: 'Nhận luôn hai chức năng vào bản demo.',
          lines: [
            { who: 'PM', text: 'Được ạ, team sẽ thêm vào.', pm: 'meet_table_agree', face: 'face_happy' },
            { who: 'HUY', text: 'Team phải điều chỉnh lại kế hoạch ngay.', pm: 'meet_table_worry', npc: 'warn', npcFace: 'face_worried' },
          ],
          effects: { client_trust: 10, budget: -10, project_progress: -5, project_risk: 10 },
          flags: ['scope_unestimated'], competency: { SCOPE: 0, STAKEHOLDER: 1 },
          // truoc S05: team phai lam them phan da cam ket; S08 mo bang bien the 1
          delayed: [
            { at: 'P2_S05_DUAL_DEADLINE', effects: { project_progress: -5, project_risk: 5 },
              note: 'Hai chức năng bổ sung mất nhiều thời gian hơn dự kiến. Dự án A đang chậm so với kế hoạch.' },
            { at: 'P2_S08_CUSTOMER_COMPLAINT', variant: 'requirement_changed_without_confirmation' },
          ],
          result: 'Khách hàng hài lòng trước mắt nhưng team nhận thêm công việc chưa được đánh giá.',
          after: { pm: 'meet_table_worry' },
        },
        {
          id: 'B', label: 'Từ chối vì ngoài hợp đồng', hint: 'Giữ nguyên phạm vi đã ký, không nhận thêm.',
          lines: [
            { who: 'PM', text: 'Yêu cầu này ngoài hợp đồng, team không làm được.', pm: 'meet_table_talk', face: 'face_serious' },
            { who: 'HIEP', text: 'Anh hiểu, nhưng cách xử lý này hơi cứng nhắc.', pm: 'meet_table_listen', npc: 'stern', npcFace: 'face_annoyed' },
          ],
          effects: { client_trust: -10, budget: 5 },
          flags: ['scope_rejected'], competency: { SCOPE: 2, STAKEHOLDER: 0 },
          result: 'Phạm vi được bảo vệ nhưng niềm tin của khách hàng giảm.',
          after: { pm: 'meet_table_worry' },
        },
        {
          id: 'C', label: 'Tạo Change Request', hint: 'Estimate rồi để khách chọn: lùi deadline, giảm phạm vi hoặc thêm ngân sách.',
          lines: [
            { who: 'PM', text: 'Team sẽ estimate và gửi anh phương án: lùi deadline, giảm phạm vi hoặc thêm ngân sách.', pm: 'meet_table_present', face: 'face_confident' },
            { who: 'HIEP', text: 'Được, anh cần biết rõ tác động trước.', pm: 'meet_table_listen', npc: 'nod', npcFace: 'face_conditional' },
          ],
          effects: { management_trust: 10, client_trust: 5, project_progress: -5, project_risk: -5 },
          flags: ['change_controlled'], competency: { SCOPE: 3, STAKEHOLDER: 3 },
          result: 'Khách hàng có thể lựa chọn dựa trên tác động thực tế thay vì một cam kết cảm tính.',
          after: { pm: 'meet_table_agree' },
        },
      ],
      next: 'P1_S04_TOOL_BUDGET',
    },

    {
      id: 'P1_S04_TOOL_BUDGET', no: 'S04', day: 15, title: 'Quỹ công cụ đầu tiên',
      place: 'Khu vực làm việc của team', bg: 'team_floor', cast: ['LAN', 'HUY'],
      open: [
        { who: 'LAN', text: 'Team đang quản lý test case thủ công. Em đề xuất mua bộ công cụ.', pm: 'tab_read', npc: 'propose', npcFace: 'face_polite_smile' },
        { who: 'SYS', text: 'Đầy đủ: 15.000.000 VND · Licence dùng chung: 5.000.000 VND · Miễn phí: 0 VND', pm: 'tab_read' },
        { who: 'PM', text: '100.000.000 VND phải dùng cho cả 60 ngày... tính sao đây.', pm: 'count', face: 'face_thinking' },
      ],
      question: 'Bạn sẽ phân bổ quỹ công cụ như thế nào?',
      choices: [
        {
          id: 'A', label: 'Mua đầy đủ', hint: 'Bộ công cụ quản lý, kiểm thử, giám sát · 15.000.000 VND.',
          lines: [
            { who: 'PM', text: 'Mua đủ bộ công cụ cho team.', pm: 'tab_present', face: 'face_confident' },
            { who: 'NARR', text: 'Team có đủ công cụ quản lý, kiểm thử và giám sát.', pm: 'tab_present' },
          ],
          effects: { budget: -15, product_quality: 10, project_progress: 5 }, set: { tooling_level: 2 },
          competency: { RESOURCE: 2, RISK: 3 },
          result: 'Team có đầy đủ công cụ quản lý, kiểm thử và giám sát.',
          after: { pm: 'good' },
        },
        {
          id: 'B', label: 'Chỉ sử dụng công cụ miễn phí', hint: 'Giữ nguyên quỹ, chấp nhận làm tay nhiều hơn · 0 VND.',
          lines: [
            { who: 'PM', text: 'Tạm thời dùng công cụ miễn phí thôi.', pm: 'talk', face: 'face_neutral' },
            { who: 'NARR', text: 'Giữ được ngân sách, nhưng team mất nhiều thời gian làm tay.', pm: 'idle' },
          ],
          effects: { project_progress: -5 }, set: { tooling_level: 0 },
          competency: { RESOURCE: 2, RISK: 1 },
          result: 'Ngân sách được giữ lại nhưng team mất nhiều thời gian thao tác thủ công.',
          after: { pm: 'sigh' },
        },
        {
          id: 'C', label: 'Mua một licence dùng chung', hint: 'Một licence cho cả team · 5.000.000 VND.',
          lines: [
            { who: 'PM', text: 'Mua một licence, cả team dùng chung.', pm: 'count', face: 'face_thinking' },
            { who: 'NARR', text: 'Tiết kiệm ngân sách, nhưng licence dùng chung dễ thành điểm nghẽn.', pm: 'idle' },
          ],
          effects: { budget: -5, product_quality: 3 }, set: { tooling_level: 1 },
          flags: ['shared_tool_license'], competency: { RESOURCE: 2, RISK: 1 },
          // chi khi S06 chon release tung phan (C)
          delayed: [{ at: 'P2_S06_DEADLINE_QUALITY', ifChoice: 'C', effects: { project_progress: -3 },
            note: 'Licence công cụ dùng chung thành điểm nghẽn: release từng phần chậm hơn dự kiến.' }],
          result: 'Team tiết kiệm ngân sách nhưng licence dùng chung có thể trở thành điểm nghẽn.',
          after: { pm: 'nod' },
        },
      ],
      next: 'P1_SUMMARY',
    },
  ],

  // Tong ket Level 1 (tai lieu muc 4 – Tong ket Level 1): xep loai, co can canh bao, nhan xet cua Anh Minh
  summary: {
    id: 'P1_SUMMARY', bg: 'lobby', cast: ['MINH'],
    // Xet tu tren xuong, lay loai dau tien khop; x = { risk, budget, dangers (so co nguy hiem), zeroRating (co lua chon nang luc 0) }
    tiers: [
      { id: 'risky', label: 'Khởi đầu nhiều rủi ro', mood: 'bad', when: x => x.risk >= 50 || x.dangers >= 2 },
      { id: 'caution', label: 'Cần thận trọng', mood: 'mid', when: x => x.risk >= 35 || x.dangers >= 1 },
      { id: 'excellent', label: 'Khởi đầu xuất sắc', mood: 'good', when: x => !x.zeroRating && x.risk < 20 },
      { id: 'stable', label: 'Khởi đầu ổn định', mood: 'good', when: x => x.risk < 35 && x.budget >= 70 },
      { id: 'caution', label: 'Cần thận trọng', mood: 'mid', when: () => true },
    ],
    // Co can canh bao -> rui ro dang tich luy (hien o bang tong ket)
    dangerFlags: {
      legacy_review_skipped: 'Team vẫn làm trên những giả định cũ chưa được kiểm tra.',
      senior_uncontrolled: 'Huy tự quyết thay đổi mà không qua review của BA/QA.',
      scope_unestimated: 'Đã nhận thêm tính năng cho khách khi chưa estimate.',
      shared_tool_license: 'Licence dùng chung có thể thành điểm nghẽn khi release.',
      pm_overloaded: 'Mọi thông tin dự án đang dồn về một mình bạn.',
    },
    comments: {
      good: [
        { who: 'MINH', text: 'Em đã bắt đầu kiểm soát được dự án. Giai đoạn tới sẽ khó hơn.', pm: 'nod', npc: 'encourage', npcFace: 'face_approving' },
        { who: 'PM', text: 'Em cảm ơn anh. Em sẵn sàng rồi ạ.', pm: 'good', face: 'face_happy' },
        { who: 'NARR', text: 'Hết 15 ngày đầu. Giai đoạn Hòa nhập bắt đầu.', pm: 'idle' },
      ],
      mid: [
        { who: 'MINH', text: 'Dự án vẫn chạy, nhưng vài quyết định đang tạo ra rủi ro. Theo dõi kỹ nhé.', pm: 'nod', npc: 'concern', npcFace: 'face_concerned' },
        { who: 'PM', text: 'Em sẽ theo dõi kỹ những rủi ro đó.', pm: 'nod', face: 'face_determined' },
        { who: 'NARR', text: 'Hết 15 ngày đầu. Giai đoạn Hòa nhập bắt đầu.', pm: 'idle' },
      ],
      bad: [
        { who: 'MINH', text: 'Tiến độ trước mắt ổn, nhưng nền tảng chưa vững. Vấn đề sẽ quay lại.', pm: 'nod', npc: 'disappoint', npcFace: 'face_disappointed' },
        { who: 'PM', text: 'Em hiểu... em sẽ xử lý dần các vấn đề tồn đọng.', pm: 'sigh', face: 'face_apologetic' },
        { who: 'NARR', text: 'Hết 15 ngày đầu. Giai đoạn Hòa nhập bắt đầu.', pm: 'idle' },
      ],
    },
  },
};

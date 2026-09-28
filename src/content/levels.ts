// NOI DUNG TAT CA CAC LEVEL – chi la du lieu (khong co ham), xu ly chung o src/game/levels.ts; dieu kien / mau cau dang
// du lieu: src/game/conditions.ts. Thu tu trong mang = thu tu choi. Them level = them mot phan tu (id, no, phase, title, days,
// day, intro?, scenarios, summary | ending), khong can sua code; test doi chieu tai lieu: tests/level*.test.ts.
// Du lieu nay chuyen thang sang JSON / DB duoc (tests/levels.test.ts kiem tra).
//
// Dinh dang:
// Dong thoai: { who, text, pm?, face? } – who: 'PM' | 'NARR' (dan truyen) | 'SYS' (thong bao he thong) | id trong src/content/cast.ts;
// pm = dong tac PM (src/generated/atlas.ts); face = chan dung PM (sheet D) khi PM noi;
// npc / npcFace = dong tac / chan dung cua NPC dang noi khi NPC co sprite (src/generated/npcAtlas.ts, mac dinh talk / face_neutral).
// Lua chon: effects (cong/tru chi so), set (dat tai nguyen), flags, competency, delayed (hau qua tri hoan, xem rules.ts;
// note = loi bao "Hau qua tu quyet dinh truoc" hien khi hau qua kich hoat).
// Hieu ung/co/nang luc giu dung ma trong tai lieu (tests/level*.test.ts doi chieu tu dong).
// Tinh huong: enter = PM ngoi san o tu the nay khi mo canh (khong di vao), vd hop ban.
// Level co `final: true` la level cuoi: ket thuc bang `ending` (ket qua campaign) thay cho `summary`.
// Them theo level (co the dung o moi level):
// - Dong thoai `ifFlag` / `unlessFlag` / `when`: hien khi co co / an khi co co / dieu kien (conditions.ts).
// - Tinh huong `variants`: mo canh thay the khi hau qua tri hoan dat bien the (run.variants).
// - Lua chon `join` (NPC buoc vao canh), `outcomes` (ket qua re nhanh co `when`), `outro` (canh ket sau bang ket qua).
// - Level `prelude` (canh chuyen truoc mo dau khi co co), `tired` (co lam PM met), `absent` (NPC vang mat khi co co),
//   `lead` (khong co canh mo dau), `final` + `ending` (level cuoi: ket qua campaign thay cho tong ket).
// - Dong thoai `answer`: cau tra loi theo hanh trinh that (game/levels.ts: answerText).
import type { Level } from './schema.ts';

const LEVELS: Level[] = [
  // Noi dung Level 1 – Khoi dong (docs/KICH_BAN_ROLECRAFT_PM60.md muc 4; thoai rut gon = THOAI_MAU.json).
  {
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
          { who: 'PM', text: 'Nhỏ hay không thì BA/QA cũng chưa biết...', pm: 'crossarms', face: 'face_worried' },
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
              { who: 'PM', text: 'Mình thống nhất: việc nào anh tự quyết, việc nào phải review.', pm: 'talk', face: 'face_confident' },
              { who: 'HUY', text: 'Hợp lý. Việc ảnh hưởng requirement anh sẽ đưa ra review.', pm: 'nod', npc: 'agree', npcFace: 'face_grin' },
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
        place: 'Phòng họp kickoff', bg: 'client_meeting', cast: ['HIEP', 'LAN', 'HUY'],
        open: [
          { who: 'HIEP', text: 'Anh muốn thêm hai chức năng vào bản demo. Chắc chỉ vài ngày thôi nhỉ?', pm: 'idle', npc: 'pleased', npcFace: 'face_assume' },
          { who: 'LAN', text: 'Hai chức năng này nằm ngoài phạm vi đã xác nhận.', pm: 'idle', npc: 'firm', npcFace: 'face_firm' },
          { who: 'PM', text: 'Hai chức năng... mà demo chỉ còn vài ngày.', pm: 'sigh', face: 'face_worried' },
        ],
        question: 'Bạn sẽ phản hồi yêu cầu của khách hàng như thế nào?',
        choices: [
          {
            id: 'A', label: 'Đồng ý ngay', hint: 'Nhận luôn hai chức năng vào bản demo.',
            lines: [
              { who: 'PM', text: 'Được ạ, team sẽ thêm vào.', pm: 'thumbs', face: 'face_happy' },
              { who: 'HUY', text: 'Team phải điều chỉnh lại kế hoạch ngay.', pm: 'startle', npc: 'warn', npcFace: 'face_worried' },
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
            after: { pm: 'sigh' },
          },
          {
            id: 'B', label: 'Từ chối vì ngoài hợp đồng', hint: 'Giữ nguyên phạm vi đã ký, không nhận thêm.',
            lines: [
              { who: 'PM', text: 'Yêu cầu này ngoài hợp đồng, team không làm được.', pm: 'doc_raise', face: 'face_serious' },
              { who: 'HIEP', text: 'Anh hiểu, nhưng cách xử lý này hơi cứng nhắc.', pm: 'idle', npc: 'stern', npcFace: 'face_annoyed' },
            ],
            effects: { client_trust: -10, budget: 5 },
            flags: ['scope_rejected'], competency: { SCOPE: 2, STAKEHOLDER: 0 },
            result: 'Phạm vi được bảo vệ nhưng niềm tin của khách hàng giảm.',
            after: { pm: 'sigh' },
          },
          {
            id: 'C', label: 'Tạo Change Request', hint: 'Estimate rồi để khách chọn: lùi deadline, giảm phạm vi hoặc thêm ngân sách.',
            lines: [
              { who: 'PM', text: 'Team sẽ estimate và gửi anh phương án: lùi deadline, giảm phạm vi hoặc thêm ngân sách.', pm: 'count', face: 'face_confident' },
              { who: 'HIEP', text: 'Được, anh cần biết rõ tác động trước.', pm: 'nod', npc: 'nod', npcFace: 'face_conditional' },
            ],
            effects: { management_trust: 10, client_trust: 5, project_progress: -5, project_risk: -5 },
            flags: ['change_controlled'], competency: { SCOPE: 3, STAKEHOLDER: 3 },
            result: 'Khách hàng có thể lựa chọn dựa trên tác động thực tế thay vì một cam kết cảm tính.',
            after: { pm: 'nod' },
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
              { who: 'PM', text: 'Mua một licence, cả team dùng chung.', pm: 'talk', face: 'face_thinking' },
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
      // Xet tu tren xuong, lay loai dau tien khop (game/levels.ts: pickTier); ctx = { risk, budget, dangers (so co nguy hiem),
      // zeroRating (co lua chon nang luc 0), metrics, flags, choices }
      tiers: [
        { id: 'risky', label: 'Khởi đầu nhiều rủi ro', mood: 'bad', when: { any: [{ var: 'risk', gte: 50 }, { var: 'dangers', gte: 2 }] } },
        { id: 'caution', label: 'Cần thận trọng', mood: 'mid', when: { any: [{ var: 'risk', gte: 35 }, { var: 'dangers', gte: 1 }] } },
        { id: 'excellent', label: 'Khởi đầu xuất sắc', mood: 'good', when: { all: [{ not: { var: 'zeroRating' } }, { var: 'risk', lt: 20 }] } },
        { id: 'stable', label: 'Khởi đầu ổn định', mood: 'good', when: { all: [{ var: 'risk', lt: 35 }, { var: 'budget', gte: 70 }] } },
        { id: 'caution', label: 'Cần thận trọng', mood: 'mid' },   // khong co when = luon khop
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
  },

  // Noi dung Level 2 – Hoa nhap (docs/KICH_BAN_ROLECRAFT_PM60.md muc 5; thoai rut gon = THOAI_MAU.json).
  // - Dong thoai `ifFlag`: chi hien khi co co do (bien the thoai theo co, vd Huy o S07).
  // - Tinh huong `variants`: mo canh thay the khi hau qua tri hoan dat bien the (run.variants, vd S08 bien the 1).
  // - Lua chon `join`: NPC buoc vao canh truoc thoai nhanh (vd Anh Minh o S07 B).
  // - Lua chon `outcomes`: ket qua re nhanh theo lich su phien choi (rules.ts: resolveOutcome), vd S07 C -> C1 / C2.
  // - `outro` (lua chon hoac tinh huong): canh ket sau bang ket qua { lines, pm, night, hideCast }.
  // - `prelude`: canh chuyen truoc mo dau level khi co co (vd pm_overloaded: ngu guc tren ban).
  // - `tired`: co lam PM met tu level nay (dong tac idle/talk/walk -> tired_*, HUONG_DAN_KICH_BAN.md muc 7).
  // Hieu ung tai nguyen (team_size -1) nam o `add`, khong o `effects` (chi so).
  {
    id: 'P2_INTEGRATION', no: 2, phase: 'P2', title: 'HÒA NHẬP', days: 'Ngày 16 – 30', day: 16,
    goal: 'Quản trị xung đột nguồn lực, cân bằng deadline với chất lượng, giữ nhân sự chủ chốt và xử lý tranh chấp với khách hàng.',
    nextLevel: 'Level 3 · Bứt phá',
    tired: 'pm_overloaded',

    // PM tu doc tai lieu ngoai gio o Level 1 -> mo Level 2 bang canh ngu guc tren ban (THOAI_MAU.json: FLAG | pm_overloaded)
    prelude: {
      ifFlag: 'pm_overloaded', bg: 'dev_corner', night: true, pm: 'night_sleep',
      lines: [
        { who: 'NARR', text: 'Lại ngủ gục trên bàn...', pm: 'night_sleep' },
        { who: 'PM', text: 'Mấy giờ rồi... lại phải bắt đầu rồi.', pm: 'night_wake', face: 'face_exhausted' },
        { who: 'PM', text: 'Mệt quá...', pm: 'night_wake', face: 'face_exhausted' },
      ],
    },

    // Mo dau level: phong Anh Minh (dong dan truyen dau "LEVEL 2 · HOA NHAP" hien bang the Level)
    intro: {
      bg: 'manager_office', cast: ['MINH'],
      lines: [
        { who: 'NARR', text: 'Dự án A chưa ổn định thì dự án B đã tới. Mọi yêu cầu đều được gọi là ưu tiên.', pm: 'idle' },
        { who: 'MINH', text: 'Công ty có thêm dự án B. Từ giờ em không chỉ quản lý một deadline.', pm: 'nod', face: 'face_surprised', npc: 'serious', npcFace: 'face_serious' },
        { who: 'PM', text: 'Em cần biết phạm vi dự án B trước khi đưa ra phương án.', pm: 'talk', face: 'face_determined' },
      ],
    },

    scenarios: [
      {
        id: 'P2_S05_DUAL_DEADLINE', no: 'S05', day: 18, title: 'Hai dự án cùng deadline',
        place: 'Phòng họp nội bộ', bg: 'internal_meeting', cast: ['MINH', 'HUY', 'NAM'],
        open: [
          { who: 'MINH', text: 'Dự án B cần demo sau hai tuần, dự án A vẫn giữ mốc release.', pm: 'idle', npc: 'emph', npcFace: 'face_explain' },
          { who: 'HUY', text: 'Anh mà chuyển sang B thì backend của A thiếu người review.', pm: 'idle', npc: 'warn', npcFace: 'face_worried' },
          { who: 'PM', text: 'Hai dự án, vẫn chỉ ba người...', pm: 'sigh', face: 'face_stressed' },
        ],
        question: 'Bạn sẽ xử lý xung đột nguồn lực giữa hai dự án như thế nào?',
        choices: [
          {
            id: 'A', label: 'Thuê Freelancer hỗ trợ', hint: 'Thuê người ngoài cho các việc độc lập của dự án B.',
            lines: [
              { who: 'PM', text: 'Thuê một Freelancer cho các việc độc lập của dự án B.', pm: 'tab_present', face: 'face_confident' },
              { who: 'HUY', text: 'Được, nhưng team vẫn mất thời gian onboarding và review.', pm: 'idle', npc: 'explain', npcFace: 'face_thinking' },
            ],
            effects: { budget: -25, project_progress: 15, project_risk: 5 },
            flags: ['freelancer_hired'], competency: { RESOURCE: 2, DECISION: 2 },
            result: 'Team có thêm năng lực thực thi. Tiến độ hai dự án được hỗ trợ. Ngân sách giảm đáng kể. Team phát sinh thêm effort onboarding và kiểm soát chất lượng.',
            after: { pm: 'nod' },
          },
          {
            id: 'B', label: 'Cho team OT trong hai tuần', hint: 'Cả team chia ca, làm thêm giờ để giữ cả hai deadline.',
            lines: [
              { who: 'PM', text: 'Hai tuần tới cả team chia ca và OT để giữ cả hai deadline.', pm: 'rally', face: 'face_determined' },
              { who: 'NAM', text: 'Em sẽ cố, nhưng team đã căng từ đợt demo trước.', pm: 'sigh', npc: 'uneasy', npcFace: 'face_tired' },
            ],
            effects: { project_progress: 20, team_morale: -20, project_risk: 10 },
            flags: ['team_ot_14_days'], competency: { RESOURCE: 0, PEOPLE: 0 },
            result: 'Tiến độ tăng nhanh mà không cần thuê thêm người. Team mất thời gian nghỉ và bắt đầu có dấu hiệu quá tải. Rủi ro lỗi và mất nhân sự tăng.',
            after: { pm: 'sigh' },
            // THOAI_MAU.json: FLAG | team_ot_14_days – hai tuan OT, ca team o lai toi muon
            outro: { night: true, pm: 'sigh', lines: [{ who: 'NARR', text: 'Hai tuần OT liên tục. Cả team kiệt sức.', pm: 'sigh' }] },
          },
          {
            id: 'C', label: 'Đàm phán lại mức ưu tiên với quản lý', hint: 'Ưu tiên release A; dự án B bắt đầu bằng discovery và backlog.',
            lines: [
              { who: 'PM', text: 'Ưu tiên release A. Dự án B bắt đầu bằng discovery và backlog.', pm: 'count', face: 'face_confident' },
              { who: 'MINH', text: 'Vậy B sẽ không có demo đầy đủ sau hai tuần.', pm: 'idle', npc: 'think', npcFace: 'face_thinking' },
            ],
            effects: { management_trust: 10, project_progress: -5, client_trust: -3, project_risk: -5 },
            flags: ['priority_negotiated'], competency: { RESOURCE: 3, STAKEHOLDER: 3 },
            result: 'Nguồn lực được phân bổ có chủ đích. Một phần kế hoạch bị chậm để giảm rủi ro tổng thể. Quản lý ghi nhận khả năng trình bày đánh đổi. Khách hàng chịu một mức chậm nhỏ ở đầu kỳ.',
            after: { pm: 'nod' },
          },
        ],
        next: 'P2_S06_DEADLINE_QUALITY',
      },

      {
        id: 'P2_S06_DEADLINE_QUALITY', no: 'S06', day: 22, title: 'Deadline hay chất lượng',
        place: 'Phòng họp release', bg: 'internal_meeting', cast: ['HUY', 'HIEP', 'LAN'],
        open: [
          { who: 'NARR', text: 'Dự án A đang chậm 3 ngày.', pm: 'tab_read' },
          { who: 'HUY', text: 'Muốn release đúng ngày thì phải bỏ vòng regression cuối.', pm: 'tab_read', npc: 'point', npcFace: 'face_serious' },
          { who: 'HIEP', text: 'Lùi ba ngày thì bên anh phải đổi lịch đào tạo. Anh cần phương án ngay.', pm: 'nod', npc: 'stern', npcFace: 'face_impatient' },
          { who: 'PM', text: 'Deadline hay chất lượng... phải chọn thôi.', pm: 'tab_read', face: 'face_stressed' },
        ],
        question: 'Bạn sẽ quyết định phương án release nào?',
        choices: [
          {
            id: 'A', label: 'Bỏ regression test và release đúng hạn', hint: 'Giữ deadline, bổ sung regression ở bản sau.',
            lines: [
              { who: 'PM', text: 'Release đúng hạn, regression bổ sung ở bản sau.', pm: 'goahead', face: 'face_determined' },
              { who: 'HUY', text: 'Lỗi ở luồng cũ mà lọt lên production thì tốn hơn nhiều.', pm: 'idle', npc: 'warn', npcFace: 'face_worried' },
            ],
            effects: { project_progress: 15, client_trust: 10, product_quality: -10, project_risk: 30 },
            flags: ['regression_test_skipped'], competency: { RISK: 0, DECISION: 1 },
            delayed: [{ at: 'P3_S09_PRODUCTION_INCIDENT', variant: 'critical_payment_incident', flags: ['incident_severity_high'],
              effects: { project_risk: 20, client_trust: -15, budget: -10, team_morale: -5 },
              note: 'Vòng regression bị bỏ ở ngày 22: lỗi lọt đúng vào luồng thanh toán cũ.' }],
            result: 'Deadline được giữ. Khách hàng hài lòng trước mắt. Chất lượng kiểm thử giảm. Rủi ro production tăng mạnh.',
            after: { pm: 'sigh' },
          },
          {
            id: 'B', label: 'Xin delay ba ngày để test đầy đủ', hint: 'Lùi ba ngày để chạy đủ vòng regression.',
            lines: [
              { who: 'PM', text: 'Team cần thêm ba ngày để chạy đủ regression.', pm: 'bow', face: 'face_apologetic' },
              { who: 'HIEP', text: 'Anh cần chắc ba ngày này thực sự giảm được rủi ro.', pm: 'idle', npc: 'stern', npcFace: 'face_skeptical' },
            ],
            effects: { project_progress: -10, client_trust: -5, product_quality: 20, project_risk: -10 },
            flags: ['release_delayed_for_quality'], competency: { RISK: 3, STAKEHOLDER: 2 },
            result: 'Kế hoạch bị chậm ba ngày. Khách hàng phải điều chỉnh lịch đào tạo. Chất lượng release tăng và rủi ro giảm.',
            after: { pm: 'tab_present' },
          },
          {
            id: 'C', label: 'Test luồng critical và release từng phần', hint: 'Release trước luồng critical, tạm tắt phần chưa đủ tin cậy.',
            lines: [
              { who: 'PM', text: 'Release trước các luồng critical, phần chưa đủ tin cậy thì tắt tạm.', pm: 'tab_present', face: 'face_confident' },
              { who: 'HUY', text: 'Anh sẽ dùng feature flag để kiểm soát phạm vi mở.', pm: 'nod', npc: 'agree', npcFace: 'face_focused' },
            ],
            effects: { project_progress: 5, product_quality: 10, client_trust: 3, project_risk: 10 },
            flags: ['partial_release_used'], competency: { RISK: 3, DECISION: 3 },
            result: 'Khách hàng nhận được phần giá trị quan trọng đúng thời điểm. Team giữ lại phạm vi chưa đủ mức tin cậy. Release phức tạp hơn và vẫn có một phần rủi ro tích hợp.',
            after: { pm: 'good' },
          },
        ],
        next: 'P2_S07_KEY_PERSON_RETENTION',
      },

      {
        id: 'P2_S07_KEY_PERSON_RETENTION', no: 'S07', day: 26, title: 'Nhân sự chủ chốt muốn nghỉ việc',
        place: 'Phòng họp 1-1', bg: 'senior_desk', cast: ['HUY'],
        open: [
          { who: 'NARR', text: 'Huy xin nói chuyện riêng.', pm: 'idle' },
          { who: 'HUY', text: 'Anh vừa nhận offer mới, thu nhập cao hơn khoảng 30%.', pm: 'idle', npc: 'talk', npcFace: 'face_serious' },
          { who: 'HUY', text: 'Việc critical dồn hết vào anh, mà lộ trình thì chưa rõ.', pm: 'idle', npc: 'sigh', npcFace: 'face_tired' },
          // bien the thoai theo co (tai lieu muc 5 – S07)
          { who: 'HUY', ifFlag: 'team_ot_14_days', text: 'Hai tuần OT vừa rồi là lý do lớn khiến anh cân nhắc. Anh có thể hỗ trợ giai đoạn ngắn, nhưng không muốn đây trở thành cách vận hành bình thường.', pm: 'sigh', npc: 'frown', npcFace: 'face_exhausted' },
          { who: 'HUY', ifFlag: 'senior_restricted', text: 'Anh cũng cảm thấy mình chịu trách nhiệm kỹ thuật nhưng lại không có đủ quyền để quyết định trong phạm vi chuyên môn.', pm: 'idle', npc: 'defend', npcFace: 'face_defensive' },
          { who: 'HUY', ifFlag: 'senior_has_guardrails', text: 'Cách phân chia quyền quyết định gần đây hợp lý hơn. Nếu có lộ trình Technical Lead rõ ràng, anh sẵn sàng cân nhắc ở lại.', pm: 'idle', npc: 'explain', npcFace: 'face_thinking' },
          { who: 'PM', text: 'Mất Huy lúc này thì cả dự án chao đảo...', pm: 'sigh', face: 'face_worried' },
        ],
        question: 'Bạn sẽ xử lý đề nghị nghỉ việc của Huy như thế nào?',
        choices: [
          {
            id: 'A', label: 'Dùng ngân sách retention', hint: 'Điều chỉnh quyền lợi cho Huy bằng quỹ dự án.',
            lines: [
              { who: 'PM', text: 'Em đề xuất dùng ngân sách retention để điều chỉnh quyền lợi cho Huy.', pm: 'tab_present', face: 'face_serious' },
              { who: 'HUY', text: 'Nếu khối lượng việc cũng được kiểm soát, anh sẽ ở lại.', pm: 'idle', npc: 'nod', npcFace: 'face_relieved' },
            ],
            effects: { budget: -20, team_morale: 10, management_trust: 3 },
            flags: ['key_developer_retained'], competency: { RESOURCE: 2, PEOPLE: 2 },
            delayed: [{ at: 'P3_S09_PRODUCTION_INCIDENT', note: 'Huy ở lại dự án và cùng team khoanh vùng lỗi backend.' }],
            result: 'Huy tiếp tục ở lại dự án. Team ổn định tâm lý. Quỹ dự án giảm đáng kể. Vấn đề phát triển nghề nghiệp mới chỉ được giải quyết một phần.',
            after: { pm: 'nod' },
          },
          {
            id: 'B', label: 'Chấp nhận cho nghỉ và tuyển người mới', hint: 'Tôn trọng quyết định, lên kế hoạch bàn giao và tuyển thay thế.',
            join: ['MINH'],
            lines: [
              { who: 'PM', text: 'Em tôn trọng lựa chọn của anh. Team sẽ lên kế hoạch bàn giao.', pm: 'talk', face: 'face_sad' },
              { who: 'MINH', text: 'Rủi ro ngắn hạn rất cao. Dự án phải chạy được khi chưa có người mới.', pm: 'sigh', npc: 'concern', npcFace: 'face_concerned' },
            ],
            effects: { budget: -10, project_progress: -10, team_morale: -5 }, add: { team_size: -1 },
            flags: ['key_developer_left'], competency: { RESOURCE: 1, PEOPLE: 1 },
            delayed: [{ at: 'P3_S09_PRODUCTION_INCIDENT', ifChoice: 'B', effects: { project_progress: -5, project_risk: 10 },
              note: 'Huy đã nghỉ: một developer xử lý một mình, không còn ai nắm kiến trúc để khoanh vùng nhanh.' }],
            result: 'Quyết định của nhân sự được tôn trọng. Team mất người hiểu hệ thống sâu nhất. Tiến độ và tinh thần giảm trong thời gian tuyển thay thế. Dự án phát sinh chi phí tuyển dụng và bàn giao.',
            after: { pm: 'sigh' },
          },
          {
            id: 'C', label: 'Thương lượng career path và technical ownership', hint: 'Đề xuất lộ trình Technical Lead: sở hữu kiến trúc, mentor team.',
            lines: [
              { who: 'PM', text: 'Em đề xuất lộ trình Technical Lead ba tháng: anh sở hữu kiến trúc và mentor team.', pm: 'tab_present', face: 'face_determined' },
              { who: 'HUY', text: 'Anh quan tâm, nhưng team không được tiếp tục sống bằng OT.', pm: 'idle', npc: 'think', npcFace: 'face_skeptical' },
            ],
            effects: {}, competency: { PEOPLE: 3, STAKEHOLDER: 2 },
            // IF team_morale >= 55 AND missing_flag(team_ot_14_days) THEN C1 ELSE C2 – xet tren trang thai luc chon
            outcomes: [
              {
                id: 'C1', label: 'Thương lượng thành công', when: { all: [{ var: 'metrics.team_morale', gte: 55 }, { not: { flag: 'team_ot_14_days' } }] },
                lines: [
                  { who: 'HUY', text: 'Anh ở lại và thử lộ trình này.', pm: 'idle', npc: 'agree', npcFace: 'face_grin' },
                  { who: 'PM', text: 'Cảm ơn anh. Mình cùng làm cho lộ trình này thành thật nhé.', pm: 'talk', face: 'face_happy' },
                ],
                effects: { team_morale: 10, management_trust: 5 },
                flags: ['key_developer_retained'],
                delayed: [{ at: 'P3_S09_PRODUCTION_INCIDENT', note: 'Huy ở lại dự án và cùng team khoanh vùng lỗi backend.' }],
                result: 'Huy ở lại với lộ trình Technical Lead: sở hữu kiến trúc và mentor team. Tinh thần đội ngũ tăng, quản lý ghi nhận cách giữ người bằng phát triển nghề nghiệp.',
                after: { pm: 'jump', then: 'good' },
              },
              {
                id: 'C2', label: 'Thương lượng thất bại',
                lines: [
                  { who: 'HUY', text: 'Anh trân trọng đề xuất, nhưng anh quyết định nhận offer mới.', pm: 'idle', npc: 'sigh', npcFace: 'face_apologetic' },
                  { who: 'PM', text: 'Em tôn trọng quyết định của anh. Mình lên kế hoạch bàn giao nhé.', pm: 'talk', face: 'face_sad' },
                ],
                effects: { budget: -10, project_progress: -10, team_morale: -5 }, add: { team_size: -1 },
                flags: ['key_developer_left'],
                delayed: [{ at: 'P3_S09_PRODUCTION_INCIDENT', ifChoice: 'B', effects: { project_progress: -5, project_risk: 10 },
              note: 'Huy đã nghỉ: một developer xử lý một mình, không còn ai nắm kiến trúc để khoanh vùng nhanh.' }],
                result: 'Lộ trình đến quá muộn so với áp lực team đang chịu. Huy nhận offer mới; dự án phát sinh chi phí tuyển dụng và bàn giao, tiến độ và tinh thần giảm.',
                after: { pm: 'sigh' },
              },
            ],
          },
        ],
        // Ket canh sau moi nhanh: PM ngoi lai ban lam viec
        outro: {
          hideCast: true, pm: 'desk_type',
          lines: [
            { who: 'SYS', text: 'Giữ người không chỉ là quyết định về tiền.', pm: 'desk_type' },
            { who: 'PM', text: 'Bài học đắt giá...', pm: 'desk_type', face: 'face_thinking' },
            { who: 'NARR', text: 'Bốn ngày sau, khách hàng gửi phản hồi về chức năng mới.', pm: 'desk_type' },
          ],
        },
        next: 'P2_S08_CUSTOMER_COMPLAINT',
      },

      {
        id: 'P2_S08_CUSTOMER_COMPLAINT', no: 'S08', day: 30, title: 'Khách hàng complain',
        place: 'Cuộc họp với khách hàng', bg: 'client_meeting', cast: ['HIEP', 'LAN', 'HUY'],
        open: [
          { who: 'HIEP', text: 'Kết quả không giống cách bên anh hiểu. Bên em giải quyết thế nào?', pm: 'idle', npc: 'stern', npcFace: 'face_annoyed' },
          { who: 'LAN', text: 'Requirement có một câu hiểu được theo hai cách.', pm: 'nod', npc: 'caution', npcFace: 'face_cautious' },
          { who: 'PM', text: 'Không phải lúc tranh luận ai đúng ai sai...', pm: 'tab_read', face: 'face_thinking' },
        ],
        // Bien the 1: Huy tu quyet khong kiem soat (S02 B) hoac nhan them tinh nang chua estimate (S03 A)
        variants: {
          requirement_changed_without_confirmation: [
            { who: 'HIEP', text: 'Chức năng này chạy khác với cách bên anh đã yêu cầu.', pm: 'idle', npc: 'stern', npcFace: 'face_angry' },
            { who: 'HUY', text: 'Team đổi cách xử lý để kịp demo nhưng chưa ghi nhận thành requirement.', pm: 'nod', npc: 'sigh', npcFace: 'face_apologetic' },
            { who: 'PM', text: 'Không phải lúc tranh luận ai đúng ai sai...', pm: 'tab_read', face: 'face_thinking' },
          ],
        },
        question: 'Bạn sẽ xử lý tranh chấp trách nhiệm này như thế nào?',
        choices: [
          {
            id: 'A', label: 'Khẳng định team đã làm đúng tài liệu', hint: 'Dựa vào tài liệu: yêu cầu này là thay đổi mới.',
            lines: [
              { who: 'PM', text: 'Team đã làm đúng tài liệu. Yêu cầu này là thay đổi mới.', pm: 'doc_raise', face: 'face_stern' },
              { who: 'HIEP', text: 'Anh không chấp nhận việc đẩy hết trách nhiệm sang khách hàng.', pm: 'crossarms', npc: 'stern', npcFace: 'face_angry' },
            ],
            effects: { client_trust: -20, management_trust: -5, project_risk: 5 },
            competency: { STAKEHOLDER: 0, SCOPE: 1 },
            result: 'Team bảo vệ được lập luận dựa trên tài liệu. Cuộc họp chuyển thành tranh luận câu chữ. Niềm tin khách hàng và quản lý giảm. Giải pháp thực tế chưa được thống nhất.',
            after: { pm: 'crossarms' },
          },
          {
            id: 'B', label: 'Nhận toàn bộ lỗi và sửa miễn phí', hint: 'Nhận lỗi về phía team, sửa theo ý khách, không tính phí.',
            lines: [
              { who: 'PM', text: 'Bên em nhận lỗi và sửa miễn phí theo ý anh.', pm: 'bow', face: 'face_apologetic' },
              { who: 'LAN', text: 'Không làm rõ requirement thì lần sau vẫn sẽ hiểu sai.', pm: 'idle', npc: 'worry', npcFace: 'face_worried' },
            ],
            effects: { client_trust: 10, budget: -10, project_progress: -5, team_morale: -5 },
            competency: { STAKEHOLDER: 2, RESOURCE: 1 },
            result: 'Khách hàng hài lòng vì yêu cầu được chấp nhận. Team chịu toàn bộ effort và chi phí của phần mơ hồ. Tiến độ và tinh thần team giảm. Tranh chấp hiện tại được dập tắt nhưng nguyên nhân chưa được quản lý.',
            after: { pm: 'sigh' },
          },
          {
            id: 'C', label: 'Làm rõ kỳ vọng và chia sẻ trách nhiệm', hint: 'Team chịu phần làm rõ tài liệu, phần mở rộng làm change request.',
            lines: [
              { who: 'PM', text: 'Phần làm rõ tài liệu team chịu. Phần mở rộng mình làm change request.', pm: 'count', face: 'face_confident' },
              { who: 'HIEP', text: 'Anh đồng ý, miễn là trách nhiệm hai bên rõ ràng.', pm: 'nod', npc: 'nod', npcFace: 'face_cooperative' },
            ],
            effects: { client_trust: 10, management_trust: 5, project_progress: -5, project_risk: -5 },
            flags: ['complaint_resolved_collaboratively'], competency: { STAKEHOLDER: 3, SCOPE: 3 },
            result: 'Kỳ vọng thực tế được làm rõ. Các bên cùng chịu trách nhiệm cho phần mơ hồ. Tiêu chí nghiệm thu và cách quản lý thay đổi được thống nhất. Tiến độ giảm nhẹ để xử lý có cấu trúc.',
            after: { pm: 'good' },
          },
        ],
        next: 'P2_SUMMARY',
      },
    ],

    // Tong ket Level 2 (tai lieu muc 5 – Tong ket Level 2): phong Anh Minh
    summary: {
      id: 'P2_SUMMARY', bg: 'manager_office', cast: ['MINH'],
      // ctx = { risk, budget, dangers, zeroRating, metrics, flags, choices } (summary.ts). Xet tu tren xuong.
      // Nguy co mat kiem soat: tu 3 trong 4 dau hieu – team qua tai (OT), nhan su chu chot roi di, chat luong bi cat giam
      // (bo regression), tranh chap khach hang chua giai quyet (S08 A: chi khang dinh dung tai lieu)
      tiers: [
        { id: 'lost', label: 'Nguy cơ mất kiểm soát', mood: 'bad',
          when: { atLeast: 3, of: [{ flag: 'team_ot_14_days' }, { flag: 'key_developer_left' }, { flag: 'regression_test_skipped' },
            { choice: 'P2_S08_CUSTOMER_COMPLAINT', is: 'A' }] } },
        { id: 'caution', label: 'Cần thận trọng', mood: 'mid',
          when: { any: [{ var: 'dangers', gte: 1 }, { var: 'metrics.client_trust', lt: 40 }, { var: 'risk', gte: 50 }] } },
        // khong OT, release co kiem soat, giu duoc Huy (da loai key_developer_left o tren), complain xu ly hop tac, rui ro < 40
        { id: 'excellent', label: 'Hòa nhập xuất sắc', mood: 'good',
          when: { all: [{ any: [{ flag: 'release_delayed_for_quality' }, { flag: 'partial_release_used' }] }, { flag: 'key_developer_retained' },
            { flag: 'complaint_resolved_collaboratively' }, { var: 'risk', lt: 40 }] } },
        { id: 'stable', label: 'Hòa nhập ổn định', mood: 'good' },
      ],
      // Dau hieu "Can than trong" -> rui ro se quay lai o Level 3
      dangerFlags: {
        team_ot_14_days: 'Team vừa qua hai tuần OT, dấu hiệu quá tải đã xuất hiện.',
        regression_test_skipped: 'Bản release bỏ vòng regression; lỗi luồng cũ có thể lọt lên production.',
        key_developer_left: 'Huy rời dự án; team mất người hiểu hệ thống sâu nhất.',
      },
      comments: {
        good: [
          { who: 'MINH', text: 'Em đã biết quản lý đánh đổi thay vì chỉ phản ứng với từng yêu cầu.', pm: 'nod', npc: 'satisfied', npcFace: 'face_approving' },
          { who: 'PM', text: 'Em sẽ giữ cách làm này khi áp lực tăng lên.', pm: 'good', face: 'face_happy' },
          { who: 'NARR', text: 'Hết 30 ngày. Giai đoạn Bứt phá bắt đầu — khủng hoảng thật sự đang tới.', pm: 'idle' },
        ],
        mid: [
          { who: 'MINH', text: 'Dự án vẫn chạy, nhưng đang dựa nhiều vào nỗ lực cá nhân.', pm: 'nod', npc: 'concern', npcFace: 'face_concerned' },
          { who: 'PM', text: 'Em sẽ giảm bớt phụ thuộc vào nỗ lực cá nhân.', pm: 'nod', face: 'face_determined' },
          { who: 'NARR', text: 'Hết 30 ngày. Giai đoạn Bứt phá bắt đầu — khủng hoảng thật sự đang tới.', pm: 'idle' },
        ],
        bad: [
          { who: 'MINH', text: 'Tiến độ tăng, nhưng team và chất lượng đang phải trả giá.', pm: 'nod', npc: 'disappoint', npcFace: 'face_disappointed' },
          { who: 'PM', text: 'Em hiểu. Em phải xử lý trước khi thành sự cố.', pm: 'bad', face: 'face_worried' },
          { who: 'NARR', text: 'Hết 30 ngày. Giai đoạn Bứt phá bắt đầu — khủng hoảng thật sự đang tới.', pm: 'idle' },
        ],
      },
    },
  },

  // Noi dung Level 3 – But pha (docs/KICH_BAN_ROLECRAFT_PM60.md muc 6; thoai rut gon = THOAI_MAU.json).
  // - Khong co canh mo dau: the Level roi vao thang S09 (dong dan truyen "LEVEL 3 · ..." hien bang the Level, `lead`).
  // - `absent`: NPC vang mat tu level nay khi co co (Huy nghi o S07 -> khong con trong canh; tai lieu muc 2).
  // - Tinh huong `laterAt`: so dong mo canh noi truoc loi bao hau qua tri hoan (S09: bao su co truoc, roi hau qua cu).
  // - Dong thoai `react`: dong tac cua NPC khong noi (nhanh cua Level 3 chi co PM + dan truyen).
  // - Tong ket khong co nhan xet cua Anh Minh; hien cac hau qua da quay lai tu giai doan truoc (tai lieu muc 6 – Tong ket).
  // Diem lech tai lieu: "Dieu kien mo man" o S10 va "Modifier" o S10 la ban chep lai cua S09 -> chi ap o S09 theo ma tran muc 8.
  {
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
              { who: 'NARR', text: 'Team được bảo vệ, nhưng cơ hội bị bỏ lỡ.', pm: 'sigh', react: { MINH: 'sigh' } },
            ],
            effects: { team_morale: 10, management_trust: -10, project_risk: -5 },
            competency: { RESOURCE: 2, STAKEHOLDER: 1 },
            result: 'Team được bảo vệ nhưng cơ hội kinh doanh bị từ chối hoàn toàn.',
            after: { pm: 'sigh' },
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
          when: { any: [{ var: 'dangers', gte: 3 }, { var: 'risk', gte: 70 }, { var: 'metrics.team_morale', lt: 30 }, { var: 'metrics.client_trust', lt: 30 }] } },
        { id: 'caution', label: 'Cần thận trọng', mood: 'mid',
          when: { any: [{ var: 'dangers', gte: 1 }, { var: 'risk', gte: 50 }, { flag: 'incident_severity_high' }] } },
        { id: 'excellent', label: 'Bứt phá xuất sắc', mood: 'good', when: { all: [{ not: { var: 'zeroRating' } }, { var: 'risk', lt: 30 }] } },
        { id: 'stable', label: 'Bứt phá vững vàng', mood: 'good' },
      ],
      // Co Level 3 de lai hau qua o Level 4 (ma tran muc 8)
      dangerFlags: {
        sales_deadline_accepted: 'Đã nhận deadline mười ngày của Sales, áp lực dồn hết lên team.',
        junior_publicly_blamed: 'Nam bị phê bình trước team; mọi người ngại báo sai sót.',
        process_gap_unresolved: 'Nguyên nhân lỗi push nhầm chưa được xử lý; lỗi quy trình có thể tái diễn.',
        large_project_without_resources: 'Nhận dự án lớn khi chưa có thêm nguồn lực; team dễ quá tải.',
      },
    },
  },

  // Noi dung Level 4 – Thu hoach (docs/KICH_BAN_ROLECRAFT_PM60.md muc 7; thoai rut gon = THOAI_MAU.json) + ket thuc campaign (muc 9).
  // - `final`: level cuoi – khong co tong ket level, thay bang ket qua campaign (campaign.ts) + man bao cao cuoi.
  // - Dong thoai `unlessFlag`: an khi co co (vd S13 C: Nam bi phe binh truoc team -> thay cau hang hai bang cau e de).
  // - Dong thoai `when`: dieu kien theo chi so / nhieu co (S16: bang chung va canh bao truoc buoi review).
  // - Dong thoai `alt`: { HUY: '...' } – Huy da nghi (absent): cau cua Huy thanh thong bao thieu nhan su chu chot, cau nhac
  //   ten Huy doi noi dung (tai lieu muc 2: thoai cua Huy o L3–L4 thay bang thong bao thieu nhan su chu chot).
  // - Dong thoai `answer`: phan bien S16 tra loi theo hanh trinh that (game/levels.ts: answerText); khong khop -> cau mau.
  // - Tinh huong `alias`: bo dong tac PM rieng cho canh (S16 mac vest: di, dung, noi).
  // Nang luc cua moi lua chon Level 4 la DE XUAT trong tai lieu (V2 chua gan).
  {
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
        place: 'Phòng họp với khách hàng', bg: 'client_meeting', cast: ['HIEP', 'LINH', 'LAN', 'HUY'],
        open: [
          { who: 'HIEP', text: 'Bên anh muốn mở rộng thêm module báo cáo và luồng phê duyệt.', pm: 'idle', npc: 'pleased', npcFace: 'face_eager' },
          { who: 'LINH', text: 'Cơ hội tốt! Team xác nhận để chị làm báo giá nhé.', pm: 'idle', npc: 'cheer', npcFace: 'face_excited' },
          { who: 'LAN', text: 'Phạm vi mới chỉ là mong muốn, chưa có tiêu chí nghiệm thu.', pm: 'idle', npc: 'caution', npcFace: 'face_cautious' },
          { who: 'HUY', ifFlag: 'large_project_without_resources', text: 'Team đang chia nguồn lực cho dự án lớn vừa nhận. Nếu thêm module này mà không điều chỉnh ưu tiên, cả ba kế hoạch sẽ cùng bị ảnh hưởng.', pm: 'startle', npc: 'warn', npcFace: 'face_worried',
            alt: { HUY: 'Không còn Huy để cân đối phần kỹ thuật: team đang chia người cho dự án lớn vừa nhận, thêm module sẽ ảnh hưởng cả ba kế hoạch.' } },
          { who: 'LAN', ifFlag: 'key_developer_left', text: 'Hiện tại team chưa có người thay thế hoàn toàn phần kỹ thuật chủ chốt. Việc mở rộng cần thêm thời gian đánh giá năng lực thực thi.', pm: 'startle', npc: 'worry', npcFace: 'face_worried' },
          { who: 'PM', text: 'Cơ hội lớn, nhưng nhận thế nào cho an toàn?', pm: 'sigh', face: 'face_thinking' },
        ],
        question: 'Bạn sẽ phản hồi đề nghị mở rộng như thế nào?',
        choices: [
          {
            id: 'A', label: 'Nhận toàn bộ phạm vi để giữ cơ hội', hint: 'Nhận hết ngay, chi tiết làm rõ dần trong lúc triển khai.',
            lines: [
              { who: 'PM', text: 'Bên em nhận toàn bộ, chi tiết làm rõ dần trong lúc triển khai.', pm: 'thumbs', face: 'face_happy', react: { HIEP: 'pleased', LINH: 'cheer' } },
              { who: 'HUY', text: 'Mình đang cam kết khi chưa biết hết phạm vi tích hợp.', pm: 'startle', npc: 'warn', npcFace: 'face_worried',
                alt: { HUY: 'Thiếu người nắm kiến trúc: chưa ai đánh giá được phạm vi tích hợp.' } },
            ],
            effects: { budget: 25, client_trust: 10, team_morale: -15, project_risk: 20 },
            flags: ['expansion_unscoped'], competency: { SCOPE: 0, STAKEHOLDER: 1 },
            delayed: [{ at: 'P4_S16_FINAL_REVIEW', effects: { project_risk: 10 },
              note: 'Đã cam kết thêm phạm vi chưa được đánh giá: rủi ro tăng ngay trước buổi review.' }],
            result: 'Cơ hội kinh doanh được giữ ngay lập tức. Khách hàng hài lòng vì nhận được cam kết nhanh. Phạm vi, effort và phụ thuộc chưa được xác minh. Team tiếp tục gánh rủi ro từ cam kết kinh doanh.',
            after: { pm: 'sigh' },
          },
          {
            id: 'B', label: 'Khảo sát lại và gửi roadmap sau', hint: 'Khảo sát ba ngày rồi gửi roadmap và estimate.',
            lines: [
              { who: 'PM', text: 'Bên em đề xuất khảo sát ba ngày, sau đó gửi roadmap và estimate.', pm: 'talk', face: 'face_serious' },
              { who: 'HIEP', text: 'Được, nhưng anh cần mốc cụ thể để trình ngân sách.', pm: 'idle', npc: 'nod', npcFace: 'face_conditional' },
            ],
            effects: { project_progress: -5, client_trust: 5, management_trust: 5, project_risk: -10 },
            flags: ['expansion_roadmap_created'], competency: { SCOPE: 2, STAKEHOLDER: 2 },
            result: 'Phạm vi được khảo sát trước khi ký cam kết. Team có thời gian đánh giá kỹ thuật và nguồn lực. Khách hàng phải chờ thêm trước khi có kế hoạch triển khai chính thức. Rủi ro giảm nhưng tốc độ chốt cơ hội chậm hơn.',
            after: { pm: 'nod' },
          },
          {
            id: 'C', label: 'Chia phase và chốt phạm vi ưu tiên', hint: 'Phase 1 làm luồng ưu tiên, Phase 2 mở rộng sau nghiệm thu.',
            lines: [
              { who: 'PM', text: 'Chia hai phase: Phase 1 làm luồng báo cáo ưu tiên, Phase 2 mở rộng sau nghiệm thu.', pm: 'count', face: 'face_confident' },
              { who: 'LINH', text: 'Chị tách báo giá theo từng phase cho khách dễ duyệt.', pm: 'idle', npc: 'agree', npcFace: 'face_charming' },
              { who: 'HIEP', ifFlag: 'mvp_plan_agreed', text: 'Cách chia phase này giống phương án MVP trước và bên anh thấy hiệu quả. Anh đồng ý nếu tiêu chí nghiệm thu của từng phase được ghi rõ.', pm: 'nod', npc: 'pleased', npcFace: 'face_satisfied' },
            ],
            effects: { budget: 10, project_progress: 5, client_trust: 15, management_trust: 5, project_risk: -5 },
            flags: ['expansion_phased'], competency: { SCOPE: 3, STAKEHOLDER: 3 },
            result: 'Khách hàng nhận được giá trị sớm với phạm vi rõ ràng. Sales có cơ sở chốt hợp đồng theo giai đoạn. Team kiểm soát được capacity và chất lượng. Roadmap mở rộng vẫn được duy trì.',
            after: { pm: 'nod' },
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
          { who: 'SYS', title: 'Cảnh báo burnout', when: { all: [{ flag: 'team_ot_14_days' }, { var: 'metrics.team_morale', lt: 40 }] },
            text: 'Team từng OT kéo dài và tinh thần hiện dưới 40%: báo cáo gắn cảnh báo nguy cơ burnout.', pm: 'reflect' },
          { who: 'SYS', title: 'Hội đồng yêu cầu giải trình', ifFlag: 'process_gap_unresolved',
            text: 'Lỗi quy trình sau sự cố push nhầm code (ngày 41) vẫn chưa được xử lý.', pm: 'reflect' },
          { who: 'SYS', title: 'Bằng chứng tích cực', when: { any: [{ flag: 'process_standardized' }, { flag: 'team_ownership' }] },
            text: 'Team đã có quy trình và người chịu trách nhiệm cho từng phần vận hành.', pm: 'reflect' },
          { who: 'SYS', title: 'Bằng chứng tích cực', when: { any: [{ flag: 'development_plan_created' }, { flag: 'ownership_delegated' }] },
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
        // Phan bien sau moi nhanh: cau hoi co dinh; PM tra loi theo hanh trinh that (answer), khop mau thi dung cau mau
        outro: {
          pm: 'reflect',
          lines: [
            { who: 'HA', text: 'Quyết định nào trong 60 ngày tạo ra ảnh hưởng lớn nhất, và vì sao?', pm: 'reflect', npc: 'talk', npcFace: 'face_probing' },
            { who: 'PM', text: 'Quyết định chia phase với khách hàng: giữ được cơ hội mà team không quá tải.', pm: 'answer', face: 'face_formal_confident',
              // quyet dinh tot nhat trong bao cao; trung cau mau (S15 C) thi giu cau mau
              answer: { from: 'best', unless: { all: [{ var: 'd.no', eq: 'S15' }, { var: 'd.choice', eq: 'C' }] },
                text: 'Quyết định "{d.label}" khi {d.title|lower}: {d.result|firstSentence|lower}' } },
            { who: 'HA', text: 'Nếu được làm lại một quyết định, em sẽ thay đổi điều gì?', pm: 'reflect', npc: 'talk', npcFace: 'face_questioning' },
            { who: 'PM', text: 'Em sẽ làm rõ phạm vi sớm hơn, trước khi hứa với khách hàng.', pm: 'reflect', face: 'face_formal_neutral',
              // quyet dinh kem nhat; khong co quyet dinh kem (diem >= 2) hoac la hoi han ve pham vi (cau mau) thi giu cau mau
              answer: { from: 'worst', unless: { any: [{ var: 'd.avg', gte: 2 }, { var: 'd.id', in: ['P1_S03_SCOPE_CHANGE', 'P3_S10_SALES_OVERCOMMIT', 'P4_S15_CLIENT_EXPANSION'] }] },
                text: 'Em sẽ không chọn "{d.label}" khi {d.title|lower} nữa, mà cân nhắc tác động lên team và khách hàng trước.' } },
            { who: 'HA', text: 'Team hiện tại có vận hành được mà không cần em không?', pm: 'reflect', npc: 'talk', npcFace: 'face_skeptical' },
            { who: 'PM', text: 'Đã có quy trình và người phụ trách từng phần, team có thể tự vận hành.', pm: 'answer', face: 'face_formal_confident',
              answer: { unless: { any: [{ flag: 'process_standardized' }, { flag: 'team_ownership' }, { flag: 'ownership_delegated' }] },
                text: 'Chưa hẳn. Vài khâu vẫn phụ thuộc vào em; 30 ngày tới em sẽ chuẩn hóa và trao quyền cho từng người.' } },
            { who: 'HA', text: 'Ba ưu tiên của em trong 90 ngày tới là gì?', pm: 'reflect', npc: 'talk', npcFace: 'face_listening' },
            { who: 'PM', text: 'Ổn định Phase 1, chuyển giao review cho team, và đo chất lượng sau mỗi release.', pm: 'answer', face: 'face_formal_confident',
              answer: { unless: { flag: 'expansion_phased' }, text: 'Ổn định bản release hiện tại, chuyển giao review cho team, và đo chất lượng sau mỗi release.' } },
            { who: 'NARR', text: 'Chị Hà và Anh Minh trao đổi với nhau...', pm: 'wait', react: { MINH: 'think', HA: 'listen' } },
          ],
        },
        next: 'P4_CAMPAIGN_RESULT',
      },
    ],

    // Ket qua campaign (muc 9): Anh Minh + Chi Ha cong bo ket qua; ma ket qua theo campaign.ts (ENDINGS)
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
          { who: 'HA', text: 'Chị sẽ hỗ trợ em các thủ tục kết thúc thử việc.', pm: 'sigh', npc: 'sympathetic', npcFace: 'face_sympathetic' },
          { who: 'PM', text: 'Em hiểu ạ. Cảm ơn anh đã cho em cơ hội.', pm: 'fail', face: 'face_sad' },
          { who: 'NARR', text: 'Ôm thùng đồ ra cửa...', pm: 'fail', exit: 'leave' },
        ],
      },
    },
  },
];
export default LEVELS;

// Noi dung Level 2 – Hoa nhap (docs/KICH_BAN_ROLECRAFT_PM60.md muc 5; thoai rut gon = THOAI_MAU.json).
// Cung dinh dang voi level1.js (xem chu thich dau file do); them rieng cho Level 2:
// - Dong thoai `ifFlag`: chi hien khi co co do (bien the thoai theo co, vd Huy o S07).
// - Tinh huong `variants`: mo canh thay the khi hau qua tri hoan dat bien the (run.variants, vd S08 bien the 1).
// - Lua chon `join`: NPC buoc vao canh truoc thoai nhanh (vd Anh Minh o S07 B).
// - Lua chon `outcomes`: ket qua re nhanh theo lich su phien choi (rules.js: resolveOutcome), vd S07 C -> C1 / C2.
// - `outro` (lua chon hoac tinh huong): canh ket sau bang ket qua { lines, pm, night, hideCast }.
// - `prelude`: canh chuyen truoc mo dau level khi co co (vd pm_overloaded: ngu guc tren ban).
// - `tired`: co lam PM met tu level nay (dong tac idle/talk/walk -> tired_*, HUONG_DAN_KICH_BAN.md muc 7).
// Hieu ung tai nguyen (team_size -1) nam o `add`, khong o `effects` (chi so).

// Huy o lai (S07 A / C1) -> S09: Huy cung team xu ly incident (tai lieu muc 8)
const RETAINED = 'Huy ở lại dự án và cùng team khoanh vùng lỗi backend.';

export const LEVEL2 = {
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
      place: 'Phòng họp nội bộ', bg: 'internal_meeting', cast: ['MINH', 'HUY', 'NAM'], enter: 'meet_table_listen',
      open: [
        { who: 'MINH', text: 'Dự án B cần demo sau hai tuần, dự án A vẫn giữ mốc release.', pm: 'meet_table_listen', npc: 'emph', npcFace: 'face_explain' },
        { who: 'HUY', text: 'Anh mà chuyển sang B thì backend của A thiếu người review.', pm: 'meet_table_listen', npc: 'warn', npcFace: 'face_worried' },
        { who: 'PM', text: 'Hai dự án, vẫn chỉ ba người...', pm: 'meet_table_worry', face: 'face_stressed' },
      ],
      question: 'Bạn sẽ xử lý xung đột nguồn lực giữa hai dự án như thế nào?',
      choices: [
        {
          id: 'A', label: 'Thuê Freelancer hỗ trợ', hint: 'Thuê người ngoài cho các việc độc lập của dự án B.',
          lines: [
            { who: 'PM', text: 'Thuê một Freelancer cho các việc độc lập của dự án B.', pm: 'meet_table_present', face: 'face_confident' },
            { who: 'HUY', text: 'Được, nhưng team vẫn mất thời gian onboarding và review.', pm: 'meet_table_listen', npc: 'explain', npcFace: 'face_thinking' },
          ],
          effects: { budget: -25, project_progress: 15, project_risk: 5 },
          flags: ['freelancer_hired'], competency: { RESOURCE: 2, DECISION: 2 },
          result: 'Team có thêm năng lực thực thi. Tiến độ hai dự án được hỗ trợ. Ngân sách giảm đáng kể. Team phát sinh thêm effort onboarding và kiểm soát chất lượng.',
          after: { pm: 'meet_table_agree' },
        },
        {
          id: 'B', label: 'Cho team OT trong hai tuần', hint: 'Cả team chia ca, làm thêm giờ để giữ cả hai deadline.',
          lines: [
            { who: 'PM', text: 'Hai tuần tới cả team chia ca và OT để giữ cả hai deadline.', pm: 'meet_table_talk', face: 'face_determined' },
            { who: 'NAM', text: 'Em sẽ cố, nhưng team đã căng từ đợt demo trước.', pm: 'meet_table_listen', npc: 'uneasy', npcFace: 'face_tired' },
          ],
          effects: { project_progress: 20, team_morale: -20, project_risk: 10 },
          flags: ['team_ot_14_days'], competency: { RESOURCE: 0, PEOPLE: 0 },
          result: 'Tiến độ tăng nhanh mà không cần thuê thêm người. Team mất thời gian nghỉ và bắt đầu có dấu hiệu quá tải. Rủi ro lỗi và mất nhân sự tăng.',
          after: { pm: 'meet_table_worry' },
          // THOAI_MAU.json: FLAG | team_ot_14_days – hai tuan OT, ca team o lai toi muon
          outro: { night: true, pm: 'meet_table_worry', lines: [{ who: 'NARR', text: 'Hai tuần OT liên tục. Cả team kiệt sức.', pm: 'meet_table_worry' }] },
        },
        {
          id: 'C', label: 'Đàm phán lại mức ưu tiên với quản lý', hint: 'Ưu tiên release A; dự án B bắt đầu bằng discovery và backlog.',
          lines: [
            { who: 'PM', text: 'Ưu tiên release A. Dự án B bắt đầu bằng discovery và backlog.', pm: 'meet_table_present', face: 'face_confident' },
            { who: 'MINH', text: 'Vậy B sẽ không có demo đầy đủ sau hai tuần.', pm: 'meet_table_listen', npc: 'think', npcFace: 'face_thinking' },
          ],
          effects: { management_trust: 10, project_progress: -5, client_trust: -3, project_risk: -5 },
          flags: ['priority_negotiated'], competency: { RESOURCE: 3, STAKEHOLDER: 3 },
          result: 'Nguồn lực được phân bổ có chủ đích. Một phần kế hoạch bị chậm để giảm rủi ro tổng thể. Quản lý ghi nhận khả năng trình bày đánh đổi. Khách hàng chịu một mức chậm nhỏ ở đầu kỳ.',
          after: { pm: 'meet_table_agree' },
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
            { who: 'HIEP', text: 'Anh cần chắc ba ngày này thực sự giảm được rủi ro.', pm: 'idle', npc: 'talk', npcFace: 'face_skeptical' },
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
      place: 'Phòng họp 1-1', bg: 'senior_desk', cast: ['HUY'], enter: 'oneone_listen',
      open: [
        { who: 'NARR', text: 'Huy xin nói chuyện riêng.', pm: 'oneone_listen' },
        { who: 'HUY', text: 'Anh vừa nhận offer mới, thu nhập cao hơn khoảng 30%.', pm: 'oneone_listen', npc: 'talk', npcFace: 'face_serious' },
        { who: 'HUY', text: 'Việc critical dồn hết vào anh, mà lộ trình thì chưa rõ.', pm: 'oneone_listen', npc: 'sigh', npcFace: 'face_tired' },
        // bien the thoai theo co (tai lieu muc 5 – S07)
        { who: 'HUY', ifFlag: 'team_ot_14_days', text: 'Hai tuần OT vừa rồi là lý do lớn khiến anh cân nhắc. Anh có thể hỗ trợ giai đoạn ngắn, nhưng không muốn đây trở thành cách vận hành bình thường.', pm: 'oneone_worry', npc: 'frown', npcFace: 'face_exhausted' },
        { who: 'HUY', ifFlag: 'senior_restricted', text: 'Anh cũng cảm thấy mình chịu trách nhiệm kỹ thuật nhưng lại không có đủ quyền để quyết định trong phạm vi chuyên môn.', pm: 'oneone_listen', npc: 'defend', npcFace: 'face_defensive' },
        { who: 'HUY', ifFlag: 'senior_has_guardrails', text: 'Cách phân chia quyền quyết định gần đây hợp lý hơn. Nếu có lộ trình Technical Lead rõ ràng, anh sẵn sàng cân nhắc ở lại.', pm: 'oneone_listen', npc: 'explain', npcFace: 'face_thinking' },
        { who: 'PM', text: 'Mất Huy lúc này thì cả dự án chao đảo...', pm: 'oneone_worry', face: 'face_worried' },
      ],
      question: 'Bạn sẽ xử lý đề nghị nghỉ việc của Huy như thế nào?',
      choices: [
        {
          id: 'A', label: 'Dùng ngân sách retention', hint: 'Điều chỉnh quyền lợi cho Huy bằng quỹ dự án.',
          lines: [
            { who: 'PM', text: 'Em đề xuất dùng ngân sách retention để điều chỉnh quyền lợi cho Huy.', pm: 'oneone_show', face: 'face_serious' },
            { who: 'HUY', text: 'Nếu khối lượng việc cũng được kiểm soát, anh sẽ ở lại.', pm: 'oneone_listen', npc: 'nod', npcFace: 'face_relieved' },
          ],
          effects: { budget: -20, team_morale: 10, management_trust: 3 },
          flags: ['key_developer_retained'], competency: { RESOURCE: 2, PEOPLE: 2 },
          delayed: [{ at: 'P3_S09_PRODUCTION_INCIDENT', note: RETAINED }],
          result: 'Huy tiếp tục ở lại dự án. Team ổn định tâm lý. Quỹ dự án giảm đáng kể. Vấn đề phát triển nghề nghiệp mới chỉ được giải quyết một phần.',
          after: { pm: 'oneone_talk' },
        },
        {
          id: 'B', label: 'Chấp nhận cho nghỉ và tuyển người mới', hint: 'Tôn trọng quyết định, lên kế hoạch bàn giao và tuyển thay thế.',
          join: ['MINH'],
          lines: [
            { who: 'PM', text: 'Em tôn trọng lựa chọn của anh. Team sẽ lên kế hoạch bàn giao.', pm: 'oneone_talk', face: 'face_sad' },
            { who: 'MINH', text: 'Rủi ro ngắn hạn rất cao. Dự án phải chạy được khi chưa có người mới.', pm: 'oneone_worry', npc: 'concern', npcFace: 'face_concerned' },
          ],
          effects: { budget: -10, project_progress: -10, team_morale: -5 }, add: { team_size: -1 },
          flags: ['key_developer_left'], competency: { RESOURCE: 1, PEOPLE: 1 },
          delayed: [{ at: 'P3_S09_PRODUCTION_INCIDENT', ifChoice: 'B', effects: { project_progress: -5, project_risk: 10 },
            note: 'Huy đã nghỉ: một developer xử lý một mình, không còn ai nắm kiến trúc để khoanh vùng nhanh.' }],
          result: 'Quyết định của nhân sự được tôn trọng. Team mất người hiểu hệ thống sâu nhất. Tiến độ và tinh thần giảm trong thời gian tuyển thay thế. Dự án phát sinh chi phí tuyển dụng và bàn giao.',
          after: { pm: 'oneone_worry' },
        },
        {
          id: 'C', label: 'Thương lượng career path và technical ownership', hint: 'Đề xuất lộ trình Technical Lead: sở hữu kiến trúc, mentor team.',
          lines: [
            { who: 'PM', text: 'Em đề xuất lộ trình Technical Lead ba tháng: anh sở hữu kiến trúc và mentor team.', pm: 'oneone_show', face: 'face_determined' },
            { who: 'HUY', text: 'Anh quan tâm, nhưng team không được tiếp tục sống bằng OT.', pm: 'oneone_listen', npc: 'think', npcFace: 'face_skeptical' },
          ],
          effects: {}, competency: { PEOPLE: 3, STAKEHOLDER: 2 },
          // IF team_morale >= 55 AND missing_flag(team_ot_14_days) THEN C1 ELSE C2 – xet tren trang thai luc chon
          outcomes: [
            {
              id: 'C1', label: 'Thương lượng thành công', when: run => run.metrics.team_morale >= 55 && !run.flags.team_ot_14_days,
              lines: [
                { who: 'HUY', text: 'Anh ở lại và thử lộ trình này.', pm: 'oneone_listen', npc: 'agree', npcFace: 'face_grin' },
                { who: 'PM', text: 'Cảm ơn anh. Mình cùng làm cho lộ trình này thành thật nhé.', pm: 'oneone_talk', face: 'face_happy' },
              ],
              effects: { team_morale: 10, management_trust: 5 },
              flags: ['key_developer_retained'],
              delayed: [{ at: 'P3_S09_PRODUCTION_INCIDENT', note: RETAINED }],
              result: 'Huy ở lại với lộ trình Technical Lead: sở hữu kiến trúc và mentor team. Tinh thần đội ngũ tăng, quản lý ghi nhận cách giữ người bằng phát triển nghề nghiệp.',
              after: { pm: 'jump', then: 'good' },
            },
            {
              id: 'C2', label: 'Thương lượng thất bại',
              lines: [
                { who: 'HUY', text: 'Anh trân trọng đề xuất, nhưng anh quyết định nhận offer mới.', pm: 'oneone_listen', npc: 'sigh', npcFace: 'face_apologetic' },
                { who: 'PM', text: 'Em tôn trọng quyết định của anh. Mình lên kế hoạch bàn giao nhé.', pm: 'oneone_talk', face: 'face_sad' },
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
    // x = { risk, budget, dangers, zeroRating, metrics, flags, choices } (summary.js). Xet tu tren xuong.
    // Nguy co mat kiem soat: tu 3 trong 4 dau hieu – team qua tai (OT), nhan su chu chot roi di, chat luong bi cat giam
    // (bo regression), tranh chap khach hang chua giai quyet (S08 A: chi khang dinh dung tai lieu)
    tiers: [
      { id: 'lost', label: 'Nguy cơ mất kiểm soát', mood: 'bad',
        when: x => [x.flags.team_ot_14_days, x.flags.key_developer_left, x.flags.regression_test_skipped,
          x.choices.P2_S08_CUSTOMER_COMPLAINT === 'A'].filter(Boolean).length >= 3 },
      { id: 'caution', label: 'Cần thận trọng', mood: 'mid',
        when: x => x.dangers >= 1 || x.metrics.client_trust < 40 || x.risk >= 50 },
      // khong OT, release co kiem soat, giu duoc Huy (da loai key_developer_left o tren), complain xu ly hop tac, rui ro < 40
      { id: 'excellent', label: 'Hòa nhập xuất sắc', mood: 'good',
        when: x => (x.flags.release_delayed_for_quality || x.flags.partial_release_used) && x.flags.key_developer_retained
          && x.flags.complaint_resolved_collaboratively && x.risk < 40 },
      { id: 'stable', label: 'Hòa nhập ổn định', mood: 'good', when: () => true },
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
};

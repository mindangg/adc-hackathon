# ADC Hackathon 2026 – Capy đọc slide cuộc họp

Sản phẩm chính: Chrome extension (`extension/`, WXT) giúp người khiếm thị theo kịp slide được chia sẻ trong cuộc họp trực tuyến (Stage 5). Chụp vùng chia sẻ màn hình → `app/api/slide` (Next.js + OpenAI) mô tả 2 lớp (tóm tắt / chi tiết) hoặc trả lời câu hỏi → đọc qua screen reader của người dùng.
- `extension/capysub/`: tính năng dịch phụ đề YouTube cũ của Capy, đang ẩn (không build).
- Phần Career Navigator cũ (`app/page.tsx`, `app/api/chat|analyze|cv`) không còn là trọng tâm.

## Bảo mật
- KHÔNG đọc, in ra, hay commit file chứa secret: `.env`, `.env.*` (trừ `.env.example`), key, token, credential.
- Cần biết biến môi trường nào → xem `.env.example`.

## Git
- KHÔNG thêm dòng `Co-Authored-By: Claude` (hay bất kỳ attribution Claude nào) vào commit message hoặc PR.

## Quy ước
- Accessibility là mặc định: mọi thay đổi UI phải dùng được bằng bàn phím và screen reader (VoiceOver/NVDA).
- Không tự làm TTS; không stream text vào vùng `aria-live`.
- Chỉ gợi ý công cụ có trong `data/tools.json`; không gợi ý nghề dựa trên khuyết tật.

## Nghiên cứu
- `docs/pitch-and-ideas.md` – câu chuyện pitch, stage phù hợp, hướng sản phẩm (đọc trước tiên).
- `research/reports/` – báo cáo tổng hợp 6 stage (có nguồn).
- `research/research_notes/` – ghi chú gốc theo từng stage.
- `media/` – ảnh chụp đề bài (competition brief).

# ADC Hackathon 2026 – Career Navigator

Web app hỗ trợ người khiếm thị: trò chuyện → hồ sơ nghề nghiệp → 3 hướng đi → CV Word. Next.js + Claude API.

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
- `research/reports/` – báo cáo tổng hợp 6 stage (có nguồn).
- `research/research_notes/` – ghi chú gốc theo từng stage.
- `media/` – ảnh chụp đề bài (competition brief).

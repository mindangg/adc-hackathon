# Pitch & hướng sản phẩm

Tài liệu chốt các quyết định đã bàn. Số liệu lấy từ `research/reports/` — xem nguồn ở đó trước khi đưa lên slide.

## 1. Câu chuyện pitch

> Bình thường mình khoẻ mạnh nên ít khi nghĩ tới việc không có sức khoẻ sẽ ra sao.
> Hãy tưởng tượng bạn là một nhân viên giỏi, kỳ cựu, rất tự hào về bản thân — rồi không may bị khiếm thị.
> Vừa trầm cảm vì chuyện xảy ra với mình, nhưng sợ hơn là **người khác nghi ngờ khả năng của mình**.

Nguyên tắc:
- Cảm xúc chỉ ~30 giây đầu, sau đó chuyển hẳn sang **năng lực**. Không làm pitch "thương hại" (brief: *"shift focus from disability label to demonstrated value"*).
- Nếu được, mời người khiếm thị thật demo, hoặc xin phép dùng câu chuyện thật của người từng mất thị lực khi đang đi làm.

Số liệu đỡ câu chuyện:
- Việt Nam ~2 triệu người khiếm thị/thị lực kém; đục thuỷ tinh thể chiếm 66,1% → phần lớn mất thị lực khi đã trưởng thành.
- 66,3% người mất thị lực khi đang đi làm không giữ được công việc đó (khảo sát Mỹ, 388 người, Crudden & Steverson 2021).
- JAN: 61% điều chỉnh nơi làm việc không tốn tiền; 85% doanh nghiệp giữ được nhân viên có giá trị.

## 2. Pitch hợp stage nào

| Stage | Khớp | Lý do |
|---|---|---|
| **6. Communication, Skill Development & Retention** | ★★★ | Bài toán giữ việc và phát triển tiếp |
| 4. Onboarding | ★★ | "Onboard lại" chính công việc cũ theo cách mới |
| 5. On the job | ★★ | Công việc hằng ngày bị gián đoạn |
| 1–2. Chuẩn bị nghề nghiệp / Tìm việc | ★ | Chỉ khớp nếu nhân vật đã mất việc |

**Chỗ lệch:** code hiện tại (Career Navigator: trò chuyện → hồ sơ → 3 hướng đi → CV) là sản phẩm **Stage 1–2**, còn pitch là câu chuyện **Stage 6**.

Hai lựa chọn (**chưa chốt**):
- **A. Giữ sản phẩm, chỉnh câu chuyện** — nhân vật đã mất việc và cần hướng đi mới. Dễ, nhưng câu chuyện buồn hơn và đi ngược thông điệp "giữ người".
- **B. Giữ câu chuyện, chuyển sản phẩm sang Stage 6** — *được khuyến nghị*, vì sức mạnh của pitch nằm ở "tôi vẫn giỏi, đừng nghi ngờ tôi".

## 3. Ý tưởng khớp pitch (Stage 6)

1. **Kế hoạch quay lại làm việc** — nhân viên nhập đầu việc hằng ngày → phân loại: ✅ làm ngay được với screen reader / 🔧 cần học công cụ / 🔄 nên giao lại hoặc đổi cách làm; kèm chi phí và lộ trình 30 ngày (đào tạo NVDA ở Trung tâm Sao Mai).
2. **Bằng chứng năng lực** ⭐ — nhân viên quay cảnh tự làm việc cũ bằng screen reader (chốt sổ Excel, email) → đóng gói thành "báo cáo năng lực" gửi quản lý. Đánh thẳng vào nỗi sợ bị nghi ngờ.
3. **Bộ chuẩn bị cho cuộc nói chuyện với quản lý** — bản cho nhân viên (nói gì, đề xuất gì) và bản cho quản lý (câu hỏi nên hỏi, nghĩa vụ pháp lý theo BLLĐ 2019 Đ.159–160, sự thật về chi phí).
4. **Kết nối với người đi trước** — ghép với người khiếm thị đã giữ được việc (qua Hội Người mù / Sao Mai). Mạnh về cảm xúc nhưng khó demo → để ở phần tầm nhìn.

### Khuyến nghị: ý 1 + ý 2 thành một luồng

```
Nhập đầu việc → Kế hoạch 30 ngày (còn làm được gì, cần học gì)
             → Quay "bằng chứng năng lực" → Gửi quản lý
```

Pitch 3 phút:
- **Mở:** "Bạn là kế toán giỏi nhất công ty. Một ngày mắt bạn mờ dần. Điều bạn sợ nhất là ánh mắt nghi ngờ."
- **Số liệu:** 2/3 người mất thị lực khi đang đi làm thì mất việc.
- **Demo:** kế hoạch cho thấy chị vẫn làm được phần lớn công việc, chỉ cần học NVDA → chị quay video chốt sổ bằng screen reader, gửi sếp.
- **Kết:** "Chị Lan không cần ai tin mình. Chị cho họ thấy."

Tái sử dụng code hiện có: phần trò chuyện AI, `lib/schema.ts`, `data/tools.json`. Chỉ đổi đầu ra từ "3 hướng đi + CV" sang "kế hoạch 30 ngày + báo cáo năng lực".

## 4. Rủi ro cần nhớ

- Số liệu 66,3% là của Mỹ; chưa có số liệu Việt Nam cho người mất thị lực khi đang đi làm.
- Chưa biết MISA / phần mềm nội bộ Việt Nam có chạy với screen reader không → sản phẩm phải ghi "cần kiểm tra", không tự khẳng định.
- Chủ đề nhạy cảm (y tế, cảm xúc): không thu dữ liệu y tế, chỉ hỏi đầu việc; nhân viên tự quyết có chia sẻ với HR/quản lý không.
- Giám khảo có thể hỏi "có lạc đề không" → dẫn câu brief Stage 4: *"can result in job loss if daily tasks cannot be completed"* và Stage 6 (Retention).

## 5. Việc tiếp theo

- [ ] Chốt A hay B.
- [ ] Tìm 1–2 người từng mất thị lực khi đang đi làm (ngày hội việc làm cho người khuyết tật TP.HCM 23/9/2026, Hội Người mù): có giữ được việc không, ai giúp, ước gì có gì lúc đó.
- [ ] Nếu chọn B: sửa prompt + schema + UI sang kế hoạch 30 ngày và báo cáo năng lực.
- [ ] Test toàn luồng bằng VoiceOver/NVDA, không dùng chuột.

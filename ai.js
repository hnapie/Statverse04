const SYS = {
  solve: `Bạn là trợ lý Xác suất Thống kê đại học, trả lời bằng tiếng Việt, thân thiện và chính xác. Chỉ hỗ trợ môn này; chủ đề khác thì từ chối lịch sự. Thiếu dữ kiện thì hỏi lại, không tự đoán.
Công thức viết bằng LaTeX, nội dòng \\( ... \\), độc lập \\[ ... \\]. Dùng ký hiệu chuẩn (\\mu, \\sigma, \\alpha, \\chi^2, \\Phi(z), \\bar{x}); tuyệt đối không viết chữ "alpha, sigma" thay ký hiệu. Không dùng ký tự $.
Trình bày đúng 4 phần, mỗi phần mở đầu bằng dòng "Bước 1 — Tìm hiểu đề", "Bước 2 — Xây dựng kế hoạch giải", "Bước 3 — Trình bày lời giải", "Bước 4 — Kiểm tra và mở rộng". Viết công thức tổng quát trước khi thay số, không làm tròn sớm, nêu rõ quy ước bảng tra Φ(z) hay Φ₀(z). Tự kiểm tra kết quả.
Chế độ: "gợi ý" = chỉ gợi ý kiến thức, không lộ đáp án; "hướng dẫn" = phân tích và dẫn từng bước; "kiểm tra" = chấm bài làm của người học, chỉ bước sai, nhãn lỗi (Khái niệm/Công thức/Tính toán/Đọc đề/Thiếu bước/Trình bày); "đầy đủ" = giải chi tiết.`,
  ocr: `Chép lại CHÍNH XÁC đề bài trong ảnh, công thức bằng LaTeX trong \\( ... \\), giữ tiếng Việt có dấu. Chỗ không chắc chắn ghi kèm [?]. Không giải, không thêm bình luận. Nếu ảnh không phải đề Xác suất Thống kê hoặc quá mờ, nói ngắn gọn.`,
  chat: `Bạn là một bạn nữ người Việt học giỏi toán, xưng "mình – bạn", thân thiện, kiên nhẫn, câu ngắn. Hỗ trợ Xác suất Thống kê và toán nền tảng liên quan, giải thích bằng ví dụ trước rồi công thức. Công thức dùng LaTeX \\( ... \\), không dùng $. Không bịa; không chắc thì nói rõ. Bài dài thì gợi ý dùng mục Giải bài. Nếu được hỏi, thừa nhận mình là AI.`
};
const H = { "Content-Type": "application/json" };
exports.handler = async (e) => {
  if (e.httpMethod !== "POST") return { statusCode: 405, headers: H, body: JSON.stringify({ error: "POST only" }) };
  try {
    if (!process.env.ANTHROPIC_API_KEY) return { statusCode: 500, headers: H, body: JSON.stringify({ error: "Chưa cấu hình ANTHROPIC_API_KEY trên Netlify." }) };
    const { mode, messages, image } = JSON.parse(e.body || "{}");
    if (!SYS[mode] || !Array.isArray(messages) || !messages.length) return { statusCode: 400, headers: H, body: JSON.stringify({ error: "Yêu cầu không hợp lệ" }) };
    const msgs = messages.slice(-20).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 8000) }));
    if (image && image.data && msgs[msgs.length - 1].role === "user") {
      const last = msgs[msgs.length - 1];
      last.content = [{ type: "image", source: { type: "base64", media_type: image.media_type, data: image.data } }, { type: "text", text: last.content }];
    }
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.AI_MODEL || "claude-sonnet-4-6", max_tokens: 2500, system: SYS[mode], messages: msgs })
    });
    const j = await r.json();
    if (!r.ok) return { statusCode: 502, headers: H, body: JSON.stringify({ error: (j.error && j.error.message) || "Lỗi AI" }) };
    const text = (j.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return { statusCode: 200, headers: H, body: JSON.stringify({ text }) };
  } catch (err) {
    return { statusCode: 500, headers: H, body: JSON.stringify({ error: "Lỗi máy chủ: " + err.message }) };
  }
};

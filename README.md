# STATVERSE – hướng dẫn triển khai
Cấu trúc: `public/` (index.html, config.js, questions.js) · `netlify/functions/ai.js` · `netlify.toml` · `supabase.sql`

1. Supabase: SQL Editor → chạy `supabase.sql`, rồi `supabase_friends.sql`, rồi `supabase_more.sql` (ảnh + cảm xúc); vào Authentication → Providers → Email và TẮT "Confirm email". Lấy Project URL và anon key (Settings → API) → sửa `public/config.js`.
2. GitHub: tạo repo, tải TOÀN BỘ nội dung thư mục `statverse` lên (giữ nguyên cấu trúc thư mục).
3. Netlify: Add new site → Import from GitHub → chọn repo (netlify.toml tự nhận publish=public).
4. Netlify → Site configuration → Environment variables: thêm `ANTHROPIC_API_KEY` (khóa AI, KHÔNG đặt trong code) → Deploys → Trigger deploy.
5. Mở link https (bắt buộc để camera/micro hoạt động). Dùng Chrome/Edge để nhận dạng giọng nói.

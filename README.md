# IPO Challenge Game

Chào mừng bạn đến với **IPO Challenge Game**, một ứng dụng web tìm hiểu về mô trình Input-Process-Output thông qua trò chơi tương tác thú vị.

## 🚀 Hướng dẫn chạy trên máy tính cá nhân (VS Code)

Để chạy ứng dụng này, máy tính của bạn cần cài đặt **Node.js** (Khuyên dùng phiên bản 18 trở lên).

### Bước 1: Chuẩn bị môi trường
1. Tải về và giải nén mã nguồn của trò chơi.
2. Mở thư mục chứa mã nguồn bằng **Visual Studio Code**.

### Bước 2: Cài đặt Dependencies
Mở Terminal trong VS Code (`Ctrl + ` ` hoặc `Terminal` -> `New Terminal`) và chạy lệnh sau để cài đặt các thư viện cần thiết:

```bash
npm install
```

### Bước 3: Chạy ứng dụng ở chế độ Phát triển (Development)
Sau khi cài đặt xong, bạn hãy chạy lệnh sau để khởi động server:

```bash
npm run dev
```

Sau khi chạy lệnh, Terminal sẽ hiển thị một đường dẫn (thường là `http://localhost:3000`). Bạn hãy giữ phím `Ctrl` và click vào đường dẫn đó hoặc copy vào trình duyệt để bắt đầu chơi.

### Bước 4: Deploy lên GitHub Pages
Để tránh lỗi **trắng trang** khi deploy lên GitHub Pages, tôi đã cấu hình `base` trong `vite.config.ts` trùng với tên repository của bạn (`/GameEducation_ArduinoStem/`).

Các bước để push lên Git:
1. Khởi tạo git: `git init`
2. Thêm tất cả file: `git add .`
3. Commit: `git commit -m "Initial commit"`
4. Thêm remote: `git remote add origin https://github.com/LuanNV2k5/GameEducation_ArduinoStem.git`
5. Push: `git push -u origin main`

Để deploy trang web:
1. Cài đặt thư viện gh-pages: `npm install gh-pages --save-dev`
2. Thêm vào `package.json` các script:
   - `"predeploy": "npm run build"`
   - `"deploy": "gh-pages -d dist"`
3. Chạy lệnh: `npm run deploy`

### Bước 5: Xây dựng phiên bản Sản xuất (Production)
Nếu bạn muốn đóng gói ứng dụng để đưa lên server thật, hãy dùng lệnh:

```bash
npm run build
```
Kết quả sẽ nằm trong thư mục `dist/`.

---

## 🛠 Công nghệ sử dụng
- **React 19** & **TypeScript**
- **Vite** (Công cụ xây dựng cực nhanh)
- **Tailwind CSS** & **Motion** (Giao diện hiện đại, mượt mà)
- **Lucide React** (Hệ thống icon)
- **React YouTube** (Tích hợp nhạc nền)

---

## 🎮 Cách chơi
1. **Bắt đầu:** Nhấn nút "BẮT ĐẦU CHƠI". Đừng quên nhấn vào **biểu tượng Loa** ở góc trên bên phải để bật nhạc nền.
2. **Chọn Nhóm:** Nhấp vào thẻ của một Nhóm bất kỳ để bắt đầu lượt chơi.
3. **Trả lời câu hỏi:** Hệ thống sẽ đưa ra câu hỏi trắc nghiệm liên quan đến thiết bị phần cứng.
4. **Sắp xếp IPO:** 
   - Nếu trả lời đúng, bạn sẽ nhận được một **Mảnh ghép**.
   - Kéo và thả mảnh ghép vào đúng ô (Input - Process - Output) trên sơ đồ của nhóm mình.
5. **Chiến thắng:** Nhóm nào hoàn thành đủ cả 5 mảnh ghép (2 Input, 1 Process, 2 Output) đầu tiên sẽ giành chiến thắng!

---
Chúc bạn có những giây phút vừa học vừa chơi thật bổ ích! 🚀

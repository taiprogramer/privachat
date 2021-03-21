# Web trò chuyện tập trung vào quyền riêng tư

## Tóm tắt

Người dùng có thể trò chuyện với những người dùng khác và các tin
nhắn được trao đổi giữa họ phải được mã hóa “end-to-end” (nghĩa là
máy chủ không có cách nào có thể đọc được tin nhắn của họ về mặt
kỹ thuật)

## Mục tiêu

1. Toàn bộ mã nguồn phải được mở.
2. Không có bất kì thông tin ý nghĩa nào trên máy chủ. (Khi “hacker”
   tấn công thành công máy chủ, thứ cô ấy nhận được là không gì cả).
3. Người dùng chỉ nhận tin nhắn của những người nằm trong liên lạc
   của họ (Tránh sự làm phiền).

## Công nghệ cần tìm hiểu

- Deno: thư viện để tạo máy chủ web với Typescript (Javascript có thêm
  kiểu dữ liệu).
- OpenPGPJS: thư viện mã hóa điện tử với Javascript.
- MongoDB: hệ quản trị cơ sở dữ liệu hướng tài liệu.
- WebSocket: công nghệ cho phép giao tiếp thời gian thực giữa máy chủ
  và máy người dùng.

## Mô hình dữ liệu

```txt
User {
    hashed_username: String, (primary_key)
    hashed_password: String,
    encrypted_private_key: String,
    public_key: String,
    is_online: Boolean,
    contact_list: [{
	nickname: String, (unique)
	hashed_username: String (unique)
    }]
}

Message {
    _id: ObjectId, (primary_key)
    from: User.hashed_username%TYPE,
    to: User.hashed_username%TYPE,
    encrypted_content: String,
    timestamp: Datetime
}
```

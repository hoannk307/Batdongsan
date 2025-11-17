# HƯỚNG DẪN SEED DỮ LIỆU LOCATION

## Mục đích

File seed này sẽ thêm 34 tỉnh/thành phố vào bảng `locations` trong database.

## Cách chạy

### Bước 1: Đảm bảo đã có file .env

File `backend/.env` phải có `DATABASE_URL` đúng format.

### Bước 2: Chạy seed

```bash
cd backend
npm run prisma:seed
```

## Kết quả

Sau khi chạy thành công, bạn sẽ thấy:
- ✅ 34 tỉnh/thành phố đã được thêm vào database
- ✅ Tất cả có `type = PROVINCE` và `level = 1`
- ✅ Mỗi tỉnh có `code` unique

## Danh sách các tỉnh/thành phố được seed

1. Thành phố Hà Nội
2. Thành phố Huế
3. Tỉnh Lai Châu
4. Tỉnh Điện Biên
5. Tỉnh Sơn La
6. Tỉnh Lạng Sơn
7. Tỉnh Quảng Ninh
8. Tỉnh Thanh Hoá
9. Tỉnh Nghệ An
10. Tỉnh Hà Tĩnh
11. Tỉnh Cao Bằng
12. Tỉnh Tuyên Quang
13. Tỉnh Lào Cai
14. Tỉnh Thái Nguyên
15. Tỉnh Phú Thọ
16. Tỉnh Bắc Ninh
17. Tỉnh Hưng Yên
18. Thành phố Hải Phòng
19. Tỉnh Ninh Bình
20. Tỉnh Quảng Trị
21. Thành phố Đà Nẵng
22. Tỉnh Quảng Ngãi
23. Tỉnh Gia Lai
24. Tỉnh Khánh Hoà
25. Tỉnh Lâm Đồng
26. Tỉnh Đắk Lắk
27. Thành phố Hồ Chí Minh
28. Tỉnh Đồng Nai
29. Tỉnh Tây Ninh
30. Thành phố Cần Thơ
31. Tỉnh Vĩnh Long
32. Tỉnh Đồng Tháp
33. Tỉnh Cà Mau
34. Tỉnh An Giang

## Kiểm tra dữ liệu

### Cách 1: Qua Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Mở http://localhost:5555 và xem bảng `Location`.

### Cách 2: Qua API

```bash
# Test API lấy danh sách tỉnh/thành
GET http://localhost:3000/api/locations/provinces
```

### Cách 3: Qua Supabase Dashboard

1. Vào Supabase Dashboard
2. Chọn project
3. Vào **Table Editor**
4. Chọn bảng `locations`
5. Filter: `type = PROVINCE`

## Lưu ý

- Script sẽ **xóa tất cả** các tỉnh cũ trước khi thêm mới
- Nếu muốn giữ lại dữ liệu cũ, cần sửa script
- Code của các tỉnh đã được điều chỉnh để tránh trùng lặp:
  - Thái Nguyên: `TG` (thay vì `TN`)
  - Đà Nẵng: `DNG` (thay vì `DN`)
  - Tây Ninh: `TYN` (thay vì `TN`)

## Chạy lại seed

Nếu muốn chạy lại seed (xóa và thêm lại):

```bash
cd backend
npm run prisma:seed
```

## Thêm quận/huyện và phường/xã

Sau khi seed tỉnh/thành, bạn có thể:
1. Sửa file `backend/prisma/seed.ts`
2. Thêm logic seed quận/huyện (level 2)
3. Thêm logic seed phường/xã (level 3)
4. Chạy lại `npm run prisma:seed`









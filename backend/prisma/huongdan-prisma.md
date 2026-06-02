cd backend
npx prisma db pull
npx prisma generate   # (khuyến nghị) để cập nhật Prisma Client


----------------- deploye  lên môi trường production -------------------------

[Local] prisma db pull → schema.prisma được cập nhật
        ↓
[Local] prisma migrate dev --name <tên> → tạo file SQL migration
        ↓
[Deploy] commit & push migration files lên git
        ↓
[Production] prisma migrate deploy → áp dụng migration lên DB production

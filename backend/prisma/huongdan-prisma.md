cd backend
npx prisma db pull
npx prisma generate   # (khuyến nghị) để cập nhật Prisma Client




cd backend
npm run prisma:seed   # dùng script seed.ts mới
# hoặc
npx ts-node prisma/seed.ts
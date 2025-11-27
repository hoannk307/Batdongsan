import { PrismaClient } from '@prisma/client';

/**
 * Script này đồng bộ toàn bộ bảng `locations` từ một database nguồn
 * sang một database đích, dựa trên cấu trúc hiện tại trong schema.prisma.
 *
 * Có thể copy file này sang project khác miễn là model `locations` giống nhau.
 *
 * ENV cần có:
 * - SOURCE_DATABASE_URL: DB nguồn (chứa dữ liệu locations chuẩn)
 * - TARGET_DATABASE_URL: DB đích (nơi muốn đẩy dữ liệu)
 *
 * Nếu không khai báo, script sẽ fallback về DATABASE_URL.
 */

const prismaSource = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SOURCE_DATABASE_URL || process.env.DATABASE_URL!,
    },
  },
});

const prismaTarget = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL!,
    },
  },
});

async function main() {
  console.log('🚀 Bắt đầu đồng bộ dữ liệu bảng locations...');

  // 1. Lấy toàn bộ dữ liệu locations từ DB nguồn
  const sourceLocations = await prismaSource.locations.findMany();
  console.log(`📥 Đã đọc ${sourceLocations.length} bản ghi từ DB nguồn.`);

  if (sourceLocations.length === 0) {
    console.warn('⚠️ DB nguồn không có dữ liệu locations nào, dừng đồng bộ.');
    return;
  }

  // 2. Xóa toàn bộ dữ liệu cũ trong bảng locations ở DB đích
  await prismaTarget.locations.deleteMany();
  console.log('🧹 Đã xoá toàn bộ dữ liệu cũ trong bảng locations ở DB đích.');

  // 3. Ghi lại toàn bộ dữ liệu theo đúng cấu trúc hiện tại
  await prismaTarget.$transaction(
    sourceLocations.map((loc) =>
      prismaTarget.locations.create({
        data: {
          id: loc.id, // giữ nguyên id để không vỡ quan hệ parent_id
          code: loc.code,
          name: loc.name,
          type: loc.type,
          parent_id: loc.parent_id,
          level: loc.level,
        },
      }),
    ),
  );

  console.log('✅ Hoàn thành đồng bộ dữ liệu bảng locations.');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi đồng bộ locations:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaSource.$disconnect();
    await prismaTarget.$disconnect();
  });


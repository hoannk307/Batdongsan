import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu Location...');

  // Danh sách các tỉnh/thành phố
  // Lưu ý: Code phải unique, đã sửa các code trùng lặp
  const provinces = [
    { name: 'Thành phố Hà Nội', code: 'HN', level: 1 },
    { name: 'Thành phố Huế', code: 'HUE', level: 1 },
    { name: 'Tỉnh Lai Châu', code: 'LC', level: 1 },
    { name: 'Tỉnh Điện Biên', code: 'DB', level: 1 },
    { name: 'Tỉnh Sơn La', code: 'SL', level: 1 },
    { name: 'Tỉnh Lạng Sơn', code: 'LS', level: 1 },
    { name: 'Tỉnh Quảng Ninh', code: 'QN', level: 1 },
    { name: 'Tỉnh Thanh Hoá', code: 'TH', level: 1 },
    { name: 'Tỉnh Nghệ An', code: 'NA', level: 1 },
    { name: 'Tỉnh Hà Tĩnh', code: 'HT', level: 1 },
    { name: 'Tỉnh Cao Bằng', code: 'CB', level: 1 },
    { name: 'Tỉnh Tuyên Quang', code: 'TQ', level: 1 },
    { name: 'Tỉnh Lào Cai', code: 'LO', level: 1 },
    { name: 'Tỉnh Thái Nguyên', code: 'TG', level: 1 }, // Đổi từ TN để tránh trùng
    { name: 'Tỉnh Phú Thọ', code: 'PT', level: 1 },
    { name: 'Tỉnh Bắc Ninh', code: 'BN', level: 1 },
    { name: 'Tỉnh Hưng Yên', code: 'HY', level: 1 },
    { name: 'Thành phố Hải Phòng', code: 'HP', level: 1 },
    { name: 'Tỉnh Ninh Bình', code: 'NB', level: 1 },
    { name: 'Tỉnh Quảng Trị', code: 'QT', level: 1 },
    { name: 'Thành phố Đà Nẵng', code: 'DNG', level: 1 }, // Đổi từ DN để tránh trùng
    { name: 'Tỉnh Quảng Ngãi', code: 'QG', level: 1 },
    { name: 'Tỉnh Gia Lai', code: 'GL', level: 1 },
    { name: 'Tỉnh Khánh Hoà', code: 'KH', level: 1 },
    { name: 'Tỉnh Lâm Đồng', code: 'LD', level: 1 },
    { name: 'Tỉnh Đắk Lắk', code: 'DL', level: 1 },
    { name: 'Thành phố Hồ Chí Minh', code: 'HCM', level: 1 },
    { name: 'Tỉnh Đồng Nai', code: 'DN', level: 1 },
    { name: 'Tỉnh Tây Ninh', code: 'TYN', level: 1 }, // Đổi từ TN để tránh trùng
    { name: 'Thành phố Cần Thơ', code: 'CT', level: 1 },
    { name: 'Tỉnh Vĩnh Long', code: 'VL', level: 1 },
    { name: 'Tỉnh Đồng Tháp', code: 'DT', level: 1 },
    { name: 'Tỉnh Cà Mau', code: 'CM', level: 1 },
    { name: 'Tỉnh An Giang', code: 'AG', level: 1 },
  ];

  // Xóa dữ liệu cũ (nếu có)
  await prisma.location.deleteMany({
    where: {
      type: 'PROVINCE',
      level: 1,
    },
  });

  // Insert dữ liệu mới
  for (const province of provinces) {
    await prisma.location.create({
      data: {
        code: province.code,
        name: province.name,
        type: 'PROVINCE',
        level: province.level,
      },
    });
    console.log(`✅ Đã thêm: ${province.name}`);
  }

  console.log(`\n🎉 Hoàn thành! Đã seed ${provinces.length} tỉnh/thành phố.`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


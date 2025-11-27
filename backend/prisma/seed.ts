import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const removeDiacritics = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const makeCode = (name: string, index: number, prefix = '') => {
  const base = removeDiacritics(name).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const trimmed = prefix ? `${prefix}_${base}` : base;
  const limited = trimmed.slice(0, 18); // keep room for suffix
  return `${limited}${String(index + 1).padStart(2, '0')}`;
};

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

  const khanhHoaWards = [
    'Xã Nam Cam Ranh',
    'Xã Bắc Ninh Hòa',
    'Xã Tân Định',
    'Xã Nam Ninh Hòa',
    'Xã Tây Ninh Hòa',
    'Xã Hòa Trí',
    'Xã Đại Lãnh',
    'Xã Tu Bông',
    'Xã Vạn Thắng',
    'Xã Vạn Ninh',
    'Xã Vạn Hưng',
    'Xã Diên Khánh',
    'Xã Diên Lạc',
    'Xã Diên Điền',
    'Xã Diên Lâm',
    'Xã Diên Thọ',
    'Xã Suối Hiệp',
    'Xã Cam Lâm',
    'Xã Suối Dầu',
    'Xã Cam Hiệp',
    'Xã Cam An',
    'Xã Bắc Khánh Vĩnh',
    'Xã Trung Khánh Vĩnh',
    'Xã Tây Khánh Vĩnh',
    'Xã Nam Khánh Vĩnh',
    'Xã Khánh Vĩnh',
    'Xã Khánh Sơn',
    'Xã Tây Khánh Sơn',
    'Xã Đông Khánh Sơn',
    'Xã Ninh Phước',
    'Xã Phước Hữu',
    'Xã Phước Hậu',
    'Xã Thuận Nam',
    'Xã Cà Ná',
    'Xã Phước Hà',
    'Xã Phước Dinh',
    'Xã Ninh Hải',
    'Xã Xuân Hải',
    'Xã Vĩnh Hải',
    'Xã Thuận Bắc',
    'Xã Công Hải',
    'Xã Ninh Sơn',
    'Xã Lâm Sơn',
    'Xã Anh Dũng',
    'Xã Mỹ Sơn',
    'Xã Bác Ái Đông',
    'Xã Bác Ái',
    'Xã Bác Ái Tây',
    'Phường Nha Trang',
    'Phường Bắc Nha Trang',
    'Phường Tây Nha Trang',
    'Phường Nam Nha Trang',
    'Phường Bắc Cam Ranh',
    'Phường Cam Ranh',
    'Phường Cam Linh',
    'Phường Ba Ngòi',
    'Phường Ninh Hòa',
    'Phường Đông Ninh Hòa',
    'Phường Hòa Thắng',
    'Phường Phan Rang',
    'Phường Đông Hải',
    'Phường Ninh Chử',
    'Phường Bảo An',
    'Phường Đô Vinh',
    'Đặc khu Trường Sa',
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

  // Seed danh sách xã/phường thuộc tỉnh Khánh Hoà (code = KH)
  const khanhHoa = await prisma.location.findFirst({
    where: {
      code: 'KH',
      type: 'PROVINCE',
    },
  });

  if (!khanhHoa) {
    throw new Error('Không tìm thấy tỉnh Khánh Hoà để gán parentId.');
  }

  await prisma.location.deleteMany({
    where: {
      parentId: khanhHoa.id,
      level: 2,
    },
  });

  for (const [index, wardName] of khanhHoaWards.entries()) {
    const code = makeCode(wardName, index, 'KH');
    await prisma.location.create({
      data: {
        code,
        name: wardName,
        type: 'WARD',
        level: 2,
        parentId: khanhHoa.id,
      },
    });
    console.log(`🏘️  Đã thêm xã/phường: ${wardName}`);
  }

  console.log(`\n🎯 Hoàn thành seed ${khanhHoaWards.length} xã/phường Khánh Hoà.`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


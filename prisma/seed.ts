import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

async function main() {
  await prisma.instrument.deleteMany();
  await prisma.instrumentType.deleteMany();
  await prisma.department.deleteMany();
  await prisma.measurementType.deleteMany();

  const [pressureGauge, thermometer, multimeter, scales] = await Promise.all([
    prisma.instrumentType.create({ data: { name: "Манометр" } }),
    prisma.instrumentType.create({ data: { name: "Термометр" } }),
    prisma.instrumentType.create({ data: { name: "Мультиметр" } }),
    prisma.instrumentType.create({ data: { name: "Весы" } }),
  ]);

  const [lab, production, quality, energy] = await Promise.all([
    prisma.department.create({ data: { name: "Лаборатория метрологии" } }),
    prisma.department.create({ data: { name: "Производственный цех" } }),
    prisma.department.create({ data: { name: "Отдел качества" } }),
    prisma.department.create({ data: { name: "Энергослужба" } }),
  ]);

  const [pressure, temperature, electrical, mass] = await Promise.all([
    prisma.measurementType.create({ data: { name: "Давление" } }),
    prisma.measurementType.create({ data: { name: "Температура" } }),
    prisma.measurementType.create({ data: { name: "Электрические величины" } }),
    prisma.measurementType.create({ data: { name: "Масса" } }),
  ]);

  await prisma.instrument.createMany({
    data: [
      {
        name: "Манометр МП4-У",
        typeId: pressureGauge.id,
        serialNumber: "MP4-240115",
        inventoryNumber: "SI-0001",
        assetNumber: "OS-100045",
        manufactureYear: 2021,
        acquisitionDate: date("2021-08-12"),
        status: "IN_USE",
        initialCost: 48500,
        departmentId: production.id,
        location: "Цех 1, линия А",
        employeeNumber: "1452",
        responsiblePerson: "Иванов А. П.",
        calibrationOrg: "ЦСМ Кызылорда",
        lastCalibration: date("2025-07-20"),
        nextCalibration: date("2026-07-20"),
        calibrationResult: "PASSED",
        certificateNumber: "KZ-2025-00124",
        measurementTypeId: pressure.id,
        notes: "Рабочий диапазон 0-1,6 МПа",
      },
      {
        name: "Термометр электронный ТЭ-02",
        typeId: thermometer.id,
        serialNumber: "TE02-77831",
        inventoryNumber: "SI-0002",
        assetNumber: "OS-100052",
        manufactureYear: 2020,
        acquisitionDate: date("2020-11-03"),
        status: "IN_USE",
        initialCost: 22000,
        departmentId: lab.id,
        location: "Лаборатория, шкаф 3",
        employeeNumber: "1007",
        responsiblePerson: "Петрова Е. Н.",
        calibrationOrg: "Аккредитованная лаборатория Мера",
        lastCalibration: date("2025-06-15"),
        nextCalibration: date("2026-06-15"),
        calibrationResult: "PASSED",
        certificateNumber: "MR-2025-0477",
        measurementTypeId: temperature.id,
        notes: "Поверка просрочена, требуется вывод из эксплуатации",
      },
      {
        name: "Мультиметр Fluke 179",
        typeId: multimeter.id,
        serialNumber: "FL179-55210",
        inventoryNumber: "SI-0003",
        assetNumber: "OS-100078",
        manufactureYear: 2022,
        acquisitionDate: date("2022-03-18"),
        status: "IN_USE",
        initialCost: 135000,
        departmentId: energy.id,
        location: "Электроучасток",
        employeeNumber: "1188",
        responsiblePerson: "Сидоров М. К.",
        calibrationOrg: "НацЭкС",
        lastCalibration: date("2026-02-10"),
        nextCalibration: date("2027-02-10"),
        calibrationResult: "PASSED",
        certificateNumber: "NE-2026-0091",
        measurementTypeId: electrical.id,
        notes: "Комплект щупов в наличии",
      },
      {
        name: "Весы лабораторные ВЛТЭ-210",
        typeId: scales.id,
        serialNumber: "VLTE-210-094",
        inventoryNumber: "SI-0004",
        assetNumber: "OS-100083",
        manufactureYear: 2019,
        acquisitionDate: date("2019-05-24"),
        status: "IN_STORAGE",
        initialCost: 76000,
        departmentId: quality.id,
        location: "Склад ОТК",
        employeeNumber: "1320",
        responsiblePerson: "Ким Д. В.",
        calibrationOrg: "ЦСМ Кызылорда",
        lastCalibration: date("2025-09-01"),
        nextCalibration: date("2026-09-01"),
        calibrationResult: "LIMITED",
        certificateNumber: "KZ-2025-01880",
        measurementTypeId: mass.id,
        notes: "Ограниченное применение до 200 г",
      },
      {
        name: "Манометр образцовый МО-160",
        typeId: pressureGauge.id,
        serialNumber: "MO160-0322",
        inventoryNumber: "SI-0005",
        assetNumber: "OS-100097",
        manufactureYear: 2023,
        acquisitionDate: date("2023-10-06"),
        status: "IN_REPAIR",
        initialCost: 98000,
        departmentId: lab.id,
        location: "Ремонтная зона",
        employeeNumber: "1007",
        responsiblePerson: "Петрова Е. Н.",
        calibrationOrg: "Аккредитованная лаборатория Мера",
        lastCalibration: date("2025-12-05"),
        nextCalibration: date("2026-12-05"),
        calibrationResult: "FAILED",
        certificateNumber: "MR-2025-0895",
        measurementTypeId: pressure.id,
        notes: "После ремонта повторить поверку",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

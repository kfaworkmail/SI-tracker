import { prisma } from "@/lib/prisma";

type CalibrationState = "overdue" | "soon" | "valid";
type InstrumentStatus = "IN_USE" | "IN_REPAIR" | "IN_STORAGE" | "DECOMMISSIONED";
type CalibrationResult = "PASSED" | "FAILED" | "LIMITED" | "NOT_REQUIRED";

const statusLabels: Record<InstrumentStatus, string> = {
  IN_USE: "В эксплуатации",
  IN_REPAIR: "В ремонте",
  IN_STORAGE: "На хранении",
  DECOMMISSIONED: "Списано",
};

const resultLabels: Record<CalibrationResult, string> = {
  PASSED: "Годен",
  FAILED: "Не годен",
  LIMITED: "Ограниченно годен",
  NOT_REQUIRED: "Не требуется",
};

const stateStyles: Record<CalibrationState, string> = {
  overdue: "border-red-200 bg-red-50 text-red-800",
  soon: "border-amber-200 bg-amber-50 text-amber-800",
  valid: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const stateLabels: Record<CalibrationState, string> = {
  overdue: "Просрочена",
  soon: "До 30 дней",
  valid: "Действует",
};

function getCalibrationState(nextCalibration: Date): CalibrationState {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(nextCalibration);
  dueDate.setHours(0, 0, 0, 0);

  const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000);

  if (daysLeft < 0) {
    return "overdue";
  }

  if (daysLeft <= 30) {
    return "soon";
  }

  return "valid";
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU").format(date);
}

function formatMoney(value: unknown) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default async function Home() {
  const instruments = await prisma.instrument.findMany({
    include: {
      type: true,
      department: true,
      measurementType: true,
    },
    orderBy: {
      nextCalibration: "asc",
    },
  });

  const counters = instruments.reduce(
    (acc, instrument) => {
      const state = getCalibrationState(instrument.nextCalibration);
      acc[state] += 1;
      return acc;
    },
    { overdue: 0, soon: 0, valid: 0 } satisfies Record<CalibrationState, number>,
  );

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-gray-200 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              MVP реестра средств измерений
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-gray-950">СИ-Трекер</h1>
          </div>
          <div className="text-sm text-gray-500">Всего записей: {instruments.length}</div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">Всего СИ</div>
            <div className="mt-2 text-3xl font-semibold">{instruments.length}</div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="text-sm text-red-700">Просрочено</div>
            <div className="mt-2 text-3xl font-semibold text-red-900">{counters.overdue}</div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm text-amber-700">Истекает за 30 дней</div>
            <div className="mt-2 text-3xl font-semibold text-amber-900">{counters.soon}</div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-700">Действует</div>
            <div className="mt-2 text-3xl font-semibold text-emerald-900">{counters.valid}</div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-950">Реестр СИ</h2>
              <p className="mt-1 text-sm text-gray-500">
                Цвет строки показывает состояние срока следующей поверки.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              {(["overdue", "soon", "valid"] as CalibrationState[]).map((state) => (
                <span
                  key={state}
                  className={`rounded-full border px-3 py-1 ${stateStyles[state]}`}
                >
                  {stateLabels[state]}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Наименование</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Тип</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Зав. номер</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Инв. номер</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Подразделение</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">МОЛ</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Поверка до</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Статус</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Стоимость</th>
                </tr>
              </thead>
              <tbody>
                {instruments.map((instrument) => {
                  const calibrationState = getCalibrationState(instrument.nextCalibration);

                  return (
                    <tr
                      key={instrument.id}
                      className={`border-t border-gray-100 ${stateStyles[calibrationState]}`}
                    >
                      <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-950">
                        <div>{instrument.name}</div>
                        <div className="mt-1 text-xs font-normal text-gray-500">
                          {instrument.measurementType.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">{instrument.type.name}</td>
                      <td className="whitespace-nowrap px-4 py-4">{instrument.serialNumber}</td>
                      <td className="whitespace-nowrap px-4 py-4">{instrument.inventoryNumber}</td>
                      <td className="whitespace-nowrap px-4 py-4">{instrument.department.name}</td>
                      <td className="whitespace-nowrap px-4 py-4">{instrument.responsiblePerson}</td>
                      <td className="whitespace-nowrap px-4 py-4 font-semibold">
                        {formatDate(instrument.nextCalibration)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div>{statusLabels[instrument.status as InstrumentStatus]}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {resultLabels[instrument.calibrationResult as CalibrationResult]}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {formatMoney(instrument.initialCost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { Calendar, View, Views, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addWeeks,
  subWeeks,
  startOfWeek as startWeek,
  endOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { vi },
});

const CalendarEvent = ({ event }: any) => {
  return (
    <div className="text-xs leading-tight">
      <div className="font-semibold">{event.subject?.name}</div>
      <div className="text-gray-600">Lớp {event.class?.name}</div>
    </div>
  );
};

const BigCalendar = ({
  data,
}: {
  data: {
    start: Date;
    end: Date;
    subject: { name: string };
    class: { name: string };
  }[];
}) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);
  const [date, setDate] = useState(new Date());

  const weekStart = startWeek(date, { locale: vi });
  const weekEnd = endOfWeek(date, { locale: vi });

  return (
    <div className="space-y-4">
      {/* 🔹 Custom Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-gray-600 ">
          {format(weekStart, "dd/MM")} - {format(weekEnd, "dd/MM/yyyy")}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setDate(subWeeks(date, 1))}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Tuần trước
          </button>

          <button
            onClick={() => setDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Hôm nay
          </button>

          <button
            onClick={() => setDate(addWeeks(date, 1))}
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Tuần sau →
          </button>
        </div>
      </div>

      {/* 🔹 Calendar */}
      <div className="bg-white rounded-lg shadow p-2">
        <Calendar
          culture="vi"
          localizer={localizer}
          events={data}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          view={view}
          onView={setView}
          views={["work_week", "day"]}
          toolbar={false}
          startAccessor="start"
          endAccessor="end"
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 17, 0, 0)}
          components={{
            event: CalendarEvent,
          }}
          messages={{
            work_week: "Tuần học",
            day: "Ngày",
            noEventsInRange: "Không có sự kiện trong khoảng thời gian này",
          }}
          formats={{
            dayFormat: (date, culture, localizer) =>
              localizer!.format(date, "EEEE dd/MM", culture),
            timeGutterFormat: (date, culture, localizer) =>
              localizer!.format(date, "HH:mm", culture),
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer!.format(
                start,
                "HH:mm",
                culture,
              )} – ${localizer!.format(end, "HH:mm", culture)}`,
          }}
          style={{ height: 600 }}
        />
      </div>
    </div>
  );
};

export default BigCalendar;

// "use client";

// import { Calendar, View, Views, dateFnsLocalizer } from "react-big-calendar";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { useState } from "react";
// import { format, parse, startOfWeek, getDay } from "date-fns";
// import { vi } from "date-fns/locale";

// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek,
//   getDay,
//   locales: { vi },
// });

// const CalendarEvent = ({ event }: any) => {
//   return (
//     <div className="text-xs leading-tight">
//       <div className="font-semibold">{event.subject?.name}</div>
//       <div className="text-gray-600">Lớp {event.class?.name}</div>
//     </div>
//   );
// };

// const BigCalendar = ({
//   data,
// }: {
//   data: {
//     start: Date;
//     end: Date;
//     subject: {
//       name: string;
//     };
//     class: {
//       name: string;
//     };
//   }[];
// }) => {
//   const [view, setView] = useState<View>(Views.WORK_WEEK);

//   return (
//     <Calendar
//       culture="vi"
//       localizer={localizer}
//       events={data}
//       components={{
//         event: CalendarEvent,
//       }}
//       startAccessor="start"
//       endAccessor="end"
//       views={["work_week", "day"]}
//       view={view}
//       onView={setView}
//       min={new Date(2026, 1, 0, 8, 0, 0)}
//       max={new Date(2026, 1, 0, 17, 0, 0)}
//       messages={{
//         today: "Hôm nay",
//         previous: "Trước",
//         next: "Sau",
//         work_week: "Tuần học",
//         day: "Ngày",
//         month: "Tháng",
//         week: "Tuần",
//         agenda: "Lịch biểu",
//         date: "Ngày",
//         time: "Giờ",
//         event: "Sự kiện",
//         noEventsInRange: "Không có sự kiện trong khoảng thời gian này",
//       }}
//       formats={{
//         dayFormat: (date, culture, localizer) =>
//           localizer!.format(date, "EEEE dd/MM", culture),
//         timeGutterFormat: (date, culture, localizer) =>
//           localizer!.format(date, "HH:mm", culture),
//         eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
//           `${localizer!.format(start, "HH:mm", culture)} – ${localizer!.format(
//             end,
//             "HH:mm",
//             culture,
//           )}`,
//       }}
//     />
//   );
// };

// export default BigCalendar;

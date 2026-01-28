"use client";

import { Calendar, View, Views, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { format, parse, startOfWeek, getDay } from "date-fns";
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
    subject: {
      name: string;
    };
    class: {
      name: string;
    };
  }[];
  // data: {
  //   title: string;
  //   classId: number;
  //   class: any;
  //   start: Date;
  //   end: Date;
  // }[];
}) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  return (
    <Calendar
      culture="vi"
      localizer={localizer}
      events={data}
      components={{
        event: CalendarEvent,
      }}
      startAccessor="start"
      endAccessor="end"
      views={["work_week", "day"]}
      view={view}
      onView={setView}
      min={new Date(2026, 1, 0, 8, 0, 0)}
      max={new Date(2026, 1, 0, 17, 0, 0)}
      messages={{
        today: "Hôm nay",
        previous: "Trước",
        next: "Sau",
        work_week: "Tuần học",
        day: "Ngày",
        month: "Tháng",
        week: "Tuần",
        agenda: "Lịch biểu",
        date: "Ngày",
        time: "Giờ",
        event: "Sự kiện",
        noEventsInRange: "Không có sự kiện trong khoảng thời gian này",
      }}
      formats={{
        dayFormat: (date, culture, localizer) =>
          localizer!.format(date, "EEEE dd/MM", culture),
        timeGutterFormat: (date, culture, localizer) =>
          localizer!.format(date, "HH:mm", culture),
        eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
          `${localizer!.format(start, "HH:mm", culture)} – ${localizer!.format(
            end,
            "HH:mm",
            culture
          )}`,
      }}
    />
  );
};

export default BigCalendar;

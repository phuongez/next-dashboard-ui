"use client";

import {
  Calendar,
  momentLocalizer,
  View,
  Views,
  dateFnsLocalizer,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { vi } from "date-fns/locale";

// const localizer = momentLocalizer(moment);
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { vi },
});

const BigCalendar = ({
  data,
}: {
  data: {
    title: string;
    classId: number;
    class: any;
    start: Date;
    end: Date;
  }[];
}) => {
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  return (
    // <Calendar
    //   localizer={localizer}
    //   events={data}
    //   startAccessor="start"
    //   endAccessor="end"
    //   views={["work_week", "day"]}
    //   view={view}
    //   style={{ height: "98%" }}
    //   onView={handleOnChangeView}
    //   min={new Date(2026, 1, 0, 8, 0, 0)}
    //   max={new Date(2026, 1, 0, 17, 0, 0)}
    // />
    <Calendar
      localizer={localizer}
      events={data}
      startAccessor="start"
      endAccessor="end"
      views={["work_week", "day"]}
      view={view}
      onView={handleOnChangeView}
      min={new Date(2026, 1, 0, 8, 0, 0)}
      max={new Date(2026, 1, 0, 17, 0, 0)}
      formats={{
        dayFormat: (date, culture, localizer) =>
          localizer!.format(date, "EEEE dd/MM", culture),
      }}
    />
  );
};

export default BigCalendar;

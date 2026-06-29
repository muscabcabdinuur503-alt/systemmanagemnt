import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Video, Megaphone, DollarSign, Clock, Info } from 'lucide-react';
import { VirtualClass, Announcement, FeeInvoice } from '../types';

interface SchoolCalendarProps {
  virtualClasses?: VirtualClass[];
  announcements?: Announcement[];
  fees?: FeeInvoice[];
  role?: string;
}

export default function SchoolCalendar({
  virtualClasses = [],
  announcements = [],
  fees = [],
  role = 'Parent'
}: SchoolCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const SOMALI_MONTHS = [
    'Jannaayo', 'Febraayo', 'Maarso', 'Abriil', 'Maajo', 'Juun',
    'Luulyo', 'Agoosto', 'Sebteembar', 'Oktoobar', 'Nofeembar', 'Diseembar'
  ];

  const SOMALI_DAYS = ['Axad', 'Isniin', 'Talaado', 'Arbaco', 'Khamiis', 'Jimce', 'Sabti'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Get days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create calendar cells grid
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push(new Date(year, month, i));
  }

  // Format helper
  const formatDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Group events by date string
  const getEventsForDate = (dateStr: string) => {
    const list: { type: 'virtual' | 'announcement' | 'fee'; title: string; desc: string; time?: string; badgeColor: string; icon: any }[] = [];

    // 1. Virtual Classes (dateTime could be YYYY-MM-DD or contain date)
    virtualClasses.forEach(vc => {
      // e.g. "2026-06-25T14:30" or similar
      if (vc.dateTime && vc.dateTime.includes(dateStr)) {
        const timePart = vc.dateTime.split('T')[1] || '';
        list.push({
          type: 'virtual',
          title: `🎥 Klaska Tooska: ${vc.subject}`,
          desc: `Mawduuca: ${vc.topic} (Prof. ${vc.teacherName})`,
          time: timePart ? `Kulanka: ${timePart}` : 'La jadwaleyey',
          badgeColor: 'bg-rose-50 border-rose-200 text-rose-700',
          icon: Video
        });
      }
    });

    // 2. Announcements
    announcements.forEach(ann => {
      if (ann.date === dateStr) {
        list.push({
          type: 'announcement',
          title: `📢 Ogaysiis: ${ann.title}`,
          desc: ann.content,
          time: `Boor-ka: ${ann.category}`,
          badgeColor: 'bg-indigo-50 border-indigo-200 text-indigo-700',
          icon: Megaphone
        });
      }
    });

    // 3. Fee Invoices
    fees.forEach(fee => {
      if (fee.dueDate === dateStr) {
        list.push({
          type: 'fee',
          title: `💵 Biilka: ${fee.title}`,
          desc: `Cadadka: $${fee.amount} (${fee.status === 'Paid' ? 'Waa la bixiyey' : 'Waa dhiman yahay'})`,
          time: `Status: ${fee.status}`,
          badgeColor: 'bg-amber-50 border-amber-200 text-amber-700',
          icon: DollarSign
        });
      }
    });

    return list;
  };

  const selectedEvents = getEventsForDate(selectedDateStr);

  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-6" id="school-calendar-portal">
      {/* Calendar Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CalendarIcon className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 font-sans tracking-tight">Kalandarka Dugsiga (School Calendar)</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Halkan kala soco casharada tooska ah, biilasha, iyo fasaxyada</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-150 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-extrabold text-slate-700 px-3 min-w-[140px] text-center">
            {SOMALI_MONTHS[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Month Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/50 py-2 rounded-xl">
            {SOMALI_DAYS.map(day => (
              <div key={day} className="py-1">{day.substring(0, 3)}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, idx) => {
              if (day === null) {
                return (
                  <div key={`empty-${idx}`} className="aspect-square bg-slate-50/20 rounded-xl border border-dashed border-slate-100" />
                );
              }

              const dateStr = formatDateString(day);
              const dayEvents = getEventsForDate(dateStr);
              const isSelected = selectedDateStr === dateStr;
              const isToday = formatDateString(new Date()) === dateStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`aspect-square p-1.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer relative group ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-600/10 scale-[1.03]'
                      : isToday
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-800 hover:bg-slate-50'
                      : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className={`text-[11px] font-extrabold font-sans ${isToday && !isSelected ? 'bg-emerald-500 text-white px-1.5 py-0.5 rounded-lg' : ''}`}>
                    {day.getDate()}
                  </span>

                  {/* Micro Indicators for events */}
                  {dayEvents.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dayEvents.slice(0, 3).map((ev, eIdx) => {
                        let dotColor = 'bg-rose-500';
                        if (ev.type === 'announcement') dotColor = 'bg-indigo-500';
                        if (ev.type === 'fee') dotColor = 'bg-amber-500';

                        return (
                          <span
                            key={eIdx}
                            className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : dotColor}`}
                            title={ev.title}
                          />
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className={`text-[7px] font-bold leading-none ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Event Details Panel */}
        <div className="lg:col-span-4 bg-slate-50/80 border border-slate-150 rounded-2xl p-4.5 flex flex-col min-h-[300px]">
          <div className="space-y-1 pb-3 border-b border-slate-200/65 shrink-0">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block font-mono">Maalinta la Doortay (Details)</span>
            <h4 className="text-xs font-bold text-slate-700 font-sans">
              {(() => {
                const parts = selectedDateStr.split('-');
                if (parts.length === 3) {
                  const selDateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                  return `${SOMALI_DAYS[selDateObj.getDay()]}, ${parts[2]} ${SOMALI_MONTHS[selDateObj.getMonth()]} ${parts[0]}`;
                }
                return selectedDateStr;
              })()}
            </h4>
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-3 max-h-[320px]">
            {selectedEvents.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-400">
                <Clock className="w-8 h-8 text-slate-300 mb-2 animate-pulse" />
                <p className="text-[11px] font-bold">Maalintaan wax hawlo ah kuma qorna.</p>
                <p className="text-[9px] text-slate-400 mt-1">Guji maalin kasta oo calaamad yar leh si aad u aragto casharada ama ogaysiisyada.</p>
              </div>
            ) : (
              selectedEvents.map((ev, idx) => {
                const Icon = ev.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex gap-3 transition-all ${ev.badgeColor}`}
                  >
                    <span className="p-1.5 bg-white rounded-lg border border-inherit shrink-0 self-start">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="space-y-1 text-left">
                      <h5 className="text-[11px] font-extrabold leading-tight">{ev.title}</h5>
                      <p className="text-[10px] text-slate-600 leading-snug">{ev.desc}</p>
                      {ev.time && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold opacity-80 font-mono">
                          <Clock className="w-2.5 h-2.5" /> {ev.time}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Notice footer */}
          <div className="pt-3 border-t border-slate-200/65 text-[9px] text-slate-400 font-semibold flex items-center gap-1.5 shrink-0">
            <Info className="w-3 h-3 text-slate-400" />
            <span>Kalandarku si toos ah ayuu ula jaan-qaadayaa database-ka.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

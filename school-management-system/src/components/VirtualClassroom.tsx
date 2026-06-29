import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Plus, Trash2, Edit2, Play, Power, Calendar, ExternalLink, Link2, Users, Radio, User } from 'lucide-react';
import { VirtualClass, UserRole } from '../types';

interface VirtualClassroomProps {
  virtualClasses: VirtualClass[];
  role: UserRole;
  teacherName: string;
  onAddClass: (vClass: VirtualClass) => void;
  onUpdateClass: (vClass: VirtualClass) => void;
  onDeleteClass: (id: string) => void;
}

export default function VirtualClassroom({
  virtualClasses,
  role,
  teacherName,
  onAddClass,
  onUpdateClass,
  onDeleteClass
}: VirtualClassroomProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<VirtualClass | null>(null);

  // Form states
  const [subject, setSubject] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [grade, setGrade] = useState('Grade 10');
  const [topic, setTopic] = useState('');
  const [dateTime, setDateTime] = useState('Live (Hadda)');
  const [meetUrl, setMeetUrl] = useState('https://meet.google.com/');
  const [isLive, setIsLive] = useState(true);

  const grades = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const handleSaveClass = () => {
    if (!subject || !topic || !meetUrl) return;

    if (editingClass) {
      // Edit existing
      const updated: VirtualClass = {
        ...editingClass,
        subject: subject.toUpperCase(),
        grade,
        topic,
        dateTime,
        meetUrl,
        isLive
      };
      onUpdateClass(updated);
      setEditingClass(null);
    } else {
      // Create new
      const newItem: VirtualClass = {
        id: `VCLASS-${Math.floor(Math.random() * 90000 + 10000)}`,
        subject: subject.toUpperCase(),
        grade,
        teacherName: role === 'Teacher' ? teacherName : 'Maamulka',
        topic,
        dateTime,
        meetUrl,
        isLive
      };
      onAddClass(newItem);
    }

    setIsFormOpen(false);
    // Reset form
    setSubject('');
    setTopic('');
    setDateTime('Live (Hadda)');
    setMeetUrl('https://meet.google.com/');
    setIsLive(true);
  };

  const handleToggleLive = (vClass: VirtualClass, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: VirtualClass = {
      ...vClass,
      isLive: !vClass.isLive
    };
    onUpdateClass(updated);
  };

  const handleStartEdit = (vClass: VirtualClass, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClass(vClass);
    setSubject(vClass.subject);
    setGrade(vClass.grade);
    setTopic(vClass.topic);
    setDateTime(vClass.dateTime);
    setMeetUrl(vClass.meetUrl);
    setIsLive(vClass.isLive);
    setIsFormOpen(true);
  };

  const cleanDeletedClass = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDeleteClass(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === id ? null : prev));
      }, 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden" id="virtual-classroom-panel">
      {/* Header banner */}
      <div className="bg-linear-to-r from-rose-700 to-rose-500 p-6 md:p-8 text-white relative">
        <div className="absolute top-4 right-4 w-52 h-52 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] text-rose-100 tracking-wider font-extrabold uppercase leading-none bg-rose-800/40 px-2.5 py-1 rounded-full border border-rose-500/30 inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping" />
              Kulanka Tooska ah (Meet Video Portal)
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Qolka Cashirada Tooska ah (Lockdown Safe)</h2>
            <p className="text-xs text-rose-100 max-w-xl">
              Haddii bandaw ama xannibaad timaado, cashiradu kama joogsanayaan dugsiga! Maamulka iyo barayaashu waxay halkan ka furi karaan cashiro toos ah iyadoo arday kasta oo gurigiisa jooga uu si sahlan ugu biiri karo.
            </p>
          </div>
          {(role === 'Admin' || role === 'Teacher') && (
            <button
              onClick={() => {
                setEditingClass(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-rose-800 text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-900/10 flex items-center gap-1.5 self-start md:self-center cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Schedule-garee Cashar Meet ah
            </button>
          )}
        </div>
      </div>

      {/* Main layout container */}
      <div className="p-6">
        {virtualClasses.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl space-y-3 bg-slate-50/50">
            <Video className="w-10 h-10 text-slate-350 mx-auto" />
            <div>
              <p className="text-xs text-slate-500 font-bold font-sans">Ma jiraan cashiro toos ah oo hadda socda!</p>
              <p className="text-[10px] text-slate-400">Marka macalinkaagu furo cashar toos ah, wuxuu ku soo bixi doonaa halkan isagoo leh badhan buluug ah oo ku biirid ah.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="virtual-classes-grid">
            {virtualClasses.map(vClass => (
              <motion.div
                key={vClass.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-xs ${
                  vClass.isLive
                    ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-350/50 hover:border-rose-450'
                    : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 leading-none ${
                      vClass.isLive
                        ? 'bg-rose-550/15 border-rose-550-40 text-rose-600'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {vClass.isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                      {vClass.isLive ? 'XANAAN Live Hadda' : 'La Qorsheeyay / Scheduled'}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-200/60 border border-slate-300/40 text-slate-600 rounded-lg">
                      {vClass.grade}
                    </span>
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
                      <span>{vClass.subject}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-300" /> Macalin: {vClass.teacherName}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {vClass.topic}
                    </h3>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold pt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {vClass.dateTime}
                    </p>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-100/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={vClass.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 text-[10px] transition cursor-pointer shadow-md ${
                        vClass.isLive
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/10'
                          : 'bg-slate-700 hover:bg-slate-800 text-white shadow-slate-900/10'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" /> Ku Biir Casharka
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>

                  {(role === 'Admin' || role === 'Teacher' || vClass.teacherName === teacherName) && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleToggleLive(vClass, e)}
                        className={`p-1.5 border rounded-lg transition-all text-xs font-bold flex items-center justify-center cursor-pointer ${
                          vClass.isLive
                            ? 'bg-rose-50 border-rose-150 text-rose-600 hover:bg-rose-100'
                            : 'bg-emerald-50 border-emerald-150 text-emerald-600 hover:bg-emerald-100'
                        }`}
                        title={vClass.isLive ? 'Dami Kulanka' : 'Biloow Kulanka (Live)'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleStartEdit(vClass, e)}
                        className="p-1.5 bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-150 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => cleanDeletedClass(vClass.id, e)}
                        className={`p-1.5 border rounded-lg transition flex items-center gap-1 ${
                          confirmDeleteId === vClass.id
                            ? 'bg-rose-600 border-rose-600 text-white font-extrabold px-2 py-0.5 text-[9px]'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50'
                        }`}
                        title={confirmDeleteId === vClass.id ? "Click again to delete" : "Tirtir Kulankan"}
                      >
                        {confirmDeleteId === vClass.id ? (
                          <>✕ Ma hubtaa?</>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Meet form slider dialogue */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl border border-slate-100/90 space-y-5"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-rose-50 rounded-lg text-rose-600">
                    <Video className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">
                    {editingClass ? 'Wax ka badal Casharka Meet-ka' : 'Schedule-garee Cashar Toos ah'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 bg-slate-50 hover:bg-slate-105 border border-slate-200 rounded-lg transition text-slate-400"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Maadada (Subject)</label>
                    <input
                      type="text"
                      required
                      placeholder="Tusaale: TARBIYO..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 p-2.5 rounded-xl transition-all focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fasalka (Target Grade)</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 p-2.5 rounded-xl transition-all focus:outline-none"
                    >
                      {grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Lesson Topic (Casharka Cinwaankiisa)</label>
                  <input
                    type="text"
                    required
                    placeholder="Tusaale: Casharka 4aad - Wanaagga iyo Akhlaaqda..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 p-2.5 rounded-xl transition-all focus:outline-none font-semibold text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Jadwalka Waqtiga (Scheduling)</label>
                    <input
                      type="text"
                      required
                      placeholder="Tusaale: Live Hadda, ama 2:30 PM..."
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 p-2.5 rounded-xl transition-all focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Is Live right now?</label>
                    <select
                      value={String(isLive)}
                      onChange={(e) => setIsLive(e.target.value === 'true')}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 p-2.5 rounded-xl transition-all focus:outline-none font-bold text-rose-600"
                    >
                      <option value="true">YES - Live Hadda</option>
                      <option value="false">NO - Scheduled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-slate-400" /> Google Meet / Zoom Link
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={meetUrl}
                    onChange={(e) => setMeetUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 p-2.5 rounded-xl transition-all focus:outline-none font-mono text-xs"
                  />
                </div>

                <button
                  onClick={handleSaveClass}
                  disabled={!subject || !topic || !meetUrl}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-rose-900/15"
                >
                  {editingClass ? 'Dalbó Isbedelada' : 'Schedule Casharka rasmiga ah'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

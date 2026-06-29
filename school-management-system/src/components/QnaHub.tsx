import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Search, Filter, MessageSquare, Plus, Subtitles, Trash2, Check, User, Send, AlertCircle } from 'lucide-react';
import { QnaItem, UserRole } from '../types';

interface QnaHubProps {
  qnaItems: QnaItem[];
  role: UserRole;
  authorName: string;
  onAddQna: (item: QnaItem) => void;
  onDeleteQna: (id: string) => void;
  onUpdateQna: (item: QnaItem) => void;
}

export default function QnaHub({
  qnaItems,
  role,
  authorName,
  onAddQna,
  onDeleteQna,
  onUpdateQna
}: QnaHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form states
  const [question, setQuestion] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('General');

  // Answering states
  const [activeAnsweringId, setActiveAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const categories = ['All', 'Academics', 'Finance', 'Registration', 'General'];

  const filteredItems = qnaItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAskQuestion = () => {
    if (!question || !subject) return;

    const newItem: QnaItem = {
      id: `QNA-${Math.floor(Math.random() * 90000 + 10000)}`,
      question,
      answer: '', // Left blank for Admin/Teacher to answer
      subject,
      askedBy: authorName,
      answeredBy: '',
      date: new Date().toISOString().split('T')[0],
      category
    };

    onAddQna(newItem);
    setIsFormOpen(false);
    // Reset inputs
    setQuestion('');
    setSubject('');
  };

  const handleProvideAnswer = (itemId: string) => {
    if (!answerText.trim()) return;

    const targetItem = qnaItems.find(q => q.id === itemId);
    if (!targetItem) return;

    const updatedItem: QnaItem = {
      ...targetItem,
      answer: answerText,
      answeredBy: authorName,
      date: new Date().toISOString().split('T')[0]
    };

    onUpdateQna(updatedItem);
    setActiveAnsweringId(null);
    setAnswerText('');
  };

  const cleanDeletedQna = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDeleteQna(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === id ? null : prev));
      }, 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden" id="qna-hub-panel">
      {/* Header banner */}
      <div className="bg-linear-to-r from-indigo-700 to-indigo-500 p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-150 tracking-wider font-extrabold uppercase leading-none bg-indigo-800/40 px-2.5 py-1 rounded-full border border-indigo-500/30">
              Q&A Hub / Su'aalaha & Jawaabaha
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Madasha Su'aalaha & Jawaabaha Tacliinta</h2>
            <p className="text-xs text-indigo-100 max-w-xl">
              Tani waa meel ardayda iyo waalidiintu ku soo qori karaan su'aalo khuseeya maadada, lacagaha, ama nidaamka guud ee dugsiga, halkaas oo maamulka iyo macalimiintuba uga jawaabaan si toos ah.
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-800 text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-900/15 flex items-center gap-1.5 self-start md:self-center cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Weydii Su'aal Cusub
          </button>
        </div>
      </div>

      {/* Main interface body */}
      <div className="p-6 space-y-6">
        {/* Search & Category Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Halkan uga raadi su'aalaha ama erayada fureha u ah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2.5 pl-9 rounded-xl text-xs focus:outline-none transition-all placeholder:text-slate-400 font-semibold"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Category-ga:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-slate-800 cursor-pointer font-bold"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'Dhammaan' : c}</option>)}
            </select>
          </div>
        </div>

        {/* List of Q&A cards */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl space-y-3 bg-slate-50/50">
            <HelpCircle className="w-10 h-10 text-slate-350 mx-auto" />
            <div>
              <p className="text-xs text-slate-500 font-bold">Ma jiraan su'aalo halkan yaala!</p>
              <p className="text-[10px] text-slate-400">Su'aal weydii anaga oo u diyaarinayna dhamaan barayaasha in ay kuu jawaabaan.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4" id="qna-list">
            {filteredItems.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50/50 hover:bg-slate-50 border border-slate-200/65 rounded-2xl p-5 space-y-3 relative group transition duration-150"
              >
                {/* Question Section */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[8px] font-extrabold px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full select-none">
                      {item.category.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {item.subject}
                    </span>
                    <span className="text-[9px] text-slate-400 ml-auto flex items-center gap-1 font-semibold">
                      <User className="w-3 h-3 text-slate-300" />
                      Wee weyddiisay: <span className="text-slate-500">{item.askedBy}</span>
                    </span>
                  </div>
                  
                  <div className="flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs select-none shrink-0 mt-0.5">
                      Q
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 leading-relaxed">
                      {item.question}
                    </h3>
                  </div>
                </div>

                {/* Answer Section */}
                {item.answer ? (
                  <div className="pt-3 border-t border-slate-100 flex gap-2.5 items-start">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs select-none shrink-0 mt-0.5">
                      A
                    </span>
                    <div className="space-y-1 flex-1">
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.answer}
                      </p>
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold">
                        <span>Laga soo jawaabay:</span>
                        <span className="text-emerald-600 font-extrabold uppercase bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-150/40">
                          {item.answeredBy || 'Maamulka'}
                        </span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-200/40 font-bold">
                      <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                      <span>Sugaysa Jawaabta baraha...</span>
                    </div>

                    {(role === 'Admin' || role === 'Teacher') && activeAnsweringId !== item.id && (
                      <button
                        onClick={() => {
                          setActiveAnsweringId(item.id);
                          setAnswerText('');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-sm shadow-indigo-600/10 cursor-pointer"
                      >
                        Ka Jawaab Su'aashan
                      </button>
                    )}
                  </div>
                )}

                {/* Answering text form area inline */}
                {activeAnsweringId === item.id && (
                  <div className="pt-3 border-t border-indigo-100 bg-indigo-50/30 p-3 rounded-xl space-y-2.5">
                    <textarea
                      rows={2}
                      placeholder={`Geli jawaabta rasmiga ah adoo metelaya ${authorName}...`}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      className="w-full bg-white border border-indigo-200/80 focus:border-indigo-500 p-2.5 rounded-xl text-xs font-semibold focus:outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setActiveAnsweringId(null)}
                        className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleProvideAnswer(item.id)}
                        disabled={!answerText.trim()}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-750 disabled:bg-slate-200 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3 h-3" /> Gudbi Jawaabta
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete option for admin */}
                {(role === 'Admin' || role === 'Teacher') && (
                  <button
                    onClick={(e) => cleanDeletedQna(item.id, e)}
                    className={`absolute top-4 right-4 p-1 border rounded-lg transition flex items-center gap-1 ${
                      confirmDeleteId === item.id
                        ? 'bg-rose-600 border-rose-600 text-white font-extrabold px-2.5 py-0.5 text-[9px]'
                        : 'text-slate-300 hover:text-rose-600 border-transparent hover:border-rose-100 hover:bg-rose-50'
                    }`}
                    title={confirmDeleteId === item.id ? "Click again to delete" : "Tirtir su'ashan"}
                  >
                    {confirmDeleteId === item.id ? (
                      <>✕ Ma hubtaa?</>
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Slideup Questionnaire Form modal */}
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
                  <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                    <HelpCircle className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">Weydii Su'aal Dugsiga</h3>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 bg-slate-50 hover:bg-slate-105 border border-slate-200 rounded-lg transition text-slate-400"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Miyaa tahay Mowduuca Su'aasha (Topic/Subject)</label>
                  <input
                    type="text"
                    required
                    placeholder="Tusaale: Tarbiyada, Imtixaanada, Lacagta Iskuulka..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2.5 rounded-xl transition-all focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Qeybta ama Category-ga</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2.5 rounded-xl transition-all focus:outline-none"
                  >
                    <option value="Academics">Academic (Waxbarashada)</option>
                    <option value="Finance">Finance (Lacagaha)</option>
                    <option value="Registration">Registration (Diiwaangelinta)</option>
                    <option value="General">General (Guud)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Su'aasha rasmiga ku qor halkan</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Qor su'aashaada adoo faahfaahin yar bixinaya si jawaab buuxda laguu siiyo..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-2.5 rounded-xl transition-all focus:outline-none resize-none font-semibold text-slate-700"
                  />
                </div>

                <button
                  onClick={handleAskQuestion}
                  disabled={!question || !subject}
                  className="w-full py-3 bg-indigo-650 hover:bg-indigo-750 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-indigo-900/10"
                >
                  Gudbi su'aashaada
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

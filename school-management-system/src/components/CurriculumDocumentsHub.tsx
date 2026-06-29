import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, Filter, Plus, FileText, Download, Trash2, Calendar, Upload, CheckCircle2, User } from 'lucide-react';
import { DocumentMaterial, UserRole } from '../types';

interface CurriculumDocumentsHubProps {
  documents: DocumentMaterial[];
  role: UserRole;
  authorName: string;
  onAddDocument?: (doc: DocumentMaterial) => void;
  onDeleteDocument?: (id: string) => void;
}

export default function CurriculumDocumentsHub({
  documents,
  role,
  authorName,
  onAddDocument,
  onDeleteDocument
}: CurriculumDocumentsHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('Grade 10');
  const [content, setContent] = useState('');
  const [mockFileName, setMockFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Available options
  const grades = ['All', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const subjects = ['All', 'TARBIYO', 'ISLAMIC STUDIES', 'SOMALI', 'MATH', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'All' || doc.grade === selectedGrade;
    const matchesSubject = selectedSubject === 'All' || doc.subject === selectedSubject;
    return matchesSearch && matchesGrade && matchesSubject;
  });

  const handleSimulatedUpload = () => {
    if (!title || !subject || !content) return;
    setIsUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc: DocumentMaterial = {
              id: `DOC-${Math.floor(Math.random() * 90000 + 10000)}`,
              title,
              subject: subject.toUpperCase(),
              grade,
              content,
              url: mockFileName ? `/assets/${mockFileName}` : `https://ais-pre-ctsa52aqwrvtg4dnvlg2ni-545813521853.europe-west1.run.app/assets/${subject.toLowerCase()}_guide.pdf`,
              date: new Date().toISOString().split('T')[0],
              author: authorName
            };
            if (onAddDocument) {
              onAddDocument(newDoc);
            }
            setIsUploading(false);
            setIsAddOpen(false);
            // Reset form
            setTitle('');
            setSubject('');
            setContent('');
            setMockFileName('');
          }, 800);
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  const cleanDeletedDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      if (onDeleteDocument) {
        onDeleteDocument(id);
      }
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === id ? null : prev));
      }, 3000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden" id="curriculum-documents-panel">
      {/* Header banner */}
      <div className="bg-linear-to-r from-teal-700 to-emerald-600 p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-teal-150 tracking-wider font-extrabold uppercase leading-none bg-teal-800/40 px-2.5 py-1 rounded-full border border-teal-500/30">
              Kaydka Manhajka & Maaddooyinka
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Maktabada Manhajka Digitaalka ah (PDFs)</h2>
            <p className="text-xs text-teal-100 max-w-xl">
              Halkan waxaad ku maamuli kartaa oo aad kaga soo bixi kartaa buugaagta manhajka rasmiga ah, syllabus-ka, iyo imtixaanadii hore oo ardayda iyo waalidiinta u diyaar ah.
            </p>
          </div>
          {(role === 'Admin' || role === 'Teacher') && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-teal-800 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-900/15 flex items-center gap-1.5 self-start md:self-center cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Soo Gali Maaddo PDF ah
            </button>
          )}
        </div>
      </div>

      {/* Main interface body */}
      <div className="p-6 space-y-6">
        {/* Search & filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ka raadi maaddooyinka ama buugaagta halkan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-2.5 pl-9 rounded-xl text-xs focus:outline-none transition-all placeholder:text-slate-400 font-semibold"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-500 font-semibold">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Fasalka:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-slate-800 cursor-pointer font-bold"
              >
                {grades.map(g => <option key={g} value={g}>{g === 'All' ? 'Dhammaan' : g}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-500 font-semibold">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Maadada:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-slate-800 cursor-pointer font-bold"
              >
                {subjects.map(s => <option key={s} value={s}>{s === 'All' ? 'Dhammaan' : s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Content list */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl space-y-3 bg-slate-50/50">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <p className="text-xs text-slate-500 font-bold">Kaydka maaddooyinka waa faaruq hadda!</p>
              <p className="text-[10px] text-slate-400">Hubi filters-ka kor maadaama laga yaabo in ay xannibeen maaddooyinka qaarkood.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="documents-grid">
            {filteredDocs.map(doc => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-slate-5/40 hover:bg-slate-50/80 border border-slate-200/70 hover:border-emerald-500/30 rounded-2xl transition-all duration-200 flex flex-col justify-between group relative shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-2.5">
                    <span className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 group-hover:scale-105 transition-all">
                      <FileText className="w-5 h-5" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100/80 text-slate-600 border border-slate-200/50 rounded-full select-none">
                        {doc.grade}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50/80 text-emerald-700 border border-emerald-100/50 rounded-full select-none">
                        {doc.subject}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1.5" title={doc.title}>
                    {doc.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed mb-4">
                    {doc.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100/60 flex items-center justify-between text-[10px] text-slate-400 font-semibold gap-1.5">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-300" />
                    <span className="truncate max-w-[80px]">{doc.author}</span>
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition flex items-center gap-1 shadow-sm shadow-emerald-750/15 cursor-pointer text-[9px]"
                    >
                      <Download className="w-3 h-3" /> Soo Daji PDF
                    </a>
                    {(role === 'Admin' || role === 'Teacher' || doc.author === authorName) && (
                      <button
                        onClick={(e) => cleanDeletedDocument(doc.id, e)}
                        className={`p-1 border rounded-lg transition flex items-center gap-1 ${
                          confirmDeleteId === doc.id
                            ? 'bg-rose-600 border-rose-600 text-white font-extrabold px-2 py-0.5 text-[9px]'
                            : 'text-slate-350 hover:text-rose-600 border-transparent hover:border-rose-100 hover:bg-rose-50'
                        }`}
                        title={confirmDeleteId === doc.id ? "Click again to delete" : "Tirtir maadadan"}
                      >
                        {confirmDeleteId === doc.id ? (
                          <>✕ Ma hubtaa?</>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Simulated Upload modal slider */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-center items-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl border border-slate-100/90 space-y-5"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">Diiwángeli Maaddo Tacliimeed PDF ah</h3>
                </div>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition text-slate-400"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Muuqaalka Maadada (Title)</label>
                  <input
                    type="text"
                    required
                    placeholder="Tusaale: Buugga Tarbiyada Fasalka 10aad..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-2.5 rounded-xl transition-all focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Maadada (Subject)</label>
                    <input
                      type="text"
                      required
                      placeholder="TARBIYO, MATH, SOMALI..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-2.5 rounded-xl transition-all focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fasalka (Target Grade)</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-2.5 rounded-xl transition-all focus:outline-none"
                    >
                      {grades.filter(g => g !== 'All').map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sharaxaad kooban</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Qor faahfaahin yar oo kusaabsan maadadan iyo waxa ay ardaydu ka baran karaan..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-2.5 rounded-xl transition-all focus:outline-none resize-none"
                  />
                </div>

                {/* Drag and Drop pdf uploader placeholder wrapper */}
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500/50 p-4 rounded-xl text-center bg-slate-50/50 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setMockFileName(e.target.files[0].name);
                        if (!title) {
                          // Auto fill title
                          setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1.5">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                    <div className="text-[10px] text-slate-500 leading-none">
                      {mockFileName ? (
                        <div className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {mockFileName}
                        </div>
                      ) : (
                        <span>Riix ama jiid faylka PDF halkan</span>
                      )}
                    </div>
                    <div className="text-[8px] text-slate-400">PDF, DOC oo gaaraya ilaa 10MB</div>
                  </div>
                </div>

                {isUploading ? (
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-[9px] text-slate-400 text-center font-semibold">Simulating secure digital asset compilation... {uploadProgress}%</p>
                  </div>
                ) : (
                  <button
                    onClick={handleSimulatedUpload}
                    disabled={!title || !subject || !content}
                    className="w-full py-3 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-teal-900/10"
                  >
                    Load & Sync PDF-ka
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  ChevronLeft, ChevronRight, Plus, X, Dumbbell, Calendar, Clock,
  ChevronDown, ChevronUp, Trash2, Edit2, BarChart3, TrendingUp, Activity,
  Timer, Target, Flame, LogOut, Mail, Lock, Loader2, Menu, ArrowLeft
} from 'lucide-react';

// ===========================================
// 🔥 FIREBASE CONFIG
// ===========================================
const firebaseConfig = {
  apiKey: "AIzaSyBNC14gl1I_RSktGvLb9aCEVrhrxNAwNSA",
  authDomain: "notatnik-treningowy-9e1fc.firebaseapp.com",
  projectId: "notatnik-treningowy-9e1fc",
  storageBucket: "notatnik-treningowy-9e1fc.firebasestorage.app",
  messagingSenderId: "336214735859",
  appId: "1:336214735859:web:983d2dadcce48055fdb086"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const AuthContext = createContext();
function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    signup: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    logout: () => signOut(auth),
    resetPassword: (email) => sendPasswordResetEmail(auth, email),
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ===========================================
// AUTH SCREEN
// ===========================================
function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'reset') {
      if (!email) return setError('Wpisz adres email');
      setLoading(true);
      try {
        await resetPassword(email);
        setSuccess('Link do resetu hasła wysłany!');
      } catch (err) {
        setError(err.code === 'auth/user-not-found' ? 'Nie znaleziono konta' : 'Wystąpił błąd');
      }
      setLoading(false);
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      return setError('Hasła nie są identyczne');
    }
    if (password.length < 6) return setError('Hasło min. 6 znaków');

    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await signup(email, password);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Email zajęty');
      else if (err.code === 'auth/invalid-credential') setError('Błędny email lub hasło');
      else setError('Wystąpił błąd');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        <div className="text-center mb-5">
          <Dumbbell className="w-10 h-10 text-blue-600 mx-auto mb-2" />
          <h1 className="text-xl font-bold">Notatnik Treningowy</h1>
          <p className="text-gray-500 text-sm">
            {mode === 'login' ? 'Zaloguj się' : mode === 'register' ? 'Rejestracja' : 'Reset hasła'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              required
              className="w-full border rounded-lg px-3 py-2.5 text-base"
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                <Lock className="w-4 h-4" /> Hasło
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="w-full border rounded-lg px-3 py-2.5 text-base"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
                <Lock className="w-4 h-4" /> Potwierdź
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                required
                className="w-full border rounded-lg px-3 py-2.5 text-base"
              />
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 px-3 py-2 rounded-lg text-sm">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {mode === 'login' ? 'Zaloguj' : mode === 'register' ? 'Zarejestruj' : 'Wyślij link'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button onClick={() => { setMode('reset'); setError(''); setSuccess(''); }} className="text-gray-500 text-sm block w-full">
                Nie pamiętasz hasła?
              </button>
              <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }} className="text-blue-600 text-sm">
                Nie masz konta? Zarejestruj się
              </button>
            </>
          )}
          {mode === 'register' && (
            <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-blue-600 text-sm">
              Masz konto? Zaloguj się
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-blue-600 text-sm flex items-center justify-center gap-1 w-full">
              <ArrowLeft className="w-4 h-4" /> Wróć
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// WORKOUT DATA
// ===========================================
const WORKOUT_CATEGORIES = {
  silownia: {
    name: 'Siłownia', icon: '🏋️', color: 'bg-blue-500',
    lightColor: 'bg-blue-100 text-blue-800 border-blue-200',
    subcategories: [
      { id: 'klatka', name: 'Klatka', exercises: ['Wyciskanie sztangi', 'Wyciskanie hantli', 'Rozpiętki', 'Pompki', 'Dipy', 'Inne'] },
      { id: 'plecy', name: 'Plecy', exercises: ['Martwy ciąg', 'Wiosłowanie', 'Podciąganie', 'Ściąganie drążka', 'Inne'] },
      { id: 'barki', name: 'Barki', exercises: ['Military press', 'Wznosy bokiem', 'Face pulls', 'Arnoldki', 'Inne'] },
      { id: 'biceps', name: 'Biceps', exercises: ['Uginanie sztangi', 'Uginanie hantli', 'Młotki', 'Inne'] },
      { id: 'triceps', name: 'Triceps', exercises: ['Francuskie', 'Pompki wąskie', 'Wyciąg', 'Inne'] },
      { id: 'nogi', name: 'Nogi', exercises: ['Przysiad', 'Wykroki', 'Prasa', 'Hip thrust', 'RDL', 'Inne'] },
      { id: 'brzuch', name: 'Brzuch', exercises: ['Plank', 'Crunch', 'Unoszenie nóg', 'Inne'] },
      { id: 'inne_silowe', name: 'Inne', exercises: ['Inne'] },
    ]
  },
  cardio: {
    name: 'Cardio', icon: '🏃', color: 'bg-green-500',
    lightColor: 'bg-green-100 text-green-800 border-green-200',
    subcategories: [
      { id: 'bieganie', name: 'Bieganie', exercises: ['Bieg', 'Bieżnia', 'Interwały', 'Inne'] },
      { id: 'rower', name: 'Rower', exercises: ['Rower stacjonarny', 'Outdoor', 'Spinning', 'Inne'] },
      { id: 'inne_cardio', name: 'Inne', exercises: ['Orbitrek', 'Skakanka', 'HIIT', 'Spacer', 'Inne'] },
    ]
  },
  mobility: {
    name: 'Mobilność', icon: '🧘', color: 'bg-purple-500',
    lightColor: 'bg-purple-100 text-purple-800 border-purple-200',
    subcategories: [
      { id: 'yoga', name: 'Yoga', exercises: ['Vinyasa', 'Hatha', 'Inne'] },
      { id: 'stretching', name: 'Stretching', exercises: ['Ogólne', 'Góra', 'Dół', 'Inne'] },
      { id: 'foam', name: 'Foam rolling', exercises: ['Roller', 'Piłeczka', 'Inne'] },
    ]
  },
};

const MONTHS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

function formatDateKey(date) { return date.toISOString().split('T')[0]; }

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = startDay - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), currentMonth: false });
  for (let i = 1; i <= lastDay.getDate(); i++) days.push({ date: new Date(year, month, i), currentMonth: true });
  while (days.length < 42) days.push({ date: new Date(year, month + 1, days.length - lastDay.getDate() - startDay + 1), currentMonth: false });
  return days;
}

function getWeekDays(date) {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { date: d, currentMonth: true };
  });
}

// ===========================================
// STATS PANEL
// ===========================================
function StatsPanel({ trainings, currentDate, viewMode, onClose }) {
  const getRange = () => {
    if (viewMode === 'day') return { start: currentDate, end: currentDate };
    if (viewMode === 'week') {
      const days = getWeekDays(currentDate);
      return { start: days[0].date, end: days[6].date };
    }
    return {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    };
  };

  const { start, end } = getRange();
  const filtered = Object.entries(trainings).filter(([k]) => {
    const d = new Date(k);
    return d >= start && d <= end;
  });

  const exercises = filtered.flatMap(([_, t]) => t.flatMap(x => x.exercises));
  const totalTrainings = filtered.reduce((a, [_, t]) => a + t.length, 0);
  const totalSets = exercises.reduce((a, e) => a + (parseInt(e.sets) || 0), 0);
  const totalDuration = filtered.reduce((a, [_, t]) => a + t.reduce((b, x) => b + (parseInt(x.duration) || 0), 0), 0);

  const catStats = {};
  exercises.forEach(e => { catStats[e.category] = (catStats[e.category] || 0) + 1; });

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <span className="font-semibold">Statystyki</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 overflow-y-auto">
          <p className="text-xs text-gray-500 mb-3">{start.toLocaleDateString('pl')} - {end.toLocaleDateString('pl')}</p>
          
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
              <Activity className="w-4 h-4 text-blue-600 mx-auto" />
              <p className="text-lg font-bold text-blue-800">{totalTrainings}</p>
              <p className="text-xs text-blue-600">Treningi</p>
            </div>
            <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
              <Target className="w-4 h-4 text-green-600 mx-auto" />
              <p className="text-lg font-bold text-green-800">{totalSets}</p>
              <p className="text-xs text-green-600">Serie</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-2 text-center border border-orange-200">
              <Timer className="w-4 h-4 text-orange-600 mx-auto" />
              <p className="text-lg font-bold text-orange-800">{totalDuration}m</p>
              <p className="text-xs text-orange-600">Czas</p>
            </div>
          </div>

          {Object.keys(catStats).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" /> Kategorie
              </h4>
              {Object.entries(catStats).map(([cat, count]) => {
                const c = WORKOUT_CATEGORIES[cat];
                const pct = exercises.length > 0 ? Math.round((count / exercises.length) * 100) : 0;
                return (
                  <div key={cat} className="flex items-center gap-2 mb-1">
                    <span className="w-16 text-xs truncate">{c?.icon} {c?.name}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className={`${c?.color} h-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}

          {totalTrainings === 0 && (
            <div className="text-center py-6 text-gray-400">
              <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Brak danych</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// TRAINING CARD
// ===========================================
function TrainingCard({ training, dateKey, onEdit, onDelete, onAddExercise }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border rounded overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-1.5 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-1.5 min-w-0">
          <Clock className="w-3 h-3 text-gray-500" />
          <span className="text-xs font-medium">{training.startTime}</span>
          <div className="flex">
            {[...new Set(training.exercises.map(e => e.category))].slice(0, 2).map(c => (
              <span key={c} className="text-xs">{WORKOUT_CATEGORIES[c]?.icon}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">{training.exercises.length}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t">
          {training.note && (
            <div className="px-2 py-1 bg-yellow-50 text-xs text-yellow-800 border-b truncate">📝 {training.note}</div>
          )}
          <div className="p-1.5 space-y-1 max-h-40 overflow-y-auto">
            {training.exercises.map((ex, i) => {
              const cat = WORKOUT_CATEGORIES[ex.category];
              const name = ex.exercise === 'Inne' ? ex.customExercise : ex.exercise;
              return (
                <div key={i} className={`${cat?.lightColor} rounded p-1.5 border text-xs`}>
                  <div className="font-medium truncate">{cat?.icon} {name}</div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {ex.sets && ex.reps && <span className="bg-white/60 px-1 rounded">{ex.sets}×{ex.reps}</span>}
                    {ex.weight && <span className="bg-white/60 px-1 rounded">{ex.weight}kg</span>}
                    {ex.duration && <span className="bg-white/60 px-1 rounded">{ex.duration}min</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex border-t divide-x">
            <button onClick={() => onAddExercise(training)} className="flex-1 py-1.5 text-blue-600 hover:bg-blue-50">
              <Plus className="w-3 h-3 mx-auto" />
            </button>
            <button onClick={() => onEdit(training)} className="flex-1 py-1.5 text-gray-600 hover:bg-gray-50">
              <Edit2 className="w-3 h-3 mx-auto" />
            </button>
            <button onClick={() => onDelete(dateKey, training.id)} className="flex-1 py-1.5 text-red-600 hover:bg-red-50">
              <Trash2 className="w-3 h-3 mx-auto" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================
// EXERCISE FORM
// ===========================================
function ExerciseForm({ exercise, onChange, onRemove, index }) {
  const cat = WORKOUT_CATEGORIES[exercise.category];
  const sub = cat?.subcategories.find(s => s.id === exercise.subcategory);

  return (
    <div className="bg-gray-50 rounded-lg p-2.5 border space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Ćwiczenie {index + 1}</span>
        <button onClick={onRemove} className="p-1 text-red-500"><Trash2 className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {Object.entries(WORKOUT_CATEGORIES).map(([k, c]) => (
          <button
            key={k}
            onClick={() => onChange({ ...exercise, category: k, subcategory: '', exercise: '' })}
            className={`p-1.5 rounded text-center ${exercise.category === k ? `${c.color} text-white` : 'bg-white border'}`}
          >
            <span className="text-base">{c.icon}</span>
            <p className="text-xs mt-0.5">{c.name}</p>
          </button>
        ))}
      </div>

      {exercise.category && (
        <div className="flex flex-wrap gap-1">
          {cat?.subcategories.map(s => (
            <button
              key={s.id}
              onClick={() => onChange({ ...exercise, subcategory: s.id, exercise: '' })}
              className={`px-2 py-1 rounded text-xs ${exercise.subcategory === s.id ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {sub && (
        <select
          value={exercise.exercise}
          onChange={(e) => onChange({ ...exercise, exercise: e.target.value })}
          className="w-full border rounded px-2 py-1.5 text-sm"
        >
          <option value="">Wybierz...</option>
          {sub.exercises.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      )}

      {exercise.exercise === 'Inne' && (
        <input
          type="text"
          value={exercise.customExercise || ''}
          onChange={(e) => onChange({ ...exercise, customExercise: e.target.value })}
          placeholder="Nazwa..."
          className="w-full border rounded px-2 py-1.5 text-sm"
        />
      )}

      {exercise.category === 'silownia' && exercise.exercise && (
        <div className="grid grid-cols-3 gap-1.5">
          <div>
            <label className="text-xs text-gray-500">Serie</label>
            <input type="number" value={exercise.sets || ''} onChange={(e) => onChange({ ...exercise, sets: e.target.value })} placeholder="4" className="w-full border rounded px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Powt.</label>
            <input type="number" value={exercise.reps || ''} onChange={(e) => onChange({ ...exercise, reps: e.target.value })} placeholder="10" className="w-full border rounded px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Kg</label>
            <input type="number" step="0.5" value={exercise.weight || ''} onChange={(e) => onChange({ ...exercise, weight: e.target.value })} placeholder="60" className="w-full border rounded px-2 py-1 text-sm" />
          </div>
        </div>
      )}

      {exercise.category === 'cardio' && exercise.exercise && (
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="text-xs text-gray-500">Czas</label>
            <input type="number" value={exercise.duration || ''} onChange={(e) => onChange({ ...exercise, duration: e.target.value })} placeholder="30min" className="w-full border rounded px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Km</label>
            <input type="number" step="0.1" value={exercise.distance || ''} onChange={(e) => onChange({ ...exercise, distance: e.target.value })} placeholder="5" className="w-full border rounded px-2 py-1 text-sm" />
          </div>
        </div>
      )}

      {exercise.category === 'mobility' && exercise.exercise && (
        <div>
          <label className="text-xs text-gray-500">Czas (min)</label>
          <input type="number" value={exercise.duration || ''} onChange={(e) => onChange({ ...exercise, duration: e.target.value })} placeholder="20" className="w-full border rounded px-2 py-1 text-sm" />
        </div>
      )}
    </div>
  );
}

// ===========================================
// MAIN TRACKER
// ===========================================
function TrainingTracker() {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [trainings, setTrainings] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingTraining, setEditingTraining] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    startTime: '08:00', duration: '', note: '',
    exercises: [{ category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '' }]
  });

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (d) => {
      if (d.exists()) {
        setTrainings(d.data().trainings || {});
        if (d.data().viewMode) setViewMode(d.data().viewMode);
      }
    });
    return unsub;
  }, [user]);

  const save = async (t, v) => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { trainings: t, viewMode: v || viewMode, updatedAt: new Date().toISOString() });
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const today = new Date();
  const todayKey = formatDateKey(today);

  const nav = (dir) => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const getDays = () => {
    if (viewMode === 'day') return [{ date: currentDate, currentMonth: true }];
    if (viewMode === 'week') return getWeekDays(currentDate);
    return getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  };

  const openAdd = (date) => {
    setSelectedDate(date);
    setEditingTraining(null);
    setForm({ startTime: '08:00', duration: '', note: '', exercises: [{ category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '' }] });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditingTraining(t);
    setForm({ startTime: t.startTime, duration: t.duration || '', note: t.note || '', exercises: t.exercises.length ? t.exercises : [{ category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '' }] });
    setShowModal(true);
  };

  const openAddEx = (t) => {
    setEditingTraining(t);
    setForm({ ...t, exercises: [...t.exercises, { category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '' }] });
    setShowModal(true);
  };

  const saveTraining = () => {
    const dateKey = editingTraining ? Object.keys(trainings).find(k => trainings[k].some(t => t.id === editingTraining.id)) : formatDateKey(selectedDate);
    const valid = form.exercises.filter(e => e.exercise);
    if (!valid.length) return;

    const t = { id: editingTraining?.id || Date.now(), startTime: form.startTime, duration: form.duration, note: form.note, exercises: valid };
    const newT = editingTraining
      ? { ...trainings, [dateKey]: trainings[dateKey].map(x => x.id === editingTraining.id ? t : x) }
      : { ...trainings, [dateKey]: [...(trainings[dateKey] || []), t] };
    
    setTrainings(newT);
    save(newT);
    setShowModal(false);
  };

  const deleteTraining = (dk, id) => {
    const newT = { ...trainings, [dk]: trainings[dk].filter(t => t.id !== id) };
    setTrainings(newT);
    save(newT);
  };

  const title = () => {
    if (viewMode === 'day') return `${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]}`;
    if (viewMode === 'week') {
      const d = getWeekDays(currentDate);
      return `${d[0].date.getDate()}-${d[6].date.getDate()} ${MONTHS[d[0].date.getMonth()]}`;
    }
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const days = getDays();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-2 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Dumbbell className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-sm">Notatnik</span>
            {saving && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
          </div>
          <div className="flex items-center">
            <button onClick={() => setShowStats(true)} className="p-2 text-purple-600">
              <BarChart3 className="w-5 h-5" />
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-gray-600">
                <Menu className="w-5 h-5" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full bg-white border rounded-lg shadow-lg py-1 min-w-[150px] z-20">
                    <div className="px-3 py-2 border-b text-xs text-gray-500 truncate">{user?.email}</div>
                    <button onClick={() => { logout(); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-sm text-red-600 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Wyloguj
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={() => nav(-1)} className="p-1"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => nav(1)} className="p-1"><ChevronRight className="w-5 h-5" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-2 py-0.5 text-xs text-blue-600 font-medium">Dziś</button>
          </div>
          <span className="font-semibold text-sm">{title()}</span>
          <div className="flex bg-gray-100 rounded p-0.5">
            {[{ id: 'day', l: 'D' }, { id: 'week', l: 'T' }, { id: 'month', l: 'M' }].map(m => (
              <button key={m.id} onClick={() => { setViewMode(m.id); save(trainings, m.id); }}
                className={`px-2 py-0.5 rounded text-xs font-medium ${viewMode === m.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>
                {m.l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Calendar */}
      <main className="p-1">
        {viewMode !== 'day' && (
          <div className="grid grid-cols-7 gap-px mb-px">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => (
              <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
            ))}
          </div>
        )}

        <div className={`grid ${viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'} gap-px`}>
          {days.map(({ date, currentMonth }, i) => {
            const dk = formatDateKey(date);
            const dt = trainings[dk] || [];
            const isToday = dk === todayKey;

            return (
              <div key={i} className={`bg-white border rounded overflow-hidden
                ${viewMode === 'day' ? 'min-h-[78vh]' : viewMode === 'week' ? 'min-h-[80px]' : 'min-h-[48px]'}
                ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
                ${!currentMonth ? 'opacity-40' : ''}`}>
                <div className={`flex items-center justify-between px-1 py-0.5 border-b ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <span className={`text-xs font-semibold ${isToday ? 'text-blue-600' : ''}`}>{date.getDate()}</span>
                  <button onClick={() => openAdd(date)} className="p-0.5"><Plus className="w-3 h-3 text-gray-500" /></button>
                </div>
                <div className={`p-0.5 space-y-0.5 overflow-y-auto ${viewMode === 'day' ? 'max-h-[73vh]' : viewMode === 'week' ? 'max-h-[60px]' : 'max-h-[26px]'}`}>
                  {viewMode === 'month' ? (
                    dt.slice(0, 2).map(t => (
                      <div key={t.id} onClick={() => { setSelectedDate(date); openEdit(t); }}
                        className="bg-blue-100 text-blue-800 rounded px-1 py-0.5 text-xs cursor-pointer truncate">
                        {t.startTime}
                      </div>
                    ))
                  ) : (
                    dt.map(t => (
                      <TrainingCard key={t.id} training={t} dateKey={dk}
                        onEdit={() => { setSelectedDate(date); openEdit(t); }}
                        onDelete={deleteTraining}
                        onAddExercise={() => { setSelectedDate(date); openAddEx(t); }} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Stats */}
      {showStats && <StatsPanel trainings={trainings} currentDate={currentDate} viewMode={viewMode} onClose={() => setShowStats(false)} />}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm max-h-[88vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold text-sm">{editingTraining ? 'Edytuj' : 'Nowy trening'}</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{selectedDate?.toLocaleDateString('pl', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-600">Godzina</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full border rounded px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Czas (min)</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="60" className="w-full border rounded px-2 py-1.5 text-sm" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-600">Notatka</label>
                <input type="text" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Push day..." className="w-full border rounded px-2 py-1.5 text-sm" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-700">Ćwiczenia</label>
                  <button onClick={() => setForm({ ...form, exercises: [...form.exercises, { category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '' }] })}
                    className="text-xs text-blue-600 flex items-center gap-0.5">
                    <Plus className="w-3 h-3" /> Dodaj
                  </button>
                </div>
                <div className="space-y-2">
                  {form.exercises.map((ex, i) => (
                    <ExerciseForm key={i} exercise={ex} index={i}
                      onChange={(e) => setForm({ ...form, exercises: form.exercises.map((x, j) => j === i ? e : x) })}
                      onRemove={() => setForm({ ...form, exercises: form.exercises.filter((_, j) => j !== i) })} />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 border-t bg-gray-50 flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg text-sm font-medium">Anuluj</button>
              <button onClick={saveTraining} disabled={!form.exercises.some(e => e.exercise)}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================
// APP
// ===========================================
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  return user ? <TrainingTracker /> : <AuthScreen />;
}

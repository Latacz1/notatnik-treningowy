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
  Timer, Target, Flame, LogOut, Mail, Lock, Loader2, Menu, ArrowLeft, Check
} from 'lucide-react';

// ===========================================
// FIREBASE CONFIG
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
        setSuccess('Link do resetu hasła wysłany! Sprawdź też folder SPAM.');
      } catch (err) {
        console.error('Reset error:', err);
        if (err.code === 'auth/user-not-found') setError('Nie znaleziono konta z tym emailem');
        else if (err.code === 'auth/invalid-email') setError('Nieprawidłowy format email');
        else setError('Wystąpił błąd: ' + err.message);
      }
      setLoading(false);
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      return setError('Hasła nie są identyczne');
    }
    if (password.length < 6) return setError('Hasło musi mieć minimum 6 znaków');

    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await signup(email, password);
    } catch (err) {
      console.error('Auth error:', err);
      if (err.code === 'auth/email-already-in-use') setError('Ten email jest już zarejestrowany');
      else if (err.code === 'auth/invalid-credential') setError('Nieprawidłowy email lub hasło');
      else if (err.code === 'auth/invalid-email') setError('Nieprawidłowy format email');
      else setError('Wystąpił błąd: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Notatnik Treningowy</h1>
          <p className="text-gray-500 mt-2">
            {mode === 'login' ? 'Zaloguj się do konta' : mode === 'register' ? 'Stwórz nowe konto' : 'Zresetuj hasło'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adres email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@przykład.pl"
                required
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Potwierdź hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <Check className="w-5 h-5" />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-indigo-200"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {mode === 'login' ? 'Zaloguj się' : mode === 'register' ? 'Zarejestruj się' : 'Wyślij link resetujący'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {mode === 'login' && (
            <>
              <button 
                onClick={() => { setMode('reset'); setError(''); setSuccess(''); }} 
                className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
              >
                Nie pamiętasz hasła?
              </button>
              <div className="border-t pt-4">
                <button 
                  onClick={() => { setMode('register'); setError(''); setSuccess(''); }} 
                  className="w-full text-indigo-600 hover:text-indigo-800 font-semibold py-2 transition-colors"
                >
                  Nie masz konta? Zarejestruj się
                </button>
              </div>
            </>
          )}
          {mode === 'register' && (
            <button 
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }} 
              className="w-full text-indigo-600 hover:text-indigo-800 font-semibold py-2 transition-colors"
            >
              Masz już konto? Zaloguj się
            </button>
          )}
          {mode === 'reset' && (
            <button 
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }} 
              className="w-full text-indigo-600 hover:text-indigo-800 font-semibold py-2 flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Wróć do logowania
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
    name: 'Siłownia', icon: '🏋️', color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600',
    lightColor: 'bg-blue-50 text-blue-900 border-blue-200',
    subcategories: [
      { id: 'klatka', name: 'Klatka piersiowa', exercises: ['Wyciskanie sztangi', 'Wyciskanie hantli', 'Rozpiętki', 'Pompki', 'Dipy', 'Wyciskanie na skosie', 'Inne'] },
      { id: 'plecy', name: 'Plecy', exercises: ['Martwy ciąg', 'Wiosłowanie sztangą', 'Podciąganie', 'Ściąganie drążka', 'Wiosłowanie hantlem', 'Inne'] },
      { id: 'barki', name: 'Barki', exercises: ['Military press', 'Wznosy bokiem', 'Wznosy przodem', 'Face pulls', 'Arnoldki', 'Inne'] },
      { id: 'biceps', name: 'Biceps', exercises: ['Uginanie sztangi', 'Uginanie hantli', 'Młotki', 'Uginanie na modlitewniku', 'Inne'] },
      { id: 'triceps', name: 'Triceps', exercises: ['Francuskie wyciskanie', 'Pompki wąskie', 'Prostowanie na wyciągu', 'Dipy', 'Inne'] },
      { id: 'nogi', name: 'Nogi', exercises: ['Przysiad', 'Wykroki', 'Prasa nożna', 'Wyprost nóg', 'Uginanie nóg', 'Hip thrust', 'Martwy ciąg rumuński', 'Inne'] },
      { id: 'brzuch', name: 'Brzuch', exercises: ['Plank', 'Brzuszki', 'Unoszenie nóg', 'Russian twist', 'Inne'] },
      { id: 'inne_silowe', name: 'Inne', exercises: ['Inne'] },
    ]
  },
  cardio: {
    name: 'Cardio', icon: '🏃', color: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600',
    lightColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    subcategories: [
      { id: 'bieganie', name: 'Bieganie', exercises: ['Bieg na zewnątrz', 'Bieżnia', 'Interwały', 'Tempo run', 'Inne'] },
      { id: 'rower', name: 'Rower', exercises: ['Rower stacjonarny', 'Rower outdoor', 'Spinning', 'Inne'] },
      { id: 'plywanie', name: 'Pływanie', exercises: ['Kraul', 'Żabka', 'Grzbiet', 'Dowolnie', 'Inne'] },
      { id: 'inne_cardio', name: 'Inne cardio', exercises: ['Orbitrek', 'Wioślarnia', 'Skakanka', 'HIIT', 'Spacer', 'Inne'] },
    ]
  },
  mobility: {
    name: 'Mobilność', icon: '🧘', color: 'bg-violet-500', gradient: 'from-violet-500 to-violet-600',
    lightColor: 'bg-violet-50 text-violet-900 border-violet-200',
    subcategories: [
      { id: 'yoga', name: 'Yoga', exercises: ['Vinyasa', 'Hatha', 'Power yoga', 'Yin yoga', 'Inne'] },
      { id: 'stretching', name: 'Stretching', exercises: ['Rozciąganie ogólne', 'Góra ciała', 'Dół ciała', 'Dynamiczne', 'Inne'] },
      { id: 'foam', name: 'Foam rolling', exercises: ['Roller plecy', 'Roller nogi', 'Piłeczka', 'Inne'] },
    ]
  },
};

const DAYS_SHORT = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
const DAYS_FULL = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
const MONTHS = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

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
  const totalReps = exercises.reduce((a, e) => a + ((parseInt(e.sets) || 0) * (parseInt(e.reps) || 0)), 0);
  const totalWeight = exercises.reduce((a, e) => a + ((parseInt(e.sets) || 0) * (parseInt(e.reps) || 0) * (parseFloat(e.weight) || 0)), 0);
  const totalDuration = filtered.reduce((a, [_, t]) => a + t.reduce((b, x) => b + (parseInt(x.duration) || 0), 0), 0);

  const catStats = {};
  exercises.forEach(e => { catStats[e.category] = (catStats[e.category] || 0) + 1; });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Statystyki</h3>
                <p className="text-white/70 text-sm">{start.toLocaleDateString('pl')} - {end.toLocaleDateString('pl')}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
              <Activity className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-3xl font-bold text-blue-900">{totalTrainings}</p>
              <p className="text-blue-600 font-medium">Treningów</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200">
              <Target className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-3xl font-bold text-emerald-900">{totalSets}</p>
              <p className="text-emerald-600 font-medium">Serii</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
              <Timer className="w-8 h-8 text-orange-600 mb-2" />
              <p className="text-3xl font-bold text-orange-900">{totalDuration}</p>
              <p className="text-orange-600 font-medium">Minut</p>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl p-5 border border-violet-200">
              <TrendingUp className="w-8 h-8 text-violet-600 mb-2" />
              <p className="text-3xl font-bold text-violet-900">{(totalWeight/1000).toFixed(1)}t</p>
              <p className="text-violet-600 font-medium">Tonażu</p>
            </div>
          </div>

          {Object.keys(catStats).length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-5">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> Podział na kategorie
              </h4>
              <div className="space-y-3">
                {Object.entries(catStats).map(([cat, count]) => {
                  const c = WORKOUT_CATEGORIES[cat];
                  const pct = exercises.length > 0 ? Math.round((count / exercises.length) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{c?.icon} {c?.name}</span>
                        <span className="font-bold">{pct}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${c?.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {totalTrainings === 0 && (
            <div className="text-center py-12 text-gray-400">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Brak danych w tym okresie</p>
              <p className="text-sm mt-1">Dodaj treningi, aby zobaczyć statystyki</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================================
// TRAINING CARD (Desktop)
// ===========================================
function TrainingCardDesktop({ training, dateKey, onEdit, onDelete, onAddExercise, compact = false }) {
  const [expanded, setExpanded] = useState(!compact);
  const categories = [...new Set(training.exercises.map(e => e.category))];

  if (compact) {
    return (
      <div
        onClick={() => onEdit(training)}
        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl p-3 cursor-pointer hover:shadow-lg transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 opacity-80" />
            <span className="font-semibold">{training.startTime}</span>
          </div>
          <div className="flex gap-1">
            {categories.map(c => (
              <span key={c} className="text-lg">{WORKOUT_CATEGORIES[c]?.icon}</span>
            ))}
          </div>
        </div>
        {training.note && (
          <p className="text-sm text-white/80 mt-1 truncate">{training.note}</p>
        )}
        <div className="text-xs text-white/70 mt-1">
          {training.exercises.length} ćwiczeń
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
            {training.startTime.split(':')[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{training.startTime}</span>
              {training.duration && (
                <span className="text-gray-500">• {training.duration} min</span>
              )}
            </div>
            {training.note && (
              <p className="text-gray-500 text-sm">{training.note}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {categories.map(c => (
              <span key={c} className="text-2xl">{WORKOUT_CATEGORIES[c]?.icon}</span>
            ))}
          </div>
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-semibold text-sm">
            {training.exercises.length}
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t-2 border-gray-100">
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {training.exercises.map((ex, i) => {
              const cat = WORKOUT_CATEGORIES[ex.category];
              const name = ex.exercise === 'Inne' ? ex.customExercise : ex.exercise;
              return (
                <div key={i} className={`${cat?.lightColor} rounded-xl p-4 border-2`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{cat?.icon}</span>
                    <span className="font-semibold text-lg">{name}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ex.sets && ex.reps && (
                      <span className="bg-white px-3 py-1.5 rounded-lg font-medium shadow-sm">
                        {ex.sets} × {ex.reps} powtórzeń
                      </span>
                    )}
                    {ex.weight && (
                      <span className="bg-white px-3 py-1.5 rounded-lg font-medium shadow-sm">
                        {ex.weight} kg
                      </span>
                    )}
                    {ex.duration && (
                      <span className="bg-white px-3 py-1.5 rounded-lg font-medium shadow-sm">
                        {ex.duration} min
                      </span>
                    )}
                    {ex.distance && (
                      <span className="bg-white px-3 py-1.5 rounded-lg font-medium shadow-sm">
                        {ex.distance} km
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex border-t-2 border-gray-100">
            <button 
              onClick={(e) => { e.stopPropagation(); onAddExercise(training); }}
              className="flex-1 py-4 text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-2 font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" /> Dodaj ćwiczenie
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(training); }}
              className="flex-1 py-4 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 font-semibold transition-colors border-l-2 border-gray-100"
            >
              <Edit2 className="w-5 h-5" /> Edytuj
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(dateKey, training.id); }}
              className="flex-1 py-4 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 font-semibold transition-colors border-l-2 border-gray-100"
            >
              <Trash2 className="w-5 h-5" /> Usuń
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
    <div className="bg-gray-50 rounded-2xl p-5 border-2 border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-700">Ćwiczenie {index + 1}</span>
        <button onClick={onRemove} className="w-10 h-10 text-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Object.entries(WORKOUT_CATEGORIES).map(([k, c]) => (
          <button
            key={k}
            onClick={() => onChange({ ...exercise, category: k, subcategory: '', exercise: '' })}
            className={`p-4 rounded-xl text-center transition-all ${
              exercise.category === k 
                ? `bg-gradient-to-br ${c.gradient} text-white shadow-lg` 
                : 'bg-white border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-3xl block mb-1">{c.icon}</span>
            <span className="font-semibold text-sm">{c.name}</span>
          </button>
        ))}
      </div>

      {exercise.category && (
        <div className="flex flex-wrap gap-2">
          {cat?.subcategories.map(s => (
            <button
              key={s.id}
              onClick={() => onChange({ ...exercise, subcategory: s.id, exercise: '' })}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                exercise.subcategory === s.id 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
              }`}
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
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        >
          <option value="">Wybierz ćwiczenie...</option>
          {sub.exercises.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      )}

      {exercise.exercise === 'Inne' && (
        <input
          type="text"
          value={exercise.customExercise || ''}
          onChange={(e) => onChange({ ...exercise, customExercise: e.target.value })}
          placeholder="Wpisz nazwę ćwiczenia..."
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        />
      )}

      {exercise.category === 'silownia' && exercise.exercise && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Serie</label>
            <input 
              type="number" 
              value={exercise.sets || ''} 
              onChange={(e) => onChange({ ...exercise, sets: e.target.value })} 
              placeholder="4" 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-indigo-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Powtórzenia</label>
            <input 
              type="number" 
              value={exercise.reps || ''} 
              onChange={(e) => onChange({ ...exercise, reps: e.target.value })} 
              placeholder="10" 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-indigo-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Ciężar (kg)</label>
            <input 
              type="number" 
              step="0.5" 
              value={exercise.weight || ''} 
              onChange={(e) => onChange({ ...exercise, weight: e.target.value })} 
              placeholder="60" 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-indigo-500" 
            />
          </div>
        </div>
      )}

      {exercise.category === 'cardio' && exercise.exercise && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Czas (min)</label>
            <input 
              type="number" 
              value={exercise.duration || ''} 
              onChange={(e) => onChange({ ...exercise, duration: e.target.value })} 
              placeholder="30" 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-indigo-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Dystans (km)</label>
            <input 
              type="number" 
              step="0.1" 
              value={exercise.distance || ''} 
              onChange={(e) => onChange({ ...exercise, distance: e.target.value })} 
              placeholder="5" 
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-indigo-500" 
            />
          </div>
        </div>
      )}

      {exercise.category === 'mobility' && exercise.exercise && (
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Czas (min)</label>
          <input 
            type="number" 
            value={exercise.duration || ''} 
            onChange={(e) => onChange({ ...exercise, duration: e.target.value })} 
            placeholder="20" 
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-indigo-500" 
          />
        </div>
      )}
    </div>
  );
}

// ===========================================
// MOBILE VIEW
// ===========================================
function MobileView({ trainings, selectedDate, onSelectDate, onAddTraining, onEditTraining, onDeleteTraining, onAddExercise, currentWeekStart }) {
  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(selectedDate);
  const dayTrainings = trainings[selectedKey] || [];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Week Strip */}
      <div className="bg-white border-b shadow-sm px-2 py-4">
        <div className="flex justify-between gap-1">
          {weekDays.map((date, i) => {
            const dk = formatDateKey(date);
            const isToday = dk === todayKey;
            const isSelected = dk === selectedKey;
            const hasTraining = trainings[dk]?.length > 0;
            
            return (
              <button
                key={i}
                onClick={() => onSelectDate(date)}
                className={`flex-1 flex flex-col items-center py-3 rounded-2xl transition-all ${
                  isSelected 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-105' 
                    : isToday 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'hover:bg-gray-100'
                }`}
              >
                <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {DAYS_SHORT[date.getDay()]}
                </span>
                <span className={`text-xl font-bold mt-1 ${isSelected ? '' : isToday ? 'text-indigo-700' : ''}`}>
                  {date.getDate()}
                </span>
                {hasTraining && (
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Header */}
      <div className="bg-white px-5 py-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl text-gray-900">
            {DAYS_FULL[selectedDate.getDay()]}
          </h2>
          <p className="text-gray-500">
            {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </p>
        </div>
        <button
          onClick={() => onAddTraining(selectedDate)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Nowy trening
        </button>
      </div>

      {/* Training List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {dayTrainings.length > 0 ? (
          dayTrainings.map(training => (
            <TrainingCardDesktop
              key={training.id}
              training={training}
              dateKey={selectedKey}
              onEdit={() => onEditTraining(training)}
              onDelete={onDeleteTraining}
              onAddExercise={() => onAddExercise(training)}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-gray-900 font-semibold text-lg">Brak treningów</p>
            <p className="text-gray-500 mt-2">Kliknij "Nowy trening" aby dodać</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===========================================
// DESKTOP VIEW
// ===========================================
function DesktopView({ trainings, currentDate, viewMode, selectedDate, onSelectDate, onAddTraining, onEditTraining, onDeleteTraining, onAddExercise }) {
  const todayKey = formatDateKey(new Date());
  const selectedKey = formatDateKey(selectedDate);
  
  const getDays = () => {
    if (viewMode === 'week') return getWeekDays(currentDate);
    return getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  };

  const days = getDays();
  const isWeek = viewMode === 'week';

  return (
    <div className="flex h-full">
      {/* Calendar Grid */}
      <div className={`${isWeek ? 'flex-1' : 'w-full'} p-4`}>
        {/* Day Headers */}
        <div className={`grid ${isWeek ? 'grid-cols-7' : 'grid-cols-7'} gap-2 mb-2`}>
          {['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'].map((d, i) => (
            <div key={d} className="text-center py-3 font-semibold text-gray-600">
              {isWeek ? d : d.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className={`grid grid-cols-7 gap-2 ${isWeek ? 'h-[calc(100vh-200px)]' : ''}`}>
          {days.map(({ date, currentMonth }, i) => {
            const dk = formatDateKey(date);
            const dt = trainings[dk] || [];
            const isToday = dk === todayKey;
            const isSelected = dk === selectedKey;

            return (
              <div
                key={i}
                onClick={() => onSelectDate(date)}
                className={`
                  bg-white rounded-2xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg
                  ${isWeek ? 'flex flex-col' : 'min-h-[120px]'}
                  ${isToday ? 'border-indigo-500 shadow-md' : isSelected ? 'border-purple-400' : 'border-gray-100'}
                  ${!currentMonth ? 'opacity-40' : ''}
                `}
              >
                {/* Day Header */}
                <div className={`flex items-center justify-between px-3 py-2 border-b ${
                  isToday ? 'bg-indigo-50' : 'bg-gray-50'
                }`}>
                  <span className={`font-bold ${isToday ? 'text-indigo-600' : ''} ${isWeek ? 'text-lg' : 'text-sm'}`}>
                    {date.getDate()}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAddTraining(date); }}
                    className={`${isWeek ? 'w-8 h-8' : 'w-6 h-6'} hover:bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 transition-colors`}
                  >
                    <Plus className={isWeek ? 'w-5 h-5' : 'w-4 h-4'} />
                  </button>
                </div>

                {/* Trainings */}
                <div className={`p-2 space-y-2 overflow-y-auto ${isWeek ? 'flex-1' : 'max-h-[80px]'}`}>
                  {dt.map(t => (
                    <TrainingCardDesktop
                      key={t.id}
                      training={t}
                      dateKey={dk}
                      onEdit={() => onEditTraining(t, date)}
                      onDelete={onDeleteTraining}
                      onAddExercise={() => onAddExercise(t, date)}
                      compact={!isWeek}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Panel for selected day (week view) */}
      {isWeek && (
        <div className="w-96 border-l-2 border-gray-100 bg-gray-50 p-4 overflow-y-auto">
          <div className="mb-4">
            <h3 className="font-bold text-xl text-gray-900">
              {DAYS_FULL[selectedDate.getDay()]}
            </h3>
            <p className="text-gray-500">
              {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}
            </p>
          </div>
          
          <button
            onClick={() => onAddTraining(selectedDate)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mb-4 shadow-lg"
          >
            <Plus className="w-5 h-5" /> Dodaj trening
          </button>

          <div className="space-y-3">
            {(trainings[selectedKey] || []).map(t => (
              <TrainingCardDesktop
                key={t.id}
                training={t}
                dateKey={selectedKey}
                onEdit={() => onEditTraining(t, selectedDate)}
                onDelete={onDeleteTraining}
                onAddExercise={() => onAddExercise(t, selectedDate)}
              />
            ))}
            {!(trainings[selectedKey]?.length) && (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Brak treningów</p>
              </div>
            )}
          </div>
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [trainings, setTrainings] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  const [form, setForm] = useState({
    startTime: '08:00', duration: '', note: '',
    exercises: [{ category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '' }]
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()));

  const nav = (dir) => {
    if (isMobile) {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() + dir * 7);
      setCurrentWeekStart(newWeekStart);
      setSelectedDate(newWeekStart);
    } else {
      const d = new Date(currentDate);
      if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
      else d.setMonth(d.getMonth() + dir);
      setCurrentDate(d);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setCurrentWeekStart(getWeekStart(today));
  };

  const openAdd = (date) => {
    setSelectedDate(date);
    setEditingTraining(null);
    setForm({ startTime: '08:00', duration: '', note: '', exercises: [{ category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '' }] });
    setShowModal(true);
  };

  const openEdit = (t, date) => {
    if (date) setSelectedDate(date);
    setEditingTraining(t);
    setForm({ startTime: t.startTime, duration: t.duration || '', note: t.note || '', exercises: t.exercises.length ? t.exercises : [{ category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '' }] });
    setShowModal(true);
  };

  const openAddEx = (t, date) => {
    if (date) setSelectedDate(date);
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
    if (isMobile) {
      return MONTHS[currentWeekStart.getMonth()] + ' ' + currentWeekStart.getFullYear();
    }
    if (viewMode === 'week') {
      const d = getWeekDays(currentDate);
      return `${d[0].date.getDate()} - ${d[6].date.getDate()} ${MONTHS[d[0].date.getMonth()]} ${d[0].date.getFullYear()}`;
    }
    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:block">Notatnik Treningowy</span>
            {saving && <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowStats(true)} 
              className="w-10 h-10 lg:w-auto lg:px-4 lg:py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-xl flex items-center justify-center lg:gap-2 font-semibold transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden lg:inline">Statystyki</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)} 
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-white border rounded-2xl shadow-xl py-2 min-w-[220px] z-20">
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold text-gray-900 truncate">{user?.email}</p>
                      <p className="text-sm text-gray-500">Zalogowany</p>
                    </div>
                    <button 
                      onClick={() => { logout(); setShowMenu(false); }} 
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium transition-colors"
                    >
                      <LogOut className="w-5 h-5" /> Wyloguj się
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 lg:px-6 py-3 flex items-center justify-between border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => nav(-1)} 
              className="w-10 h-10 bg-white hover:bg-gray-100 border rounded-xl flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => nav(1)} 
              className="w-10 h-10 bg-white hover:bg-gray-100 border rounded-xl flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={goToToday} 
              className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl font-semibold transition-colors"
            >
              Dziś
            </button>
          </div>
          
          <h2 className="font-bold text-lg lg:text-xl">{title()}</h2>
          
          {!isMobile && (
            <div className="flex bg-white border rounded-xl p-1">
              {[{ id: 'week', label: 'Tydzień' }, { id: 'month', label: 'Miesiąc' }].map(m => (
                <button
                  key={m.id}
                  onClick={() => { setViewMode(m.id); save(trainings, m.id); }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    viewMode === m.id 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
          
          {isMobile && <div className="w-20" />}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        {isMobile ? (
          <MobileView
            trainings={trainings}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onAddTraining={openAdd}
            onEditTraining={openEdit}
            onDeleteTraining={deleteTraining}
            onAddExercise={openAddEx}
            currentWeekStart={currentWeekStart}
          />
        ) : (
          <DesktopView
            trainings={trainings}
            currentDate={currentDate}
            viewMode={viewMode}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onAddTraining={openAdd}
            onEditTraining={openEdit}
            onDeleteTraining={deleteTraining}
            onAddExercise={openAddEx}
          />
        )}
      </main>

      {/* Stats */}
      {showStats && <StatsPanel trainings={trainings} currentDate={isMobile ? selectedDate : currentDate} viewMode={viewMode} onClose={() => setShowStats(false)} />}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl">{editingTraining ? 'Edytuj trening' : 'Nowy trening'}</h3>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {selectedDate?.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-10 h-10 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Godzina rozpoczęcia</label>
                  <input 
                    type="time" 
                    value={form.startTime} 
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Czas trwania (min)</label>
                  <input 
                    type="number" 
                    value={form.duration} 
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="60" 
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-indigo-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notatka (opcjonalnie)</label>
                <input 
                  type="text" 
                  value={form.note} 
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="np. Push day, FBW, Cardio..." 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-indigo-500" 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="font-bold text-lg">Ćwiczenia</label>
                  <button 
                    onClick={() => setForm({ ...form, exercises: [...form.exercises, { category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '' }] })}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" /> Dodaj ćwiczenie
                  </button>
                </div>
                <div className="space-y-4">
                  {form.exercises.map((ex, i) => (
                    <ExerciseForm 
                      key={i} 
                      exercise={ex} 
                      index={i}
                      onChange={(e) => setForm({ ...form, exercises: form.exercises.map((x, j) => j === i ? e : x) })}
                      onRemove={() => setForm({ ...form, exercises: form.exercises.filter((_, j) => j !== i) })} 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 py-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Anuluj
              </button>
              <button 
                onClick={saveTraining} 
                disabled={!form.exercises.some(e => e.exercise)}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
              >
                Zapisz trening
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
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80 font-medium">Ładowanie...</p>
        </div>
      </div>
    );
  }
  return user ? <TrainingTracker /> : <AuthScreen />;
}

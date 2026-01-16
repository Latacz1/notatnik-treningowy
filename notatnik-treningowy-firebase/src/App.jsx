import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  ChevronLeft, ChevronRight, Plus, X, Dumbbell, Calendar, Clock, Weight, Repeat, 
  ChevronDown, ChevronUp, Trash2, Edit2, BarChart3, Filter, TrendingUp, Activity,
  Timer, Target, Flame, LogOut, User, Mail, Lock, Loader2
} from 'lucide-react';

// ===========================================
// 🔥 FIREBASE CONFIG - UZUPEŁNIJ SWOIMI DANYMI
// ===========================================
const firebaseConfig = {
  apiKey: "TWOJ_API_KEY",
  authDomain: "TWOJ_PROJEKT.firebaseapp.com",
  projectId: "TWOJ_PROJEKT",
  storageBucket: "TWOJ_PROJEKT.appspot.com",
  messagingSenderId: "TWOJ_SENDER_ID",
  appId: "TWOJ_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth Context
const AuthContext = createContext();

function useAuth() {
  return useContext(AuthContext);
}

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

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = { user, signup, login, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ===========================================
// AUTH COMPONENT (Login/Register)
// ===========================================
function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      return setError('Hasła nie są identyczne');
    }

    if (password.length < 6) {
      return setError('Hasło musi mieć minimum 6 znaków');
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Ten email jest już zarejestrowany');
      } else if (err.code === 'auth/invalid-email') {
        setError('Nieprawidłowy adres email');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Nieprawidłowy email lub hasło');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Nieprawidłowy email lub hasło');
      } else {
        setError('Wystąpił błąd. Spróbuj ponownie.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Dumbbell className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Notatnik Treningowy</h1>
          <p className="text-gray-500 mt-1">
            {isLogin ? 'Zaloguj się do swojego konta' : 'Stwórz nowe konto'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Lock className="w-4 h-4 inline mr-1" />
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="w-4 h-4 inline mr-1" />
                Potwierdź hasło
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===========================================
// WORKOUT CATEGORIES
// ===========================================
const WORKOUT_CATEGORIES = {
  silownia: {
    name: 'Siłownia',
    icon: '🏋️',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100 text-blue-800 border-blue-300',
    subcategories: [
      { id: 'klatka', name: 'Klatka piersiowa', exercises: ['Wyciskanie sztangi', 'Wyciskanie hantli', 'Rozpiętki', 'Pompki', 'Dipy', 'Wyciskanie na skosie', 'Inne'] },
      { id: 'plecy', name: 'Plecy', exercises: ['Martwy ciąg', 'Wiosłowanie sztangą', 'Podciąganie', 'Ściąganie drążka', 'Wiosłowanie hantlem', 'Pullover', 'Inne'] },
      { id: 'barki', name: 'Barki', exercises: ['Wyciskanie military', 'Wznosy bokiem', 'Wznosy przodem', 'Face pulls', 'Arnoldki', 'Odwrotne rozpiętki', 'Inne'] },
      { id: 'biceps', name: 'Biceps', exercises: ['Uginanie sztangi', 'Uginanie hantli', 'Młotki', 'Uginanie na modlitewniku', 'Koncentracja', 'Uginanie na wyciągu', 'Inne'] },
      { id: 'triceps', name: 'Triceps', exercises: ['Francuskie wyciskanie', 'Pompki wąskie', 'Prostowanie na wyciągu', 'Wyciskanie wąskim chwytem', 'Kickback', 'Inne'] },
      { id: 'nogi', name: 'Nogi', exercises: ['Przysiad', 'Wykroki', 'Prasa', 'Wyprost nóg', 'Uginanie nóg', 'Hip thrust', 'Przysiad bułgarski', 'Martwy ciąg rumuński', 'Inne'] },
      { id: 'brzuch', name: 'Brzuch', exercises: ['Plank', 'Crunch', 'Unoszenie nóg', 'Russian twist', 'Dead bug', 'Wznosy nóg w zwisie', 'Inne'] },
      { id: 'inne_silowe', name: 'Inne', exercises: ['Inne'] },
    ]
  },
  cardio: {
    name: 'Cardio',
    icon: '🏃',
    color: 'bg-green-500',
    lightColor: 'bg-green-100 text-green-800 border-green-300',
    subcategories: [
      { id: 'bieganie', name: 'Bieganie', exercises: ['Bieg na zewnątrz', 'Bieżnia', 'Interwały', 'Tempo run', 'Inne'] },
      { id: 'rower', name: 'Rower', exercises: ['Rower stacjonarny', 'Rower outdoor', 'Spinning', 'Inne'] },
      { id: 'plywanie', name: 'Pływanie', exercises: ['Kraul', 'Żabka', 'Grzbiet', 'Dowolnie', 'Inne'] },
      { id: 'inne_cardio', name: 'Inne cardio', exercises: ['Orbitrek', 'Wioślarnia', 'Skakanka', 'HIIT', 'Spacer', 'Inne'] },
    ]
  },
  mobility: {
    name: 'Mobilność',
    icon: '🧘',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100 text-purple-800 border-purple-300',
    subcategories: [
      { id: 'yoga', name: 'Yoga', exercises: ['Vinyasa', 'Hatha', 'Power yoga', 'Yin yoga', 'Inne'] },
      { id: 'stretching', name: 'Stretching', exercises: ['Rozciąganie ogólne', 'Góra ciała', 'Dół ciała', 'Dynamiczne', 'Inne'] },
      { id: 'foam_rolling', name: 'Foam rolling', exercises: ['Roller plecy', 'Roller nogi', 'Piłeczka', 'Inne'] },
    ]
  },
};

const DAYS_PL = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
const MONTHS_PL = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, currentMonth: false });
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), currentMonth: true });
  }
  
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), currentMonth: false });
  }
  
  return days;
}

function getWeekDays(date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push({ date: d, currentMonth: true });
  }
  return days;
}

// Stats Panel Component
function StatsPanel({ trainings, currentDate, viewMode, onClose }) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState('all');

  const getDateRange = () => {
    if (viewMode === 'day') {
      return { start: currentDate, end: currentDate };
    } else if (viewMode === 'week') {
      const days = getWeekDays(currentDate);
      return { start: days[0].date, end: days[6].date };
    } else {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return { start, end };
    }
  };

  const { start, end } = getDateRange();

  const filteredTrainings = Object.entries(trainings).filter(([dateKey]) => {
    const date = new Date(dateKey);
    return date >= start && date <= end;
  });

  const allExercises = filteredTrainings.flatMap(([_, dayTrainings]) => 
    dayTrainings.flatMap(t => t.exercises)
  ).filter(ex => {
    if (categoryFilter !== 'all' && ex.category !== categoryFilter) return false;
    if (subcategoryFilter !== 'all' && ex.subcategory !== subcategoryFilter) return false;
    return true;
  });

  const totalTrainings = filteredTrainings.reduce((acc, [_, t]) => acc + t.length, 0);
  const totalExercises = allExercises.length;
  const totalSets = allExercises.reduce((acc, ex) => acc + (parseInt(ex.sets) || 0), 0);
  const totalReps = allExercises.reduce((acc, ex) => acc + ((parseInt(ex.sets) || 0) * (parseInt(ex.reps) || 0)), 0);
  const totalWeight = allExercises.reduce((acc, ex) => acc + ((parseInt(ex.sets) || 0) * (parseInt(ex.reps) || 0) * (parseFloat(ex.weight) || 0)), 0);
  const totalDuration = filteredTrainings.reduce((acc, [_, dayTrainings]) => 
    acc + dayTrainings.reduce((a, t) => a + (parseInt(t.duration) || 0), 0), 0
  );
  const totalDistance = allExercises.reduce((acc, ex) => acc + (parseFloat(ex.distance) || 0), 0);

  const exerciseStats = {};
  allExercises.forEach(ex => {
    const name = ex.exercise === 'Inne' ? ex.customExercise : ex.exercise;
    if (!name) return;
    if (!exerciseStats[name]) {
      exerciseStats[name] = { count: 0, sets: 0, reps: 0, maxWeight: 0, category: ex.category };
    }
    exerciseStats[name].count++;
    exerciseStats[name].sets += parseInt(ex.sets) || 0;
    exerciseStats[name].reps += (parseInt(ex.sets) || 0) * (parseInt(ex.reps) || 0);
    exerciseStats[name].maxWeight = Math.max(exerciseStats[name].maxWeight, parseFloat(ex.weight) || 0);
  });

  const sortedExercises = Object.entries(exerciseStats).sort((a, b) => b[1].count - a[1].count);

  const categoryStats = {};
  allExercises.forEach(ex => {
    if (!categoryStats[ex.category]) {
      categoryStats[ex.category] = 0;
    }
    categoryStats[ex.category]++;
  });

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Statystyki</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setSubcategoryFilter('all'); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="all">Wszystkie kategorie</option>
              {Object.entries(WORKOUT_CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.icon} {cat.name}</option>
              ))}
            </select>
            {categoryFilter !== 'all' && (
              <select
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="all">Wszystkie podkategorie</option>
                {WORKOUT_CATEGORIES[categoryFilter]?.subcategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Okres: {start.toLocaleDateString('pl-PL')} - {end.toLocaleDateString('pl-PL')}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-medium">Treningi</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">{totalTrainings}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-200">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">Ćwiczenia</span>
              </div>
              <p className="text-2xl font-bold text-green-800">{totalExercises}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Repeat className="w-4 h-4" />
                <span className="text-xs font-medium">Serie</span>
              </div>
              <p className="text-2xl font-bold text-purple-800">{totalSets}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Timer className="w-4 h-4" />
                <span className="text-xs font-medium">Czas</span>
              </div>
              <p className="text-2xl font-bold text-orange-800">{totalDuration} min</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 border">
              <p className="text-xs text-gray-500">Powtórzenia</p>
              <p className="text-xl font-bold">{totalReps.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border">
              <p className="text-xs text-gray-500">Tonacja (kg)</p>
              <p className="text-xl font-bold">{totalWeight.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border">
              <p className="text-xs text-gray-500">Dystans (km)</p>
              <p className="text-xl font-bold">{totalDistance.toFixed(1)}</p>
            </div>
          </div>

          {Object.keys(categoryStats).length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Podział na kategorie
              </h4>
              <div className="space-y-2">
                {Object.entries(categoryStats).map(([cat, count]) => {
                  const category = WORKOUT_CATEGORIES[cat];
                  const percentage = Math.round((count / totalExercises) * 100);
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <span className="w-24 text-sm">{category?.icon} {category?.name}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div 
                          className={`${category?.color} h-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-20 text-right">{count} ({percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {sortedExercises.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Top ćwiczenia
              </h4>
              <div className="space-y-1">
                {sortedExercises.slice(0, 10).map(([name, stats], idx) => {
                  const category = WORKOUT_CATEGORIES[stats.category];
                  return (
                    <div key={name} className={`flex items-center justify-between p-2 rounded-lg ${category?.lightColor || 'bg-gray-100'} border`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-400 w-5">{idx + 1}.</span>
                        <span className="text-sm font-medium">{name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span>{stats.count}x</span>
                        {stats.sets > 0 && <span>{stats.sets} serii</span>}
                        {stats.maxWeight > 0 && <span>max {stats.maxWeight}kg</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {totalTrainings === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Brak danych w wybranym okresie</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Training Card Component
function TrainingCard({ training, dateKey, onEdit, onDelete, onAddExercise }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{training.startTime}</span>
          </div>
          {training.duration && (
            <span className="text-sm text-gray-500">({training.duration} min)</span>
          )}
          <div className="flex gap-1">
            {[...new Set(training.exercises.map(e => e.category))].map(cat => (
              <span key={cat} className="text-lg">{WORKOUT_CATEGORIES[cat]?.icon}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{training.exercises.length} ćw.</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t">
          {training.note && (
            <div className="px-3 py-2 bg-yellow-50 text-sm text-yellow-800 border-b">
              📝 {training.note}
            </div>
          )}

          <div className="p-2 space-y-1">
            {training.exercises.map((exercise, idx) => {
              const cat = WORKOUT_CATEGORIES[exercise.category];
              const sub = cat?.subcategories.find(s => s.id === exercise.subcategory);
              const exerciseName = exercise.exercise === 'Inne' ? exercise.customExercise : exercise.exercise;
              
              return (
                <div key={idx} className={`${cat?.lightColor || 'bg-gray-100'} rounded-lg p-2 border`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm">{cat?.icon} {exerciseName}</span>
                      <span className="text-xs text-gray-500 ml-2">({sub?.name})</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs">
                    {exercise.sets && exercise.reps && (
                      <span className="bg-white/50 px-2 py-0.5 rounded">
                        {exercise.sets} × {exercise.reps}
                      </span>
                    )}
                    {exercise.weight && (
                      <span className="bg-white/50 px-2 py-0.5 rounded">
                        {exercise.weight} kg
                      </span>
                    )}
                    {exercise.duration && (
                      <span className="bg-white/50 px-2 py-0.5 rounded">
                        {exercise.duration} min
                      </span>
                    )}
                    {exercise.distance && (
                      <span className="bg-white/50 px-2 py-0.5 rounded">
                        {exercise.distance} km
                      </span>
                    )}
                  </div>
                  {exercise.note && (
                    <p className="text-xs text-gray-600 mt-1 italic">💬 {exercise.note}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex border-t">
            <button
              onClick={() => onAddExercise(training)}
              className="flex-1 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Dodaj ćwiczenie
            </button>
            <button
              onClick={() => onEdit(training)}
              className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1 border-l"
            >
              <Edit2 className="w-4 h-4" /> Edytuj
            </button>
            <button
              onClick={() => onDelete(dateKey, training.id)}
              className="flex-1 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center justify-center gap-1 border-l"
            >
              <Trash2 className="w-4 h-4" /> Usuń
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Exercise Form Component
function ExerciseForm({ exercise, onChange, onRemove, index }) {
  const category = WORKOUT_CATEGORIES[exercise.category];
  const subcategory = category?.subcategories.find(s => s.id === exercise.subcategory);
  const isStrength = exercise.category === 'silownia';
  const isCardio = exercise.category === 'cardio';

  return (
    <div className="bg-gray-50 rounded-xl p-3 border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">Ćwiczenie {index + 1}</span>
        <button onClick={onRemove} className="p-1 text-red-500 hover:bg-red-50 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {Object.entries(WORKOUT_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => onChange({ ...exercise, category: key, subcategory: '', exercise: '' })}
            className={`p-2 rounded-lg text-center transition-all text-xs ${
              exercise.category === key
                ? `${cat.color} text-white`
                : 'bg-white border hover:border-gray-300'
            }`}
          >
            <span className="text-lg">{cat.icon}</span>
            <p className="font-medium mt-0.5">{cat.name}</p>
          </button>
        ))}
      </div>

      {exercise.category && (
        <div className="flex flex-wrap gap-1">
          {category?.subcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => onChange({ ...exercise, subcategory: sub.id, exercise: '' })}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                exercise.subcategory === sub.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {subcategory && (
        <select
          value={exercise.exercise}
          onChange={(e) => onChange({ ...exercise, exercise: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Wybierz ćwiczenie...</option>
          {subcategory.exercises.map(ex => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
      )}

      {exercise.exercise === 'Inne' && (
        <input
          type="text"
          value={exercise.customExercise || ''}
          onChange={(e) => onChange({ ...exercise, customExercise: e.target.value })}
          placeholder="Nazwa własnego ćwiczenia..."
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      )}

      {isStrength && exercise.exercise && (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-gray-500">Serie</label>
            <input
              type="number"
              value={exercise.sets || ''}
              onChange={(e) => onChange({ ...exercise, sets: e.target.value })}
              placeholder="4"
              className="w-full border rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Powtórzenia</label>
            <input
              type="number"
              value={exercise.reps || ''}
              onChange={(e) => onChange({ ...exercise, reps: e.target.value })}
              placeholder="10"
              className="w-full border rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Ciężar (kg)</label>
            <input
              type="number"
              step="0.5"
              value={exercise.weight || ''}
              onChange={(e) => onChange({ ...exercise, weight: e.target.value })}
              placeholder="60"
              className="w-full border rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      )}

      {isCardio && exercise.exercise && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Czas (min)</label>
            <input
              type="number"
              value={exercise.duration || ''}
              onChange={(e) => onChange({ ...exercise, duration: e.target.value })}
              placeholder="30"
              className="w-full border rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Dystans (km)</label>
            <input
              type="number"
              step="0.1"
              value={exercise.distance || ''}
              onChange={(e) => onChange({ ...exercise, distance: e.target.value })}
              placeholder="5"
              className="w-full border rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      )}

      {exercise.category === 'mobility' && exercise.exercise && (
        <div>
          <label className="text-xs text-gray-500">Czas (min)</label>
          <input
            type="number"
            value={exercise.duration || ''}
            onChange={(e) => onChange({ ...exercise, duration: e.target.value })}
            placeholder="20"
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
      )}

      {exercise.exercise && (
        <div>
          <label className="text-xs text-gray-500">Notatka do ćwiczenia</label>
          <input
            type="text"
            value={exercise.note || ''}
            onChange={(e) => onChange({ ...exercise, note: e.target.value })}
            placeholder="np. ciężko szło, zwiększyć ciężar..."
            className="w-full border rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
      )}
    </div>
  );
}

// Main Training Tracker Component
function TrainingTracker() {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [trainings, setTrainings] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingTraining, setEditingTraining] = useState(null);
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(true);
  
  const [trainingForm, setTrainingForm] = useState({
    startTime: '08:00',
    duration: '',
    note: '',
    exercises: [{ category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '', note: '' }]
  });

  // Load data from Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setTrainings(data.trainings || {});
          if (data.viewMode) setViewMode(data.viewMode);
        }
        setSynced(true);
      },
      (error) => {
        console.error('Firestore error:', error);
      }
    );

    return unsubscribe;
  }, [user]);

  // Save data to Firestore
  const saveToFirestore = async (newTrainings, newViewMode) => {
    if (!user) return;
    
    setSaving(true);
    setSynced(false);
    
    try {
      await setDoc(doc(db, 'users', user.uid), {
        trainings: newTrainings,
        viewMode: newViewMode || viewMode,
        updatedAt: new Date().toISOString()
      });
      setSynced(true);
    } catch (error) {
      console.error('Save error:', error);
    }
    
    setSaving(false);
  };

  const updateTrainings = (newTrainings) => {
    setTrainings(newTrainings);
    saveToFirestore(newTrainings);
  };

  const updateViewMode = (mode) => {
    setViewMode(mode);
    saveToFirestore(trainings, mode);
  };

  const today = new Date();
  const todayKey = formatDateKey(today);

  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + direction);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + direction * 7);
    else newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  const getDays = () => {
    if (viewMode === 'day') return [{ date: currentDate, currentMonth: true }];
    if (viewMode === 'week') return getWeekDays(currentDate);
    return getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  };

  const openAddModal = (date) => {
    setSelectedDate(date);
    setEditingTraining(null);
    setTrainingForm({
      startTime: '08:00',
      duration: '',
      note: '',
      exercises: [{ category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '', note: '' }]
    });
    setShowModal(true);
  };

  const openEditModal = (training) => {
    setEditingTraining(training);
    setTrainingForm({
      startTime: training.startTime,
      duration: training.duration || '',
      note: training.note || '',
      exercises: training.exercises.length > 0 ? training.exercises : [{ category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '', note: '' }]
    });
    setShowModal(true);
  };

  const openAddExerciseModal = (training) => {
    setEditingTraining(training);
    setTrainingForm({
      startTime: training.startTime,
      duration: training.duration || '',
      note: training.note || '',
      exercises: [...training.exercises, { category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '', note: '' }]
    });
    setShowModal(true);
  };

  const saveTraining = () => {
    if (!selectedDate && !editingTraining) return;
    
    const dateKey = editingTraining 
      ? Object.keys(trainings).find(key => trainings[key].some(t => t.id === editingTraining.id))
      : formatDateKey(selectedDate);
    
    const validExercises = trainingForm.exercises.filter(ex => ex.exercise);
    if (validExercises.length === 0) return;

    const training = {
      id: editingTraining?.id || Date.now(),
      startTime: trainingForm.startTime,
      duration: trainingForm.duration,
      note: trainingForm.note,
      exercises: validExercises,
      timestamp: new Date().toISOString()
    };
    
    let newTrainings;
    if (editingTraining) {
      newTrainings = {
        ...trainings,
        [dateKey]: trainings[dateKey].map(t => t.id === editingTraining.id ? training : t)
      };
    } else {
      newTrainings = {
        ...trainings,
        [dateKey]: [...(trainings[dateKey] || []), training]
      };
    }
    
    updateTrainings(newTrainings);
    setShowModal(false);
  };

  const deleteTraining = (dateKey, trainingId) => {
    const newTrainings = {
      ...trainings,
      [dateKey]: trainings[dateKey].filter(t => t.id !== trainingId)
    };
    updateTrainings(newTrainings);
  };

  const addExercise = () => {
    setTrainingForm(prev => ({
      ...prev,
      exercises: [...prev.exercises, { category: 'silownia', subcategory: '', exercise: '', customExercise: '', sets: '', reps: '', weight: '', duration: '', distance: '', note: '' }]
    }));
  };

  const updateExercise = (index, exercise) => {
    setTrainingForm(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => i === index ? exercise : ex)
    }));
  };

  const removeExercise = (index) => {
    setTrainingForm(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const getTitle = () => {
    if (viewMode === 'day') {
      return `${DAYS_PL[currentDate.getDay()]}, ${currentDate.getDate()} ${MONTHS_PL[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    if (viewMode === 'week') {
      const days = getWeekDays(currentDate);
      const start = days[0].date;
      const end = days[6].date;
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${MONTHS_PL[start.getMonth()]} ${start.getFullYear()}`;
      }
      return `${start.getDate()} ${MONTHS_PL[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTHS_PL[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
    }
    return `${MONTHS_PL[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const days = getDays();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-7 h-7 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Notatnik Treningowy</h1>
              {saving && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
              {!saving && synced && <span className="text-xs text-green-500">✓ Zsynchronizowano</span>}
            </div>
            
            <div className="flex items-center gap-2">
              {/* User Menu */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700 max-w-[150px] truncate">{user?.email}</span>
                <button
                  onClick={logout}
                  className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                  title="Wyloguj"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Button */}
              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                Statystyki
              </button>

              {/* View Mode Buttons */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'day', label: 'Dzień' },
                  { id: 'week', label: 'Tydzień' },
                  { id: 'month', label: 'Miesiąc' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => updateViewMode(mode.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      viewMode === mode.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Dzisiaj
              </button>
            </div>
            
            <h2 className="text-xl font-semibold">{getTitle()}</h2>
            
            <div className="w-32" />
          </div>
        </div>
      </header>

      {/* Calendar */}
      <main className="max-w-7xl mx-auto p-4">
        {viewMode !== 'day' && (
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
        )}

        <div className={`grid ${viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-7'} gap-1`}>
          {days.map(({ date, currentMonth }, idx) => {
            const dateKey = formatDateKey(date);
            const dayTrainings = trainings[dateKey] || [];
            const isToday = dateKey === todayKey;
            const isCurrentMonth = currentMonth;

            return (
              <div
                key={idx}
                className={`
                  bg-white border rounded-lg overflow-hidden transition-all
                  ${viewMode === 'day' ? 'min-h-[70vh]' : viewMode === 'week' ? 'min-h-[500px]' : 'min-h-[120px]'}
                  ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
                  ${!isCurrentMonth ? 'opacity-40' : ''}
                `}
              >
                <div className={`flex items-center justify-between px-2 py-1.5 border-b ${
                  isToday ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {viewMode === 'day' && `${DAYS_PL[date.getDay()]}, `}
                    {date.getDate()}
                    {viewMode === 'month' && date.getDate() === 1 && ` ${MONTHS_PL[date.getMonth()].slice(0, 3)}`}
                  </span>
                  <button
                    onClick={() => openAddModal(date)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className={`p-1 space-y-1 overflow-y-auto ${
                  viewMode === 'day' ? 'max-h-[65vh]' : viewMode === 'week' ? 'max-h-[440px]' : 'max-h-[80px]'
                }`}>
                  {viewMode === 'month' ? (
                    dayTrainings.map(training => (
                      <div
                        key={training.id}
                        onClick={() => { setSelectedDate(date); openEditModal(training); }}
                        className="bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 text-xs cursor-pointer hover:bg-blue-200 truncate"
                      >
                        {training.startTime} • {training.exercises.length} ćw.
                      </div>
                    ))
                  ) : (
                    dayTrainings.map(training => (
                      <TrainingCard
                        key={training.id}
                        training={training}
                        dateKey={dateKey}
                        onEdit={() => { setSelectedDate(date); openEditModal(training); }}
                        onDelete={deleteTraining}
                        onAddExercise={() => { setSelectedDate(date); openAddExerciseModal(training); }}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Stats Panel */}
      {showStats && (
        <StatsPanel
          trainings={trainings}
          currentDate={currentDate}
          viewMode={viewMode}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Add/Edit Training Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold">
                {editingTraining ? 'Edytuj trening' : 'Nowy trening'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {selectedDate?.toLocaleDateString('pl-PL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Godzina rozpoczęcia
                  </label>
                  <input
                    type="time"
                    value={trainingForm.startTime}
                    onChange={(e) => setTrainingForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Timer className="w-4 h-4 inline mr-1" />
                    Czas trwania (min)
                  </label>
                  <input
                    type="number"
                    value={trainingForm.duration}
                    onChange={(e) => setTrainingForm(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="np. 60"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notatka do treningu
                </label>
                <input
                  type="text"
                  value={trainingForm.note}
                  onChange={(e) => setTrainingForm(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="np. Dzień siłowy, FBW, Push..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Ćwiczenia</label>
                  <button
                    onClick={addExercise}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Dodaj ćwiczenie
                  </button>
                </div>
                <div className="space-y-3">
                  {trainingForm.exercises.map((exercise, idx) => (
                    <ExerciseForm
                      key={idx}
                      exercise={exercise}
                      index={idx}
                      onChange={(ex) => updateExercise(idx, ex)}
                      onRemove={() => removeExercise(idx)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={saveTraining}
                disabled={!trainingForm.exercises.some(ex => ex.exercise)}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTraining ? 'Zapisz zmiany' : 'Dodaj trening'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main App Component
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return user ? <TrainingTracker /> : <AuthScreen />;
}

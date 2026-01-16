import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, Plus, X, Dumbbell, Calendar, ChevronDown, ChevronUp, Trash2, Edit2, BarChart3, Activity, Timer, Target, Flame, LogOut, Mail, Lock, Loader2, Menu, ArrowLeft, Check } from 'lucide-react';

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
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }), []);
  return <AuthContext.Provider value={{ user, loading, signup: (e, p) => createUserWithEmailAndPassword(auth, e, p), login: (e, p) => signInWithEmailAndPassword(auth, e, p), logout: () => signOut(auth), resetPassword: e => sendPasswordResetEmail(auth, e) }}>{children}</AuthContext.Provider>;
}

function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login, resetPassword } = useAuth();

  const submit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (mode === 'reset') {
      if (!email) return setError('Wpisz email');
      setLoading(true);
      try { await resetPassword(email); setSuccess('Link wysłany! Sprawdź SPAM.'); }
      catch (err) { setError(err.code === 'auth/user-not-found' ? 'Nie znaleziono konta' : 'Błąd'); }
      setLoading(false); return;
    }
    if (mode === 'register' && password !== confirm) return setError('Hasła różne');
    if (password.length < 6) return setError('Min 6 znaków');
    setLoading(true);
    try { mode === 'login' ? await login(email, password) : await signup(email, password); }
    catch (err) { setError(err.code === 'auth/email-already-in-use' ? 'Email zajęty' : err.code === 'auth/invalid-credential' ? 'Błędne dane' : 'Błąd'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3"><Dumbbell className="w-7 h-7 text-white" /></div>
          <h1 className="text-xl font-bold">Notatnik Treningowy</h1>
          <p className="text-gray-500 text-sm mt-1">{mode === 'login' ? 'Zaloguj się' : mode === 'register' ? 'Rejestracja' : 'Reset hasła'}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full pl-10 pr-3 py-3 border rounded-lg" />
          </div>
          {mode !== 'reset' && <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Hasło" required className="w-full pl-10 pr-3 py-3 border rounded-lg" /></div>}
          {mode === 'register' && <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Potwierdź hasło" required className="w-full pl-10 pr-3 py-3 border rounded-lg" /></div>}
          {error && <div className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 px-3 py-2 rounded-lg text-sm flex items-center gap-2"><Check className="w-4 h-4" />{success}</div>}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}{mode === 'login' ? 'Zaloguj' : mode === 'register' ? 'Zarejestruj' : 'Wyślij'}
          </button>
        </form>
        <div className="mt-4 text-center space-y-2 text-sm">
          {mode === 'login' && <><button onClick={() => { setMode('reset'); setError(''); }} className="text-gray-500">Nie pamiętasz hasła?</button><button onClick={() => { setMode('register'); setError(''); }} className="block w-full text-indigo-600 font-medium">Utwórz konto</button></>}
          {mode === 'register' && <button onClick={() => { setMode('login'); setError(''); }} className="text-indigo-600 font-medium">Masz konto? Zaloguj</button>}
          {mode === 'reset' && <button onClick={() => { setMode('login'); setError(''); }} className="text-indigo-600 font-medium flex items-center justify-center gap-1 w-full"><ArrowLeft className="w-4 h-4" />Wróć</button>}
        </div>
      </div>
    </div>
  );
}

const CATS = {
  silownia: { name: 'Siłownia', icon: '🏋️', color: 'bg-blue-500', light: 'bg-blue-50 border-blue-200 text-blue-900', subs: [
    { id: 'klatka', name: 'Klatka', ex: ['Wyciskanie sztangi', 'Wyciskanie hantli', 'Rozpiętki', 'Pompki', 'Inne'] },
    { id: 'plecy', name: 'Plecy', ex: ['Martwy ciąg', 'Wiosłowanie', 'Podciąganie', 'Ściąganie', 'Inne'] },
    { id: 'barki', name: 'Barki', ex: ['Military', 'Wznosy', 'Face pulls', 'Inne'] },
    { id: 'biceps', name: 'Biceps', ex: ['Uginanie sztangi', 'Uginanie hantli', 'Młotki', 'Inne'] },
    { id: 'triceps', name: 'Triceps', ex: ['Francuskie', 'Pompki wąskie', 'Wyciąg', 'Inne'] },
    { id: 'nogi', name: 'Nogi', ex: ['Przysiad', 'Wykroki', 'Prasa', 'Hip thrust', 'RDL', 'Inne'] },
    { id: 'brzuch', name: 'Brzuch', ex: ['Plank', 'Brzuszki', 'Unoszenie nóg', 'Inne'] }
  ]},
  cardio: { name: 'Cardio', icon: '🏃', color: 'bg-green-500', light: 'bg-green-50 border-green-200 text-green-900', subs: [
    { id: 'bieganie', name: 'Bieganie', ex: ['Bieg', 'Bieżnia', 'Interwały', 'Inne'] },
    { id: 'rower', name: 'Rower', ex: ['Stacjonarny', 'Outdoor', 'Inne'] },
    { id: 'inne', name: 'Inne', ex: ['Orbitrek', 'Skakanka', 'HIIT', 'Spacer', 'Inne'] }
  ]},
  mobility: { name: 'Mobilność', icon: '🧘', color: 'bg-purple-500', light: 'bg-purple-50 border-purple-200 text-purple-900', subs: [
    { id: 'yoga', name: 'Yoga', ex: ['Vinyasa', 'Hatha', 'Inne'] },
    { id: 'stretching', name: 'Stretching', ex: ['Ogólne', 'Góra', 'Dół', 'Inne'] }
  ]}
};

const DAYS = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
const MONTHS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
const dk = d => d.toISOString().split('T')[0];
const getWeek = d => { const s = new Date(d); const day = s.getDay(); s.setDate(s.getDate() - day + (day === 0 ? -6 : 1)); return Array.from({ length: 7 }, (_, i) => { const x = new Date(s); x.setDate(s.getDate() + i); return x; }); };
const getMonth = (y, m) => { const f = new Date(y, m, 1), l = new Date(y, m + 1, 0), days = [], st = f.getDay() === 0 ? 6 : f.getDay() - 1; for (let i = st - 1; i >= 0; i--) days.push({ d: new Date(y, m, -i), cur: false }); for (let i = 1; i <= l.getDate(); i++) days.push({ d: new Date(y, m, i), cur: true }); while (days.length < 42) days.push({ d: new Date(y, m + 1, days.length - l.getDate() - st + 1), cur: false }); return days; };

function Stats({ data, date, mode, onClose }) {
  const range = mode === 'week' ? { s: getWeek(date)[0], e: getWeek(date)[6] } : { s: new Date(date.getFullYear(), date.getMonth(), 1), e: new Date(date.getFullYear(), date.getMonth() + 1, 0) };
  const filtered = Object.entries(data).filter(([k]) => { const d = new Date(k); return d >= range.s && d <= range.e; });
  const exs = filtered.flatMap(([_, t]) => t.flatMap(x => x.exercises));
  const total = filtered.reduce((a, [_, t]) => a + t.length, 0);
  const sets = exs.reduce((a, e) => a + (parseInt(e.sets) || 0), 0);
  const mins = filtered.reduce((a, [_, t]) => a + t.reduce((b, x) => b + (parseInt(x.dur) || 0), 0), 0);
  const cats = {}; exs.forEach(e => { cats[e.cat] = (cats[e.cat] || 0) + 1; });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden">
        <div className="p-3 bg-indigo-600 text-white flex items-center justify-between"><div className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /><span className="font-semibold">Statystyki</span></div><button onClick={onClose}><X className="w-5 h-5" /></button></div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-blue-50 rounded-lg p-2 text-center"><Activity className="w-4 h-4 text-blue-600 mx-auto" /><p className="text-lg font-bold text-blue-800">{total}</p><p className="text-xs text-blue-600">Treningów</p></div>
            <div className="bg-green-50 rounded-lg p-2 text-center"><Target className="w-4 h-4 text-green-600 mx-auto" /><p className="text-lg font-bold text-green-800">{sets}</p><p className="text-xs text-green-600">Serii</p></div>
            <div className="bg-orange-50 rounded-lg p-2 text-center"><Timer className="w-4 h-4 text-orange-600 mx-auto" /><p className="text-lg font-bold text-orange-800">{mins}</p><p className="text-xs text-orange-600">Minut</p></div>
          </div>
          {Object.keys(cats).length > 0 && <div className="space-y-2">{Object.entries(cats).map(([c, n]) => { const cat = CATS[c]; const pct = exs.length ? Math.round((n / exs.length) * 100) : 0; return <div key={c} className="flex items-center gap-2"><span className="w-14 text-xs truncate">{cat?.icon}{cat?.name}</span><div className="flex-1 bg-gray-200 rounded-full h-2"><div className={`${cat?.color} h-full rounded-full`} style={{ width: `${pct}%` }} /></div><span className="text-xs w-8 text-right">{pct}%</span></div>; })}</div>}
          {total === 0 && <div className="text-center py-6 text-gray-400 text-sm">Brak danych</div>}
        </div>
      </div>
    </div>
  );
}

function Card({ t, dk: key, edit, del, addEx }) {
  const [open, setOpen] = useState(false);
  const cats = [...new Set(t.exercises.map(e => e.cat))];
  return (
    <div className="bg-white border rounded text-xs overflow-hidden">
      <div className="flex items-center justify-between p-1.5 cursor-pointer hover:bg-gray-50" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-indigo-600">{t.startTime}</span>
          <span className="flex">{cats.map(c => <span key={c}>{CATS[c]?.icon}</span>)}</span>
          {t.dur && <span className="text-gray-400">{t.dur}m</span>}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">{t.exercises.length}</span>
          {open ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
        </div>
      </div>
      {open && (
        <div className="border-t">
          {t.note && <div className="px-1.5 py-1 bg-amber-50 text-amber-700 truncate">📝 {t.note}</div>}
          <div className="p-1.5 space-y-1 max-h-32 overflow-y-auto">
            {t.exercises.map((ex, i) => {
              const cat = CATS[ex.cat];
              return (
                <div key={i} className={`${cat?.light} rounded p-1.5 border`}>
                  <div className="font-medium truncate">{cat?.icon} {ex.ex === 'Inne' ? ex.custom : ex.ex}</div>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {ex.sets && ex.reps && <span className="bg-white/70 px-1 rounded">{ex.sets}×{ex.reps}</span>}
                    {ex.weight && <span className="bg-white/70 px-1 rounded">{ex.weight}kg</span>}
                    {ex.dur && <span className="bg-white/70 px-1 rounded">{ex.dur}m</span>}
                    {ex.dist && <span className="bg-white/70 px-1 rounded">{ex.dist}km</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex border-t">
            <button onClick={e => { e.stopPropagation(); addEx(t); }} className="flex-1 py-1.5 text-blue-600 hover:bg-blue-50">+Dodaj</button>
            <button onClick={e => { e.stopPropagation(); edit(t); }} className="flex-1 py-1.5 text-gray-600 hover:bg-gray-50 border-l">Edytuj</button>
            <button onClick={e => { e.stopPropagation(); del(key, t.id); }} className="flex-1 py-1.5 text-red-600 hover:bg-red-50 border-l">Usuń</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExForm({ ex, onChange, onRemove, idx }) {
  const cat = CATS[ex.cat], sub = cat?.subs.find(s => s.id === ex.sub);
  return (
    <div className="bg-gray-50 rounded-lg p-3 border space-y-2">
      <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-500">#{idx + 1}</span><button onClick={onRemove} className="text-red-500"><Trash2 className="w-4 h-4" /></button></div>
      <div className="grid grid-cols-3 gap-1">{Object.entries(CATS).map(([k, c]) => <button key={k} onClick={() => onChange({ ...ex, cat: k, sub: '', ex: '' })} className={`p-2 rounded text-center ${ex.cat === k ? `${c.color} text-white` : 'bg-white border'}`}><span className="text-lg">{c.icon}</span><p className="text-xs">{c.name}</p></button>)}</div>
      {ex.cat && <div className="flex flex-wrap gap-1">{cat?.subs.map(s => <button key={s.id} onClick={() => onChange({ ...ex, sub: s.id, ex: '' })} className={`px-2 py-1 rounded text-xs ${ex.sub === s.id ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>{s.name}</button>)}</div>}
      {sub && <select value={ex.ex} onChange={e => onChange({ ...ex, ex: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm"><option value="">Wybierz...</option>{sub.ex.map(e => <option key={e} value={e}>{e}</option>)}</select>}
      {ex.ex === 'Inne' && <input type="text" value={ex.custom || ''} onChange={e => onChange({ ...ex, custom: e.target.value })} placeholder="Nazwa..." className="w-full border rounded px-2 py-1.5 text-sm" />}
      {ex.cat === 'silownia' && ex.ex && <div className="grid grid-cols-3 gap-2"><div><label className="text-xs text-gray-500">Serie</label><input type="number" value={ex.sets || ''} onChange={e => onChange({ ...ex, sets: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></div><div><label className="text-xs text-gray-500">Powt</label><input type="number" value={ex.reps || ''} onChange={e => onChange({ ...ex, reps: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></div><div><label className="text-xs text-gray-500">Kg</label><input type="number" value={ex.weight || ''} onChange={e => onChange({ ...ex, weight: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></div></div>}
      {ex.cat === 'cardio' && ex.ex && <div className="grid grid-cols-2 gap-2"><div><label className="text-xs text-gray-500">Min</label><input type="number" value={ex.dur || ''} onChange={e => onChange({ ...ex, dur: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></div><div><label className="text-xs text-gray-500">Km</label><input type="number" value={ex.dist || ''} onChange={e => onChange({ ...ex, dist: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></div></div>}
      {ex.cat === 'mobility' && ex.ex && <div><label className="text-xs text-gray-500">Min</label><input type="number" value={ex.dur || ''} onChange={e => onChange({ ...ex, dur: e.target.value })} className="w-full border rounded px-2 py-1 text-sm" /></div>}
    </div>
  );
}

function Mobile({ data, sel, setSel, ws, add, edit, del, addEx }) {
  const today = dk(new Date()), selKey = dk(sel);
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(ws); d.setDate(d.getDate() + i); return d; });
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b p-2"><div className="flex gap-1">{week.map((d, i) => { const k = dk(d), isT = k === today, isS = k === selKey, has = data[k]?.length > 0; return <button key={i} onClick={() => setSel(d)} className={`flex-1 py-2 rounded-lg flex flex-col items-center ${isS ? 'bg-indigo-600 text-white' : isT ? 'bg-indigo-100' : ''}`}><span className={`text-xs ${isS ? 'text-indigo-200' : 'text-gray-500'}`}>{DAYS[d.getDay()]}</span><span className="text-lg font-bold">{d.getDate()}</span>{has && <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isS ? 'bg-white' : 'bg-indigo-500'}`} />}</button>; })}</div></div>
      <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between"><div><p className="font-semibold">{sel.toLocaleDateString('pl', { weekday: 'long' })}</p><p className="text-sm text-gray-500">{sel.getDate()} {MONTHS[sel.getMonth()]}</p></div><button onClick={() => add(sel)} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1"><Plus className="w-4 h-4" />Dodaj</button></div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">{(data[selKey] || []).map(t => <Card key={t.id} t={t} dk={selKey} edit={() => edit(t)} del={del} addEx={() => addEx(t)} />)}{!data[selKey]?.length && <div className="text-center py-10 text-gray-400"><Dumbbell className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">Brak treningów</p></div>}</div>
    </div>
  );
}

function Desktop({ data, date, mode, sel, setSel, add, edit, del, addEx }) {
  const today = dk(new Date()), selKey = dk(sel);
  const days = mode === 'week' ? getWeek(date).map(d => ({ d, cur: true })) : getMonth(date.getFullYear(), date.getMonth());
  const isW = mode === 'week';
  return (
    <div className="flex h-full">
      <div className="flex-1 p-2 overflow-auto">
        <div className="grid grid-cols-7 gap-1 mb-1">{['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => <div key={d} className="text-center py-1 text-xs font-medium text-gray-500">{d}</div>)}</div>
        <div className={`grid grid-cols-7 gap-1 ${isW ? 'h-[calc(100vh-160px)]' : ''}`}>
          {days.map(({ d, cur }, i) => {
            const k = dk(d), t = data[k] || [], isT = k === today, isS = k === selKey;
            return (
              <div key={i} onClick={() => setSel(d)} className={`bg-white border rounded overflow-hidden cursor-pointer hover:shadow transition-shadow ${isW ? 'flex flex-col' : 'min-h-[70px]'} ${isT ? 'border-indigo-500 border-2' : isS ? 'border-indigo-300' : ''} ${!cur ? 'opacity-40' : ''}`}>
                <div className={`flex items-center justify-between px-1.5 py-1 border-b ${isT ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                  <span className={`text-sm font-semibold ${isT ? 'text-indigo-600' : ''}`}>{d.getDate()}</span>
                  <button onClick={e => { e.stopPropagation(); add(d); }} className="w-5 h-5 hover:bg-indigo-100 rounded flex items-center justify-center text-indigo-600"><Plus className="w-3 h-3" /></button>
                </div>
                <div className={`p-1 space-y-1 overflow-y-auto ${isW ? 'flex-1' : 'max-h-[40px]'}`}>
                  {t.map(tr => <Card key={tr.id} t={tr} dk={k} edit={() => { setSel(d); edit(tr); }} del={del} addEx={() => { setSel(d); addEx(tr); }} />)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {isW && (
        <div className="w-64 border-l bg-gray-50 p-2 overflow-y-auto flex-shrink-0">
          <div className="mb-2"><p className="font-semibold">{sel.toLocaleDateString('pl', { weekday: 'long' })}</p><p className="text-sm text-gray-500">{sel.getDate()} {MONTHS[sel.getMonth()]}</p></div>
          <button onClick={() => add(sel)} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 mb-2"><Plus className="w-4 h-4" />Dodaj</button>
          <div className="space-y-2">{(data[selKey] || []).map(t => <Card key={t.id} t={t} dk={selKey} edit={() => edit(t)} del={del} addEx={() => addEx(t)} />)}{!data[selKey]?.length && <div className="text-center py-6 text-gray-400 text-sm"><Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />Brak</div>}</div>
        </div>
      )}
    </div>
  );
}

function Tracker() {
  const { user, logout } = useAuth();
  const [date, setDate] = useState(new Date());
  const [sel, setSel] = useState(new Date());
  const [mode, setMode] = useState('week');
  const [data, setData] = useState({});
  const [modal, setModal] = useState(false);
  const [stats, setStats] = useState(false);
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth < 1024);
  const emptyEx = { cat: 'silownia', sub: '', ex: '', custom: '', sets: '', reps: '', weight: '', dur: '', dist: '' };
  const [form, setForm] = useState({ time: '08:00', dur: '', note: '', exercises: [{ ...emptyEx }] });

  useEffect(() => { const h = () => setMobile(window.innerWidth < 1024); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  useEffect(() => { if (!user) return; return onSnapshot(doc(db, 'users', user.uid), d => { if (d.exists()) { setData(d.data().trainings || {}); if (d.data().viewMode) setMode(d.data().viewMode); } }); }, [user]);

  const save = async (t, m) => { if (!user) return; setSaving(true); try { await setDoc(doc(db, 'users', user.uid), { trainings: t, viewMode: m || mode, updatedAt: new Date().toISOString() }); } catch (e) { console.error(e); } setSaving(false); };
  const getWs = d => { const s = new Date(d); const day = s.getDay(); s.setDate(s.getDate() - day + (day === 0 ? -6 : 1)); return s; };
  const [ws, setWs] = useState(getWs(new Date()));

  const nav = dir => { if (mobile) { const w = new Date(ws); w.setDate(w.getDate() + dir * 7); setWs(w); setSel(w); } else { const d = new Date(date); mode === 'week' ? d.setDate(d.getDate() + dir * 7) : d.setMonth(d.getMonth() + dir); setDate(d); } };
  const goToday = () => { const t = new Date(); setDate(t); setSel(t); setWs(getWs(t)); };
  const openAdd = d => { setSel(d); setEditing(null); setForm({ time: '08:00', dur: '', note: '', exercises: [{ ...emptyEx }] }); setModal(true); };
  const openEdit = t => { setEditing(t); setForm({ time: t.startTime, dur: t.dur || '', note: t.note || '', exercises: t.exercises.length ? t.exercises : [{ ...emptyEx }] }); setModal(true); };
  const openAddEx = t => { setEditing(t); setForm({ time: t.startTime, dur: t.dur || '', note: t.note || '', exercises: [...t.exercises, { ...emptyEx }] }); setModal(true); };
  
  const saveT = () => {
    const key = editing ? Object.keys(data).find(k => data[k].some(x => x.id === editing.id)) : dk(sel);
    const valid = form.exercises.filter(e => e.ex);
    if (!valid.length) return;
    const t = { id: editing?.id || Date.now(), startTime: form.time, dur: form.dur, note: form.note, exercises: valid };
    const newData = editing ? { ...data, [key]: data[key].map(x => x.id === editing.id ? t : x) } : { ...data, [key]: [...(data[key] || []), t] };
    setData(newData); save(newData); setModal(false);
  };

  const delT = (key, id) => { const newData = { ...data, [key]: data[key].filter(t => t.id !== id) }; setData(newData); save(newData); };

  const title = mobile ? `${MONTHS[ws.getMonth()]} ${ws.getFullYear()}` : mode === 'week' ? `${getWeek(date)[0].getDate()}-${getWeek(date)[6].getDate()} ${MONTHS[getWeek(date)[0].getMonth()]} ${getWeek(date)[0].getFullYear()}` : `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><Dumbbell className="w-4 h-4 text-white" /></div><span className="font-bold hidden sm:block">Notatnik</span>{saving && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}</div>
          <div className="flex items-center gap-1">
            <button onClick={() => setStats(true)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"><BarChart3 className="w-5 h-5" /></button>
            <div className="relative">
              <button onClick={() => setMenu(!menu)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Menu className="w-5 h-5" /></button>
              {menu && <><div className="fixed inset-0 z-10" onClick={() => setMenu(false)} /><div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-[160px] z-20"><div className="px-3 py-2 border-b text-sm text-gray-500 truncate">{user?.email}</div><button onClick={() => { logout(); setMenu(false); }} className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm"><LogOut className="w-4 h-4" />Wyloguj</button></div></>}
            </div>
          </div>
        </div>
        <div className="px-3 py-2 flex items-center justify-between border-t bg-gray-50">
          <div className="flex items-center gap-1">
            <button onClick={() => nav(-1)} className="p-1.5 hover:bg-white rounded border bg-white"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => nav(1)} className="p-1.5 hover:bg-white rounded border bg-white"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={goToday} className="px-2 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded">Dziś</button>
          </div>
          <span className="font-semibold text-sm">{title}</span>
          {!mobile && <div className="flex bg-white border rounded p-0.5">{['week', 'month'].map(m => <button key={m} onClick={() => { setMode(m); save(data, m); }} className={`px-2 py-1 rounded text-xs font-medium ${mode === m ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}>{m === 'week' ? 'Tydzień' : 'Miesiąc'}</button>)}</div>}
          {mobile && <div className="w-14" />}
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{mobile ? <Mobile data={data} sel={sel} setSel={setSel} ws={ws} add={openAdd} edit={openEdit} del={delT} addEx={openAddEx} /> : <Desktop data={data} date={date} mode={mode} sel={sel} setSel={setSel} add={openAdd} edit={openEdit} del={delT} addEx={openAddEx} />}</main>
      {stats && <Stats data={data} date={mobile ? sel : date} mode={mode} onClose={() => setStats(false)} />}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-3 border-b flex items-center justify-between"><div><h3 className="font-bold">{editing ? 'Edytuj' : 'Nowy trening'}</h3><p className="text-sm text-gray-500">{sel?.toLocaleDateString('pl', { weekday: 'short', day: 'numeric', month: 'short' })}</p></div><button onClick={() => setModal(false)}><X className="w-5 h-5" /></button></div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-medium text-gray-600">Godzina</label><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full border rounded px-2 py-1.5 mt-1" /></div><div><label className="text-xs font-medium text-gray-600">Czas (min)</label><input type="number" value={form.dur} onChange={e => setForm({ ...form, dur: e.target.value })} placeholder="60" className="w-full border rounded px-2 py-1.5 mt-1" /></div></div>
              <div><label className="text-xs font-medium text-gray-600">Notatka</label><input type="text" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Push day..." className="w-full border rounded px-2 py-1.5 mt-1" /></div>
              <div><div className="flex items-center justify-between mb-2"><label className="text-sm font-medium">Ćwiczenia</label><button onClick={() => setForm({ ...form, exercises: [...form.exercises, { ...emptyEx }] })} className="text-sm text-indigo-600 font-medium flex items-center gap-1"><Plus className="w-4 h-4" />Dodaj</button></div><div className="space-y-2">{form.exercises.map((ex, i) => <ExForm key={i} ex={ex} idx={i} onChange={e => setForm({ ...form, exercises: form.exercises.map((x, j) => j === i ? e : x) })} onRemove={() => setForm({ ...form, exercises: form.exercises.filter((_, j) => j !== i) })} />)}</div></div>
            </div>
            <div className="p-3 border-t flex gap-2"><button onClick={() => setModal(false)} className="flex-1 py-2 border rounded font-medium">Anuluj</button><button onClick={saveT} disabled={!form.exercises.some(e => e.ex)} className="flex-1 py-2 bg-indigo-600 text-white rounded font-medium disabled:opacity-50">Zapisz</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() { return <AuthProvider><AppContent /></AuthProvider>; }
function AppContent() { const { user, loading } = useAuth(); if (loading) return <div className="min-h-screen bg-indigo-600 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>; return user ? <Tracker /> : <AuthScreen />; }

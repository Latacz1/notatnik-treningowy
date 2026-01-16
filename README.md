# 🏋️ Notatnik Treningowy z Firebase

Aplikacja do śledzenia treningów z **logowaniem email + hasło** i **synchronizacją między urządzeniami**.

---

## 🔥 Krok 1: Stwórz projekt Firebase (5 minut)

### 1.1 Wejdź na Firebase Console
1. Otwórz: **https://console.firebase.google.com**
2. Zaloguj się kontem Google (dowolnym)
3. Kliknij **"Utwórz projekt"** (lub "Add project" po angielsku)

### 1.2 Skonfiguruj projekt
1. **Nazwa projektu**: wpisz np. `notatnik-treningowy`
2. Kliknij **Dalej**
3. Google Analytics → **wyłącz** (niepotrzebne) → kliknij **Utwórz projekt**
4. Poczekaj chwilę, kliknij **Dalej**

### 1.3 Dodaj aplikację webową
1. Na głównej stronie projektu kliknij ikonę **</>** (Web)
2. Nazwa aplikacji: `notatnik-treningowy`
3. ❌ NIE zaznaczaj "Firebase Hosting"
4. Kliknij **Zarejestruj aplikację**
5. 🔑 **WAŻNE**: Skopiuj dane z sekcji `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy.....................",
  authDomain: "notatnik-treningowy-xxxxx.firebaseapp.com",
  projectId: "notatnik-treningowy-xxxxx",
  storageBucket: "notatnik-treningowy-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

6. Kliknij **Przejdź do konsoli**

---

## 🔐 Krok 2: Włącz logowanie email/hasło

1. W menu po lewej kliknij **Build** → **Authentication**
2. Kliknij **Get started** (Rozpocznij)
3. W zakładce **Sign-in method** kliknij **Email/Password**
4. Włącz przełącznik **Włącz** (Enable)
5. ❌ NIE włączaj "Email link" (niepotrzebne)
6. Kliknij **Zapisz**

---

## 🗄️ Krok 3: Stwórz bazę danych Firestore

1. W menu po lewej kliknij **Build** → **Firestore Database**
2. Kliknij **Create database** (Utwórz bazę danych)
3. Wybierz lokalizację: **eur3 (europe-west)** ← najbliżej Polski
4. Kliknij **Dalej**
5. Wybierz **Start in test mode** (tryb testowy)
6. Kliknij **Utwórz**

### 3.1 Ustaw reguły bezpieczeństwa
1. Kliknij zakładkę **Rules** (Reguły)
2. Zamień domyślne reguły na:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Kliknij **Publish** (Opublikuj)

> Te reguły oznaczają: każdy użytkownik może czytać i zapisywać TYLKO swoje dane.

---

## 📝 Krok 4: Wklej klucze do aplikacji

1. Otwórz plik `src/App.jsx`
2. Znajdź sekcję na górze:

```javascript
const firebaseConfig = {
  apiKey: "TWOJ_API_KEY",
  authDomain: "TWOJ_PROJEKT.firebaseapp.com",
  ...
};
```

3. Zamień na swoje dane z kroku 1.5

---

## 🚀 Krok 5: Opublikuj na Vercel

### 5.1 Wgraj na GitHub
1. Załóż konto na **github.com** (jeśli nie masz)
2. Stwórz nowe repozytorium: `notatnik-treningowy`
3. Wgraj wszystkie pliki z tego folderu

### 5.2 Deploy na Vercel
1. Wejdź na **vercel.com**
2. Zaloguj się przez GitHub
3. Kliknij **Add New** → **Project**
4. Wybierz repo `notatnik-treningowy`
5. Kliknij **Deploy**
6. Poczekaj 1-2 minuty ☕

### Gotowe! 🎉

Twoja aplikacja jest dostępna pod adresem typu:
`https://notatnik-treningowy.vercel.app`

---

## 📱 Jak korzystać

1. Wejdź na swoją stronę
2. Kliknij **"Zarejestruj się"**
3. Wpisz email i hasło (min. 6 znaków)
4. Gotowe! Twoje treningi zapisują się w chmurze
5. Zaloguj się na telefonie tym samym kontem → te same dane! 🔄

---

## ❓ FAQ

### Czy to bezpieczne?
Tak. Firebase używa szyfrowania, hasła są hashowane, a reguły Firestore pilnują, żeby każdy widział tylko swoje dane.

### Czy to darmowe?
Tak, dla osobistego użytku. Darmowe limity Firebase:
- 50,000 odczytów / dzień
- 20,000 zapisów / dzień
- 1 GB storage

Nigdy ich nie przekroczysz normalnym użytkowaniem.

### Mogę zmienić hasło?
Tak, Firebase ma wbudowaną funkcję "Forgot password". Mogę ją dodać - daj znać!

### Jak usunąć konto?
W Firebase Console → Authentication → Users → znajdź email → Delete

---

## 🛠️ Uruchomienie lokalne

```bash
npm install
npm run dev
```

Otwórz: http://localhost:5173

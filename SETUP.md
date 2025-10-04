# 🚀 Tool - GitHub Setup Guide

## ✅ Repository Initialized!

Git repository został zainicjowany lokalnie. Teraz musisz utworzyć repozytorium na GitHub i połączyć je.

---

## 📋 Następne Kroki

### 1. Utwórz Repository na GitHub

1. Idź na: **https://github.com/new**
2. Wypełnij:
   - **Repository name:** `Tool`
   - **Description:** `Advanced System Optimization & Gaming Boost - Windows Desktop App`
   - **Visibility:** Public (dla darmowych GitHub Actions)
   - **NIE zaznaczaj** "Initialize this repository with a README"
3. Kliknij **"Create repository"**

### 2. Zaktualizuj package.json

⚠️ **WAŻNE:** Otwórz `package.json` i zamień `tooltech` na swoją nazwę użytkownika GitHub!

Znajdź i zamień:
```json
"repository": {
  "url": "https://github.com/TWOJA-NAZWA/Tool.git"
},
"bugs": {
  "url": "https://github.com/TWOJA-NAZWA/Tool/issues"
},
"homepage": "https://github.com/TWOJA-NAZWA/Tool#readme",
"publish": {
  "owner": "TWOJA-NAZWA"
}
```

### 3. Połącz z GitHub i Push

Skopiuj i wklej do PowerShell (ZAMIEŃ `tooltech` na swoją nazwę!):

```powershell
# Dodaj remote (ZAMIEŃ tooltech na swoją nazwę GitHub!)
git remote add origin https://github.com/tooltech/Tool.git

# Push main branch
git push -u origin main

# Push tag v2.1.0 (triggeruje GitHub Actions!)
git push origin v2.1.0
```

### 4. Sprawdź GitHub Actions

Po push tagu, GitHub Actions automatycznie:
- Zbuduje `Tool-Setup-2.1.0.exe`
- Utworzy GitHub Release "Tool v2.1.0"
- Uploaduje instalator i `latest.yml`

**Sprawdź status:**
```
https://github.com/TWOJA-NAZWA/Tool/actions
```

Poczekaj ~5-10 minut na zakończenie buildu.

### 5. Weryfikuj Release

Po zakończeniu GitHub Actions:

```
https://github.com/TWOJA-NAZWA/Tool/releases
```

Powinieneś zobaczyć:
- ✅ Release "Tool v2.1.0"
- ✅ `Tool-Setup-2.1.0.exe` (do pobrania)
- ✅ `latest.yml` (dla auto-updater)

---

## 🔧 Struktura Projektu

```
Toolv2/
├── .github/
│   └── workflows/
│       └── build-release.yml       # GitHub Actions CI/CD
├── assets/
│   └── Tool.png                    # Logo aplikacji
├── renderer/
│   ├── components/                 # Komponenty React
│   │   ├── UpdateNotification.jsx  # Auto-update UI
│   │   └── ...
│   ├── styles/
│   │   ├── UpdateNotification.css
│   │   └── ...
│   └── index.html
├── scripts/
│   ├── build.bat                   # Build helper script
│   └── test-updater.bat            # Test auto-updater
├── main.js                          # Main process + auto-updater
├── preload.js                       # Preload script + update API
├── package.json                     # Project config
├── README.md                        # English README
├── README_PL.md                     # Polish README
└── LICENSE.txt                      # MIT License
```

---

## 📝 Workflow dla Przyszłych Aktualizacji

### Tworzenie Nowej Wersji (np. v2.2.0):

```powershell
# 1. Zmień kod (dodaj funkcje, napraw bugi)
# ... edytuj pliki ...

# 2. Zmień wersję w package.json
# "version": "2.1.0" → "2.2.0"

# 3. Commit i push
git add .
git commit -m "Add new feature X"
git push origin main

# 4. Utwórz tag
git tag v2.2.0

# 5. Push tag (triggeruje GitHub Actions!)
git push origin v2.2.0

# 6. GitHub Actions automatycznie zbuduje i opublikuje!
# 7. Użytkownicy dostaną powiadomienie o aktualizacji w aplikacji
```

---

## 🎯 Jak Działa Auto-Update

### Flow Aktualizacji:

1. **Użytkownik uruchamia Tool v2.1.0**
2. **Po 3 sekundach:** Aplikacja sprawdza GitHub Releases
3. **Jeśli jest v2.2.0:**
   - 🔔 Powiadomienie: "Dostępna Nowa Wersja! - v2.2.0"
   - Przyciski: "Pobierz Aktualizację" / "Później"
4. **Użytkownik klika "Pobierz":**
   - Pasek postępu (0-100%)
   - Prędkość pobierania (MB/s)
5. **Po pobraniu:**
   - ✅ "Aktualizacja Gotowa!"
   - "Zainstaluj Teraz" / "Zainstaluj Później"
6. **Kliknięcie "Zainstaluj":**
   - Aplikacja się zamyka
   - Instalator uruchamia się
   - Instaluje v2.2.0
   - Gotowe! ✅

---

## 🛠️ Przydatne Komendy

```powershell
# Uruchom aplikację lokalnie
npm start

# Build instalatora lokalnie
npm run build:win

# Sprawdź status git
git status

# Zobacz logi
git log --oneline

# Zobacz wszystkie tagi
git tag -l

# Sprawdź remote
git remote -v
```

---

## 📊 Stan Projektu

### ✅ Gotowe:

- [x] Git repository zainicjowane
- [x] Pierwszy commit utworzony
- [x] Tag v2.1.0 utworzony
- [x] Branch zmieniony na 'main'
- [x] Pliki BAT przeniesione do `/scripts`
- [x] Niepotrzebne pliki MD usunięte
- [x] Struktura projektu uporządkowana

### 🚀 Do Zrobienia:

- [ ] Utwórz repository na GitHub
- [ ] Zaktualizuj URLs w package.json
- [ ] Dodaj remote origin
- [ ] Push main branch
- [ ] Push tag v2.1.0
- [ ] Sprawdź GitHub Actions
- [ ] Zweryfikuj Release

---

## 🎉 Po Wdrożeniu

### Masz teraz:

✅ **Pełny system auto-updater** z UI  
✅ **GitHub Actions CI/CD** dla automatycznych buildów  
✅ **GitHub Releases** jako hosting  
✅ **Profesjonalny deployment pipeline**  

### Rezultat:

**Każdy push tagu automatycznie:**
- Builduje nowy instalator
- Tworzy GitHub Release
- Powiadamia użytkowników
- Dystrybuuje aktualizację

**Nie musisz już nic robić ręcznie!** 🚀

---

## 📞 Wsparcie

Jeśli coś nie działa:
1. Sprawdź GitHub Actions logi: `/actions`
2. Sprawdź czy latest.yml istnieje: `/releases/latest/download/latest.yml`
3. Zobacz DevTools Console w aplikacji dla błędów

---

**Made with ❤️ by tooltech.pl**

**Tool © 2025 - All rights reserved**

<div align="center">
  <img src="assets/Tool.png" alt="Tool Logo" width="150" />
  
  # Tool - Advanced System Optimizer

  ![Tool Logo](https://img.shields.io/badge/Tool-v1.0.0-purple?style=for-the-badge)
  ![Electron](https://img.shields.io/badge/Electron-27.0-blue?style=for-the-badge)
  ![React](https://img.shields.io/badge/React-18.2-cyan?style=for-the-badge)

  Profesjonalna aplikacja desktopowa do optymalizacji i monitoringu systemu, stworzona w Electron + React.

  🌐 **Website:** [tooltech.pl](https://tooltech.pl)
  
</div>

---

## 🚀 Funkcje

### Dashboard
- **Optymalizacja RAM** - Zwalnia pamięć i przyspiesza system
- **Czyszczenie Cache** - Usuwa tymczasowe pliki systemowe
- **Zarządzanie Procesami** - Zamyka nieużywane aplikacje
- **Manager Autostartu** - Kontrola programów startowych

### Monitor Zasobów
- Monitorowanie CPU w czasie rzeczywistym
- Śledzenie użycia pamięci RAM
- Wykresy historyczne użycia zasobów
- Informacje o dyskach i sieci
- Kolorowe wskaźniki statusu

### Menedżer Procesów
- Lista wszystkich uruchomionych procesów
- Sortowanie i filtrowanie
- Kończenie procesów z poziomu aplikacji
- Szczegółowe informacje o każdym procesie

### Ustawienia
- Przełączanie między trybem jasnym/ciemnym
- Wybór języka interfejsu
- Konfiguracja autostartu
- Dostosowanie częstotliwości odświeżania
- Skróty klawiszowe

## 📦 Instalacja

```bash
cd Toolv2
npm install
```

## 🎮 Uruchomienie

```bash
npx electron .
```

lub

```bash
npm start
```

## ⌨️ Skróty Klawiszowe

- `Ctrl+Shift+T` - Pokaż/Ukryj aplikację
- `Ctrl+1` - Dashboard
- `Ctrl+2` - Monitor
- `Ctrl+3` - Procesy
- `Ctrl+,` - Ustawienia
- `Ctrl+Shift+O` - Optymalizuj RAM
- `Ctrl+Shift+C` - Wyczyść Cache
- `F5` - Odśwież statystyki
- `F11` - Pełny ekran
- `F12` - Developer Tools

## 🎨 Design

Aplikacja wykorzystuje ultranowoczesny design inspirowany reactbits.dev:
- **Custom Titlebar** - własny pasek tytułowy z minimize/maximize/close
- **Cosmic Gradient** - piękne gradienty fiolet→róż→pomarańcz
- **Glassmorphism** - efekty szkła z blur i transparency
- **Glow Effects** - świecące elementy i cienie
- **Smooth Animations** - płynne animacje i przejścia
- **Floating Elements** - animowane tła
- **Gradient Shift** - przesuwające się gradienty
- **Hover Effects** - interaktywne efekty najechania
- Czarne tło z kolorowymi akcentami
- Tryb jasny/ciemny
- Responsywny layout

## 🏗️ Struktura Projektu

```
Toolv2/
├── main.js                          # Główny proces Electron
├── preload.js                       # Preload script
├── package.json                     # Zależności
├── .babelrc                         # Konfiguracja Babel
└── renderer/
    ├── index.html                   # Główny HTML
    ├── App.jsx                      # Główny komponent React
    ├── styles.css                   # Globalne style
    └── components/
        ├── Dashboard.jsx            # Strona główna
        ├── Monitor.jsx              # Monitor zasobów
        ├── ProcessList.jsx          # Lista procesów
        ├── Settings.jsx             # Ustawienia
        ├── Navigation.jsx           # Menu nawigacyjne
        ├── NotificationCenter.jsx   # Powiadomienia
        ├── StatCard.jsx             # Karty statystyk
        ├── ActionButton.jsx         # Przyciski akcji
        ├── CircularProgress.jsx     # Okrągłe wskaźniki
        ├── DiskUsage.jsx            # Użycie dysku
        ├── NetworkInfo.jsx          # Info sieciowe
        └── StartupManager.jsx       # Manager autostartu
```

## 💻 Technologie

- **Electron 27.0** - Framework aplikacji desktopowych
- **React 18.2** - Biblioteka UI
- **JavaScript (ES6+)** - Czysty JS bez TypeScript
- **CSS3** - Nowoczesne style z animacjami
- **Node.js** - Backend IPC

## 🛠️ Funkcje Systemowe

### Windows
- Odczyt procesów (tasklist)
- Optymalizacja pamięci (powershell)
- Czyszczenie cache
- Informacje o dyskach (wmic)
- Manager autostartu

### Linux/macOS
- Odczyt procesów (ps aux)
- Czyszczenie cache
- Informacje o dyskach (df -h)

## 📊 Statystyki Aplikacji

- **Linie kodu:** ~3500+
- **Komponenty React:** 12
- **Funkcje IPC:** 15+
- **Animacje CSS:** 10+
- **Obsługa skrótów:** 10+

## 🔒 Bezpieczeństwo

- Context Isolation włączona
- Node Integration wyłączona
- Bezpieczna komunikacja IPC
- Walidacja wszystkich akcji systemowych

## 📝 Licencja

MIT License - © 2025 tooltech.pl

## 🤝 Wsparcie

Masz pytania? Odwiedź:
- 🌐 Website: [tooltech.pl](https://tooltech.pl)
- 📧 Email: support@tooltech.pl
- 📖 Dokumentacja: [tooltech.pl/docs](https://tooltech.pl/docs)

## ⭐ Features Highlight

✅ Pełna funkcjonalność bez błędów
✅ Piękny, nowoczesny design
✅ Responsywny i płynny
✅ Kompletna dokumentacja
✅ Gotowa do użycia
✅ Rozbudowana architektura
✅ Profesjonalny kod

---

**Made with ❤️ by tooltech.pl**

<div align="center">
  <img src="Tool.png" alt="Tool Logo" width="200" />
  
  # Tool Logo Assets
  
  **Oficjalne logo aplikacji Tool**
  
</div>

---

## 📦 Dostępne formaty

### Tool.png
- Format: PNG
- Rozmiar: Zoptymalizowany dla aplikacji
- Użycie: Ikona aplikacji, titlebar, dokumentacja
- Tło: Przezroczyste/ciemne
- Kolory: Gradient fioletowo-różowy zgodny z brandingiem

### logo.svg
- Format: SVG (wektor)
- Rozmiar: 512x512 viewBox
- Użycie: Skalowalne logo dla różnych celów
- Animacje: Zawiera animowane elementy
- Kolory: Cosmic gradient (#a855f7 → #ec4899)

## 🎨 Specyfikacja kolorów

Logo wykorzystuje oficjalną paletę Tool:
- **Primary Purple**: `#a855f7`
- **Primary Pink**: `#ec4899`
- **Secondary Orange**: `#f97316`
- **Background**: `#0a0a0a` / `#1a1a2e`

## 📐 Wytyczne użycia

### ✅ Dozwolone użycie:
- Ikona aplikacji w systemie
- Logo w titlebar
- Dokumentacja (README, DOCS)
- Materiały promocyjne
- Strona internetowa tooltech.pl

### ❌ Niedozwolone użycie:
- Modyfikacja kolorów poza paletą
- Zniekształcanie proporcji
- Dodawanie efektów zewnętrznych
- Używanie w celach komercyjnych bez zgody

## 🔧 Implementacja

### W aplikacji Electron:
```javascript
// main.js - ikona okna
icon: path.join(__dirname, 'assets', 'Tool.png')
```

### W komponencie React:
```jsx
// TitleBar.jsx - logo w titlebar
<img src="assets/Tool.png" alt="Tool" className="titlebar-logo" />
```

### W dokumentacji Markdown:
```markdown
![Tool Logo](assets/Tool.png)
```

## 📄 Licencja

Logo "Tool" jest własnością **tooltech.pl**  
Wszelkie prawa zastrzeżone © 2025

---

<div align="center">
  
  **Made with ❤️ by tooltech.pl**
  
</div>

# StillRoll — offline backlog

Rzeczy z planu „offline slideshow”, które **nie zostały zaimplementowane** (stan: czerwiec 2026).

Faza 1 (MVP) jest wdrożona: PWA, `.stillroll`, Worker, walidacja bezpieczeństwa, UI eksportu/importu.

---

## Faza 2 — większe funkcje

### 1. Zapis na urządzeniu (IndexedDB)

- [ ] Store `packages` w IndexedDB (bloby zdjęć + manifest)
- [ ] Przycisk **„Zapisz na tym urządzeniu”** obok eksportu `.stillroll`
- [ ] Sekcja **„Zapisane pokazy”** na ekranie startowym (lista, data, liczba zdjęć, Start / Usuń)
- [ ] `navigator.storage.estimate()` przed zapisem — ostrzeżenie gdy brakuje miejsca
- [ ] Limit **max 5** zapisanych pokazów lub pokaz łącznego rozmiaru + „Usuń najstarszy”
- [ ] Plik: `src/utils/offlineStorage.ts` (rozszerzenie `folderStorage.ts`)

### 2. Lekki link do folderu (`.stillroll.json`)

- [ ] Eksport: tylko `config` + lista `relativePath` + `folderName` (~KB, bez zdjęć)
- [ ] Import: ponowne wskazanie folderu (`showDirectoryPicker`) + dopasowanie ścieżek
- [ ] Walidacja przed startem: `found` / `missing` / `extra`
- [ ] UI: „12/15 zdjęć dostępnych. Brakuje: …” + **Start z dostępnymi** / Anuluj / Wskaż folder ponownie
- [ ] Jasne ostrzeżenie: folder musi zostać w tym samym miejscu; na innym PC trzeba folder + JSON

---

## Drobne luki UX / docs (faza 1.5)

### 3. Dokumentacja

- [ ] Sekcja **Offline** w `README.md` (przygotowanie, eksport, event, Chrome/Edge, PWA)
- [ ] Krótka rozwijana sekcja w apce: **„Offline na evencie”** (3 zdania FAQ, nie tylko `offlineHint`)

### 4. Eksport — informacje przed zapisem

- [ ] **Szacowany rozmiar pakietu** przed kliknięciem eksportu (na podstawie liczby zdjęć i jakości)
- [ ] Ostrzeżenie przy **> 500 zdjęć** (`WARN_SLIDES` — stała już jest w `limits.ts`)
- [ ] Twardy komunikat przy próbie eksportu **> 2000 zdjęć** (`MAX_SLIDES`)

### 5. Wydajność (opcjonalne usprawnienia)

- [ ] Prawdziwy **streaming unzip** w Workerze (dziś: limity 2 GB, ale całość ląduje w RAM workera)
- [ ] Subset fontów: tylko latin w PWA cache (częściowo — latin jest; vietnamese/latin-ext można wyciąć z buildu jeśli wrócą)

---

## Z planu UI — niezrealizowane elementy layoutu

Z oryginalnego mockupu `SetupPanel`:

```
[ Zapisane na tym urządzeniu ]  ← lista (IndexedDB) — brak
[ Eksportuj link do folderu ]   ← .stillroll.json — brak
▸ Offline na evencie             ← rozwijany FAQ — brak (jest tylko hint)
```

---

## Priorytet sugerowany przy powrocie

1. README + ostrzeżenia rozmiaru (szybkie, duża wartość)
2. IndexedDB „zapisane pokazy” (ten sam laptop bez pliku)
3. `.stillroll.json` tylko jeśli użytkownicy proszą o „mały plik”

---

## Jak testować to, co już działa

```bash
npm run test    # validatePackage (zip-bomb, path traversal)
npm run dev     # eksport/import .stillroll, drag-and-drop
```

**Flow MVP:** folder → Eksportuj pakiet `.stillroll` → na evencie Otwórz pakiet lub double-click (PWA + Chrome/Edge).

---

## Inne backlogi

- [`MOBILE_BACKLOG.md`](MOBILE_BACKLOG.md) — galeria zdjęć na iOS/Android (Wybrane / Wszystkie), Capacitor — **na kiedyś**

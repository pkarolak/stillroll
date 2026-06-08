# StillRoll — mobile backlog (na kiedyś)

Pomysł na integrację z **galerią zdjęć na iOS i Android** — **nieplanowane na teraz** (stan: czerwiec 2026).

Obecnie na mobile działa głównie ścieżka **`.stillroll`**; wybór folderu jest ograniczony (iOS: brak pickera folderów w przeglądarce).

---

## Cel produktowy

Użytkownik mógłby oprócz folderu:

- **Wybrane zdjęcia** — wskazać konkretne zdjęcia z lokalnej galerii i odpalić pokaz
- **Wszystkie zdjęcia** — pokaz z całej biblioteki (wymaga natywnej apki)

---

## Co jest możliwe (ograniczenia platform)

| Funkcja | PWA (Safari / Chrome) | Natywna apka (Capacitor) |
|--------|------------------------|---------------------------|
| Wybierz folder | Android: często; iOS: **nie** | Tak (z ograniczeniami iOS) |
| **Wybrane zdjęcia** | **Tak** — `<input accept="image/*" multiple>` | Tak — PHPicker / Android Photo Picker |
| **Wszystkie zdjęcia** | **Nie** — brak API w Web | **Tak** — Photos / MediaStore + uprawnienia |
| Zapamiętanie wyboru | Folder: tak (handle w IndexedDB); galeria: **nie** | Możliwe przez `nativeAssetId` |
| Trwałość między sesjami | Eksport `.stillroll` (już jest) | To samo |

**Wniosek:** „Wybrane” da się dodać do obecnej PWA; „Wszystkie” wymaga natywnej warstwy (Capacitor lub osobne apki).

---

## Faza 1 — Galeria w PWA (~1–2 dni)

Niski koszt, duży zysk na mobile bez App Store / Play Store.

- [ ] `pickGalleryPhotos()` w [`src/utils/collectImages.ts`](src/utils/collectImages.ts) — `input` z `accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"` i `multiple`
- [ ] Mapowanie wyniku na istniejący [`ImageEntry`](src/types.ts) (`{ path, file }`) — bez zmian w slideshow / eksporcie
- [ ] Nowy [`GallerySection.tsx`](src/components/setup/GallerySection.tsx) (wzorzec: `FolderSection` / `PackageSection`)
- [ ] Na mobile promować galerię, folder ukryć lub zdegradować — [`detectBrowser.ts`](src/utils/detectBrowser.ts): `isMobile()`, `supportsFolderPicker()`
- [ ] Podłączenie w [`SetupFlow.tsx`](src/components/SetupFlow.tsx) i [`MainSetupScreen.tsx`](src/components/setup/MainSetupScreen.tsx)
- [ ] i18n PL/EN/ES: `pickGallery`, `gallerySelected`, `galleryHint`, `galleryNotPersistent`
- [ ] UX: hint że wybór galerii **nie jest trwały** (po restarcie trzeba wybrać ponownie lub wyeksportować `.stillroll`)
- [ ] Ostrzeżenie przy dużej liczbie zdjęć (RAM na mobile)

---

## Faza 2 — Natywne apki iOS/Android (~1–2 tygodnie)

Dla trybu **„Wszystkie zdjęcia”** i głębszej integracji z galerią.

- [ ] Capacitor shell wokół obecnego buildu Vite/React
- [ ] Abstrakcja źródeł w `src/utils/imageSource/`:
  - `pickFolder()` — jak dziś
  - `pickGallerySelected()` — PWA: file input; native: systemowy picker
  - `pickGalleryAll()` — **tylko native**
- [ ] Rozszerzenie typu `ImageEntry` o opcjonalne `nativeAssetId?: string`
- [ ] Lazy resolve w [`slideSource.ts`](src/utils/slideSource.ts) przez plugin Capacitor
- [ ] Własny minimalny plugin lub `@capacitor-community/media`
- [ ] Uprawnienia: iOS `NSPhotoLibraryUsageDescription`, Android `READ_MEDIA_IMAGES` / Photo Picker
- [ ] CI: buildy Xcode + Gradle obok deployu Vercel; TestFlight / Play Internal Testing

---

## Co NIE jest realistyczne

- **„Wszystkie zdjęcia” wyłącznie w PWA** — przeglądarka nie ma API do całej galerii bez interakcji użytkownika
- **Trwałe zapamiętanie wyboru z galerii w PWA** — obiekty `File` nie przeżywają restartu
- **Pełny folder picker na iOS Safari** — ograniczenie WebKit, nie bug aplikacji

---

## Pliki do ruszenia przy implementacji

| Plik | Zmiana |
|------|--------|
| `src/utils/collectImages.ts` | `pickGalleryPhotos()` |
| `src/components/setup/GallerySection.tsx` | nowy UI |
| `src/components/setup/MainSetupScreen.tsx` | routing mobile/desktop |
| `src/components/SetupFlow.tsx` | stan i handlery |
| `src/utils/detectBrowser.ts` | detekcja platformy |
| `src/i18n/translations.ts` | copy |
| Faza 2: `capacitor.config.ts`, `ios/`, `android/`, plugin | nowe |

---

## Powiązane backlogi

- [`OFFLINE_BACKLOG.md`](OFFLINE_BACKLOG.md) — IndexedDB, `.stillroll.json`, UX offline (osobny temat)

## Priorytet sugerowany przy powrocie

1. Faza 1 (PWA, „Wybrane”) — jeśli użytkownicy na telefonie proszą o galerię bez instalacji ze sklepu
2. Faza 2 (Capacitor) — tylko gdy potrzebne „Wszystkie zdjęcia” lub listing w App Store / Google Play

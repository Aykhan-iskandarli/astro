# Harada qalmışıq (13.11.2026)

Branch: `feature/astrology-extensions` (hələ `main`-ə birləşdirilməyib).
Ətraflı siyahı: `docs/roadmap.md` (mərhələ 8–14), arxitektura: `docs/architecture.md`.

## Hazır olanlar (bu branch-da)

- Asteroidlər (Ceres, Pallas, Juno, Vesta), Vertex, Ruh nöqtəsi, Selena (Ağ Ay)
- Həyat dövrləri: Yupiter, Saturn və Xiron qayıdışları, illik profeksiyalar
- "Karmik yol" tabı: Ay düyünləri (haradan gəlirsən → hara gedirsən), Xiron, Lilit
- Numerologiya: pinnacle/çağırışlar, şəxsi gün, ad dəyişikliyi yoxlaması, uyğunluq, Lo Shu, Pifaqor kvadratı (psixomatris)
- Ad analizi səhifəsi `/name-analysis` (yalnız ad-soyadla; doğum tarixi istəyə bağlı)
- Vedik: Sade Sati, yoqalar, D3/D7/D10/D12, Ashtakavarga, Guna Milan + Manglik
- Çin bürcü uyğunluğu
- Ay təqvimi (Ay günləri, faza, boş kurslu Ay); "Bu gün" səhifəsində Panchang və planet saatları
- Natal xəritə → ətraflı göstəricilər: dominantlar, qarşılıqlı resepsiyalar, out-of-bounds, antiscia, doğumdan əvvəlki tutulmalar, sabit ulduzlar, Ərəb (Hellenistik) nöqtələri, harmonik xəritələr H5/H7/H9
- Proqnoz → zamanlama: firdaria, zodiakal releasing, solar arc
- Uyğunluq tabı: Davison xəritəsi, uyğunluq xülasəsi
- "Digər sistemlər" tabı: Tarot doğum kartları, Maya Tzolkin, Kua
- Astrokartoqrafiya (dünya xəritəsində planet xətləri)
- Məxfilik siyasəti səhifəsi (az/en)

Testlər: engine 333, API 30, web 24, content 1632 açar — hamısı keçir.

## Qalan işlər

1. **Eris** — efemerid faylı (`s136199s.se1`) rəsmi mənbələrdə tapılmadı; fayl tapılsa əlavə etmək asandır.
2. **Primary directions** — hansı metodla (Placidus/Regiomontanus, Ptolemey açarı və ya Naibod) hesablanacağına qərar vermək lazımdır.
3. **Məxfilik siyasəti** — VPS alındıqdan sonra `VITE_PRIVACY_EMAIL` və `VITE_HOSTING_LOCATION` doldurulmalıdır (indi səhifədə "[təyin ediləcək]" görünür).
4. **Branch** — `feature/astrology-extensions` → `main` birləşdirmək və ya PR açmaq.
5. **Mətnlər** — `packages/content` daxilindəki şərhlər AI ilə yazılmış qaralamalardır; redaktə/yoxlama lazımdır.
6. **Gələcək (sonraya saxlanılıb)** — AI şərhləri, PDF hesabatlar, mobil tətbiq (Play Store), VPS-də yerləşdirmə.

## İşə salmaq

```
npm start                 # API (Docker, port 8000) + veb (port 3000)
npm test                  # web + content testləri
docker compose run --rm -w /app/packages/engine api pytest -q   # engine
docker compose run --rm api pytest -q                           # API
```

# Step 0 spike (kept for reproducibility)

Compares kerykeion (both backends) and stellium against raw pyswisseph. Results: `out/compare.md`,
renders in `out/*.svg`; conclusions in `../docs/spike-report.md`.

To re-run, copy the ephemeris files into `spike/ephe/` (ignored by git), build the two images and run the
scripts as described in the report:

```bash
mkdir -p spike/ephe && cp packages/engine/astra_engine/ephe/*.se1 spike/ephe/
docker build --build-arg PKG=kerykeion -t astra-spike-kery spike
docker build --build-arg PKG=stellium -t astra-spike-stel spike
```

The kerykeion SVG renders show "Location: Greenwich, GB" because the spike did not pass `city`/`nation`
(kerykeion offline-mode default); the engine passes them.

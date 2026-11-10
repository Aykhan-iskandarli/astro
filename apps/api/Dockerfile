# Build context: repository root (see docker-compose.yml)
FROM python:3.12-slim

# pyswisseph has no prebuilt wheels: needs a C/C++ toolchain
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 ASTRA_CITIES_PATH=/data/cities.json

WORKDIR /app
COPY packages/engine/pyproject.toml packages/engine/pyproject.toml
COPY packages/engine/astra_engine packages/engine/astra_engine
COPY apps/api/pyproject.toml apps/api/pyproject.toml
COPY apps/api/app apps/api/app
COPY apps/api/scripts apps/api/scripts
RUN pip install --no-cache-dir -e "packages/engine[test]" -e "apps/api[test]"

# Offline city index (GeoNames, CC BY 4.0) — built once at image build time
RUN mkdir -p /data && python apps/api/scripts/build_cities.py --out /data/cities.json

COPY packages/engine/tests packages/engine/tests
COPY apps/api/tests apps/api/tests

WORKDIR /app/apps/api
EXPOSE 8000
# --no-access-log: query strings could contain personal data
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--no-access-log"]

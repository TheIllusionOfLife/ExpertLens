FROM python:3.12-slim AS builder

RUN pip install uv
WORKDIR /app
COPY pyproject.toml .
RUN uv venv && uv sync --no-dev

FROM python:3.12-slim
WORKDIR /app

COPY --from=builder /app/.venv /app/.venv
COPY app/ app/
COPY agent/ agent/
COPY data/ data/

RUN useradd --create-home --uid 10001 appuser && chown -R appuser:appuser /app

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app"

EXPOSE 8000
USER appuser
CMD ["uvicorn", "app.api.main:app", "--host", "0.0.0.0", "--port", "8000"]

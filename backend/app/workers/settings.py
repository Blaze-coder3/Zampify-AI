"""ARQ worker settings — defines the task queue and worker configuration."""
from arq.connections import RedisSettings
from app.config import settings
from app.workers.invoice_processor import process_invoice


class WorkerSettings:
    functions = [process_invoice]
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
    max_jobs = 10
    job_timeout = 300  # 5 minutes max per invoice
    keep_result = 3600  # Keep results for 1 hour
    retry_jobs = True
    max_tries = 3

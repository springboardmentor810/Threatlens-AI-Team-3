import redis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        try:
            self.client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
            self.client.ping()
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. In-memory cache fallback will be used.")
            self.client = None
        
        self.in_memory_cache = {}

    def get(self, key: str):
        if self.client:
            try:
                return self.client.get(key)
            except Exception:
                pass
        return self.in_memory_cache.get(key)

    def set(self, key: str, value: str, ex: int = 3600):
        if self.client:
            try:
                self.client.set(key, value, ex=ex)
                return
            except Exception:
                pass
        self.in_memory_cache[key] = value

    def incr(self, key: str, ex: int = 60) -> int:
        if self.client:
            try:
                val = self.client.incr(key)
                if val == 1:
                    self.client.expire(key, ex)
                return val
            except Exception:
                pass
        val = int(self.in_memory_cache.get(key, 0)) + 1
        self.in_memory_cache[key] = str(val)
        return val

redis_client = RedisClient()

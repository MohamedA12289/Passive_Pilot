from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Index

from app.core.db import Base


class GeocodeCache(Base):
    __tablename__ = "geocode_cache"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, nullable=False, unique=True, index=True)
    provider = Column(String, nullable=False, default="stub")
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


Index("ix_geocode_cache_query", GeocodeCache.query)

import sys
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, async_scoped_session
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from decouple import config
from asyncio import current_task
from sqlalchemy import create_engine

temp_conn = f"postgresql+asyncpg://{config('USER')}:{config('PASSWORD')}@{config('HOST')}:{config('PORT')}/{config('DATABASE')}"


engine = create_async_engine(
    temp_conn,
    echo=True,
    future=True,
    poolclass=NullPool,
)


Base = declarative_base()


async_session = sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession)


AsyncScopedSession = async_scoped_session(
    async_session,
    scopefunc=current_task
)


async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session

# these three lines swap the stdlib sqlite3 lib with the pysqlite3 package
#__import__('pysqlite3')
#sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

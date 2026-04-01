from sqlalchemy.dialects.postgresql import UUID
from db.db import Base
from sqlalchemy import (
    Table,
    Column,
    Integer,
    FLOAT,
    String,
    ForeignKey,
    DateTime,
    text,
    TEXT,
    BOOLEAN,
    JSON,
    UniqueConstraint
)
from sqlalchemy.sql import func

################################
##            USERS           ##
################################

class User(Base):

    __tablename__ = 'users'
    __table_args__ = {'sqlite_autoincrement': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(300), nullable=False)
    lastname = Column(String(300), nullable=False)
    email = Column(String(300), nullable=False, unique=True)
    password = Column(String(300), nullable=True)
    verification_code = Column(String(300), nullable=True)
    verified_account = Column(BOOLEAN, server_default=text('false'))
    recovery_code = Column(String(300), nullable=True)
    recovery_code_expiration = Column(DateTime, nullable=True)
    profile_img = Column(TEXT, nullable=True)
    created = Column(DateTime, default=func.now(), server_default=func.now())
    modified = Column(DateTime, nullable=True)
    deleted = Column(DateTime, nullable=True)

################################
##            Roles           ##
################################
class Roles(Base):

    __tablename__ = 'roles'
    __table_args__ = {'sqlite_autoincrement': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(TEXT, nullable=False)
    description = Column(TEXT, nullable=False)
    

################################
##            CHAT           ##
################################
class Chat(Base):

    __tablename__ = 'chat'
    __table_args__ = {'sqlite_autoincrement': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    userid = Column(Integer, ForeignKey("users.id"))
    rol = Column(Integer, ForeignKey("roles.id"))
    message = Column(TEXT, nullable=False)
    response = Column(TEXT, nullable=False)
    created = Column(DateTime, default=func.now(), server_default=func.now())


################################
##            CHAT           ##
################################
class RolesUser(Base):

    __tablename__ = 'roles_user'
    __table_args__ = {'sqlite_autoincrement': True}

    id = Column(Integer, primary_key=True, autoincrement=True)
    userid = Column(Integer, ForeignKey("users.id"))
    idrol = Column(Integer, ForeignKey("roles.id"))
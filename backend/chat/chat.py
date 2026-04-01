from __future__ import annotations

import os
import re
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Dict, List, Optional

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import CharacterTextSplitter


DEMO_MODE = os.getenv("DEMO_MODE", "0") == "1"


class SimpleVectorStore:
    """
    Vector store simple en memoria.
    Ideal para demo deploy y portfolio.
    """

    def __init__(self) -> None:
        self._documents: List[Any] = []

    def clear(self) -> None:
        self._documents = []

    def add_documents(self, docs: List[Any]) -> None:
        self._documents.extend(docs)

    def delete(self, ids: List[str]) -> None:
        ids_to_remove = set()
        for item in ids:
            try:
                ids_to_remove.add(int(item))
            except (TypeError, ValueError):
                continue

        self._documents = [
            doc for index, doc in enumerate(self._documents)
            if index not in ids_to_remove
        ]

    def get(self, include: Optional[List[str]] = None) -> Dict[str, Any]:
        return {
            "ids": [str(i) for i in range(len(self._documents))],
            "documents": [
                getattr(doc, "page_content", str(doc))
                for doc in self._documents
            ],
            "metadatas": [
                getattr(doc, "metadata", {})
                for doc in self._documents
            ],
        }

    @property
    def documents(self) -> List[Any]:
        return self._documents


class Chat:
    """
    Chat documental lightweight.
    - DEMO_MODE: usa documentos mock
    - FULL_MODE: usa PDFs reales
    """

    def __init__(self, documents_folder_path: str) -> None:
        self.documents_folder_path = documents_folder_path
        self.documents: List[str] = []
        self.vectorstore1 = SimpleVectorStore()
        self.genie = None

        self.ensure_directory_exists()

        if DEMO_MODE:
            self._load_demo_documents()
        else:
            self.list_folder_elements()
            self.add_documents_to_vectorstore()

    def ensure_directory_exists(self) -> None:
        if DEMO_MODE:
            return

        if not self.documents_folder_path:
            return

        os.makedirs(self.documents_folder_path, exist_ok=True)

    def _load_demo_documents(self) -> None:
        """
        Carga documentos simulados para portfolio.
        """
        demo_docs = [
            {
                "page_content": (
                    "La plataforma Xitrus permite consultas documentales "
                    "sobre contratos, combustibles, logística y seguridad industrial."
                ),
                "metadata": {"source": "demo_contracts.pdf", "page": 1},
            },
            {
                "page_content": (
                    "El sistema soporta arquitectura FastAPI, PostgreSQL, "
                    "Docker, Cloud Deploy y procesamiento de PDFs."
                ),
                "metadata": {"source": "demo_architecture.pdf", "page": 2},
            },
            {
                "page_content": (
                    "La solución fue diseñada para búsqueda semántica, "
                    "workflows empresariales y futura integración con RAG."
                ),
                "metadata": {"source": "demo_rag.pdf", "page": 3},
            },
        ]

        class DemoDoc:
            def __init__(self, page_content, metadata):
                self.page_content = page_content
                self.metadata = metadata

        docs = [DemoDoc(**doc) for doc in demo_docs]
        self.vectorstore1.add_documents(docs)
        self.documents = [doc["metadata"]["source"] for doc in demo_docs]

    def list_folder_elements(self) -> List[str]:
        elements: List[str] = []

        if DEMO_MODE:
            return self.documents

        if not self.documents_folder_path:
            self.documents = []
            return elements

        folder = Path(self.documents_folder_path)
        if not folder.exists():
            self.documents = []
            return elements

        for entry in folder.iterdir():
            if entry.is_file() and entry.suffix.lower() == ".pdf":
                elements.append(str(entry))

        self.documents = elements
        return elements

    def _load_pdf_as_chunks(self, file_path: str) -> List[Any]:
        loader = PyPDFLoader(file_path=file_path)
        pages = loader.load_and_split()

        text_splitter = CharacterTextSplitter(
            chunk_size=1024,
            chunk_overlap=256
        )
        return text_splitter.split_documents(pages)

    def add_documents_to_vectorstore(self) -> str:
        if DEMO_MODE:
            return "Demo mode activo: documentos mock cargados."

        self.vectorstore1.clear()
        self.list_folder_elements()

        loaded_files: List[str] = []

        for file_path in self.documents:
            try:
                texts = self._load_pdf_as_chunks(file_path)
                self.vectorstore1.add_documents(texts)
                loaded_files.append(Path(file_path).name)
            except Exception as exc:
                print(f"[Chat] No se pudo cargar {file_path}: {exc}")

        if not loaded_files:
            return "No se cargaron documentos PDF."

        return f"Documentos cargados: {', '.join(loaded_files)}"

    def add_new_document_to_vectorstore(self, path: str) -> str:
        if DEMO_MODE:
            return "Demo mode activo: upload deshabilitado para cloud demo."

        if not os.path.isfile(path):
            return f"El archivo no existe: {path}"

        if not path.lower().endswith(".pdf"):
            return "Solo se admiten archivos PDF."

        try:
            texts = self._load_pdf_as_chunks(path)
            self.vectorstore1.add_documents(texts)

            if path not in self.documents:
                self.documents.append(path)

            return f"Documento agregado: {Path(path).name}"
        except Exception as exc:
            return f"No se pudo agregar el documento: {exc}"

    def reset_vectorstore(self) -> str:
        self.vectorstore1.clear()

        if DEMO_MODE:
            self._load_demo_documents()
            return "Demo store reiniciado."

        return self.add_documents_to_vectorstore()

    def view_vectorstore(self) -> Dict[str, Any]:
        return self.vectorstore1.get(include=["documents"])

    def _normalize_text(self, text: str) -> List[str]:
        return re.findall(r"\w+", text.lower(), flags=re.UNICODE)

    def _score_chunk(self, query: str, chunk_text: str) -> float:
        query_tokens = set(self._normalize_text(query))
        chunk_tokens = set(self._normalize_text(chunk_text))

        if not query_tokens or not chunk_tokens:
            return 0.0

        overlap_score = len(query_tokens & chunk_tokens) / max(len(query_tokens), 1)
        similarity_score = SequenceMatcher(
            None,
            query.lower(),
            chunk_text.lower()
        ).ratio()

        return (0.75 * overlap_score) + (0.25 * similarity_score)

    def _search_relevant_chunks(
        self,
        consulta: str,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        scored: List[Dict[str, Any]] = []

        for doc in self.vectorstore1.documents:
            text = (getattr(doc, "page_content", "") or "").strip()
            metadata = getattr(doc, "metadata", {}) or {}
            score = self._score_chunk(consulta, text)

            if score <= 0:
                continue

            scored.append(
                {
                    "score": score,
                    "text": text,
                    "source": Path(
                        str(metadata.get("source", "documento"))
                    ).name,
                    "page": metadata.get("page", "N/A"),
                }
            )

        scored.sort(key=lambda item: item["score"], reverse=True)
        return scored[:top_k]

    def _format_snippet(self, text: str, max_len: int = 320) -> str:
        clean = re.sub(r"\s+", " ", text).strip()
        if len(clean) <= max_len:
            return clean
        return clean[:max_len].rstrip() + "..."

    def chatear(self, consulta: str) -> str:
        consulta = (consulta or "").strip()

        if not consulta:
            return "Escribí una consulta para poder ayudarte."

        matches = self._search_relevant_chunks(consulta, top_k=3)

        if not matches:
            if DEMO_MODE:
                return (
                    "🚀 Demo pública activa.\n\n"
                    "No encontré coincidencias exactas, pero la plataforma está preparada "
                    "para búsqueda documental, RAG y workflows empresariales."
                )

            return (
                "No encontré coincidencias claras en los documentos cargados."
            )

        response_lines = [
            "🚀 Respuesta documental encontrada:",
            "",
        ]

        for idx, match in enumerate(matches, start=1):
            snippet = self._format_snippet(match["text"])
            response_lines.append(
                f"{idx}. 📄 {match['source']} | página {match['page']}\n"
                f"   {snippet}"
            )

        if DEMO_MODE:
            response_lines.append(
                "\n💡 Demo mode: esta versión pública usa documentos simulados "
                "para mostrar arquitectura y experiencia de usuario."
            )

        return "\n".join(response_lines)

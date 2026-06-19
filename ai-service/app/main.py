from __future__ import annotations

import io
import re
from difflib import SequenceMatcher, unified_diff
from pathlib import Path
from typing import Dict, List

import cv2
import numpy as np
import pdfplumber
import pytesseract
from docx import Document as DocxDocument
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image
from PyPDF2 import PdfReader
from rapidfuzz import fuzz

app = FastAPI(title="Doc DNA AI Service", version="1.0.0")
SUPPORTED_SUFFIXES = {".pdf", ".docx", ".png", ".jpg", ".jpeg"}


def validate_file(file: UploadFile) -> str:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in SUPPORTED_SUFFIXES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")
    return suffix


def preprocess_image(content: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(content)).convert("L")
    array = np.array(image)
    blurred = cv2.GaussianBlur(array, (3, 3), 0)
    _, thresholded = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresholded


def extract_text_from_image(content: bytes) -> str:
    processed = preprocess_image(content)
    return pytesseract.image_to_string(processed)


def extract_text_from_pdf(content: bytes) -> str:
    texts: List[str] = []
    reader = PdfReader(io.BytesIO(content))
    for page in reader.pages:
        texts.append(page.extract_text() or "")
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                texts.append(page_text)
    return "\n".join(segment for segment in texts if segment.strip())


def extract_text_from_docx(content: bytes) -> str:
    document = DocxDocument(io.BytesIO(content))
    return "\n".join(paragraph.text for paragraph in document.paragraphs if paragraph.text.strip())


def extract_text(content: bytes, suffix: str) -> str:
    if suffix == ".pdf":
        return extract_text_from_pdf(content)
    if suffix == ".docx":
        return extract_text_from_docx(content)
    if suffix in {".png", ".jpg", ".jpeg"}:
        return extract_text_from_image(content)
    raise HTTPException(status_code=400, detail="Unsupported file type")


def parse_fields(text: str) -> Dict[str, str]:
    fields: Dict[str, str] = {}
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        match = re.match(r"([A-Za-z0-9 /()#.-]+?)\s*[:=-]\s*(.+)$", line)
        if match:
            fields[match.group(1).strip()] = match.group(2).strip()
    return fields


def compute_changes(original_text: str, candidate_text: str):
    original_fields = parse_fields(original_text)
    candidate_fields = parse_fields(candidate_text)
    changes = []
    for field, old_value in original_fields.items():
        new_value = candidate_fields.get(field)
        if new_value is not None and new_value != old_value:
            changes.append({"field": field, "oldValue": old_value, "newValue": new_value})
    if changes:
        return changes

    original_lines = [line.strip() for line in original_text.splitlines() if line.strip()]
    candidate_lines = [line.strip() for line in candidate_text.splitlines() if line.strip()]
    diff = list(unified_diff(original_lines, candidate_lines, lineterm=""))
    removed = [line[1:] for line in diff if line.startswith("-") and not line.startswith("---")]
    added = [line[1:] for line in diff if line.startswith("+") and not line.startswith("+++")]
    generic_changes = []
    for index, old_value in enumerate(removed[: min(len(removed), len(added), 10)]):
        generic_changes.append(
            {"field": f"Line {index + 1}", "oldValue": old_value, "newValue": added[index]}
        )
    return generic_changes


def compute_similarity(original_text: str, candidate_text: str) -> int:
    ratio = SequenceMatcher(None, original_text, candidate_text).ratio() * 100
    fuzzy = fuzz.token_sort_ratio(original_text, candidate_text)
    return round((ratio + fuzzy) / 2)


def compute_trust_score(similarity_score: int, change_count: int) -> int:
    return max(0, int(similarity_score - min(70, change_count * 12)))


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/extract")
async def extract(file: UploadFile = File(...)) -> dict:
    suffix = validate_file(file)
    content = await file.read()
    text = extract_text(content, suffix)
    return {"text": text, "fields": parse_fields(text)}


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)) -> dict:
    suffix = validate_file(file)
    if suffix not in {".png", ".jpg", ".jpeg"}:
        raise HTTPException(status_code=400, detail="OCR only supports image uploads")
    content = await file.read()
    return {"text": extract_text_from_image(content)}


@app.post("/compare")
async def compare(original: UploadFile = File(...), candidate: UploadFile = File(...)) -> dict:
    original_suffix = validate_file(original)
    candidate_suffix = validate_file(candidate)
    original_text = extract_text(await original.read(), original_suffix)
    candidate_text = extract_text(await candidate.read(), candidate_suffix)
    similarity_score = compute_similarity(original_text, candidate_text)
    changes = compute_changes(original_text, candidate_text)
    return {
        "trustScore": compute_trust_score(similarity_score, len(changes)),
        "similarityScore": similarity_score,
        "changes": changes,
    }

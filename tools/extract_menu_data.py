from __future__ import annotations

import json
import re
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PDF = Path.home() / "Downloads" / "Food and dessert Manual  edited 04 2024.pdf"
OUTPUT = ROOT / "data" / "menu-data.js"

ALLERGY_LINE = "GLUTEN MUSHROOM GARLIC DAIRY SHELFISH CHILI FISH NUTS SESAME SUGAR"
SECTION_BY_PAGE = {
    **{page: "Matsuhisa Bites" for page in range(12, 22)},
    **{page: "New Style Sashimi" for page in range(23, 28)},
    **{page: "Cold Dishes" for page in range(29, 38)},
    **{page: "Salads" for page in range(39, 46)},
    **{page: "Hot Dishes" for page in range(47, 55)},
    **{page: "Robata" for page in range(56, 63)},
    **{page: "Toban Yaki" for page in range(64, 68)},
    **{page: "Tempura" for page in range(69, 74)},
    **{page: "Soups and Rice" for page in range(75, 78)},
    **{page: "Sushi Rolls" for page in range(79, 85)},
    **{page: "Desserts" for page in range(86, 93)},
}

SKIP_PAGES = {
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    22,
    28,
    38,
    46,
    50,
    55,
    63,
    68,
    74,
    78,
    85,
    93,
}

GLOSSARY = [
    {"term": "Yamagobo", "definition": "Japanese pickled burdock root"},
    {"term": "Yuzu", "definition": "Japanese citrus"},
    {"term": "Momoko", "definition": "Baby peach"},
    {"term": "Ito togarashi", "definition": "Dried chili"},
    {"term": "Miso", "definition": "Soy bean paste; gluten free"},
    {"term": "La yu", "definition": "Sesame chili oil"},
    {"term": "Cochujang", "definition": "Korean miso"},
    {"term": "Rocoto", "definition": "Chili paste"},
    {"term": "Wasabi", "definition": "Japanese horseradish"},
    {"term": "Tataki", "definition": "A seared cooking method"},
    {"term": "Karachi", "definition": "Japanese mild mustard"},
    {"term": "Inaniwa", "definition": "A kind of noodles"},
    {"term": "Dashi", "definition": "Fish stock"},
    {"term": "Hajikami", "definition": "Ginger stem"},
    {"term": "Bonito", "definition": "Dried fish used for dashi and more"},
    {"term": "Hijiki", "definition": "Seaweed"},
    {"term": "Shiso", "definition": "Japanese mint"},
    {"term": "Soy sauce", "definition": "Soy bean product with wheat, so it contains gluten"},
    {"term": "Choclo", "definition": "Peruvian corn"},
    {"term": "Gombo", "definition": "Tropical plant also known as okra"},
    {"term": "Masago", "definition": "The edible eggs of the capelin fish"},
    {"term": "Yuba", "definition": "Dried tofu skin"},
    {"term": "Tofu", "definition": "Unfermented soya bean curd"},
]

FISH = [
    {"english": "Tuna", "french": "Thon", "japanese": "Maguro / Akami"},
    {"english": "Salmon", "french": "Saumon", "japanese": "Sake"},
    {"english": "Yellowtail", "french": "Seriole", "japanese": "Hamachi"},
    {"english": "Scallop", "french": "Saint-Jacques", "japanese": "Hotate"},
    {"english": "Seabass", "french": "Bar", "japanese": "Suzuki"},
    {"english": "Shrimp", "french": "Crevette", "japanese": "Ebi"},
    {"english": "Sea urchin", "french": "Oursin", "japanese": "Uni"},
    {"english": "Mackerel", "french": "Maquereau", "japanese": "Saba"},
    {"english": "Eel", "french": "Anguille", "japanese": "Unagi"},
    {"english": "Squid", "french": "Calamar", "japanese": "Ika"},
    {"english": "Salmon eggs", "french": "Oeufs de saumon", "japanese": "Ikura"},
    {"english": "Small sweet shrimp", "french": "Petite crevette douce", "japanese": "Ama ebi"},
    {"english": "Large shrimp", "french": "Gambas", "japanese": "Botan ebi"},
    {"english": "Crab", "french": "Crabe", "japanese": "Kani"},
    {"english": "Between belly and back tuna", "french": "Bonite", "japanese": "Chu toro"},
    {"english": "Bonito", "french": "Bonite", "japanese": "Katsuo"},
    {"english": "Tuna belly", "french": "Venteche de thon", "japanese": "O-toro"},
]

SAUCES = [
    {"name": "Amazu", "ingredients": "Rice vinegar, sugar and salt"},
    {"name": "Yuzu Soy", "ingredients": "Yuzu juice, soy sauce and rice vinegar"},
    {"name": "Ponzu Tosazu", "ingredients": "Lemon, soy, rice vinegar and bonito infusion"},
    {"name": "Spicy Ponzu", "ingredients": "Ponzu and la yu chili oil"},
    {"name": "Butter Ponzu", "ingredients": "Ponzu, clarified butter and shichimi"},
    {"name": "Wasabi Soy", "ingredients": "Soy, wasabi powder and dashi"},
    {"name": "Onion Ponzu", "ingredients": "Ponzu, white onions, garlic puree, sunflower oil and flamed sake"},
    {"name": "Sake Soy", "ingredients": "Soy sauce and wasabi root"},
    {"name": "Wasabi Salsa", "ingredients": "Onions, garlic, sunflower oil, rice vinegar, kombu, sugar, black pepper, dashi, soy and wasabi powder"},
    {"name": "Sushi Su", "ingredients": "Rice vinegar, mirin, kombu, sugar and salt"},
    {"name": "Tempura Sauce", "ingredients": "Dashi, mirin, soy, daikon and ginger"},
    {"name": "Spicy Edamame Sauce", "ingredients": "Chili garlic, sesame oil, soy and sugar"},
    {"name": "Unagi Sauce", "ingredients": "Grilled eel, soy, sake, mirin and sugar"},
    {"name": "Den Miso", "ingredients": "Flamed sake, mirin, sugar and white miso paste"},
    {"name": "Ceviche Dressing", "ingredients": "Yuzu, soy, garlic, aji amarillo, ginger puree, salt, lemon juice and black pepper"},
    {"name": "Jalapeno Dressing", "ingredients": "Jalapeno puree, garlic, rice vinegar, sunflower oil, salt and soy"},
    {"name": "Yuzu Dressing", "ingredients": "Garlic, yuzu, sunflower oil and black pepper"},
    {"name": "Yuzu Truffle Dressing", "ingredients": "Light soy, truffle oil, truffle peelings, rice vinegar and yuzu juice"},
    {"name": "Spicy Lemon Dressing", "ingredients": "Water, lemon juice, soya sauce, garlic, cayenne pepper and sunflower oil"},
    {"name": "Teriyaki", "ingredients": "Chicken stock, soya, sake, mirin and sugar"},
    {"name": "Wagyu Salsa", "ingredients": "Sake, soy, mirin, dashi and white onion"},
    {"name": "Jalapeno Salsa", "ingredients": "Red chili pepper, green tabasco, shiso, white onions, sunflower oil and lime"},
    {"name": "Chili Shiso Salsa", "ingredients": "Shiso vinegar, red onions, jalapeno peppers, jalapeno dressing and garlic"},
    {"name": "Anticucho Sauce", "ingredients": "Aji amarillo, rice vinegar, soy sauce, lemon, yuzu and sunflower oil"},
    {"name": "Red Anticucho", "ingredients": "Spicy red Peruvian pepper, rice vinegar, garlic puree, cumin, oregano, flamed sake, black pepper and sunflower oil"},
]


def clean_text(text: str) -> str:
    replacements = {
        "\ufb01": "fi",
        "\ufb02": "fl",
        "\u2022": "",
        "Y uzu": "Yuzu",
        "P ANDAN": "Pandan",
        "FLA VORS": "FLAVORS",
        "minth": "mint",
        "beab": "bean",
        "Yellotail": "Yellowtail",
        "pallet": "palate",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def is_allergy_checklist(line: str) -> bool:
    compact = re.sub(r"\s+", " ", line.upper()).strip()
    return compact == ALLERGY_LINE or compact == "ALLERGIES:"


def normalized_lines(text: str) -> list[str]:
    lines = [line.strip(" -") for line in clean_text(text).splitlines()]
    return [line for line in lines if line and not is_allergy_checklist(line)]


def title_from_lines(lines: list[str]) -> tuple[str, list[str]]:
    if "Description" in lines:
        idx = lines.index("Description")
        before = lines[:idx]
        after = lines[idx + 1 :]
    else:
        return lines[0].strip(), lines[1:]

    if before:
        variant_lines = before[1:]
        variants_only = variant_lines and all(
            len(line.split()) <= 3 and not re.search(r"[.:;]", line) for line in variant_lines
        )
        if variants_only:
            title = before[0] if len(before) == 1 else f"{before[0]} ({' / '.join(before[1:])})"
            body = after
        else:
            title = before[0]
            body = before[1:] + after
        return title.strip(), body

    if after:
        candidate = after[-1]
        word_count = len(candidate.split())
        if word_count <= 7 and ":" not in candidate and not candidate.endswith("."):
            return candidate.strip(), after[:-1]

    return "", after


def parse_item(page_number: int, text: str) -> dict | None:
    if page_number in SKIP_PAGES:
        return None

    lines = normalized_lines(text)
    if not lines:
        return None

    title, body_lines = title_from_lines(lines)
    if not title:
        title = lines[0]
        body_lines = lines[1:]

    description = " ".join(body_lines)
    description = re.sub(r"\s+", " ", description).strip()
    if not description and page_number not in SECTION_BY_PAGE:
        return None

    kind = "dish"
    section = SECTION_BY_PAGE.get(page_number, "Reference")
    if section == "Desserts":
        kind = "dessert"
    elif section in {"Sushi Rolls", "Tempura"} and page_number in {69, 79, 80, 81, 82, 83, 84}:
        kind = "reference"

    return {
        "page": page_number,
        "section": section,
        "kind": kind,
        "title": title,
        "description": description,
    }


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Extract quiz data from the restaurant manual PDF.")
    parser.add_argument("pdf", nargs="?", default=str(DEFAULT_PDF))
    args = parser.parse_args()

    reader = PdfReader(args.pdf)
    items = []
    for page_number, page in enumerate(reader.pages, start=1):
        item = parse_item(page_number, page.extract_text() or "")
        if item:
            items.append(item)

    payload = {
        "source": Path(args.pdf).name,
        "pageCount": len(reader.pages),
        "note": "Allergen checkmarks were not extracted reliably from the PDF, so allergen questions are intentionally disabled.",
        "items": items,
        "glossary": GLOSSARY,
        "fish": FISH,
        "sauces": SAUCES,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        "window.MENU_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT} with {len(items)} menu items.")


if __name__ == "__main__":
    main()

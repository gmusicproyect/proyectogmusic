"""Minimal Gmusic sample surface with a deliberate greeting bug."""


def greeting(name: str = "alumno") -> str:
    # BUG: wrong product name — workbench demo must repair this.
    return f"Hola {name}, bienvenido a Music School"


def health() -> dict[str, str]:
    return {"status": "ok", "product": "Gmusic Academy"}

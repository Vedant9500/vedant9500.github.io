#!/usr/bin/env python3
"""Render the social preview cards from template.html.

This is a manual tool, not part of the site build. Run it after changing the
wordmark, the palette, or any page's one-line description:

    python3 tools/og/generate.py

It writes eight 1200x630 PNGs into assets/og/.
"""

from __future__ import annotations

import html
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = Path(__file__).with_name("template.html")
OUT = ROOT / "assets" / "og"

CARDS = [
    {
        "file": "og-home.png",
        "eyebrow": "Computer engineering · India",
        "title": "Vedant Deshmukh",
        "desc": "Computer engineering student in India. I build numerical systems and developer tools.",
        "meta_left": "Glassbox · Hark · OpenLMlib · FMMS",
        "meta_right": "2026",
        "size": 84,
    },
    {
        "file": "og-work.png",
        "eyebrow": "Index",
        "title": "Work",
        "desc": "Eight public projects across numerical systems, developer tools, and benchmarks.",
        "meta_left": "598/615 · ~8 µs · 48×",
        "meta_right": "2026",
        "size": 100,
    },
    {
        "file": "og-about.png",
        "eyebrow": "Background",
        "title": "About",
        "desc": "I write Rust, C++, and Python, and rebuild systems to see how they work.",
        "meta_left": "Colossen · India · IST",
        "meta_right": "2026",
        "size": 100,
    },
    {
        "file": "og-contact.png",
        "eyebrow": "Email · Elsewhere",
        "title": "Contact",
        "desc": "Email is the fastest way to reach me. I read everything, and I reply when I can.",
        "meta_left": "hey@colossen.com",
        "meta_right": "2026",
        "size": 100,
    },
    {
        "file": "og-glassbox.png",
        "eyebrow": "Selected work · Discovery",
        "title": "Glassbox",
        "desc": "Symbolic regression that returns a readable equation, not a black box.",
        "meta_left": "598/615 on a 205-formula benchmark",
        "meta_right": "2026",
        "size": 100,
    },
    {
        "file": "og-hark.png",
        "eyebrow": "Selected work · Tooling",
        "title": "Hark",
        "desc": "A native Linux command palette in Rust, with a resident daemon and a GTK4 overlay.",
        "meta_left": "~8 µs median search · 9,100 items",
        "meta_right": "2026",
        "size": 100,
    },
    {
        "file": "og-openlmlib.png",
        "eyebrow": "Selected work · Memory",
        "title": "OpenLMlib",
        "desc": "Persistent, searchable memory for coding agents over SQLite.",
        "meta_left": "76 MCP tools",
        "meta_right": "2026",
        "size": 92,
    },
    {
        "file": "og-fmms.png",
        "eyebrow": "Selected work · Simulation",
        "title": "FMMS",
        "desc": "A fast-multipole N-body solver in Rust, with verified O(N) scaling.",
        "meta_left": "48× faster than direct at 1M bodies",
        "meta_right": "2026",
        "size": 100,
    },
    {
        "file": "og-freeze-bench.png",
        "eyebrow": "Selected work · Measurement",
        "title": "freeze-bench",
        "desc": "Execution-graded benchmark for coding models. No fix, rubric, or network.",
        "meta_left": "32 active tasks",
        "meta_right": "2026",
        "size": 86,
    },
]


def find_chrome() -> Path:
    env = os.environ.get("CHROME")
    if env and Path(env).is_file():
        return Path(env)

    for pattern in (
        ".cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell",
        ".cache/ms-playwright/chromium-*/chrome-linux/chrome",
    ):
        found = sorted(Path.home().glob(pattern))
        if found:
            return found[-1]

    for name in ("chromium", "chromium-browser", "google-chrome", "google-chrome-stable"):
        path = shutil.which(name)
        if path:
            return Path(path)

    raise SystemExit("Chrome not found. Set CHROME=/path/to/chrome.")


def render(card: dict[str, object], chrome: Path, work: Path) -> None:
    page = TEMPLATE.read_text(encoding="utf-8")
    for token, value in {
        "{{TITLE_SIZE}}": str(card["size"]),
        "{{EYEBROW}}": html.escape(str(card["eyebrow"])),
        "{{TITLE}}": html.escape(str(card["title"])),
        "{{DESC}}": html.escape(str(card["desc"])),
        "{{META_LEFT}}": html.escape(str(card["meta_left"])),
        "{{META_RIGHT}}": html.escape(str(card["meta_right"])),
    }.items():
        page = page.replace(token, value)

    page = page.replace("../../fonts/", (ROOT / "fonts").as_uri() + "/")
    source = work / f"{card['file']}.html"
    source.write_text(page, encoding="utf-8")

    subprocess.run(
        [
            str(chrome),
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--allow-file-access-from-files",
            "--hide-scrollbars",
            "--force-device-scale-factor=1",
            "--virtual-time-budget=2000",
            "--window-size=1200,630",
            f"--user-data-dir={work / 'profile'}",
            f"--screenshot={OUT / card['file']}",
            source.as_uri(),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def main() -> None:
    chrome = find_chrome()
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="og-cards-") as tmp:
        work = Path(tmp)
        for card in CARDS:
            render(card, chrome, work)
            print(f"wrote {OUT / card['file']}")


if __name__ == "__main__":
    main()

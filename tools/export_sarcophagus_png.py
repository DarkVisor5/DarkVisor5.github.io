"""Render the source SVG as a transparent pixel-art PNG for browser compatibility."""
from pathlib import Path
import cairosvg
src=Path("threshold-v18-preview/assets/sprites/sarcophagus_closed.svg")
dst=src.with_suffix(".png")
assert src.exists()
cairosvg.svg2png(url=str(src),write_to=str(dst),output_width=128,output_height=192)
with dst.open("rb") as f:
 assert f.read(8)==b"\x89PNG\r\n\x1a\n"
print("Sarcophagus PNG:",dst, dst.stat().st_size,"bytes")

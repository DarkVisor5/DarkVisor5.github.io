"""Temporary visual-only sarcophagus showroom overlay.
Visible in the game canvas without depending on the game's procedural renderer."""
from pathlib import Path
p=Path("threshold-v18-preview/index.html")
html=p.read_text(encoding="utf8")
target='<canvas id="map" width="510" height="510" aria-label="Mappa del dungeon"></canvas>'
assert target in html,"Map canvas not found"
overlay='<img id="v18-sarcophagus-showcase" src="./assets/sprites/sarcophagus_closed.png" alt="Sarcofago di pietra" draggable="false" decoding="sync" fetchpriority="high" />'
html=html.replace(target,target+overlay,1)
css="""<style>
/* v18.3 temporary art inspection: independent of map drawing, no collision */
#game .board-shell{position:relative}
#v18-sarcophagus-showcase{
 position:absolute;z-index:30;pointer-events:none;
 left:calc(50% + 48px);top:calc(50% - 77px);
 width:70px;height:105px;object-fit:contain;image-rendering:pixelated;
 filter:drop-shadow(0 3px 5px rgba(0,0,0,.85)) drop-shadow(0 0 7px rgba(220,185,114,.38));
 display:block;
}
#game.hidden #v18-sarcophagus-showcase{display:none}
@media(max-width:650px){#v18-sarcophagus-showcase{width:60px;height:90px;left:calc(50% + 38px);top:calc(50% - 70px)}}
</style>"""
assert "</head>" in html
html=html.replace("</head>",css+"</head>",1)
p.write_text(html,encoding="utf8")
print("Sarcophagus canvas-independent visual test installed")

import base64,hashlib,re,json
from pathlib import Path
source=Path("threshold/index.html").read_text(encoding="utf8")
dest=Path("threshold-v18-preview")
for sub in ("css","js","assets/images"):(dest/sub).mkdir(parents=True,exist_ok=True)
styles=iter(("base.css","ux.css","torches.css"))
def css(m):
 name=next(styles)
 (dest/"css"/name).write_text(m.group(2),encoding="utf8")
 return '<link rel="stylesheet" href="./css/'+name+'">'
source=re.sub(r"<style([^>]*)>(.*?)</style>",css,source,flags=re.S)
s=re.search(r"<script>(.*?)</script>",source,flags=re.S)
if s is None:raise ValueError("Game script not found")
js=s.group(1)
source=source.replace(s.group(0),'<script src="./js/game.js" defer></script>',1)
manifest={}
def externalize(m):
 mime,b64=m.groups()
 raw=base64.b64decode(b64,validate=True)
 ext={"jpeg":"jpg","svg+xml":"svg"}.get(mime,mime)
 name=hashlib.sha256(raw).hexdigest()[:16]+"."+ext
 (dest/"assets/images"/name).write_bytes(raw)
 manifest[name]=len(raw)
 return "./assets/images/"+name
pattern=r"data:image/(png|webp|jpeg|gif|svg\+xml);base64,([A-Za-z0-9+/=]+)"
js=re.sub(pattern,externalize,js)
source=re.sub(pattern,externalize,source)
(dest/"js/game.js").write_text(js,encoding="utf8")
(dest/"index.html").write_text(source,encoding="utf8")
(dest/"assets-manifest.json").write_text(json.dumps({"source":"v17.17.0","images":manifest},indent=2))
print("v18 preview:",len(manifest),"image assets")

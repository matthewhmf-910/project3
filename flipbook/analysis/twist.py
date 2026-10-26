import sys, json, numpy as np
from PIL import Image
d=sys.argv[1]; J=json.load(open(sys.argv[2]))
L=lambda i: np.asarray(Image.open(f"{d}/{i+1:03d}.png").convert('L'),dtype=np.int16)
H,LEN=299,188
ang=lambda y: round(float(np.degrees(np.arccos(max(-1,min(1,(y-H)/LEN))))),1)
res=[]
for k,f in enumerate(J['flips'][:9]):
    pre=L(f['start_frame']-1)
    rows=[]
    for i in range(f['start_frame'],f['end_frame']+1):
        m=np.abs(L(i)-pre)
        e={}
        for x in (40,180,320):
            c=np.where(m[105:492,x-6:x+6].mean(1)>10)[0]
            e[x]=int(c.min()+105) if len(c) else None
        rows.append((i,{x:(e[x],ang(e[x]) if e[x] else None) for x in e}))
    res.append(rows)
    print(f"F{k+1}")
    for i,e in rows: print("  ",i, round(i/30,3), e)

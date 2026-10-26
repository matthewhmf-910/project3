import re, itertools, numpy as np, json, sys
S=sys.argv[1]; H=188; HY=299
FL=[(25,32),(44,50),(60,66),(73,78),(84,89),(93,98),(101,105),(108,111)]
obs=[]
for line in open(S+'/edges.txt'):
    m=re.match(r'\s+(\d+) [\d.]+ (\{.*\})',line)
    if not m: continue
    i=int(m.group(1)); d=eval(m.group(2))
    for x,(y,a) in d.items():
        if y is None: continue
        for k,(s,e) in enumerate(FL):
            if s<=i<e: obs.append((i,k,x,y))
O=np.array(obs,float)
def pred(O,c,ca,lead,gm,ap,start,dur):
    xs=(O[:,2]-14)/332; u=(O[:,0]-start)/dur
    p=np.clip(u*(1+lead)-lead*(1-xs),0,1)
    curl=p<c; cc=np.clip(p/c,0,1)
    fold=np.where(curl,H*(1-cc**gm),0)
    ang=np.where(curl,ca*cc**ap,ca+(180-ca)*(p-c)/(1-c))
    return HY+np.minimum(fold,fold+(H-fold)*np.cos(np.radians(ang)))
# 1) shape from F2 with free timing
o2=O[O[:,1]==0]; best=None
for c,ca,lead,gm,ap,st,du in itertools.product(np.arange(.3,.9,.05),range(90,181,10),np.arange(0,.5,.05),[.7,1,1.4,2],[.25,.4,.6,.8,1],np.arange(23.5,26.6,.25),np.arange(6,11.1,.5)):
    e=np.abs(pred(o2,c,ca,lead,gm,ap,st,du)-o2[:,3]).mean()
    if best is None or e<best[0]: best=(e,c,ca,lead,gm,ap,st,du)
print('F2 shape fit', [round(float(v),3) for v in best])
_,c,ca,lead,gm,ap,st2,du2=best
# 2) per-flip timing with shared shape
timing=[]
for k,(s,e) in enumerate(FL):
    ok=O[O[:,1]==k]; bb=None
    for st,du in itertools.product(np.arange(s-2,s+2.01,.25),np.arange(2,12.01,.25)):
        er=np.abs(pred(ok,c,ca,lead,gm,ap,st,du)-ok[:,3]).mean()
        if bb is None or er<bb[0]: bb=(er,st,du)
    timing.append(dict(flip=f"F{k+2}",start=float(bb[1]),dur=float(bb[2]),land=float(bb[1]+bb[2]),mae_px=round(float(bb[0]),1)))
    print(timing[-1])
allerr=np.mean([t['mae_px'] for t in timing]); print('mean per-flip MAE px', round(allerr,1))
json.dump(dict(shape=dict(curl=float(c),curlAngle=float(ca),lead=float(lead),gamma=float(gm),angPow=float(ap)),timing=timing),open(S+'/fit2.json','w'),indent=1)

import sys, glob, json, numpy as np
from PIL import Image
d=sys.argv[1]; fs=sorted(glob.glob(d+'/*.png'))
F=[np.asarray(Image.open(f).convert('L'),dtype=np.int16) for f in fs]
H, LEN = 299, 188
act=[]
for i in range(1,len(F)):
    m=np.abs(F[i]-F[i-1]); act.append(m[112:490].mean()>0.6)
# group active frame runs (index i => file i+1, t=i/30)
runs=[];i=0
while i<len(act):
    if act[i]:
        j=i
        while j+1<len(act) and act[j+1]: j+=1
        runs.append((i+1,j+1)); i=j+1
    else: i+=1
out=[]
for (a,b) in runs:
    if b-a>15: continue  # skip hard cut region later
    traj=[]
    for i in range(a,b+1):
        m=np.abs(F[i]-F[i-1]); r=np.where(m[100:500].mean(1)>4)[0]
        if len(r)==0: continue
        ymin=int(r.min()+100)
        cos=max(-1,min(1,(ymin-H)/LEN)); ang=float(np.degrees(np.arccos(cos)))
        cols=np.where(m[ymin:ymin+12].mean(0)>6)[0]
        traj.append(dict(frame=i,t=round(i/30,3),edge_y=ymin,angle=round(ang,1),
                         x_range=[int(cols.min()),int(cols.max())] if len(cols) else None))
    out.append(dict(start_frame=a,end_frame=b,start_t=round((a-1)/30,3),end_t=round(b/30,3),
                    frames=b-a+1,traj=traj))
holds=[]
for k in range(len(out)-1):
    holds.append(out[k+1]['start_frame']-out[k]['end_frame']-1)
json.dump(dict(flips=out,holds_frames=holds),open(sys.argv[2],'w'),indent=1)
for k,f in enumerate(out):
    print(f"F{k+1}: frames {f['start_frame']}-{f['end_frame']} ({f['frames']}f) t {f['start_t']}-{f['end_t']}  angles {[p['angle'] for p in f['traj']]}  firstX {f['traj'][0]['x_range']}")
print("holds(frames):",holds)

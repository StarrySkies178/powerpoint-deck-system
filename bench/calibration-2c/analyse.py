import json, itertools
import os, sys
M=json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'measures.json')))
core=[m for m in M if m['set'] in ('s13','run2')]
ok=lambda m: m['label']=='ok'
meas=['layout_raw','layout','floor_layout','visual_raw','visual','floor_visual','colour','edges','iou16','iou8','hist','n_failed']
def auc(key, rows, higher=True):
    P=[m[key] for m in rows if ok(m)]; N=[m[key] for m in rows if not ok(m)]
    s=0
    for p in P:
        for n in N: s+= 1 if (p>n if higher else p<n) else (0.5 if p==n else 0)
    return s/(len(P)*len(N))
def best(key, rows, higher=True):
    vals=sorted(set(m[key] for m in rows)); out=None
    for t in vals:
        pred=[(m[key]>=t) if higher else (m[key]<=t) for m in rows]
        okfail=sum(1 for m,p in zip(rows,pred) if ok(m) and not p); nopass=sum(1 for m,p in zip(rows,pred) if not ok(m) and p)
        e=okfail+nopass
        if out is None or e<out[0]: out=(e,t,okfail,nopass)
    return out
print('n ok',sum(map(ok,core)),'n no',len(core)-sum(map(ok,core)))
for k in meas:
    hi = k!='n_failed' and not k.startswith('floor')
    a=auc(k,core,hi); b=best(k,core,hi)
    # paired within case: run2 vs s13
    pairs=[(next(m for m in core if m['set']=='run2' and m['case']==c), next(m for m in core if m['set']=='s13' and m['case']==c)) for c in sorted(set(m['case'] for m in core))]
    up=sum(1 for r,s in pairs if (r[k]>s[k] if hi else r[k]<s[k]))
    print(f"{k:12s} AUC {a:.2f}  best thr {'>=' if hi else '<='}{b[1]}: errors {b[0]} (ok->fail {b[2]}, no->pass {b[3]})  run2>s13 in {up}/10 cases")
# standards
stds=sorted(set(k for m in core for k in m['standards']))
for s in stds:
    okp=sum(1 for m in core if ok(m) and m['standards'].get(s,True)); nop=sum(1 for m in core if not ok(m) and m['standards'].get(s,True))
    print(f"std {s:16s} ok-builds passing {okp}/9, no-builds passing {nop}/11")
print()
for m in sorted(M,key=lambda m:(m['set'],m['case'])):
    print(m['set'],m['case'][:3],m['label'],m['layout_raw'],m['floor_layout'],m['layout'],m['visual_raw'],m['visual'],m['colour'],m['edges'],m['iou16'],m['iou8'],m['hist'],m['n_failed'],[k for k,v in m['standards'].items() if not v])
print("\nLOOCV (threshold chosen on 19, tested on the left-out one):")
for k in ['layout_raw','layout','visual_raw','visual','edges','iou16','n_failed']:
    hi = k!='n_failed'; err=0
    for i,m in enumerate(core):
        rest=core[:i]+core[i+1:]; _,t,_,_=best(k,rest,hi)
        p=(m[k]>=t) if hi else (m[k]<=t)
        err+= (p!=ok(m))
    print(f"{k:12s} LOOCV errors {err}/20")
cur=[ (all(m['standards'].values()) and m['layout']>=0.6 and m['visual']>=0.5) for m in core]
print('current bar: passes', sum(cur), 'agree', sum(c==ok(m) for c,m in zip(cur,core)),'/20')
diag=[m for m in M if m['set']=='diag14']
for k,t in [('layout_raw',0.7011),('layout',0.33),('visual',0.3243)]:
    print('diag14 ok builds passing',k,t, sum(m[k]>=t for m in diag),'/5')

import json,csv,sys
rnd=sys.argv[1]
m=json.load(open('pics/map.json')); lab={r['picture']:r['mike'] for r in csv.DictReader(open('writer/labels.csv'))}
a=0; rows=[]
for n in m:
    t=open(f'out/{rnd}-{n}.txt').read().strip().splitlines(); v='NOT OK' if t[0].strip().strip('*').upper().startswith('NOT') else 'OK'
    ok=v==lab[n]; a+=ok; rows.append((m[n],n,lab[n],v,ok,t[1] if len(t)>1 else ''))
for r in sorted(rows):
    print(('  ' if r[4] else 'XX'),r[1],r[0],'mike',r[2],'judge',r[3],'|',r[5][:120])
ok_ok=sum(1 for r in rows if r[2]=='OK' and r[3]=='OK'); nok=sum(1 for r in rows if r[2]=='NOT OK' and r[3]=='NOT OK')
print(f'{rnd}: agree {a}/20; his OK judged NOT OK {sum(1 for r in rows if r[2]=="OK" and r[3]!="OK")}; his NOT OK judged OK {sum(1 for r in rows if r[2]!="OK" and r[3]=="OK")}')

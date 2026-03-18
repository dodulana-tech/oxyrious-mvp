import { orders, transporters, gases } from '../data';
import { Card, MetricCard, StatusBadge, Badge, fmtFull, fmt } from '../components/ui';

export function Logistics() {
  const active = orders.filter(o=>o.status==='dispatched'||o.status==='in-transit');
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
        <MetricCard label="In transit" value={active.length} sub="Active deliveries" accent="#3b82f6"/>
        <MetricCard label="Transporters" value={transporters.length} sub={`${transporters.filter(t=>t.active>0).length} active today`} accent="#10b981"/>
        <MetricCard label="Avg on-time rate" value="91%" sub="↑ 2% this month" subColor="#10b981" accent="#f59e0b"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,marginBottom:12}}>Transporters</div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {transporters.map(t=>(
              <Card key={t.id} padding="14px 16px">
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:9}}>
                  <div>
                    <div style={{fontWeight:600,marginBottom:2}}>{t.name}</div>
                    <div style={{fontSize:11,color:'#64748b'}}>{t.driver} · {t.phone}</div>
                  </div>
                  <Badge variant={t.active>0?'green':'gray'}>
                    <span style={{width:5,height:5,borderRadius:'50%',background:'currentColor'}}/>
                    {t.active>0?`${t.active} active`:'Idle'}
                  </Badge>
                </div>
                <div style={{display:'flex',gap:20,marginBottom:9}}>
                  <div>
                    <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'.06em',color:'#64748b',marginBottom:2}}>Deliveries</div>
                    <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:18}}>{t.deliveries}</div>
                  </div>
                  <div>
                    <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'.06em',color:'#64748b',marginBottom:2}}>On-time</div>
                    <div style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:18,color:t.onTime>=90?'#10b981':'#f59e0b'}}>{t.onTime}%</div>
                  </div>
                </div>
                <div style={{background:'#0f172a',borderRadius:3,height:4,overflow:'hidden'}}>
                  <div style={{width:`${t.onTime}%`,height:'100%',background:t.onTime>=90?'#10b981':'#f59e0b',borderRadius:3}}/>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,marginBottom:12}}>Active deliveries</div>
          {active.length===0
            ? <Card><div style={{textAlign:'center',color:'#64748b',padding:'20px 0'}}>No active deliveries</div></Card>
            : <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {active.map(o=>(
                  <Card key={o.id} padding="14px 16px">
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                      <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:12,color:'#10b981'}}>{o.id}</span>
                      <StatusBadge status={o.status}/>
                    </div>
                    <div style={{fontWeight:500,marginBottom:3}}>{o.hospital}</div>
                    <div style={{fontSize:11.5,color:'#64748b',marginBottom:5}}>{o.transporter}</div>
                    <div style={{fontSize:12,color:'#64748b'}}>{o.items.map(i=>`${i.qty}× ${i.name.split('(')[0].trim()}`).join(', ')}</div>
                    <div style={{marginTop:8,fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700}}>{fmtFull(o.total)}</div>
                  </Card>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}

export function Inventory() {
  const low = gases.filter(g=>g.stock<=g.min*1.2);
  const catColor = {oxygen:'green',anaesthetic:'amber',specialty:'blue'};
  return (
    <div>
      {low.length>0&&(
        <div style={{padding:'9px 13px',borderRadius:8,fontSize:12,display:'flex',alignItems:'flex-start',gap:8,marginBottom:12,background:'rgba(245,158,11,.1)',color:'#f59e0b',border:'1px solid rgba(245,158,11,.2)'}}>
          ⚠ <span><strong>{low.length} product(s) low on stock.</strong> Review and reorder from your suppliers.</span>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
        <MetricCard label="Total SKUs" value={gases.length} sub="All gas products" accent="#10b981"/>
        <MetricCard label="Low stock" value={low.length} sub="Needs attention" subColor="#f59e0b" accent="#f59e0b"/>
        <MetricCard label="Island sourced" value={gases.filter(g=>g.src==='island').length} sub={`${gases.filter(g=>g.src==='mainland').length} from mainland`} accent="#3b82f6"/>
      </div>
      <Card padding={0}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>{['Product','Category','Unit price','Stock','Level','Source'].map((h,i)=>(
              <th key={i} style={{textAlign:'left',fontSize:10,textTransform:'uppercase',letterSpacing:'.06em',color:'#64748b',padding:'9px 13px',borderBottom:'1px solid #334155'}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {gases.map(g=>{
              const pct = Math.min(100,(g.stock/(g.min*3))*100);
              const isLow = g.stock<=g.min*1.2;
              return (
                <tr key={g.id}>
                  <td style={{padding:'10px 13px',borderBottom:'1px solid #334155',fontWeight:500,fontSize:12.5}}>{g.name}</td>
                  <td style={{padding:'10px 13px',borderBottom:'1px solid #334155'}}><Badge variant={catColor[g.cat]||'gray'}>{g.cat}</Badge></td>
                  <td style={{padding:'10px 13px',borderBottom:'1px solid #334155',fontWeight:500,fontSize:12.5}}>₦{g.price.toLocaleString()}</td>
                  <td style={{padding:'10px 13px',borderBottom:'1px solid #334155'}}>
                    <span style={{fontWeight:600,color:isLow?'#ef4444':'#f1f5f9',fontSize:12.5}}>{g.stock.toLocaleString()}</span>
                  </td>
                  <td style={{padding:'10px 13px',borderBottom:'1px solid #334155'}}>
                    <div style={{width:90,background:'#0f172a',borderRadius:3,height:5,overflow:'hidden'}}>
                      <div style={{width:`${pct}%`,height:'100%',background:isLow?'#ef4444':pct<50?'#f59e0b':'#10b981',borderRadius:3}}/>
                    </div>
                  </td>
                  <td style={{padding:'10px 13px',borderBottom:'1px solid #334155'}}>
                    <Badge variant={g.src==='island'?'green':'blue'}>{g.src==='island'?'Island partner':'Mainland'}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

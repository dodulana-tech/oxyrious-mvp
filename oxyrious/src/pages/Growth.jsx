import { hospitals, referrals, orders } from '../data';
import { Card, MetricCard, Btn, Alert, Table, Tr, Td, StatusBadge, Badge, RefCode, Modal, FormGroup, inputStyle, fmt, fmtFull } from '../components/ui';
import { useState } from 'react';

export function GrowthHub() {
  const nudges = hospitals.filter(h=>h.milestone);
  const totalRefs = referrals.length;
  const qualified = referrals.filter(r=>r.status==='qualified').length;
  const totalRewards = hospitals.reduce((s,h)=>s+h.refReward,0);
  const streakColor = d => d>=200?'#10b981':d>=100?'#f59e0b':'#94a3b8';
  const [dismissed, setDismissed] = useState([]);
  const [modal, setModal] = useState(null);
  const [nudgeTarget, setNudgeTarget] = useState(null);

  const activeNudges = nudges.filter(h=>!dismissed.includes(h.id));

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
        <MetricCard label="Referrals in pipeline" value={totalRefs} sub={`${qualified} qualified`} accent="#8b5cf6"/>
        <MetricCard label="Wallet rewards issued" value={fmt(totalRewards)} sub="Total earned by referrers" accent="#10b981"/>
        <MetricCard label="Wallet nudges ready" value={activeNudges.length} sub="3+ orders, not on wallet" subColor="#f59e0b" accent="#f59e0b"/>
        <MetricCard label="Avg supply streak" value="163d" sub="Across all hospitals" subColor="#10b981" accent="#10b981"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,marginBottom:12}}>Wallet conversion nudges</div>
          {activeNudges.length===0
            ? <Card><div style={{textAlign:'center',color:'#64748b',padding:'20px 0'}}>No nudges pending</div></Card>
            : activeNudges.map(h=>(
              <div key={h.id} style={{background:'rgba(139,92,246,.08)',border:'1px solid rgba(139,92,246,.2)',borderRadius:10,padding:'14px 16px',marginBottom:10}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{h.name}</div>
                    <div style={{fontSize:11.5,color:'#94a3b8'}}>{h.orders} orders · {h.area}</div>
                  </div>
                  <Badge variant="purple">Milestone</Badge>
                </div>
                <div style={{fontSize:12,color:'#c4b5fd',marginBottom:12,lineHeight:1.6,fontStyle:'italic'}}>
                  "{h.name} has placed {h.orders} orders. Wallet clients at this volume save an avg of 4% annually and get priority dispatch. Ready to activate?"
                </div>
                <div style={{display:'flex',gap:7}}>
                  <Btn variant="purple" size="sm" onClick={()=>{setNudgeTarget(h);setModal('nudge');}}>Send WhatsApp nudge</Btn>
                  <Btn size="sm" onClick={()=>{setNudgeTarget(h);setModal('nudge');}}>Send SMS</Btn>
                  <Btn size="sm" onClick={()=>setDismissed(p=>[...p,h.id])}>Dismiss</Btn>
                </div>
              </div>
            ))
          }

          <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,margin:'16px 0 12px'}}>Supply continuity scores</div>
          <Card>
            {hospitals.map((h,i)=>{
              const c = streakColor(h.streak);
              const bc = h.streak>=200?'#10b981':h.streak>=100?'#f59e0b':'#475569';
              return (
                <div key={h.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:i<hospitals.length-1?'1px solid #334155':'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:44,height:44,borderRadius:'50%',border:`2px solid ${bc}`,display:'flex',alignItems:'center',justifyContent:'center',color:c,fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:13,flexShrink:0}}>{h.streak}</div>
                    <div>
                      <div style={{fontSize:12.5,fontWeight:500}}>{h.name}</div>
                      <div style={{fontSize:10.5,color:'#64748b'}}>0 missed deliveries in {h.streak} days</div>
                    </div>
                  </div>
                  <Btn size="sm" onClick={()=>{setNudgeTarget(h);setModal('score');}}>Share score</Btn>
                </div>
              );
            })}
          </Card>
        </div>

        <div>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,marginBottom:12}}>Growth funnel</div>
          <Card style={{marginBottom:14}}>
            {[
              ['Total hospitals', hospitals.length, '#f1f5f9', 100],
              ['10+ orders (sticky)', hospitals.filter(h=>h.orders>=10).length, '#3b82f6', Math.round(hospitals.filter(h=>h.orders>=10).length/hospitals.length*100)],
              ['Wallet accounts', hospitals.filter(h=>h.pm==='wallet').length, '#10b981', Math.round(hospitals.filter(h=>h.pm==='wallet').length/hospitals.length*100)],
              ['Active referrers', hospitals.filter(h=>h.refs>0).length, '#8b5cf6', Math.round(hospitals.filter(h=>h.refs>0).length/hospitals.length*100)],
            ].map(([l,n,c,p])=>(
              <div key={l} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:12.5}}>{l}</span>
                  <span style={{fontSize:13,fontWeight:700,color:c}}>{n}</span>
                </div>
                <div style={{background:'#0f172a',borderRadius:3,height:6,overflow:'hidden'}}>
                  <div style={{width:`${p}%`,height:'100%',background:c,borderRadius:3}}/>
                </div>
              </div>
            ))}
          </Card>

          <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,marginBottom:12}}>PLG actions this week</div>
          <Card padding={0}>
            {[
              {a:'Send wallet nudge',t:'Premiere Specialist + ClearView',badge:'purple',label:'Today'},
              {a:'Monthly supply report',t:'All 6 hospitals — Apr 1',badge:'green',label:'Apr 1'},
              {a:'Follow up referral',t:'Unity Specialist (OXY-EKO2)',badge:'amber',label:'Pending'},
              {a:'Upgrade EKO to wallet pitch',t:'After INV-0084 is cleared',badge:'gray',label:'Blocked'},
            ].map((item,i)=>(
              <div key={i} style={{padding:'12px 14px',borderBottom:'1px solid #334155',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:12.5,fontWeight:500,marginBottom:2}}>{item.a}</div>
                  <div style={{fontSize:11,color:'#64748b'}}>{item.t}</div>
                </div>
                <Badge variant={item.badge}>{item.label}</Badge>
              </div>
            ))}
            <div style={{padding:'8px 14px'}}/>
          </Card>
        </div>
      </div>

      {modal==='nudge'&&nudgeTarget&&(
        <Modal title={`Send wallet nudge — ${nudgeTarget.name}`} onClose={()=>setModal(null)} width={420}>
          <Alert variant="purple">This sends a personalised wallet pitch to the hospital COO via WhatsApp or SMS.</Alert>
          <FormGroup label="Channel">
            <select style={inputStyle}><option>WhatsApp (Termii)</option><option>SMS (Termii)</option></select>
          </FormGroup>
          <FormGroup label="Message">
            <textarea rows={5} style={{...inputStyle,resize:'vertical'}}>{`Dear ${nudgeTarget.contact}, ${nudgeTarget.name} has placed ${nudgeTarget.orders} orders with Oxyrious. Wallet clients at your volume save an avg of 4% annually and get priority dispatch ahead of standard clients. Ready to activate your Supply Security Account? Reply YES and we'll set it up today. — Oxyrious team`}</textarea>
          </FormGroup>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={()=>{setDismissed(p=>[...p,nudgeTarget.id]);setModal(null);}}>Send nudge</Btn>
          </div>
        </Modal>
      )}

      {modal==='score'&&nudgeTarget&&(
        <Modal title="Share supply continuity score" onClose={()=>setModal(null)} width={420}>
          <Alert variant="green">Sends the hospital their streak as a branded message — great for the COO to forward internally.</Alert>
          <FormGroup label="Message preview">
            <textarea rows={4} style={{...inputStyle,resize:'vertical'}}>{`Dear ${nudgeTarget.contact}, great news! ${nudgeTarget.name} has achieved ${nudgeTarget.streak} consecutive days of zero missed oxygen deliveries with Oxyrious. You're in the top ${nudgeTarget.streak>=200?'10':'25'}% of all our clients. — Oxyrious team`}</textarea>
          </FormGroup>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={()=>setModal(null)}>Send via WhatsApp</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function Referrals() {
  const [tab, setTab] = useState('all');
  const filtered = tab==='all' ? referrals : referrals.filter(r=>r.status===tab);
  const totalRewards = hospitals.reduce((s,h)=>s+h.refReward,0);

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
        <MetricCard label="Total referrals" value={referrals.length} sub="Since launch" accent="#8b5cf6"/>
        <MetricCard label="Qualified" value={referrals.filter(r=>r.status==='qualified').length} sub="3+ orders placed" accent="#10b981"/>
        <MetricCard label="In progress" value={referrals.filter(r=>r.status==='active').length} sub="1–2 orders placed" accent="#f59e0b"/>
        <MetricCard label="Rewards issued" value={fmt(totalRewards)} sub="Wallet credits" accent="#10b981"/>
      </div>

      <Alert variant="purple">
        <span style={{fontSize:13}}>★</span>
        <span><strong>Mechanic:</strong> When a referred hospital places their 3rd order, the referrer receives a 2% wallet credit on their next top-up. Tracked automatically.</span>
      </Alert>

      <div style={{display:'flex',borderBottom:'1px solid #334155',marginBottom:14}}>
        {['all','qualified','active','pending'].map(t=>(
          <div key={t} onClick={()=>setTab(t)} style={{padding:'8px 16px',fontSize:12,fontWeight:500,cursor:'pointer',borderBottom:`2px solid ${tab===t?'#10b981':'transparent'}`,marginBottom:-1,color:tab===t?'#10b981':'#94a3b8'}}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </div>
        ))}
      </div>

      <Card padding={0} style={{marginBottom:16}}>
        <Table
          headers={['Referrer','Referred hospital','Code used','Status','Orders placed','Reward','Date']}
          rows={filtered.map(r=>(
            <Tr key={r.id}>
              <Td style={{fontWeight:500}}>{r.referrer}</Td>
              <Td style={{fontWeight:500}}>{r.referred}</Td>
              <Td><RefCode code={r.code}/></Td>
              <Td><StatusBadge status={r.status}/></Td>
              <Td><span style={{fontWeight:600}}>{r.orders}</span><span style={{color:'#64748b',fontSize:11}}> / 3 to qualify</span></Td>
              <Td><span style={{fontWeight:600,color:r.reward>0?'#10b981':'#64748b'}}>{r.reward>0?fmtFull(r.reward):'Pending'}</span></Td>
              <Td style={{color:'#64748b',fontSize:11.5}}>{r.date}</Td>
            </Tr>
          ))}
        />
      </Card>

      <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,marginBottom:12}}>Referral codes by hospital</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {hospitals.map(h=>(
          <Card key={h.id} padding="14px 16px" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:12.5,fontWeight:500,marginBottom:6}}>{h.name}</div>
              <RefCode code={h.refCode}/>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:'#8b5cf6'}}>{h.refs}</div>
              <div style={{fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'.05em'}}>referrals</div>
              {h.refReward>0&&<div style={{fontSize:12,color:'#10b981',fontWeight:600,marginTop:2}}>{fmt(h.refReward)} earned</div>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Reports() {
  const [selId, setSelId] = useState(1);
  const [modal, setModal] = useState(null);
  const h = hospitals.find(x=>x.id===selId)||hospitals[0];
  const hOrders = orders.filter(o=>o.hospitalId===h.id&&o.status==='delivered');
  const monthSpend = hOrders.reduce((s,o)=>s+o.total,0);

  return (
    <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700}}>Generate monthly supply report</div>
          <select style={{...inputStyle,width:220,fontSize:12}} value={selId} onChange={e=>setSelId(parseInt(e.target.value))}>
            {hospitals.map(h=><option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>

        <Card style={{fontFamily:'inherit',fontSize:12,lineHeight:1.7,background:'#0f172a',border:'1px solid #334155'}}>
          <div style={{textAlign:'center',marginBottom:16,paddingBottom:14,borderBottom:'1px solid #334155'}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:800,color:'#10b981',marginBottom:2}}>Oxy<span style={{color:'#f1f5f9'}}>rious</span></div>
            <div style={{fontSize:11,color:'#64748b'}}>Monthly Supply Report — March 2025</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,marginTop:10}}>{h.name}</div>
            <div style={{fontSize:11,color:'#64748b'}}>{h.area} · Prepared for: {h.contact}</div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
            {[
              [hOrders.length,'Deliveries','#10b981'],
              [`₦${(monthSpend/1000).toFixed(0)}K`,'Total spend','#f1f5f9'],
              ['0','Missed','#10b981'],
              [`${h.streak}d`,'Streak',h.streak>=200?'#10b981':h.streak>=100?'#f59e0b':'#94a3b8'],
            ].map(([v,l,c])=>(
              <div key={l} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,lineHeight:1,marginBottom:3,color:c}}>{v}</div>
                <div style={{fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'.05em'}}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{marginBottom:12,padding:'10px 12px',background:'#1e293b',borderRadius:7,borderLeft:'3px solid #10b981'}}>
            <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.06em',color:'#64748b',marginBottom:4}}>Supply continuity score</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:'#10b981'}}>{h.streak} consecutive days — 0 missed deliveries</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:2}}>Top {h.streak>=200?'10':'25'}% of all Oxyrious clients</div>
          </div>

          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11.5}}>
            <thead><tr>
              {['Order','Items','Amount','Status'].map(h=><th key={h} style={{textAlign:'left',fontSize:10,textTransform:'uppercase',letterSpacing:'.06em',color:'#64748b',padding:'8px 0',borderBottom:'1px solid #334155'}}>{h}</th>)}
            </tr></thead>
            <tbody>
              {orders.filter(o=>o.hospitalId===h.id).slice(0,3).map(o=>(
                <tr key={o.id}>
                  <td style={{padding:'8px 0',borderBottom:'1px solid #334155',color:'#10b981',fontWeight:600}}>{o.id}</td>
                  <td style={{padding:'8px 0',borderBottom:'1px solid #334155',color:'#64748b'}}>{o.items.map(i=>`${i.qty}× ${i.name.split('(')[0].trim()}`).join(', ')}</td>
                  <td style={{padding:'8px 0',borderBottom:'1px solid #334155',fontWeight:600}}>{fmtFull(o.total)}</td>
                  <td style={{padding:'8px 0',borderBottom:'1px solid #334155'}}><StatusBadge status={o.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>

          {h.pm==='wallet'&&(
            <div style={{marginTop:12,padding:'10px 12px',background:'#1e293b',borderRadius:7}}>
              <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.06em',color:'#64748b',marginBottom:6}}>Wallet account</div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span>Current balance</span><span style={{fontWeight:700,color:'#10b981'}}>{fmt(h.wb)}</span></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>Discount tier</span><span style={{fontWeight:700,color:'#10b981'}}>{h.disc}% active</span></div>
            </div>
          )}

          <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid #334155',fontSize:11,color:'#64748b',textAlign:'center'}}>
            Oxyrious · Medical Oxygen. Elevated. · Lagos, Nigeria · Report auto-generated March 1, 2025
          </div>
        </Card>

        <div style={{display:'flex',gap:10,marginTop:14}}>
          <Btn variant="primary" onClick={()=>setModal('send')}>Send via WhatsApp to {h.contact}</Btn>
          <Btn>Download PDF</Btn>
        </div>
      </div>

      <div style={{width:240,flexShrink:0}}>
        <Card style={{marginBottom:12}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700,marginBottom:10}}>Report schedule</div>
          <div style={{fontSize:12,color:'#64748b',marginBottom:12}}>Auto-send on 1st of each month</div>
          {hospitals.map(h=>(
            <div key={h.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #334155'}}>
              <span style={{fontSize:12}}>{h.name}</span>
              <Badge variant="green">Active</Badge>
            </div>
          ))}
          <div style={{marginTop:10,fontSize:11,color:'#64748b'}}>Next send: April 1, 2025</div>
        </Card>
        <Card>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700,marginBottom:8}}>Why this works</div>
          <div style={{fontSize:12,color:'#94a3b8',lineHeight:1.7}}>
            COOs share this report with their board and peers. It positions Oxyrious as a strategic supply partner — not just a vendor. The supply streak metric is the one number they'll screenshot.
          </div>
        </Card>
      </div>

      {modal==='send'&&(
        <Modal title="Send report" onClose={()=>setModal(null)} width={380}>
          <Alert variant="green">Report will be sent to {h.contact} at {h.name}.</Alert>
          <FormGroup label="Channel">
            <select style={inputStyle}><option>WhatsApp</option><option>Email</option></select>
          </FormGroup>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={()=>setModal(null)}>Send report</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

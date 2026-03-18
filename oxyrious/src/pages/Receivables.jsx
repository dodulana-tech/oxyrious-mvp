import { useState } from 'react';
import { Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { receivables as initialReceivables } from '../data';
import { Card, Btn, Tabs, Table, Tr, Td, StatusBadge, Alert, MetricCard, Modal, FormGroup, inputStyle, DetailPanel, fmtFull, fmt } from '../components/ui';

export function Receivables() {
  const [recs, setRecs] = useState(initialReceivables);
  const [tab, setTab] = useState('invoices');
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(null);
  const sc = sel ? recs.find(r=>r.id===sel) : null;

  const total = recs.filter(r=>r.status!=='paid').reduce((s,r)=>s+r.amount,0);
  const ov = recs.filter(r=>r.status==='overdue').reduce((s,r)=>s+r.amount,0);

  const steps = [
    {d:'On invoice',l:'Delivered via WhatsApp + email',done:true},
    {d:'Day 7',l:'Friendly reminder sent',done:true},
    {d:'Day 14',l:'Second reminder + link',done:true},
    {d:'Day 25',l:'Urgent alert',done:true},
    {d:'Day 30',l:'Due date — flag account',done:false,now:true},
    {d:'Day 35+',l:'Delivery hold on new orders',done:false},
  ];

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
        <MetricCard label="Outstanding" value={fmt(total)} sub={`${recs.filter(r=>r.status!=='paid').length} invoices`} accent="#f59e0b"/>
        <MetricCard label="Overdue" value={fmt(ov)} sub="Action required" subColor="#ef4444" accent="#ef4444"/>
        <MetricCard label="Avg days to pay" value="17d" sub="↓ 4 days vs last quarter" subColor="#10b981" accent="#10b981"/>
      </div>
      {ov>0&&<Alert variant="red"><AlertTriangle size={14} style={{flexShrink:0}}/><strong>Action required:</strong> {recs.filter(r=>r.status==='overdue').length} invoice(s) overdue. Automated reminders sent.</Alert>}
      <Tabs tabs={[{id:'invoices',label:'Outstanding invoices'},{id:'log',label:'Reminder log'}]} active={tab} onChange={setTab}/>

      {tab==='invoices'&&(
        <div style={{display:'flex',gap:14}}>
          <Card padding={0} style={{flex:1,minWidth:0}}>
            <Table
              headers={['Invoice','Hospital','Amount','Due date','Status','Reminders','']}
              rows={recs.map(r=>(
                <Tr key={r.id} onClick={()=>setSel(r.id)} highlighted={sc?.id===r.id}>
                  <Td><span style={{fontWeight:700,color:'#10b981',fontSize:11.5}}>{r.id}</span></Td>
                  <Td style={{fontWeight:500}}>{r.hospital}</Td>
                  <Td style={{fontWeight:600}}>{fmtFull(r.amount)}</Td>
                  <Td>
                    <div>{r.due}</div>
                    {r.daysOverdue>0&&<div style={{fontSize:10.5,color:'#ef4444'}}>{r.daysOverdue}d overdue</div>}
                  </Td>
                  <Td><StatusBadge status={r.status}/></Td>
                  <Td><span style={{background:'rgba(148,163,184,.1)',color:'#94a3b8',padding:'2px 8px',borderRadius:20,fontSize:10.5}}>{r.reminders} sent</span></Td>
                  <Td onClick={e=>e.stopPropagation()}>
                    <div style={{display:'flex',gap:5}}>
                      <Btn size="sm" onClick={()=>setModal('remind')}><Send size={11}/>Remind</Btn>
                      <Btn size="sm" onClick={()=>setRecs(p=>p.map(x=>x.id===r.id?{...x,status:'paid'}:x))} style={{color:'#10b981'}}><CheckCircle size={11}/>Paid</Btn>
                    </div>
                  </Td>
                </Tr>
              ))}
            />
          </Card>
          {sc&&(
            <DetailPanel width={220}>
              <Card>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700}}>{sc.id}</div>
                  <Btn size="sm" onClick={()=>setSel(null)}>✕</Btn>
                </div>
                <div style={{fontWeight:500,marginBottom:3}}>{sc.hospital}</div>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:sc.status==='overdue'?'#ef4444':'#f59e0b',marginBottom:12}}>{fmtFull(sc.amount)}</div>
                <div style={{borderTop:'1px solid #334155',paddingTop:11,marginBottom:9,fontSize:10,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'.06em'}}>Reminder timeline</div>
                <div style={{position:'relative',paddingLeft:18}}>
                  <div style={{position:'absolute',left:5,top:0,bottom:0,width:1,background:'#334155'}}/>
                  {steps.map((s,i)=>(
                    <div key={i} style={{position:'relative',paddingBottom:12}}>
                      <div style={{position:'absolute',left:-15,top:4,width:7,height:7,borderRadius:'50%',background:s.done?'#10b981':s.now?'#f59e0b':'#1e293b',border:`2px solid ${s.done?'#10b981':s.now?'#f59e0b':'#475569'}`}}/>
                      <div style={{fontSize:11.5,fontWeight:500}}>{s.d}</div>
                      <div style={{fontSize:10.5,color:'#64748b',marginTop:1}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </DetailPanel>
          )}
        </div>
      )}

      {tab==='log'&&(
        <Card padding={0}>
          <Table
            headers={['Hospital','Invoice','Channel','Message','Sent','Status']}
            rows={[
              <Tr key="1"><Td style={{fontWeight:500}}>EKO Hospital</Td><Td style={{color:'#94a3b8',fontSize:11}}>INV-0084</Td><Td><span style={{background:'rgba(59,130,246,.12)',color:'#3b82f6',padding:'2px 8px',borderRadius:20,fontSize:10.5}}>SMS</span></Td><Td style={{color:'#64748b',fontSize:11,maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Invoice ₦144,000 is 1 day overdue…</Td><Td style={{color:'#64748b',fontSize:11}}>Mar 14 09:00</Td><Td><StatusBadge status="current"/></Td></Tr>,
              <Tr key="2"><Td style={{fontWeight:500}}>EKO Hospital</Td><Td style={{color:'#94a3b8',fontSize:11}}>INV-0084</Td><Td><span style={{background:'rgba(16,185,129,.12)',color:'#10b981',padding:'2px 8px',borderRadius:20,fontSize:10.5}}>WhatsApp</span></Td><Td style={{color:'#64748b',fontSize:11,maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>Reminder: Invoice due March 13…</Td><Td style={{color:'#64748b',fontSize:11}}>Mar 10 10:30</Td><Td><StatusBadge status="delivered"/></Td></Tr>,
            ]}
          />
        </Card>
      )}

      {modal==='remind'&&(
        <Modal title="Send reminder" onClose={()=>setModal(null)} width={400}>
          <FormGroup label="Channel">
            <select style={inputStyle}><option>SMS (Termii)</option><option>WhatsApp (Termii)</option><option>Email</option></select>
          </FormGroup>
          <FormGroup label="Message">
            <textarea rows={4} style={{...inputStyle,resize:'vertical'}}>Dear EKO Hospital, invoice INV-0084 for ₦144,000 is 1 day overdue. Please settle urgently to avoid a delivery hold. Pay here: [payment link]</textarea>
          </FormGroup>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={()=>setModal(null)}><Send size={13}/>Send now</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

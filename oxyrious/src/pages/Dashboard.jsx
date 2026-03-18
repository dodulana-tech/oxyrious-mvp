import { TrendingUp, Clock, Package, Activity, AlertTriangle, Star } from 'lucide-react';
import { hospitals, orders, receivables } from '../data';
import { MetricCard, Card, Alert, Table, Tr, Td, StatusBadge, PayBadge, fmt, fmtFull, WalletBar, Btn } from '../components/ui';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  {m:'Oct',v:820000},{m:'Nov',v:1040000},{m:'Dec',v:950000},
  {m:'Jan',v:1280000},{m:'Feb',v:1150000},{m:'Mar',v:762000},
];

export default function Dashboard({ navigate }) {
  const overdueAmt = receivables.filter(r=>r.status==='overdue').reduce((s,r)=>s+r.amount,0);
  const walletLow = hospitals.filter(h=>h.pm==='wallet'&&h.wb<h.wmin);
  const nudges = hospitals.filter(h=>h.milestone);
  const totalFloat = hospitals.filter(h=>h.pm==='wallet').reduce((s,h)=>s+h.wb,0);
  const activeOrders = orders.filter(o=>o.status==='pending'||o.status==='in-transit'||o.status==='dispatched').length;

  return (
    <div>
      {nudges.length>0 && (
        <Alert variant="purple">
          <Star size={14} style={{flexShrink:0,marginTop:1}}/>
          <span><strong>{nudges.length} wallet milestone{nudges.length>1?'s':''} ready</strong> — {nudges.map(h=>h.name).join(', ')} have 3+ orders. Send wallet nudge now.</span>
          <Btn size="sm" variant="purple" onClick={()=>navigate('growth')} style={{marginLeft:'auto',flexShrink:0}}>View nudges</Btn>
        </Alert>
      )}
      {overdueAmt>0 && (
        <Alert variant="red">
          <AlertTriangle size={14} style={{flexShrink:0,marginTop:1}}/>
          <span><strong>₦{(overdueAmt/1000).toFixed(0)}K overdue</strong> — EKO Hospital is 1 day past due on INV-0084. Reminder sent.</span>
        </Alert>
      )}
      {walletLow.length>0 && (
        <Alert variant="amber">
          <AlertTriangle size={14} style={{flexShrink:0,marginTop:1}}/>
          <span><strong>{walletLow.length} wallet(s) below minimum</strong> — {walletLow.map(h=>h.name).join(', ')}</span>
        </Alert>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
        <MetricCard label="Mar Revenue MTD" value="₦762K" sub="↑ 6% vs Feb" subColor="#10b981" accent="#10b981"/>
        <MetricCard label="Outstanding" value="₦300K" sub="₦144K overdue" subColor="#ef4444" accent="#f59e0b"/>
        <MetricCard label="Active orders" value={activeOrders} sub="Pending + in transit" accent="#3b82f6"/>
        <MetricCard label="Avg supply streak" value="163d" sub="0 missed deliveries" subColor="#10b981" accent="#10b981"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.3fr 1fr',gap:14,marginBottom:14}}>
        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700}}>Revenue trend</div>
            <span style={{fontSize:10,color:'#64748b'}}>6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={revenueData} margin={{top:4,right:4,bottom:0,left:-20}}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="m" tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:'#64748b'}} axisLine={false} tickLine={false} tickFormatter={v=>`₦${(v/1000).toFixed(0)}K`}/>
              <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:7,fontSize:11}} formatter={v=>[`₦${(v/1000).toFixed(0)}K`,'Revenue']}/>
              <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#tg)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700}}>Wallet float</div>
            <span style={{fontSize:10,color:'#64748b'}}>Live balances</span>
          </div>
          {hospitals.filter(h=>h.pm==='wallet').map(h=>(
            <div key={h.id} style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                <span style={{fontSize:12,fontWeight:500}}>{h.name}</span>
              </div>
              <WalletBar value={h.wb} min={h.wmin} width="100%"/>
            </div>
          ))}
          <div style={{borderTop:'1px solid #334155',paddingTop:10,marginTop:4,display:'flex',justifyContent:'space-between',fontSize:12}}>
            <span style={{color:'#64748b'}}>Total float held</span>
            <span style={{fontWeight:700,color:'#10b981'}}>{fmt(totalFloat)}</span>
          </div>
        </Card>
      </div>

      <Card padding={0}>
        <div style={{padding:'13px 16px',borderBottom:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700}}>Recent orders</div>
          <Btn size="sm" onClick={()=>navigate('orders')}>View all</Btn>
        </div>
        <Table
          headers={['Order','Hospital','Amount','Status','Payment','Transporter']}
          rows={orders.slice(0,5).map(o=>(
            <Tr key={o.id}>
              <Td><span style={{fontWeight:700,color:'#10b981',fontSize:11.5}}>{o.id}</span></Td>
              <Td style={{fontWeight:500}}>{o.hospital}</Td>
              <Td style={{fontWeight:600}}>{fmtFull(o.total)}</Td>
              <Td><StatusBadge status={o.status}/></Td>
              <Td><PayBadge mode={o.pm}/></Td>
              <Td style={{color:'#94a3b8',fontSize:12}}>{o.transporter||'—'}</Td>
            </Tr>
          ))}
        />
      </Card>
    </div>
  );
}

import { useState } from 'react';
import './index.css';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Hospitals from './pages/Hospitals';
import { Receivables } from './pages/Receivables';
import { Logistics, Inventory } from './pages/LogisticsInventory';
import { GrowthHub, Referrals, Reports } from './pages/Growth';

const NAV = [
  { id:'dashboard', label:'Dashboard', section:'main' },
  { id:'orders', label:'Orders', section:'main', badge:2 },
  { id:'hospitals', label:'Hospitals', section:'main' },
  { id:'inventory', label:'Inventory', section:'main', badgeY:1 },
  { id:'logistics', label:'Logistics', section:'ops' },
  { id:'receivables', label:'Receivables', section:'ops', badge:1 },
  { id:'growth', label:'Growth Hub', section:'growth', badgeP:'NEW' },
  { id:'referrals', label:'Referrals', section:'growth' },
  { id:'reports', label:'Supply Reports', section:'growth' },
];

const TITLES = {
  dashboard: ['Dashboard', 'Welcome back, Admin'],
  orders: ['Orders', 'Create and manage gas deliveries'],
  hospitals: ['Hospitals', 'Client accounts & payment configuration'],
  inventory: ['Inventory', 'Stock levels & gas products'],
  logistics: ['Logistics', 'Transporters & active deliveries'],
  receivables: ['Receivables', 'Invoices, reminders & collections'],
  growth: ['Growth Hub', 'PLG engine — nudges, scores, actions'],
  referrals: ['Referral Programme', 'Track referrals, codes, and wallet rewards'],
  reports: ['Supply Reports', 'Monthly reports for hospital COOs'],
};

const PAGES = { Dashboard, Orders, Hospitals, Receivables, Logistics, Inventory, GrowthHub, Referrals, Reports };
const PAGE_MAP = {
  dashboard: Dashboard, orders: Orders, hospitals: Hospitals,
  inventory: Inventory, logistics: Logistics, receivables: Receivables,
  growth: GrowthHub, referrals: Referrals, reports: Reports,
};

const sideStyle = {
  width:215, minWidth:215, background:'#1e293b',
  borderRight:'1px solid #334155', display:'flex',
  flexDirection:'column', overflowY:'auto',
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [title, sub] = TITLES[page] || ['', ''];
  const PageComponent = PAGE_MAP[page];

  const sections = ['main', 'ops', 'growth'];
  const sectionLabels = { main:'Main', ops:'Operations', growth:'Growth' };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <aside style={sideStyle}>
        <div style={{padding:'16px 14px',borderBottom:'1px solid #334155',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,background:'#10b981',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:14,color:'#0f172a',flexShrink:0}}>O₂</div>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,lineHeight:1.3}}>Oxy<span style={{color:'#10b981'}}>rious</span></div>
            <div style={{fontSize:9,color:'#64748b',textTransform:'uppercase',letterSpacing:'.06em'}}>Medical Oxygen. Elevated.</div>
          </div>
        </div>

        <div style={{padding:'12px 8px',flex:1}}>
          {sections.map(sec=>(
            <div key={sec}>
              <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'.1em',color:'#64748b',padding:'0 8px',marginBottom:5,marginTop:10}}>{sectionLabels[sec]}</div>
              {NAV.filter(n=>n.section===sec).map(item=>(
                <div
                  key={item.id}
                  onClick={()=>setPage(item.id)}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'8px 10px', borderRadius:7, cursor:'pointer',
                    color:page===item.id?'#10b981':'#94a3b8',
                    background:page===item.id?'rgba(16,185,129,.12)':'transparent',
                    border:`1px solid ${page===item.id?'rgba(16,185,129,.15)':'transparent'}`,
                    marginBottom:2, fontSize:13, fontWeight:page===item.id?500:400,
                    transition:'all .15s',
                  }}
                >
                  {item.label}
                  {item.badge&&<span style={{background:'#ef4444',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:20}}>{item.badge}</span>}
                  {item.badgeY&&<span style={{background:'#f59e0b',color:'#0f172a',fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:20}}>{item.badgeY}</span>}
                  {item.badgeP&&<span style={{background:'#8b5cf6',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:20}}>{item.badgeP}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{padding:10,borderTop:'1px solid #334155'}}>
          <div style={{display:'flex',alignItems:'center',gap:9,padding:'7px 9px',borderRadius:7,cursor:'pointer'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(16,185,129,.15)',border:'1px solid rgba(16,185,129,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#10b981'}}>AD</div>
            <div>
              <div style={{fontSize:12,fontWeight:500}}>Admin</div>
              <div style={{fontSize:10,color:'#64748b'}}>Oxyrious</div>
            </div>
          </div>
        </div>
      </aside>

      <main style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',minWidth:0}}>
        <div style={{padding:'12px 20px',borderBottom:'1px solid #334155',display:'flex',alignItems:'center',background:'#0f172a',position:'sticky',top:0,zIndex:10,gap:10}}>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:700}}>{title}</div>
            <div style={{fontSize:11,color:'#64748b',marginTop:1}}>{sub}</div>
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:8}}>
            <button style={{background:'#1e293b',border:'1px solid #334155',borderRadius:7,color:'#94a3b8',cursor:'pointer',padding:'7px 10px'}}>🔔</button>
            <button style={{background:'#1e293b',border:'1px solid #334155',borderRadius:7,color:'#94a3b8',cursor:'pointer',padding:'7px 10px'}}>⚙</button>
          </div>
        </div>
        <div style={{padding:'18px 20px',flex:1}}>
          <PageComponent key={page} navigate={setPage}/>
        </div>
      </main>
    </div>
  );
}

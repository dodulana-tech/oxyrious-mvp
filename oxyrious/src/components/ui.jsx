import { X } from 'lucide-react';

const s = {
  btn: {display:'inline-flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,fontSize:12,fontWeight:500,cursor:'pointer',border:'none',fontFamily:'inherit',transition:'all .15s',whiteSpace:'nowrap'},
};

export const fmt = n => n >= 1e6 ? '₦'+(n/1e6).toFixed(1)+'M' : '₦'+(n/1000).toFixed(0)+'K';
export const fmtFull = n => '₦'+n.toLocaleString();

export function Btn({ children, variant='ghost', size='md', onClick, style={}, disabled }) {
  const variants = {
    primary: {background:'#10b981',color:'#0f172a'},
    ghost: {background:'#1e293b',color:'#f1f5f9',border:'1px solid #334155'},
    danger: {background:'rgba(239,68,68,.1)',color:'#ef4444',border:'1px solid rgba(239,68,68,.2)'},
    purple: {background:'rgba(139,92,246,.12)',color:'#8b5cf6',border:'1px solid rgba(139,92,246,.2)'},
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{...s.btn,...variants[variant],...(size==='sm'?{padding:'4px 10px',fontSize:11}:{}),...style,opacity:disabled?.5:1}}>
      {children}
    </button>
  );
}

export function Badge({ children, variant='gray' }) {
  const v = {
    green:{background:'rgba(16,185,129,.12)',color:'#10b981',border:'1px solid rgba(16,185,129,.2)'},
    amber:{background:'rgba(245,158,11,.12)',color:'#f59e0b',border:'1px solid rgba(245,158,11,.2)'},
    red:{background:'rgba(239,68,68,.12)',color:'#ef4444',border:'1px solid rgba(239,68,68,.2)'},
    blue:{background:'rgba(59,130,246,.12)',color:'#3b82f6',border:'1px solid rgba(59,130,246,.2)'},
    gray:{background:'rgba(148,163,184,.1)',color:'#94a3b8',border:'1px solid rgba(148,163,184,.15)'},
    purple:{background:'rgba(139,92,246,.12)',color:'#8b5cf6',border:'1px solid rgba(139,92,246,.2)'},
  };
  return <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:20,fontSize:10.5,fontWeight:500,whiteSpace:'nowrap',...v[variant]}}>{children}</span>;
}

export function StatusBadge({ status }) {
  const m = {
    delivered:['green','Delivered'],'in-transit':['blue','In Transit'],dispatched:['blue','Dispatched'],
    pending:['amber','Pending'],overdue:['red','Overdue'],current:['green','Current'],
    awaiting:['amber','Awaiting'],paid:['gray','Paid'],qualified:['green','Qualified'],
    active:['blue','Active'],
  };
  const [v,l] = m[status] || ['gray', status];
  return <Badge variant={v}><span style={{width:5,height:5,borderRadius:'50%',background:'currentColor',flexShrink:0}}/>{l}</Badge>;
}

export function PayBadge({ mode }) {
  const m = {wallet:['green','Wallet'],credit:['amber','NET 30'],cash:['gray','Cash'],transfer:['blue','Transfer']};
  const [v,l] = m[mode] || ['gray', mode];
  return <Badge variant={v}>{l}</Badge>;
}

export function TierBadge({ tier }) {
  const m = {1:['gray','Tier 1'],2:['amber','Tier 2'],3:['green','Tier 3']};
  const [v,l] = m[tier] || ['gray','—'];
  return <Badge variant={v}>{l}</Badge>;
}

export function Card({ children, style={}, padding=16 }) {
  return <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding,...style}}>{children}</div>;
}

export function MetricCard({ label, value, sub, subColor, accent='#10b981' }) {
  return (
    <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:'14px 16px',borderTop:`2px solid ${accent}`,position:'relative',overflow:'hidden'}}>
      <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:'.06em',color:'#64748b',marginBottom:6}}>{label}</div>
      <div style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:700,lineHeight:1,marginBottom:4}}>{value}</div>
      {sub && <div style={{fontSize:11,color:subColor||'#64748b'}}>{sub}</div>}
    </div>
  );
}

export function ScoreBar({ score }) {
  const c = score>=80?'#10b981':score>=60?'#f59e0b':'#ef4444';
  return (
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <span style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:c}}>{score}</span>
      <div style={{width:55,background:'#0f172a',borderRadius:3,height:4,overflow:'hidden'}}>
        <div style={{width:`${score}%`,height:'100%',background:c,borderRadius:3}}/>
      </div>
    </div>
  );
}

export function WalletBar({ value, min, width=90 }) {
  const pct = Math.min(100,(value/(min*2))*100);
  const c = pct<30?'#ef4444':pct<50?'#f59e0b':'#10b981';
  return (
    <div>
      <div style={{fontWeight:600,color:c,fontSize:12}}>{fmt(value)}</div>
      <div style={{background:'#0f172a',borderRadius:3,height:4,overflow:'hidden',width,marginTop:3}}>
        <div style={{width:`${pct}%`,height:'100%',background:c,borderRadius:3}}/>
      </div>
    </div>
  );
}

export function Alert({ children, variant='red' }) {
  const v = {
    red:{background:'rgba(239,68,68,.1)',color:'#ef4444',border:'1px solid rgba(239,68,68,.2)'},
    amber:{background:'rgba(245,158,11,.1)',color:'#f59e0b',border:'1px solid rgba(245,158,11,.2)'},
    green:{background:'rgba(16,185,129,.1)',color:'#10b981',border:'1px solid rgba(16,185,129,.2)'},
    purple:{background:'rgba(139,92,246,.1)',color:'#8b5cf6',border:'1px solid rgba(139,92,246,.2)'},
  };
  return <div style={{padding:'9px 13px',borderRadius:8,fontSize:12,display:'flex',alignItems:'flex-start',gap:8,marginBottom:12,...v[variant]}}>{children}</div>;
}

export function Table({ headers, rows }) {
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr>{headers.map((h,i)=><th key={i} style={{textAlign:'left',fontSize:10,textTransform:'uppercase',letterSpacing:'.06em',color:'#64748b',padding:'9px 13px',borderBottom:'1px solid #334155',whiteSpace:'nowrap'}}>{h}</th>)}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick, highlighted }) {
  return (
    <tr onClick={onClick} style={{background:highlighted?'rgba(16,185,129,.04)':'',cursor:onClick?'pointer':'default'}}>
      {children}
    </tr>
  );
}

export function Td({ children, style={} }) {
  return <td style={{padding:'10px 13px',borderBottom:'1px solid #334155',fontSize:12.5,verticalAlign:'middle',...style}}>{children}</td>;
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{display:'flex',borderBottom:'1px solid #334155',marginBottom:14}}>
      {tabs.map(t=>(
        <div key={t.id} onClick={()=>onChange(t.id)} style={{padding:'8px 16px',fontSize:12,fontWeight:500,cursor:'pointer',borderBottom:`2px solid ${active===t.id?'#10b981':'transparent'}`,marginBottom:-1,color:active===t.id?'#10b981':'#94a3b8',transition:'all .15s'}}>
          {t.label}
        </div>
      ))}
    </div>
  );
}

export function FilterBar({ options, active, onChange, children }) {
  return (
    <div style={{display:'flex',gap:7,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
      {options.map(o=>(
        <button key={o} onClick={()=>onChange(o)} style={{padding:'4px 12px',borderRadius:20,fontSize:11.5,fontWeight:500,cursor:'pointer',border:`1px solid ${active===o?'rgba(16,185,129,.3)':'#334155'}`,background:active===o?'rgba(16,185,129,.12)':'transparent',color:active===o?'#10b981':'#94a3b8',fontFamily:'inherit'}}>
          {o.charAt(0).toUpperCase()+o.slice(1)}
        </button>
      ))}
      {children}
    </div>
  );
}

export function Modal({ title, onClose, children, width=480 }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:20}} onClick={onClose}>
      <div style={{background:'#1e293b',border:'1px solid #475569',borderRadius:12,padding:20,width:'100%',maxWidth:width,maxHeight:'88vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,.5)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:15}}>
          <div style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700}}>{title}</div>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'#94a3b8',cursor:'pointer',padding:4}}><X size={16}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormGroup({ label, children }) {
  return (
    <div style={{marginBottom:12}}>
      <label style={{display:'block',fontSize:10.5,fontWeight:500,color:'#94a3b8',marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #475569',borderRadius:7,color:'#f1f5f9',fontFamily:'inherit',fontSize:13,padding:'8px 11px',outline:'none'};

export function DetailPanel({ children, onClose, width=240 }) {
  return (
    <div style={{width,flexShrink:0,display:'flex',flexDirection:'column',gap:10}}>
      {children}
    </div>
  );
}

export function RefCode({ code }) {
  return <span style={{fontFamily:'monospace',background:'#0f172a',border:'1px solid #334155',borderRadius:6,padding:'4px 10px',fontSize:13,fontWeight:700,letterSpacing:'.1em',color:'#10b981'}}>{code}</span>;
}

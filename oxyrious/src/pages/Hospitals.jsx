import { useState } from 'react';
import { Plus, Settings } from 'lucide-react';
import { hospitals as initialHospitals } from '../data';
import { Card, Btn, FilterBar, Table, Tr, Td, PayBadge, TierBadge, ScoreBar, WalletBar, Modal, FormGroup, inputStyle, Alert, DetailPanel, RefCode, fmt, Badge } from '../components/ui';

export default function Hospitals() {
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [walletEdit, setWalletEdit] = useState({});
  const [newClient, setNewClient] = useState({name:'',contact:'',phone:'',area:'',pm:'cash',wmin:200000,disc:0});

  const filtered = hospitals.filter(h=>filter==='all'||h.pm===filter);
  const sc = selected ? hospitals.find(h=>h.id===selected) : null;

  const changeMode = (id, pm) => {
    setHospitals(p=>p.map(h=>h.id===id?{...h,pm}:h));
    setSelected(id);
  };

  const saveWallet = () => {
    setHospitals(p=>p.map(h=>h.id===sc.id?{...h,...walletEdit}:h));
    setModal(null);
  };

  const addHospital = () => {
    const h = {
      id:hospitals.length+1, ...newClient,
      wb:0, score:45, tier:1, dso:0, orders:0,
      streak:0, refs:0, refReward:0, milestone:false,
      refCode:`OXY-NEW${hospitals.length+1}`,
      wmin:parseInt(newClient.wmin)||0,
      disc:parseInt(newClient.disc)||0
    };
    setHospitals(p=>[...p,h]);
    setModal(null);
    setNewClient({name:'',contact:'',phone:'',area:'',pm:'cash',wmin:200000,disc:0});
  };

  const streakColor = d => d>=200?'#10b981':d>=100?'#f59e0b':'#94a3b8';

  return (
    <div style={{display:'flex',gap:14}}>
      <div style={{flex:1,minWidth:0}}>
        <FilterBar options={['all','wallet','credit','transfer','cash']} active={filter} onChange={setFilter}>
          <Btn variant="primary" size="sm" onClick={()=>setModal('new')} style={{marginLeft:'auto'}}>
            <Plus size={13}/>Add hospital
          </Btn>
        </FilterBar>
        <Card padding={0}>
          <Table
            headers={['Hospital','Area','Payment','Wallet','Score','Tier','Streak']}
            rows={filtered.map(h=>(
              <Tr key={h.id} onClick={()=>setSelected(h.id)} highlighted={sc?.id===h.id}>
                <Td>
                  <div style={{fontWeight:500}}>{h.name}</div>
                  <div style={{fontSize:10.5,color:'#64748b'}}>{h.contact}</div>
                </Td>
                <Td style={{color:'#64748b',fontSize:12}}>{h.area}</Td>
                <Td><PayBadge mode={h.pm}/></Td>
                <Td>
                  {h.pm==='wallet'
                    ? <WalletBar value={h.wb} min={h.wmin} width={90}/>
                    : <span style={{color:'#64748b'}}>—</span>}
                </Td>
                <Td><ScoreBar score={h.score}/></Td>
                <Td><TierBadge tier={h.tier}/></Td>
                <Td><span style={{fontWeight:700,fontSize:12,color:streakColor(h.streak)}}>{h.streak}d</span></Td>
              </Tr>
            ))}
          />
        </Card>
      </div>

      {sc&&(
        <DetailPanel width={240}>
          <Card>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:9}}>
              <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:13}}>{sc.name}</span>
              <Btn size="sm" onClick={()=>setSelected(null)}>✕</Btn>
            </div>
            <div style={{fontSize:11.5,color:'#64748b',marginBottom:2}}>{sc.contact} · {sc.phone}</div>
            <div style={{fontSize:11.5,color:'#64748b',marginBottom:10}}>{sc.area}</div>
            <div style={{fontSize:12,marginBottom:3}}><span style={{color:'#64748b'}}>Orders: </span>{sc.orders}</div>
            <div style={{fontSize:12,marginBottom:3}}><span style={{color:'#64748b'}}>Supply streak: </span><span style={{fontWeight:700,color:streakColor(sc.streak)}}>{sc.streak}d</span></div>
            {sc.disc>0&&<div style={{fontSize:12}}><span style={{color:'#64748b'}}>Discount: </span><span style={{color:'#10b981'}}>{sc.disc}%</span></div>}
          </Card>

          <Card>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700,marginBottom:10}}>Credit profile</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <ScoreBar score={sc.score}/><TierBadge tier={sc.tier}/>
            </div>
            <div style={{fontSize:11,color:'#64748b'}}>
              {sc.score>=80?'Excellent — eligible for NET 30.':sc.score>=60?'Good history. Consider NET 15.':'New payer. Cash recommended.'}
            </div>
          </Card>

          <Card>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700,marginBottom:8}}>Referral code</div>
            <RefCode code={sc.refCode}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginTop:10}}>
              <span style={{color:'#64748b'}}>Referrals</span><span style={{fontWeight:600}}>{sc.refs}</span>
            </div>
            {sc.refReward>0&&(
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginTop:4}}>
                <span style={{color:'#64748b'}}>Credits earned</span><span style={{fontWeight:600,color:'#10b981'}}>{fmt(sc.refReward)}</span>
              </div>
            )}
          </Card>

          {sc.pm==='wallet'&&(
            <Card>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700}}>Wallet</div>
                <Btn size="sm" onClick={()=>{setWalletEdit({wmin:sc.wmin,disc:sc.disc});setModal('wallet');}}>
                  <Settings size={11}/>Config
                </Btn>
              </div>
              <div style={{fontSize:22,fontWeight:700,color:sc.wb<sc.wmin?'#ef4444':'#10b981',marginBottom:5}}>{fmt(sc.wb)}</div>
              <div style={{fontSize:11,color:'#64748b',marginBottom:8}}>Min: {fmt(sc.wmin)}</div>
              {sc.wb<sc.wmin&&<Alert variant="red" style={{fontSize:11,padding:'6px 9px',marginBottom:8}}>Below minimum — send top-up alert</Alert>}
              <div style={{display:'flex',gap:5}}>
                {[100000,500000,1000000].map(a=>(
                  <Btn key={a} size="sm" onClick={()=>setHospitals(p=>p.map(h=>h.id===sc.id?{...h,wb:h.wb+a}:h))}>+{fmt(a)}</Btn>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:12,fontWeight:700,marginBottom:8}}>Payment mode</div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {[
                ['wallet','Wallet (pre-funded)'],
                ['credit','Credit NET 30'],
                ['transfer','Bank transfer'],
                ['cash','Cash on order'],
              ].map(([m,l])=>(
                <Btn key={m} variant={sc.pm===m?'primary':'ghost'} size="sm" onClick={()=>changeMode(sc.id,m)} style={{justifyContent:'flex-start'}}>{l}</Btn>
              ))}
            </div>
          </Card>
        </DetailPanel>
      )}

      {modal==='wallet'&&sc&&(
        <Modal title={`Configure wallet — ${sc.name}`} onClose={()=>setModal(null)} width={380}>
          <FormGroup label="Minimum balance (₦)">
            <input type="number" style={inputStyle} value={walletEdit.wmin} onChange={e=>setWalletEdit(p=>({...p,wmin:parseInt(e.target.value)||0}))}/>
          </FormGroup>
          <FormGroup label="Discount rate (%)">
            <input type="number" min="0" max="10" style={inputStyle} value={walletEdit.disc} onChange={e=>setWalletEdit(p=>({...p,disc:parseInt(e.target.value)||0}))}/>
          </FormGroup>
          <FormGroup label="Grace period after zero">
            <select style={inputStyle}><option>0 — strict hold</option><option>3 days grace</option><option>5 days grace</option></select>
          </FormGroup>
          <FormGroup label="Low-balance alert at">
            <select style={inputStyle}><option>30% remaining</option><option>50% remaining</option></select>
          </FormGroup>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={saveWallet}>Save config</Btn>
          </div>
        </Modal>
      )}

      {modal==='new'&&(
        <Modal title="Add new hospital" onClose={()=>setModal(null)}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <FormGroup label="Hospital name"><input style={inputStyle} value={newClient.name} onChange={e=>setNewClient(p=>({...p,name:e.target.value}))} placeholder="e.g. Lekki Health Centre"/></FormGroup>
            <FormGroup label="Area"><input style={inputStyle} value={newClient.area} onChange={e=>setNewClient(p=>({...p,area:e.target.value}))} placeholder="Lekki Phase 1"/></FormGroup>
            <FormGroup label="Contact person"><input style={inputStyle} value={newClient.contact} onChange={e=>setNewClient(p=>({...p,contact:e.target.value}))} placeholder="Full name"/></FormGroup>
            <FormGroup label="Phone"><input style={inputStyle} value={newClient.phone} onChange={e=>setNewClient(p=>({...p,phone:e.target.value}))} placeholder="0801 234 5678"/></FormGroup>
          </div>
          <FormGroup label="Default payment mode">
            <select style={inputStyle} value={newClient.pm} onChange={e=>setNewClient(p=>({...p,pm:e.target.value}))}>
              <option value="cash">Cash on order (default for new clients)</option>
              <option value="wallet">Wallet (pre-funded)</option>
              <option value="transfer">Bank transfer</option>
              <option value="credit">Credit NET 30 (requires approval)</option>
            </select>
          </FormGroup>
          {newClient.pm==='wallet'&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <FormGroup label="Min balance (₦)"><input type="number" style={inputStyle} value={newClient.wmin} onChange={e=>setNewClient(p=>({...p,wmin:e.target.value}))}/></FormGroup>
              <FormGroup label="Discount (%)"><input type="number" min="0" max="10" style={inputStyle} value={newClient.disc} onChange={e=>setNewClient(p=>({...p,disc:e.target.value}))}/></FormGroup>
            </div>
          )}
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={addHospital} disabled={!newClient.name}>Add hospital</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

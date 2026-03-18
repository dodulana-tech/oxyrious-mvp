import { useState } from 'react';
import { Plus, Truck, CheckCircle } from 'lucide-react';
import { orders as initialOrders, hospitals, gases, transporters } from '../data';
import { Card, Btn, FilterBar, Table, Tr, Td, StatusBadge, PayBadge, Modal, FormGroup, inputStyle, Alert, fmtFull, fmt } from '../components/ui';

export default function Orders() {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({ hospitalId:'', gasId:'', qty:1, pmOverride:'' });
  const [dispatchTransporter, setDispatchTransporter] = useState('');

  const filters = ['all','pending','dispatched','in-transit','delivered','overdue'];
  const filtered = orders.filter(o => filter==='all'||o.status===filter||(filter==='overdue'&&o.payStatus==='overdue'));

  const selHosp = hospitals.find(h=>h.id===parseInt(newOrder.hospitalId));
  const selGas = gases.find(g=>g.id===parseInt(newOrder.gasId));
  const orderTotal = selGas ? selGas.price * parseInt(newOrder.qty||0) : 0;
  const effectivePm = newOrder.pmOverride || (selHosp?.pm||'cash');

  const createOrder = () => {
    if (!selHosp || !selGas) return;
    const o = {
      id:`ORD-00${50+orders.length}`,
      hospitalId:selHosp.id, hospital:selHosp.name,
      items:[{name:selGas.name,qty:parseInt(newOrder.qty),price:selGas.price}],
      total:orderTotal, status:'pending', pm:effectivePm,
      payStatus:effectivePm==='wallet'?'paid':'awaiting',
      transporter:null, date:new Date().toISOString().slice(0,10), source:'island'
    };
    setOrders(p=>[o,...p]);
    setModal(null);
    setNewOrder({hospitalId:'',gasId:'',qty:1,pmOverride:''});
  };

  const doDispatch = () => {
    setOrders(p=>p.map(o=>o.id===dispatchOrder.id?{...o,status:'dispatched',transporter:dispatchTransporter}:o));
    setDispatchOrder(null); setDispatchTransporter('');
  };

  const confirmPOD = (id) => {
    setOrders(p=>p.map(o=>o.id===id?{...o,status:'delivered',payStatus:o.pm==='wallet'?'paid':o.pm==='credit'?'pending':o.payStatus}:o));
  };

  return (
    <div>
      <FilterBar options={filters} active={filter} onChange={setFilter}>
        <Btn variant="primary" size="sm" onClick={()=>setModal('new')} style={{marginLeft:'auto'}}>
          <Plus size={13}/>New order
        </Btn>
      </FilterBar>

      <Card padding={0}>
        <Table
          headers={['Order ID','Hospital','Items','Total','Status','Payment','Transporter','']}
          rows={filtered.map(o=>(
            <Tr key={o.id}>
              <Td><span style={{fontWeight:700,color:'#10b981',fontSize:11.5}}>{o.id}</span></Td>
              <Td style={{fontWeight:500}}>{o.hospital}</Td>
              <Td style={{color:'#64748b',fontSize:11.5,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {o.items.map(i=>`${i.qty}× ${i.name.split('(')[0].trim()}`).join(', ')}
              </Td>
              <Td style={{fontWeight:600}}>{fmtFull(o.total)}</Td>
              <Td>
                <StatusBadge status={o.status}/>
                {o.payStatus==='overdue'&&<span style={{marginLeft:4}}><StatusBadge status="overdue"/></span>}
              </Td>
              <Td><PayBadge mode={o.pm}/></Td>
              <Td style={{fontSize:12,color:'#94a3b8'}}>{o.transporter||'—'}</Td>
              <Td>
                {o.status==='pending'&&(o.payStatus==='paid'||o.pm==='credit')&&(
                  <Btn size="sm" onClick={()=>{setDispatchOrder(o);setModal('dispatch')}}>
                    <Truck size={11}/>Dispatch
                  </Btn>
                )}
                {o.status==='dispatched'&&(
                  <Btn size="sm" onClick={()=>confirmPOD(o.id)} style={{color:'#10b981'}}>
                    <CheckCircle size={11}/>POD
                  </Btn>
                )}
              </Td>
            </Tr>
          ))}
        />
      </Card>

      {modal==='new'&&(
        <Modal title="Create new order" onClose={()=>setModal(null)}>
          <FormGroup label="Hospital">
            <select style={inputStyle} value={newOrder.hospitalId} onChange={e=>setNewOrder(p=>({...p,hospitalId:e.target.value}))}>
              <option value="">Select hospital…</option>
              {hospitals.map(h=><option key={h.id} value={h.id}>{h.name} ({h.pm})</option>)}
            </select>
          </FormGroup>
          {selHosp&&(
            <Alert variant={effectivePm==='wallet'&&selHosp.wb<orderTotal?'amber':'green'}>
              Default payment: <strong>{effectivePm==='wallet'?`Wallet (Balance: ${fmt(selHosp.wb)})`:effectivePm}</strong>
              {effectivePm==='wallet'&&selHosp.wb<orderTotal&&<span style={{marginLeft:6}}>⚠ Insufficient balance</span>}
            </Alert>
          )}
          <FormGroup label="Override payment (optional)">
            <select style={inputStyle} value={newOrder.pmOverride} onChange={e=>setNewOrder(p=>({...p,pmOverride:e.target.value}))}>
              <option value="">Use hospital default</option>
              <option value="wallet">Wallet</option>
              <option value="cash">Cash on delivery</option>
              <option value="transfer">Bank transfer</option>
              <option value="credit">Credit NET 30</option>
            </select>
          </FormGroup>
          <FormGroup label="Gas product">
            <select style={inputStyle} value={newOrder.gasId} onChange={e=>setNewOrder(p=>({...p,gasId:e.target.value}))}>
              <option value="">Select gas…</option>
              {gases.map(g=><option key={g.id} value={g.id}>{g.name} — ₦{g.price.toLocaleString()}/{g.name.includes('Bulk')?'L':'cylinder'}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Quantity">
            <input type="number" min="1" style={inputStyle} value={newOrder.qty} onChange={e=>setNewOrder(p=>({...p,qty:e.target.value}))}/>
          </FormGroup>
          {orderTotal>0&&(
            <div style={{background:'#0f172a',borderRadius:8,padding:'11px 14px',marginBottom:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{color:'#64748b',fontSize:13}}>Order total</span>
              <span style={{fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:20,color:'#10b981'}}>{fmtFull(orderTotal)}</span>
            </div>
          )}
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={createOrder} disabled={!newOrder.hospitalId||!newOrder.gasId||orderTotal===0}>Create order</Btn>
          </div>
        </Modal>
      )}

      {modal==='dispatch'&&dispatchOrder&&(
        <Modal title={`Dispatch ${dispatchOrder.id}`} onClose={()=>setModal(null)} width={380}>
          <div style={{marginBottom:12,color:'#94a3b8',fontSize:12.5}}>{dispatchOrder.hospital} · {fmtFull(dispatchOrder.total)}</div>
          <FormGroup label="Assign transporter">
            <select style={inputStyle} value={dispatchTransporter} onChange={e=>setDispatchTransporter(e.target.value)}>
              <option value="">Select…</option>
              {transporters.map(t=><option key={t.id} value={t.name}>{t.name} ({t.onTime}% on-time · {t.active} active)</option>)}
            </select>
          </FormGroup>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <Btn onClick={()=>setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={doDispatch} disabled={!dispatchTransporter}><Truck size={13}/>Dispatch now</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

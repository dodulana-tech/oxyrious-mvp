export const hospitals = [
  {id:1,name:'Reddington Hospital',contact:'Chioma Eze',phone:'0803 456 7890',area:'Victoria Island',pm:'wallet',wb:820000,wmin:300000,score:94,tier:3,dso:0,orders:48,disc:5,streak:247,refCode:'OXY-RED1',refs:2,refReward:24000,milestone:false},
  {id:2,name:'EKO Hospital',contact:'Bola Adeyemi',phone:'0806 123 4567',area:'Surulere',pm:'credit',wb:0,wmin:0,score:81,tier:3,dso:24,orders:36,disc:0,streak:183,refCode:'OXY-EKO2',refs:1,refReward:9600,milestone:false},
  {id:3,name:'Lagoon Hospital',contact:'Emeka Obi',phone:'0701 987 6543',area:'Ikoyi',pm:'wallet',wb:95000,wmin:200000,score:88,tier:3,dso:0,orders:29,disc:3,streak:201,refCode:'OXY-LAG3',refs:0,refReward:0,milestone:false},
  {id:4,name:'St. Nicholas Hospital',contact:'Funke Adeoye',phone:'0812 345 6789',area:'Lagos Island',pm:'transfer',wb:0,wmin:0,score:67,tier:2,dso:18,orders:14,disc:0,streak:94,refCode:'OXY-STN4',refs:0,refReward:0,milestone:false},
  {id:5,name:'Premiere Specialist',contact:'Tunde Bakare',phone:'0905 678 9012',area:'Lekki Phase 1',pm:'cash',wb:0,wmin:0,score:52,tier:1,dso:0,orders:3,disc:0,streak:31,refCode:'OXY-PRE5',refs:0,refReward:0,milestone:true},
  {id:6,name:'ClearView Clinic',contact:'Ngozi Nwachukwu',phone:'0704 321 8765',area:'Lekki Phase 2',pm:'cash',wb:0,wmin:0,score:41,tier:1,dso:0,orders:3,disc:0,streak:22,refCode:'OXY-CLR6',refs:0,refReward:0,milestone:true},
];

export const orders = [
  {id:'ORD-0041',hospitalId:1,hospital:'Reddington Hospital',items:[{name:'Medical Oxygen (Cylinder)',qty:10,price:12000},{name:'Nitrous Oxide',qty:2,price:18000}],total:156000,status:'delivered',pm:'wallet',payStatus:'paid',transporter:'Chukwu Logistics',date:'2025-03-12',source:'island'},
  {id:'ORD-0040',hospitalId:2,hospital:'EKO Hospital',items:[{name:'Medical Oxygen (Cylinder)',qty:8,price:12000}],total:96000,status:'in-transit',pm:'credit',payStatus:'pending',transporter:'Rapid Gas Movers',date:'2025-03-12',source:'island'},
  {id:'ORD-0039',hospitalId:3,hospital:'Lagoon Hospital',items:[{name:'Medical Oxygen (Cylinder)',qty:15,price:12000},{name:'Carbon Dioxide',qty:4,price:9500}],total:218000,status:'dispatched',pm:'wallet',payStatus:'paid',transporter:'Chukwu Logistics',date:'2025-03-12',source:'mainland'},
  {id:'ORD-0038',hospitalId:4,hospital:'St. Nicholas Hospital',items:[{name:'Medical Oxygen (Cylinder)',qty:5,price:12000}],total:60000,status:'pending',pm:'transfer',payStatus:'awaiting',transporter:null,date:'2025-03-11',source:'island'},
  {id:'ORD-0037',hospitalId:5,hospital:'Premiere Specialist',items:[{name:'Medical Oxygen (Cylinder)',qty:4,price:12000}],total:48000,status:'pending',pm:'cash',payStatus:'awaiting',transporter:null,date:'2025-03-11',source:'island'},
  {id:'ORD-0036',hospitalId:2,hospital:'EKO Hospital',items:[{name:'Medical Oxygen (Cylinder)',qty:12,price:12000}],total:144000,status:'delivered',pm:'credit',payStatus:'overdue',transporter:'TranzitNG',date:'2025-02-10',source:'island'},
  {id:'ORD-0035',hospitalId:1,hospital:'Reddington Hospital',items:[{name:'Medical Oxygen (Cylinder)',qty:20,price:12000}],total:240000,status:'delivered',pm:'wallet',payStatus:'paid',transporter:'Chukwu Logistics',date:'2025-02-20',source:'island'},
];

export const gases = [
  {id:1,name:'Medical Oxygen (Cylinder)',cat:'oxygen',price:12000,stock:85,min:30,src:'island'},
  {id:2,name:'Medical Oxygen (Bulk/L)',cat:'oxygen',price:45,stock:12000,min:3000,src:'island'},
  {id:3,name:'Nitrous Oxide',cat:'anaesthetic',price:18000,stock:22,min:10,src:'island'},
  {id:4,name:'Carbon Dioxide',cat:'specialty',price:9500,stock:18,min:8,src:'mainland'},
  {id:5,name:'Nitrogen (Medical)',cat:'specialty',price:14500,stock:12,min:6,src:'mainland'},
  {id:6,name:'Entonox (50/50)',cat:'anaesthetic',price:22000,stock:8,min:4,src:'mainland'},
];

export const transporters = [
  {id:1,name:'Chukwu Logistics',driver:'Emeka Chukwu',phone:'0803 111 2222',deliveries:31,onTime:94,active:2},
  {id:2,name:'Rapid Gas Movers',driver:'Yemi Adebayo',phone:'0806 333 4444',deliveries:18,onTime:87,active:1},
  {id:3,name:'TranzitNG',driver:'Ike Okafor',phone:'0901 555 6666',deliveries:12,onTime:91,active:0},
];

export const receivables = [
  {id:'INV-0084',hospitalId:2,hospital:'EKO Hospital',amount:144000,due:'2025-03-13',daysOverdue:1,status:'overdue',reminders:3},
  {id:'INV-0082',hospitalId:2,hospital:'EKO Hospital',amount:96000,due:'2025-04-11',daysOverdue:0,status:'current',reminders:0},
  {id:'INV-0079',hospitalId:4,hospital:'St. Nicholas Hospital',amount:60000,due:'2025-04-10',daysOverdue:0,status:'awaiting',reminders:0},
];

export const referrals = [
  {id:1,referrer:'Reddington Hospital',referred:'Apex Medical Centre',code:'OXY-RED1',status:'qualified',orders:5,reward:12000,date:'2025-01-14'},
  {id:2,referrer:'Reddington Hospital',referred:'Harbour View Clinic',code:'OXY-RED1',status:'active',orders:2,reward:0,date:'2025-02-20'},
  {id:3,referrer:'EKO Hospital',referred:'Unity Specialist Hospital',code:'OXY-EKO2',status:'pending',orders:0,reward:0,date:'2025-03-08'},
];

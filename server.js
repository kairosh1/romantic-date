const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'invitations.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function readData(){ try { return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')); } catch { return []; } }
function writeData(data){ fs.writeFileSync(DATA_FILE, JSON.stringify(data,null,2)); }
function id(){ return crypto.randomBytes(5).toString('hex'); }
function cleanArray(v){ return Array.isArray(v) ? v.map(x => String(x).trim()).filter(Boolean).slice(0,20) : []; }

app.get('/api/invitations', (req,res)=>{
  const data = readData().map(x => ({...x, answer: x.answer || null}));
  res.json(data);
});

app.post('/api/invitations', (req,res)=>{
  const b = req.body || {};
  if (!String(b.girlName||'').trim()) return res.status(400).json({error:'Укажи имя'});
  const item = {
    id:id(), createdAt:new Date().toISOString(),
    myName:String(b.myName||'').trim(), girlName:String(b.girlName).trim(),
    title:String(b.title||'Есть предложение 💌').trim(),
    message:String(b.message||'Я хочу пригласить тебя на особенную встречу.').trim(),
    places:cleanArray(b.places), dates:cleanArray(b.dates), times:cleanArray(b.times),
    answer:null
  };
  if (!item.places.length) item.places=['Кофейня ☕','Прогулка 🌙','Ужин ✨'];
  if (!item.dates.length) item.dates=['Сегодня','Завтра','В эти выходные'];
  if (!item.times.length) item.times=['18:00','19:00','20:00'];
  const data=readData(); data.unshift(item); writeData(data); res.json(item);
});

app.put('/api/invitations/:id', (req,res)=>{
  const data=readData(); const i=data.findIndex(x=>x.id===req.params.id);
  if(i<0) return res.status(404).json({error:'Приглашение не найдено'});
  const b=req.body||{}; const old=data[i];
  data[i]={...old, myName:String(b.myName??old.myName).trim(), girlName:String(b.girlName??old.girlName).trim(), title:String(b.title??old.title).trim(), message:String(b.message??old.message).trim(), places:cleanArray(b.places||old.places), dates:cleanArray(b.dates||old.dates), times:cleanArray(b.times||old.times)};
  writeData(data); res.json(data[i]);
});

app.get('/api/invitations/:id',(req,res)=>{ const x=readData().find(x=>x.id===req.params.id); if(!x)return res.status(404).json({error:'Приглашение не найдено'}); res.json(x); });

app.post('/api/invitations/:id/answer',(req,res)=>{
  const data=readData(); const i=data.findIndex(x=>x.id===req.params.id); if(i<0)return res.status(404).json({error:'Приглашение не найдено'});
  const b=req.body||{}; data[i].answer={accepted:Boolean(b.accepted),place:String(b.place||''),date:String(b.date||''),time:String(b.time||''),answeredAt:new Date().toISOString()}; writeData(data); res.json({ok:true});
});

app.delete('/api/invitations/:id',(req,res)=>{ const data=readData(); const next=data.filter(x=>x.id!==req.params.id); if(next.length===data.length)return res.status(404).json({error:'Не найдено'}); writeData(next); res.json({ok:true}); });

app.delete('/api/invitations/:id/answer',(req,res)=>{ const data=readData(); const i=data.findIndex(x=>x.id===req.params.id); if(i<0)return res.status(404).json({error:'Приглашение не найдено'}); if(!data[i].answer)return res.status(404).json({error:'Ответа нет'}); data[i].answer=null; writeData(data); res.json({ok:true}); });

app.delete('/api/answers',(req,res)=>{ const data=readData(); const count=data.reduce((n,x)=>n+(x.answer?1:0),0); data.forEach(x=>x.answer=null); writeData(data); res.json({ok:true,deleted:count}); });

app.get('/invite/:id',(req,res)=>res.sendFile(path.join(__dirname,'public','invite.html')));
app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`Romantic invite running on port ${PORT}`));

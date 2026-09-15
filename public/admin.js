const $=s=>document.querySelector(s);
const lines=s=>s.split(/\n|,/).map(x=>x.trim()).filter(Boolean);

async function load(){
  const r=await fetch('/api/invitations');
  const data=await r.json();
  const list=$('#list');
  list.innerHTML='';
  if(!data.length){
    list.innerHTML='<div class="item"><span class="muted">Пока нет приглашений.</span></div>';
    return;
  }
  data.forEach(x=>{
    const div=document.createElement('div');
    div.className='item';
    const url=location.origin+'/invite/'+x.id;
    const answer=x.answer;
    div.innerHTML=`
      <strong>${esc(x.girlName)} ${answer?'❤️':'· ожидает ответа'}</strong>
      <div class="muted">${esc(x.title)}</div>
      <div class="result"><a href="${url}" target="_blank">${url}</a></div>
      ${answer?`
        <div class="answer">Ответ: ${answer.accepted?'Да ❤️':'Нет'}${answer.place?' · '+esc(answer.place):''}${answer.date?' · '+esc(answer.date):''}${answer.time?' · '+esc(answer.time):''}</div>
        <div class="actions"><button class="mini danger" data-action="delete-answer" data-id="${esc(x.id)}">Удалить ответ</button></div>
      `:''}
    `;
    list.append(div);
  });
}

function esc(s){
  return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

$('#create').onclick=async()=>{
  const body={
    myName:$('#myName').value,
    girlName:$('#girlName').value,
    title:$('#title').value,
    message:$('#message').value,
    places:lines($('#places').value),
    dates:lines($('#dates').value),
    times:lines($('#times').value)
  };
  if(!body.girlName.trim()){alert('Укажи имя девушки');return}
  const r=await fetch('/api/invitations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const x=await r.json();
  if(!r.ok){alert(x.error||'Ошибка');return}
  const url=location.origin+'/invite/'+x.id;
  $('#created').hidden=false;
  $('#created').innerHTML=`Готово ❤️<br><br><a href="${url}" target="_blank">${url}</a><br><br>Открой ссылку для проверки и отправь её ей.`;
  load();
};

$('#refresh').onclick=load;

$('#clearHistory').onclick=async()=>{
  if(!confirm('Удалить все ответы из истории? Приглашения и ссылки останутся.')) return;
  const r=await fetch('/api/answers',{method:'DELETE'});
  const x=await r.json();
  if(!r.ok){alert(x.error||'Не удалось очистить историю');return}
  alert(`История очищена. Удалено ответов: ${x.deleted}`);
  load();
};

document.addEventListener('click',async e=>{
  const btn=e.target.closest('[data-action="delete-answer"]');
  if(!btn) return;
  const id=btn.dataset.id;
  if(!confirm('Удалить этот ответ? Приглашение и ссылка останутся.')) return;
  const r=await fetch('/api/invitations/'+encodeURIComponent(id)+'/answer',{method:'DELETE'});
  const x=await r.json();
  if(!r.ok){alert(x.error||'Не удалось удалить ответ');return}
  load();
});

load();

const $ = s => document.querySelector(s);
const lines = s => s.split(/\n|,/).map(x => x.trim()).filter(Boolean);

async function load(){
  const r = await fetch('/api/invitations');
  const data = await r.json();
  const list = $('#list');
  list.innerHTML = '';

  if(!data.length){
    list.innerHTML = '<div class="item"><span class="muted">Пока нет приглашений.</span></div>';
    return;
  }

  data.forEach(x => {
    const div = document.createElement('div');
    div.className = 'item';
    const url = location.origin + '/invite/' + x.id;
    const answer = x.answer
      ? `<div class="answer">Ответ: ${x.answer.accepted ? 'Да ❤️' : 'Нет'}${x.answer.place ? ' · ' + esc(x.answer.place) : ''}${x.answer.date ? ' · ' + esc(x.answer.date) : ''}${x.answer.time ? ' · ' + esc(x.answer.time) : ''}</div>`
      : '<div class="muted">Ожидает ответа</div>';

    div.innerHTML = `
      <strong>${esc(x.girlName)} ${x.answer ? '❤️' : '·'}</strong>
      <div class="muted">${esc(x.title)}</div>
      <div class="result"><a href="${url}" target="_blank">${url}</a></div>
      ${answer}
      <div class="actions">
        <a class="mini" href="${url}" target="_blank">Открыть ↗</a>
        <button class="mini danger" data-delete="${esc(x.id)}">Удалить приглашение</button>
      </div>
    `;
    list.append(div);
  });

  list.querySelectorAll('[data-delete]').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.delete;
      if(!confirm('Удалить это приглашение? Его ссылка перестанет работать, а ответ будет удалён.')) return;

      btn.disabled = true;
      const r = await fetch('/api/invitations/' + encodeURIComponent(id), { method: 'DELETE' });
      const result = await r.json().catch(() => ({}));

      if(!r.ok){
        alert(result.error || 'Не удалось удалить приглашение');
        btn.disabled = false;
        return;
      }

      await load();
    };
  });
}

function esc(s){
  return String(s ?? '').replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
}

$('#create').onclick = async () => {
  const body = {
    myName: $('#myName').value,
    girlName: $('#girlName').value,
    title: $('#title').value,
    message: $('#message').value,
    places: lines($('#places').value),
    dates: lines($('#dates').value),
    times: lines($('#times').value)
  };

  if(!body.girlName.trim()){
    alert('Укажи имя девушки');
    return;
  }

  const r = await fetch('/api/invitations', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  });

  const x = await r.json();
  if(!r.ok){
    alert(x.error || 'Ошибка');
    return;
  }

  const url = location.origin + '/invite/' + x.id;
  $('#created').hidden = false;
  $('#created').innerHTML = `Готово ❤️<br><br><a href="${url}" target="_blank">${url}</a><br><br>Открой ссылку для проверки и отправь её ей.`;
  load();
};

$('#refresh').onclick = load;
load();

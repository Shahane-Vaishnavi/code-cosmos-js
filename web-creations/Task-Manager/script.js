document.addEventListener('DOMContentLoaded', ()=> {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const list = document.getElementById('task-list');
  const STORAGE_KEY = 'task-manager.tasks';

  let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
  function render(){
    list.innerHTML = '';
    tasks.forEach((t, i) => {
      const li = document.createElement('li');
      li.className = 'task' + (t.done ? ' completed' : '');
      const left = document.createElement('div'); left.className='left';
      const chk = document.createElement('input'); chk.type='checkbox'; chk.checked = !!t.done;
      chk.addEventListener('change', ()=> { t.done = chk.checked; save(); render(); });
      const span = document.createElement('span'); span.className='text'; span.textContent = t.text;
      left.appendChild(chk); left.appendChild(span);
      const remove = document.createElement('button'); remove.textContent='✕'; remove.title='Remove';
      remove.addEventListener('click', ()=> { tasks.splice(i,1); save(); render(); });
      li.appendChild(left); li.appendChild(remove);
      list.appendChild(li);
    });
  }

  form.addEventListener('submit', (e)=> {
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    tasks.push({text, done:false, created: Date.now()});
    save(); render();
    form.reset(); input.focus();
  });

  render();
});
const toolbar = document.getElementById('toolbar');
const daysContainer = document.querySelector('.days');
const newTimerDialog = document.getElementById('new-timer');

let lastId = 0;

const updateInterval = 300;

const timers = [
  {
    id: '-1',
    date: '2024-09-08',
    name: 'Lunch',
    time: 0,
    running: false,
    lastUpdate: 123995362464,
  }
];

toolbar.onclick = handleToolbarClick;
daysContainer.onsubmit = handleTimerInteraction;
newTimerDialog.onsubmit = handleNewTimerDialogSubmit;

beginTimerUpdates();

function handleToolbarClick(e) {
  const btn = e.target.closest('button');

  if (btn.value === 'add') {
    showNewTimerDialog();
  }
}

function handleTimerInteraction(e) {
  e.preventDefault();
  
  const btn = e.submitter;
  const form = e.target;
  const id = form.id.value;

  if (btn.value === 'run') {
    btn.disabled = true;
    runTimer(id);

  } else if (btn.value === 'pause') {
    btn.disabled = true;
    pauseTimer(id);

  } else if (btn.value === 'rename') {

  } else if (btn.value === 'delete') {

  }
}

function handleNewTimerDialogSubmit(e) {
  const btn = e.submitter;
  
  if (btn.value === 'add') {
    const form = e.target;
    const date = getIsoDate(new Date());
    const name = form.name.value;
    
    addTimer(date, name);
    renderData();
  }
}

function showNewTimerDialog() {
  newTimerDialog.showModal();
}

function getIsoDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

function addTimer(date, name) {
  const timer = {
    id: genId(),
    date,
    name,
    time: 0,
    running: false,
    lastUpdate: Date.now(),
  };
  
  timers.push(timer);
}

function runTimer(id) {
  const timer = timers.find(t => t.id === id);
  
  timer.running = true;
  timer.lastUpdate = Date.now();
}

function pauseTimer(id) {
  const timer = timers.find(t => t.id === id);
  
  updateTimer(timer);
  timer.running = false;
}

function updateTimer(timer) {
  if (timer.running) {
    const now = Date.now();
    const delta = now - timer.lastUpdate;

    timer.time += delta;
    timer.lastUpdate = now;
  }
}

function genId() {
  return (++lastId).toString();
}

function renderData() {
  const days = groupByDate(timers);
  const dayItems = days.map(buildDayItem);
  
  daysContainer.replaceChildren(...dayItems);
}

function groupByDate(timers) {
  const timersDict = Object.groupBy(timers, ({date}) => date);
  const days = Object.entries(timersDict)
    .map(([date, timers]) => ({ date, timers }));
  
  return days;
}

function buildDayItem(day) {
  const { date, timers } = day;
  const dayItem = document.createElement('li');
  
  dayItem.classList.add('day');
  dayItem.dataset.date = date;

  dayItem.innerHTML = `
    <h3>${date}</h3>
    <ul class="timers"></ul>
  `;

  const timersList = dayItem.querySelector('.timers');
  const timerItems = timers.map(buildTimerItem);
  
  timersList.append(...timerItems);

  return dayItem;
}

function buildTimerItem(timer) {
  const { id, name, time, running } = timer;
  const timerItem = document.createElement('li');

  timerItem.classList.add('timer');
  timerItem.dataset.id = id;

  timerItem.innerHTML = `
    <form>
      <input type="hidden" name="id" value="${id}">
    
      <h4>${name}</h4>
      <output class="time">${formatTime(time)}</output>

      <div class="buttons">
        <button value="run" ${running ? 'hidden' : ''}>Run</button>
        <button value="pause" ${running ? '' : 'hidden'}>Pause</button>
        <button value="rename">Rename</button>
        <button value="delete">Delete</button>
      </div>
    </form>
  `;

  return timerItem;
}

function formatTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds %= 60;
  minutes %= 60;

  hours = hours.toString().padStart(2, '0');
  minutes = minutes.toString().padStart(2, '0');
  seconds = seconds.toString().padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}

function beginTimerUpdates() {
  setInterval(() => {
    timers.forEach(updateTimer);
    renderData();
  }, updateInterval);
}

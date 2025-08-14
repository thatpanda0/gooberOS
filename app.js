let zCounter = 1; // global focus counter

const dock = document.getElementById("dock");
const windows = document.querySelectorAll(".window");

function updateDockVisibility() {
  const anyMaximized = Array.from(windows).some((w) =>
    w.classList.contains("maximized")
  );
  dock.classList.toggle("hidden", anyMaximized);
  dock.classList.toggle("shown", !anyMaximized);
}

windows.forEach((win) => {
  const draggableAreas = (win.classList.contains("settings-window") || win.classList.contains("notes-window"))
    ? win.querySelectorAll(".left-panel, .right-panel .titlebar")
    : [win.querySelector(".titlebar")];

  const handle = win.querySelector(".resize-handle");
  const closeBtn = win.querySelector(".close");
  const minBtn = win.querySelector(".minimize");
  const maxBtn = win.querySelector(".maximize");

  let mode = null;
  let startX, startY, startLeft, startTop, startWidth, startHeight;
  let prevSize = null;

  // duh
  function bringToFront() {
    zCounter++;
    win.style.zIndex = zCounter;
    windows.forEach((w) => w.classList.remove("focused"));
    win.classList.add("focused");
  }

  // drag and resize
  function beginPointer(op) {
    return (e) => {
      if (op === "drag" && win.classList.contains("maximized")) return;
      e.stopPropagation();
      bringToFront();
      mode = op;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = win.offsetLeft;
      startTop = win.offsetTop;
      startWidth = win.offsetWidth;
      startHeight = win.offsetHeight;
      document.body.style.userSelect = "none";
    };
  }

  draggableAreas.forEach(area => area.addEventListener("pointerdown", beginPointer("drag")));
  handle.addEventListener("pointerdown", beginPointer("resize"));

  document.addEventListener("pointermove", (e) => {
    if (!mode) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (mode === "drag") {
      win.style.left = startLeft + dx + "px";
      win.style.top = startTop + dy + "px";
    } else {
      win.style.width = Math.max(100, startWidth + dx) + "px";
      win.style.height = Math.max(38, startHeight + dy) + "px";
    }
  });

  document.addEventListener("pointerup", () => {
    mode = null;
    document.body.style.userSelect = "";
  });

  closeBtn.addEventListener("click", () => {
    win.style.display = "none";
    updateDockVisibility();
  });

  minBtn.addEventListener("click", () => (win.style.height = "38px"));

  maxBtn.addEventListener("click", () => {
    bringToFront();
    if (win.classList.toggle("maximized")) {
      prevSize = {
        top: win.offsetTop,
        left: win.offsetLeft,
        width: win.offsetWidth,
        height: win.offsetHeight,
      };
      Object.assign(win.style, {
        top: "0px",
        left: "0px",
        width: "100%",
        height: "100%",
        borderRadius: "0px",
      });
    } else if (prevSize) {
      Object.assign(win.style, {
        top: `${prevSize.top}px`,
        left: `${prevSize.left}px`,
        width: `${prevSize.width}px`,
        height: `${prevSize.height}px`,
        borderRadius: "12px",
      });
    }
    updateDockVisibility();
  });
});


document.querySelectorAll(".dock-item").forEach((button) => {
  button.addEventListener("click", () => {
    const winIndex = button.getAttribute("data-window");
    const win = windows[winIndex];
    win.style.display = "block";
    zCounter++;
    win.style.zIndex = zCounter;
    win.classList.add("focused");
    updateDockVisibility();
  });
});

// colossal ahh calendar content

(function(){
  const cal = document.getElementById('calendar');
  const now = new Date();
  let year = now.getFullYear(), month = now.getMonth();

  function render(){
    cal.innerHTML = '';
    const header = document.createElement('div'); header.className='cal-header';
    const title = document.createElement('div'); title.className='cal-title'; 
    title.textContent = new Date(year,month).toLocaleString(undefined,{month:'long', year:'numeric'});
    const controls = document.createElement('div'); controls.className='cal-controls';
    const prev = document.createElement('button'); prev.textContent='<';
    const next = document.createElement('button'); next.textContent='>';
    const todayBtn = document.createElement('button'); todayBtn.textContent='Today';
    controls.appendChild(prev); controls.appendChild(todayBtn); controls.appendChild(next);
    header.appendChild(title); header.appendChild(controls);
    cal.appendChild(header);

    const weekdays = document.createElement('div'); weekdays.className='weekdays';
    const shortDays = [];
    for(let d=0;d<7;d++) shortDays.push(new Date(1970,0,4+d).toLocaleDateString(undefined,{weekday:'short'}));
    shortDays.forEach(d=>{ const el=document.createElement('div'); el.textContent=d; weekdays.appendChild(el); });
    cal.appendChild(weekdays);

    const grid = document.createElement('div'); grid.className='grid';

    const first = new Date(year,month,1);
    const startDay = first.getDay(); 
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const prevDays = new Date(year,month,0).getDate();

    for(let i=startDay-1;i>=0;i--){
      const d = document.createElement('div'); d.className='day inactive';
      d.innerHTML = `<div class="date">${prevDays - i}</div>`;
      grid.appendChild(d);
    }

    for(let d=1; d<=daysInMonth; d++){
      const cell = document.createElement('div'); cell.className='day';
      const dateDiv = document.createElement('div'); dateDiv.className='date'; dateDiv.textContent=d;
      cell.appendChild(dateDiv);
      if(d===now.getDate() && month===now.getMonth() && year===now.getFullYear()){
        dateDiv.style.background = 'rgba(255,0,0,0.8)';
        dateDiv.style.color = 'white';
        dateDiv.style.borderRadius = '50%';
        dateDiv.style.width = '1.8em';
        dateDiv.style.height = '1.8em';
        dateDiv.style.display = 'inline-flex';
        dateDiv.style.alignItems = 'center';
        dateDiv.style.justifyContent = 'center';
        dateDiv.style.margin = '0';
        dateDiv.style.position = 'absolute';
      }
      cell.style.position = 'relative';
      grid.appendChild(cell);
    }

    const totalCells = grid.children.length;
    const trailing = (7 - (totalCells % 7)) % 7;
    for(let t=1;t<=trailing;t++){
      const d = document.createElement('div'); d.className='day inactive'; 
      d.innerHTML=`<div class="date">${t}</div>`; 
      grid.appendChild(d);
    }

    cal.appendChild(grid);

    prev.onclick = ()=>{ month--; if(month<0){ month=11; year--; } render(); };
    next.onclick = ()=>{ month++; if(month>11){ month=0; year++; } render(); };
    todayBtn.onclick = ()=>{ const n=new Date(); year=n.getFullYear(); month=n.getMonth(); render(); };
  }

  render();

  const content = document.getElementById('content');
  content.addEventListener('wheel', (e)=>{
    if(content.scrollHeight > content.clientHeight) return; 
    e.preventDefault();
  }, {passive:false});

})();

// date and stuff

function updateDateDisplay() {
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const date = now.toLocaleDateString([], options).replace(',', ', ');
  document.getElementById("date-display").textContent = `${date}\u00A0\u00A0\u00A0${time}`;
}

function startSyncedClock() {
  updateDateDisplay();
  const now = new Date();
  const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  setTimeout(() => {
    updateDateDisplay();
    setInterval(updateDateDisplay, 60000);
  }, msToNextMinute);
}

startSyncedClock();


// Dark mode toggle
const darkModeToggle = document.getElementById("darkModeToggle");

// Load saved preference
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  darkModeToggle.checked = true;
}

darkModeToggle.addEventListener("change", () => {
  if (darkModeToggle.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});


// notes
const notesList = document.getElementById("notes-list");
const notesTextarea = document.getElementById("notes-textarea");
const noteTitle = document.getElementById("note-title");
const newNoteBtn = document.getElementById("new-note-btn");

let notes = JSON.parse(localStorage.getItem("notesData") || "[]");
let activeNoteId = null;

function saveNotes() {
  localStorage.setItem("notesData", JSON.stringify(notes));
}

function renderNotesList() {
    notesList.innerHTML = "";
    notes.forEach(note => {
        const itemContainer = document.createElement("div");
        itemContainer.className = "note-item" + (note.id === activeNoteId ? " active" : "");
        itemContainer.addEventListener("click", () => selectNote(note.id));

        const titleSpan = document.createElement("span");
        titleSpan.className = "note-item-title";
        titleSpan.textContent = note.title || "Untitled";

        // delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-note-btn";
        deleteBtn.innerHTML = "&times;"; // "x" symbol
        deleteBtn.title = "Delete Note";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            deleteNote(note.id);
        });

        itemContainer.appendChild(titleSpan);
        itemContainer.appendChild(deleteBtn);
        notesList.appendChild(itemContainer);
    });
}


function selectNote(id) {
  activeNoteId = id;
  const note = notes.find(n => n.id === id);
  if (note) {
    noteTitle.textContent = note.title || "Untitled";
    notesTextarea.value = note.content || "";
  } else if (notes.length > 0) {
    selectNote(notes[0].id);
    return;
  } else {
    noteTitle.textContent = "Notes";
    notesTextarea.value = "";
  }
  renderNotesList();
}

function createNewNote() {
  const id = Date.now();
  const newNote = { id, title: "Untitled", content: "" };
  notes.unshift(newNote);
  saveNotes();
  selectNote(id);
}


// del
function deleteNote(idToDelete) {
    const index = notes.findIndex(note => note.id === idToDelete);
    if (index === -1) return;
    notes = notes.filter(note => note.id !== idToDelete);
    saveNotes();

    // create new if no note
    if (notes.length === 0) {
        createNewNote();
    } else {
        if (activeNoteId === idToDelete) {
            const newActiveIndex = Math.min(index, notes.length - 1);
            selectNote(notes[newActiveIndex].id);
        } else {
            renderNotesList();
        }
    }
}


// save on typing
notesTextarea.addEventListener("input", () => {
    if (activeNoteId === null) return;
    const note = notes.find(n => n.id === activeNoteId);
    if (note) {
        note.content = notesTextarea.value;
        const firstLine = note.content.split("\n")[0].trim();
        note.title = firstLine.substring(0, 50) || "Untitled"; // limit title
        noteTitle.textContent = note.title;
        saveNotes();
        renderNotesList();
    }
});

newNoteBtn.addEventListener("click", createNewNote);

if (notes.length > 0) {
  selectNote(notes[0].id);
} else {
  createNewNote();
}

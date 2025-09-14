let zCounter = 1;

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
    win.classList.remove("maximized");
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
    const remaining = 42 - totalCells;
    for (let t = 1; t <= remaining; t++) {
        const d = document.createElement('div');
        d.className = 'day inactive';
        d.innerHTML = `<div class="date">${t}</div>`;
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
const notesEditorArea = document.getElementById("notes-editor-area");
const noteTitleDisplay = document.getElementById("note-title-display");
const newNoteBtn = document.getElementById("new-note-btn");

const boldBtn = document.getElementById("bold-btn");
const underlineBtn = document.getElementById("underline-btn");
const strikethroughBtn = document.getElementById("strikethrough-btn");
const fontSelect = document.getElementById('font-select');
const fontsizeSelect = document.getElementById("fontsize-select");


let defaultFontFamily = fontSelect.value;
let defaultFontSize = fontsizeSelect.value;

fontSelect.addEventListener('change', (e) => {
    defaultFontFamily = e.target.value;
    document.execCommand('fontName', false, e.target.value);
    // update the notes editor style
    notesEditorArea.style.fontFamily = e.target.value;
});

fontsizeSelect.addEventListener('change', (e) => {
    defaultFontSize = e.target.value;
    document.execCommand('fontSize', false, e.target.value);
    notesEditorArea.style.fontSize = (e.target.value * 4) + "px";
});



let notes = JSON.parse(localStorage.getItem("notesData") || "[]");
let activeNoteId = null;

function saveNotes() {
  localStorage.setItem("notesData", JSON.stringify(notes));
}

function renderNotesList() {
    notesList.innerHTML = "";
    let activeInput = null;

    notes.forEach(note => {
        const itemContainer = document.createElement("div");
        itemContainer.className = "note-item" + (note.id === activeNoteId ? " active" : "");
        itemContainer.addEventListener("click", () => {
            if (note.id !== activeNoteId) {
               selectNote(note.id);
            }
        });

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'note-item-content-wrapper';

        if (note.id === activeNoteId) {
            const titleInput = document.createElement("input");
            titleInput.type = "text";
            titleInput.className = "note-title-input-sidebar";
            titleInput.value = note.title || "Untitled Note";

            titleInput.addEventListener("input", () => {
                note.title = titleInput.value || "Untitled Note";
                noteTitleDisplay.textContent = note.title;
                saveNotes();
            });
            
            titleInput.addEventListener("click", (e) => e.stopPropagation());
            contentWrapper.appendChild(titleInput);
            activeInput = titleInput;

        } else {
            const titleSpan = document.createElement("span");
            titleSpan.className = "note-item-title";
            titleSpan.textContent = note.title || "Untitled Note";
            contentWrapper.appendChild(titleSpan);
        }

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-note-btn";
        deleteBtn.innerHTML = "&times;";
        deleteBtn.title = "Delete Note";
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            deleteNote(note.id);
        });

        itemContainer.appendChild(contentWrapper);
        itemContainer.appendChild(deleteBtn);
        notesList.appendChild(itemContainer);
    });

    if (activeInput) {
        activeInput.focus();
        activeInput.setSelectionRange(activeInput.value.length, activeInput.value.length);
    }
}


function selectNote(id) {
  activeNoteId = id;
  const note = notes.find(n => n.id === id);
  if (note) {
    noteTitleDisplay.textContent = note.title || "Untitled Note";
    notesEditorArea.innerHTML = note.content || "";
  } else if (notes.length > 0) {
    selectNote(notes[0].id);
    return;
  } else {
    noteTitleDisplay.textContent = "Notes";
    notesEditorArea.innerHTML = "";
  }
  renderNotesList();
  notesEditorArea.focus();
}

function createNewNote() {
  const id = Date.now();
  const newNote = { id, title: "Untitled Note", content: "" };
  notes.unshift(newNote);
  saveNotes();
  selectNote(id);
}

function deleteNote(idToDelete) {
    const index = notes.findIndex(note => note.id === idToDelete);
    if (index === -1) return;
    notes = notes.filter(note => note.id !== idToDelete);
    saveNotes();

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

notesEditorArea.addEventListener("input", () => {
    if (activeNoteId === null) return;
    const note = notes.find(n => n.id === activeNoteId);
    if (note) {
        note.content = notesEditorArea.innerHTML;
        saveNotes();
    }
});

document.getElementById('italic-btn').addEventListener('click', () => {
  document.execCommand('italic', false, null);
});

document.getElementById('font-select').addEventListener('change', (e) => {
    document.execCommand('fontName', false, e.target.value);
});

document.getElementById('notes-editor-area').addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault(); // Prevent focus change
        document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;'); // Insert 8 spaces
    }
});

boldBtn.addEventListener("click", () => document.execCommand("bold"));
underlineBtn.addEventListener("click", () => document.execCommand("underline"));
strikethroughBtn.addEventListener("click", () => document.execCommand("strikeThrough"));
fontsizeSelect.addEventListener("change", () => document.execCommand("fontSize", false, fontsizeSelect.value));

newNoteBtn.addEventListener("click", createNewNote);

if (notes.length > 0) {
  selectNote(notes[0].id);
} else {
  createNewNote();
}

// calc





// width calc

const calcWindow = document.querySelector(".calculator-window");

function updateCalcLayout() {
    if (calcWindow.offsetWidth >= 650) {
        calcWindow.classList.add("wide");
    } else {
        calcWindow.classList.remove("wide");
    }
}

window.addEventListener("resize", updateCalcLayout);
updateCalcLayout();

const resizeObserver = new ResizeObserver(() => {
  updateCalcLayout();
});

resizeObserver.observe(calcWindow);

// expression

let expression = "";
let angleMode = "rad";
const display = document.getElementById("calc-result");

function updateDisplay() {
    display.textContent = expression || "0";
}

document.querySelectorAll(".calc-button").forEach(btn => {
    btn.addEventListener("click", () => {
        const val = btn.textContent;
        const action = btn.dataset.action;

        if (!action) {
            expression += val;
        } else {
            handleAction(action);
        }
        updateDisplay();
    });
});

function handleAction(action) {
    switch (action) {
        case "clear":
            expression = "";
            break;
        case "calculate":
            try {
                const result = evaluateExpression(expression);
                const rounded = Math.round(result * 1e9) / 1e9;
                expression = rounded.toString();
            } catch {
                expression = "Error";
            }
            break;
        case "toggle-angle":
            angleMode = angleMode === "rad" ? "deg" : "rad";
            updateAngleButton();
            break;
        default:
            insertFunction(action);
    }
}

function insertFunction(action) {
    switch (action) {
        // Parentheses
        case "paren-open":
            expression += "(";
            break;
        case "paren-close":
            expression += ")";
            break;

            // Powers
        case "square":
            expression += "^(2)";
            break;
        case "cube":
            expression += "^(3)";
            break;
        case "power":
            expression += "^(";
            break;
        case "exp":
            expression += "e^(";
            break;
        case "ten-power":
            expression += "10^(";
            break;

        case "reciprocal":
            expression += "1/(";
            break;
        case "sqrt":
            expression += "sqrt(";
            break;
        case "cbrt":
            expression += "cbrt(";
            break;
        case "yroot":
            expression += "^(1/";
            break;

        case "ln":
            expression += "ln(";
            break;
        case "log10":
            expression += "log10(";
            break;

        case "factorial":
            expression += "!";
            break;

        case "sin":
            expression += "sin(";
            break;
        case "cos":
            expression += "cos(";
            break;
        case "tan":
            expression += "tan(";
            break;
        case "sinh":
            expression += "sinh(";
            break;
        case "cosh":
            expression += "cosh(";
            break;
        case "tanh":
            expression += "tanh(";
            break;

        case "const-e":
            expression += "e";
            break;
        case "const-pi":
            expression += "pi";
            break;

        case "rand":
            expression += "rand()";
            break;

        case "mod":
            expression += "%";
            break;

        case "add":
            expression += "+";
            break;
        case "subtract":
            expression += "-";
            break;
        case "multiply":
            expression += "*";
            break;
        case "divide":
            expression += "/";
            break;


        default:
            break;
    }
}


// rad/deg

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0) return 1;
    let res = 1;
    for (let i = 1; i <= n; i++) res *= i;
    return res;
}

function evaluateExpression(expr) {
    expr = expr.replace(/\^/g, "**"); 
    expr = expr.replace(/(\d+)!/g, "factorial($1)"); 
    expr = expr.replace(/pi/g, "Math.PI");
    expr = expr.replace(/\be\b/g, "Math.E");

    const scope = {
        sin: x => Math.sin(angleMode === "deg" ? x * Math.PI / 180 : x),
        cos: x => Math.cos(angleMode === "deg" ? x * Math.PI / 180 : x),
        tan: x => Math.tan(angleMode === "deg" ? x * Math.PI / 180 : x),
        sinh: x => Math.sinh(x),
        cosh: x => Math.cosh(x),
        tanh: x => Math.tanh(x),
        sqrt: Math.sqrt,
        cbrt: Math.cbrt,
        ln: Math.log,
        log10: Math.log10,
        rand: Math.random,
        factorial: factorial,
    };
    return Function(...Object.keys(scope), `return ${expr}`)(...Object.values(scope));
}



function updateAngleButton() {
    const btn = document.querySelector('[data-action="toggle-angle"]');
    btn.textContent = angleMode === "rad" ? "Rad" : "Deg";
}
updateAngleButton();


// keyboard

document.addEventListener("keydown", e => {
    if (/[0-9]/.test(e.key)) {
        expression += e.key;
    } else {
        switch (e.key) {
            case "+":
                expression += "+";
                break;
            case "-":
                expression += "-";
                break;
            case "*":
                expression += "*";
                break;
            case "/":
                expression += "/";
                break;
            case "(":
                expression += "(";
                break;
            case ")":
                expression += ")";
                break;
            case ".":
                expression += ".";
                break;
            case "Enter":
                handleAction("calculate");
                break;
            case "=":
                handleAction("calculate");
                break;
            case "Backspace":
                expression = expression.slice(0, -1);
                break;
            case "Escape":
                handleAction("clear");
                break;
        }
    }
    updateDisplay();
});
document.addEventListener('DOMContentLoaded', () => {
    const tabBar = document.getElementById('tabBar');
    const urlInput = document.getElementById('urlInput');
    const contentView = document.getElementById('contentView');
    const newTabBtn = document.getElementById('newTabBtn');


    let tabs = [{
        id: Date.now(),
        title: 'GutHib',
        url: 'https://www.guthib.com', // https://www.google.com/webhp?igu=1,
        isActive: true,
    }];

    // core
    const renderTabs = () => {
        tabBar.innerHTML = '';
        const activeTab = tabs.find(tab => tab.isActive);

        tabs.forEach(tab => {
            const tabElement = document.createElement('div');
            tabElement.classList.add('tab');
            tabElement.dataset.tabId = tab.id;

            const titleElement = document.createElement('span');
            titleElement.classList.add('tab-title');
            titleElement.textContent = tab.title;

            const closeBtn = document.createElement('span');
            closeBtn.classList.add('close-tab');
            closeBtn.innerHTML = '&times;'; // x

            tabElement.appendChild(titleElement);
            tabElement.appendChild(closeBtn);
            if (tab.isActive) {
                tabElement.classList.add('active');
            }
            tabBar.appendChild(tabElement);
        });

        // update
        if (activeTab) {
            urlInput.value = activeTab.url === 'about:blank' ? '' : activeTab.url;
            if (contentView.src !== activeTab.url) {
                contentView.src = activeTab.url;
            }
        } else if (tabs.length === 0) {
            // notab
            contentView.src = 'about:blank';
            urlInput.value = '';
        }
    };

    // format
    const formatUrl = (input) => {
        try {
            new URL(input);
            return input;
        } catch (_) {
            if (input.includes('.') && !input.includes(' ')) {
                return `https://${input}`;
            }
            return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
        }
    };

    // newtab closetab tabclick
    const handleNewTab = () => {
        tabs.forEach(tab => tab.isActive = false);
        const newTab = {
            id: Date.now(),
            title: 'New Tab',
            url: 'about:blank',
            isActive: true,
        };
        tabs.push(newTab);
        renderTabs();
        urlInput.focus();
    };


    const closeTab = (tabIdToClose) => {
        const tabIndex = tabs.findIndex(t => t.id === tabIdToClose);
        if (tabIndex === -1) return;

        const wasActive = tabs[tabIndex].isActive;
        tabs.splice(tabIndex, 1);

        if (tabs.length === 0) {
            handleNewTab();
            return;
        }

        if (wasActive) {
            const newActiveIndex = Math.max(0, tabIndex - 1);
            tabs[newActiveIndex].isActive = true;
        }

        renderTabs();
    };

    const handleTabBarClick = (e) => {
        const tabElement = e.target.closest('.tab');
        if (!tabElement) return;

        const tabId = Number(tabElement.dataset.tabId);

        if (e.target.classList.contains('close-tab')) {
            closeTab(tabId);
        } else {
            tabs.forEach(tab => tab.isActive = (tab.id === tabId));
            renderTabs();
        }
    };

    const handleUrlSubmit = (e) => {
        e.stopPropagation();

        if (e.key === 'Enter') {
            const activeTab = tabs.find(tab => tab.isActive);
            if (activeTab) {
                const finalUrl = formatUrl(urlInput.value);
                activeTab.url = finalUrl;
                try {
                    let hostname = new URL(finalUrl).hostname.replace('www.', '');
                    activeTab.title = hostname.split('.')[0];
                    activeTab.title = activeTab.title.charAt(0).toUpperCase() + activeTab.title.slice(1);
                } catch {
                    activeTab.title = 'Search';
                }
                renderTabs();
            }
        }
    };

    // yeah
    newTabBtn.addEventListener('click', handleNewTab);
    tabBar.addEventListener('click', handleTabBarClick);
    urlInput.addEventListener('keydown', handleUrlSubmit);
    renderTabs();
});



// wallpaper switcher

document.addEventListener('DOMContentLoaded', () => {
    const wallpaperSwitcher = document.getElementById('wallpaper-switcher');
    const wallpaperThumbs = () => document.querySelectorAll('.wallpaper-thumb');
    const uploadInput = document.getElementById('uploadWallpaper');

    const savedWallpaper = localStorage.getItem('desktopWallpaper');
    if (savedWallpaper) {
        document.body.style.backgroundImage = `url('${savedWallpaper}')`;
        updateActiveThumb(savedWallpaper);
    }

    function initThumbClickEvents() {
        wallpaperThumbs().forEach(thumb => {
            thumb.addEventListener('click', () => {
                const wallpaperUrl = thumb.dataset.wallpaper;
                document.body.style.backgroundImage = `url('${wallpaperUrl}')`;
                localStorage.setItem('desktopWallpaper', wallpaperUrl);
                updateActiveThumb(wallpaperUrl);
            });
        });
    }

    function updateActiveThumb(url) {
        wallpaperThumbs().forEach(t => t.classList.remove('active'));
        const activeThumb = document.querySelector(`.wallpaper-thumb[data-wallpaper="${url}"]`);
        if (activeThumb) activeThumb.classList.add('active');
    }

    // Handle uploading new wallpaper
    uploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imgSrc = e.target.result;

            // Create new thumbnail
            const img = document.createElement('img');
            img.src = imgSrc;
            img.dataset.wallpaper = imgSrc;
            img.className = 'wallpaper-thumb';

            wallpaperSwitcher.appendChild(img);
            initThumbClickEvents(); // Re-init click events

            // Automatically set uploaded wallpaper
            document.body.style.backgroundImage = `url('${imgSrc}')`;
            localStorage.setItem('desktopWallpaper', imgSrc);
            updateActiveThumb(imgSrc);
        };
        reader.readAsDataURL(file);
    });

    // Initialize existing thumbnails
    initThumbClickEvents();
});


// testing clock app
// switch timer/stopwatch
document.querySelectorAll('.clock-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.clock-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const selectedTab = tab.getAttribute('data-tab');
    document.getElementById('stopwatch-view').style.display = selectedTab === 'stopwatch' ? 'block' : 'none';
    document.getElementById('timer-view').style.display = selectedTab === 'timer' ? 'block' : 'none';
  });
});

// stopwatch

let swInterval, swStartTime, elapsed = 0;
const swMins = document.getElementById('sw-mins');
const swMs = document.getElementById('sw-ms');
const startBtn = document.getElementById('sw-start');
const lapBtn = document.getElementById('sw-lap');
const lapsDiv = document.getElementById('laps');

startBtn.addEventListener('click', () => {
  if (startBtn.textContent === 'Start' || startBtn.textContent === 'Resume') {
    swStartTime = Date.now() - elapsed;
    swInterval = setInterval(updateStopwatch, 10);
    startBtn.textContent = 'Stop';
  } else {
    clearInterval(swInterval);
    elapsed = Date.now() - swStartTime;
    startBtn.textContent = 'Resume';
  }
});

lapBtn.addEventListener('click', () => {
  if (elapsed > 0) {
    const lapTime = swMins.textContent + swMs.textContent;
    const lapItem = document.createElement('div');
    lapItem.textContent = lapTime;
    lapsDiv.appendChild(lapItem);
  }
});

function updateStopwatch() {
  elapsed = Date.now() - swStartTime;
  const mins = Math.floor(elapsed / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);
  const ms = elapsed % 1000;
  swMins.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  swMs.textContent = `.${ms.toString().padStart(3, '0')}`;
}

// timer (beats me)
const timerList = document.getElementById('timer-list');
const addTimerBtn = document.getElementById('add-timer');

addTimerBtn.addEventListener('click', () => {
  const name = document.getElementById('new-timer-name').value || 'Timer';
  const time = document.getElementById('new-timer-time').value;
  const [hh, mm, ss] = time.split(':').map(Number);
  const totalSeconds = hh * 3600 + mm * 60 + ss;

  const timer = {
    name,
    remaining: totalSeconds,
    running: false,
    interval: null
  };

  const timerDiv = document.createElement('div');
  timerDiv.classList.add('timer-item');

  const nameSpan = document.createElement('span');
  nameSpan.textContent = `${timer.name}: ${formatTime(timer.remaining)}`;
  timerDiv.appendChild(nameSpan);

  // Start Button
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Start';
  startBtn.className = 'btn-small primary';
  startBtn.addEventListener('click', () => {
    if (!timer.running && timer.remaining > 0) {
      timer.running = true;
      startBtn.textContent = 'Pause';
      timer.interval = setInterval(() => {
        if (timer.remaining > 0) {
          timer.remaining--;
          nameSpan.textContent = `${timer.name}: ${formatTime(timer.remaining)}`;
        } else {
          clearInterval(timer.interval);
          nameSpan.textContent = `${timer.name}: Done!`;
          timer.running = false;
          startBtn.disabled = true;
          editBtn.disabled = true;
          startBtn.textContent = 'Done';
          timerDiv.style.color = 'red';
        }
      }, 1000);
    } else if (timer.running) {
      clearInterval(timer.interval);
      timer.running = false;
      startBtn.textContent = 'Start';
    }
  });
  timerDiv.appendChild(startBtn);

  // Edit Button
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.className = 'btn-small secondary';
  editBtn.addEventListener('click', () => {
    if (!timer.running) {
      const newTime = prompt('Enter new time (HH:MM:SS):', formatTime(timer.remaining));
      if (newTime) {
        const [newH, newM, newS] = newTime.split(':').map(Number);
        timer.remaining = newH * 3600 + newM * 60 + newS;
        nameSpan.textContent = `${timer.name}: ${formatTime(timer.remaining)}`;
        startBtn.disabled = false;
      }
    }
  });
  timerDiv.appendChild(editBtn);

  // Delete Button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'btn-small secondary';
  deleteBtn.addEventListener('click', () => {
    clearInterval(timer.interval);
    timerDiv.remove();
  });
  timerDiv.appendChild(deleteBtn);

  timerList.appendChild(timerDiv);
});

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

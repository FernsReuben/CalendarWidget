// ---------- SAMPLE EVENTS ----------
const sampleEvents = {
    "2025-03-03": [
        { title: "Design Review", start: "09:30", end: "10:30", color: "#FF6B6B" }
    ],
    "2025-03-06": [
        { title: "Team Sync", start: "11:00", end: "11:30", color: "#007aff" },
        { title: "Call with Alex", start: "15:00", end: "15:45", color: "#7b61ff" }
    ]
};

// ---------- HELPERS ----------
function pad(n) { return n < 10 ? "0" + n : n; }
function key(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }
function monthName(m) { return new Date(2020, m, 1).toLocaleString("default", { month: "long" }); }

// ---------- STATE ----------
const today = new Date();
const state = {
    viewDate: new Date(today.getFullYear(), today.getMonth(), 1),
    selectedDate: null
};

// DOM
const grid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");

// ---------- RENDER MONTH ----------
function renderMonth() {
    grid.innerHTML = "";

    const y = state.viewDate.getFullYear();
    const m = state.viewDate.getMonth();
    monthTitle.textContent = `${monthName(m)} ${y}`;

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    let dayNum = 1 - firstDay;

    for (let i = 0; i < totalCells; i++, dayNum++) {
        const d = new Date(y, m, dayNum);
        const dy = d.getFullYear();
        const dm = d.getMonth();
        const dd = d.getDate();
        const k = key(dy, dm + 1, dd);

        const events = sampleEvents[k] || [];
        const isCurrent = (dm === m);

        const el = document.createElement("div");
        el.className = "day" + (isCurrent ? "" : " inactive");
        el.dataset.date = k;

        if (k === key(today.getFullYear(), today.getMonth() + 1, today.getDate())) {
            el.classList.add("today");
        }

        if (state.selectedDate === k) el.classList.add("selected");

        const num = document.createElement("div");
        num.className = "date-num";
        num.textContent = dd;
        el.appendChild(num);

        if (events.length) {
            const dots = document.createElement("div");
            dots.className = "events-dots";

            events.slice(0, 3).forEach(ev => {
                const dot = document.createElement("div");
                dot.className = "dot";
                dot.style.background = ev.color;
                dots.appendChild(dot);
            });

            el.appendChild(dots);
        }

        el.addEventListener("click", () => openModal(k, d, events));
        grid.appendChild(el);
    }
}

// ---------- MODAL ----------
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalList = document.getElementById("modalList");
const closeBtn = document.getElementById("closeModal");

function openModal(dateKey, dateObj, events) {
    state.selectedDate = dateKey;

    modal.style.display = "flex";

    modalTitle.textContent = dateObj.toLocaleDateString("default", {
        weekday: "long", month: "long", day: "numeric", year: "numeric"
    });
    modalSubtitle.textContent = events.length
        ? `${events.length} event(s)`
        : "No events";

    modalList.innerHTML = "";

    if (!events.length) {
        const empty = document.createElement("div");
        empty.textContent = "No events for this day.";
        empty.style.color = "var(--muted)";
        empty.style.padding = "12px";
        modalList.appendChild(empty);
    } else {
        events.forEach(ev => {
            const item = document.createElement("div");
            item.className = "event-item";

            const color = document.createElement("div");
            color.className = "event-color";
            color.style.background = ev.color;

            const body = document.createElement("div");
            const title = document.createElement("div");
            title.style.fontWeight = "700";
            title.textContent = ev.title;

            const time = document.createElement("div");
            time.className = "event-time";
            time.textContent = ev.start ? `${ev.start} – ${ev.end}` : "All day";

            body.appendChild(title);
            body.appendChild(time);

            item.appendChild(color);
            item.appendChild(body);

            modalList.appendChild(item);
        });
    }
}

closeBtn.onclick = () => modal.style.display = "none";
modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

// ---------- NAV ----------
document.getElementById("prevBtn").onclick = () => {
    state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() - 1, 1);
    renderMonth();
};

document.getElementById("nextBtn").onclick = () => {
    state.viewDate = new Date(state.viewDate.getFullYear(), state.viewDate.getMonth() + 1, 1);
    renderMonth();
};

document.getElementById("todayBtn").onclick = () => {
    state.viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    renderMonth();
};

// ---------- INIT ----------
renderMonth();

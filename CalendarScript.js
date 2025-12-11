// Helper
function pad(n) { return n < 10 ? "0" + n : n; }
function keyOf(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// State
const today = new Date();
let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
let selected = null;

// Elements
const grid = document.getElementById("calendarGrid");
const titleEl = document.getElementById("monthTitle");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalList = document.getElementById("modalList");

// CMS Events container
let events = {}; // will be filled from Wix via postMessage

// Listen for messages from Wix
window.addEventListener("message", (event) => {
    if (event.data.type === "loadEvents") {
        events = {};
        event.data.data.forEach(ev => {
            if (!ev.date) return; // skip invalid dates

            // Convert date to YYYY-MM-DD string to match calendar keys
            let dateStr;
            if (ev.date instanceof Date) {
                dateStr = keyOf(ev.date);
            } else {
                // parse string from Wix CMS (ISO)
                const dt = new Date(ev.date);
                dateStr = keyOf(dt);
            }

            if (!events[dateStr]) events[dateStr] = [];
            events[dateStr].push({
                title: ev.title || ev.eventName,
                start: ev.start || ev.eventTime || "All Day",
                end: ev.end || "",
                color: ev.color || "#007aff",
                description: ev.description || ""
            });
        });
        render(); // update calendar
    }
});

// Render Calendar
function render() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    titleEl.textContent = `${viewDate.toLocaleString("default", { month: "long" })} ${year}`;
    grid.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    let dayNum = 1 - firstDay;

    for (let i = 0; i < totalCells; i++) {
        const d = new Date(year, month, dayNum);
        const cellKey = keyOf(d);

        const div = document.createElement("div");
        div.className = "day";
        div.dataset.date = cellKey;

        if (d.getMonth() !== month) div.classList.add("inactive");
        if (cellKey === keyOf(today)) div.classList.add("today");
        if (cellKey === selected) div.classList.add("selected");

        // Number
        const num = document.createElement("div");
        num.className = "date-num";
        num.textContent = d.getDate();
        div.appendChild(num);

        // Event dots
        if (events[cellKey]) {
            const dots = document.createElement("div");
            dots.className = "events-dots";

            events[cellKey].slice(0, 3).forEach(ev => {
                const dot = document.createElement("div");
                dot.className = "dot";
                dot.style.background = ev.color;
                dots.appendChild(dot);
            });

            div.appendChild(dots);
        }

        // Click
        div.addEventListener("click", () => {
            selected = cellKey;
            openModal(d, events[cellKey] || []);
            render();
        });

        grid.appendChild(div);
        dayNum++;
    }
}

// Modal
function openModal(date, eventList) {
    modal.style.display = "flex";

    modalTitle.textContent = date.toLocaleDateString("default", {
        weekday: "long", month: "long", day: "numeric", year: "numeric"
    });

    modalSubtitle.textContent = eventList.length
        ? `${eventList.length} event(s)`
        : "No events";

    modalList.innerHTML = "";

    if (eventList.length === 0) {
        modalList.innerHTML = `<div style="color:gray; padding:10px;">No events.</div>`;
    } else {
        eventList.forEach(ev => {
            const item = document.createElement("div");
            item.className = "event-item";

            item.innerHTML = `
                <div class="event-color" style="background:${ev.color}"></div>
                <div>
                  <div><strong>${ev.title}</strong></div>
                  <div style="color:gray; font-size:13px;">${ev.start} ${ev.end ? "— " + ev.end : ""}</div>
                </div>
            `;

            modalList.appendChild(item);
        });
    }
}

// Close modal
document.getElementById("closeModal").onclick = () => {
    modal.style.display = "none";
};

// Background click closes modal
modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = "none";
};

// Navigation
document.getElementById("prevBtn").onclick = () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    render();
};

document.getElementById("nextBtn").onclick = () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    render();
};

document.getElementById("todayBtn").onclick = () => {
    viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    render();
};

// Init
render();

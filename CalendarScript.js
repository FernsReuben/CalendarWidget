// ---------- CONFIG ----------
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbygujd5GDJuiqNRQ5vK09XBvaiS46G6WMw9V5gSWCW6NlLWSpl36sdPkTrBSN_wIFTGfg/exec";

// ---------- HELPERS ----------
function pad(n) { return n < 10 ? "0" + n : n; }
function key(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }
function monthName(m) { return new Date(2020, m, 1).toLocaleString("default", { month: "long" }); }

function showLoading() { loadingScreen.classList.remove("hidden"); }
function hideLoading() { loadingScreen.classList.add("hidden"); }

// ---------- STATE ----------
const today = new Date();
const state = {
    viewDate: new Date(today.getFullYear(), today.getMonth(), 1),
    selectedDate: null,
    events: null,
    loading: false
};

// ---------- DOM ----------
const grid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");
const loadingScreen = document.getElementById("calendarLoading");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalList = document.getElementById("modalList");
const closeBtn = document.getElementById("closeModal");

// ---------- FETCH EVENTS (ONCE) ----------
async function fetchEventsSecure() {
    if (state.events || state.loading) return;

    state.loading = true;
    showLoading();

    try {
        const tokenRes = await fetch(`${SCRIPT_URL}?action=token`);
        if (!tokenRes.ok) throw new Error("Token fetch failed");
        const { token } = await tokenRes.json();

        const eventsRes = await fetch(`${SCRIPT_URL}?token=${encodeURIComponent(token)}`);
        if (!eventsRes.ok) throw new Error("Events fetch failed");

        state.events = await eventsRes.json();
    } catch (err) {
        console.error("Event fetch error:", err);
        state.events = {};
    } finally {
        state.loading = false;
        // Fade out loader after 250ms
        setTimeout(hideLoading, 250);
    }
}

// ---------- RENDER MONTH ----------
function renderMonth() {
    if (!state.events) return;

    grid.innerHTML = "";

    const y = state.viewDate.getFullYear();
    const m = state.viewDate.getMonth();
    monthTitle.textContent = `${monthName(m)} ${y}`;

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    const frag = document.createDocumentFragment();
    let dayNum = 1 - firstDay;

    for (let i = 0; i < totalCells; i++, dayNum++) {
        const d = new Date(y, m, dayNum);
        const dy = d.getFullYear();
        const dm = d.getMonth();
        const dd = d.getDate();
        const k = key(dy, dm + 1, dd);

        const events = state.events[k] || [];
        const isCurrent = dm === m;

        const el = document.createElement("div");
        el.className = "day" + (isCurrent ? "" : " inactive");
        el.dataset.date = k;

        if (k === key(today.getFullYear(), today.getMonth() + 1, today.getDate())) el.classList.add("today");
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
                dot.style.background = ev.color || "#007aff";
                dots.appendChild(dot);
            });
            el.appendChild(dots);
        }

        frag.appendChild(el);
    }

    grid.appendChild(frag);
}

// ---------- EVENT DELEGATION (ONE LISTENER) ----------
grid.addEventListener("click", e => {
    const cell = e.target.closest(".day");
    if (!cell || cell.classList.contains("inactive")) return;

    const dateKey = cell.dataset.date; // "YYYY-MM-DD"
    const [y, m, d] = dateKey.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d); // local date, no timezone shift
    const events = state.events?.[dateKey] || [];

    openModal(dateKey, dateObj, events);
});

// ---------- MODAL ----------
function openModal(dateKey, dateObj, events) {
    state.selectedDate = dateKey;
    modal.style.display = "flex";
    modalTitle.textContent = dateObj.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    modalSubtitle.textContent = events.length ? `${events.length} event(s)` : "No events";

    modalList.innerHTML = "";
    if (!events.length) {
        const empty = document.createElement("div");
        empty.textContent = "No events for this day.";
        empty.style.color = "var(--muted)";
        empty.style.padding = "12px";
        modalList.appendChild(empty);
        return;
    }

    events.forEach(ev => {
        const item = document.createElement("div");
        item.className = "event-item";

        const color = document.createElement("div");
        color.className = "event-color";
        color.style.background = ev.color || "#007aff";

        const body = document.createElement("div");
        const title = document.createElement("div");
        title.style.fontWeight = "700";
        title.textContent = ev.title;

        const time = document.createElement("div");
        time.className = "event-time";
        time.textContent = ev.start ? `${ev.start} – ${ev.end}` : "All day";

        body.append(title, time);
        item.append(color, body);
        modalList.appendChild(item);
    });
}

closeBtn.onclick = () => (modal.style.display = "none");
modal.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

// ---------- NAV ----------
document.getElementById("prevBtn").onclick = () => { state.viewDate.setMonth(state.viewDate.getMonth() - 1); renderMonth(); };
document.getElementById("nextBtn").onclick = () => { state.viewDate.setMonth(state.viewDate.getMonth() + 1); renderMonth(); };
document.getElementById("todayBtn").onclick = () => { state.viewDate = new Date(today.getFullYear(), today.getMonth(), 1); renderMonth(); };

// ---------- INIT ----------
(async function init() {
    showLoading();
    await fetchEventsSecure();
    renderMonth();
})();

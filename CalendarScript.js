// CalendarScript.js
import { getCalendarEvents } from 'backend/events.web.js';

let currentDate = new Date();
let events = {};

document.addEventListener("DOMContentLoaded", async () => {
    events = await getCalendarEvents();
    renderCalendar();
});

const monthLabel = document.getElementById("monthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

function renderCalendar() {
    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthLabel.textContent = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric"
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) {
        const cell = document.createElement("div");
        cell.classList.add("calendar-day", "empty");
        calendarGrid.appendChild(cell);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const cell = document.createElement("div");
        cell.classList.add("calendar-day");

        if (isToday(year, month, day)) cell.classList.add("today");

        const num = document.createElement("div");
        num.classList.add("day-number");
        num.textContent = day;
        cell.appendChild(num);

        if (events[dateKey]) {
            const dots = document.createElement("div");
            dots.classList.add("event-container");

            events[dateKey].forEach(ev => {
                const dot = document.createElement("div");
                dot.classList.add("event-dot");
                dot.style.backgroundColor = ev.color;
                dot.title = `${ev.title} — ${ev.start}–${ev.end}`;
                dots.appendChild(dot);
            });

            cell.appendChild(dots);
        }

        calendarGrid.appendChild(cell);
    }
}

prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

function isToday(y, m, d) {
    const t = new Date();
    return d === t.getDate() && m === t.getMonth() && y === t.getFullYear();
}

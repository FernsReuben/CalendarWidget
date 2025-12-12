// CalendarScript.js
import { getCalendarEvents } from 'backend/events.web.js';

// State
let currentDate = new Date();
let events = {};

// DOM references
const monthTitle = document.getElementById("monthTitle");
const calendarGrid = document.getElementById("calendarGrid");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const todayBtn = document.getElementById("todayBtn");

// Load events from CMS and render calendar
document.addEventListener("DOMContentLoaded", async () => {
    try {
        events = await getCalendarEvents();
        console.log("CMS Events Loaded:", events);
        renderCalendar();
    } catch (err) {
        console.error("Error loading calendar events:", err);
    }
});

// ========================
// CALENDAR RENDERING LOGIC
// ========================

function renderCalendar() {
    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthTitle.textContent = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric"
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const paddingDays = firstDay.getDay();

    // Add blank cells at start
    for (let i = 0; i < paddingDays; i++) {
        const blank = document.createElement("div");
        blank.classList.add("day-cell", "empty");
        calendarGrid.appendChild(blank);
    }

    // Add actual days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dateKey = formatDate(year, month, day);

        const dayCell = document.createElement("div");
        dayCell.classList.add("day-cell");

        // Highlight today
        if (isToday(year, month, day)) {
            dayCell.classList.add("today");
        }

        // Day number
        const number = document.createElement("div");
        number.classList.add("day-number");
        number.textContent = day;
        dayCell.appendChild(number);

        // Event dots
        if (events[dateKey]) {
            const dotRow = document.createElement("div");
            dotRow.classList.add("event-dots");

            events[dateKey].forEach(event => {
                const dot = document.createElement("div");
                dot.classList.add("event-dot");
                dot.style.background = event.color || "var(--accent)";
                dotRow.appendChild(dot);
            });

            dayCell.appendChild(dotRow);
        }

        calendarGrid.appendChild(dayCell);
    }
}

// ========================
// NAVIGATION
// ========================

prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

todayBtn.addEventListener("click", () => {
    currentDate = new Date();
    renderCalendar();
});

// ========================
// UTILITIES
// ========================

function formatDate(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isToday(y, m, d) {
    const today = new Date();
    return (
        y === today.getFullYear() &&
        m === today.getMonth() &&
        d === today.getDate()
    );
}

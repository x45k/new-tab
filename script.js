document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.location.href = searchUrl;
    }
});

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    document.getElementById('clock').textContent = timeString;
}
setInterval(updateClock, 1000);
updateClock();

let isEditing = false;

function makeDraggable(widget) {
    let isDragging = false;
    let offsetX, offsetY;
    const header = widget.querySelector('.widget-header');
    if (!header) return;

    header.addEventListener('mousedown', (e) => {
        if (!isEditing) return;
        isDragging = true;
        offsetX = e.clientX - widget.getBoundingClientRect().left;
        offsetY = e.clientY - widget.getBoundingClientRect().top;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && isEditing) {
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;
            newLeft = Math.min(window.innerWidth - widget.offsetWidth, Math.max(0, newLeft));
            newTop = Math.min(window.innerHeight - widget.offsetHeight, Math.max(0, newTop));
            widget.style.left = `${newLeft}px`;
            widget.style.top = `${newTop}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function saveWidgetPositions() {
    const widgets = document.querySelectorAll('#widgets-container .widget');
    const positions = [];
    widgets.forEach(widget => {
        positions.push({
            id: widget.id,
            top: widget.style.top,
            left: widget.style.left
        });
    });
    localStorage.setItem('widgetPositions', JSON.stringify(positions));
}

function loadWidgetPositions() {
    const savedPositions = JSON.parse(localStorage.getItem('widgetPositions')) || [];
    savedPositions.forEach(pos => {
        const widget = document.getElementById(pos.id);
        if (widget && widget.parentElement?.id === 'widgets-container') {
            if (pos.top) widget.style.top = pos.top;
            if (pos.left) widget.style.left = pos.left;
        }
    });
}

document.querySelectorAll('.widget').forEach(widget => {
    makeDraggable(widget);
});

const widgetsContainer = document.getElementById('widgets-container');
const hiddenWidgetsContainer = document.getElementById('hidden-widgets-container');
const editWidgetsBtn = document.getElementById('edit-widgets-btn');

function createToggleButton(widget) {
    const button = document.createElement('button');
    button.className = 'toggle-widget-btn';
    const isVisible = widgetsContainer.contains(widget);
    button.innerHTML = isVisible ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    button.title = isVisible ? 'Hide widget' : 'Show widget';
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWidgetVisibility(widget);
    });
    return button;
}

function updateToggleButtons() {
    const widgets = document.querySelectorAll('.widget');
    widgets.forEach(widget => {
        const header = widget.querySelector('.widget-header');
        let existingBtn = widget.querySelector('.toggle-widget-btn');
        if (isEditing) {
            if (!existingBtn) {
                const btn = createToggleButton(widget);
                header.appendChild(btn);
            } else {
                const isVisible = widgetsContainer.contains(widget);
                existingBtn.innerHTML = isVisible ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
                existingBtn.title = isVisible ? 'Hide widget' : 'Show widget';
            }
        } else {
            if (existingBtn) existingBtn.remove();
        }
    });
}

function toggleWidgetVisibility(widget) {
    const isVisible = widgetsContainer.contains(widget);
    if (isVisible) {
        hiddenWidgetsContainer.appendChild(widget);
        localStorage.setItem(widget.id, 'hidden');
    } else {
        widgetsContainer.appendChild(widget);
        localStorage.setItem(widget.id, 'visible');
        const savedPos = JSON.parse(localStorage.getItem('widgetPositions') || '[]').find(p => p.id === widget.id);
        if (savedPos) {
            widget.style.top = savedPos.top || 'auto';
            widget.style.left = savedPos.left || 'auto';
        } else {
            widget.style.top = '80px';
            widget.style.left = '30px';
        }
    }
    updateToggleButtons();
    if (!isEditing) {
        saveWidgetPositions();
    }
}

function loadWidgetStates() {
    const allWidgets = Array.from(document.querySelectorAll('.widget'));
    allWidgets.forEach(widget => {
        const state = localStorage.getItem(widget.id);
        if (state === 'hidden') {
            hiddenWidgetsContainer.appendChild(widget);
        } else {
            widgetsContainer.appendChild(widget);
        }
    });
    const visibleWidgets = Array.from(widgetsContainer.children).filter(c => c.classList.contains('widget'));
    if (visibleWidgets.length) {
        visibleWidgets.forEach((w, idx) => {
            if (!w.style.top && !w.style.left) {
                w.style.top = `${40 + idx * 70}px`;
                w.style.left = `${20 + idx * 30}px`;
            }
        });
    }
}

editWidgetsBtn.addEventListener('click', function () {
    isEditing = !isEditing;
    document.body.classList.toggle('editing', isEditing);
    if (!isEditing) {
        saveWidgetPositions();
        hiddenWidgetsContainer.classList.remove('visible');
    } else {
        hiddenWidgetsContainer.classList.add('visible');
    }
    updateToggleButtons();
});

const themePanel = document.getElementById('theme-panel');
const gearIcon = document.getElementById('gear-icon');
const closeThemeBtn = document.getElementById('close-btn');

gearIcon.addEventListener('click', () => {
    themePanel.classList.toggle('open');
});
closeThemeBtn.addEventListener('click', () => {
    themePanel.classList.remove('open');
});

function changeTheme(theme) {
    let backgroundImage = '';
    switch (theme) {
        case 'sunset':
            backgroundImage = 'url(https://images.unsplash.com/photo-1737304697097-62a820f71964?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
            break;
        case 'snow':
            backgroundImage = 'url(https://images.unsplash.com/photo-1739323006029-2d8452a47df6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
            break;
        case 'city':
            backgroundImage = 'url(https://images.unsplash.com/photo-1739382120673-54ec4d63dc62?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
            break;
        default:
            backgroundImage = 'url(https://images.unsplash.com/photo-1739477021967-e14dc3938e56?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)';
            break;
    }
    document.body.style.backgroundImage = backgroundImage;
}

document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', function () {
        const theme = this.getAttribute('data-theme');
        changeTheme(theme);
        localStorage.setItem('selectedTheme', theme);
        themePanel.classList.remove('open');
    });
});

window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) changeTheme(savedTheme);
    loadWidgetStates();
    loadWidgetPositions();
    updateToggleButtons();
});

async function getIP() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}
async function getLocation(ip) {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return {
        city: data.city || 'Unknown',
        latitude: data.latitude,
        longitude: data.longitude
    };
}
async function getWeather(latitude, longitude) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    const data = await response.json();
    return data.current_weather.temperature;
}
async function updateWeatherWidget() {
    const tempElem = document.getElementById('temperature');
    if (!tempElem) return;
    try {
        const ip = await getIP();
        const location = await getLocation(ip);
        if (!location.latitude || !location.longitude) throw new Error('Location failed');
        const tempC = await getWeather(location.latitude, location.longitude);
        const tempF = (tempC * 9/5) + 32;
        tempElem.textContent = `${location.city}: ${tempF.toFixed(1)}°F (${tempC.toFixed(1)}°C)`;
    } catch (error) {
        console.warn('Weather error:', error);
        tempElem.textContent = 'Weather unavailable';
    }
}
updateWeatherWidget();
setInterval(updateWeatherWidget, 600000);

const browserSettingsBtn = document.getElementById('browser-settings-btn');
if (browserSettingsBtn) {
    browserSettingsBtn.addEventListener('click', () => {
        window.location.href = 'bb://settings';
    });
}
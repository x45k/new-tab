function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    document.getElementById('clock').textContent = timeString;
}

setInterval(updateClock, 1000);
updateClock(); // Initial call

let isEditing = false;

document.getElementById('edit-widgets-btn').addEventListener('click', function () {
    isEditing = !isEditing;
    document.body.classList.toggle('editing', isEditing);

    if (!isEditing) {
        // Save widget positions to localStorage
        const widgets = document.querySelectorAll('.widget');
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
});

function makeDraggable(widget) {
    let isDragging = false;
    let offsetX, offsetY;

    widget.querySelector('.widget-header').addEventListener('mousedown', (e) => {
        if (!isEditing) return;
        isDragging = true;
        offsetX = e.clientX - widget.getBoundingClientRect().left;
        offsetY = e.clientY - widget.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && isEditing) {
            widget.style.left = `${e.clientX - offsetX}px`;
            widget.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function loadWidgetPositions() {
    const savedPositions = JSON.parse(localStorage.getItem('widgetPositions')) || [];
    savedPositions.forEach(pos => {
        const widget = document.getElementById(pos.id);
        if (widget) {
            widget.style.top = pos.top;
            widget.style.left = pos.left;
        }
    });
}

document.querySelectorAll('.widget').forEach(widget => {
    makeDraggable(widget);
});

loadWidgetPositions();

document.getElementById('gear-icon').addEventListener('click', function () {
    document.getElementById('theme-panel').classList.toggle('open');
});

document.getElementById('close-btn').addEventListener('click', function () {
    document.getElementById('theme-panel').classList.remove('open');
});

document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', function () {
        const theme = this.getAttribute('data-theme');
        changeTheme(theme);
        localStorage.setItem('selectedTheme', theme);
    });
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

window.addEventListener('load', function () {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        changeTheme(savedTheme);
    }
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
        city: data.city,
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
    try {
        const ip = await getIP();
        const location = await getLocation(ip);
        const temperature = await getWeather(location.latitude, location.longitude);
        document.getElementById('temperature').textContent = `Temperature for ${location.city}: ${(temperature * 1.8) + 32}°F (${temperature}°C)`;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        document.getElementById('temperature').textContent = 'Failed to load temperature';
    }
}

updateWeatherWidget();

// is this kinda useless, ig, i might remove later
setInterval(updateWeatherWidget, 600000);

document.addEventListener('DOMContentLoaded', function () {
    const widgetsContainer = document.getElementById('widgets-container');
    const hiddenWidgetsContainer = document.getElementById('hidden-widgets-container');
    const editWidgetsBtn = document.getElementById('edit-widgets-btn');
    let isEditing = false;

    function createToggleButton(widget) {
        const button = document.createElement('button');
        button.className = 'toggle-widget-btn';
        button.innerHTML = widgetsContainer.contains(widget) ? '<i class="fas fa-minus"></i>' : '<i class="fas fa-plus"></i>';
        button.addEventListener('click', () => toggleWidgetVisibility(widget));
        return button;
    }

    function updateToggleButtons() {
        const widgets = document.querySelectorAll('.widget');
        widgets.forEach(widget => {
            const header = widget.querySelector('.widget-header');
            const existingButton = widget.querySelector('.toggle-widget-btn');
            if (isEditing) {
                if (!existingButton) {
                    header.appendChild(createToggleButton(widget));
                } else {
                    existingButton.innerHTML = widgetsContainer.contains(widget) ? '<i class="fas fa-minus"></i>' : '<i class="fas fa-plus"></i>';
                }
            } else {
                if (existingButton) {
                    existingButton.remove();
                }
            }
        });
    }

    function loadWidgetStates() {
        const widgets = document.querySelectorAll('.widget');
        widgets.forEach(widget => {
            const isVisible = localStorage.getItem(widget.id) !== 'hidden';
            if (isVisible) {
                widgetsContainer.appendChild(widget);
            } else {
                hiddenWidgetsContainer.appendChild(widget);
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
        }
        updateToggleButtons();
    }

    editWidgetsBtn.addEventListener('click', function () {
        isEditing = !isEditing;
        document.body.classList.toggle('editing', isEditing);

        if (isEditing) {
            hiddenWidgetsContainer.classList.add('visible');
        } else {
            hiddenWidgetsContainer.classList.remove('visible');

            const widgets = document.querySelectorAll('.widget');
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

        updateToggleButtons();
    });

    loadWidgetStates();
    loadWidgetPositions();
    updateToggleButtons();
});
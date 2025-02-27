document.addEventListener('DOMContentLoaded', function() {
    const celsiusInput = document.getElementById('celsius');
    const fahrenheitInput = document.getElementById('fahrenheit');
    const conversionHistory = document.getElementById('conversion-history');
    const themeSwitch = document.getElementById('theme-switch');
    const currentYearElement = document.getElementById('current-year');
    const arrowIcon = document.querySelector('.arrow-icon i');
    
    // Set current year in footer
    currentYearElement.textContent = new Date().getFullYear();
    
    // Theme toggle functionality
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        themeSwitch.checked = true;
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Initialize conversion history from localStorage
    loadConversionHistory();
    
    // Convert Celsius to Fahrenheit
    celsiusInput.addEventListener('input', function() {
        if (celsiusInput.value === '') {
            fahrenheitInput.value = '';
            return;
        }
        
        const celsius = parseFloat(celsiusInput.value);
        const fahrenheit = (celsius * 9/5) + 32;
        
        // Format to max 2 decimal places, but only if needed
        fahrenheitInput.value = formatNumber(fahrenheit);
        
        // Add to conversion history
        addToHistory(celsius, fahrenheit, 'C to F');
        
        // Visual feedback - highlight result
        highlightResult(fahrenheitInput);
    });
    
    // Convert Fahrenheit to Celsius
    fahrenheitInput.addEventListener('input', function() {
        if (fahrenheitInput.value === '') {
            celsiusInput.value = '';
            return;
        }
        
        const fahrenheit = parseFloat(fahrenheitInput.value);
        const celsius = (fahrenheit - 32) * 5/9;
        
        // Format to max 2 decimal places, but only if needed
        celsiusInput.value = formatNumber(celsius);
        
        // Add to conversion history
        addToHistory(celsius, fahrenheit, 'F to C');
        
        // Visual feedback - highlight result
        highlightResult(celsiusInput);
    });
    
    // Swap values when clicking the arrow icon
    arrowIcon.addEventListener('click', function() {
        const tempCelsius = celsiusInput.value;
        const tempFahrenheit = fahrenheitInput.value;
        
        if (tempCelsius && tempFahrenheit) {
            celsiusInput.value = formatNumber(parseFloat(tempFahrenheit));
            fahrenheitInput.value = formatNumber(parseFloat(tempCelsius));
            
            // Visual feedback - rotate icon
            this.style.transform = this.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
            
            // Visual feedback - highlight both inputs
            highlightResult(celsiusInput);
            highlightResult(fahrenheitInput);
        }
    });
    
    // Format numbers for display
    function formatNumber(number) {
        return number.toFixed(2).replace(/\.?0+$/, '');
    }
    
    // Add conversion to history
    function addToHistory(celsius, fahrenheit, direction) {
        const historyItem = {
            celsius: formatNumber(celsius),
            fahrenheit: formatNumber(fahrenheit),
            direction: direction,
            timestamp: new Date().getTime()
        };
        
        let history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
        history.unshift(historyItem);
        
        // Keep only the last 10 conversions
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        localStorage.setItem('conversionHistory', JSON.stringify(history));
        updateHistoryDisplay();
    }
    
    // Load conversion history from localStorage
    function loadConversionHistory() {
        const history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
        updateHistoryDisplay(history);
    }
    
    // Update the history display in the UI
    function updateHistoryDisplay() {
        const history = JSON.parse(localStorage.getItem('conversionHistory')) || [];
        conversionHistory.innerHTML = '';
        
        history.forEach(item => {
            const listItem = document.createElement('li');
            
            if (item.direction === 'C to F') {
                listItem.innerHTML = `
                    <span>${item.celsius}°C → ${item.fahrenheit}°F</span>
                    <small>${formatTimestamp(item.timestamp)}</small>
                `;
            } else {
                listItem.innerHTML = `
                    <span>${item.fahrenheit}°F → ${item.celsius}°C</span>
                    <small>${formatTimestamp(item.timestamp)}</small>
                `;
            }
            
            conversionHistory.appendChild(listItem);
        });
        
        // If no history, show message
        if (history.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'No conversions yet';
            emptyMessage.style.textAlign = 'center';
            conversionHistory.appendChild(emptyMessage);
        }
    }
    
    // Format timestamp to relative time (e.g., "2 minutes ago")
    function formatTimestamp(timestamp) {
        const now = new Date().getTime();
        const diff = now - timestamp;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (seconds < 60) {
            return 'Just now';
        } else if (minutes < 60) {
            return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const date = new Date(timestamp);
            return date.toLocaleDateString();
        }
    }
    
    // Visual feedback for result changes
    function highlightResult(element) {
        element.style.backgroundColor = 'rgba(58, 134, 255, 0.1)';
        setTimeout(() => {
            element.style.backgroundColor = '';
        }, 500);
    }
    
    // Initial default values
    celsiusInput.value = '0';
    fahrenheitInput.value = '32';
}); 
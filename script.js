document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const tempSlider = document.getElementById('temp-slider');
    const celsiusValue = document.getElementById('celsius-value');
    const fahrenheitValue = document.getElementById('fahrenheit-value');
    const temperatureOrb = document.querySelector('.temperature-orb');
    const temperatureValue = document.querySelector('.temperature-value');
    const sliderFill = document.querySelector('.slider-fill');
    const scaleBtns = document.querySelectorAll('.scale-btn');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const factDisplay = document.getElementById('fact-display');
    const ambientGradient = document.querySelector('.ambient-gradient');
    let currentScale = 'celsius';
    
    // Temperature facts
    const tempFacts = {
        '-273.15': 'You\'ve reached absolute zero, the lowest possible temperature in the universe!',
        '-78.5': 'At -78.5°C, carbon dioxide transitions directly from gas to solid (dry ice).',
        '-40': 'This is where Celsius and Fahrenheit scales intersect: -40°C equals -40°F.',
        '-18': 'Standard freezer temperature (-18°C / 0°F).',
        '0': 'At 0°C / 32°F, water freezes.',
        '20': 'Around 20°C / 68°F is considered room temperature.',
        '21': 'The perfect indoor temperature according to many HVAC experts.',
        '37': 'The normal human body temperature is 37°C / 98.6°F.',
        '40': 'Heat wave! This is considered dangerous heat for humans.',
        '100': 'At 100°C / 212°F, water boils (at sea level).',
        '1083': 'Copper melts at 1083°C / 1981°F.',
        '1538': 'Iron melts at 1538°C / 2800°F.',
        '5505': 'The surface of the sun is about 5505°C / 9941°F!'
    };
    
    // Initialize
    updateVisuals(0);
    
    // Slider input event
    tempSlider.addEventListener('input', function() {
        const celsiusTemp = parseInt(this.value);
        updateTemperature(celsiusTemp);
    });
    
    // Scale toggle
    scaleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            scaleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentScale = this.dataset.scale;
            
            const currentTemp = parseFloat(celsiusValue.textContent);
            temperatureValue.textContent = currentScale === 'celsius' ? 
                formatNumber(currentTemp) : 
                formatNumber(celsiusToFahrenheit(currentTemp));
                
            updateSliderFill();
        });
    });
    
    // Preset buttons
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const presetTemp = parseInt(this.dataset.temp);
            tempSlider.value = presetTemp;
            updateTemperature(presetTemp);
        });
    });
    
    // Temperature orb click - toggle scale
    temperatureOrb.addEventListener('click', function() {
        const newScale = currentScale === 'celsius' ? 'fahrenheit' : 'celsius';
        
        // Animate the orb
        temperatureOrb.style.transform = 'translate(-50%, -50%) scale(0.9)';
        setTimeout(() => {
            temperatureOrb.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 150);
        
        // Update the active scale button
        scaleBtns.forEach(btn => {
            if (btn.dataset.scale === newScale) {
                btn.click();
            }
        });
    });
    
    // Update temperature displays and visuals
    function updateTemperature(celsiusTemp) {
        const fahrenheitTemp = celsiusToFahrenheit(celsiusTemp);
        
        // Update text displays
        celsiusValue.textContent = formatNumber(celsiusTemp);
        fahrenheitValue.textContent = formatNumber(fahrenheitTemp);
        
        // Update main temperature display
        temperatureValue.textContent = currentScale === 'celsius' ? 
            formatNumber(celsiusTemp) : 
            formatNumber(fahrenheitTemp);
        
        // Update slider fill
        updateSliderFill();
        
        // Update visuals based on temperature
        updateVisuals(celsiusTemp);
        
        // Update fact display
        updateFact(celsiusTemp);
    }
    
    function updateVisuals(celsiusTemp) {
        // Determine color based on temperature
        let r, g, b;
        
        if (celsiusTemp <= 0) {
            // Cold: Blue to Purple
            const factor = Math.min(1, Math.abs(celsiusTemp) / 50);
            r = Math.round(126 * (1 - factor));
            g = Math.round(87 * (1 - factor) + 198 * factor);
            b = Math.round(194 * (1 - factor) + 255 * factor);
        } else {
            // Hot: Purple to Red
            const factor = Math.min(1, celsiusTemp / 50);
            r = Math.round(126 * (1 - factor) + 255 * factor);
            g = Math.round(87 * (1 - factor) + 60 * factor);
            b = Math.round(194 * (1 - factor));
        }
        
        const color = `rgb(${r}, ${g}, ${b})`;
        const gradient = `linear-gradient(135deg, rgb(${r}, ${g}, ${b}) 0%, rgb(${r*0.7}, ${g*0.7}, ${b*0.7}) 100%)`;
        const glow = `0 0 30px rgba(${r}, ${g}, ${b}, 0.5)`;
        
        // Update temperature orb
        temperatureOrb.style.background = gradient;
        temperatureOrb.style.boxShadow = glow;
        
        // Update slider fill color
        sliderFill.style.background = gradient;
        
        // Update slider thumb color (using CSS variables)
        document.documentElement.style.setProperty('--neutral-color', color);
        
        // Update ambient gradient
        ambientGradient.style.background = `radial-gradient(circle at center, rgba(${r}, ${g}, ${b}, 0.15) 0%, transparent 50%)`;
        
        // Adjust ice and sun objects based on temperature
        const iceFactor = Math.max(0, 1 - celsiusTemp / 50);
        const sunFactor = Math.max(0, celsiusTemp / 50);
        
        document.querySelector('.ice-object').style.opacity = 0.5 + iceFactor * 0.5;
        document.querySelector('.ice-object').style.transform = `scale(${0.8 + iceFactor * 0.4})`;
        
        document.querySelector('.sun-object').style.opacity = 0.5 + sunFactor * 0.5;
        document.querySelector('.sun-object').style.transform = `scale(${0.8 + sunFactor * 0.4})`;
    }
    
    function updateSliderFill() {
        // Calculate percentage of slider filled
        const min = parseInt(tempSlider.min);
        const max = parseInt(tempSlider.max);
        const val = parseInt(tempSlider.value);
        const percentage = ((val - min) * 100) / (max - min);
        
        sliderFill.style.width = percentage + '%';
    }
    
    function updateFact(celsiusTemp) {
        // Find the closest temperature fact
        let closestTemp = null;
        let closestDiff = Infinity;
        
        for (const temp in tempFacts) {
            const diff = Math.abs(celsiusTemp - parseFloat(temp));
            if (diff < closestDiff) {
                closestDiff = diff;
                closestTemp = temp;
            }
        }
        
        // Only show fact if we're within 5 degrees
        if (closestDiff <= 5) {
            factDisplay.innerHTML = `<span>${tempFacts[closestTemp]}</span>`;
            factDisplay.style.opacity = 1 - (closestDiff / 5) * 0.7;
        } else {
            factDisplay.style.opacity = 0.3;
            
            // Show a generic message based on temperature
            if (celsiusTemp < -50) {
                factDisplay.innerHTML = "<span>Extreme cold! Most life forms cannot survive these temperatures.</span>";
            } else if (celsiusTemp < 0) {
                factDisplay.innerHTML = "<span>Below freezing. Water forms ice at these temperatures.</span>";
            } else if (celsiusTemp < 15) {
                factDisplay.innerHTML = "<span>Cool temperatures. You might need a jacket.</span>";
            } else if (celsiusTemp < 25) {
                factDisplay.innerHTML = "<span>Comfortable temperature range for most people.</span>";
            } else if (celsiusTemp < 35) {
                factDisplay.innerHTML = "<span>Warm temperatures. Summer weather in many places.</span>";
            } else if (celsiusTemp < 50) {
                factDisplay.innerHTML = "<span>Hot temperatures. Stay hydrated!</span>";
            } else {
                factDisplay.innerHTML = "<span>Extreme heat! These temperatures are dangerous for humans.</span>";
            }
        }
    }
    
    // Utility functions
    function celsiusToFahrenheit(celsius) {
        return (celsius * 9/5) + 32;
    }
    
    function fahrenheitToCelsius(fahrenheit) {
        return (fahrenheit - 32) * 5/9;
    }
    
    function formatNumber(number) {
        return Math.round(number * 10) / 10;
    }
}); 
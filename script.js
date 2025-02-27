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
        // Update temperature displays
        celsiusValue.textContent = formatNumber(celsiusTemp);
        fahrenheitValue.textContent = formatNumber(celsiusToFahrenheit(celsiusTemp));
        
        // Update the central temperature display
        temperatureValue.textContent = currentScale === 'celsius' ? 
            formatNumber(celsiusTemp) : 
            formatNumber(celsiusToFahrenheit(celsiusTemp));
        
        // Position sun and ice objects based on temperature
        const orbitSystem = document.querySelector('.orbit-system');
        const sunObject = document.querySelector('.sun-object');
        const iceObject = document.querySelector('.ice-object');
        const connectorLine = document.querySelector('.connector-line');
        
        // Calculate positions (more extreme temperature = objects move further apart)
        const baseAngle = 90; // degrees
        const tempFactor = Math.min(Math.abs(celsiusTemp) / 50, 1); // 0 to 1 based on temperature
        const angleOffset = baseAngle * tempFactor;
        
        const angle1 = celsiusTemp >= 0 ? baseAngle - angleOffset : baseAngle + angleOffset;
        const angle2 = celsiusTemp >= 0 ? baseAngle + angleOffset : baseAngle - angleOffset;
        
        const radius = orbitSystem.offsetWidth / 2.5;
        
        // Position objects
        const x1 = radius * Math.cos(angle1 * Math.PI / 180);
        const y1 = radius * Math.sin(angle1 * Math.PI / 180);
        sunObject.style.transform = `translate(${x1}px, ${y1}px)`;
        
        const x2 = radius * Math.cos(angle2 * Math.PI / 180);
        const y2 = radius * Math.sin(angle2 * Math.PI / 180);
        iceObject.style.transform = `translate(${x2}px, ${y2}px)`;
        
        // Update orb color based on temperature
        let color, glow;
        if (celsiusTemp < -20) {
            color = 'var(--cold-color)';
            glow = 'var(--frost-glow)';
            temperatureOrb.style.background = 'var(--frost-gradient)';
        } else if (celsiusTemp > 40) {
            color = 'var(--hot-color)';
            glow = 'var(--heat-glow)';
            temperatureOrb.style.background = 'var(--heat-gradient)';
        } else {
            // Linear interpolation between cold and hot
            const t = (celsiusTemp + 20) / 60; // 0 at -20°C, 1 at 40°C
            temperatureOrb.style.background = `linear-gradient(135deg, 
                hsl(${195 - t * 195}, ${100 - t * 0}%, ${50 + t * 20}%) 0%, 
                hsl(${210 - t * 210}, ${100 - t * 0}%, ${30 + t * 40}%) 100%)`;
            color = `hsl(${195 - t * 160}, 100%, ${50 + t * 15}%)`;
            
            const coldOpacity = Math.max(0, 1 - t * 2);
            const hotOpacity = Math.max(0, t * 2 - 1);
            glow = `0 0 30px rgba(0, 198, 255, ${coldOpacity}), 0 0 30px rgba(255, 60, 0, ${hotOpacity})`;
        }
        
        // Set ambient gradient color based on temperature
        ambientGradient.style.background = celsiusTemp < 0 ? 
            `radial-gradient(circle, transparent 30%, rgba(0, 98, 255, ${Math.min(Math.abs(celsiusTemp) / 100, 0.15)}))` : 
            `radial-gradient(circle, transparent 30%, rgba(255, 60, 0, ${Math.min(Math.abs(celsiusTemp) / 100, 0.15)}))`;
        
        // Update slider fill
        updateSliderFill();
        
        // Update fact display
        updateFact(celsiusTemp);
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

    // Add after the DOM content loaded event listener but before any other code
    function createParticles() {
        const particlesContainer = document.querySelector('.ambient-particles');
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random positioning and size
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.width = `${Math.random() * 3 + 1}px`;
            particle.style.height = particle.style.width;
            
            // Random animation duration and delay
            particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
            particle.style.animationDelay = `${Math.random() * 5}s`;
            
            particlesContainer.appendChild(particle);
        }
    }

    // Call this function right after getting your elements
    createParticles();
}); 
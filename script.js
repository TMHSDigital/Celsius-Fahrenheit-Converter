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
        updateAmbientGlow(celsiusTemp);
        
        // Update slider fill
        updateSliderFill();
        
        // Update fact display
        updateFact(celsiusTemp);
        
        // Update the physics simulation
        physicsSimulator.updateTemperaturePhysics(celsiusTemp);
        
        // Add this line to update the visualizer
        visualizer.updateVisualizer(celsiusTemp);
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

    // Embed functionality
    const embedBtn = document.getElementById('embed-button');
    const embedModal = document.getElementById('embed-modal');
    const closeBtn = document.querySelector('.close-btn');
    const copyBtn = document.getElementById('copy-btn');
    const embedCode = document.getElementById('embed-code');
    const embedWidth = document.getElementById('embed-width');
    const embedHeight = document.getElementById('embed-height');
    const updateEmbedBtn = document.getElementById('update-embed');
    
    // Show modal when embed button is clicked
    embedBtn.addEventListener('click', function() {
        embedModal.classList.add('active');
    });
    
    // Close modal when close button is clicked
    closeBtn.addEventListener('click', function() {
        embedModal.classList.remove('active');
    });
    
    // Close modal when clicking outside content
    embedModal.addEventListener('click', function(e) {
        if (e.target === embedModal) {
            embedModal.classList.remove('active');
        }
    });
    
    // Copy embed code to clipboard
    copyBtn.addEventListener('click', function() {
        const range = document.createRange();
        range.selectNode(embedCode);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg viewBox="0 0 24 24" class="btn-icon"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg><span>Copied!</span>';
        setTimeout(function() {
            copyBtn.innerHTML = originalText;
        }, 2000);
    });
    
    // Update embed code with new dimensions
    updateEmbedBtn.addEventListener('click', function() {
        const width = embedWidth.value;
        const height = embedHeight.value;
        embedCode.textContent = `<iframe src="https://tmhsdigital.github.io/Celsius-Fahrenheit-Converter/" width="${width}" height="${height}" frameborder="0" scrolling="no" allow="fullscreen"></iframe>`;
    });

    function enhanceBackground() {
        // Create nebula overlay
        const nebulaOverlay = document.createElement('div');
        nebulaOverlay.classList.add('nebula-overlay');
        document.body.appendChild(nebulaOverlay);
        
        // Create stars with different depths
        const numStars = window.innerWidth < 768 ? 100 : 200;
        const starTypes = ['distant', 'medium', 'close', 'special'];
        
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        starsContainer.style.position = 'fixed';
        starsContainer.style.top = '0';
        starsContainer.style.left = '0';
        starsContainer.style.width = '100%';
        starsContainer.style.height = '100%';
        starsContainer.style.zIndex = '-1';
        starsContainer.style.overflow = 'hidden';
        document.body.appendChild(starsContainer);
        
        for (let i = 0; i < numStars; i++) {
            const star = document.createElement('div');
            const type = starTypes[Math.floor(Math.random() * starTypes.length)];
            star.classList.add('star', type);
            
            // Position
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            
            // Custom animation properties
            star.style.setProperty('--base-opacity', 0.4 + Math.random() * 0.6);
            star.style.setProperty('--twinkle-duration', `${3 + Math.random() * 7}s`);
            star.style.setProperty('--drift-duration', `${50 + Math.random() * 100}s`);
            star.style.setProperty('--drift-distance', `${Math.random() * 50}px`);
            
            starsContainer.appendChild(star);
        }
    }

    function updateAmbientGlow(temperature) {
        const ambientGradient = document.querySelector('.ambient-gradient');
        
        if (temperature < 0) {
            // Cold
            const intensity = Math.min(Math.abs(temperature) / 100, 1) * 0.15;
            ambientGradient.style.background = `radial-gradient(
                circle at 50% 50%,
                rgba(0, 136, 255, ${intensity}) 0%,
                rgba(6, 8, 15, 0) 70%
            )`;
        } else if (temperature > 0) {
            // Hot
            const intensity = Math.min(temperature / 100, 1) * 0.15;
            ambientGradient.style.background = `radial-gradient(
                circle at 50% 50%,
                rgba(255, 69, 0, ${intensity}) 0%,
                rgba(6, 8, 15, 0) 70%
            )`;
        } else {
            // Neutral
            ambientGradient.style.background = `radial-gradient(
                circle at 50% 50%,
                rgba(138, 103, 216, 0.05) 0%,
                rgba(6, 8, 15, 0) 70%
            )`;
        }
    }

    // Call this in your DOMContentLoaded function
    enhanceBackground();

    // Add after enhanceBackground() function
    function initTemperaturePhysics() {
        // Create canvas for physics simulation
        const canvas = document.createElement('canvas');
        canvas.className = 'physics-canvas';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.querySelector('.cosmos-container').appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = 0, mouseY = 0;
        let currentTemp = 0;
        
        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        
        // Track mouse/touch for interactive forces
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
            }
        });
        
        class Particle {
            constructor() {
                this.reset();
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
            }
            
            reset() {
                // Position at random edge
                const edge = Math.floor(Math.random() * 4);
                if (edge === 0) { // top
                    this.x = Math.random() * canvas.width;
                    this.y = -20;
                } else if (edge === 1) { // right
                    this.x = canvas.width + 20;
                    this.y = Math.random() * canvas.height;
                } else if (edge === 2) { // bottom
                    this.x = Math.random() * canvas.width;
                    this.y = canvas.height + 20;
                } else { // left
                    this.x = -20;
                    this.y = Math.random() * canvas.height;
                }
                
                // Initial velocity based on temperature
                const speed = 0.1 + Math.abs(currentTemp) / 100 * 2;
                const angle = Math.random() * Math.PI * 2;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                
                // Other properties
                this.size = Math.random() * 3 + 1;
                this.life = 0;
                this.maxLife = 100 + Math.random() * 200;
                this.energy = Math.abs(currentTemp) / 100 + 0.2;
            }
            
            update() {
                // Apply force toward center
                const dx = canvas.width / 2 - this.x;
                const dy = canvas.height / 2 - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // Temperature affects center gravity
                const gravity = currentTemp < 0 ? 0.01 : 0.005;
                this.vx += dx / dist * gravity * this.energy;
                this.vy += dy / dist * gravity * this.energy;
                
                // Apply mouse influence if close enough
                const mdx = mouseX - this.x;
                const mdy = mouseY - this.y;
                const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                
                if (mdist < 200) {
                    // Mouse repels if cold, attracts if hot
                    const force = currentTemp > 0 ? 0.05 : -0.05;
                    this.vx += mdx / mdist * force;
                    this.vy += mdy / mdist * force;
                }
                
                // Apply drag
                this.vx *= 0.99;
                this.vy *= 0.99;
                
                // Update position
                this.x += this.vx;
                this.y += this.vy;
                
                // Reset if offscreen or life expired
                this.life++;
                if (this.life > this.maxLife || 
                    this.x < -50 || this.x > canvas.width + 50 || 
                    this.y < -50 || this.y > canvas.height + 50) {
                    this.reset();
                }
            }
            
            draw() {
                // Opacity based on life
                const opacity = 1 - (this.life / this.maxLife);
                
                // Color based on temperature
                let r, g, b;
                if (currentTemp < 0) {
                    // Cold: blue to cyan
                    r = 0;
                    g = 136 + (Math.abs(currentTemp) / 100 * 119);
                    b = 255;
                } else if (currentTemp > 0) {
                    // Hot: orange to red
                    r = 255;
                    g = Math.max(69, 180 - (currentTemp / 100 * 111));
                    b = 0;
                } else {
                    // Neutral: purple
                    r = 138;
                    g = 103;
                    b = 216;
                }
                
                // Draw with blur for glow effect
                ctx.shadowBlur = 5;
                ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity * 0.7})`;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Create particles
        function createParticles() {
            const count = window.innerWidth < 768 ? 75 : 150;
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }
        
        // Update simulation
        function updateTemperaturePhysics(temp) {
            currentTemp = temp;
            
            // Update particle behaviors based on temperature
            particles.forEach(p => {
                p.energy = Math.abs(currentTemp) / 100 + 0.2;
                if (Math.random() < 0.01) { // Occasionally reset particles
                    p.reset();
                }
            });
        }
        
        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            requestAnimationFrame(animate);
        }
        
        createParticles();
        animate();
        
        return {
            updateTemperaturePhysics
        };
    }

    // Right after enhanceBackground() call, add:
    const physicsSimulator = initTemperaturePhysics();

    function initCosmicVisualizer() {
        // Clean implementation of temperature-reactive background
        const canvas = document.createElement('canvas');
        canvas.className = 'cosmic-canvas';
        document.querySelector('.cosmos-container').prepend(canvas);
        
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let particles = [];
        let currentTemp = 0;
        
        // Handle resize properly
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            createParticles(); // Recreate particles for new dimensions
        });
        
        class Particle {
            constructor() {
                this.reset();
            }
            
            reset() {
                // Position randomly but respect screen bounds
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.3;
                this.speed = Math.random() * 0.4 + 0.1;
                
                // Set initial velocities
                this.vx = Math.random() * 0.2 - 0.1;
                this.vy = Math.random() * 0.2 - 0.1;
            }
            
            update() {
                // Temperature affects behavior
                const energy = Math.abs(currentTemp) / 50;
                
                // Cold temperature: slower, more orderly movement
                // Hot temperature: faster, more chaotic movement
                if (currentTemp < 0) {
                    this.vx += (Math.random() - 0.5) * 0.05 * energy;
                    this.vy += (Math.random() - 0.5) * 0.05 * energy;
                    
                    // Dampening for cold temps
                    this.vx *= 0.98;
                    this.vy *= 0.98;
                } else {
                    this.vx += (Math.random() - 0.5) * 0.2 * energy;
                    this.vy += (Math.random() - 0.5) * 0.2 * energy;
                }
                
                // Speed limits for stability
                const maxSpeed = 1 + (Math.abs(currentTemp) / 40);
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }
                
                // Update position
                this.x += this.vx;
                this.y += this.vy;
                
                // Wrap around screen edges
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }
            
            draw() {
                // Color based on temperature
                let r, g, b;
                if (currentTemp < 0) {
                    // Cold blue palette
                    r = 30;
                    g = 100 + Math.abs(currentTemp);
                    b = 200 + Math.abs(currentTemp) / 2;
                } else if (currentTemp > 0) {
                    // Warm orange/red palette
                    r = 200 + Math.min(currentTemp, 55);
                    g = 100 + Math.min(currentTemp / 2, 40);
                    b = 30;
                } else {
                    // Neutral purple
                    r = 130;
                    g = 90;
                    b = 200;
                }
                
                // Draw with subtle glow
                ctx.shadowBlur = 3;
                ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        function createParticles() {
            // Adjust particle count based on screen size
            const count = Math.min(Math.floor(width * height / 6000), 200);
            particles = [];
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }
        
        function animate() {
            // Use a semi-transparent clear for smooth trails
            ctx.fillStyle = 'rgba(6, 8, 15, 0.3)';
            ctx.fillRect(0, 0, width, height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            requestAnimationFrame(animate);
        }
        
        function updateVisualizer(temp) {
            currentTemp = temp;
        }
        
        createParticles();
        animate();
        
        return { updateVisualizer };
    }

    // Add this to your DOMContentLoaded handler
    const visualizer = initCosmicVisualizer();
}); 
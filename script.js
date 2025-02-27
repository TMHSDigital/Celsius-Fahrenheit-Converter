document.addEventListener('DOMContentLoaded', function() {
    const celsiusInput = document.getElementById('celsius');
    const fahrenheitInput = document.getElementById('fahrenheit');
    
    // Convert Celsius to Fahrenheit
    celsiusInput.addEventListener('input', function() {
        if (celsiusInput.value === '') {
            fahrenheitInput.value = '';
            return;
        }
        
        const celsius = parseFloat(celsiusInput.value);
        const fahrenheit = (celsius * 9/5) + 32;
        
        // Format to max 2 decimal places, but only if needed
        fahrenheitInput.value = fahrenheit.toFixed(2).replace(/\.?0+$/, '');
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
        celsiusInput.value = celsius.toFixed(2).replace(/\.?0+$/, '');
    });
}); 
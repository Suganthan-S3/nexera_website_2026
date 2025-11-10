// Wait for the entire window (images, etc.) to load, not just DOM
window.addEventListener('load', () => {
    // Add a small delay *after* window.load to be absolutely sure
    // that all browser rendering and layout is complete.
    setTimeout(initNexera, 100); 
});

/**
 * Initializes all the animations and scroll logic for the NEXERA site.
 */
function initNexera() {
    // --- 1. GET ALL NECESSARY ELEMENTS ---
    const nav = document.getElementById('main-nav');
    const heroHeader = document.querySelector('header');
    const scrollDownBtn = document.getElementById('scroll-down-btn');
    const eventsSection = document.getElementById('events');
    const mainContent = document.querySelector('.content-wrapper'); // The scrollable content

    // --- 2. ROBUSTNESS CHECK ---
    // If any core element is missing, log an error and stop.
    if (!nav || !heroHeader || !eventsSection || !mainContent) {
        console.error("NEXERA Script Error: Could not find critical elements. Animations will not run.");
        return;
    }

    // --- 3. SCRAMBLE ANIMATION LOGIC ---
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const finalWord = "NEXERA";
    const letterSpans = heroHeader.querySelectorAll('.letter');

    /**
     * Runs the scramble animation on the main "NEXERA" title.
     */
    function runScrambleAnimation() {
        // Reset text to empty before starting
        letterSpans.forEach(span => span.innerText = '');

        // Function to scramble a single letter
        let scrambleLetter = (span, index) => {
            const finalLetter = finalWord[index];
            let iteration = 0;
            const interval = setInterval(() => {
                span.innerText = letters[Math.floor(Math.random() * letters.length)];
                
                // Scramble for ~15 iterations
                if(iteration >= 15) { 
                    clearInterval(interval);
                    span.innerText = finalLetter;
                }
                iteration++;
            }, 50); // Scramble speed
        }
        
        // Trigger each letter's scramble with a staggered delay
        letterSpans.forEach((span, index) => {
            setTimeout(() => {
                scrambleLetter(span, index);
            }, index * 300); // 300ms delay between letters
        });
    }

    // --- 4. STATE AND TRANSITION FUNCTIONS ---
    let isHeroActive = true;
    let isTransitioning = false; // Prevents scroll/touch events during animation

    /**
     * Shows the hero section, hides content, and runs animation.
     */
    function showHero() {
        if (isHeroActive || isTransitioning) return;
        isTransitioning = true;
        isHeroActive = true;
        
        heroHeader.classList.remove('hero-hidden');
        heroHeader.classList.add('hero-visible'); // Triggers animations
        runScrambleAnimation(); // Re-run scramble on show
        nav.classList.remove('scrolled'); // Hide nav background
        document.body.style.overflow = 'hidden'; // Lock body scroll
        
        // Unlock after animation starts
        setTimeout(() => { isTransitioning = false; }, 50); 
    }

    /**
     * Hides the hero section and reveals the content.
     */
    function hideHero() {
        if (!isHeroActive || isTransitioning) return;
        isTransitioning = true;
        isHeroActive = false;

        heroHeader.classList.add('hero-hidden');
        heroHeader.classList.remove('hero-visible'); // Stops animations
        nav.classList.add('scrolled'); // Show nav background
        document.body.style.overflow = 'hidden'; // Keep body locked
        mainContent.scrollTop = 0; // Ensure content starts at its top
        
        // Unlock after transition
        setTimeout(() => { isTransitioning = false; }, 100);
    }

    // --- 5. INITIALIZE AND ATTACH EVENT LISTENERS ---

    // Run the first animation on load
    heroHeader.classList.add('hero-visible');
    runScrambleAnimation(); 

    // 1. Click "Scroll Down" button
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Stop default link behavior
            hideHero(); // Manually trigger hide
        });
    }

    // 2. Handle Mouse Wheel for snap scrolling
    window.addEventListener('wheel', (e) => {
        if (isTransitioning) {
            e.preventDefault();
            return;
        }

        const contentScrollTop = mainContent.scrollTop;

        if (e.deltaY > 0 && isHeroActive) {
            // User is scrolling DOWN from the hero
            e.preventDefault();
            hideHero();
        } else if (e.deltaY < 0 && !isHeroActive && contentScrollTop <= 0) {
            // User is scrolling UP from the *top* of the content
            e.preventDefault();
            showHero();
        }
        // Otherwise, do nothing and allow normal scroll *inside mainContent*
    }, { passive: false }); // 'passive: false' is required for preventDefault()

    // 3. Handle Touch Gestures for snap scrolling
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
        if (isTransitioning) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (isTransitioning) {
            e.preventDefault();
            return;
        }

        const touchCurrentY = e.touches[0].clientY;
        const deltaY = touchStartY - touchCurrentY; // > 0 is UP, < 0 is DOWN
        const contentScrollTop = mainContent.scrollTop;

        // Add a 5px threshold to prevent accidental swipes
        if (deltaY > 5 && isHeroActive) { // Swiping UP from hero
            e.preventDefault();
            hideHero();
        } else if (deltaY < -5 && !isHeroActive && contentScrollTop <= 0) { // Swiping DOWN from content top
            e.preventDefault();
            showHero();
        }
    }, { passive: false }); // 'passive: false' is required for preventDefault()
}
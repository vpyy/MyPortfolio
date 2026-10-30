/**
 * Automatic Slide-Fade Carousel (Cycles every 3 seconds)
 */
export default function initCarousels() {
  const carousels = document.querySelectorAll(".carousel-showcase");
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const slides = carousel.querySelectorAll(".carousel-slide");
    const dots = carousel.querySelectorAll(".carousel-dot");
    if (slides.length <= 1) return;

    let currentIndex = 0;
    let timer = null;

    function goToSlide(newIndex) {
      if (newIndex === currentIndex) return;

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[newIndex];

      // Mark current slide as exit-left
      currentSlide.classList.remove("active");
      currentSlide.classList.add("exit-left");

      // Mark next slide as active
      nextSlide.classList.remove("exit-left");
      nextSlide.classList.add("active");

      // Update dots
      if (dots.length) {
        dots.forEach((dot, idx) => {
          dot.classList.toggle("active", idx === newIndex);
        });
      }

      // Cleanup exit-left class after animation finishes
      setTimeout(() => {
        currentSlide.classList.remove("exit-left");
      }, 900);

      currentIndex = newIndex;
    }

    function nextSlide() {
      const next = (currentIndex + 1) % slides.length;
      goToSlide(next);
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(nextSlide, 3000); // 3 seconds interval
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // Attach click events to dots
    dots.forEach((dot, idx) => {
      dot.addEventListener("click", (e) => {
        e.preventDefault();
        goToSlide(idx);
        startTimer(); // reset interval after manual click
      });
    });

    // Pause on hover
    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);

    // Start auto cycle
    startTimer();
  });
}


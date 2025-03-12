document.addEventListener("DOMContentLoaded", function() {
    const countdown = document.getElementById('countdown');
    const countdownMessage = document.querySelector('.countdown-container h2');

    function updateCountdown() {
        const weddingDate = new Date('June, 14 2025 00:00:00').getTime();
        const currentTime = new Date().getTime();
        const timeRemaining = weddingDate - currentTime;

        if (timeRemaining <= 0) {
            countdownMessage.innerHTML = "Were getting married!";
            countdown.innerHTML = "Let's Party!";
            clearInterval(interval); 
            return;
        }

        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        countdown.innerHTML = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
    }

    const interval = setInterval(updateCountdown, 1000);
});
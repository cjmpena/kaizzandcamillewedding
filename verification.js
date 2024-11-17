document.addEventListener("DOMContentLoaded", () => {
    const correctPin = "sulitwedding2025"; 
    let userPin = prompt("Please enter the PIN to access this website:");

    if (userPin !== correctPin) {
        alert("Incorrect PIN. Redirecting...");
        window.location.href = "https://www.google.com";
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const correctPin = "1234"; 
    
    if (!localStorage.getItem("authenticated")) {
        let userPin = prompt("Please enter the PIN to access this website:");

        if (userPin === correctPin) {
            localStorage.setItem("authenticated", "true");
            alert("Welcome!");
        } else {
            alert("Incorrect PIN. Redirecting...");
            window.location.href = "https://www.google.com";
        }
    }
});
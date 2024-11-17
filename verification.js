document.addEventListener("DOMContentLoaded", () => {
    const correctPin = "sulitwedding2025";

    // Check if the PIN has already been verified
    const isVerified = localStorage.getItem("pinVerified");

    if (isVerified === "true") {
        console.log("Access granted. PIN already verified.");
        return; // Exit the function if the user is verified
    }

    // Delay prompt to allow browser to render the page first
    setTimeout(() => {
        let userPin = prompt("Please enter the PIN to access this website:");

        if (userPin === null) {
            // User closed the prompt without entering anything
            alert("PIN entry is required. Redirecting...");
            window.location.href = "https://www.google.com";
        } else if (userPin === correctPin) {
            // Save verification status in localStorage
            localStorage.setItem("pinVerified", "true");
            alert("Access granted.");
        } else {
            // Incorrect PIN
            window.location.href = "https://www.google.com";
        }
    }, 500); // Delay the prompt by 500ms
});

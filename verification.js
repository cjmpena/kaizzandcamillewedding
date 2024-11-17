document.addEventListener("DOMContentLoaded", () => {
    const correctPin = "sulitwedding2025";

    // Check if the PIN has already been verified
    const isVerified = localStorage.getItem("pinVerified");

    // If the PIN is verified, allow access and remove the overlay
    if (isVerified === "true") {
        console.log("Access granted. PIN already verified.");
        document.body.classList.remove("overlay-active");
        return; // Exit the function if the user is verified
    }

    // Add overlay-active class to the body to show the overlay
    document.body.classList.add("overlay-active");

    // Delay prompt to allow browser to render the page first
    setTimeout(() => {
        let userPin = prompt("Please enter the PIN to access this website:");

        if (userPin === null) {
            // User closed the prompt without entering anything
            alert("PIN entry is required. Redirecting...");
            window.location.href = "https://www.google.com"; // Redirect to another site if user cancels
        } else if (userPin === correctPin) {
            // Save verification status in localStorage
            localStorage.setItem("pinVerified", "true");

            // Remove the overlay and unlock the content
            document.body.classList.remove("overlay-active");
        } else {
            // Incorrect PIN
            window.location.href = "https://www.google.com"; // Redirect to another site if PIN is wrong
        }
    }, 500); // Delay the prompt by 500ms to let content load
});

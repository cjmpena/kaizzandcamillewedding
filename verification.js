document.addEventListener("DOMContentLoaded", () => {
    const correctPin = "2025";
    
    const isVerified = localStorage.getItem("pinVerified");
    
    if (isVerified !== "true") {
        const contentHider = document.createElement("style");
        contentHider.id = "content-hider";
        contentHider.textContent = `
            body > *:not(#pin-protection-overlay) {
                display: none !important;
            }
        `;
        document.head.appendChild(contentHider);
    }
    
    function showContent() {
        const contentHider = document.getElementById("content-hider");
        if (contentHider) {
            contentHider.remove();
        }       

        const overlay = document.getElementById("pin-protection-overlay");
        if (overlay) {
            overlay.remove();
        }
    }
    
    if (isVerified === "true") {
        showContent();
        return;
    }
    
    const overlay = document.createElement("div");
    overlay.id = "pin-protection-overlay";
    overlay.className = "pin-overlay";

    const style = document.createElement("style");
    style.textContent = `
        .pin-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .pin-dialog {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            max-width: 300px;
            width: 100%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .pin-input {
            margin: 10px 0;
            padding: 8px;
            width: 80%;
            box-sizing: border-box;
            text-align: center;
            font-size: 18px;
            letter-spacing: 4px;
        }
        .pin-button {
            padding: 8px 16px;
            background-color: #4285f4;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
            font-size: 16px;
        }
        .pin-attempt-message {
            color: red;
            margin-top: 10px;
            display: none;
        }
    `;
    document.head.appendChild(style);
    

    const dialog = document.createElement("div");
    dialog.className = "pin-dialog";
    dialog.innerHTML = `
        <h2>Access Required</h2>
        <p>Please enter the PIN to access this content</p>
        <input type="password" class="pin-input" placeholder="****" maxlength="4" inputmode="numeric">
        <div>
            <button type="button" class="pin-button">Submit</button>
        </div>
        <p class="pin-attempt-message">Incorrect PIN. <span class="attempts-left">2</span> attempts remaining.</p>
    `;
    

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    

    setTimeout(() => {
        const pinInput = dialog.querySelector(".pin-input");
        if (pinInput) {
            pinInput.focus();
        }
    }, 100);
    

    const submitButton = dialog.querySelector(".pin-button");
    const attemptMessage = dialog.querySelector(".pin-attempt-message");
    const attemptsLeftSpan = dialog.querySelector(".attempts-left");
    
    let attemptsLeft = 2; 
    

    function handleSubmit() {
        const pinInput = dialog.querySelector(".pin-input");
        const enteredPin = pinInput.value.trim();
        
        if (enteredPin === correctPin) {
            localStorage.setItem("pinVerified", "true");
            showContent();
        } else {
            attemptsLeft--;
            attemptsLeftSpan.textContent = attemptsLeft;
            attemptMessage.style.display = "block";
            pinInput.value = "";
            pinInput.focus();
            
            if (attemptsLeft < 0) {
                window.location.href = "https://www.google.com";
            }
        }
    }

    submitButton.addEventListener("click", handleSubmit);
    
    const pinInput = dialog.querySelector(".pin-input");
    pinInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    });
});
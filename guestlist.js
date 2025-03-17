document.addEventListener("DOMContentLoaded", async () => {
    const partyNameInput = document.getElementById("partyNameInput");
    const searchButton = document.getElementById("searchButton");
    const suggestionsBox = document.getElementById("suggestionsBox");
    const guestFormContainer = document.getElementById("guestFormContainer");
    let partyList = [];
  
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbyxhVAI9hbbQeymJbmdy5aZ4Ltu90EPYmtsPH1LfGrKDvILAuV0JWodNrptWfuQNu6Oew/exec");
        const data = await response.json();
        partyList = data.filter((item) => item.partyName.trim() !== "");
    } catch (error) {
        console.error("Error fetching party list:", error);
        suggestionsBox.innerHTML = `<div class="error">Error loading party list. Please try again later.</div>`;
        return;
    }
  
    partyNameInput.addEventListener("input", () => {
      const query = partyNameInput.value.toLowerCase().trim();
      guestFormContainer.innerHTML = ""; 
      showSuggestions(query, false);
    });
  
    searchButton.addEventListener("click", () => {
        const query = partyNameInput.value.toLowerCase().trim();
        if (!query) {
            suggestionsBox.innerHTML = `<div class="error">Please enter a party name.</div>`;
            return;
        }
        showSuggestions(query, true);
    });
  
    function showSuggestions(query, isSearchTriggered = false) {
        suggestionsBox.innerHTML = "";
  
        if (!query) return;
  
        const filteredParties = partyList.filter((party) =>
            party.partyName.toLowerCase().includes(query) // Changed to partial match
        );
  
        if (filteredParties.length > 0) {
            filteredParties.forEach((party) => {
                const suggestion = document.createElement("div");
                suggestion.className = "suggestion";
                suggestion.textContent = party.partyName;
  
                suggestion.addEventListener("click", () => {
                    partyNameInput.value = party.partyName;
                    suggestionsBox.innerHTML = "";
                    showGuestForm(party);
                });
  
                suggestionsBox.appendChild(suggestion);
            });
        } else if (isSearchTriggered) {
            suggestionsBox.innerHTML = `<div class="no-match">No matching party found.</div>`;
        }
    }
  
    function showGuestForm(party) {
        guestFormContainer.innerHTML = "";
    
        const existingGuests = party.existingGuests || [];
        const foodChoices = party.foodChoices || {};
        const attendingStatus = party.attendingStatus || {};
        const guestLimit = parseInt(party.guestLimit) || 2;
        const guestForm = document.createElement("form");
        
        // Create a wrapper for email field that can be hidden/shown
        const emailFieldWrapper = document.createElement("div");
        emailFieldWrapper.id = "emailFieldWrapper";
        
        const emailLabel = document.createElement("label");
        emailLabel.textContent = "Email Address for Confirmation:";
        const emailInput = document.createElement("input");
        emailInput.type = "email";
        emailInput.name = "email";
        emailInput.required = true;
        emailInput.placeholder = "Enter your email";
        
        emailFieldWrapper.appendChild(emailLabel);
        emailFieldWrapper.appendChild(emailInput);
    
        // Array to track attendance radio buttons
        const attendanceRadios = [];
    
        for (let i = 1; i <= guestLimit; i++) {
            const guestWrapper = document.createElement("div");
            guestWrapper.classList.add("guest-entry");
    
            const guestNameLabel = document.createElement("label");
            guestNameLabel.textContent = `Guest ${i}:`;
    
            const guestNameInput = document.createElement("input");
            guestNameInput.type = "text";
            guestNameInput.name = `guestName${i}`;
            guestNameInput.placeholder = "Enter guest name";
    
            if (existingGuests[i - 1]) {
                guestNameInput.value = existingGuests[i - 1];
                guestNameInput.readOnly = true;
            }
    
            // Add attendance options
            const attendingLabel = document.createElement("label");
            attendingLabel.textContent = `Will ${existingGuests[i - 1] || `Guest ${i}`} be attending?`;
            
            const attendingWrapper = document.createElement("div");
            attendingWrapper.classList.add("attending-options");
            
            // Create the radio buttons for Yes option
            const yesWrapper = document.createElement("div");
            yesWrapper.classList.add("radio-option");
            
            const yesInput = document.createElement("input");
            yesInput.type = "radio";
            yesInput.id = `attending${i}Yes`;
            yesInput.name = `attending${i}`;
            yesInput.value = "Yes";
            if (attendingStatus[existingGuests[i - 1]] === "Yes") {
                yesInput.checked = true;
            }
            
            const yesLabel = document.createElement("label");
            yesLabel.htmlFor = `attending${i}Yes`;
            yesLabel.textContent = "Yes";
            
            yesWrapper.appendChild(yesInput);
            yesWrapper.appendChild(yesLabel);
            
            // Create the radio buttons for No option
            const noWrapper = document.createElement("div");
            noWrapper.classList.add("radio-option");
            
            const noInput = document.createElement("input");
            noInput.type = "radio";
            noInput.id = `attending${i}No`;
            noInput.name = `attending${i}`;
            noInput.value = "No";
            if (attendingStatus[existingGuests[i - 1]] === "No") {
                noInput.checked = true;
            }
            
            const noLabel = document.createElement("label");
            noLabel.htmlFor = `attending${i}No`;
            noLabel.textContent = "No";
            
            noWrapper.appendChild(noInput);
            noWrapper.appendChild(noLabel);
            
            attendingWrapper.appendChild(yesWrapper);
            attendingWrapper.appendChild(noWrapper);
    
            // Store references to radio buttons to check attendance status later
            attendanceRadios.push({ yes: yesInput, no: noInput });
    
            const foodChoiceLabel = document.createElement("label");
            foodChoiceLabel.textContent = `Food Choice for Guest ${i}:`;
    
            const foodChoiceSelect = document.createElement("select");
            foodChoiceSelect.name = `foodChoice${i}`;
            foodChoiceSelect.innerHTML = `
                <option value="">Select a food option</option>
                <option value="Beef">Beef — 𝘉𝘦𝘦𝘧 𝘉𝘳𝘪𝘴𝘬𝘦𝘵 𝘸𝘪𝘵𝘩 𝘢 𝘨𝘳𝘦𝘦𝘯 𝘱𝘦𝘱𝘱𝘦𝘳𝘤𝘰𝘳𝘯 𝘴𝘢𝘶𝘤𝘦 𝘢𝘯𝘥 𝘤𝘳𝘪𝘴𝘱𝘺 𝘰𝘯𝘪𝘰𝘯𝘴</option>
                <option value="Fish">Fish — 𝘔𝘪𝘴𝘰 𝘢𝘯𝘥 𝘮𝘢𝘱𝘭𝘦 𝘣𝘢𝘬𝘦𝘥 𝘴𝘢𝘭𝘮𝘰𝘯 𝘸𝘪𝘵𝘩 𝘵𝘰𝘢𝘴𝘵𝘦𝘥 𝘴𝘦𝘴𝘢𝘮𝘦 𝘢𝘯𝘥 𝘨𝘪𝘯𝘨𝘦𝘳 𝘣𝘶𝘵𝘵𝘦𝘳</option>
                <option value="Chicken">Chicken — 𝘊𝘩𝘪𝘤𝘬𝘦𝘯 𝘉𝘳𝘦𝘢𝘴𝘵 𝘞𝘦𝘭𝘭𝘪𝘯𝘨𝘵𝘰𝘯 𝘸𝘪𝘵𝘩 𝘧𝘦𝘵𝘢, 𝘴𝘶𝘯𝘥𝘳𝘪𝘦𝘥 𝘵𝘰𝘮𝘢𝘵𝘰𝘦𝘴 𝘢𝘯𝘥 𝘮𝘶𝘴𝘵𝘢𝘳𝘥 𝘤𝘳𝘦𝘢𝘮</option>
                <option value="Vegetarian">Vegetarian — 𝘉𝘶𝘵𝘵𝘦𝘳𝘯𝘶𝘵 𝘴𝘲𝘶𝘢𝘴𝘩 𝘤𝘢𝘯𝘯𝘦𝘭𝘭𝘰𝘯𝘪 𝘸𝘪𝘵𝘩 𝘸𝘪𝘭𝘵𝘦𝘥 𝘴𝘱𝘪𝘯𝘢𝘤𝘩 𝘢𝘯𝘥 𝘎𝘳𝘶𝘺𝘦𝘳𝘦 𝘤𝘩𝘦𝘦𝘴𝘦</option>
            `;
            foodChoiceSelect.value = foodChoices[existingGuests[i - 1]] || "";
    
            const allergiesLabel = document.createElement("label");
            allergiesLabel.textContent = `Allergies or any dietary restrictions for Guest ${i}:`;
            const allergiesInput = document.createElement("input");
            allergiesInput.type = "text";
            allergiesInput.name = `notes${i}`;
            allergiesInput.placeholder = "Enter any allergies or dietary restrictions";
            allergiesInput.className = "rsvp-form-input";

            // Hide food choice and allergies by default
            foodChoiceLabel.style.display = "none";
            foodChoiceSelect.style.display = "none";
            allergiesLabel.style.display = "none";
            allergiesInput.style.display = "none";
            
            // Add event listeners to show/hide food choices and allergies fields based on attendance
            yesInput.addEventListener("change", function() {
                // Show food choice and allergies when "Yes" is selected
                foodChoiceLabel.style.display = "block";
                foodChoiceSelect.style.display = "block";
                allergiesLabel.style.display = "block";
                allergiesInput.style.display = "block";
                updateEmailFieldVisibility(attendanceRadios);
            });
    
            noInput.addEventListener("change", function() {
                // Hide food choice and allergies when "No" is selected
                foodChoiceLabel.style.display = "none";
                foodChoiceSelect.style.display = "none";
                allergiesLabel.style.display = "none";
                allergiesInput.style.display = "none";
                // Clear the selections when not attending
                foodChoiceSelect.value = "";
                allergiesInput.value = "";
                updateEmailFieldVisibility(attendanceRadios);
            });
    
            // Show food choices and allergies for guests already marked as attending
            if (attendingStatus[existingGuests[i - 1]] === "Yes") {
                foodChoiceLabel.style.display = "block";
                foodChoiceSelect.style.display = "block";
                allergiesLabel.style.display = "block";
                allergiesInput.style.display = "block";
            }
    
            guestWrapper.appendChild(guestNameLabel);
            guestWrapper.appendChild(guestNameInput);
            guestWrapper.appendChild(attendingLabel);
            guestWrapper.appendChild(attendingWrapper);
            guestWrapper.appendChild(foodChoiceLabel);
            guestWrapper.appendChild(foodChoiceSelect);
            guestWrapper.appendChild(allergiesLabel);
            guestWrapper.appendChild(allergiesInput);
    
            guestForm.appendChild(guestWrapper);
        }
    
        // Function to check if all guests selected "No" and update email field visibility
        function updateEmailFieldVisibility(radios) {
            const allNo = radios.every(radio => radio.no.checked || (!radio.yes.checked && !radio.no.checked));
            const allSelected = radios.every(radio => radio.yes.checked || radio.no.checked);
            
            // Only hide email if all guests selected "No" and all have made a selection
            if (allNo && allSelected) {
                emailFieldWrapper.style.display = "none";
                emailInput.required = false;
            } else {
                emailFieldWrapper.style.display = "block";
                emailInput.required = true;
            }
        }
    
        // Initial check for email field visibility
        updateEmailFieldVisibility(attendanceRadios);
    
        guestForm.appendChild(emailFieldWrapper);
        
        // Add a message field for the couple
        const messageWrapper = document.createElement("div");
        messageWrapper.classList.add("message-wrapper");
        
        const messageLabel = document.createElement("label");
        messageLabel.textContent = "Message for Kaizz and Camille:";
        messageLabel.htmlFor = "coupleMessage";
        
        const messageTextarea = document.createElement("textarea");
        messageTextarea.id = "coupleMessage";
        messageTextarea.name = "coupleMessage";
        messageTextarea.placeholder = "Write a message for the couple and song suggestions for the party DJ...";
        messageTextarea.rows = 4;
        
        messageWrapper.appendChild(messageLabel);
        messageWrapper.appendChild(messageTextarea);
        
        guestForm.appendChild(messageWrapper);
    
        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "Submit RSVP";
        submitButton.id = "submitRSVP";
        guestForm.appendChild(submitButton);
    
        guestForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const guestNames = [];
            const foodChoices = [];
            const allergies = [];
            const attendingChoices = [];
    
            // Show loading indicator
            const loadingIndicator = document.createElement("div");
            loadingIndicator.className = "loading";
            loadingIndicator.textContent = "Submitting your RSVP...";
            guestFormContainer.appendChild(loadingIndicator);
            submitButton.disabled = true;
    
            for (let i = 1; i <= guestLimit; i++) {
                guestNames.push(event.target[`guestName${i}`].value || "");
                foodChoices.push(event.target[`foodChoice${i}`].value);
                allergies.push(event.target[`notes${i}`].value || "");
                
                // Get the selected attendance option
                const attendingRadios = document.getElementsByName(`attending${i}`);
                let attendingValue = "";
                for (const radio of attendingRadios) {
                    if (radio.checked) {
                        attendingValue = radio.value;
                        break;
                    }
                }
                attendingChoices.push(attendingValue);
            }
    
            // Check if all are not attending
            const allNotAttending = attendingChoices.every(choice => choice === "No");
            
            const email = emailInput.value.trim();
            if (!allNotAttending && !email) {
                alert("Please enter a valid email address.");
                loadingIndicator.remove();
                submitButton.disabled = false;
                return;
            }
            
            // Get the message for the couple
            const coupleMessage = messageTextarea.value.trim();
    
            const formData = new FormData();
            formData.append("partyName", party.partyName);
            formData.append("guestLimit", guestLimit);
            formData.append("email", email);
            formData.append("allNotAttending", allNotAttending); // Flag for backend
            formData.append("coupleMessage", coupleMessage); // Add the message to the form data
    
            for (let i = 1; i <= guestLimit; i++) {
                formData.append(`guestName${i}`, guestNames[i - 1] || "");
                formData.append(`foodChoice${i}`, foodChoices[i - 1] || "");
                formData.append(`notes${i}`, allergies[i - 1] || "");
                formData.append(`attending${i}`, attendingChoices[i - 1] || "");
            }
    
            try {
                const response = await fetch("https://script.google.com/macros/s/AKfycbyxhVAI9hbbQeymJbmdy5aZ4Ltu90EPYmtsPH1LfGrKDvILAuV0JWodNrptWfuQNu6Oew/exec", {
                    method: "POST",
                    body: formData
                });
    
                const result = await response.text();
                console.log(result);
                guestForm.reset();
                loadingIndicator.remove();
                
                // Different success message based on attendance
                if (allNotAttending) {
                    alert("Thank you for submitting your RSVP. We're sorry you won't be able to attend our special day.");
                } else {
                    alert("RSVP submitted successfully! Confirmation email sent.");
                }
                
                // Reset form and UI
                guestFormContainer.innerHTML = "";
                partyNameInput.value = "";
            } catch (error) {
                console.error("Error submitting RSVP:", error);
                loadingIndicator.remove();
                submitButton.disabled = false;
                alert("There was an error submitting your RSVP. Please try again.");
            }
        });
        guestFormContainer.appendChild(guestForm);
    }
});
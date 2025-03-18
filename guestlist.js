document.addEventListener("DOMContentLoaded", async () => {
    const partyNameInput = document.getElementById("partyNameInput");
    const searchButton = document.getElementById("searchButton");
    const suggestionsBox = document.getElementById("suggestionsBox");
    const guestFormContainer = document.getElementById("guestFormContainer");
    let partyList = [];
  
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycby-TahSxElSvTClqMa8L9N3rbsombqEKRw3lWVPhNf-_Z1cmVqkoOnoddunzLnZpQKEAg/exec");
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
        // Support up to 7 guests, defaulting to 2 if not specified
        const guestLimit = parseInt(party.guestLimit) || 2;
        const guestForm = document.createElement("form");
        
        // Add a heading showing total number of guests for this party
        const partyHeading = document.createElement("h3");
        partyHeading.textContent = `RSVP for ${party.partyName} (${guestLimit} ${guestLimit === 1 ? 'guest' : 'guests'})`;
        partyHeading.className = "party-heading";
        guestForm.appendChild(partyHeading);
        
        // Create a wrapper for email field that can be hidden/shown
        const emailFieldWrapper = document.createElement("div");
        emailFieldWrapper.id = "emailFieldWrapper";
        emailFieldWrapper.className = "form-field";
        
        const emailLabel = document.createElement("label");
        emailLabel.textContent = "Email Address for Confirmation:";
        emailLabel.htmlFor = "email";
        
        const emailInput = document.createElement("input");
        emailInput.type = "email";
        emailInput.name = "email";
        emailInput.id = "email";
        emailInput.required = true;
        emailInput.placeholder = "Enter your email";
        emailInput.className = "rsvp-form-input";
        
        emailFieldWrapper.appendChild(emailLabel);
        emailFieldWrapper.appendChild(emailInput);
    
        // Array to track attendance radio buttons
        const attendanceRadios = [];
        
        // Create a container for all guest entries
        const allGuestsContainer = document.createElement("div");
        allGuestsContainer.className = "all-guests-container";
    
        for (let i = 1; i <= guestLimit; i++) {
            const guestWrapper = document.createElement("div");
            guestWrapper.classList.add("guest-entry");
            
            // Add a heading for each guest
            const guestHeader = document.createElement("h4");
            guestHeader.textContent = `Guest ${i}`;
            guestHeader.className = "guest-header";
            guestWrapper.appendChild(guestHeader);
    
            const guestNameLabel = document.createElement("label");
            guestNameLabel.textContent = `Guest Name:`;
            guestNameLabel.htmlFor = `guestName${i}`;
            guestNameLabel.className = "form-label";
    
            const guestNameInput = document.createElement("input");
            guestNameInput.type = "text";
            guestNameInput.name = `guestName${i}`;
            guestNameInput.id = `guestName${i}`;
            guestNameInput.placeholder = "Enter guest name";
            guestNameInput.className = "rsvp-form-input";
    
            if (existingGuests[i - 1]) {
                guestNameInput.value = existingGuests[i - 1];
                guestNameInput.readOnly = true;
            }
    
            // Add attendance options
            const attendingLabel = document.createElement("label");
            attendingLabel.textContent = `Will ${existingGuests[i - 1] || `Guest ${i}`} be attending?`;
            attendingLabel.className = "form-label";
            
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
            foodChoiceLabel.textContent = `Food Choice:`;
            foodChoiceLabel.htmlFor = `foodChoice${i}`;
            foodChoiceLabel.className = "form-label food-choice-label";
    
            // Create custom dropdown for food choice
            const foodChoiceWrapper = document.createElement("div");
            foodChoiceWrapper.className = "custom-select-wrapper";

            const foodChoiceDisplay = document.createElement("div");
            foodChoiceDisplay.className = "custom-select-display";
            foodChoiceDisplay.setAttribute("tabindex", "0");
            foodChoiceDisplay.textContent = "Select a food option";
            foodChoiceDisplay.dataset.value = "";

            const foodChoiceOptions = document.createElement("div");
            foodChoiceOptions.className = "custom-select-options";

            const foodOptions = [
                { value: "", text: "Select a food option", description: "" },
                { value: "Beef", text: "Beef", description: "Beef Brisket with a green peppercorn sauce and crispy onions" },
                { value: "Fish", text: "Fish", description: "Miso and maple baked salmon with toasted sesame and ginger butter" },
                { value: "Chicken", text: "Chicken", description: "Chicken Breast Wellington with feta, sundried tomatoes and mustard cream" },
                { value: "Vegetarian", text: "Vegetarian", description: "Butternut squash cannelloni with wilted spinach and Gruyere cheese" }
            ];

            // Create a hidden input for form submission
            const hiddenFoodInput = document.createElement("input");
            hiddenFoodInput.type = "hidden";
            hiddenFoodInput.name = `foodChoice${i}`;
            hiddenFoodInput.id = `foodChoice${i}`;
            hiddenFoodInput.value = foodChoices[existingGuests[i - 1]] || "";

            // If there's a previously selected value, display it
            if (foodChoices[existingGuests[i - 1]]) {
                const selectedOption = foodOptions.find(opt => opt.value === foodChoices[existingGuests[i - 1]]);
                if (selectedOption) {
                    foodChoiceDisplay.textContent = selectedOption.text;
                    foodChoiceDisplay.dataset.value = selectedOption.value;
                    hiddenFoodInput.value = selectedOption.value;
                }
            }

            foodOptions.forEach(option => {
                const optionElement = document.createElement("div");
                optionElement.className = "custom-select-option";
                optionElement.dataset.value = option.value;
                
                if (option.value === "") {
                    optionElement.textContent = option.text;
                } else {
                    const optionText = document.createElement("span");
                    optionText.className = "option-main-text";
                    optionText.textContent = option.text;
                    
                    const optionDescription = document.createElement("span");
                    optionDescription.className = "option-description";
                    optionDescription.textContent = `${option.description}`;
                    
                    optionElement.appendChild(optionText);
                    optionElement.appendChild(optionDescription);
                }
                
                optionElement.addEventListener("click", () => {
                    foodChoiceDisplay.textContent = option.text;
                    foodChoiceDisplay.dataset.value = option.value;
                    hiddenFoodInput.value = option.value;
                    foodChoiceOptions.classList.remove("show");
                });
                
                foodChoiceOptions.appendChild(optionElement);
            });

            foodChoiceDisplay.addEventListener("click", (e) => {
                e.stopPropagation();
                foodChoiceOptions.classList.toggle("show");
            });

            // Close the dropdown when clicking outside
            document.addEventListener("click", () => {
                foodChoiceOptions.classList.remove("show");
            });

            foodChoiceWrapper.appendChild(foodChoiceDisplay);
            foodChoiceWrapper.appendChild(foodChoiceOptions);
            foodChoiceWrapper.appendChild(hiddenFoodInput);
    
            const allergiesLabel = document.createElement("label");
            allergiesLabel.textContent = `Allergies or dietary restrictions:`;
            allergiesLabel.htmlFor = `notes${i}`;
            allergiesLabel.className = "form-label allergies-label";
            
            const allergiesInput = document.createElement("input");
            allergiesInput.type = "text";
            allergiesInput.name = `notes${i}`;
            allergiesInput.id = `notes${i}`;
            allergiesInput.placeholder = "Enter any allergies or dietary restrictions";
            allergiesInput.className = "rsvp-form-input";

            // Hide food choice and allergies by default
            foodChoiceLabel.style.display = "none";
            foodChoiceWrapper.style.display = "none";
            allergiesLabel.style.display = "none";
            allergiesInput.style.display = "none";
            
            // Add event listeners to show/hide food choices and allergies fields based on attendance
            yesInput.addEventListener("change", function() {
                // Show food choice and allergies when "Yes" is selected
                foodChoiceLabel.style.display = "block";
                foodChoiceWrapper.style.display = "block";
                allergiesLabel.style.display = "block";
                allergiesInput.style.display = "block";
                updateEmailFieldVisibility(attendanceRadios);
            });
    
            noInput.addEventListener("change", function() {
                // Hide food choice and allergies when "No" is selected
                foodChoiceLabel.style.display = "none";
                foodChoiceWrapper.style.display = "none";
                allergiesLabel.style.display = "none";
                allergiesInput.style.display = "none";
                // Clear the selections when not attending
                hiddenFoodInput.value = "";
                foodChoiceDisplay.textContent = "Select a food option";
                foodChoiceDisplay.dataset.value = "";
                allergiesInput.value = "";
                updateEmailFieldVisibility(attendanceRadios);
            });
    
            // Show food choices and allergies for guests already marked as attending
            if (attendingStatus[existingGuests[i - 1]] === "Yes") {
                foodChoiceLabel.style.display = "block";
                foodChoiceWrapper.style.display = "block";
                allergiesLabel.style.display = "block";
                allergiesInput.style.display = "block";
            }
    
            guestWrapper.appendChild(guestNameLabel);
            guestWrapper.appendChild(guestNameInput);
            guestWrapper.appendChild(attendingLabel);
            guestWrapper.appendChild(attendingWrapper);
            guestWrapper.appendChild(foodChoiceLabel);
            guestWrapper.appendChild(foodChoiceWrapper);
            guestWrapper.appendChild(allergiesLabel);
            guestWrapper.appendChild(allergiesInput);
    
            // Add a divider after each guest except the last one
            if (i < guestLimit) {
                const divider = document.createElement("hr");
                divider.className = "guest-divider";
                guestWrapper.appendChild(divider);
            }
            
            allGuestsContainer.appendChild(guestWrapper);
        }
        
        guestForm.appendChild(allGuestsContainer);
    
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
        messageWrapper.classList.add("form-field");
        
        const messageLabel = document.createElement("label");
        messageLabel.textContent = "Message for Kaizz and Camille:";
        messageLabel.htmlFor = "coupleMessage";
        messageLabel.className = "form-label";
        
        const messageTextarea = document.createElement("textarea");
        messageTextarea.id = "coupleMessage";
        messageTextarea.name = "coupleMessage";
        messageTextarea.placeholder = "Write a message for the couple and song suggestions for the party DJ...";
        messageTextarea.rows = 4;
        messageTextarea.className = "rsvp-form-textarea";
        
        messageWrapper.appendChild(messageLabel);
        messageWrapper.appendChild(messageTextarea);
        
        guestForm.appendChild(messageWrapper);
    
        const submitButtonWrapper = document.createElement("div");
        submitButtonWrapper.className = "submit-button-wrapper";
        
        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "Submit RSVP";
        submitButton.id = "submitRSVP";
        submitButton.className = "submit-button";
        
        submitButtonWrapper.appendChild(submitButton);
        guestForm.appendChild(submitButtonWrapper);
    
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
                
                // Get the hidden food choice value
                const hiddenFoodInput = document.getElementById(`foodChoice${i}`);
                foodChoices.push(hiddenFoodInput ? hiddenFoodInput.value : "");
                
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
            
            // Check if attending guests have selected a food choice
            const missingFoodChoices = attendingChoices.some((choice, index) => 
                choice === "Yes" && !foodChoices[index]
            );
            
            if (missingFoodChoices) {
                alert("Please select a food choice for all attending guests.");
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
                const response = await fetch("https://script.google.com/macros/s/AKfycby-TahSxElSvTClqMa8L9N3rbsombqEKRw3lWVPhNf-_Z1cmVqkoOnoddunzLnZpQKEAg/exec", {
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
                    alert("RSVP submitted successfully! Confirmation email sent. If not appearing in inbox, please check junk/spam.");
                }

                window.location.href = "index.html";
                
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
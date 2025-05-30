document.addEventListener("DOMContentLoaded", async () => {
    const partyNameInput = document.getElementById("partyNameInput");
    const searchButton = document.getElementById("searchButton");
    const suggestionsBox = document.getElementById("suggestionsBox");
    const guestFormContainer = document.getElementById("guestFormContainer");
    let partyList = [];
  
    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbwnJjmLwuVpE8KdA2vpSe53WFrIoKU31zvPtcnmrKIIflrhfHokkkTyqIgbFOsTmMEzRg/exec");
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
    
        const filteredParties = partyList.filter((party) => {
            if (party.partyName.toLowerCase().includes(query)) {
                return true;
            }
            
            const existingGuests = party.existingGuests || [];
            return existingGuests.some(guest => 
                guest && guest.toLowerCase().includes(query)
            );
        });
    
        if (filteredParties.length > 0) {
            filteredParties.forEach((party) => {
                const suggestion = document.createElement("div");
                suggestion.className = "suggestion";
                
                const matchedGuest = (party.existingGuests || []).find(guest => 
                    guest && guest.toLowerCase().includes(query)
                );
                
                if (matchedGuest && matchedGuest.toLowerCase() !== party.partyName.toLowerCase()) {
                    suggestion.innerHTML = `<strong>${party.partyName}</strong> (Included in Party: ${matchedGuest})`;
                } else {
                    suggestion.textContent = party.partyName;
                }
    
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
        
        const partyHeading = document.createElement("h3");
        partyHeading.textContent = `RSVP for ${party.partyName} (${guestLimit} ${guestLimit === 1 ? 'guest' : 'guests'})`;
        partyHeading.className = "party-heading";
        guestForm.appendChild(partyHeading);
        
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
    

        const attendanceRadios = [];

        const allGuestsContainer = document.createElement("div");
        allGuestsContainer.className = "all-guests-container";
    
        for (let i = 1; i <= guestLimit; i++) {
            const guestWrapper = document.createElement("div");
            guestWrapper.classList.add("guest-entry");
   
            const guestHeader = document.createElement("h4");
            guestHeader.textContent = `Guest ${i}`;
            guestHeader.className = "guest-header";
            guestWrapper.appendChild(guestHeader);
    
            const guestNameLabel = document.createElement("label");
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
    
            const attendingLabel = document.createElement("label");
            attendingLabel.textContent = `Will ${existingGuests[i - 1] || `Guest ${i}`} be attending?`;
            attendingLabel.className = "form-label";
            
            const attendingWrapper = document.createElement("div");
            attendingWrapper.classList.add("attending-options");
            
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
    
            attendanceRadios.push({ yes: yesInput, no: noInput });
    
            const foodChoiceLabel = document.createElement("label");
            foodChoiceLabel.textContent = `Food Choice:`;
            foodChoiceLabel.htmlFor = `foodChoice${i}`;
            foodChoiceLabel.className = "form-label food-choice-label";
    
         
            const foodChoiceWrapper = document.createElement("div");
            foodChoiceWrapper.className = "custom-select-wrapper";

            const foodChoiceDisplay = document.createElement("div");
            foodChoiceDisplay.className = "custom-select-display";
            foodChoiceDisplay.setAttribute("tabindex", "0");
            foodChoiceDisplay.textContent = "Select your food option";
            foodChoiceDisplay.dataset.value = "";

            const foodChoiceOptions = document.createElement("div");
            foodChoiceOptions.className = "custom-select-options";

            const foodOptions = [
                { value: "", text: "Select your food option", description: "" },
                { value: "Beef", text: "Beef", description: "Beef Brisket with green peppercorn sauce and crispy onions" },
                { value: "Fish", text: "Fish", description: "Miso and maple baked salmon with toasted sesame and ginger butter" },
                { value: "Chicken", text: "Chicken", description: "Chicken Breast Wellington with feta, sundried tomatoes and mustard cream" },
                { value: "Vegan", text: "Vegan", description: "Vegetable stack with herb polenta, roasted peppers, portabella mushroom, grilled zucchini, and fresh arugula with confit tomatoes GF" } //Butternut squash cannelloni with wilted spinach and Gruyere cheese
            ];

            const hiddenFoodInput = document.createElement("input");
            hiddenFoodInput.type = "hidden";
            hiddenFoodInput.name = `foodChoice${i}`;
            hiddenFoodInput.id = `foodChoice${i}`;
            hiddenFoodInput.value = foodChoices[existingGuests[i - 1]] || "";

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
            foodChoiceLabel.style.display = "none";
            foodChoiceWrapper.style.display = "none";
            allergiesLabel.style.display = "none";
            allergiesInput.style.display = "none";
            
            yesInput.addEventListener("change", function() {
                foodChoiceLabel.style.display = "block";
                foodChoiceWrapper.style.display = "block";
                allergiesLabel.style.display = "block";
                allergiesInput.style.display = "block";
                updateEmailFieldVisibility(attendanceRadios);
            });
    
            noInput.addEventListener("change", function() {
                foodChoiceLabel.style.display = "none";
                foodChoiceWrapper.style.display = "none";
                allergiesLabel.style.display = "none";
                allergiesInput.style.display = "none";
                hiddenFoodInput.value = "";
                foodChoiceDisplay.textContent = "Select your food option";
                foodChoiceDisplay.dataset.value = "";
                allergiesInput.value = "";
                updateEmailFieldVisibility(attendanceRadios);
            });
    
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
    
            if (i < guestLimit) {
                const divider = document.createElement("hr");
                divider.className = "guest-divider";
                guestWrapper.appendChild(divider);
            }
            
            allGuestsContainer.appendChild(guestWrapper);
        }
        
        guestForm.appendChild(allGuestsContainer);
    
        function updateEmailFieldVisibility(radios) {
            const allNo = radios.every(radio => radio.no.checked || (!radio.yes.checked && !radio.no.checked));
            const allSelected = radios.every(radio => radio.yes.checked || radio.no.checked);
            
            if (allNo && allSelected) {
                emailFieldWrapper.style.display = "none";
                emailInput.required = false;
            } else {
                emailFieldWrapper.style.display = "block";
                emailInput.required = true;
            }
        }
    
        updateEmailFieldVisibility(attendanceRadios);
    
        guestForm.appendChild(emailFieldWrapper);
        
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
            
            const missingFoodChoices = attendingChoices.some((choice, index) => 
                choice === "Yes" && !foodChoices[index]
            );

            if (missingFoodChoices) {
                showErrorPopup("Please select food choice for all attending guests.");
                loadingIndicator.remove();
                submitButton.disabled = false;
                return;
            }
            
            const coupleMessage = messageTextarea.value.trim();
    
            const formData = new FormData();
            formData.append("partyName", party.partyName);
            formData.append("guestLimit", guestLimit);
            formData.append("email", email);
            formData.append("allNotAttending", allNotAttending); 
            formData.append("coupleMessage", coupleMessage); 
    
            for (let i = 1; i <= guestLimit; i++) {
                formData.append(`guestName${i}`, guestNames[i - 1] || "");
                formData.append(`foodChoice${i}`, foodChoices[i - 1] || "");
                formData.append(`notes${i}`, allergies[i - 1] || "");
                formData.append(`attending${i}`, attendingChoices[i - 1] || "");
            }
    
            try {
                const response = await fetch("https://script.google.com/macros/s/AKfycbwnJjmLwuVpE8KdA2vpSe53WFrIoKU31zvPtcnmrKIIflrhfHokkkTyqIgbFOsTmMEzRg/exec", {
                    method: "POST",
                    body: formData
                });
    
                const result = await response.text();
                console.log(result);
                guestForm.reset();
                loadingIndicator.remove();
                
                if (allNotAttending) {
                    showThankYouPopup(false);
                } else {
                    showThankYouPopup(true);
                }                
                 
                } catch (error) {
                    console.error("Error submitting RSVP:", error);
                    loadingIndicator.remove();
                    submitButton.disabled = false;
                    alert("There was an error submitting your RSVP. Please try again.");
                }
        });
        guestFormContainer.appendChild(guestForm);
    }

    function showErrorPopup(message) {
        const overlay = document.createElement("div");
        overlay.className = "error-overlay";
        
        const popup = document.createElement("div");
        popup.className = "error-popup";
        
        popup.innerHTML = `
            <h2>Attention Required</h2>
            <p>${message}</p>
        `;
        
        const closeButton = document.createElement("button");
        closeButton.className = "error-button";
        closeButton.textContent = "OK";
        closeButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
        });
        
        popup.appendChild(closeButton);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }

    function showThankYouPopup(isAttending) {
        const overlay = document.createElement("div");
        overlay.className = "thank-you-overlay";
        
        const popup = document.createElement("div");
        popup.className = "thank-you-popup";
        
        let message = '';
        if (isAttending) {
            message = `
                <h2>Thank You!</h2>
                <p>Your RSVP has been submitted successfully.</p>
                <p>A confirmation email has been sent to your inbox.</p>
                <p class="small-note">(Please check your spam/junk folder if not appearing)</p>
                <p class="message-highlight">We look forward to celebrating with you!</p>
            `;
        } else {
            message = `
                <h2>Thank You</h2>
                <p>Your RSVP has been submitted successfully.</p>
                <p>We're sorry you won't be able to attend our special day.</p>
                <p class="message-highlight">Thank you for letting us know.</p>
            `;
        }
        
        popup.innerHTML = message;
        
        const closeButton = document.createElement("button");
        closeButton.className = "thank-you-button";
        closeButton.textContent = "Close";
        closeButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
            window.location.href = "index.html";
        });
        
        popup.appendChild(closeButton);
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }

});
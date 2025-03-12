document.addEventListener("DOMContentLoaded", async () => {
  const partyNameInput = document.getElementById("partyNameInput");
  const searchButton = document.getElementById("searchButton");
  const suggestionsBox = document.getElementById("suggestionsBox");
  const guestFormContainer = document.getElementById("guestFormContainer");
  let partyList = [];

  try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbxWUZ62CeAhESWFI2juYsEivP6GASb3yl4ln-KgwrFEtyughn916I6iAQjQFSbXlMPH/exec");
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
          party.partyName.toLowerCase() === query
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
      const guestLimit = parseInt(party.guestLimit) || 2;
      const guestForm = document.createElement("form");

      for (let i = 1; i <= guestLimit; i++) {
          const guestWrapper = document.createElement("div");
          guestWrapper.classList.add("guest-entry");

          const guestNameLabel = document.createElement("label");
          guestNameLabel.textContent = `Guest Name ${i}:`;

          const guestNameInput = document.createElement("input");
          guestNameInput.type = "text";
          guestNameInput.name = `guestName${i}`;
          guestNameInput.placeholder = "Enter guest name";

          if (existingGuests[i - 1]) {
              guestNameInput.value = existingGuests[i - 1];
              guestNameInput.readOnly = true;
          }

          const foodChoiceLabel = document.createElement("label");
          foodChoiceLabel.textContent = `Food Choice for Guest ${i}:`;

          const foodChoiceSelect = document.createElement("select");
          foodChoiceSelect.name = `foodChoice${i}`;
          foodChoiceSelect.innerHTML = `
              <option value="">Select a food option</option>
              <option value="Beef">Beef - Beef Brisket with a green peppercorn sauce and crispy onions</option>
              <option value="Fish"> Fish - Miso and maple baked salmon with toasted sesame and ginger butter</option>
              <option value="Chicken">Beef - Chicken Breast Wellington with feta, sundried tomatoes and mustard cream</option>
              <option value="Vegetarian">Vegetarian - Butternut squash cannelloni with wildted spinach and Gruyere cheese</option>
          `;
          foodChoiceSelect.value = foodChoices[existingGuests[i - 1]] || "";

          const allergiesLabel = document.createElement("label");
          allergiesLabel.textContent = `Allergies or any dietary restrictions for Guest ${i}:`;
          const allergiesInput = document.createElement("input");
          allergiesInput.type = "text";
          allergiesInput.name = `notes${i}`;
          allergiesInput.placeholder = "Enter any allergies or dietary restrictions";

          guestWrapper.appendChild(guestNameLabel);
          guestWrapper.appendChild(guestNameInput);
          guestWrapper.appendChild(foodChoiceLabel);
          guestWrapper.appendChild(foodChoiceSelect);
          guestWrapper.appendChild(allergiesLabel);
          guestWrapper.appendChild(allergiesInput);

          guestForm.appendChild(guestWrapper);
      }

      const emailLabel = document.createElement("label");
      emailLabel.textContent = "Email Address for Confirmation:";
      const emailInput = document.createElement("input");
      emailInput.type = "email";
      emailInput.name = "email";
      emailInput.placeholder = "Enter your email";

      guestForm.appendChild(emailLabel);
      guestForm.appendChild(emailInput);

      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = "Submit RSVP";
      guestForm.appendChild(submitButton);

      guestForm.addEventListener("submit", async (event) => {
          event.preventDefault();
          const guestNames = [];
          const foodChoices = [];
          const allergies = [];

          for (let i = 1; i <= guestLimit; i++) {
              guestNames.push(event.target[`guestName${i}`].value || "");
              foodChoices.push(event.target[`foodChoice${i}`].value);
              allergies.push(event.target[`notes${i}`].value || "");
          }

          const email = emailInput.value.trim();
          if (!email) {
              alert("Please enter a valid email address.");
              return;
          }

          const formData = new FormData();
          formData.append("partyName", party.partyName);
          formData.append("guestLimit", guestLimit);
          formData.append("email", email);

          for (let i = 1; i <= guestLimit; i++) {
              formData.append(`guestName${i}`, guestNames[i - 1] || "");
              formData.append(`foodChoice${i}`, foodChoices[i - 1] || "");
              formData.append(`notes${i}`, allergies[i - 1] || "");
          }

          try {
              const response = await fetch("https://script.google.com/macros/s/AKfycbxWUZ62CeAhESWFI2juYsEivP6GASb3yl4ln-KgwrFEtyughn916I6iAQjQFSbXlMPH/exec", {
                  method: "POST",
                  body: formData
              });

              const result = await response.text();
              console.log(result);
              guestForm.reset();
              alert("RSVP submitted successfully! Confirmation email sent.");
          } catch (error) {
              console.error("Error submitting RSVP:", error);
              alert("There was an error submitting your RSVP. Please try again.");
          }
      });

      guestFormContainer.appendChild(guestForm);
  }
});
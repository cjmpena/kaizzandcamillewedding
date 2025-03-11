document.addEventListener("DOMContentLoaded", async () => {
  const partyNameInput = document.getElementById("partyNameInput");
  const searchButton = document.getElementById("searchButton");
  const suggestionsBox = document.getElementById("suggestionsBox");
  const guestFormContainer = document.getElementById("guestFormContainer");
  let partyList = [];

  try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbx9ZikuZK0WadsXA6kySo2ah7odlZhYQSGAm5L0R0qszDztAzFQgO5yUA_jPJjztXSM/exec");
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
    showSuggestions(query, false); // Don't show "No matching party found" while typing
  });

  searchButton.addEventListener("click", () => {
      const query = partyNameInput.value.toLowerCase().trim();
      if (!query) {
          suggestionsBox.innerHTML = `<div class="error">Please enter a party name.</div>`;
          return;
      }
      showSuggestions(query, true); // Now it can show "No matching party found" if necessary
  });

  function showSuggestions(query, isSearchTriggered = false) {
      suggestionsBox.innerHTML = "";

      if (!query) return; // Don't show anything if the input is empty

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
          // Only show "No matching party found" if search button was clicked
          suggestionsBox.innerHTML = `<div class="no-match">No matching party found.</div>`;
      }
  }


  function showGuestForm(party) {
      guestFormContainer.innerHTML = "";

      const existingGuests = party.existingGuests || [];
      const existingGuestsStatus = party.existingGuestsStatus || {};
      const foodChoices = party.foodChoices || {};
      const guestLimit = parseInt(party.guestLimit) || 2;
      const guestForm = document.createElement("form");

      for (let i = 1; i <= guestLimit; i++) {
          const guestWrapper = document.createElement("div");
          guestWrapper.classList.add("guest-entry");

          const guestNameLabel = document.createElement("label");
          guestNameLabel.textContent = `Guest Name ${i}:`;

          const dropdown = document.createElement("select");
          dropdown.name = `guestName${i}`;
          dropdown.innerHTML = "<option value=''>Select an existing guest</option>";

          const guestNameInput = document.createElement("input");
          guestNameInput.type = "text";
          guestNameInput.name = `guestName${i}_input`;
          guestNameInput.placeholder = "Type a new guest name";

          let assignedGuest = existingGuests[i - 1] || "";
          if (assignedGuest) {
              const option = document.createElement("option");
              option.value = assignedGuest;
              option.textContent = assignedGuest;
              option.selected = true;
              dropdown.appendChild(option);

              dropdown.style.display = "inline-block";
              guestNameInput.style.display = "none";
          } else {
              dropdown.style.display = "none";
              guestNameInput.style.display = "inline-block";
          }

          const foodChoiceLabel = document.createElement("label");
          foodChoiceLabel.textContent = `Food Choice for Guest ${i}:`;

          const foodChoiceSelect = document.createElement("select");
          foodChoiceSelect.name = `foodChoice${i}`;
          foodChoiceSelect.innerHTML = `
              <option value="">Select a food option</option>
              <option value="Beef">Beef</option>
              <option value="Fish">Fish</option>
              <option value="Chicken">Chicken</option>
              <option value="Vegan">Vegan</option>
          `;

          if (assignedGuest && foodChoices[assignedGuest]) {
              foodChoiceSelect.value = foodChoices[assignedGuest];
          }

          const allergiesLabel = document.createElement("label");
          allergiesLabel.textContent = `Allergies for Guest ${i}:`;
          const allergiesInput = document.createElement("input");
          allergiesInput.type = "text";
          allergiesInput.name = `notes${i}`;

          guestWrapper.appendChild(guestNameLabel);
          guestWrapper.appendChild(dropdown);
          guestWrapper.appendChild(guestNameInput);
          guestWrapper.appendChild(foodChoiceLabel);
          guestWrapper.appendChild(foodChoiceSelect);
          guestWrapper.appendChild(allergiesLabel);
          guestWrapper.appendChild(allergiesInput);

          guestForm.appendChild(guestWrapper);
      }

      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = "Submit RSVP";
      guestForm.appendChild(submitButton);

      guestForm.addEventListener("submit", async (event) => {
          event.preventDefault();

          const guestNames = [];
          const notes = [];
          const foodChoices = [];

          for (let i = 1; i <= guestLimit; i++) {
              const selectedGuest = event.target[`guestName${i}`]?.value || "";
              const newGuest = event.target[`guestName${i}_input`]?.value || "";
              guestNames.push(selectedGuest || newGuest);
              notes.push(event.target[`notes${i}`].value);
              foodChoices.push(event.target[`foodChoice${i}`].value);
          }

          const formData = new FormData();
          formData.append("partyName", party.partyName);
          formData.append("guestLimit", guestLimit);

          for (let i = 1; i <= guestLimit; i++) {
              formData.append(`guestName${i}`, guestNames[i - 1] || '');
              formData.append(`notes${i}`, notes[i - 1] || '');
              formData.append(`foodChoice${i}`, foodChoices[i - 1] || '');
          }

          try {
              const response = await fetch("https://script.google.com/macros/s/AKfycbx9ZikuZK0WadsXA6kySo2ah7odlZhYQSGAm5L0R0qszDztAzFQgO5yUA_jPJjztXSM/exec", {
                  method: "POST",
                  body: formData
              });

              const result = await response.text();
              console.log(result);

              guestForm.reset();
              alert("RSVP submitted successfully!");

          } catch (error) {
              console.error("Error submitting RSVP:", error);
              alert("There was an error submitting your RSVP. Please try again.");
          }
      });

      guestFormContainer.appendChild(guestForm);
  }
});

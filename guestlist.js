document.addEventListener("DOMContentLoaded", async () => {
  const partyNameInput = document.getElementById("partyNameInput");
  const suggestionsBox = document.getElementById("suggestionsBox");
  const guestFormContainer = document.getElementById("guestFormContainer");
  let partyList = [];

  try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbwKfHOFh6RoOgZnThuL0fFOcz1duqSsvRm7AsxrHLQJU72FQlGQ77fQ4Jyqi3BgUeY/exec");
      const data = await response.json();
      partyList = data.filter((item) => item.partyName.trim() !== "");
  } catch (error) {
      console.error("Error fetching party list:", error);
      suggestionsBox.innerHTML = `<div class="error">Error loading party list. Please try again later.</div>`;
      return;
  }

  partyNameInput.addEventListener("input", () => {
      const query = partyNameInput.value.toLowerCase().trim();
      showSuggestions(query);
  });

  function showSuggestions(query) {
      suggestionsBox.innerHTML = "";
      if (!query) return;

      const filteredParties = partyList.filter((party) =>
          party.partyName.toLowerCase().includes(query)
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
      } else {
          suggestionsBox.innerHTML = `<div class="no-match">No matching party found.</div>`;
      }
  }

  function showGuestForm(party) {
      guestFormContainer.innerHTML = "";

      const existingGuests = party.existingGuests || [];
      const guestLimit = party.guestLimit || 2;
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

          if (existingGuests[i - 1]) {
              // Guest assigned, show dropdown only
              const option = document.createElement("option");
              option.value = existingGuests[i - 1];
              option.textContent = existingGuests[i - 1];
              option.selected = true;
              dropdown.appendChild(option);
              guestNameInput.style.display = "none";
          } else {
              // No guest assigned, show text input only
              dropdown.style.display = "none";
          }

          const allergiesLabel = document.createElement("label");
          allergiesLabel.textContent = `Allergies for Guest ${i}:`;
          const allergiesInput = document.createElement("input");
          allergiesInput.type = "text";
          allergiesInput.name = `notes${i}`;

          guestWrapper.appendChild(guestNameLabel);
          guestWrapper.appendChild(dropdown);
          guestWrapper.appendChild(guestNameInput);
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

          for (let i = 1; i <= guestLimit; i++) {
              const selectedGuest = event.target[`guestName${i}`]?.value || "";
              const newGuest = event.target[`guestName${i}_input`]?.value || "";
              guestNames.push(selectedGuest || newGuest);
              notes.push(event.target[`notes${i}`].value);
          }

          const formData = new FormData();
          formData.append("partyName", party.partyName);
          formData.append("guestLimit", guestLimit);

          for (let i = 1; i <= guestLimit; i++) {
              formData.append(`guestName${i}`, guestNames[i - 1] || '');
              formData.append(`notes${i}`, notes[i - 1] || '');
          }

          try {
              const response = await fetch("https://script.google.com/macros/s/AKfycbwKfHOFh6RoOgZnThuL0fFOcz1duqSsvRm7AsxrHLQJU72FQlGQ77fQ4Jyqi3BgUeY/exec", {
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

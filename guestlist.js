document.addEventListener("DOMContentLoaded", async () => {
    const partyNameInput = document.getElementById("partyNameInput");
    const suggestionsBox = document.getElementById("suggestionsBox");
    const guestFormContainer = document.getElementById("guestFormContainer");
    let partyList = []; // To store the fetched party list
  
    // Fetch party list and existing guests from Google Apps Script
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbxElkekYg22fYE_e3nWpc-Ij7BIT6DLuQcmQ0e4y-Q8FcAfwVX007B8c3hooZ_unCb2/exec");
      const data = await response.json();
      console.log(data); // Check if the data is returned correctly
  
      // Filter out empty partyName entries
      partyList = data.filter((item) => item.partyName.trim() !== "");
    } catch (error) {
      console.error("Error fetching party list:", error);
      suggestionsBox.innerHTML = `<div class="error">Error loading party list. Please try again later.</div>`;
      return;
    }
  
    // Event listener for input changes
    partyNameInput.addEventListener("input", () => {
      const query = partyNameInput.value.toLowerCase().trim();
      showSuggestions(query);
    });
  
    function showSuggestions(query) {
      // Clear suggestions box
      suggestionsBox.innerHTML = "";
  
      if (!query) {
        return; // Don't show suggestions if the query is empty
      }
  
      // Filter the party list based on the input query
      const filteredParties = partyList.filter((party) =>
        party.partyName.toLowerCase().includes(query)
      );
  
      // Populate the suggestions box
      if (filteredParties.length > 0) {
        filteredParties.forEach((party) => {
          const suggestion = document.createElement("div");
          suggestion.className = "suggestion";
          suggestion.textContent = party.partyName;
  
          // Event listener for clicking a suggestion
          suggestion.addEventListener("click", () => {
            partyNameInput.value = party.partyName;
            suggestionsBox.innerHTML = ""; // Clear suggestions after selection
            showGuestForm(party); // Show the guest form after party name is selected
          });
  
          suggestionsBox.appendChild(suggestion);
        });
      } else {
        suggestionsBox.innerHTML = `<div class="no-match">No matching party found.</div>`;
      }
    }
  
    function showGuestForm(party) {
      guestFormContainer.innerHTML = ""; // Clear any existing form
  
      const existingGuests = party.existingGuests || []; // Default to empty if no guests
      const guestLimit = party.guestLimit || 2; // Default to 2 if not provided
      const guestForm = document.createElement("form");
  
      // Add fields for each guest based on the guest limit
      for (let i = 1; i <= guestLimit; i++) {  // Use the guest limit to determine how many fields to show
        const guestNameLabel = document.createElement("label");
        guestNameLabel.textContent = `Guest Name ${i}:`;
  
        const dropdown = document.createElement("select");
        dropdown.name = `guestName${i}`;
        dropdown.innerHTML = "<option value=''>Select an existing guest</option>";
  
        // Populate the dropdown with existing guests and their RSVP status
        existingGuests.forEach((guest) => {
          const option = document.createElement("option");
          option.value = guest;
          option.textContent = guest;
          dropdown.appendChild(option);
        });
  
        const guestNameInput = document.createElement("input");
        guestNameInput.type = "text";
        guestNameInput.name = `guestName${i}_input`;
        guestNameInput.placeholder = "Type a new guest name";
  
        guestForm.appendChild(guestNameLabel);
        guestForm.appendChild(dropdown);
        guestForm.appendChild(guestNameInput);
  
        // Allergies for each guest (same as before)
        const allergiesLabel = document.createElement("label");
        allergiesLabel.textContent = `Allergies for Guest ${i}:`;
        const allergiesInput = document.createElement("input");
        allergiesInput.type = "text";
        allergiesInput.name = `notes${i}`;
        guestForm.appendChild(allergiesLabel);
        guestForm.appendChild(allergiesInput);
      }
  
      // Add the submit button
      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = "Submit RSVP";
      guestForm.appendChild(submitButton);
  
      // Handle form submission
      guestForm.addEventListener("submit", async (event) => {
        event.preventDefault();
  
        const guestNames = [];
        const notes = [];
  
        for (let i = 1; i <= guestLimit; i++) {
          const selectedGuest = event.target[`guestName${i}`].value || event.target[`guestName${i}_input`].value;
          guestNames.push(selectedGuest);  // Collect guest name
          notes.push(event.target[`notes${i}`].value);  // Collect allergies
        }
  
        // Prepare the data to send to Google Apps Script
        const formData = new FormData();
        formData.append("partyName", party.partyName);
        formData.append("guestLimit", guestLimit); // Add guestLimit so it can be used in Apps Script
  
        // Send guest names and allergies
        for (let i = 1; i <= guestLimit; i++) {
          formData.append(`guestName${i}`, guestNames[i-1] || '');
          formData.append(`notes${i}`, notes[i-1] || '');  // Send allergies/notes
        }
  
        try {
          const response = await fetch("https://script.google.com/macros/s/AKfycbxElkekYg22fYE_e3nWpc-Ij7BIT6DLuQcmQ0e4y-Q8FcAfwVX007B8c3hooZ_unCb2/exec", {
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
  
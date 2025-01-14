document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadTableData();
    loadParticipants();
    // Get user role from localStorage
    const userRole = localStorage.getItem("userRole") || "UTM LECTURER";
    console.log(localStorage.getItem("userRole"));
    const owner = new URLSearchParams(window.location.search).get("owner");
    const userEmail = localStorage.getItem("userEmail");
    if (owner.trim() != userEmail.trim()) {
      const buttonsToHide = [".custom-add-btn", ".btn"];

      buttonsToHide.forEach((selector) => {
        document.querySelectorAll(selector).forEach((button) => {
          button.style.display = "none"; // Hide the button
        });
      });
    }

    document
      .getElementById("logout")
      .addEventListener("click", function () {
        // Clear localStorage
        localStorage.clear();
        // Optionally, log out message for debugging
        console.log("User logged out, localStorage cleared.");
      });

    // Update the UTM ROLE nav item with the user role
    const roleNavItem = document.querySelector(
      '.nav-item a.nav-link[href="#"]'
    );
    if (roleNavItem) {
      roleNavItem.textContent = userRole;
    }
  });
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const groupID = new URLSearchParams(window.location.search).get(
    "groupID"
  );
  const session = new URLSearchParams(window.location.search).get(
    "session"
  );
  const userEmail = localStorage.getItem("userEmail");
  const owner = new URLSearchParams(window.location.search).get("owner");
  const emailContainer = document.getElementById("email-container");
  const emailInput = document.getElementById("email-input");
  const emailList = [];

  // Add email to the list
  emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && emailInput.value.trim() !== "") {
      e.preventDefault();
      if (!emailList.includes(emailInput.value.trim())) {
        const email = emailInput.value.trim();
        emailList.push(email);
        const chip = document.createElement("div");
        chip.className = "email-chip";
        chip.innerHTML = `<span>${email}</span> <button onclick="removeEmail('${email}')">&times;</button>`;
        emailContainer.insertBefore(chip, emailInput);
        emailInput.value = "";
      }
    }
  });

  // Remove email from the list
  function removeEmail(email) {
    const index = emailList.indexOf(email);
    if (index > -1) {
      emailList.splice(index, 1);
      renderEmails();
    }
  }

  // Render emails
  function renderEmails() {
    emailContainer.innerHTML = "";
    emailList.forEach((email) => {
      const emailChip = document.createElement("div");
      emailChip.className = "email-chip";
      emailChip.innerHTML = `<span>${email}</span><button onclick="removeEmail('${email}')">&times;</button>`;
      emailContainer.appendChild(emailChip);
    });
    emailContainer.appendChild(emailInput);
  }
  function openAddModal() {
    // Reset the form
    document.getElementById("addForm").reset();
    const userEmail = localStorage.getItem("userEmail");
    // Set the placeholder for the Owner field
    const ownerInput = document.getElementById("addOwner");
    ownerInput.value = userEmail;
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById("addModal"));
    modal.show();
  }

  // Load the table data with groupID from the URL (for the group the user is viewing)
  async function loadTableData() {
    try {
      const jsonStr = JSON.stringify({
        table: "link_group",
        groupID: groupID, // Pass groupID to the server
      });
      console.log(jsonStr);

      const response = await fetch(
        `/read?jsonStr=${encodeURIComponent(jsonStr)}`
      );
      const data = await response.json();

      const tableBody = document.querySelector("table tbody");
      tableBody.innerHTML = "";

      data.forEach((row, index) => {
        const tableRow = `
          <tr data-id="${row.linkID}">
            <td>${index + 1}</td>
            <td>${row.category}</td>
            <td>${row.datetime || "-"}</td>
            <td>${row.owner}</td>
            <td>${row.description}</td>
            <td><a href="${row.links}" target="_blank">${row.links}</a></td>
            <td class="btn-action">
              <button class="btn-edit" onclick="openUpdateModal(
              ${row.linkID}, '${row.category}',  '${row.owner}', '${
          row.description
        }', '${row.links}')">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button class="btn-delete"  onclick="deleteRow(${
                row.linkID
              })">
                <i class="bi bi-trash3"></i>
              </button>
            </td>
          </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", tableRow);
      });
      if (owner.trim() != userEmail.trim()) {
        const buttonsToHide = [".btn-edit", ".btn-delete"];

        buttonsToHide.forEach((selector) => {
          document.querySelectorAll(selector).forEach((button) => {
            button.style.display = "none"; // Hide the button
          });
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }
  async function loadParticipants() {
    const data = JSON.stringify({ table: "user_group", groupID: groupID });
    const response = await fetch(
      `/read?jsonStr=${encodeURIComponent(data)}`
    );
    const result = await response.json();
    console.log("fetch participants:", data);
    console.log(result);
    const participants = result.userIDs || [];
    const participantList = document.querySelector(".list-group");
    participantList.innerHTML = ""; // Clear existing list

    participants.forEach((userID) => {
      const listItem = document.createElement("li");
      listItem.className =
        "list-group-item d-flex justify-content-between align-items-center";
      listItem.style.wordBreak = "break-word"; // Ensure wrapping for long names
      listItem.innerHTML = `${userID}
        <button class="btn btn-sm btn-danger" onclick="deleteParticipant('${userID}')">
          <i class="bi bi-trash"></i>
        </button>
      `;
      participantList.appendChild(listItem);
    });
    if (owner.trim() !== userEmail.trim()) {
      const deleteButtons = document.querySelectorAll(".btn-danger");
      deleteButtons.forEach((button) => {
        button.style.display = "none";
      });
    }
  }

  async function addParticipant(event) {
    event.preventDefault();
    const participants = emailList; // emailList holds emails

    if (participants.length === 0) {
      alert("Please add at least one participant.");
      return;
    }

    // Prepare the JSON payload
    const requestData = {
      table: "user_group",
      data: {
        participants: participants, // Include participants directly in the request
        groupID: groupID,
      },
    };

    console.log("Constructed group:", JSON.stringify(requestData));

    try {
      // Send the POST request to the backend
      const response = await fetch("/createGroup?jsonStr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        alert("successfull add participants");
        location.reload(); // Refresh to reflect the new group
      } else {
        alert(`Failed to add participant: ${result.error}`);
      }
    } catch (error) {
      console.error("Error adding participant:", error);
      alert("An unexpected error occurred.");
    }
  }
  async function deleteParticipant(email) {
    console.log(email);
    const data = {
      table: "user_group",
      userID: email,
      groupID: groupID,
    };
    console.log(data);
    try {
      const response = await fetch("/delete?jsonStr", {
        method: "POST", // Use POST for sending data
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Deleted successfully!");
        loadParticipants();
      } else {
        const error = await response.json();
        alert(`Failed to delete the participant: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("An error occurred while deleting the record.");
    }
  }
  async function loadCategories() {
    const url = `/read?jsonStr=${encodeURIComponent(
      JSON.stringify({ table: "category" })
    )}`;

    try {
      const response = await fetch(url, { method: "GET" });
      const data = await response.json();
      console.log("Fetched categories:", data.categories);
      if (data.categories && data.categories.length > 0) {
        const categorySelectAdd =
          document.getElementById("categoryDropdown");
        const categorySelectUpdate = document.getElementById(
          "updateCategoryDropdown"
        );

        data.categories.forEach((category) => {
          const optionAdd = document.createElement("option");
          optionAdd.value = category;
          optionAdd.text = category;
          categorySelectAdd.appendChild(optionAdd);

          const optionUpdate = document.createElement("option");
          optionUpdate.value = category;
          optionUpdate.text = category;
          categorySelectUpdate.appendChild(optionUpdate);
        });
      } else {
        console.log("No categories found");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  // Add a new row with groupID from URL
  async function addRow(event) {
    event.preventDefault();

    console.log("groupID time nak add: ", groupID);
    const category = document.getElementById("categoryDropdown").value;
    const owner = document.getElementById("addOwner").value;
    const description = document.getElementById("addDescription").value;
    const links = document.getElementById("addLink").value;

    const data = {
      table: "link_group",
      data: {
        category: category,
        owner: owner,
        session: session,
        description: description,
        links: links,
      },
    };

    // Log the constructed JSON to verify
    console.log("Constructed JSON:", JSON.stringify(data));

    const response = await fetch("/createLink?jsonStr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: "link_group",
        data: {
          category,
          session,
          owner,
          description,
          links,
          groupID,
          userEmail,
        },
      }),
    });

    if (response.ok) {
      alert("Link added successfully!");
      loadTableData();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addModal")
      );
      modal.hide();
    } else {
      alert("Failed to add the link!");
    }
  }

  // Attach update functionality to the button
  function openUpdateModal(id, category, owner, description, links) {
    console.log(id);
    document.getElementById("updateId").value = id;
    document.getElementById("updateCategoryDropdown").value = category;
    document.getElementById("updateOwner").value = owner;
    document.getElementById("updateDescription").value = description;
    document.getElementById("updateLink").value = links;

    const modal = new bootstrap.Modal(
      document.getElementById("updateModal")
    );
    modal.show();
  }

  // Update a row with groupID
  async function updateRow(event) {
    event.preventDefault();

    const id = document.getElementById("updateId").value;
    const category = document.getElementById(
      "updateCategoryDropdown"
    ).value;
    const owner = document.getElementById("updateOwner").value;
    const description = document.getElementById("updateDescription").value;
    const links = document.getElementById("updateLink").value;

    const data = {
      table: "link",
      id: id,
      data: {
        category: category,
        session: session,
        owner: owner,
        description: description,
        links: links,
      },
    };

    console.log("updated JSON:", JSON.stringify(data));
    try {
      const response = await fetch("/updateLink?jsonStr", {
        method: "POST", // Update to use POST for sending data
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Updated successfully!");
        loadTableData();
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("updateModal")
        );
        modal.hide();
      } else {
        const error = await response.json();
        alert(`Failed to update the record: ${error.message}`);
      }
    } catch (error) {
      console.error("Error updating record:", error);
      alert("An error occurred while updating the record.");
    }
  }

  // Delete a row with groupID
  async function deleteRow(id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    const data = {
      table: "link_group",
      id: id,
      groupID: groupID, // Pass groupID for link deletion
    };
    console.log("data sebelum delete:", data);
    try {
      const response = await fetch("/delete?jsonStr", {
        method: "POST", // Use POST for sending data
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Deleted successfully!");
        loadTableData();
      } else {
        const error = await response.json();
        alert(`Failed to delete the record: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      alert("An error occurred while deleting the record.");
    }
  }

  function searchTable() {
    const input = document.getElementById("search-bar").value.toLowerCase();
    const rows = document.querySelectorAll("table tbody tr");
    let found = false;

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const match = Array.from(cells).some((cell) =>
        cell.textContent.toLowerCase().includes(input)
      );
      row.style.display = match ? "" : "none";
      if (match) found = true;
    });

    document.getElementById("no-results").classList.toggle("d-none", found);
  }


  async function loadFilterCategories() { 
    const url = `/read?jsonStr=${encodeURIComponent( 
      JSON.stringify({ table: "category" }) 
    )}`; 

    fetch(url, { 
      method: "GET", 
    }) 
      .then((response) => response.json()) 
      .then((data) => { 
        console.log("Fetched categories:", data.categories); 
        if (data.categories && data.categories.length > 0) { 
          const categoryDropdown = document.getElementById("filterCategoryDropdown"); 
          categoryDropdown.innerHTML = ''; // Clear any previous categories
          data.categories.forEach((category) => { 
            const listItem = document.createElement("li");
            listItem.classList.add("dropdown-item");
            listItem.textContent = category;  // Set category name as text
            listItem.addEventListener("click", () => {
              // When a category is clicked, filter the table rows by that category
              filterTableByCategory(category);
              // Optionally, update the button text to show selected category
              document.getElementById("filterCategoryButton").textContent = category;
            });
            categoryDropdown.appendChild(listItem); 
          }); 
        } else { 
          console.log("No categories found"); 
        } 
      }) 
      .catch((error) => { 
        console.error("Error fetching categories:", error); 
      }); 
    }
  function filterTableByCategory(selectedCategory) {
    const tableBody = document.querySelector("table tbody");
    Array.from(tableBody.rows).forEach((row) => {
      const categoryCell = row.cells[1]; // Category is in the 2nd column (index 1)
      if (categoryCell) {
        const category = categoryCell.textContent.trim().toLowerCase();
        if (category.includes(selectedCategory.toLowerCase())) {
          row.style.display = "";  // Show the row
        } else {
          row.style.display = "none";  // Hide the row
        }
      }
    });
  }

  // Attach event listeners and initialize data on page load
  document.getElementById("addForm").addEventListener("submit", addRow);
  document
    .getElementById("updateForm")
    .addEventListener("submit", updateRow);
  document
    .getElementById("addParticipantForm")
    .addEventListener("submit", addParticipant);
  document.addEventListener("DOMContentLoaded", loadFilterCategories);
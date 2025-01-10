document.addEventListener("DOMContentLoaded", () => {
    // Get user role from localStorage
    const userRole = localStorage.getItem("userRole") || "UTM LECTURER";
    console.log(localStorage.getItem("userRole"));
    console.log(userRole);
    // Update the UTM ROLE nav item with the user role
    const roleNavItem = document.querySelector(
      '.nav-item a.nav-link[href="#"]'
    );
    if (roleNavItem) {
      roleNavItem.textContent = userRole;
    }
  });

  const emailContainer = document.getElementById("email-container");
  const emailInput = document.getElementById("email-input");
  const emailList = [];
  const userEmail = localStorage.getItem("userEmail");// Load the table data with userEmail from localStorage
  const userID = localStorage.getItem("userId");

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
      // Show the modal
      const modal = new bootstrap.Modal(document.getElementById("addModal"));
      modal.show();
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

  async function loadTableData() {
    try {
      
      console.log("userID: ", localStorage.getItem("userId"));
      if (!userID) {
        alert("UserID not found. Please log in.");
        return;
      }

      const jsonStr = JSON.stringify({table: "link",userEmail,}); // Pass userID to the server
      console.log(jsonStr);

      const response = await fetch(`/read?jsonStr=${encodeURIComponent(jsonStr)}`);
      const data = await response.json();

      const tableBody = document.querySelector("table tbody");
      tableBody.innerHTML = "";

      data.forEach((row, index) => {
        const tableRow = `
          <tr data-id="${row.linkID}">
            <td>${index + 1}</td>
            <td>${row.category}</td>
            <td>${row.datetime || "-"}</td>
            <td>${row.session}</td>
            <td class="wrap">${row.owner}</td>
            <td class="wrap">${row.description}</td>
            <td class="wrap"><a href="${row.links}" target="_blank">${row.links}</a></td>
            <td class="btn-action">
              <button class="btn-edit" onclick="openUpdateModal(${
                row.linkID}, '${row.category}', '${row.session}',  '${row.owner}', '${
                row.description}', '${row.links}')"><i class="bi bi-pencil-square"></i></button>
              <button class="btn-delete" onclick="deleteRow(${row.linkID})"><i class="bi bi-trash3"></i></button>
              <button class="btn-send" onclick="openShareModal(${row.linkID})"><i class="bi bi-send"></i></button>
            </td>
          </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", tableRow);
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  async function loadCategories() {
    const url = `/read?jsonStr=${encodeURIComponent(JSON.stringify({ table: "category" }))}`;

    fetch(url, {method: "GET",})
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched categories:", data.categories);
        if (data.categories && data.categories.length > 0) {
          const categorySelect =document.getElementById("categoryDropdown");
          const categorySelectUpdate = document.getElementById("updateCategoryDropdown");
          data.categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category;
            option.text = category;
            categorySelect.appendChild(option);

            const optionUpdate = document.createElement("option");
            optionUpdate.value = category;
            optionUpdate.text = category;
            categorySelectUpdate.appendChild(optionUpdate);
          });
        } else {
          console.log("No categories found");
        }
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }
  async function loadSessions() {
    const url = `/read?jsonStr=${encodeURIComponent(JSON.stringify({ table: "session" }))}`;

    fetch(url, {method: "GET",})
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched sessions:", data.sessions);
        if (data.sessions && data.sessions.length > 0) {
          const sessionSelect = document.getElementById("sessionDropdown");
          const sessionSelectUpdate = document.getElementById("updateSessionDropdown");
          data.sessions.forEach((session) => {
            const option = document.createElement("option");
            option.value = session;
            option.text = session;
            sessionSelect.appendChild(option);

            const optionUpdate = document.createElement("option");
            optionUpdate.value = session;
            optionUpdate.text = session;
            sessionSelectUpdate.appendChild(optionUpdate);
          });
        } else {
          console.log("No session found");
        }
      })
      .catch((error) => {
        console.error("Error fetching session:", error);
      });
  }

  // Add a new row 
  async function addRow(event) {
    event.preventDefault();

    console.log("userEmail: ", localStorage.getItem("userEmail"));
    if (!userID) {
      alert("UserID not found. Please log in.");
      return;
    }
    
    const category = document.getElementById("categoryDropdown").value;
    const session = document.getElementById("sessionDropdown").value;
    const owner = document.getElementById("addOwner").value;
    const description = document.getElementById("addDescription").value;
    const links = document.getElementById("addLink").value;

    const data = {
      table: "link",
      data: {
        category: category,
        session: session,
        owner: owner,
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
        table: "link",
        data: { category, session, owner, description, links, userEmail },
      }),
    });

    if (response.ok) {
      alert("Row added successfully!");
      loadTableData();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addModal")
      );
      modal.hide();
    } else {
      alert("Failed to add the row!");
    }
  }

  function openShareModal(linkID) {
    // Store the linkID in a closure or use it in the scope of the modal
    //const currentLinkID = linkID;

    // Show the share modal
    const modal = new bootstrap.Modal(document.getElementById('shareModal'));
    modal.show();

    // Reset the view to shareOption
    document.getElementById('shareOption').style.display = 'block';
    document.getElementById('shareUser').style.display = 'none';
    document.getElementById('shareGroup').style.display = 'none';

    // Attach the linkID to button events for sharing
    document.getElementById('shareToUserButton').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent form submission or default button behavior
        shareLinkToUser(linkID);
    });
    document.getElementById('shareToGroupButton').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent form submission or default button behavior
        const selectedGroup = document.getElementById('groupSelect').value;  // Get the selected group
        if (selectedGroup) {
            shareLinkToGroup(linkID, selectedGroup);  // Pass both linkID and selected group
        } else {
            alert('Please select a group to share the link with.');
        }
    });
  }
  function showShareUser() {
    document.getElementById('shareOption').style.display = 'none';
    document.getElementById('shareUser').style.display = 'block';
  }

  function showShareGroup() {
    document.getElementById('shareOption').style.display = 'none';
    document.getElementById('shareGroup').style.display = 'block';

    // Fetch groups and populate the dropdown
    fetchGroups();
  }

  function shareLinkToUser(id){
    console.log("id link:", id);
    if (emailList.length === 0) {
        alert("Please add at least one participant.");
        return;}

    const data = {
        table: "user_link",
        data: {
            linkID: id,
            participants: emailList
        },
    };
    console.log("Data to send:", JSON.stringify(data));

    fetch("/createGroup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Link successfully shared with users.");
            location.reload();
        } else {
            alert(`Failed to share link: ${result.error}`);
        }
    })
    .catch(error => {
        console.error("Error sharing link:", error);
        alert("An unexpected error occurred while sharing the link.");
    });
    }

    function shareLinkToGroup(id,groupName){
        console.log("link id:",id);
        const data = {
            table: "shareLinkGroup",
            linkID:id,
            groupName:groupName
          };
        console.log("share to group:", JSON.stringify(data));
        fetch("/createGroup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert("Link successfully shared with users.");
                location.reload();
            } else {
                alert(`Failed to share link: ${result.error}`);
            }
        })
        .catch(error => {
            console.error("Error sharing link:", error);
            alert("An unexpected error occurred while sharing the link.");
        });
    }

    async function fetchGroups() {
        console.log(userEmail)
        const data = {
            table: "groups",
            userEmail:userEmail,
          };
        const url = `/read?jsonStr=${encodeURIComponent(JSON.stringify(data))}`;
  
          try {
            const response = await fetch(url, { method: "GET" });
            const data = await response.json();
            console.log("Fetched group:", data.groupNames);
            if (data.groupNames && data.groupNames.length > 0) {
              const groupSelectAdd = document.getElementById("groupSelect");
  
              data.groupNames.forEach((groupName) => {
                const optionAdd = document.createElement("option");
                optionAdd.value = groupName;
                optionAdd.text = groupName;
                groupSelectAdd.appendChild(optionAdd);
              });
            } else {
              console.log("No groups found");
            }
          } catch (error) {
            console.error("Error fetching groupNames:", error);
          }
    }
  
  function openUpdateModal(// Attach update functionality to the button
    id,
    category,
    session,
    owner,
    description,
    links
  ) {
    console.log(id);
    document.getElementById("updateId").value = id;
    document.getElementById("updateCategoryDropdown").value = category;
    document.getElementById("updateSessionDropdown").value = session;
    document.getElementById("updateOwner").value = owner;
    document.getElementById("updateDescription").value = description;
    document.getElementById("updateLink").value = links;

    const modal = new bootstrap.Modal(
      document.getElementById("updateModal")
    );
    modal.show();
  }

  // Update a row with userID verification
  async function updateRow(event) {
    event.preventDefault();

    const id = document.getElementById("updateId").value;
    const category = document.getElementById("updateCategoryDropdown").value;
    const session = document.getElementById("updateSessionDropdown").value;
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

  // Delete a row with userID verification
  async function deleteRow(id) {
    const data = {
      table: "link",
      id: id,
      userID: userEmail,
    };
    console.log("delete?",data)
    if (!confirm("Are you sure you want to delete this record?")) return;

    
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

  //Search and Filter Function
  document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const filterDropdown = document.getElementById("filterDropdown");
    const tableBody = document.querySelector("table tbody");

    // Filter rows based on search query
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      Array.from(tableBody.rows).forEach((row) => {
        const cells = Array.from(row.cells);
        const matches = cells.some((cell) =>
          cell.textContent.toLowerCase().includes(query)
        );
        row.style.display = matches ? "" : "none";
      });
    });

    // Filter rows based on category or session
    document.querySelectorAll(".dropdown-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const filterType = e.target.getAttribute("data-filter");

        // Prompt user to select a value for filtering
        const value = prompt(
          `Enter ${filterType} to filter:`
        ).toLowerCase();

        Array.from(tableBody.rows).forEach((row) => {
          const cellIndex = filterType === "category" ? 1 : 3; // Category: 1, Session: 3
          const cellText = row.cells[cellIndex].textContent.toLowerCase();
          row.style.display = cellText.includes(value) ? "" : "none";
        });
      });
    });
  });

  // Attach event listeners and initialize data on page load
  document.getElementById("addForm").addEventListener("submit", addRow);
  document.getElementById("updateForm").addEventListener("submit", updateRow);
  document.getElementById('shareToUserButton').addEventListener('click', () => {
    shareLinkToUser(currentLinkID);
    });
  document.addEventListener("DOMContentLoaded", loadTableData);
  document.addEventListener("DOMContentLoaded", loadCategories);
  document.addEventListener("DOMContentLoaded", loadSessions);
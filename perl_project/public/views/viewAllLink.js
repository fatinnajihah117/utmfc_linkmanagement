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

// async function loadTableData() {
  // try {
    
  //   console.log("userID: ", localStorage.getItem("userId"));
  //   if (!userID) {
  //     alert("UserID not found. Please log in.");
  //     return;
  //   }

  //   const jsonStr = JSON.stringify({table: "link",userEmail,}); // Pass userID to the server
  //   console.log(jsonStr);

  //   const response = await fetch(`/read?jsonStr=${encodeURIComponent(jsonStr)}`);
  //   const data = await response.json();

  //   const tableBody = document.querySelector("table tbody");
  //   tableBody.innerHTML = "";

  //   data.forEach((row, index) => {
  //     const tableRow = `
  //       <tr data-id="${row.linkID}">
  //         <td>${index + 1}</td>
  //         <td>${row.category}</td>
  //         <td>${row.datetime || "-"}</td>
  //         <td>${row.session}</td>
  //         <td class="wrap">${row.owner}</td>
  //         <td class="wrap">${row.description}</td>
  //         <td class="wrap"><a href="${row.links}" target="_blank">${row.links}</a></td>
  //         <td class="btn-action">
  //           <button class="btn-edit" onclick="openUpdateModal(${
  //             row.linkID}, '${row.category}', '${row.session}',  '${row.owner}', '${
  //             row.description}', '${row.links}')"><i class="bi bi-pencil-square"></i></button>
  //           <button class="btn-delete" onclick="deleteRow(${row.linkID})"><i class="bi bi-trash3"></i></button>
  //           <button class="btn-send" onclick="openShareModal(${row.linkID})"><i class="bi bi-send"></i></button>
  //         </td>
  //       </tr>
  //     `;
  //     tableBody.insertAdjacentHTML("beforeend", tableRow);
  //   });
  // } catch (error) {
  //   console.error("Error loading data:", error);
  // }

//   try {
//       console.log("userID: ", localStorage.getItem("userId"));
//       if (!userID) {
//           alert("UserID not found. Please log in.");
//           return;
//       }

//       const jsonStr = JSON.stringify({ table: "link", userEmail });
//       console.log(jsonStr);

//       const response = await fetch(`/read?jsonStr=${encodeURIComponent(jsonStr)}`);
//       const data = await response.json();

//       const tableBody = document.querySelector("table tbody");
//       tableBody.innerHTML = "";
//       const filteredData = data.filter(row => row.owner === userEmail);
      
//       filteredData.forEach((row, index) => {
//           const isShared = row.is_shared ? 'class="shared"' : '';
//           const tableRow = `
//             <tr data-id="${row.linkID}" ${isShared}>
//               <td>${index + 1}</td>
//               <td>${row.category}</td>
//               <td>${row.datetime || "-"}</td>
//               <td>${row.session}</td>
//               <td class="wrap">${row.owner}</td>
//               <td class="wrap">${row.description}</td>
//               <td class="wrap"><a href="${row.links}" target="_blank">${row.links}</a></td>
//               <td class="btn-action">
//                 <button class="btn-edit" onclick="openUpdateModal(${
//                   row.linkID}, '${row.category}', '${row.session}',  '${row.owner}', '${
//                   row.description}', '${row.links}')"><i class="bi bi-pencil-square"></i></button>
//                 <button class="btn-delete" onclick="deleteRow(${row.linkID})"><i class="bi bi-trash3"></i></button>
//                 <button class="btn-send" onclick="openShareModal(${row.linkID})"><i class="bi bi-send"></i></button>
//                 <button class="btn-info" onclick="showSharedInfo(${row.linkID})"><i class="bi bi-info-circle"></i></button>
//               </td>
//             </tr>
//           `;
//           tableBody.insertAdjacentHTML("beforeend", tableRow);
//       });
//   } catch (error) {
//       console.error("Error loading data:", error);
//   }
// }

let currentPage = 1;
const rowsPerPage = 10;
let tableData = [];

async function loadTableData() {
  try {
    console.log("userID: ", localStorage.getItem("userId"));
    if (!userID) {
      alert("UserID not found. Please log in.");
      return;
    }

    const jsonStr = JSON.stringify({ table: "link", userEmail });
    console.log(jsonStr);

    const response = await fetch(`/read?jsonStr=${encodeURIComponent(jsonStr)}`);
    const data = await response.json();

    tableData = data; // Save the data for pagination
    renderTable(); // Render the first page
    setupPagination();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function renderTable() {
  const tableBody = document.querySelector("table tbody");
  tableBody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const rows = tableData.slice(start, end);

  rows.forEach((row, index) => {
    const tableRow = `
      <tr data-id="${row.linkID}">
        <td>${start + index + 1}</td>
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
          <button class="btn-info" onclick="showSharedInfo(${row.linkID})"><i class="bi bi-info-circle"></i></button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", tableRow);
  });
}

function setupPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(tableData.length / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener("click", () => {
      currentPage = i;
      renderTable();
      setupPagination();
    });
    pagination.appendChild(pageItem);
  }
}


async function showSharedInfo(linkID) {
  try {
      const responseUser = await fetch(`/readSharedInfo?linkID=${linkID}&type=user`);
      const userData = await responseUser.json();

      const responseGroup = await fetch(`/readSharedInfo?linkID=${linkID}&type=group`);
      const groupData = await responseGroup.json();

      const sharedUsers = userData.map(user => `<li>${user.userID}</li>`).join('');
      const sharedGroups = groupData.map(group => `<li>${group.group_name}</li>`).join('');

      console.log(sharedUsers);
      console.log(sharedGroups);
      let popupContent = '';

      if (sharedUsers && sharedGroups) {
          popupContent = `
              <div>
                  <h4>Shared with Users:</h4>
                  <ul>${sharedUsers}</ul>
                  <h4>Shared with Groups:</h4>
                  <ul>${sharedGroups}</ul>
              </div>
          `;
      } else if (sharedUsers) {
          popupContent = `
              <div>
                  <h4>Shared with Users:</h4>
                  <ul>${sharedUsers}</ul>
              </div>
          `;
      } else if (sharedGroups) {
          popupContent = `
              <div>
                  <h4>Shared with Groups:</h4>
                  <ul>${sharedGroups}</ul>
              </div>
          `;
      } else {
          popupContent = `
              <div>
                  <p>No sharing information available. This link has not been shared to anyone yet.</p>
              </div>
          `;
      }

      // Display the content in the modal
      document.getElementById("sharedInfoModalContent").innerHTML = popupContent;
      $('#sharedInfoModal').modal('show'); // Bootstrap modal show
  } catch (error) {
      console.error("Error fetching shared information:", error);
      alert("An unexpected error occurred while fetching shared information.");
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
          alert("Link successfully shared to "+emailList);
          loadTableData();
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
              alert("Link successfully shared with to" + groupName);
              loadTableData();
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
  links) {
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

async function loadFilterSessions() {
  const url = `/read?jsonStr=${encodeURIComponent(
    JSON.stringify({ table: "session" })
  )}`;

  fetch(url, {
    method: "GET",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Fetched sessions:", data.sessions);
      if (data.sessions && data.sessions.length > 0) {
        const sessionDropdown = document.getElementById("filterSessionDropdown");
        sessionDropdown.innerHTML = ''; // Clear any previous sessions
        data.sessions.forEach((session) => {
          const listItem = document.createElement("li");
          listItem.classList.add("dropdown-item");
          listItem.textContent = session;  // Set session name as text
          listItem.addEventListener("click", () => {
            // When a session is clicked, filter the table rows by that session
            filterTableBySession(session);
            // Optionally, update the button text to show selected session
            document.getElementById("filterSessionButton").textContent = session;
          });
          sessionDropdown.appendChild(listItem);
        });
      } else {
        console.log("No sessions found");
      }
    })
    .catch((error) => {
      console.error("Error fetching sessions:", error);
    });
}
function filterTableBySession(selectedSession) { 
  const tableBody = document.querySelector("table tbody"); 

  Array.from(tableBody.rows).forEach((row) => { 
    const sessionCell = row.cells[3]; // Assuming session is in the 3rd column (index 2)
    
    if (sessionCell) {
      const session = sessionCell.textContent.trim().toLowerCase();
      console.log("Checking row for session:", session); // Debugging line

      // Log the selected session
      console.log("Selected Session:", selectedSession);

      if (session.includes(selectedSession.toLowerCase())) {
        row.style.display = "";  // Show the row
      } else {
        row.style.display = "none";  // Hide the row
      }
    }
  }); 
}

// Attach event listeners and initialize data on page load
document.getElementById("addForm").addEventListener("submit", addRow);
document.getElementById("updateForm").addEventListener("submit", updateRow);
document.addEventListener("DOMContentLoaded", loadFilterCategories);
document.addEventListener("DOMContentLoaded", loadFilterSessions);
document.addEventListener("DOMContentLoaded", loadTableData);
document.addEventListener("DOMContentLoaded", loadCategories);
document.addEventListener("DOMContentLoaded", loadSessions);
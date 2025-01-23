document.addEventListener("DOMContentLoaded", () => {
  // Get user role from localStorage
  const userRole = localStorage.getItem("userRole") || "UTM LECTURER";

  // Update the UTM ROLE nav item with the user role
  const roleNavItem = document.querySelector(
    '.nav-item a.nav-link[href="#"]'
  );
  if (roleNavItem) {
    roleNavItem.textContent = userRole;
  }
});


// Load the table data with userID from localStorage
// async function loadTableData() {
//   try {
//       const userEmail = localStorage.getItem("userEmail");
//       console.log("userEmail: ", userEmail);

//       if (!userEmail) {
//           alert("UserEmail not found. Please log in.");
//           return;
//       }

//       const jsonStr = JSON.stringify({
//           table: "link",
//           userEmail: userEmail  // Pass userEmail to the server
//       });
//       console.log(jsonStr);

//       const response = await fetch(
//           `/read?jsonStr=${encodeURIComponent(jsonStr)}`
//       );
//       const data = await response.json();

//       const tableBody = document.querySelector("table tbody");
//       tableBody.innerHTML = "";

//       // Filter data where the owner is not the same as the current userEmail
//       const filteredData = data.filter(row => row.owner !== userEmail);

//       // Iterate over the filtered data and generate table rows
//       filteredData.forEach((row, index) => {
//           const tableRow = `
//             <tr data-id="${row.linkID}">
//               <td>${index + 1}</td>
//               <td>${row.category}</td>
//               <td>${row.datetime || "-"}</td>
//               <td>${row.session}</td>
//               <td>${row.owner}</td>
//               <td>${row.description}</td>
//               <td><a href="${row.links}" target="_blank">${row.links}</a></td>
              
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
let filteredData = [];

async function loadTableData() {
  try {
      const userEmail = localStorage.getItem("userEmail");
      console.log("userEmail: ", userEmail);

      if (!userEmail) {
          alert("UserEmail not found. Please log in.");
          return;
      }

      const jsonStr = JSON.stringify({
          table: "link",
          userEmail: userEmail  // Pass userEmail to the server
      });
      console.log(jsonStr);

      const response = await fetch(
          `/read?jsonStr=${encodeURIComponent(jsonStr)}`
      );
      const data = await response.json();

      // Filter data where the owner is not the same as the current userEmail
      filteredData = data.filter(row => row.owner !== userEmail);

      renderTable();
      setupPagination();
  } catch (error) {
      console.error("Error loading data:", error);
  }
}

function renderTable() {
  const tableBody = document.querySelector("table tbody");
  tableBody.innerHTML = "";

  // Determine which rows to show for the current page
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const rowsToDisplay = filteredData.slice(start, end);

  rowsToDisplay.forEach((row, index) => {
      const tableRow = `
        <tr data-id="${row.linkID}">
          <td>${start + index + 1}</td>
          <td>${row.category}</td>
          <td>${row.datetime || "-"}</td>
          <td>${row.session}</td>
          <td class="wrap">${row.owner}</td>
          <td class="wrap">${row.description}</td>
          <td class="wrap"><a href="${row.links}" target="_blank">${row.links}</a></td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", tableRow);
  });
}

function setupPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

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


async function loadSessions() {
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
        const sessionSelect = document.getElementById("sessionDropdown");
        data.sessions.forEach((session) => {
          const option = document.createElement("option");
          option.value = session;
          option.text = session;
          sessionSelect.appendChild(option);
        });
      } else {
        console.log("No session found");
      }
    })
    .catch((error) => {
      console.error("Error fetching session:", error);
    });
}

// Add a new row with userID from localStorage
async function addRow(event) {
  event.preventDefault();

  const userID = localStorage.getItem("userId");
  console.log("userId: ", localStorage.getItem("userId"));
  if (!userID) {
    alert("UserID not found. Please log in.");
    return;
  }
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFilter = urlParams.get("categoryName");

  const category = categoryFilter;
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
      data: { category, session, owner, description, links, userID },
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

// Attach update functionality to the button
function openUpdateModal(
  id,
  category,
  session,
  owner,
  description,
  links
) {
  console.log(id);
  document.getElementById("updateId").value = id;
  document.getElementById("updateCategory").value = category;
  document.getElementById("updateSession").value = session;
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

  const userID = localStorage.getItem("userId"); // Fix variable name
  if (!userID) {
    alert("UserID not found. Please log in.");
    return;
  }

  const id = document.getElementById("updateId").value;
  const category = document.getElementById("updateCategory").value;
  const session = document.getElementById("updateSession").value;
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
  const userID = localStorage.getItem("userId"); // Fix variable name
  if (!userID) {
    alert("UserID not found. Please log in.");
    return;
  }

  if (!confirm("Are you sure you want to delete this record?")) return;

  const data = {
    table: "link",
    id: id,
    userID: userID,
  };

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
document
  .getElementById("updateForm")
  .addEventListener("submit", updateRow);
document.addEventListener("DOMContentLoaded", loadTableData);
document.addEventListener("DOMContentLoaded", loadSessions);
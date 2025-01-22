const emailContainer = document.getElementById("email-container");
  const emailInput = document.getElementById("email-input");
  const emailList = [];
  const userEmail = new URLSearchParams(window.location.search).get("userEmail");

  function goBack() {
    const role = new URLSearchParams(window.location.search).get("role");
    window.location.href = `admin-userList.html?role=${role}`; // Redirect back with the query string
    }
    let currentPage = 1;
const rowsPerPage = 10;
let allData = []; // Store all data for pagination

async function loadTableData() {
  try {
    const userEmail = new URLSearchParams(window.location.search).get("userEmail");
    console.log("userEmail punya link:", userEmail);

    const jsonStr = JSON.stringify({ table: "link", userEmail });
    console.log(jsonStr);

    const response = await fetch(`/readLinks?jsonStr=${encodeURIComponent(jsonStr)}`);
    const data = await response.json();

    allData = data.filter(row => row.owner.trim() === userEmail.trim());
    renderTable(); // Render the table with pagination
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function renderTable() {
  const tableBody = document.querySelector("table tbody");
  tableBody.innerHTML = "";

  // Calculate the start and end indices for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, allData.length);

  // Render only rows for the current page
  const rowsToDisplay = allData.slice(startIndex, endIndex);
  rowsToDisplay.forEach((row, index) => {
    const tableRow = `
      <tr data-id="${row.linkID}">
        <td>${startIndex + index + 1}</td>
        <td>${row.category}</td>
        <td>${row.datetime || "-"}</td>
        <td>${row.session}</td>
        <td class="wrap">${row.owner}</td>
        <td class="wrap">${row.description}</td>
        <td class="wrap"><a href="${row.links}" target="_blank">${row.links}</a></td>
        <td class="btn-action">
          <button class="btn-delete" onclick="deleteRow(${row.linkID})"><i class="bi bi-trash3"></i></button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", tableRow);
  });

  renderPagination(); // Render pagination controls
}

function renderPagination() {
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(allData.length / rowsPerPage);

  // Add "Previous" button
  const prevButton = document.createElement("li");
  prevButton.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevButton.innerHTML = `<a class="page-link" href="#">Previous</a>`;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });
  pagination.appendChild(prevButton);

  // Add page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.className = `page-item ${currentPage === i ? "active" : ""}`;
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener("click", () => {
      currentPage = i;
      renderTable();
    });
    pagination.appendChild(pageItem);
  }

  // Add "Next" button
  const nextButton = document.createElement("li");
  nextButton.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
  nextButton.innerHTML = `<a class="page-link" href="#">Next</a>`;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTable();
    }
  });
  pagination.appendChild(nextButton);
}

// Initialize table on page load
document.addEventListener("DOMContentLoaded", loadTableData);

  
  // Delete a row with userID verification
  async function deleteRow(id) {
    const data = {
      table: "link",
      id: id,
    };
    console.log("delete?",data)
    if (!confirm("Are you sure you want to delete this record?")) return;

    
    try {
      const response = await fetch("/delete-category?jsonStr", {
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

  document.addEventListener("DOMContentLoaded", loadFilterCategories);
  document.addEventListener("DOMContentLoaded", loadFilterSessions);
  document.addEventListener("DOMContentLoaded", loadTableData);

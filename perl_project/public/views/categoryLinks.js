document.addEventListener("DOMContentLoaded", () => {
    // Get user role from localStorage
    const userRole = localStorage.getItem("userRole") || "UTM LECTURER";


    const categoryName = new URLSearchParams(window.location.search).get('category');
    console.log(categoryName);

    // If a category name exists, update the heading
    if (categoryName) {
      const heading = document.querySelector("h2.ms-3.mb-0");
      heading.textContent = `${categoryName}`;
    }

    const categoryInput = document.getElementById("categoryInput");
    if (categoryName) {
      categoryInput.placeholder = categoryName;
    } else {
      categoryInput.placeholder = "Category not found";
    }

    // Update the UTM ROLE nav item with the user role
    const roleNavItem = document.querySelector(
      '.nav-item a.nav-link[href="#"]'
    );
    if (roleNavItem) {
      roleNavItem.textContent = userRole;
    }
  });
  // function openAddModal() {
  //   // Reset the form
  //   document.getElementById("addForm").reset();
  //   // Show the modal
  //   const modal = new bootstrap.Modal(document.getElementById("addModal"));
  //   modal.show();
  // }

  // Load the table data with userID from localStorage
  async function loadTableData() {
    try {
      const categoryName = new URLSearchParams(window.location.search).get('category');
      const ownerFilter = new URLSearchParams(window.location.search).get('owner');
      const userEmail = localStorage.getItem("userEmail");
      console.log("try this",categoryName);

      const userID = localStorage.getItem("userEmail"); // Retrieve userID from localStorage
      console.log("userEmail: ", localStorage.getItem("userEmail"));
      if (!userID) {
        alert("UserID not found. Please log in.");
        return;
      }

      const jsonStr = JSON.stringify({
        table: "link",
        userEmail: localStorage.getItem("userEmail"), // Pass userID to the server
      });
      console.log(jsonStr);

      const response = await fetch(
        `/read?jsonStr=${encodeURIComponent(jsonStr)}`
      );
      const data = await response.json();

      const tableBody = document.querySelector("table tbody");
      tableBody.innerHTML = "";

      const filteredData = data.filter(row => {
        const matchesCategory = !categoryName || row.category === categoryName;
        const matchesOwner = ownerFilter === "shared to me" 
            ? row.owner !== userEmail
            : row.owner === userEmail;

        return matchesCategory && matchesOwner;
    });

      filteredData.forEach((row, index) => {
        const tableRow = `
          <tr data-id="${row.linkID}">
            <td>${index + 1}</td>
            <td>${row.category}</td>
            <td>${row.datetime || "-"}</td>
            <td>${row.session}</td>
            <td>${row.owner}</td>
            <td>${row.description}</td>
            <td><a href="${row.links}" target="_blank">${row.links}</a></td>
            <td class="btn-action">
              <button class="btn-edit" onclick="openUpdateModal(${
                row.linkID
              }, '${row.category}', '${row.session}',  '${row.owner}', '${
          row.description
        }', '${row.links}')">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button class="btn-delete" onclick="deleteRow(${row.linkID})">
                <i class="bi bi-trash3"></i>
              </button>
            </td>
          </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", tableRow);
      });
    } catch (error) {
      console.error("Error loading data:", error);
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
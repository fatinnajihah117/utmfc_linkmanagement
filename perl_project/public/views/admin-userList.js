document.addEventListener("DOMContentLoaded", () => {
    // Retrieve the role from the URL
    const params = new URLSearchParams(window.location.search);
    const role = params.get("role");

    // Update the table heading dynamically
    const heading = document.querySelector("h2.mt-4");
    if (role) {
      heading.textContent = `${role.toUpperCase()}`;
    } else {
      heading.textContent = "USER LIST";
    }

    const roleInput = document.getElementById("roleInput");
    if (role) {
      roleInput.placeholder = role;
    } else {
      roleInput.placeholder = "Role not found";
    }
  });

  async function loadTableData() {
    try {
      // Retrieve the role filter from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const roleFilter = urlParams.get("role"); // E.g., "Pensyarah", "Staff", "Pelajar"
      console.log(roleFilter);

      const jsonStr = JSON.stringify({
        table: "users",
      });
      console.log(jsonStr);

      const response = await fetch(
        `/getrole?jsonStr=${encodeURIComponent(jsonStr)}`
      );
      const data = await response.json();

      // Select the table body element
      const tableBody = document.querySelector("table tbody");
      tableBody.innerHTML = ""; // Clear any existing rows

      const filteredData = roleFilter
        ? data.filter((user) => user.role === roleFilter)
        : data;

      // Populate the table with filtered data
      filteredData.forEach((user, index) => {
        const tableRow = `
    <tr>
      <td>${index + 1}</td>
      <td>${user.username}</td>
      <td>${user.full_name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
    </tr>
  `;
        tableBody.insertAdjacentHTML("beforeend", tableRow);
      });
    } catch (error) {
      console.error("Error loading table data:", error);
    }
  }

  // Trigger table loading when the page is ready
  document.addEventListener("DOMContentLoaded", loadTableData);

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

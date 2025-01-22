//UserList
document.querySelectorAll(".user-link").forEach((link) => {
    link.addEventListener("click", function (event) {
    event.preventDefault();
    const targetLink = this.dataset.link;
    const userRole = this.dataset.role;

    // Navigate to the user list page with user type as a query parameter
    window.location.href = `${targetLink}?role=${userRole}`;
    });
  });

  function openUpdateSession(id,session){
    console.log("session id update:",id);
    console.log("session id name:",session);
    document.getElementById("updateIdsession").value = id;
    document.getElementById("originalSession").value = session;
    document.getElementById("sessionUpdate").value = session;

    const modal = new bootstrap.Modal(document.getElementById("updateSessionnn"));
    modal.show();
  }

  function openUpdateCategory(id,category){
    console.log("category id update:",id);
    console.log("category id name:",category);
    document.getElementById("updateIdcategory").value = id;
    document.getElementById("categoryUpdate").value = category;

    const modal = new bootstrap.Modal(document.getElementById("updateCategory"));
    modal.show();
  }

  async function updateCategory(event) {
    event.preventDefault();
    const id = document.getElementById("updateIdcategory").value;
    const category = document.getElementById("categoryUpdate").value;
    const data = {
      table: "category",
      id: id,
      category:category,
    };
    console.log("updated JSON:", JSON.stringify(data));
    try {
      const response = await fetch("/updateData?jsonStr", {
        method: "POST", // Update to use POST for sending data
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Updated successfully!");
        loadCategories();
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("updateCategory")
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

  async function updateSession(event) {
    event.preventDefault();
    const id = document.getElementById("updateIdsession").value;
    const oriSession = document.getElementById("originalSession").value;
    const session = document.getElementById("sessionUpdate").value;
    const data = {
      table: "session",
      id: id,
      original_session:oriSession,
      session:session,
    };
    console.log("updated JSON:", JSON.stringify(data));
    try {
      const response = await fetch("/updateData?jsonStr", {
        method: "POST", // Update to use POST for sending data
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Updated successfully!");
        loadSessions();
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("updateSessionnn")
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

  //ADD new category
  document.getElementById("addCategoryForm").addEventListener("submit", function (event) {
      event.preventDefault();

      const categoryName = document.getElementById("categoryInput").value;

      fetch("/add-category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category_name: categoryName }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Category added successfully!");
            loadCategories(); // Refresh the category list
          } else {
            alert("Failed to add category: " + data.error);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred while adding the category.");
        });

      // Close the modal
      document.querySelector("#addCategoryModal .btn-close").click();
    });

  //ADD new session
  document.getElementById("addSessionForm").addEventListener("submit", function (event) {
      event.preventDefault();

      const sessionName = document.getElementById("sessionInput").value;

      fetch("/add-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_name: sessionName }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("Session added successfully!");
            loadSessions(); // Refresh the session list
          } else {
            alert("Failed to add session: " + data.error);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred while adding the session.");
        });

      // Close the modal
      document.querySelector("#addSessionModal .btn-close").click();
    });

  //LOAD categories
  async function loadCategories() {
    try {
      console.log("boleh baca tak");
      const jsonStr = JSON.stringify({table: "category",});
      console.log(jsonStr);

      const response = await fetch( `/get-category?jsonStr=${encodeURIComponent(jsonStr)}`);
      const data = await response.json();
      console.log("Fetched Data:", data); // Log to verify data received

      const tableBody = document.querySelector("#categoryTableBody");
      tableBody.innerHTML = ""; // Clear existing rows

      // Check if categories are returned and have data
      data.categories.forEach((category, index) => {
        // Create a new table row for each category
        const tableRow = `
      <tr data-id="${category.categoryID}">
        <td>${index + 1}</td>
        <td>${category.category_name}</td>
        <td>${category.link_count}</td>
        <td class="btn-action">
          <button class="btn-delete" onclick="deleteCategory('${category.categoryID}','${category.category_name}')">
            <i class="bi bi-trash3"></i>
          </button>
          <button class="btn-edit" onclick="openUpdateCategory('${category.categoryID}','${category.category_name}')">
            <i class="bi bi-pencil-square"></i>
          </button>
        </td>
      </tr>
    `;
        tableBody.insertAdjacentHTML("beforeend", tableRow); // Append the new row
      });
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  // Delete a category
  async function deleteCategory(id,name) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    console.log(name);
    try {
    // Check if category is used in the link table
    const checkResponse = await fetch(`/checkAdmin?jsonStr=${encodeURIComponent(JSON.stringify({ table: "category", categoryName: name }))}`);
    const checkData = await checkResponse.json();
    

    if (checkData.inUse) {
        alert("Cannot delete this category as it is used in the link table.");
        return;
    }

    console.log("you can now delete")

    // Proceed to delete the category if not in use
    const deleteResponse = await fetch("/delete-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table:"category",id: id }),
    });

    if (deleteResponse.ok) {
        alert("Category deleted successfully!");
        loadCategories(); // Reload table data after deletion
    } else {
        const error = await deleteResponse.json();
        alert(`Failed to delete the category: ${error.message}`);
    }
} catch (error) {
    console.error("Error deleting category:", error);
    alert("An error occurred while deleting the category.");
}
  }

  //LOAD session
  async function loadSessions() {
    try {
      const jsonStr = JSON.stringify({
        table: "session",
      });
      console.log(jsonStr);

      const response = await fetch(
        `/get-session?jsonStr=${encodeURIComponent(jsonStr)}`
      );
      const data = await response.json();
      /*const response = await fetch("/get-session?jsonStr=${encodeURIComponent(jsonStr)}", {
        method: "GET", // Change to GET or POST depending on your backend setup
        headers: {
          "Content-Type": "application/json", // Ensure the request content type is JSON
        },
      });
      const data = await response.json(); // Parse the response as JSON

      */
      console.log("Fetched Data:", data); // Log to verify data received

      const tableBody = document.querySelector("#sessionTableBody");
      tableBody.innerHTML = ""; // Clear existing rows

      // Check if categories are returned and have data
      data.sessions.forEach((session, index) => {
        // Create a new table row for each category
        const tableRow = `
      <tr data-id="${session.sessionID}">
        <td>${index + 1}</td>
        <td>${session.session_name}</td>
        <td class="btn-action">
          <button class="btn-delete" onclick="deleteSession('${session.sessionID}','${session.session_name}')">
            <i class="bi bi-trash3"></i>
          </button>
          <button class="btn-edit" onclick="openUpdateSession('${session.sessionID}','${session.session_name}')">
            <i class="bi bi-pencil-square"></i>
          </button>
        </td>
      </tr>
    `;
        tableBody.insertAdjacentHTML("beforeend", tableRow); // Append the new row
      });
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }
  async function deleteSession(id,name) {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      // Check if category is used in the link table
      const checkResponse = await fetch(`/checkAdmin?jsonStr=${encodeURIComponent(JSON.stringify({ table: "session", sessionName: name }))}`);
      const checkData = await checkResponse.json();
      
      if (checkData.inUse) {
          alert("Cannot delete this session as it is used by user.");
          return;
      }

      console.log("you can now delete")

      // Proceed to delete the category if not in use
      const deleteResponse = await fetch("/delete-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ table:"session",id: id }),
      });

      if (deleteResponse.ok) {
          alert("Session deleted successfully!");
          loadSessions(); // Reload table data after deletion
      } else {
          const error = await deleteResponse.json();
          alert(`Failed to delete the session: ${error.message}`);
      }
    } catch (error) {
        console.error("Error deleting session:", error);
        alert("An error occurred while deleting the session.");
    }
  }

  async function loadUserCounts() {

  try {
    const response = await fetch(`/getrole?jsonStr=${encodeURIComponent(JSON.stringify({ table: "checkTotal" }))}`);
    const result = await response.json();

    if (result.success) {
      console.log("userCount",result.data);
      const userCounts = result.data;
      updateUserCounts(userCounts);
      renderPieChart(userCounts);
    } else {
      console.error('Failed to fetch user counts:', result.message);
    }
  } catch (error) {
    console.error('Error loading user counts:', error);
  }
}

function updateUserCounts(userCounts) {
console.log(userCounts);
userCounts.forEach((user) => {
const role = user.role; // e.g., "Pensyarah", "Pelajar FSKSM", "Staff"
const count = user.count;

// Map database role names to corresponding span class names
const roleClassMap = {
  'Pensyarah': 'lecturerTotal',
  'Pelajar FSKSM': 'studentTotal',
  'Staff': 'staffTotal'
};

const className = roleClassMap[role];
if (className) {
  const userTypeElement = document.querySelector(`.${className}`);
  if (userTypeElement) {
    userTypeElement.innerHTML = `
      ${count} <i class="fas ${getRoleIcon(role)}"></i>
    `;
  }
}
});
}

function getRoleIcon(role) {
switch (role) {
case 'Pensyarah':
  return 'fa-chalkboard-teacher';
case 'Pelajar FSKSM':
  return 'fa-user-graduate';
case 'Staff':
  return 'fa-user-tie';
default:
  return 'fa-users';
}
}
function renderPieChart(userCounts) {
const labels = userCounts.map(user => user.role);
const data = userCounts.map(user => user.count);

const totalUsers = data.reduce((sum, count) => sum + count, 0);
document.getElementById('totalUsers').textContent = totalUsers;

const ctx = document.getElementById('userPieChart').getContext('2d');
new Chart(ctx, {
type: 'pie',
data: {
  labels: labels,
  datasets: [{
    data: data,
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
    hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
  }]
},
options: {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    tooltip: {
      callbacks: {
        label: function(tooltipItem) {
          return `${tooltipItem.label}: ${tooltipItem.raw} users`;
        }
      }
    }
  }
}
});
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', loadUserCounts);

document.addEventListener("DOMContentLoaded", () => {
        loadCategories();});
      document.addEventListener("DOMContentLoaded", () => {
        loadSessions();
      });
document.getElementById("updateSessionForm").addEventListener("submit", updateSession);
document.getElementById("updateCategoryForm").addEventListener("submit", updateCategory);

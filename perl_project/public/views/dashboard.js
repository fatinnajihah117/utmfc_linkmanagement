      document.addEventListener("DOMContentLoaded", function () {
        const categoryContainer = document.getElementById("category-container");
        const addCategoryBtn = document.getElementById("add-category-btn");
        const categoryModal = document.getElementById("categoryModal");
        const userRole = localStorage.getItem("userRole") || "UTM LECTURER";
        //console.log("userRole: ", userRole);
        console.log("userID: ", localStorage.getItem("userId"));
        console.log("userEmail: ", localStorage.getItem("userEmail"));
        //loadCategories();
        //loadCategoriesFromStorage();
        loadSessions();
        loadUserGroups(localStorage.getItem("userEmail"));
        loadUserCategories(localStorage.getItem("userEmail"));
        //createGroup();
        
        // Update the UTM ROLE nav item with the user role
        const roleNavItem = document.querySelector(
          '.nav-item a.nav-link[href="#"]'
        );
        if (roleNavItem) {
          roleNavItem.textContent = userRole;
        }

        document.getElementById("logout").addEventListener("click", function () {
          // Clear localStorage
          localStorage.clear();

          // Optionally, log out message for debugging
          console.log("User logged out, localStorage cleared.");
        });

        // Delete category
        categoryContainer.addEventListener("click", function (event) {
          if (event.target.classList.contains("delete-category")) {
            const categoryCard = event.target.closest(".col-3");
            categoryCard.remove();
          }
        });

          function addCategoryCard(category) {
            console.log("category each cardss:",category)
            const categoryContainer = document.getElementById('category-container');

            // Generate a random color if none is provided
            const listColors = ['#f2da99', '#abe38d', '#8dd5e3', '#caaaf2', '#f2aac7'];
            const cardColor = listColors[Math.floor(Math.random() * listColors.length)];

            // Create new category card
            const newCard = document.createElement('div');
            
            newCard.setAttribute('data-category', category);
            newCard.classList.add('card', 'mb-3');
            newCard.style.backgroundColor = cardColor;

            newCard.innerHTML = `
            <div class="card-body">
                <p class="card-title"><b>${category}</b></p>
                <div class="btn-group d-grid" role="group">
                    <a href="categoryLinks.html?category=${category}&owner=shared%20to%20me" class="btn btn-light flex btn-sm"
                    style="border-radius: 10px;margin-bottom: 5px;"
                    >Shared to me</a>
                    <a href="categoryLinks.html?category=${category}&owner=shared%20to%20others" class="btn btn-light flex btn-sm"
                    style="border-radius: 10px;margin-bottom: 5px;"
                    >Shared to others</a>
                </div>
            </div>
            `;

            // Add new card to the container
            categoryContainer.appendChild(newCard);

            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
            if (modal) modal.hide();
          }

        // async function loadCategories() {
        //   const url = `/read?jsonStr=${encodeURIComponent(
        //     JSON.stringify({ table: "category" })
        //   )}`;

        //   fetch(url, {
        //     method: "GET",
        //   })
        //     .then((response) => response.json())
        //     .then((data) => {
        //       console.log("Fetched categories:", data.categories);
        //       if (data.categories && data.categories.length > 0) {
        //         const categorySelect = document.getElementById("category-list");
        //         data.categories.forEach((categoryName) => {
        //           const listItem = document.createElement("li");
        //           listItem.className = "list-group-item";
        //           listItem.dataset.category = categoryName; // Assuming category_name is the field name
        //           listItem.dataset.link = `categoryLinks.html`; // Generate dynamic link
        //           listItem.textContent = categoryName;

        //           listItem.addEventListener('click', function () {
        //             addCategoryCard(categoryName, listItem.dataset.link);
        //           });

        //           categorySelect.appendChild(listItem);
        //         });
        //       } else {
        //         console.log("No categories found");
        //       }
        //     })
        //     .catch((error) => {
        //       console.error("Error fetching categories:", error);
        //     });
        // }
        function saveCategoryToStorage(category, link, color) {
          const categories = JSON.parse(sessionStorage.getItem('categories')) || [];
          categories.push({ category, link, color });
          sessionStorage.setItem('categories', JSON.stringify(categories));
        }

        function removeCategoryFromStorage(category) {
          let categories = JSON.parse(sessionStorage.getItem('categories')) || [];
          categories = categories.filter((item) => item.category !== category);
          sessionStorage.setItem('categories', JSON.stringify(categories));
        }

        // function loadCategoriesFromStorage() {
        //   const categories = JSON.parse(sessionStorage.getItem('categories')) || [];
        //   categories.forEach((item) => {
        //     const { category, link, color } = item;
        //     const categoryContainer = document.getElementById('category-container');
        //     addCategoryCard(category, link, color); // Pass the color to addCategoryCard
            
        //   });
        // }

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

        function loadUserGroups(userEmail) {
          fetch('/getUserGroups?jsonStr=' + encodeURIComponent(JSON.stringify({ userEmail:userEmail, })))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Groups fetched successfully:', data);
                // Process and display the data
                data.forEach(group => {
                  addGroupCard(group.groupID, group.group_name, group.description, group.owner, group.session);
                });
            })
            .catch(error => {
                console.error('Failed to fetch user groups:', error);
            });
        }

        function loadUserCategories(userEmail) {
          fetch('/read?jsonStr=' + encodeURIComponent(JSON.stringify({ table: "checkCategory",userEmail:userEmail, })))
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('category fetched:', data);
                // Process and display the data
                data.forEach(categories => {
                  addCategoryCard(categories);
                });
            })
            .catch(error => {
                console.error('Failed to fetch category:', error);
            });
        }

        

        // Validate email format
        function validateEmail(email) {
          const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return regex.test(email);
        }

        function addGroupCard(groupID, title, description, owner, session) {
          const groupCard = document.createElement("div");
          groupCard.className = "col-md-4";
          groupCard.innerHTML = `
            <a href="groupShareLink.html?title=${title}&groupID=${groupID}&session=${session}&owner=${owner}" class="group-card-link">
              <div class="group-card">
                <h5 class="group-card-title">${title}</h5>
                <p class="group-card-subtitle">${description}</p>
                <p>Owner: ${owner}</p>
                <p>Session: ${session}</p>
              </div>
            </a>
          `;
          document.getElementById('groupCardContainer').appendChild(groupCard);
        }


      });
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      //document.getElementById("createGroupForm").addEventListener("submit", createGroup);
        const emailContainer = document.getElementById("email-container");
        const emailInput = document.getElementById("email-input");
        const emailList = [];
        const groupCardContainer = document.getElementById("groupCardContainer");


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
        async function createGroup(event) {
          event.preventDefault();
          
          const title = document.getElementById("groupTitle").value;
          const description = document.getElementById("groupDescription").value;
          const session = document.getElementById("sessionDropdown").value;
          const owner = localStorage.getItem("userEmail");
          const participants = emailList;  // Assume emailList holds the user IDs or emails

          // Validate required fields
          if (!title || !description || !session) {
              alert("Please fill in all fields before creating a group.");
              return;
          }

          if (participants.length === 0) {
              alert("Please add at least one participant.");
              return;
          }

          // Prepare the JSON payload
          const requestData = {
              table: "groups",
              data: {
                  group_name: title,
                  description: description,
                  owner: owner,
                  session: session,
                  participants: participants  // Include participants directly in the request
              }
          };

          console.log("Constructed group:", JSON.stringify(requestData));

          try {
              // Send the POST request to the backend
              const response = await fetch("/createGroup?jsonStr", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify(requestData)
              });

              const result = await response.json();

              if (result.success) {
                  alert("Group created successfully!");
                  location.reload();  // Refresh to reflect the new group
              } else {
                  alert(`Failed to create group: ${result.error}`);
              }
          } catch (error) {
              console.error("Error creating group:", error);
              alert("An unexpected error occurred.");
          }
      }
          document.getElementById("createGroupForm").addEventListener("submit", createGroup);
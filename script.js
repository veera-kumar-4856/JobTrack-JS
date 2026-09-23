// Get HTML Elements
const addJobBtn = document.getElementById("addJobBtn");
const applicationFormContainer = document.getElementById("applicationFormContainer");
const closeFormBtn = document.getElementById("closeFormBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const applicationForm = document.getElementById("applicationForm");
const applicationList = document.getElementById("applicationList");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const totalApplications = document.getElementById("totalApplications");
const appliedCount = document.getElementById("appliedCount");
const interviewCount = document.getElementById("interviewCount");
const offerCount = document.getElementById("offerCount");

let applications = [];
let editingId = null;

// Load Applications from Local Storage
const savedApplications = localStorage.getItem("applications");

if (savedApplications) {
    applications = JSON.parse(savedApplications);

    applications = applications.map(function(application) {
        if (!application.id) {
            application.id = Date.now() + Math.random();
        }

        return application;
    });

    localStorage.setItem(
        "applications",
        JSON.stringify(applications)
    );
}

// Dashboard Statistics
function updateStatistics() {
    totalApplications.textContent = applications.length;

    const applied = applications.filter(function(application) {
        return application.status === "Applied";
    });

    const interviews = applications.filter(function(application) {
        return application.status === "Interview";
    });

    const offers = applications.filter(function(application) {
        return application.status === "Offer";
    });

    appliedCount.textContent = applied.length;
    interviewCount.textContent = interviews.length;
    offerCount.textContent = offers.length;
}

// Display Applications
function displayApplications(list = applications) {
    applicationList.innerHTML = "";

    list.forEach(function(application) {
        const applicationCard = document.createElement("div");

        applicationCard.classList.add("application-card");

        applicationCard.innerHTML = `
            <h3>${application.company}</h3>
            <p>${application.role}</p>
            <p>${application.location}</p>

            <span class="status-badge ${application.status.toLowerCase()}">
                ${application.status}
            </span>

            <p>Applied: ${application.appliedDate}</p>

            ${application.notes ? `<p class="application-notes">${application.notes}</p>` : ""}

            <div class="card-actions">
                ${application.jobUrl ? `<a href="${application.jobUrl}" target="_blank">View Job</a>` : ""}
                <button class="edit-btn" data-id="${application.id}">Edit</button>
                <button class="delete-btn" data-id="${application.id}">Delete</button>
            </div>
        `;

        applicationList.appendChild(applicationCard);

        const editButton = applicationCard.querySelector(".edit-btn");
        const deleteButton = applicationCard.querySelector(".delete-btn");

        // Delete Application
        deleteButton.addEventListener("click", function() {
            const id = Number(deleteButton.dataset.id);

            const confirmDelete = confirm(
                "Are you sure you want to delete this application?"
            );

            if (!confirmDelete) {
                return;
            }

            applications = applications.filter(function(application) {
                return application.id !== id;
            });

            localStorage.setItem(
                "applications",
                JSON.stringify(applications)
            );

            displayApplications();
            updateStatistics();
        });

        // Edit Application
        editButton.addEventListener("click", function() {
            const id = Number(editButton.dataset.id);

            editingId = id;

            const applicationToEdit = applications.find(function(application) {
                return application.id === id;
            });

            document.getElementById("company").value =
                applicationToEdit.company;

            document.getElementById("role").value =
                applicationToEdit.role;

            document.getElementById("location").value =
                applicationToEdit.location;

            document.getElementById("appliedDate").value =
                applicationToEdit.appliedDate;

            document.getElementById("status").value =
                applicationToEdit.status;

            document.getElementById("jobUrl").value =
                applicationToEdit.jobUrl;

            document.getElementById("notes").value =
                applicationToEdit.notes;

            applicationFormContainer.style.display = "block";
        });
    });
}

// Open Application Form
addJobBtn.addEventListener("click", function() {
    applicationFormContainer.style.display = "block";
});

// Close Application Form
closeFormBtn.addEventListener("click", function() {
    applicationForm.reset();
    editingId = null;
    applicationFormContainer.style.display = "none";
});

cancelFormBtn.addEventListener("click", function() {
    applicationForm.reset();
    editingId = null;
    applicationFormContainer.style.display = "none";
});

// Add / Update Application
applicationForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const company = document.getElementById("company").value;
    const role = document.getElementById("role").value;
    const location = document.getElementById("location").value;
    const appliedDate = document.getElementById("appliedDate").value;
    const status = document.getElementById("status").value;
    const jobUrl = document.getElementById("jobUrl").value;
    const notes = document.getElementById("notes").value;

    const application = {
        id: editingId !== null ? editingId : Date.now(),
        company: company,
        role: role,
        location: location,
        appliedDate: appliedDate,
        status: status,
        jobUrl: jobUrl,
        notes: notes
    };

    if (editingId === null) {
        applications.push(application);
    } else {
        const index = applications.findIndex(function(application) {
            return application.id === editingId;
        });

        applications[index] = application;
        editingId = null;
    }

    localStorage.setItem(
        "applications",
        JSON.stringify(applications)
    );

    displayApplications();
    updateStatistics();

    applicationForm.reset();
    applicationFormContainer.style.display = "none";
});

// Search and Filter
function filterApplications() {
    const searchText = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;

    const filteredApplications = applications.filter(function(application) {
        const matchesSearch =
            application.company.toLowerCase().includes(searchText) ||
            application.role.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            application.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    displayApplications(filteredApplications);
}

searchInput.addEventListener("input", filterApplications);

statusFilter.addEventListener("change", filterApplications);

// Load Applications and Statistics
displayApplications();
updateStatistics();
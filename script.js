// Get HTML Elements
const addJobBtn = document.getElementById("addJobBtn");
const applicationFormContainer = document.getElementById("applicationFormContainer");
const closeFormBtn = document.getElementById("closeFormBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const applicationForm = document.getElementById("applicationForm");
const applicationList = document.getElementById("applicationList");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const formTitle = document.getElementById("formTitle");

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

    if (list.length === 0) {
        applicationList.innerHTML = `
            <p class="empty-message">No applications found.</p>
        `;
        return;
    }

    list.forEach(function(application) {
        const applicationCard = document.createElement("div");
        applicationCard.classList.add("application-card");

        const company = document.createElement("h3");
        company.textContent = application.company;

        const role = document.createElement("p");
        role.textContent = application.role;

        const location = document.createElement("p");
        location.textContent = application.location;

        const status = document.createElement("span");
        status.textContent = application.status;

        const validStatuses = [
            "Applied",
            "Interview",
            "Offer",
            "Rejected"
        ];

        const statusClass = validStatuses.includes(application.status)
            ? application.status.toLowerCase()
            : "applied";

        status.classList.add("status-badge", statusClass);

        const appliedDate = document.createElement("p");
        appliedDate.textContent = `Applied: ${application.appliedDate}`;

        const cardActions = document.createElement("div");
        cardActions.classList.add("card-actions");

        if (application.jobUrl) {
            try {
                const jobUrl = new URL(application.jobUrl);

                if (jobUrl.protocol === "http:" || jobUrl.protocol === "https:") {
                    const jobLink = document.createElement("a");

                    jobLink.textContent = "View Job";
                    jobLink.href = jobUrl.href;
                    jobLink.target = "_blank";
                    jobLink.rel = "noopener noreferrer";

                    cardActions.appendChild(jobLink);
                }
            } catch (error) {
            }
        }

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("edit-btn");
        editButton.dataset.id = application.id;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-btn");
        deleteButton.dataset.id = application.id;

        cardActions.append(editButton, deleteButton);

        applicationCard.append(
            company,
            role,
            location,
            status,
            appliedDate
        );

        if (application.notes) {
            const notes = document.createElement("p");

            notes.textContent = application.notes;
            notes.classList.add("application-notes");

            applicationCard.appendChild(notes);
        }

        applicationCard.appendChild(cardActions);
        applicationList.appendChild(applicationCard);

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

            filterApplications();
            updateStatistics();
        });

        // Edit Application
        editButton.addEventListener("click", function() {
            const id = Number(editButton.dataset.id);

            editingId = id;
            formTitle.textContent = "Edit Job Application";

            const applicationToEdit = applications.find(function(application) {
                return application.id === id;
            });

            if (!applicationToEdit) {
                return;
            }

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
    applicationForm.reset();
    editingId = null;
    formTitle.textContent = "Add Job Application";
    applicationFormContainer.style.display = "block";
});

// Close Application Form
closeFormBtn.addEventListener("click", function() {
    applicationForm.reset();
    editingId = null;
    formTitle.textContent = "Add Job Application";
    applicationFormContainer.style.display = "none";
});

cancelFormBtn.addEventListener("click", function() {
    applicationForm.reset();
    editingId = null;
    formTitle.textContent = "Add Job Application";
    applicationFormContainer.style.display = "none";
});

// Add / Update Application
applicationForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const company = document.getElementById("company").value.trim();
    const role = document.getElementById("role").value.trim();
    const location = document.getElementById("location").value.trim();
    const appliedDate = document.getElementById("appliedDate").value;
    const status = document.getElementById("status").value;
    const jobUrl = document.getElementById("jobUrl").value.trim();
    const notes = document.getElementById("notes").value.trim();

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

        if (index !== -1) {
            applications[index] = application;
        }

        editingId = null;
    }

    localStorage.setItem(
        "applications",
        JSON.stringify(applications)
    );

    filterApplications();
    updateStatistics();

    applicationForm.reset();
    formTitle.textContent = "Add Job Application";
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
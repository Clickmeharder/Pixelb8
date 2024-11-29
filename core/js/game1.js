document.addEventListener("DOMContentLoaded", () => {
    // Select all tabs and content sections
    const tabs = document.querySelectorAll(".tab");
    const sections = document.querySelectorAll("#character-stats, #character-equipment, #character-inventory");

    // Add click event to each tab
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove 'active' class from all tabs
            tabs.forEach(t => t.classList.remove("active"));
            // Hide all sections
            sections.forEach(section => section.classList.remove("active"));

            // Add 'active' class to the clicked tab
            tab.classList.add("active");
            // Show the corresponding section
            const target = tab.getAttribute("data-tab");
            document.getElementById(target).classList.add("active");
        });
    });

    // Default to the first tab
    document.querySelector(".tab.active").click();
});

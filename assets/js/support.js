document.addEventListener("DOMContentLoaded", function () {
    function createModal() {
        const modalOverlay = document.createElement("div");
        modalOverlay.id = "contactModalOverlay";
        modalOverlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-xl";

        modalOverlay.innerHTML = `
            <div class="bg-gray-800 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-200">Contact Information</h2>
                    <button id="closeModalBtn" class="text-gray-100 hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center space-x-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2 2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p class="text-gray-300">example@example.com</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <p class="text-gray-300">+123 456 7890</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p class="text-gray-300">123 Main St, City, Country</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        // Close modal when clicking the button
        document.getElementById("closeModalBtn").addEventListener("click", closeModal);
        // Close modal when clicking outside the modal content
        modalOverlay.addEventListener("click", function (event) {
            if (event.target === modalOverlay) {
                closeModal();
            }
        });
    }

    function openModal() {
        if (!document.getElementById("contactModalOverlay")) {
            createModal();
        }
    }

    function closeModal() {
        const modalOverlay = document.getElementById("contactModalOverlay");
        if (modalOverlay) {
            modalOverlay.remove();
        }
    }

    // Attach event listener to a global button (this can be added in any HTML file)
    document.addEventListener("click", function (event) {
        if (event.target.matches("#contactModalBtn")) {
            openModal();
        }
    });
});

const baseUrl = 'https://backend.tokenated.com/api';
// Mobile Menu Functionality
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mobileMenu = document.getElementById("mobileMenu");
const menuIcon = document.getElementById("menuIcon");
const closeIcon = document.getElementById("closeIcon");
const mobileConnectButton = document.getElementById("mobileConnectButton");
const overlay = document.getElementById("overlay");


// Loading Controller Functions
function showPageLoading() {
    const loadingHTML = `
        <div id="loadingModal" class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="bg-gray-800 p-8 rounded-xl flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p class="text-white text-lg">Loading...</p>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
}

function hidePageLoading() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        loadingModal.remove();
    }
}



mobileMenuButton?.addEventListener("click", () => {
    mobileMenu?.classList.toggle("hidden");
    menuIcon?.classList.toggle("hidden");
    closeIcon?.classList.toggle("hidden");
});


// Mobile Connect Button Functionality
mobileConnectButton?.addEventListener("click", () => {
    overlay?.classList.remove("hidden");
    mobileMenu?.classList.add("hidden");
    menuIcon?.classList.remove("hidden");
    closeIcon?.classList.add("hidden");
});

// Close Mobile Menu When Clicking Outside
document.addEventListener("click", (e) => {
    if (!mobileMenuButton?.contains(e.target) && !mobileMenu?.contains(e.target)) {
        mobileMenu?.classList.add("hidden");
        menuIcon?.classList.remove("hidden");
        closeIcon?.classList.add("hidden");
    }
});

// Search Bar Functionality
const searchbtn = document.getElementById("searchbtn");
const searchbar = document.getElementById("searchbar");
const opensearch = document.getElementById("opensearch");
const closesearch = document.getElementById("closesearch");

searchbtn?.addEventListener("click", () => {
    searchbar?.classList.toggle("hidden");
    opensearch?.classList.toggle("hidden");
    closesearch?.classList.toggle("hidden");
});

// Slider Functionality
const slider = document.querySelector("#slider");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const bgElement = document.getElementById("background");

// Function to generate a random color
function getRandomColor() {
    return `rgba(${Math.floor(Math.random() * 200) + 50}, ${Math.floor(Math.random() * 200) + 50}, ${Math.floor(Math.random() * 200) + 50}, 0.5)`; 
    // Adjusted to avoid very dark or very light colors
}

if (slider) {
    const slideWidth = slider.querySelector(".car-item")?.offsetWidth || 0;

    const moveToNextSlide = () => {
        if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth) {
            slider.scrollTo({ left: 0, behavior: "smooth" });
        } else {
            const color1 = getRandomColor();
            const color2 = 'rgb(17, 24, 39)';
            bgElement.style.backgroundImage = `linear-gradient(to bottom, ${color1}, ${color2})`;
            slider.scrollBy({ left: slideWidth, behavior: "smooth" });
        }
    };

    const moveToPrevSlide = () => {
        if (slider.scrollLeft === 0) {
            slider.scrollTo({ left: slider.scrollWidth - slider.offsetWidth, behavior: "smooth" });
        } else {
            slider.scrollBy({ left: -slideWidth, behavior: "smooth" });
        }
        const color1 = getRandomColor();
        const color2 = 'rgb(17, 24, 39)';
        bgElement.style.backgroundImage = `linear-gradient(to bottom, ${color1}, ${color2})`;
    };

    nextButton?.addEventListener("click", moveToNextSlide);
    prevButton?.addEventListener("click", moveToPrevSlide);

    let autoScroll = setInterval(moveToNextSlide, 5000);

    slider.addEventListener("mouseover", () => clearInterval(autoScroll));
    slider.addEventListener("mouseleave", () => {
        autoScroll = setInterval(moveToNextSlide, 5000);
    });
}

// Tabs for Mobile
const buttons = document.querySelectorAll("#grop");

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        buttons.forEach((btn) => {
            if (btn !== button) {
                btn.querySelector("span")?.classList.add("hidden");
                btn.querySelector(".button")?.classList.remove("bg-gray-700");
            }
        });

        const span = button.querySelector("span");
        const iconWrapper = button.querySelector(".button");
        span?.classList.toggle("hidden");
        iconWrapper?.classList.toggle("bg-gray-700");
    });
});

// Signup Modal
const signupButton = document.getElementById("signupButton");
const overlayModal = document.getElementById("overlayModal");
const signUpCloseButton = document.getElementById("sUcloseButton");

signupButton?.addEventListener("click", () => {
    overlayModal?.classList.remove("hidden");
});

signUpCloseButton?.addEventListener("click", () => {
    overlayModal?.classList.add("hidden");
});

overlayModal?.addEventListener("click", (e) => {
    if (e.target === overlayModal) {
        overlayModal?.classList.add("hidden");
    }
});

// Footer
const footer = document.querySelector(".footer");
if (footer) {
    fetch("footer.html")
        .then((res) => res.text())
        .then((data) => {
            footer.innerHTML = data;
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            const footerScript = doc.querySelector("script");
            if (footerScript) eval(footerScript.textContent);
        });
}

// Connect Button Functionality
const connectButton = document.getElementById("connectButton");
const closeButton = document.getElementById("closeButton");

connectButton?.addEventListener("click", () => {
    overlay?.classList.remove("hidden");
});

closeButton?.addEventListener("click", () => {
    overlay?.classList.add("hidden");
});

document.addEventListener('DOMContentLoaded', function () {
    const modalOverlay = document.getElementById('contactModalOverlay');
  
    function openModal() {
      modalOverlay.classList.remove('hidden');
      modalOverlay.classList.add('flex');
    }
  
    function closeModal() {
      modalOverlay.classList.remove('flex');
      modalOverlay.classList.add('hidden');
    }
  
    // Attach event listeners to buttons
    document.querySelector('[onclick="openModal()"]').addEventListener('click', openModal);
    document.querySelector('[onclick="closeModal()"]').addEventListener('click', closeModal);
  });

  document.addEventListener('DOMContentLoaded', function () {
    // Get elements
    const modalOverlay = document.getElementById('questionModalOverlay');
    const openButton = document.getElementById('openQuestionModalButton');
    const closeButton = document.getElementById('closeQuestionModalButton');
    const cancelButton = document.getElementById('cancelQuestionModalButton');
    const sendButton = document.getElementById('sendQuestionButton');
    const questionInput = document.getElementById('question');

    // Open Question Modal
    openButton.addEventListener('click', function () {
      modalOverlay.classList.remove('hidden');
      modalOverlay.classList.add('flex');
    });

    // Close Question Modal
    closeButton.addEventListener('click', function () {
      modalOverlay.classList.remove('flex');
      modalOverlay.classList.add('hidden');
    });

    // Cancel Question Modal
    cancelButton.addEventListener('click', function () {
      modalOverlay.classList.remove('flex');
      modalOverlay.classList.add('hidden');
    });

    // Send Question
    sendButton.addEventListener('click', function () {
      const question = questionInput.value.trim();
      if (question === '') {
        alert('Please enter your question before sending.');
        return;
      }

      // Simulate sending the question (you can replace this with an API call)
      console.log('Question:', question);
      alert('Your question has been sent!');
      modalOverlay.classList.remove('flex');
      modalOverlay.classList.add('hidden');
    });
  });


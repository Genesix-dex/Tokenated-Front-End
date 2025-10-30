
const baseUrl = 'https://backend.tokenated.com/api';
// Function to fetch NFT data from backend
async function fetchNFTData() {
    try {
        const response = await fetch('https://backend.tokenated.com/api/nfts/trending'); // Replace with your actual API endpoint
        const nfts = await response.json();
        const container2 = document.querySelector('.swiper-wrapper');
        container2.innerHTML = '';

        nfts.forEach(nft => {
            // const cardSliderHTML = createNFTSliderItem(nft);
            // console.log(nft);
            // container2.insertAdjacentHTML('beforeend', cardSliderHTML);
            container2.appendChild(createNFTSliderItem(nft));
        });

        // Add event listeners to new cards
        // attachCardEventListeners();
    } catch (error) {
        console.error('Error fetching trending nfts:', error);
    } finally {
        hideLoading();
    }
}

const isUserLoggedIn = () => {
    return !!localStorage.getItem('accessToken');
};

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

const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
};

// Utility Functions
const showFeedbackModal = (type, title, message) => {
    const modalHTML = `
        <div id="feedbackModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white">${title}</h3>
                    <button class="modal-close text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="mb-6">
                    <p class="text-gray-300">${message}</p>
                </div>
                <button class="modal-close w-full px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
                    OK
                </button>
            </div>
        </div>
    `;
  
    // Remove existing modal if present
    const existingModal = document.getElementById('feedbackModal');
    if (existingModal) {
        existingModal.remove();
    }
  
    // Add new modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  
    // Add event listeners
    const modal = document.getElementById('feedbackModal');
    modal.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', () => hideModal('feedbackModal'));
    });
};

const fetchWithAuth = async (endpoint, options = {}) => {
    showPageLoading();
    const token = localStorage.getItem('accessToken');
    if (token) {
        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
    }
  
  
  
    const response = await fetch(`${baseUrl}${endpoint}`, options);
  
    if (response.status === 401) {
        localStorage.removeItem('accessToken');
        showFeedbackModal('error', 'Session Expired', 'Please login again');
        window.location.href = '/login';
    }
    hidePageLoading();
    return response;
  
};

const imprintNFT = async (nftId, ownerId) => {
    console.log("🔍 imprintingsdfdfs");
    if (!isUserLoggedIn()) {
        showFeedbackModal('error', 'Authentication Required', 'Please login to imprint this NFT');
        return false;
    }
  
    try {
        // Check if the user has already imprinted this NFT
        const hasImprinted = await checkUserImprint(nftId);
  
        if (hasImprinted) {
            // If already imprinted, remove the imprint
            console.log("🗑️ Removing imprint interaction for NFT:", { nftId });
  
            const response = await fetchWithAuth(`/interactions/imprint`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nftId,
                    userId: localStorage.getItem('userId')
                })
            });
  
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove imprint');
            }
  
            const data = await response.json();
            console.log("✅ Imprint removed successfully:", data);
            return { ...data, action: 'removed' };
        } else {
            // If not imprinted, create a new imprint
            console.log("📌 Sending imprint interaction for NFT:", { nftId, ownerId });
  
            const response = await fetchWithAuth(`/interactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nftId,
                    ownerId,
                    type: "imprint"
                })
            });
  
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to imprint NFT');
            }
  
            const data = await response.json();
            console.log("✅ Imprint interaction successful:", data);
            return { ...data, action: 'added' };
        }
    } catch (error) {
        console.error("🚨 Error with imprint operation:", error);
        showFeedbackModal('error', 'Error', error.message || 'Failed to process imprint action');
        return false;
    }
  };
  
  // For createListedNFTCard
  const checkUserImprint = async (nftId) => {
    try {
        const response = await fetchWithAuth(`/interactions?type=imprint&nftId=${nftId}`);
        if (!response.ok) throw new Error('Failed to fetch imprint status');
  
        const imprints = await response.json();
        const userId = localStorage.getItem('userId');
        return imprints.some(imprint => imprint.userId === userId);
    } catch (error) {
        console.error('Error checking imprint status:', error);
        return false;
    }
  };
  





const formatMintDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
};


function createNFTSliderItem(nft, address) {
    document.addEventListener("click", function (event) {
        if (event.target && event.target.id === "buyNowBtn") {
            openOrderSummaryModal(nft);
        }
    });
    const card = document.createElement("section");
    card.classList.add('swiper-slide', 'py-2', 'min-w-full', 'lg:flex', 'lg:space-x-0', 'bg-blue-200/20', 'backdrop-blur-sm', 'rounded-xl', 'p-2', 'mt-6', 'shadow-sm');
    console.log("dataaaa", nft);
    const formatAuctionTime = (isoString) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const getCountdown = (isoString) => {
        const endTime = new Date(isoString).getTime();
        
        return `<span id="countdown-${endTime}" class="text-red-400"></span>
        <script>
            (function startCountdown() {
                const countdownEl = document.getElementById('countdown-${endTime}');
                if (!countdownEl) return;
                
                function updateCountdown() {
                    const now = new Date().getTime();
                    const timeLeft = endTime - now;
                    
                    if (timeLeft <= 0) {
                        countdownEl.textContent = "Auction Ended";
                        return;
                    }

                    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                    countdownEl.textContent = 
                        (days > 0 ? days + "d " : "") +
                        (hours > 0 ? hours + "h " : "") +
                        (minutes > 0 ? minutes + "m " : "") +
                        seconds + "s";

                    setTimeout(updateCountdown, 1000);
                }

                updateCountdown();
            })();
        </script>`;
    };

const getPriceSection = (nft) => {
    console.log('auction:', nft);
    if (nft.isAuction) {
        return `
        <div class="text-left ml-2">
            <p class="text-gray-400 text-sm">Auction ending on</p>
            <div class="text-white font-mono">${formatAuctionTime(nft.auctionEndTime)}</div>
            ${getCountdown(nft.auctionEndTime)}
        </div>
        <div class="bg-gray-800/50 rounded-2xl p-2 grid md:grid-cols-[5fr_2fr] grid-cols-1 justify-between gap-2">
            
            <div class="flex flex-col justify-between flex-1">
                <div class="flex flex-row items-center justify-between bg-slate-900 px-1 pl-3 py-1 gap-1 rounded-2xl flex-1">
                    <p class="text-gray-400 text-sm mx-2">Bid</p>
                    <div class="flex items-center gap-2 nft-price-container bg-gray-900 hover:bg-gray-800 px-6 py-1 rounded-2xl transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-2xl max-w-fit cursor-pointer group" data-eth-price="${nft.currentBid}">
                        <img 
                            loading="lazy" 
                            src="assets/images/ethereum-icon.png" 
                            alt="ETH" 
                            class="w-6 h-6 object-contain drop-shadow-[0_0_4px_rgba(78,153,244,0.3)]">
                        <span class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">${nft.currentBid} ETH</span>
                        <span class="text-md text-gray-400 group-hover:text-gray-300 transition-colors usd-price">Loading...</span>
                    </div>

                </div>
                
            </div>
            <button class=" py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex-1"
                data-nft-action="bid"
                data-token-id="${nft.tokenId}"
                data-nft-name="${nft.name}"
                data-nft-image="${nft.image}"
                data-current-price="${nft.currentBid}">
                Place Bid
            </button>
        </div>`;
    } else {
        return `
        <div class="bg-gray-800/50 rounded-2xl p-2 grid md:grid-cols-[4fr_2fr] grid-cols-1 justify-between gap-2">
            <div class="flex flex-col justify-between flex-1">
                <div class="flex flex-row items-center justify-between bg-slate-900 px-1 pl-3 py-1 gap-1 rounded-2xl flex-1">
                    <p class="text-green-400 text-sm text-center md:text-left md:ml-4">Price</p>
                    <div class="flex items-center gap-2 nft-price-container bg-gray-400/30 hover:bg-gray-800 px-3 py-1 rounded-2xl transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-2xl max-w-fit cursor-pointer group" data-eth-price="${nft.price}">
                        <img 
                            loading="lazy" 
                            src="assets/images/ethereum-icon.png" 
                            alt="ETH" 
                            class="w-6 h-6 object-contain drop-shadow-[0_0_4px_rgba(78,153,244,0.3)]"
                        >
                        <span class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">${nft.price} ETH</span>
                        <span class="text-md text-gray-400 group-hover:text-gray-300 transition-colors usd-price">Loading...</span>
                    </div>

                </div>
            </div>
            <button class=" py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex-1"
                data-nft-action="buy"
                data-token-id="${nft.tokenId}"
                data-nft-name="${nft.name}"
                data-nft-image="${nft.image}"
                data-current-price="${nft.price}">
                Buy Now
            </button>
        </div>`;
    }
};

const imprintCount = nft.imprintCount || 0;
const imprintButtonHTML = `
<button class="absolute bottom-2 right-2 flex items-center gap-1 px-3 py-1 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 transition-colors text-gray-400" data-nft-action="imprint" data-token-id="${nft.tokenId}" data-owner-id="${nft.ownerId || nft.creatorId}">
    <svg class="w-4 h-4 nft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 7C16.6569 7 18 8.34315 18 10C18 11.6569 16.6569 13 15 13C13.3431 13 12 11.6569 12 10C12 8.34315 13.3431 7 15 7Z" stroke="currentColor" stroke-width="2"/>
        <path d="M12 13L3 22M7 17H3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M19 10H21M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <span class="text-sm font-medium imprint-count">${imprintCount}</span>
</button>
`;

function redirectToProfile(creator) {
    console.log('creator', creator);
    return `

    <!-- Creator Info -->
    <div onclick="redirectToCreatorProfile('${creator.creatorId}')" class="flex items-center space-x-4">
        <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500">
            <img
                loading="lazy"
                src="${creator.creatorAvatar}"
                alt="Creator"
                class="w-full h-full object-cover"
            />
        </div>
        <div>
            <p class="text-gray-400 text-sm">Created by</p>
            <h3 class="text-white font-semibold max-w-[150px] truncate">${creator.creatorName}</h3>
        </div>
    </div>
    `;
}

    // return
    card.innerHTML =  `
    <!--<section class="swiper-slide py-6 min-w-full lg:flex lg:space-x-0 bg-blue-200/20 backdrop-blur-sm rounded-xl p-6 mt-6 shadow-sm ">-->
        <div class="max-w-7xl mx-auto px-0 bg-[url('${nft.image}')] bg-center rounded-xl">
            <div class="p-2 rounded-xl bg-gradient-to-r from-gray-500/30 to-gray-600/30 flex flex-col lg:flex-row items-center justify-center gap-2 md:gap-8 backdrop-blur-lg">
                <!-- Left Column - Image Gallery -->
                <div class="lg:w-2/5 basis-1/2 my-auto grow">
                    <div class="group relative">
                        <div class="aspect-square rounded-2xl overflow-hidden bg-gray-800/50 backdrop-blur-sm" onclick="redirectToNFTDetails('${nft.tokenId}');">
                            <img
                             loading="lazy"
                                src="${nft.image}"
                                alt="${nft.name}"
                                class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <!-- Overlay with Actions -->
                        ${imprintButtonHTML}
                    </div>
                </div>
  
                <!-- Right Column - Details -->
                <div class="md:space-y-2 space-y-2 grow basis-1/2 w-full">
                    <!-- Header -->
                    <div>
                        <div class="flex items-center justify-between" onclick="redirectToNFTDetails('${nft.tokenId}');">
                            <h1 class="text-4xl lg:text-5xl font-bold text-white">${nft.name}</h1>
                            <div class="flex space-x-2">
                                <span class="px-3 py-1 bg-pink-500/50 text-white rounded-full text-sm font-medium">
                                    #${nft.tokenId}
                                </span>
                            </div>
                        </div>
                        <p class="text-gray-400">Minted on ${formatMintDate(nft.mintDate)}</p>
                    </div>

                    ${redirectToProfile(nft)}
  
                    <!-- Description -->
                    <div class="space-y-4">
                        <fieldset class="border-2 border-[transparent] px-4 pb-4 bg-gray-800/50 md:max-h-48 max-h-36 rounded-xl overflow-auto
                            [&::-webkit-scrollbar]:w-2
                            [&::-webkit-scrollbar-track]:rounded-full
                            [&::-webkit-scrollbar-track]:bg-gray-100
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-gray-600  ">
                            <legend>
                                <button class="text-md px-2 py-1 text-gray-200 bg-gray-600/50 rounded-lg hover:bg-gray-100/20 transition-colors">
                                    Description
                                </button>
                            </legend>

                            <p class="text-gray-300 leading-relaxed">${nft.description}</p>
                        </fieldset>
                    </div>
  
                    <!-- Price Info - Dynamically rendered based on auction status -->
                    ${getPriceSection(nft)}
                </div>
            </div>
        </div>
    <!--</section>-->`;

    const updateImprintButton = () => {
        const imprintButton = card.querySelector('[data-nft-action="imprint"]');
        console.log("buttoooon",imprintButton);
        if (!imprintButton) return;
    
        // Remove existing event listeners to prevent duplicates
        imprintButton.replaceWith(imprintButton.cloneNode(true));
    
        // Re-select the button after cloning (previous reference is lost)
        const newImprintButton = card.querySelector('[data-nft-action="imprint"]');
    
        newImprintButton.addEventListener('click', async (e) => {
            e.stopPropagation();
    
            const tokenId = newImprintButton.dataset.tokenId;
            const ownerId = newImprintButton.dataset.ownerId;
    
            const result = await imprintNFT(tokenId, ownerId);
            if (result) {
                hasImprinted = result.action === 'added';
                
                // Update imprint count
                const imprintCountElements = card.querySelectorAll('.imprint-count');
                const newCount = result.action === 'added' ? imprintCount + 1 : imprintCount - 1;
    
                imprintCountElements.forEach(el => {
                    el.textContent = newCount;
                });
    
                // Update button styles
                updateImprintButton();
            }
        });
    
        const imprintCountElements = card.querySelectorAll('.imprint-count');
        const icons = card.querySelectorAll('.nft-icon');
    
        if (imprintButton) {
            if (hasImprinted) {
                imprintButton.classList.add('text-purple-400');
                imprintButton.classList.remove('text-gray-400');
            } else {
                imprintButton.classList.remove('text-purple-400');
                imprintButton.classList.add('text-gray-400');
            }
        }
    
        icons.forEach(icon => {
            const parentElement = icon.closest('button, div');
            if (hasImprinted) {
                parentElement.classList.add('text-purple-400');
                parentElement.classList.remove('text-gray-400');
            } else {
                parentElement.classList.remove('text-purple-400');
                parentElement.classList.add('text-gray-400');
            }
        });
      };
    
          // Check if user has imprinted this NFT when card is created
          checkUserImprint(nft.tokenId).then(result => {
            hasImprinted = result;
            updateImprintButton();
        });
    
        // Add event listener for imprint button
        const imprintButton = card.querySelector('[data-nft-action="imprint"]');
        imprintButton.addEventListener('click', async (e) => {
            e.stopPropagation();
    
            const tokenId = imprintButton.dataset.tokenId;
            const ownerId = imprintButton.dataset.ownerId;
    
            const result = await imprintNFT(tokenId, ownerId);
            if (result) {
                // Toggle imprint state
                hasImprinted = !hasImprinted;
    
                // Update all imprint count elements in this card
                const imprintCountElements = card.querySelectorAll('.imprint-count');
                const newCount = hasImprinted ? imprintCount + 1 : imprintCount - 1;
                imprintCountElements.forEach(el => {
                    el.textContent = newCount;
                });
    
                // Update the styling based on the new state
                updateImprintButton();
            }
        });

    return card;
}

// Function to initialize slider
async function initNFTSlider() {
    const slider = document.getElementById('slider');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    let currentSlide = 0;

    // Fetch NFT data
    const nfts = await fetchNFTData();

    // Populate slider with NFT items
    slider.innerHTML = nfts.map(createNFTSliderItem).join('');

    // Slider navigation
    function updateSlider() {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    setTimeout(() => {
        updatePrices(); 
    }, 100);
}

// Initialize slider when page loads
document.addEventListener('DOMContentLoaded', initNFTSlider);


document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('slider');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const carItems = slider.querySelectorAll('.car-item');
    const bgElement = document.getElementById("background");
    let currentSlide = 0;

    // Slider navigation function
    function updateSlider() {
        // Translate the slider based on current slide
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Function to generate a random color
    function getRandomColor() {
        return `rgba(${Math.floor(Math.random() * 200) + 50}, ${Math.floor(Math.random() * 200) + 50}, ${Math.floor(Math.random() * 200) + 50}, 0.5)`; 
        // Adjusted to avoid very dark or very light colors
    }



    
    // Next slide functionality
    nextButton.addEventListener('click', () => {
        if (currentSlide < carItems.length - 1) {
            currentSlide++;
            updateSlider();
            const color1 = getRandomColor();
            const color2 = 'rgb(17, 24, 39)';
            bgElement.style.backgroundImage = `linear-gradient(to bottom, ${color1}, ${color2})`;
            // Function to update background when a button is clicked
            // function updateBackground() {
            //     console.log(color1);
            //     console.log(color2);
            // }
            // updateBackground();
        }else{
            currentSlide--;
            updateSlider();
        }
        console.log(color2);
    });

    // Previous slide functionality
    prevButton.addEventListener('click', () => {
        const color1 = getRandomColor();
        const color2 = 'rgb(17, 24, 39)';
        bgElement.style.backgroundImage = `linear-gradient(to bottom, ${color1}, ${color2})`;
        if (currentSlide > 0) {
            currentSlide--;
            updateSlider();
        }
    });

    // Optional: Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        const color1 = getRandomColor();
        const color2 = 'rgb(17, 24, 39)';
        bgElement.style.backgroundImage = `linear-gradient(to bottom, ${color1}, ${color2})`;
        if (e.key === 'ArrowRight') nextButton.click();
        if (e.key === 'ArrowLeft') prevButton.click();
    });

    // Optional: Add swipe navigation for touch devices
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener('touchstart', (e) => {
        const color1 = getRandomColor();
        const color2 = 'rgb(17, 24, 39)';
        bgElement.style.backgroundImage = `linear-gradient(to bottom, ${color1}, ${color2})`;
        touchStartX = e.changedTouches[0].screenX;
    });

    slider.addEventListener('touchend', (e) => {
        const color1 = getRandomColor();
        const color2 = 'rgb(17, 24, 39)';
        bgElement.style.backgroundImage = `linear-gradient(to bottom, ${color1}, ${color2})`;
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX) {
            // Swiped left, go to next slide
            const color1 = getRandomColor();
            const color2 = 'rgb(17, 24, 39)';
            bgElement.style.backgroundImage = `linear-gradient(to bottom, ${color1}, ${color2})`;
            nextButton.click();
        } else if (touchEndX > touchStartX) {
            // Swiped right, go to previous slide
            const color1 = getRandomColor();
            const color2 = 'rgb(17, 24, 39)';
            bgElement.style.backgroundImage = `linear-gradient(to bottom, ${color1}, ${color2})`;
            prevButton.click();
        }
    }
});


function showLoading() {
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

function checkAuthState() {
    const token = localStorage.getItem('authToken');
    return !!token; // Returns true if token exists, false otherwise
}

function hideLoading() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        loadingModal.remove();
    }
}



async function fetchTrendingnfts() {
    showLoading();
    try {
        const response = await fetch('https://backend.tokenated.com/api/nfts/trendingNFTs');
        const nfts = await response.json();

        const container1 = document.querySelector('#nftList');
        container1.innerHTML = '';

        nfts.forEach(nft => {
            const cardTrendHTML = createTrendingNFTCard(nft);
            console.log(nft);
            container1.insertAdjacentHTML('beforeend', cardTrendHTML);
        });

        // Add event listeners to new cards
        // attachCardEventListeners();
    } catch (error) {
        console.error('Error fetching trending nfts:', error);
    } finally {
        hideLoading();
    }
    setTimeout(() => {
        updatePrices(); 
    }, 100);
}
function checkCreatorIsVerified(nft) {
    if (!nft) return '';

    if (nft.isCreatorVerified === true) {
        return `
        <div class="inline-flex items-center justify-center ml-1 group">
            <div class="relative">
                <!-- Premium gold outer glow -->
                <div class="absolute -inset-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-300 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <!-- Subtle pulsing effect -->
                <div class="absolute inset-0 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full opacity-20 animate-[ping_2s_ease-in-out_infinite]"></div>
                
                <!-- Main badge with golden gradient -->
                <div class="relative flex items-center justify-center w-5 h-5 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-400 rounded-full shadow-lg transform group-hover:scale-110 transition-all duration-300 ease-in-out hover:shadow-amber-400/50">
                    <svg 
                        class="w-3 h-3 text-white drop-shadow-sm" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path 
                            fill-rule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clip-rule="evenodd" 
                        />
                    </svg>
                </div>
            </div>
        </div>
        `;
    } 
    
    return '';
}

function checkOwnerIsVerified(nft) {
    // Add null/undefined check
    if (!nft) return '';

    // Use strict comparison and handle different verification flags
    if ( nft.isOwnerVerified === true) {
        return `
        <div class="inline-flex items-center justify-center ml-1 group">
            <div class="relative">
                <!-- Premium outer glow with gradient -->
                <div class="absolute -inset-1 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <!-- Enhanced pulsing effect -->
                <div class="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-20 animate-[ping_2s_ease-in-out_infinite]"></div>
                
                <!-- Main badge container with enhanced gradient -->
                <div class="relative flex items-center justify-center w-5 h-5 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full shadow-lg transform group-hover:scale-110 transition-all duration-300 ease-in-out hover:shadow-blue-400/50">
                    <!-- Optimized checkmark SVG -->
                    <svg 
                        class="w-3 h-3 text-white drop-shadow-sm" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path 
                            fill-rule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clip-rule="evenodd" 
                        />
                    </svg>
                </div>
            </div>
        </div>
        `;
    } 
    
    // Return empty string for non-verified cases
    return '';
}

function createTrendingNFTCard(nft) {
    console.log('nftssss', nft);
    

    return `
        <div class="group hover:bg-gray-800/50 transition-colors duration-300">
                <!-- Mobile View -->
                <div class="block md:hidden p-4 border-b border-gray-700/50">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <span class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">#${nft.tokenId}</span>
                            <div class="w-12 h-12 rounded-xl overflow-hidden cursor-pointer" onclick="redirectToNFTDetails('${nft._id}')">
                                <img loading="lazy" src="${nft.image}" alt="${nft.name}" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <h3 class="font-semibold text-white cursor-pointer" onclick="redirectToNFTDetails('${nft.tokenId}')">${nft.name}</h3>
                                <span class="text-sm text-gray-400">Token #${nft.tokenId}</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex items-center gap-1 nft-price-container bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-xl transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg max-w-fit cursor-pointer group" data-eth-price="${nft.price}">
                            <img 
                                loading="lazy" 
                                src="assets/images/ethereum-icon.png" 
                                alt="ETH" 
                                class="w-4 h-4 object-contain drop-shadow-[0_0_2px_rgba(78,153,244,0.2)]"
                            >
                            <span class="font-semibold text-white group-hover:text-blue-400 transition-colors">${nft.price} ETH</span>
                            <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors usd-price">Loading...</span>
                        </div>
                        <div class="bg-gray-800/30 rounded-lg p-3 cursor-pointer" onclick="redirectToCreatorProfile('${nft.userId}')">
                            <p class="text-sm text-gray-400 mb-1">Creator</p>
                            <div class="flex items-center">
                                <span class="font-semibold text-white max-w-[120px] truncate">${nft.creatorName}</span>
                                ${checkCreatorIsVerified(nft)}

                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Desktop View -->
                <div class="hidden md:grid grid-cols-[0.5fr,2fr,1.5fr,1.5fr,1fr,1fr] gap-4 p-6 items-center border-b border-gray-700/50">
                    <div class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        #${nft.tokenId}
                    </div>
                    <div class="flex items-center gap-4 cursor-pointer" onclick="redirectToNFTDetails('${nft._id}')">
                        <div class="w-12 h-12 rounded-xl overflow-hidden">
                            <img loading="lazy" src="${nft.image}" alt="${nft.name}" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <h3 class="font-semibold text-white max-w-[200px] truncate">${nft.name}</h3>
                            <span class="text-sm text-gray-400">Token #${nft.tokenId}</span>
                        </div>
                    </div>
                    <div class="cursor-pointer" onclick="redirectToCreatorProfile('${nft.creatorId}')">
                        
                        <div class="flex items-center gap-2">
                            <img loading="lazy" src="${nft.creatorAvatar}" alt="Creator" class="w-6 h-6 rounded-full">
                            <span class="font-semibold text-white max-w-[150px] truncate" title="${nft.creatorName}">${nft.creatorName}</span>${checkCreatorIsVerified(nft)}
                        </div>
                    </div>
                    <div>
    
    <div class="cursor-pointer flex items-center gap-2" onclick="redirectToOwnerProfile('${nft.ownerId}')">
        <img loading="lazy" src="${nft.ownerAvatar}" alt="Owner" class="w-6 h-6 rounded-full">
        <span class="font-semibold text-white max-w-[150px] truncate" title="${nft.ownerName}">
            ${nft.ownerName}
        </span>
        ${checkOwnerIsVerified(nft)}
    </div>
</div>
                    <div>
                        
                       <div class="flex items-center gap-1 nft-price-container bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-xl transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg max-w-fit cursor-pointer group" data-eth-price="${nft.price}">
                            <img 
                                loading="lazy" 
                                src="assets/images/ethereum-icon.png" 
                                alt="ETH" 
                                class="w-4 h-4 object-contain drop-shadow-[0_0_2px_rgba(78,153,244,0.2)]"
                            >
                            <span class="font-semibold text-white group-hover:text-blue-400 transition-colors">${nft.price} ETH</span>
                            <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors usd-price">Loading...</span>
                        </div>

                    </div>
                    <div>
                        
                        <span class="inline-block px-3 py-1 text-sm font-medium rounded-full bg-green-500/20 text-green-400 ">
                            Listed
                        </span>
                    </div>
                </div>
            </div>
    `;
}


document.querySelector('#nftList').insertAdjacentHTML('beforebegin', `
    <div class="hidden md:grid grid-cols-[0.5fr,2fr,1.5fr,1.5fr,1fr,1fr] gap-4 p-4 px-6 bg-gray-800/40 items-center rounded-t-xl">
        <div class="text-sm font-medium text-gray-400">Rank</div>
        <div class="text-sm font-medium text-gray-400">NFT</div>
        <div class="text-sm font-medium text-gray-400">Creator</div>
        <div class="text-sm font-medium text-gray-400">Owner</div>
        <div class="text-sm font-medium text-gray-400">Price</div>
        <div class="text-sm font-medium text-gray-400">Status</div>
    </div>
`)






async function fetchTrendingAuctions() {
    console.log('fetching trending auctions');
    showLoading();
    try {
        const response = await fetch('https://backend.tokenated.com/api/nfts/trendingAuctions');
        const auctions = await response.json();
        console.log('auctions', auctions);
        
        const container1 = document.querySelector('#auctionList');
        if (!container1) {
            console.error('Could not find #auctionList element');
            return;
        }
        container1.innerHTML = '';

        auctions.forEach(auction => {
            const cardTrendHTML = createAuctionNFTCard(auction);
            console.log('Processing auction:', auction);
            container1.insertAdjacentHTML('beforeend', cardTrendHTML);
        });

        // Add event listeners to new cards
        // attachCardEventListeners();
        
    } catch (error) {
        console.error('Error fetching trending auctions:', error);
    } finally {
        hideLoading();
    }
    setTimeout(() => {
        updatePrices(); // Call updatePrices only after NFTs are loaded
    }, 100);
}


function createAuctionNFTCard(auctions) {
    console.log('auctionnaire', auctions);
    return `
        <div class="group hover:bg-gray-800/50 transition-colors duration-300">
                <!-- Mobile View -->
                <div class="block md:hidden p-4 border-b border-gray-700/50">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <span class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">#${auctions.tokenId}</span>
                            <div class="w-12 h-12 rounded-xl overflow-hidden cursor-pointer" onclick="redirectToNFTDetails('${auctions._id}')">
                                <img loading="lazy" src="${auctions.image}" alt="${auctions.name}" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <h3 class="font-semibold text-white cursor-pointer" onclick="redirectToNFTDetails('${auctions.tokenId}')">${auctions.name}</h3>
                                <span class="text-sm text-gray-400">Token #${auctions.tokenId}</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                       <div class="flex items-center gap-1 nft-price-container bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-xl transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg max-w-fit cursor-pointer group" data-eth-price="${auctions.currentBid}">
                            <img 
                                loading="lazy" 
                                src="assets/images/ethereum-icon.png" 
                                alt="ETH" 
                                class="w-4 h-4 object-contain drop-shadow-[0_0_2px_rgba(78,153,244,0.2)]"
                            >
                            <span class="font-semibold text-white group-hover:text-blue-400 transition-colors">${auctions.currentBid} ETH</span>
                            <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors usd-price">Loading...</span>
                        </div>
                        <div class="bg-gray-800/30 rounded-lg p-3 cursor-pointer" onclick="redirectToCreatorProfile('${auctions.userId}')">
                            <p class="text-sm text-gray-400 mb-1">Creator</p>
                            <div class="flex items-center">
                                <span class="font-semibold text-white max-w-[120px] truncate">${auctions.creatorName}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Desktop View -->
                <div class="hidden md:grid grid-cols-[0.5fr,2fr,1.5fr,1.5fr,1fr,1fr] gap-4 p-6 items-center border-b border-gray-700/50">
                    <div class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                        #${auctions.tokenId}
                    </div>
                    <div class="flex items-center gap-4 cursor-pointer" onclick="redirectToNFTDetails('${auctions._id}')">
                        <div class="w-12 h-12 rounded-xl overflow-hidden">
                            <img loading="lazy" src="${auctions.image}" alt="${auctions.name}" class="w-full h-full object-cover">
                        </div>
                        <div>
                            <h3 class="font-semibold text-white max-w-[200px] truncate">${auctions.name}</h3>
                            <span class="text-sm text-gray-400">Token #${auctions.tokenId}</span>
                        </div>
                    </div>
                    <div class="cursor-pointer" onclick="redirectToCreatorProfile('${auctions.creatorId}')">
                       
                        <div class="flex items-center gap-2">
                            <img loading="lazy" src="${auctions.creatorAvatar}" alt="Creator" class="w-6 h-6 rounded-full">
                            <span class="font-semibold text-white max-w-[150px] truncate" title="${auctions.creatorName}">${auctions.creatorName}</span>
                        </div>
                    </div>
                    <div>
                        
                        <div class="cursor-pointer flex items-center gap-2" onclick="redirectToOwnerProfile('${auctions.ownerId}')">
                            <img loading="lazy" src="${auctions.ownerAvatar}" alt="Owner" class="w-6 h-6 rounded-full">
                            <span class="font-semibold text-white max-w-[150px] truncate" title="${auctions.ownerName}">
                                ${auctions.ownerName}
                            </span>
                        </div>
                    </div>
                    <div>
                        
                        <div class="flex items-center gap-1 nft-price-container bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-xl transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg max-w-fit cursor-pointer group" data-eth-price="${auctions.currentBid}">
                            <img 
                                loading="lazy" 
                                src="assets/images/ethereum-icon.png" 
                                alt="ETH" 
                                class="w-4 h-4 object-contain drop-shadow-[0_0_2px_rgba(78,153,244,0.2)]"
                            >
                            <span class="font-semibold text-white group-hover:text-blue-400 transition-colors">${auctions.currentBid} ETH</span>
                            <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors usd-price">Loading...</span>
                        </div>
                    </div>
                    <div>
                        
                        <span class="inline-block px-3 py-1 text-sm font-medium rounded-full bg-green-500/20 text-green-400:
                'bg-gray-500/20 text-gray-400'
        }">
                           On Auction
                        </span>
                    </div>
                </div>
            </div>
    `;
}

document.querySelector('#auctionList').insertAdjacentHTML('beforebegin', `
    <div class="hidden md:grid grid-cols-[0.5fr,2fr,1.5fr,1.5fr,1fr,1fr] gap-4 p-4 px-6 bg-gray-800/40 items-center rounded-t-xl">
        <div class="text-sm font-medium text-gray-400">Rank</div>
        <div class="text-sm font-medium text-gray-400">NFT</div>
        <div class="text-sm font-medium text-gray-400">Creator</div>
        <div class="text-sm font-medium text-gray-400">Owner</div>
        <div class="text-sm font-medium text-gray-400">Current Bid</div>
        <div class="text-sm font-medium text-gray-400">Status</div>
    </div>
`)
async function getEthPrice() {
    try {
        console.log("Fetching ETH price...");
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("ETH Price Fetched:", data);
        return data.ethereum.usd;
    } catch (error) {
        console.error("Error fetching ETH price:", error);
        return null;
    }
}

async function updatePrices() {
    console.log("updatePrices() called...");

    const ethPrice = await getEthPrice();
    if (!ethPrice) {
        console.error("Failed to fetch ETH price.");
        return;
    }

    document.querySelectorAll('.nft-price-container').forEach(container => {
        const ethAmount = parseFloat(container.getAttribute('data-eth-price'));
        if (isNaN(ethAmount)) {
            console.error("Invalid ETH amount in:", container);
            return;
        }

        const usdPrice = ethAmount * ethPrice;
        const formattedPrice = new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
        }).format(usdPrice);

        console.log(`Updating ETH ${ethAmount} → USD ${formattedPrice}`);
        container.querySelector('.usd-price').textContent = `(${formattedPrice})`;
    });
}



function redirectToCreatorProfile(creatorId) {
    window.location.href = `./creatorpage.html?id=${creatorId}`;
}
function redirectToOwnerProfile(ownerId) {
    window.location.href = `./creatorpage.html?id=${ownerId}`;
}


// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchTrendingAuctions();
    checkAuthState();
    fetchTrendingnfts();
   
    
   

    // Add event listener for load more button
    document.querySelector('.text-center button').addEventListener('click', () => {
        fetchTrendingnfts();

    });


});
  
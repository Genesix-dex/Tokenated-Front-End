


const baseUrl = 'https://backend.tokenated.com/api';
// API endpoints
const API_ENDPOINTS = {
  nft: 'https://backend.tokenated.com/api/nfts/nft',
  user: 'https://backend.tokenated.com/api/user/profile',
  auth: 'https://backend.tokenated.com/api/auth/status'
};

// Loading modal component
const loadingModal = {
  show() {
    const modal = document.createElement('div');
    modal.id = 'loadingModal';
    modal.innerHTML = `
      <div class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="bg-gray-800 rounded-xl p-8 flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          <p class="text-white mt-4">Loading...</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },
  
  hide() {
    const modal = document.getElementById('loadingModal');
    if (modal) modal.remove();
  }
};

// Authentication handler
class Auth {
  static async checkAuthState() {
    const token = localStorage.getItem('authToken');
    return !!token; 
  }

  static async getUserProfile() {
    try {
      const response = await fetch(API_ENDPOINTS.user);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }
}

// NFT data handler
class NFTDataHandler {
  static async getNFTDetails(tokenId) {
    try {
      const response = await fetch(`${API_ENDPOINTS.nft}/${tokenId}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch NFT details:', error);
      return null;
    }
  }

  static async getTrendingNfts() {
    try {
      const response = await fetch("https://backend.tokenated.com/api/nfts/trending");
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch featured collections:', error);
      return [];
    }
  }

 
}

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

const hideModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
      modal.remove();
  }
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

const isUserLoggedIn = () => {
  return !!localStorage.getItem('accessToken');
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

// UI updater with separate auction and regular NFT displays
class UIUpdater {
  static updateNFTDetails(nftData) {
    console.log("nft data",nftData);
    if (!nftData) return;
    

    // Update the button based on whether it's an auction
    const actionButton = document.querySelector('[data-nft-action]');
    if (actionButton) {
      if (nftData.isAuction) {
        actionButton.textContent = 'Place Bid';
        actionButton.className = 'bg-purple-400/50 px-6 py-2 rounded-xl text-gray-200 m-auto hover:bg-purple-500/50';
        actionButton.dataset.nftAction = 'bid';
        actionButton.dataset.currentPrice = nftData.auction.currentBid;
      } else {
        actionButton.textContent = 'Buy Now';
        actionButton.className = 'bg-green-400/50 px-6 py-2 rounded-xl text-gray-200 m-auto hover:bg-green-500/50';
        actionButton.dataset.nftAction = 'buy';
        actionButton.dataset.currentPrice = nftData.price;
      }
      actionButton.dataset.tokenId = nftData.tokenId;
      actionButton.dataset.nftName = nftData.name;
      actionButton.dataset.nftImage = nftData.image;
    }

    if (nftData.isAuction) {
    
      this.updateAuctionDisplay(nftData);
    } else {
      this.updateRegularNFTDisplay(nftData);
    }

    if (nftData.auction) {
      this.updateAuctionDisplay(nftData);
    } else {
      this.updateRegularNFTDisplay(nftData);
    }
  }

  static updateAuctionDisplay(nftData) {
    const mainContainer = document.querySelector('.nft-details-container');
    if (!mainContainer) return;
  
    const auctionEndTime = new Date(nftData.auctionEndTime);
    const isEnded = new Date() > auctionEndTime;
    
    
    const imprintCount = nftData.imprints?.imprintCount || 0;
    let hasImprinted = false;
    const imprintButtonHTML = `
    <button class="absolute bottom-2 right-2 flex items-center gap-1 px-3 py-1 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 transition-colors text-gray-400" data-nft-action="imprint" data-token-id="${nftData.tokenId}" data-owner-id="${nftData.owner?._id || nftData.creator?.id}">
        <svg class="w-4 h-4 nft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 7C16.6569 7 18 8.34315 18 10C18 11.6569 16.6569 13 15 13C13.3431 13 12 11.6569 12 10C12 8.34315 13.3431 7 15 7Z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 13L3 22M7 17H3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M19 10H21M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="text-sm font-medium imprint-count">${imprintCount}</span>
    </button>
`;

    // Update the main display area for auction
    mainContainer.innerHTML = `
    <div class="bg-[url('${nftData.image}')] rounded-xl w-full max-w-7xl p-0 bg-center">
      <div class="w-full max-w-6xl bg-gradient-to-r from-gray-500/30 to-gray-600/30 bg-opacity-10 rounded-xl shadow-lg m-auto p-2 backdrop-blur-xl">
        <!-- NFT Info Banner -->
        <div class="bg-purple-500/20 rounded-lg p-4 flex items-center justify-between mb-4">
          <div>
            <span class="text-purple-400 font-semibold">
              ${isEnded ? 'Auction Ended' : 'Live Auction'}
            </span>
            <p class="text-sm text-gray-300 mt-1">
              Created by ${nftData.creator ? nftData.creator.username : "Unknown"}
            </p>

          </div>
          <span class="px-3 py-1 bg-purple-500/30 rounded-full text-purple-300">
            #${nftData.tokenId}
          </span>
        </div>
        <div class="grid md:grid-cols-2 gap-6">
        
          <!-- Left Side: Image Box -->
          <div class="relative bg-[#080A10] rounded-xl p-4 border border-blue-500 self-center">
            <img src="${nftData.image}" alt="${nftData.name}" class="rounded-xl w-full max-h-[500px]">
            
            <!-- Top Circle Indicator -->
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full"></div>
            ${imprintButtonHTML}
          </div>

          <!-- Right Side: Details -->
          <div class="space-y-4">
            <h2 class="text-xl font-bold">${nftData.name}</h2>
              <fieldset 
          class="text-wrap max-w-[500px] border-2 
                border-gray-700/50 px-4 pb-4 bg-gray-700 
                md:max-h-[full] max-h-[320px] rounded-xl overflow-auto
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-600
                ">
            <legend>
                <button class="text-sm px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    Description
                </button>
            </legend>

            <p class="text-gray-300 leading-relaxed max-w-[450px] max-h-full">${nftData.description}</p>
        </fieldset>
          </div>
        </div>

        <!-- Bid Information -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <div class="bg-[#1A1D24] p-3 rounded-lg text-center">
            <p class="text-sm text-gray-400">Current bid</p>
            <p class="text-lg font-bold">${nftData.auction.currentBid} ETH</p>
          </div>
          <div class="bg-[#1A1D24] p-3 rounded-lg text-center">
            <p class="text-sm text-gray-400">Bid increment</p>
            <p class="text-lg font-bold">${nftData.auction.minBidIncrement} ETH</p>
          </div>
          <div class="bg-[#1A1D24] p-3 rounded-lg text-center col-span-2 md:col-span-1">
            <p class="text-sm text-gray-400">Time remaining</p>
            <p class="text-lg font-bold">${nftData.auction.timeRemaining}</p>
          </div>
        </div>

        <!-- Place Bid Button -->
        <div class="mt-6 grid grid-cols-[3fr_1fr]">
        <!-- Bid History -->
        <div class="bg-[#1A1D24] p-4 rounded-lg">
          <h3 class="text-sm font-bold">Bid History</h3>
          <p class="text-gray-500 text-center mt-2">
            ${nftData.auctionBids && nftData.auctionBids.length > 0 ? 
              nftData.auctionBids.map(bid => `
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 rounded-full bg-purple-500/30"></div>
                  <span class="text-gray-300">${bid.bidder || 'Anonymous'}</span>
                </div>
                <span class="text-purple-400">${bid.amount} ETH</span>
              </div>
            `).join('') 
            : '<p class="text-gray-400">No bids yet</p>'
          }
        </p>
    </div>
          <div class="flex items-center align-middle p-2 justify-around">
          ${isEnded ? `
          <button class=" bg-green-600 hover:bg-gray-700 text-white font-bold py-2 p-3 rounded-lg min-w-[50%]">
            Auction Ended
          </button>
          ` : `
          <button class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg p-3 min-w-[70%]" data-nft-action="bid"
            data-token-id="${nftData.tokenId}"
            data-nft-name="${nftData.name}"
            data-nft-image="${nftData.image}"
            data-current-price="${nftData.auction.currentBid}">
              place bid
          </button>`}
          </div>
        </div>

        
    </div>
    </div>
    `;
  
    // Initialize countdown timer
    this.initializeCountdown(nftData.auctionEndTime);

    
    
  const updateImprintButton = () => {
    console.log("buttoooon has started");
    const imprintButton = mainContainer.querySelector('[data-nft-action="imprint"]');
    console.log("buttoooon",imprintButton);
    if (!imprintButton){
      console.log("buttoooon does not exist");

       return;
      };

    // Remove existing event listeners to prevent duplicates
    imprintButton.replaceWith(imprintButton.cloneNode(true));

    // Re-select the button after cloning (previous reference is lost)
    const newImprintButton = mainContainer.querySelector('[data-nft-action="imprint"]');

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

    const imprintCountElements = mainContainer.querySelectorAll('.imprint-count');
    const icons = mainContainer.querySelectorAll('.nft-icon');

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
      checkUserImprint(nftData.tokenId).then(result => {
        hasImprinted = result;
        updateImprintButton();
    });

    // Add event listener for imprint button
    const imprintButton = mainContainer.querySelector('[data-nft-action="imprint"]');
    imprintButton.addEventListener('click', async (e) => {
        e.stopPropagation();

        const tokenId = imprintButton.dataset.tokenId;
        const ownerId = imprintButton.dataset.ownerId;

        const result = await imprintNFT(tokenId, ownerId);
        if (result) {
            // Toggle imprint state
            hasImprinted = !hasImprinted;

            // Update all imprint count elements in this card
            const imprintCountElements = mainContainer.querySelectorAll('.imprint-count');
            const newCount = hasImprinted ? imprintCount + 1 : imprintCount - 1;
            imprintCountElements.forEach(el => {
                el.textContent = newCount;
            });

            // Update the styling based on the new state
            updateImprintButton();
        }
    });



  }

  static updateRegularNFTDisplay(nftData) {
    console.log('blaaaa',nftData);
    const mainContainer = document.querySelector('.nft-details-container');
    if (!mainContainer) return;


    setTimeout(() => {
      updatePrices(); // Call updatePrices only after NFTs are loaded
  }, 100);

    const imprintCount = nftData.imprints?.imprintCount || 0;
    let hasImprinted = false;
    const imprintButtonHTML = `
    <button class="absolute bottom-2 right-2 flex items-center gap-1 px-3 py-1 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 transition-colors text-gray-400" data-nft-action="imprint" data-token-id="${nftData.tokenId}" data-owner-id="${nftData.owner?._id || nftData.creator?.id}">
        <svg class="w-4 h-4 nft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 7C16.6569 7 18 8.34315 18 10C18 11.6569 16.6569 13 15 13C13.3431 13 12 11.6569 12 10C12 8.34315 13.3431 7 15 7Z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 13L3 22M7 17H3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M19 10H21M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="text-sm font-medium imprint-count">${imprintCount}</span>
    </button>
`;

    mainContainer.innerHTML = `
    <div class="bg-[url('${nftData.image}')] rounded-xl w-full max-w-7xl p-0">
    <div class="w-full bg-gradient-to-r from-gray-500/30 to-gray-600/30 max-w-7xl p-6 rounded-xl shadow-lg bg-opacity-10 backdrop-blur-xl">
    <!-- Main Content Grid -->
    <div class="rounded-lg p-2 flex items-center justify-between">
      <span class="text-[#384045] font-semibold bg-blue-300 px-2 rounded-xl">Fixed Price</span>
      <span class="px-3 py-1 bg-green-500/30 rounded-full text-green-300">
        #${nftData.tokenId}
      </span>
    </div>
    <div class="grid md:grid-cols-2 grid-cols-1 gap-x-6 gap-y-0">
    
      <!-- Left Side: Image Box -->
      <div class="relative bg-[#080A10] rounded-xl p-2 border border-blue-500 self-center">
        <img src="${nftData.image}" alt="${nftData.name}" class="rounded-xl w-full">
        
        <!-- Top Circle Indicator -->
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full"></div>
        ${imprintButtonHTML}
      </div>

      <!-- Right Side: Details -->
      <div class="space-y-4 row-span-2">
        <div class="">
          <div class="flex items-center space-x-3 cursor-pointer bg-gray-900/30 rounded-full px-2 w-fit" onclick="redirectToCreatorPage('${nftData.owner?._id}')">
            
            <img src="${nftData.owner?.profileImage}" alt="" class="w-7 h-7 rounded-full">
            <div>
              <p class="text-blue-500 text-sm hover:underline">${nftData.owner?.username || 'Unknown'}</p>
              <p class="text-sm text-gray-400">Owner since ${new Date(nftData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <h2 class="text-xl font-bold">${nftData.name}</h2>
        <fieldset 
          class="text-wrap max-w-[500px] border-2 
                border-gray-700/50 px-4 pb-4 bg-gray-700 
                md:max-h-[full] max-h-[320px] rounded-xl overflow-auto
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:bg-gray-100
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-gray-600
                ">
            <legend>
                <button class="text-sm px-4 py-2 text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    Description
                </button>
            </legend>

            <p class="text-gray-300 leading-relaxed max-w-[450px] max-h-full">${nftData.description}</p>
        </fieldset>
      </div>
      
      <!-- Owner Info -->
      
       
          
            <div class="flex space-x-3 relative cursor-pointer" onclick="redirectToCreatorPage('${nftData.creator?._id}')">

              <div class="items-center relative flex">
                <p class="mr-2 ml-2">created by </p> 
                <p class="text-blue-500 text-sm relative hover:underline"> ${nftData.creator?.username || 'Unknown'}</p>
              </div>
            </div>
        </div>
        <div class="grid md:grid-cols-2 grid-cols-1 items-start gap-4">
        <div>
          <div class="border border-gray-700 rounded-lg w-full bg-gradient-to-r from-indigo-500/30 to-purple-600/30">
              <button onclick="toggleSection('content1')" class="w-full flex justify-between items-center p-4 text-left text-white hover:bg-gray-700 transition-colors duration-200 rounded-lg">
                  <h2 class="text-lg font-semibold text-blue-300">Attributes</h2>
                  <svg class="w-6 h-6 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
              </button>
              <div id="content1" class="hidden p-4 text-gray-300 border-t border-blue-700/50">
                <div class="">
                  <div class="grid grid-cols-2">
                    <p class="px-4">trait type</p><p class="px-2">value</p>
                  </div>
                  <div
                    class="grid grid-cols-2 items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg transition-transform transform hover:scale-105"
                  >
                    <p class="text-sm uppercase opacity-80">background</p>
                    <p class="text-lg font-bold">{attr.value}</p>
                  </div>

                </div>
              </div>
          </div>
          <div class="border border-gray-700 rounded-lg w-full bg-gradient-to-r from-indigo-500/30 to-purple-600/30 mt-4">
              <button onclick="toggleSection('content2')" class="w-full flex justify-between items-center p-4 text-left text-white hover:bg-gray-700 transition-colors duration-200 rounded-lg">
                  <h2 class="text-lg font-semibold text-blue-300">Sales history</h2>
                  <svg class="w-6 h-6 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
              </button>
              <div id="content2" class="hidden p-4 text-gray-300 border-t border-blue-700/50">
                <div class="">
                  <div class="grid grid-cols-[5fr_3fr]">
                    <p class="px-4">User</p><p class="px-2">Amount</p>
                  </div>
                  <div
                    class="grid grid-cols-[5fr_3fr] items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl md:p-4 p-2 shadow-lg transition-transform transform hover:scale-105"
                  >
                    <div class="flex items-center space-x-3 cursor-pointer bg-gray-900/30 rounded-full px-2 w-fit" onclick="redirectToCreatorPage('${nftData.owner?._id}')">
                      <img src="${nftData.owner?.profileImage}" alt="" class="w-7 h-7 rounded-full">
                      <div>
                        <p class="text-blue-500 text-sm hover:underline">${nftData.owner?.username || 'Unknown'}</p>
                        <p class="text-sm text-gray-400">${new Date(nftData.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p class="text-lg font-bold">0.02 ETH</p>
                  </div>
  
                </div>
              </div>
          </div>
        </div>
      <!--</div>-->
      <!-- Bid Information -->
      <div class="grid grid-cols-1 gap-4 mt-6">
        <div class="grid grid-cols-4 grid-row-1 -space-x-2 group">
          <div class="bg-[#1A1D24] group-hover:text-blue-400 col-span-2 p-2 rounded-lg text-center nft-price-container" data-eth-price="${nftData.price}">
            <p class="text-lg font-bold">${nftData.price} ETH <span class="text-md text-gray-400 group-hover:text-gray-300 transition-colors usd-price">Loading...</span></p>
          </div>
          <button class="w-full col-span-2 bg-green-500 hover:bg-green-600 transform transition duration-500 hover:scale-[102%] text-white rounded-lg transition-colors " data-nft-action="buy"
            data-token-id="${nftData.tokenId}"
            data-nft-name="${nftData.name}"
            data-nft-image="${nftData.image}"
            data-current-price="${nftData.price}">
              Buy <!--Now for ${nftData.price} ETH-->
          </button>
        </div>
      </div>
      </div>
      </div>
    </div>

    </div>
    </div>
    `;

    
  const updateImprintButton = () => {
    console.log("buttoooon has started");
    const imprintButton = mainContainer.querySelector('[data-nft-action="imprint"]');
    console.log("buttoooon",imprintButton);
    if (!imprintButton){
      console.log("buttoooon does not exist");

       return;
      };

    // Remove existing event listeners to prevent duplicates
    imprintButton.replaceWith(imprintButton.cloneNode(true));

    // Re-select the button after cloning (previous reference is lost)
    const newImprintButton = mainContainer.querySelector('[data-nft-action="imprint"]');

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

    const imprintCountElements = mainContainer.querySelectorAll('.imprint-count');
    const icons = mainContainer.querySelectorAll('.nft-icon');

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
      checkUserImprint(nftData.tokenId).then(result => {
        hasImprinted = result;
        updateImprintButton();
    });

    // Add event listener for imprint button
    const imprintButton = mainContainer.querySelector('[data-nft-action="imprint"]');
    imprintButton.addEventListener('click', async (e) => {
        e.stopPropagation();

        const tokenId = imprintButton.dataset.tokenId;
        const ownerId = imprintButton.dataset.ownerId;

        const result = await imprintNFT(tokenId, ownerId);
        if (result) {
            // Toggle imprint state
            hasImprinted = !hasImprinted;

            // Update all imprint count elements in this card
            const imprintCountElements = mainContainer.querySelectorAll('.imprint-count');
            const newCount = hasImprinted ? imprintCount + 1 : imprintCount - 1;
            imprintCountElements.forEach(el => {
                el.textContent = newCount;
            });

            // Update the styling based on the new state
            updateImprintButton();
        }
    });


  }

  static initializeCountdown(endTime) {
    const countdownElement = document.querySelector('.countdown');
    if (!countdownElement) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = new Date(endTime) - now;

      if (distance < 0) {
        countdownElement.textContent = "Auction Ended";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }


static updateTrendingNfts(nfts) {
  console.log('nftssss',nfts);
  const container = document.querySelector('.featured-nfts');
  if (!container) return;
  
  // const imprintCount = nfts.imprintCount || 0;

  container.innerHTML = nfts.map(nft => `
      <div class="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer ring-2 hover:ring-blue-500"
               data-token-id="${nft.tokenId}"
               >
                 <!-- NFT Image -->
          <div class="relative" onclick="redirectToProductPage('${nft.tokenId}')">
              <div class="aspect-square w-full overflow-hidden">
                  <img src="${nft.image}" 
                       alt="${nft.name}" 
                       class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                <button class="absolute bottom-2 right-2 hidden md:flex items-center gap-1 px-3 py-1 rounded-xl bg-gray-800/40 hover:bg-gray-700/80 transition-colors text-gray-400" data-nft-action="imprint" data-token-id="${nft.tokenId}" data-owner-id="${nft.owner?._id || nft.creator?.id}">
                  <svg class="w-4 h-4 nft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 7C16.6569 7 18 8.34315 18 10C18 11.6569 16.6569 13 15 13C13.3431 13 12 11.6569 12 10C12 8.34315 13.3431 7 15 7Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 13L3 22M7 17H3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M19 10H21M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <span class="text-sm font-medium imprint-count">${nft.imprintCount || 0}</span>
                </button>
              </div>
          </div>
          
          <!-- NFT Details -->
          <div class="md:p-2 p-2">
              <div class="md:flex hidden items-center justify-between mb-4">
                  <div onclick="redirectToCreatorPage('${nft.creatorId}')" class="grid grid-cols-[auto,auto] items-center space-x-2 overflow-hidden">
                      <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500">
                          <img src="${nft.creatorAvatar}" alt="Creator" class="w-full h-full object-cover">
                      </div>
                      <div class=" overflow-hidden">
                          <h3 class="text-lg font-semibold text-white truncate">${nft.name}</h3>
                          <p class="text-sm text-gray-400">by ${nft.creatorName}</p>
                      </div>
                  </div>
              </div>
                
              <!-- Stats -->
              <div class="grid grid-cols-2 gap-2 pt-4 border-t border-gray-700/50">
                  <div class="bg-purple-500/10 px-1 py-1 rounded-xl block text-center">
                      <span class="text-purple-400 text-sm font-medium">${nft.price} ETH</span>
                  </div>
                <button class="md:hidden flex items-center gap-1 px-3 py-1 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 transition-colors text-gray-400" data-nft-action="imprint" data-token-id="${nft.tokenId}" data-owner-id="${nft.owner?._id || nft.creator?.id}">
                    <svg class="w-4 h-4 nft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 7C16.6569 7 18 8.34315 18 10C18 11.6569 16.6569 13 15 13C13.3431 13 12 11.6569 12 10C12 8.34315 13.3431 7 15 7Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 13L3 22M7 17H3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                      <path d="M19 10H21M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  <span class="text-sm font-medium imprint-count">${nft.imprintCount || 0}</span>
                </button>
                  <div class="text-center col-span-2 md:col-span-1">
                      <button class="bg-green-400/50 px-4 py-1 rounded-xl text-gray-200 w-full"
                              data-token-id="${nft.tokenId}"
                              data-nft-name="${nft.name}"
                              data-nft-image="${nft.image}"
                              data-nft-action="buy"
                              data-current-price="${nft.price}">
                          Buy
                      </button>
                  </div>
              </div>
          </div>
      </div>
  `).join('');
}
}

function redirectToCreatorPage(creatorId) {
  window.location.href = `./creatorpage.html?id=${creatorId}`;
}

function redirectToProductPage(nftId) {
  window.location.href = `./productdetails.html?id=${nftId}`;
}


// Initialize application
async function initializeApp() {
  loadingModal.show();
  
  try {
    const nftId = new URLSearchParams(window.location.search).get('id');
    if (nftId) {
      const nftData = await NFTDataHandler.getNFTDetails(nftId);
      UIUpdater.updateNFTDetails(nftData);

      // Creator button handler
      const creatorId = nftData.creator._id;
      const creatorButton = document.querySelector("#creator-button");
      if (creatorButton) {
        creatorButton.addEventListener("click", () => redirectToCreatorPage(creatorId));
      }
    }

    // Load trending NFTs
    const collections = await NFTDataHandler.getTrendingNfts();
    UIUpdater.updateTrendingNfts(collections);
  } catch (error) {
    console.error('Failed to initialize app:', error);
  } finally {
    loadingModal.hide();
  }
}

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


document.addEventListener('DOMContentLoaded', initializeApp);




function toggleSection(contentId) {
  const content = document.getElementById(contentId);
  const button = content.previousElementSibling;
  const icon = button.querySelector('svg');
  
  // Toggle the content
  if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      icon.classList.add('rotate-180');
  } else {
      content.classList.add('hidden');
      icon.classList.remove('rotate-180');
  }
}

function scrollToTop() {
  window.scrollTo({
      top: 0,
      behavior: 'smooth'
  });
}









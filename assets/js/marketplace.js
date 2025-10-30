const baseUrl = 'https://backend.tokenated.com/api';
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

function hideLoading() {
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


  const isUserLoggedIn = () => {
    return !!localStorage.getItem('accessToken');
};
const fetchWithAuth = async (endpoint, options = {}) => {
  showLoading();
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
  hideLoading();
  return response;

};


function calculateTimeRemaining(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const difference = end - now;
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
}

function redirectToNFTDetails(nftId) {
    window.location.href = `./productdetails.html?id=${nftId}`;
}

function redirectToAuctionDetails(auctionId) {
    window.location.href = `./auctiondetails.html?id=${auctionId}`;
}

function redirectToCreatorProfile(creatorId) {
    window.location.href = `./creatorpage.html?id=${creatorId}`;
}

const regNftMother = document.querySelector('#topNFTsContainer');
const trendNftMother = document.querySelector('#frid');

document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = 'https://backend.tokenated.com/api/nfts/dashboard-data';
 
  // Show loading before fetch begins
  showLoading();
  
  // Fetch the dashboard data
  fetch(apiUrl)
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          console.log('data', data);
          // Populate each section with the corresponding data
          // populateSection('#frid', data.trending, createTrendingCard);
          // populateSection('#topNFTsContainer', data.topNFTs, createNFTCard);
          // createNFTCard(data.topNFTs);
          data.trending.forEach(nft => {
            trendNftMother.appendChild(createTrendingCard(nft));
          });
          data.topNFTs.forEach(nft => {
            regNftMother.appendChild(createNFTCard(nft));
          });
          console.log('First NFT:', data.topNFTs[0]);
          populateSection('#ongoingAuctionsContainer', data.ongoingAuctions, createOngoingAuctionCard);
          populateSection('#topCreatorsContainer', data.topCreators, createTopCreatorCard);
          
          // Hide loading after all sections are populated
          hideLoading();
      })
      .catch(error => {
          console.error('Error fetching dashboard data:', error);
          hideLoading(); // Make sure to hide loading on error too
      });
});

// Modify the populateSection function to remove loading operations
function populateSection(containerSelector, items, cardGenerator) {
  const container = document.querySelector(containerSelector);
  console.log("items", items);
  container.innerHTML = items.map(item => cardGenerator(item)).join('');
}

const formatPrice = (price) => {
  if (!price) return '0';
  if (typeof price === 'number') return price.toString();
  if (typeof price === 'string') return price;
  if (price.$numberDecimal) return price.$numberDecimal;
  if (typeof price === 'object') return '0';
  return '0';
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

function redirectToCreatorProfile(creatorId) {
  window.location.href = `./creatorpage.html?id=${creatorId}`;
}

function createNFTCard(nft) {
  console.log('sddsds', nft);
  // const mother = document.querySelector('#topNFTsContainer');
  const imprintCount = nft.totalImprints || 0;
  const card = document.createElement('div'); // Create the card element
      // Create imprint button
      const imprintButtonHTML = `
      <button class="flex items-center gap-1 px-3 py-1 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 transition-colors text-gray-400" data-nft-action="imprint" data-token-id="${nft.tokenId}" data-owner-id="${nft._id || nft.creator?._id}">
          <svg class="w-4 h-4 nft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 7C16.6569 7 18 8.34315 18 10C18 11.6569 16.6569 13 15 13C13.3431 13 12 11.6569 12 10C12 8.34315 13.3431 7 15 7Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 13L3 22M7 17H3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M19 10H21M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="text-sm font-medium imprint-count">${imprintCount}</span>
      </button>
  `;
  card.classList.add('nft-card'); // Add class
  card.innerHTML = `
    <div id="card-ell" class="card-ell group relative bg-transparent" data-nft-id="${nft.tokenId}">
      <div class="relative overflow-hidden rounded-2xl bg-gray-800/50 border-2 border-purple-500/20 shadow-2xl transition-transform">
        <div class="relative aspect-square p-1 overflow-hidden ">
          <img loading="lazy"
            src="${nft.image}" 
            alt="${nft.name}" 
            class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500 rounded-2xl border-purple-500/20 border-2">
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
            <div class="flex space-x-3 w-full">
              <button class="md:block flex-1 hidden bg-green-600/50 backdrop-blur-lg text-white py-2 rounded-xl hover:bg-green-600/70 transition text-sm" 
                data-nft-action="buy"
                data-token-id="${nft.tokenId}"
                data-nft-name="${nft.name}"
                data-nft-image="${nft.image}"
                data-nft-action="buy"
                data-current-price="${nft.price}">
                Buy
              </button>
              <button 
                onclick="redirectToNFTDetails('${nft.tokenId}')" 
                class="flex-1 bg-purple-600/50 backdrop-blur-lg text-white py-2 rounded-xl hover:bg-purple-600/70 transition text-sm">
                View
              </button>
              ${imprintButtonHTML}
            </div>
          </div>
        </div>
        <div class="px-4 pt-2 bg-slate-900 rounded-xl m-1 border-purple-500/20 border-2">
          <div class="flex justify-between items-center">
            <h3 class="md:text-lg text-sm font-bold text-white truncate max-w-[100%]">${nft.name}</h3>
            <span class="text-purple-300 font-semibold text-xs md:text-sm">${nft.price} ETH</span>
          </div>
          <div class="flex justify-between border-t border-gray-600/50 ">
            <div class="cursor-pointer flex items-center space-x-2 overflow-hidden py-2 my-auto" onclick="redirectToCreatorProfile('${nft.owner}')">
              <div class="w-8 h-8 rounded-full border-2 border-white/20 flex-shrink-0 overflow-hidden m-auto">
                <img loading="lazy" 
                  src="${nft.creator?.profileImage || '/default-profileImage.png'}" 
                  class="w-full h-full object-cover m-auto" 
                  alt="${nft.creator?.username || 'Unknown'}">
              </div>
              <span class="text-gray-300 text-xs truncate">${nft.creator?.username || 'Unknown'}</span>
            </div>
              <div class="flex items-center gap-1 text-gray-400">
                <svg class="w-4 h-4 nft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 7C16.6569 7 18 8.34315 18 10C18 11.6569 16.6569 13 15 13C13.3431 13 12 11.6569 12 10C12 8.34315 13.3431 7 15 7Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 13L3 22M7 17H3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M19 10H21M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span class="text-sm imprint-count">${imprintCount}</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  `;
  // const card = document.getElementsByClassName("card-ell");

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

    // nftArray.forEach((nft) => {
    // mother.appendChild(card);
    // });

return card;
}

function createTrendingCard(nft) {
  console.log('sddsdfdfsdfds', nft);
  const imprintCount = nft.totalImprints || 0;
  const card = document.createElement('div'); // Create the card element
  // Create imprint button
  const imprintButtonHTML = `
    <button class="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 transition-colors text-gray-400" data-nft-action="imprint" data-token-id="${nft.tokenId}" data-owner-id="${nft._id || nft.creator?.userId}">
      <svg class="w-4 h-4 nft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 7C16.6569 7 18 8.34315 18 10C18 11.6569 16.6569 13 15 13C13.3431 13 12 11.6569 12 10C12 8.34315 13.3431 7 15 7Z" stroke="currentColor" stroke-width="2"/>
          <path d="M12 13L3 22M7 17H3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M19 10H21M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span class="text-sm font-medium imprint-count">${imprintCount}</span>
    </button>
  `;
  card.classList.add('nft-card'); // Add class
  card.innerHTML = `
    <div class="profile-image-wrapper">
      <div class="group relative" data-nft-id="${nft._id}">
        <div class="relative overflow-hidden bg-slate-700 rounded-2xl backdrop-blur-xl border-2 border-purple-500/20 shadow-2xl transition-transform ring-2">
          <div class="relative aspect-square p-1 overflow-hidden">
            <img loading="lazy" 
              src="${nft.image}" 
              alt="${nft.name}" 
              class=" w-full h-full object-cover transition-transform duration-500 rounded-2xl border-purple-500/20 border-2">
            <div class="absolute top-4 left-4 bg-purple-600 backdrop-blur-lg text-white px-3 py-1 rounded-full text-xs">
              Trending
            </div>
            <div class="flex justify-between absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 items-end p-4">
              <div class="flex space-x-3 w-full">
                <button 
                  onclick="redirectToNFTDetails('${nft.tokenId}')" 
                  class="flex-1 bg-purple-600/50 backdrop-blur-lg text-white py-2 rounded-xl hover:bg-purple-600/70 transition text-sm">
                    View
                </button>
                ${imprintButtonHTML}
              </div>
            </div>
          </div>
          <div class="px-4 p-1 grid grid-cols-[auto_auto] bg-slate-900 rounded-2xl m-1 border-purple-500/20 border-2">
            <div class="flex-col justify-between items-center">
              <h3 class="md:text-lg text-sm font-bold text-white truncate max-w-[100%]">${nft.name}</h3>
              <h6 class="text-white font-semibold md:text-sm text-xs">${nft.price} ETH</h6>
            </div>
            <div class="flex mx-0 justify-self-end self-center">
              <svg class="w-4 h-4 nft-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 7C16.6569 7 18 8.34315 18 10C18 11.6569 16.6569 13 15 13C13.3431 13 12 11.6569 12 10C12 8.34315 13.3431 7 15 7Z" stroke="currentColor" stroke-width="2"/>
                <path d="M12 13L3 22M7 17H3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M19 10H21M15 14V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span class="text-sm imprint-count">${imprintCount}</span>
            </div>
            <div
              class="absolute top-1/2 -left-full transform
              -translate-y-1/2 -translate-x-2 w-max 
              px-2 py-1 text-sm text-white bg-gray-700
              rounded shadow-lg opacity-0 
              group-hover:opacity-100 z-50">
                Tooltip on Right
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
  
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
            imprintButton.classList.remove('text-white');
        } else {
            imprintButton.classList.remove('text-purple-400');
            imprintButton.classList.add('text-white');
        }
    }

    icons.forEach(icon => {
        const parentElement = icon.closest('button, div');
        if (hasImprinted) {
            parentElement.classList.add('text-purple-400');
            parentElement.classList.remove('text-white');
        } else {
            parentElement.classList.remove('text-purple-400');
            parentElement.classList.add('text-white');
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

    // nftArray.forEach((nft) => {
    // mother.appendChild(card);
    // });

return card;
}

function createOngoingAuctionCard(auction) {
  console.log('auction', auction);
    return `
        <div class="group relative bg-transparent" data-auction-id="${auction._id}">
            <div class="glass-card relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl ring-2 hover:ring-blue-500">
                <div class="relative">
                    <img loading="lazy" src="${auction.nft.image}" alt="${auction.nft.name}" class="w-full h-64 object-cover transition-transform group-hover:scale-110 duration-300">
                    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <div class="flex space-x-3 w-full">
                            <button class="flex-1 bg-white/20 backdrop-blur-lg text-white py-3 rounded-xl hover:bg-white/30 transition">
                                Bid
                            </button>
                            <button onclick="redirectToAuctionDetails('${auction._id}')" 
                                    class="flex-1 bg-green-600/50 backdrop-blur-lg text-white py-3 rounded-xl hover:bg-green-600/70 transition">
                                View
                            </button>
                        </div>
                    </div>
                </div>
                <div class="p-4 space-y-2">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-bold text-white truncate">${auction.nft.name}</h3>
                        <span class="text-purple-300 font-semibold">${auction.currentBid} ETH</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <img loading="lazy" src="${auction.seller.profileImage}" 
                             class="w-8 h-8 rounded-full border-2 border-white/20" 
                             alt="${auction.seller.username}">
                        <span class="text-gray-300 text-sm truncate">By ${auction.seller.username}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createTopCreatorCard(creator) {
    return `
       

        <div class="grid md:grid-cols-12 grid-cols-12 md:gap-4 gap-5 md:p-4 p-2 border-b border-gray-800 hover:bg-gray-800/50 transition-all">
          <div class="col-span-1 flex items-center">
            <span class="text-2xl">🥇</span>
          </div>
          <div class="md:col-span-3 col-span-6 flex items-center justify-around space-x-3">
            <img src="${creator.profileImage}" 
                class="md:w-10 md:h-10 w-7 h-7 rounded-full border-2 border-purple-500">
            <div>
              <p class="font-medium text-sm md:text-md text-white">${creator.username}</p>
              <p class="md:text-sm text-xs text-gray-400">@${creator.username}</p>
            </div>
            <span class="text-blue-400">✔</span>
          </div>
          <div class="md:col-span-2 col-span-2 flex items-center text-right justify-end">
            <span class="font-mono">${creator.nftCount}</span>
          </div>
          <div class="md:col-span-2 col-span-3 md:flex grid grid-cols-3 items-center justify-end text-right">
            <img src="assets/images/ethereum-icon.png" class="w-5 h-5 mr-1 col-start-2">
            <span class="font-mono md:text-sm text-xs">${creator.totalVolume?.$numberDecimal ? creator.totalVolume["$numberDecimal"] : 0}</span>
          </div>
          <div class="col-span-2 items-center md:flex hidden justify-end">
            <span class="font-mono">420</span>
          </div>
          <div class="col-span-2 items-center justify-end md:flex hidden">
            <button class="px-4 py-1.5 rounded-lg border border-purple-600 text-purple-400 hover:bg-purple-900/30 transition">
              Follow
            </button>
          </div>
        </div>

    `;
}
// Redirect functions for navigation
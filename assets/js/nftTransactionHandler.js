const baseUrl = 'https://backend.tokenated.com/api';

let accessToken = localStorage.getItem('accessToken');

function checkAuthState() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    return !!(accessToken && refreshToken);
  }

const fetchWithAuth = async (url, options = {}) => {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    return fetch(`${baseUrl}${url}`, {
        ...options,
        headers
    });
};




function showLoadingModal(message = 'Processing transaction...') {
    const modal = document.createElement('div');
    modal.id = 'loadingModal';
    modal.className = 'fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center';
    modal.innerHTML = `
        <div class="relative w-full max-w-md mx-4">
            <div class="absolute inset-0 bg-gradient-to-br from-gray-800/20 to-gray-700/20 rounded-3xl blur-2xl opacity-70"></div>
            <div class="relative bg-gray-800 border border-gray-700/30 rounded-3xl shadow-2xl overflow-hidden">
                <div class="flex flex-col items-center p-8 space-y-6">
                    <div class="relative w-24 h-24">
                        <div class="absolute inset-0 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-full animate-pulse"></div>
                        <div class="absolute inset-4 bg-gray-800/50 backdrop-blur-md rounded-full flex items-center justify-center">
                            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        </div>
                        <div class="absolute -inset-2 border-2 border-gray-700/30 rounded-full animate-spin"></div>
                    </div>
                    <p class="text-white text-lg text-center font-medium tracking-wide">
                        ${message}
                    </p>
                    <div class="w-full h-1 bg-gray-700/20 rounded-full overflow-hidden">
                        <div class="h-full bg-purple-500 animate-pulse-wide"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Custom animation for the progress bar
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-wide {
            0%, 100% { transform: scaleX(0.3); }
            50% { transform: scaleX(1); }
        }
        .animate-pulse-wide {
            animation: pulse-wide 2s infinite;
            transform-origin: left;
        }
    `;
    modal.appendChild(style);

    document.body.appendChild(modal);
    return modal;
}

function hideLoadingModal() {
    const modal = document.getElementById('loadingModal');
    modal?.remove();
}





window.closeOrderSummaryModal = function() {
    const modal = document.getElementById("orderSummaryModal");
    if (modal) {
        modal.remove();
    }
};

window.confirmPurchase = async function(tokenId) {
    try {
        closeOrderSummaryModal();
        await buyNFT(tokenId);
    } catch (error) {
        console.error('Purchase confirmation error:', error);
        showFeedbackModal('error', 'Purchase Failed', error.message);
    }
};


function initializeEventListeners() {

    document.addEventListener('click', async (event) => {
        const actionButton = event.target.closest('[data-nft-action]');
        if (actionButton) {
            
            if (!checkAuthState()) {
                createLoginModal();
                return;
              }

            event.preventDefault();
            const action = actionButton.dataset.nftAction;
            const tokenId = findTokenId(actionButton);
            const currentPrice = actionButton.dataset.currentPrice;
            const nftData = {
                tokenId,
                name: actionButton.dataset.nftName,
                image: actionButton.dataset.nftImage,
                price: parseFloat(currentPrice)
            };

            switch (action) {
                case 'buy':
                    openOrderSummaryModal(nftData);
                    break;
                case 'list':
                    showListingModal(tokenId);
                    break;
                case 'bid':
                    showBidModal(nftData);
                    break;
                case 'auction':
                    showAuctionModal(tokenId);
                    break;
                case 'unlist':
                    showUnlistModal(tokenId);
                   
                    break;
            }
        }
    });
}



function showBidModal(nft) {
    console.log("bidData:", nft);
    const modalHTML = `
        <div id="bidModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full text-white">
                <h2 class="text-xl font-semibold mb-4">Place a Bid</h2>
                <div class="flex items-center space-x-4 mb-4">
                    <img src="${nft.image}" alt="${nft.name}" class="w-20 h-20 rounded-lg" />
                    <div>
                        <h3 class="text-lg font-semibold">${nft.name}</h3>
                        <p class="text-gray-400 text-sm">Token ID: #${nft.tokenId}</p>
                    </div>
                </div>
                <form id="bidForm" class="space-y-4">
                    <input type="hidden" id="bidNftId" value="${nft.tokenId}" />
                    <div>
                        <label class="text-gray-400 text-sm">Current Bid</label>
                        <p class="text-lg font-semibold">${nft.price} ETH</p>
                    </div>
                    <div>
                        <label for="bidAmount" class="text-gray-400 text-sm">Your Bid (ETH)</label>
                        <input type="number" id="bidAmount" min="${nft.price}" step="0.001" value="${nft.price}"
                            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" required />
                    </div>
                    <button type="submit" 
                        class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold 
                        hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                        Place Bid
                    </button>
                    <button type="button" onclick="hideModal('bidModal')" 
                        class="w-full py-3 bg-gray-800 rounded-lg font-semibold text-white 
                        hover:bg-gray-700 transition-all duration-300">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('bidForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const tokenId = document.getElementById('bidNftId').value;
        const amount = document.getElementById('bidAmount').value;
        console.log('Placing bid:', tokenId, amount);
        await placeBid(tokenId, amount);
    });
}

function openOrderSummaryModal(nft) {
    console.log("summaryData:", nft);
    const gasFee = 0.002;
    const totalPrice = nft.price + gasFee;

    const modalHTML = `
        <div id="orderSummaryModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full text-white">
                <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
                <div class="flex items-center space-x-4 mb-4">
                    <img src="${nft.image}" alt="${nft.name}" class="w-20 h-20 rounded-lg" />
                    <div>
                        <h3 class="text-lg font-semibold">${nft.name}</h3>
                        <p class="text-gray-400 text-sm">Token ID: #${nft.tokenId}</p>
                    </div>
                </div>
                <div class="mb-4">
                    <p class="text-gray-400 text-sm">Price:</p>
                    <p class="text-lg font-semibold">${nft.price} ETH</p>
                </div>
                <div class="mb-4">
                    <p class="text-gray-400 text-sm">Gas Fee:</p>
                    <p class="text-lg font-semibold">${gasFee} ETH</p>
                </div>
                <div class="mb-4">
                    <p class="text-gray-400 text-sm">Total:</p>
                    <p class="text-lg font-semibold">${totalPrice} ETH</p>
                </div>
                <button id="confirmPurchaseBtn" data-token-id="${nft.tokenId}"
                    class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold 
                    hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                    Confirm & Pay
                </button>
                <button id="cancelPurchaseBtn"
                    class="w-full py-3 mt-2 bg-gray-800 rounded-lg font-semibold text-white 
                    hover:bg-gray-700 transition-all duration-300">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add event listeners using addEventListener instead of onclick
    document.getElementById('confirmPurchaseBtn').addEventListener('click', async () => {
        const tokenId = document.getElementById('confirmPurchaseBtn').dataset.tokenId;
        await confirmPurchase(tokenId);
    });

    document.getElementById('cancelPurchaseBtn').addEventListener('click', () => {
        closeOrderSummaryModal();
    });
}



function closeOrderSummaryModal() {
    const modal = document.getElementById("orderSummaryModal");
    if (modal) {
        modal.remove();
    }
}

async function confirmPurchase(tokenId) {
    try {
        closeOrderSummaryModal();
        await buyNFT(tokenId);
    } catch (error) {
        console.error('Purchase confirmation error:', error);
        showFeedbackModal('error', 'Purchase Failed', error.message);
    }
}


async function buyNFT(tokenId) {
    const loadingModal = showLoadingModal('Preparing NFT purchase...');
    try {
        const response = await fetchWithAuth('/nfts/buyNFT', {
            method: 'POST',
            body: JSON.stringify({ tokenId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to prepare purchase transaction');
        }

        const { txObject } = await response.json();
        const walletType = localStorage.getItem('walletType');

        // Preprocess the transaction (hex conversion)
        const preparedTx = {
            from: txObject.from,
            to: txObject.to,
            data: txObject.data,
            value: '0x71afd498d0000' ,
            // || '0x' + BigInt(txObject.value).toString(16)
            gas: '0x' + BigInt(txObject.gas).toString(16),
            gasPrice: '0x' + BigInt(txObject.gasPrice).toString(16),
            network: 'bsc'
        };

        loadingModal.querySelector('p').textContent = `Confirming purchase in ${walletType === 'marcedivault' ? 'MarcediVault' : 'MetaMask'}...`;

        let transactionHash;

        if (walletType === 'marcedivault') {
            transactionHash = await MarcediVault.signTransaction(preparedTx);
        } else {
            transactionHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [preparedTx]
            });
        }

        loadingModal.querySelector('p').textContent = 'Finalizing purchase...';

        const confirmResponse = await fetchWithAuth('/nfts/confirmPurchase', {
            method: 'POST',
            body: JSON.stringify({
                transactionHash,
                tokenId
            })
        });

        if (!confirmResponse.ok) {
            const errorData = await confirmResponse.json();
            throw new Error(errorData.message || 'Failed to confirm purchase');
        }

        const purchasedNFT = await confirmResponse.json();
        hideLoadingModal();
        showFeedbackModal('success', 'Purchase Complete', 'NFT successfully purchased');
        return purchasedNFT;
    } catch (error) {
        console.error('Purchase error:', error);
        hideLoadingModal();
        showFeedbackModal('error', 'Purchase Failed', error.message);
        throw error;
    }
}



async function placeBid(tokenId, bidAmount) {
    const loadingModal = showLoadingModal('Preparing bid...');

    try {
        const response = await fetchWithAuth('/auctions/bid', {
            method: 'POST',
            body: JSON.stringify({ tokenId, bidAmount })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to prepare bid');
        }

        const { txObject } = await response.json();
        const walletType = localStorage.getItem('walletType');

        console.log('Original txObject:', txObject);
        loadingModal.querySelector('p').textContent = `Confirming bid in ${walletType === 'marcedivault' ? 'MarcediVault' : 'MetaMask'}...`;

        // 🔁 Preprocess txObject for both wallets
        const preparedTx = {
            from: txObject.from,
            to: txObject.to,
            data: txObject.data,
            value: '0x' + BigInt(txObject.value).toString(16),
            gas: '0x' + BigInt(txObject.gas).toString(16),
            gasPrice: '0x' + BigInt(txObject.gasPrice).toString(16)
        };

        let transactionHash;

        if (walletType === 'marcedivault') {
            transactionHash = await MarcediVault.signTransaction(preparedTx);
        } else {
            transactionHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [preparedTx]
            });
        }

        loadingModal.querySelector('p').textContent = 'Finalizing bid...';

        const confirmResponse = await fetchWithAuth('/auctions/bid/confirm', {
            method: 'POST',
            body: JSON.stringify({
                transactionHash,
                tokenId,
                bidAmount
            })
        });

        if (!confirmResponse.ok) {
            const errorData = await confirmResponse.json();
            throw new Error(errorData.message || 'Failed to confirm bid');
        }

        const bidResult = await confirmResponse.json();

        hideLoadingModal();
        hideModal('bidModal');
        showFeedbackModal('success', 'Bid Placed', 'Your bid was submitted successfully');
        return bidResult;

    } catch (error) {
        console.error('Bid error:', error);
        hideLoadingModal();
        showFeedbackModal('error', 'Bid Failed', error.message);
        throw error;
    }
}


function showAuctionModal(tokenId) {
    hideModal('auctionModal');

    const modalHTML = `
        <div id="auctionModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full text-white">
                <h2 class="text-xl font-semibold mb-4">Create NFT Auction</h2>
                <form id="auctionForm" class="space-y-4" onsubmit="return false;">
                    <input type="hidden" id="auctionNftId" value="${tokenId}" />
                    <div>
                        <label for="startPrice" class="text-gray-400 text-sm">Starting Price (ETH)</label>
                        <input type="number" id="startPrice" min="0.001" step="0.001"
                            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" 
                            required />
                    </div>
                    <div>
                        <label for="auctionDuration" class="text-gray-400 text-sm">Auction Duration (Days)</label>
                        <select id="auctionDuration"
                            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" 
                            required>
                            <option value="1">1 Day</option>
                            <option value="3">3 Days</option>
                            <option value="7">7 Days</option>
                            <option value="14">14 Days</option>
                        </select>
                    </div>
                    <button type="button" id="submitAuctionBtn"
                        class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold 
                        hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                        Create Auction
                    </button>
                    <button type="button" onclick="document.getElementById('auctionModal').remove()" 
                        class="w-full py-3 bg-gray-800 rounded-lg font-semibold text-white 
                        hover:bg-gray-700 transition-all duration-300">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('submitAuctionBtn').addEventListener('click', async (e) => {
        const button = e.target;
        const form = button.closest('#auctionForm');
        
        try {
            const tokenId = form.querySelector('#auctionNftId').value;
            const startPrice = form.querySelector('#startPrice').value;
            const duration = form.querySelector('#auctionDuration').value;
            
            if (!startPrice) {
                throw new Error('Please enter a valid starting price');
            }
            
            await createAuction(tokenId, startPrice, parseInt(duration, 10));
            hideModal('auctionModal');
            
        } catch (error) {
            console.error('Auction creation error:', error);
            showFeedbackModal('error', 'Failed', error.message);
        }
    });
}



function showUnlistModal(tokenId) {
    hideModal('unlistModal');

    const modalHTML = `
        <div id="unlistModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full text-white">
                <h2 class="text-xl font-semibold mb-4">Remove NFT Listing</h2>
                <form id="unlistForm" class="space-y-4" onsubmit="return false;">
                    <input type="hidden" id="unlistNftId" value="${tokenId}" />
                    <p class="text-gray-400 text-sm">Are you sure you want to remove this NFT from the marketplace?</p>
                    <button type="button" id="submitUnlistBtn"
                        class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold 
                        hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                        Remove Listing
                    </button>
                    <button type="button" onclick="document.getElementById('unlistModal').remove()" 
                        class="w-full py-3 bg-gray-800 rounded-lg font-semibold text-white 
                        hover:bg-gray-700 transition-all duration-300">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('submitUnlistBtn').addEventListener('click', async (e) => {
        const button = e.target;
        const form = button.closest('#unlistForm');
        
        try {
            const tokenId = form.querySelector('#unlistNftId').value;
            
            await unlistNFT(tokenId); // You'll need to implement this function
            hideModal('unlistModal');
            
        } catch (error) {
            console.error('Unlisting error:', error);
            showFeedbackModal('error', 'Failed', error.message);
        }
    });
}

function findTokenId(element) {
    if (element.dataset.tokenId) return element.dataset.tokenId;
    
    const cardElement = element.closest('[data-token-id]');
    if (cardElement) return cardElement.dataset.tokenId;

    console.error('No token ID found for element', element);
    return null;
}

async function handleBuyButtonClick(tokenId) {
    if (!tokenId) {
        showFeedbackModal('error', 'Error', 'Unable to identify NFT');
        return;
    }

    if (!isUserLoggedIn()) {
        showFeedbackModal('error', 'Login Required', 'Please log in to purchase NFTs', {
        });
        return;
    }

    try {
        await buyNFT(tokenId);
    } catch (error) {
        console.error('Buy NFT error:', error);
    }
}

function isUserLoggedIn() {
    return !!accessToken;
}



async function listNFT(tokenId, price) {
    const loadingModal = showLoadingModal('Preparing NFT listing...');
    
    try {
        if (!tokenId || !price) {
            throw new Error('Token ID and price are required');
        }

        const response = await fetchWithAuth('/transactions/list', {
            method: 'POST',
            body: JSON.stringify({
                tokenId: parseInt(tokenId, 10),
                price: price
            })
        });

        const { txObject } = await response.json();

        if (!txObject || !txObject.data) {
            throw new Error('Invalid transaction object received from server');
        }

        const walletType = localStorage.getItem('walletType');

        loadingModal.querySelector('p').textContent = `Confirming listing in ${walletType === 'marcedivault' ? 'MarcediVault' : 'MetaMask'}...`;

        const txParams = {
            from: txObject.from,
            to: txObject.to,
            data: txObject.data,
            value: '0x' + BigInt(txObject.value).toString(16),
            gas: '0x' + BigInt(txObject.gas).toString(16),
            gasPrice: '0x' + BigInt(txObject.gasPrice).toString(16)
        };

        console.log('txParams:', txParams);

        let transactionHash;

        if (walletType === 'marcedivault') {
            transactionHash = await MarcediVault.signTransaction(txParams);
        } else {
            transactionHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [txParams]
            });
        }

        loadingModal.querySelector('p').textContent = 'Finalizing listing...';

        const confirmResponse = await fetchWithAuth('/transactions/confirmListNFT', {
            method: 'PATCH',
            body: JSON.stringify({
                transactionHash,
                tokenId: tokenId,
                price: price
            })
        });

        const updatedNFT = await confirmResponse.json();

        hideLoadingModal();
        hideModal('listingModal');
        showFeedbackModal('success', 'NFT Listed', 'Your NFT has been successfully listed for sale');
        return updatedNFT;

    } catch (error) {
        console.error('Listing error:', error);
        hideLoadingModal();
        let errorMessage = 'Failed to list NFT';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        showFeedbackModal('error', 'Listing Failed', errorMessage);
        throw error;
    }
}


async function createAuction(tokenId, startPrice, duration) {
    const loadingModal = showLoadingModal('Preparing auction...');
    try {
        if (!tokenId || !startPrice || !duration) {
            throw new Error('Missing required auction parameters');
        }

        const response = await fetchWithAuth('/auctions/create', {
            method: 'POST',
            body: JSON.stringify({ tokenId, startPrice, duration })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const { txObject } = await response.json();

        const walletType = localStorage.getItem('walletType');
        loadingModal.querySelector('p').textContent = `Confirming auction in ${walletType === 'marcedivault' ? 'MarcediVault' : 'MetaMask'}...`;

        // 🔁 Format txObject
        const preparedTx = {
            from: txObject.from,
            to: txObject.to,
            data: txObject.data,
            gas: txObject.gas ? '0x' + BigInt(txObject.gas).toString(16) : '0x30d40',
            gasPrice: txObject.gasPrice ? '0x' + BigInt(txObject.gasPrice).toString(16) : '0x20000000000',
            value: txObject.value ? '0x' + BigInt(txObject.value).toString(16) : '0x0'
        };

        let transactionHash;

        if (walletType === 'marcedivault') {
            transactionHash = await MarcediVault.signTransaction(preparedTx);
        } else {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            preparedTx.from = accounts[0]; // just in case it differs

            transactionHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [preparedTx]
            });
        }

        loadingModal.querySelector('p').textContent = 'Finalizing auction...';

        const confirmResponse = await fetchWithAuth('/auctions/create/confirm', {
            method: 'POST',
            body: JSON.stringify({
                transactionHash,
                tokenId,
                startPrice,
                duration
            })
        });

        if (!confirmResponse.ok) {
            const errorData = await confirmResponse.json();
            throw new Error(errorData.message || `Confirmation failed! status: ${confirmResponse.status}`);
        }

        const auctionResult = await confirmResponse.json();

        hideLoadingModal();
        hideModal('auctionModal');
        showFeedbackModal('success', 'Auction Created', 'Your NFT auction has been created successfully');
        return auctionResult;

    } catch (error) {
        console.error('Auction creation error:', error);
        hideLoadingModal();
        const errorMessage = error?.response?.data?.message || error.message;
        showFeedbackModal('error', 'Auction Creation Failed', errorMessage);
        throw error;
    }
}


async function unlistNFT(tokenId) {
    const loadingModal = showLoadingModal('Preparing to unlist NFT...');
    try {
        if (!tokenId) {
            throw new Error('Token ID is required');
        }

        const response = await fetchWithAuth('/transactions/unlist', {
            method: 'POST',
            body: JSON.stringify({ tokenId: parseInt(tokenId, 10) })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to prepare unlist transaction');
        }

        const { txObject } = await response.json();
        const walletType = localStorage.getItem('walletType');

        loadingModal.querySelector('p').textContent = `Confirming unlisting in ${walletType === 'marcedivault' ? 'MarcediVault' : 'MetaMask'}...`;

        // Preprocess txObject for both wallets
        const txParams = {
            from: txObject.from,
            to: txObject.to,
            data: txObject.data,
            gas: txObject.gas ? '0x' + BigInt(txObject.gas).toString(16) : '0x30d40',
            gasPrice: txObject.gasPrice ? '0x' + BigInt(txObject.gasPrice).toString(16) : '0x20000000000',
            value: txObject.value ? '0x' + BigInt(txObject.value).toString(16) : '0x0'
        };

        let transactionHash;

        if (walletType === 'marcedivault') {
            transactionHash = await MarcediVault.signTransaction(txParams);
        } else {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            txParams.from = accounts[0]; // update `from` to actual selected address
            transactionHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [txParams]
            });
        }

        loadingModal.querySelector('p').textContent = 'Finalizing unlisting...';

        const confirmResponse = await fetchWithAuth('/transactions/confirmUnList', {
            method: 'PATCH',
            body: JSON.stringify({
                transactionHash,
                tokenId: parseInt(tokenId, 10)
            })
        });

        if (!confirmResponse.ok) {
            const errorData = await confirmResponse.json();
            throw new Error(errorData.message || 'Failed to confirm unlisting');
        }

        const result = await confirmResponse.json();

        hideLoadingModal();
        hideModal('unlistModal');
        showFeedbackModal('success', 'NFT Unlisted', 'Your NFT has been successfully unlisted from the marketplace');
        
        await loadTabContent('listed');
        
        return result;
    } catch (error) {
        console.error('Unlist error:', error);
        hideLoadingModal();
        showFeedbackModal('error', 'Unlist Failed', error.message || 'Failed to unlist NFT');
        throw error;
    }
}


function showFeedbackModal(type, title, message, action = null) {
    const modal = document.getElementById('feedback-modal');
    const iconContainer = document.getElementById('feedback-icon');
    const titleElement = document.getElementById('feedback-title');
    const messageElement = document.getElementById('feedback-message');
    const actionButton = document.getElementById('feedback-action');

    const iconHTML = type === 'success'
        ? `<svg class="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
           </svg>`
        : `<svg class="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
           </svg>`;

    iconContainer.innerHTML = iconHTML;
    titleElement.textContent = title;
    messageElement.textContent = message;

    if (action) {
        actionButton.textContent = action.text;
        actionButton.onclick = action.handler;
    } else {
        actionButton.textContent = 'OK';
        actionButton.onclick = () => hideFeedbackModal();
    }

    modal.classList.remove('hidden');
}

function hideFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    modal.classList.add('hidden');
}

    document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
   
    });
    
    function createLoginModal() {
        const modal = document.createElement('div');
        modal.id = 'loginModal';
        modal.className = 'fixed inset-0 z-[100] bg-black/80 flex items-center justify-center';
        modal.innerHTML = `
          <div class="bg-gray-800 rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
            <div class="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <h2 class="text-2xl font-bold text-white mb-4">Login Required</h2>
            </div>
            <div class="p-6">
              <p class="text-gray-300 mb-6">You must log in to continue.</p>
              <div class="flex space-x-4">
                <button onclick="document.getElementById('loginModal').remove()" class="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors connect-wallet-btn">
                  Log In
                </button>
                <button onclick="document.getElementById('loginModal').remove()" class="flex-1 text-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        
        // After appending the modal, call initializeEventListeners to bind the event listeners
        if (typeof initializeEventListeners === 'function') {
            initializeEventListeners();
        } else {
            console.error('initializeEventListeners is not defined');
        }
    }
    

  function showListingModal(tokenId) {
    
    hideModal('listingModal');

    const modalHTML = `
        <div id="listingModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div class="bg-gray-900 p-6 rounded-xl shadow-lg max-w-md w-full text-white">
                <h2 class="text-xl font-semibold mb-4">List NFT for Sale</h2>
                <form id="listingForm" class="space-y-4" onsubmit="return false;">
                    <input type="hidden" id="listNftId" value="${tokenId}" />
                    <div>
                        <label for="listingPrice" class="text-gray-400 text-sm">Price (ETH)</label>
                        <input type="number" id="listingPrice" min="0.001" step="0.001"
                            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white" 
                            required />
                    </div>
                    <button type="button" id="submitListingBtn"
                        class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold 
                        hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                        List NFT
                    </button>
                    <button type="button" onclick="document.getElementById('listingModal').remove()" 
                        class="w-full py-3 bg-gray-800 rounded-lg font-semibold text-white 
                        hover:bg-gray-700 transition-all duration-300">
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('submitListingBtn').addEventListener('click', async (e) => {
        const button = e.target;
        const form = button.closest('#listingForm'); 
        
        try {
            const tokenId = form.querySelector('#listNftId').value;
            const price = form.querySelector('#listingPrice').value; 
            
            if (!price) {
                throw new Error('Please enter a valid price');
            }
            
            await listNFT(tokenId, price);
            hideModal('listingModal');
            
        } catch (error) {
            console.error('Listing error:', error);
            showFeedbackModal('error', 'Failed', error.message);
        }
    });
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal?.remove();
}



//loadTabContent('listed');

async function loadTabContent(tab = 'created') {
    showLoading();
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) throw new Error('No auth token found. Please log in.');

        const response = await fetch(
            `https://backend.tokenated.com/api/users/me/${tab}?sort=recent&page=1&limit=12`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (!response.ok) throw new Error(`Error fetching content: ${response.statusText}`);

        const { items, hasMore } = await response.json();
        
        if (!items?.length) {
            renderEmptyState(tab);
            return;
        }

        renderNFTGrid(items, tab);
        updateLoadMoreButton(hasMore);
    } catch (error) {
        console.error('Tab content error:', error);
        showFeedbackModal('error', 'Error', error.message);
    } finally {
        hideLoading();
    }
}


// Loading State for loading tab content
function showLoading() {
    document.body.insertAdjacentHTML('beforeend', `
        <div id="loadingModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div class="bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                <div class="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-white text-sm">Loading...</p>
            </div>
        </div>
    `);
}

function hideLoading() {
    document.getElementById('loadingModal')?.remove();
}





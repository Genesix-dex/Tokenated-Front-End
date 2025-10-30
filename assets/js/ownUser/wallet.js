class Modal {
    constructor(content, id) {
        this.id = id;
        this.modalElement = document.createElement('div');
        this.modalElement.id = id;
        this.modalElement.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 hidden w-full p-2';
        this.modalElement.innerHTML = `
            <div class="w-full max-w-md relative glassmorphism-card rounded-2xl p-8 left-1/2 transform -translate-x-1/2 transition-all duration-300 max-h-[80vh] flex flex-col">
                ${content}
            </div>
        `;

        document.body.appendChild(this.modalElement);

        // Add close functionality
        const closeButton = this.modalElement.querySelector('.close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hide());
        }

        // Close modal when clicking outside
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.hide();
            }
        });
    }

    show() {
        this.modalElement.classList.remove('hidden');
    }

    hide() {
        this.modalElement.classList.add('hidden');
    }
}

const loadingModalTemplate = `
    <div class="flex flex-col items-center justify-center py-10">
        <div class="inline-block p-4 rounded-full custom-gradient mb-6 animate-float glow">
            <i class="fas fa-spinner text-4xl text-white animate-spin"></i>
        </div>
        <p class="text-white text-xl">Processing your request</p>
        <div class="flex space-x-1 mt-2">
            <span class="animate-bounce delay-100 text-blue-300">.</span>
            <span class="animate-bounce delay-200 text-indigo-300">.</span>
            <span class="animate-bounce delay-300 text-purple-300">.</span>
        </div>
    </div>
`;

class WalletManager {
    constructor() {
        this.walletModal = new Modal(this.getWalletModalTemplate(), 'walletModal');
        this.loadingModal = new Modal(loadingModalTemplate, 'loadingModal');
        this.connectedAddress = null;
        this.setupEventListeners();
    }

    getWalletModalTemplate() {
        return `
        <div class="relative h-full flex flex-col">
            <div class="flex justify-between items-center border-b border-indigo-300/10 pb-4 mb-6">
                <h2 class="text-2xl font-bold text-white">My Wallet</h2>
                <button class="text-indigo-200/70 hover:text-white close-modal text-2xl">&times;</button>
            </div>
    
            <div class="space-y-6 flex-grow flex flex-col">
                <!-- Earnings Section -->
                <div class="glassmorphism-card rounded-xl p-5 text-center">
                    <div class="text-sm text-indigo-300 mb-2 uppercase tracking-wider">Available Earnings</div>
                    <div class="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text" id="earningsBalance">0.00 ETH</div>
                </div>
    
                <!-- Withdrawal Section -->
                <div id="withdrawalSection">
                    <button id="withdrawEarningsBtn" 
                            class="w-full glassmorphism-button text-white py-4 rounded-xl font-semibold uppercase tracking-wider hover:scale-105 transition-transform 
                                   bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800">
                        Withdraw Earnings
                    </button>
                </div>
    
                <!-- Transaction History -->
                <div class="flex flex-col flex-1 min-h-0">
                    <h3 class="text-white text-lg font-semibold mb-4 border-b border-indigo-300/10 pb-2">Withdrawal History</h3>
                    <div id="withdrawalHistory" class="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2 max-h-60">
                        <!-- Withdrawals will be inserted here -->
                    </div>
                </div>
            </div>
        </div>
        `;
    }


    setupEventListeners() {
        // Wallet button click
        const walletButton = document.getElementById('myWalletBtn');
        if (walletButton) {
            walletButton.addEventListener('click', () => {
                // Show loading modal immediately
                this.loadingModal.show();
                
                // Open wallet after a short delay
                setTimeout(() => {
                    this.openWallet();
                }, 500);
            });
        }

        // Withdraw earnings button
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'withdrawEarningsBtn') {
                this.initiateEarningsWithdrawal();
            }
        });
    }

    async openWallet() {
        try {
            await this.connectWallet();
            await this.fetchAvailableEarnings();
            await this.updateWithdrawalHistory();

            // Hide loading modal and show wallet modal
            this.loadingModal.hide();
            this.walletModal.show();
        } catch (error) {
            console.error('Failed to open wallet:', error);
            
            // Hide loading modal and show error
            this.loadingModal.hide();
            this.showErrorNotification(error.message);
        }
    }

    async connectWallet() {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.connectedAddress = accounts[0];
            
            // Setup event listeners for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                this.connectedAddress = accounts[0];
                this.fetchAvailableEarnings();
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });

        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    }

    async fetchAvailableEarnings() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('Unauthorized: No access token found');
    
            const response = await fetch('https://backend.tokenated.com/api/users/earnings', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) throw new Error('Failed to fetch earnings');
    
            const { earnings } = await response.json();
            const earningsInEth = parseFloat(earnings) / Math.pow(10, 18);
            
            const earningsBalanceEl = document.getElementById('earningsBalance');
            if (earningsBalanceEl) {
                earningsBalanceEl.textContent = `${earningsInEth.toFixed(4)} ETH`;
            }
            
            const withdrawBtn = document.getElementById('withdrawEarningsBtn');
            if (withdrawBtn) {
                withdrawBtn.disabled = earningsInEth <= 0;
                withdrawBtn.classList.toggle('opacity-50', earningsInEth <= 0);
            }
    
        } catch (error) {
            console.error('Failed to fetch earnings:', error);
            this.showErrorNotification(error.message);
        }
    }
    
    async initiateEarningsWithdrawal() {
        try {
            this.loadingModal.show();
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('Unauthorized: No access token found');
    
            // Step 1: Initiate withdrawal request to backend
            const response = await fetch('https://backend.tokenated.com/api/users/withdraw', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) throw new Error('Failed to prepare withdrawal');
    
            // Extract withdrawalId & txObject
            const { withdrawalId, txObject } = await response.json();
    
            const gasHex = '0x' + BigInt(txObject.gas).toString(16);
            const gasPriceHex = '0x' + BigInt(txObject.gasPrice).toString(16);
            const valueHex = '0x' + BigInt(txObject.value).toString(16);
    
            // Step 2: Send transaction to blockchain
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: txObject.from,
                    to: txObject.to,
                    data: txObject.data,
                    value: valueHex,
                    gas: gasHex,
                    gasPrice: gasPriceHex
                }]
            });
    
            // Step 3: Confirm the withdrawal with withdrawalId & transactionHash
            const confirmResponse = await fetch('https://backend.tokenated.com/api/users/confirm-withdraw', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ withdrawalId, transactionHash: txHash }) // Send withdrawalId for tracking
            });
    
            if (!confirmResponse.ok) throw new Error('Failed to confirm withdrawal');
    
            const { success, withdrawnAmount } = await confirmResponse.json();
    
            if (success) {
                this.showSuccessNotification(`Successfully withdrew ${parseFloat(withdrawnAmount) / Math.pow(10, 18)} ETH`);
                await this.fetchAvailableEarnings();
                await this.updateWithdrawalHistory();
            }
    
        } catch (error) {
            console.error('Withdrawal failed:', error);
            this.showErrorNotification(error.message);
        } finally {
            this.loadingModal.hide();
        }
    }
    
    async updateWithdrawalHistory() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) throw new Error('Unauthorized: No access token found');
    
            const response = await fetch(`https://backend.tokenated.com/api/users/withdrawal-history`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) throw new Error('Failed to fetch withdrawal history');
    
            const withdrawals = await response.json();
            console.log(withdrawals);
            this.renderWithdrawalHistory(withdrawals);
    
        } catch (error) {
            console.error('Failed to fetch withdrawal history:', error);
            this.showErrorNotification(error.message);
        }
    }
    
    renderWithdrawalHistory(data) {
        console.log(data);
        const container = document.getElementById('withdrawalHistory');
        if (!container) return;
    
        container.innerHTML = '';
        
        // Check if data exists and contains history array
        if (!data || !data.history || !Array.isArray(data.history) || data.history.length === 0) {
            const noHistoryElement = document.createElement('div');
            noHistoryElement.className = 'text-indigo-300 text-center py-4';
            noHistoryElement.textContent = 'No withdrawal history available';
            container.appendChild(noHistoryElement);
            return;
        }
    
        // Process each withdrawal in the history array
        data.history.forEach(withdrawal => {
            // Add additional checks for withdrawal object integrity
            if (!withdrawal || typeof withdrawal !== 'object') return;
    
            const withdrawalElement = document.createElement('div');
            withdrawalElement.className = 'glassmorphism-card p-4 rounded-lg flex justify-between items-center mb-3';
            
            // Safely handle missing or invalid properties
            const amount = withdrawal.amount ? 
                parseFloat(withdrawal.amount).toFixed(4) : 
                'N/A';
            
            // Use createdAt for timestamp
            const timestamp = withdrawal.createdAt ? 
                new Date(withdrawal.createdAt).toLocaleString() : 
                'Unknown Date';
            
            // Add status badge with appropriate color
            const statusClass = withdrawal.status === 'confirmed' ? 
                'text-green-400' : 
                'text-yellow-400';
                
            // Add transaction hash display for confirmed withdrawals
            const txHashDisplay = withdrawal.transactionHash ? 
                `<div class="text-xs text-indigo-300 truncate max-w-xs" title="${withdrawal.transactionHash}">
                    TX: ${withdrawal.transactionHash.substring(0, 10)}...
                </div>` : '';
    
            withdrawalElement.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="bg-purple-500/20 text-purple-400 rounded-full p-2">
                        <i class="fas fa-arrow-up"></i>
                    </div>
                    <div>
                        <div class="text-white font-medium">Earnings Withdrawal</div>
                        <div class="text-indigo-300 text-xs">${timestamp}</div>
                        <div class="text-xs ${statusClass}">${withdrawal.status || 'unknown'}</div>
                        ${txHashDisplay}
                    </div>
                </div>
                <div class="text-purple-400 font-semibold">
                    -${amount} ETH
                </div>
            `;
    
            container.appendChild(withdrawalElement);
        });
        
        if (container.children.length === 0) {
            const noHistoryElement = document.createElement('div');
            noHistoryElement.className = 'text-indigo-300 text-center py-4';
            noHistoryElement.textContent = 'No valid withdrawal history found';
            container.appendChild(noHistoryElement);
        }
    }
    
    // Helper methods for notifications
    showSuccessNotification(message) {
        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 glassmorphism-card px-6 py-4 rounded-xl text-white flex items-center space-x-3';
        
        notificationContainer.innerHTML = `
            <i class="fas fa-check-circle text-green-400 text-2xl"></i>
            <span class="text-lg">${message}</span>
        `;

        document.body.appendChild(notificationContainer);

        // Remove notification after 3 seconds
        setTimeout(() => {
            document.body.removeChild(notificationContainer);
        }, 3000);
    }
    showErrorNotification(message) {
        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 glassmorphism-card px-6 py-4 rounded-xl text-white flex items-center space-x-3';
        
        notificationContainer.innerHTML = `
            <i class="fas fa-exclamation-circle text-red-400 text-2xl"></i>
            <span class="text-lg">${message}</span>
        `;

        document.body.appendChild(notificationContainer);

        // Remove notification after 3 seconds
        setTimeout(() => {
            document.body.removeChild(notificationContainer);
        }, 3000);
    }
}

const styleElement = document.createElement('style');
styleElement.textContent = `
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: linear-gradient(to bottom, #3B82F6, #8B5CF6) rgba(99, 102, 241, 0.1);
    }
    
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(99, 102, 241, 0.1);
        border-radius: 10px;
        margin: 2px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #3B82F6, #8B5CF6);
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #2563EB, #7C3AED);
    }

    /* Glassmorphism-like effect for cards */
    .glassmorphism-card {
        background: rgba(45, 55, 72, 0.5);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(99, 102, 241, 0.2);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .glassmorphism-button {
        background: rgba(45, 55, 72, 0.5);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(99, 102, 241, 0.2);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(styleElement);

// Initialize the WalletManager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const walletManager = new WalletManager();
});
// Loading Controller Functions
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

class AuthController {
    constructor() {
        this.isAuthenticated = false;
        this.userProfile = null;
        this.initializeModal();
        this.authStep = 'email';
        this.createFeedbackModal();
        this.createProfileDropdown();
        this.initializeEventListeners();
        this.checkAuthState();
        window.handleAuthSuccess = this.handleAuthSuccess.bind(this);
        this._vaultInitialized = false; 
    }

    createFeedbackModal() {
        const modalHTML = `
            <div id="feedback-modal" class="fixed inset-0 z-50 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center hidden">
                <div class="bg-gradient-to-br from-gray-900 to-gray-800 w-[320px] p-6 rounded-2xl shadow-xl relative border border-gray-700">
                    <button id="closeFeedbackModal" class="absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none transition-colors duration-200">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div id="feedback-content" class="text-center">
                        <div id="feedback-icon" class="mb-4"></div>
                        <h3 id="feedback-title" class="text-xl font-bold text-white mb-2"></h3>
                        <p id="feedback-message" class="text-gray-300"></p>
                    </div>
                    <div class="mt-6 flex justify-center">
                        <button id="feedback-action" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                            OK
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listener for close button
        document.getElementById('closeFeedbackModal')?.addEventListener('click', () => this.hideFeedbackModal());
    }

    showFeedbackModal(type, title, message, action = null) {
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
            actionButton.onclick = () => this.hideFeedbackModal();
        }

        modal.classList.remove('hidden');
    }

    hideFeedbackModal() {
        const modal = document.getElementById('feedback-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    initializeModal() {
        const modalHTML = `
            <div id="auth-overlay" class="fixed inset-0 z-40 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center hidden">
                <!-- Modal content -->
                ${this.getModalContent()}
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.overlay = document.getElementById('auth-overlay');
    }

    getModalContent() {
        return `
            <div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div class="bg-gray-900 w-[320px] p-6 rounded-2xl shadow-xl relative border border-gray-700">
                    <!-- Close Button -->
                    <button id="closeAuthModal" class="absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none transition-colors duration-200">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    
                    <!-- Header -->
                    <h2 class="text-2xl font-bold text-white mb-4 text-center">Connect Wallet</h2>
                    
                    <!-- Wallet Options -->
                    ${this.getWalletOptionsHTML()}
                    
                    <!-- Divider -->
                    ${this.getDividerHTML()}
                    
                    <!-- Email Form -->
                    ${this.getEmailFormHTML()}
                    
                    <!-- Divider -->
                    ${this.getDividerHTML()}
                    
                    <!-- Google Sign-In -->
                    ${this.getGoogleSignInHTML()}
                    
                    <!-- Footer -->
                    ${this.getFooterHTML()}
                </div>
            </div>
        `;
    }
    getWalletOptionsHTML() {
        return `
        <div class="space-y-3">
            <button id="metamaskBtn" class="w-full flex items-center justify-between px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 border border-gray-700">
                <div class="flex items-center">
                    <img src="./assets/images/download.jpeg" alt="MetaMask" class="w-7 h-7 mr-2 rounded-full">
                    <span class="font-medium">MetaMask</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>

            <button id="walletConnectBtn" class="w-full flex items-center justify-between px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 border border-gray-700">
                <div class="flex items-center">
                    <img src="./assets/images/download.png" alt="WalletConnect" class="w-7 h-6 mr-2 rounded-full">
                    <span class="font-medium">WalletConnect</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>

            <button id="marcediVaultBtn" class="w-full flex items-center justify-between px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 border border-gray-700">
                <div class="flex items-center">
                    <img src="./assets/images/marcedi-vault.png" alt="MarcediVault Vault" class="w-7 h-7 mr-2 rounded-full">
                    <span class="font-medium">MarcediVault</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    `;
    }
    getDividerHTML() {
        return `
            <div class="flex items-center my-4">
                <hr class="flex-grow border-gray-700">
                <span class="mx-2 text-gray-400 text-xs">or</span>
                <hr class="flex-grow border-gray-700">
            </div>
        `;
    }

    getEmailFormHTML() {
        return `
            <form id="authForm" class="flex flex-col gap-3">
                <h3 class="text-lg font-bold text-white mb-2">Sign up / Sign in</h3>
                <div id="email-step">
                    <input type="email" name="email" placeholder="E-mail" 
                        class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                    <button type="button" id="email-next-btn" 
                        class="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                        Next
                    </button>
                </div>
                
                <div id="password-step" class="hidden">
                    <div id="account-status-message" class="mb-3 text-sm"></div>
                    
                    <input type="password" name="password" placeholder="Password" 
                        class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200">
                    
                    <div id="password-strength" class="hidden mt-2">
                        <div class="flex justify-between mb-1 text-xs text-gray-400">
                            <span>Password strength:</span>
                            <span id="strength-text">Weak</span>
                        </div>
                        <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div id="strength-meter" class="h-full bg-red-500 transition-all duration-300" style="width: 25%"></div>
                        </div>
                        <ul id="password-requirements" class="text-xs text-gray-400 mt-2 space-y-1">
                            <li id="req-length" class="flex items-center">
                                <svg class="w-3 h-3 mr-1 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                At least 8 characters
                            </li>
                            <li id="req-uppercase" class="flex items-center">
                                <svg class="w-3 h-3 mr-1 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                Uppercase letter
                            </li>
                            <li id="req-lowercase" class="flex items-center">
                                <svg class="w-3 h-3 mr-1 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                Lowercase letter
                            </li>
                            <li id="req-number" class="flex items-center">
                                <svg class="w-3 h-3 mr-1 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                Number
                            </li>
                            <li id="req-special" class="flex items-center">
                                <svg class="w-3 h-3 mr-1 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10" />
                                </svg>
                                Special character
                            </li>
                        </ul>
                    </div>
                    
                    <button type="submit" id="submit-btn" 
                        class="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                        Submit
                    </button>
                </div>
            </form>
        `;
    }

    getGoogleSignInHTML() {
        return `
            <button onclick="googleSignIn()" class="w-full flex items-center justify-between px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 border border-gray-700">
                <div class="flex items-center">
                    <svg class="w-6 h-6 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                    </svg>
                    <span class="font-medium">Continue with Google</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>

            <div style="display: none;">
                <div id="g_id_onload"
                    data-client_id="914011867006-e3ff1i870n1e1drdjeij2s1hm4i7cncf.apps.googleusercontent.com"
                    data-ux_mode="popup"
                    data-callback="handleGoogleAuth"
                    data-auto_select="true">
                </div>
                <div class="g_id_signin"
                    data-type="standard"
                    data-logo_alignment="left">
                </div>
            </div>
        `;
    }

    getFooterHTML() {
        return `
            <p class="mt-4 text-center text-gray-400 text-xs">
                Don't have a wallet?
                <a href="./learnMore.html" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline ml-1 transition-colors duration-200">Learn more</a>
            </p>
            <p class="mt-4 text-center text-gray-400 text-xs">
                By signing up you agree to our<br>
                <a href="legal/termsandconditions.html" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline ml-1 transition-colors duration-200"> terms and conditions</a>
                and
                <a href="legal/privacy.html" target="_blank" class="text-blue-400 hover:text-blue-300 hover:underline ml-1 transition-colors duration-200"> privacy policy</a>
            </p>
        `;
    }

    initializeEventListeners() {
        document.querySelectorAll('.connect-wallet-btn').forEach(button => {
            button.removeEventListener('click', this.handleButtonClick);
            button.addEventListener('click', this.handleButtonClick.bind(this));
        });

        document.getElementById('closeAuthModal')?.addEventListener('click', () => this.hideModal());
        this.overlay?.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.hideModal();
        });

        document.getElementById('metamaskBtn')?.addEventListener('click', () => this.connectMetaMask());
        document.getElementById('walletConnectBtn')?.addEventListener('click', () => this.connectWalletConnect());
        document.getElementById('otherWalletsBtn')?.addEventListener('click', () => this.showWalletList());

        document.getElementById('email-next-btn')?.addEventListener('click', () => this.handleEmailStep());
        document.getElementById('marcediVaultBtn')?.addEventListener('click', this.loginWithMarcediVault.bind(this));

        document.querySelector('input[name="password"]')?.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
        document.getElementById('authForm')?.addEventListener('submit', (e) => this.handleEmailSignIn(e));
    }


    createProfileDropdown() {
        const dropdownHTML = `
            <div id="profile-dropdown" class="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 hidden">
                <div class="py-1">
                    <a href="/user-profile" class="block px-4 py-2 text-left text-sm text-white hover:bg-gray-700 transition-colors">
                        My Profile
                    </a>
                    <button id="logout-btn" class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors">
                        Logout
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', dropdownHTML);
    }


    async checkAuthState() {
        let accessToken = localStorage.getItem('accessToken');
        let refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
            localStorage.removeItem('userId');
            this.isAuthenticated = false;
            this.updateUIState();
            return;
        }

        try {
            const response = await fetch('https://backend.tokenated.com/api/auth/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();

            // Fetch user profile explicitly
            const profileResponse = await fetch('https://backend.tokenated.com/api/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`
                }
            });

            if (!profileResponse.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const userProfile = await profileResponse.json();

            // Update tokens and user profile
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            this.isAuthenticated = true;
            this.userProfile = {
                id: userProfile.id || userProfile._id,
                name: userProfile.name || '',
                email: userProfile.email || '',
                profilePicture: userProfile.profileImage || '/default-profile.png'
            };

            this.updateUIState();
        } catch (error) {
            console.error('Authentication check failed:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            this.isAuthenticated = false;
            this.userProfile = null;
            this.updateUIState();
        }
    }

    async handleEmailStep() {
        const emailInput = document.querySelector('input[name="email"]');
        const email = emailInput.value.trim();

        if (!this.validateEmail(email)) {
            this.showFeedbackModal(
                'error',
                'Invalid Email',
                'Please enter a valid email address.'
            );
            return;
        }

        try {
            showLoading();
            this.currentEmail = email;

            // Check if the email exists in the system
            const response = await fetch('https://backend.tokenated.com/api/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            // Switch to password step
            document.getElementById('email-step').classList.add('hidden');
            document.getElementById('password-step').classList.remove('hidden');

            const accountStatusMessage = document.getElementById('account-status-message');
            const passwordStrengthUI = document.getElementById('password-strength');

            if (data.exists) {
                // Existing user - login flow
                this.authStep = 'password';
                accountStatusMessage.innerHTML = `<p class="text-green-400">Welcome back! Please enter your password to continue.</p>`;
                document.getElementById('submit-btn').textContent = 'Sign In';
                passwordStrengthUI.classList.add('hidden');
            } else {
                // New user - registration flow
                this.authStep = 'register';
                accountStatusMessage.innerHTML = `<p class="text-blue-400">You're creating a new account. <br>You'll need to verify your email after registration.</p>`;
                document.getElementById('submit-btn').textContent = 'Create Account';
                passwordStrengthUI.classList.remove('hidden');
            }

        } catch (error) {
            console.error('Email check error:', error);
            this.showFeedbackModal(
                'error',
                'Server Error',
                'Unable to verify email. Please try again later.'
            );
        } finally {
            hideLoading();
        }
    }

    checkPasswordStrength(password) {
        if (this.authStep !== 'register') return;

        // Show password strength UIee
        const strengthMeter = document.getElementById('strength-meter');
        const strengthText = document.getElementById('strength-text');

        // Check requirements
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };

        // Update requirement indicators
        Object.keys(requirements).forEach(req => {
            const element = document.getElementById(`req-${req}`);
            if (requirements[req]) {
                element.classList.add('text-green-400');
                element.classList.remove('text-gray-400');
                element.querySelector('svg').classList.add('text-green-400');
                element.querySelector('svg').classList.remove('text-gray-500');
            } else {
                element.classList.remove('text-green-400');
                element.classList.add('text-gray-400');
                element.querySelector('svg').classList.remove('text-green-400');
                element.querySelector('svg').classList.add('text-gray-500');
            }
        });

        // Calculate strength (0-4)
        const strengthScore = Object.values(requirements).filter(Boolean).length;

        // Update strength meter
        let strengthPercentage = (strengthScore / 5) * 100;
        let strengthColor = 'bg-red-500';
        let strengthLabel = 'Weak';

        if (strengthScore >= 4) {
            strengthColor = 'bg-green-500';
            strengthLabel = 'Strong';
        } else if (strengthScore >= 3) {
            strengthColor = 'bg-yellow-500';
            strengthLabel = 'Good';
        } else if (strengthScore >= 2) {
            strengthColor = 'bg-orange-500';
            strengthLabel = 'Fair';
        }

        strengthMeter.style.width = `${strengthPercentage}%`;
        strengthMeter.className = `h-full ${strengthColor} transition-all duration-300`;
        strengthText.textContent = strengthLabel;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async handleEmailSignIn(e) {
        e.preventDefault();
        const password = document.querySelector('input[name="password"]').value;

        try {
            showLoading();

            if (this.authStep === 'register') {
                // Additional validation for registration
                const strengthScore = document.getElementById('password-strength').querySelectorAll('.text-green-400').length;
                if (strengthScore < 3) {
                    this.showFeedbackModal(
                        'error',
                        'Weak Password',
                        'Please create a stronger password that meets more requirements.'
                    );
                    hideLoading();
                    return;
                }
            }

            const endpoint = 'https://backend.tokenated.com/api/auth/email';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.currentEmail, password })
            });

            const data = await response.json();
            hideLoading();

            if (data.message === 'Registration successful. Please verify your email.') {
                this.showFeedbackModal(
                    'success',
                    'Registration Successful',
                    'Please check your email for verification instructions.',
                    {
                        text: 'OK',
                        handler: () => {
                            this.hideFeedbackModal();
                            this.hideModal();
                        }
                    }
                );
            } else if (data.message === 'Login successful') {
                this.showFeedbackModal(
                    'success',
                    'Login Successful',
                    'Welcome back!',
                    {
                        text: 'Continue',
                        handler: () => {
                            this.handleAuthSuccess(data);
                            this.hideFeedbackModal();
                        }
                    }
                );
            } else {
                throw new Error(data.message || 'Authentication failed');
            }

        } catch (error) {
            console.error('Authentication error:', error);
            this.showFeedbackModal(
                'error',
                'Authentication Error',
                error.message || 'Failed to authenticate. Please try again.'
            );
        } finally {
            hideLoading();
        }
    }

    generateNonce() {
        return `Sign this message to verify your wallet: ${Date.now()}`;
    }

    async getWalletLoginMessage(address) {
        try {
            const response = await fetch('https://backend.tokenated.com/api/auth/login/wallet/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });

            if (!response.ok) {
                throw new Error('Failed to get login message');
            }

            const data = await response.json();
            return data.message;
        } catch (error) {
            console.error('Error getting wallet login message:', error);
            throw error;
        }
    }

    async connectMetaMask() {
        try {
            showLoading();
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length > 0) {
                const address = accounts[0];
                const message = await this.getWalletLoginMessage(address);
                const signature = await window.ethereum.request({
                    method: 'personal_sign',
                    params: [message, address]
                });

                await this.loginWithWallet(address, signature, message);
            }
        } catch (error) {
            console.error('MetaMask error:', error);
            this.showFeedbackModal(
                'error',
                'MetaMask Error',
                error.message || 'Failed to connect MetaMask'
            );
        } finally {
            hideLoading();
        }
    }


async loginWithMarcediVault() {
    window.handleAuthSuccess = this.handleAuthSuccess.bind(this);

    if (!this._vaultInitialized) {
        MarcediVault.init({
            client_id: 'mcv_ccfb77e5d6f346cc82b4d78af6195519',
            redirect_uri: 'http://127.0.0.1:5501/Frontend/marcedivault/redirect.html',
            scope: ['wallet', 'email', 'profile'],
        });
        this._vaultInitialized = true;
    }

    MarcediVault.login();
    // MarcediVault
}

    async loadWalletConnect() {
        if (!window.WalletConnectProvider) {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/@walletconnect/web3-provider@1.7.8/dist/umd/index.min.js";
            script.async = true;

            document.head.appendChild(script);

            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }
        console.log('WalletConnectProvider loaded:', window.WalletConnectProvider);
    }






    async connectWalletConnect() {
        try {
            showLoading();

            // Ensure WalletConnectProvider is loaded dynamically
            await this.loadWalletConnect();

            // Check if WalletConnectProvider is available
            if (!window.WalletConnectProvider || !window.WalletConnectProvider.default) {
                throw new Error("Failed to load WalletConnect");
            }

            // Use window.WalletConnectProvider.default instead of window.WalletConnectProvider
            const ProviderClass = window.WalletConnectProvider.default;

            // Initialize WalletConnect provider
            const provider = new window.WalletConnectProvider.default({
                rpc: {
                    1: "https://base-mainnet.g.alchemy.com/v2/uUPNNERMj4SOHPkxxQPoW-eXRzIbRaro"
                },
                bridge: "https://bridge.walletconnect.org"
            });


            // Enable session (connect)
            await provider.enable();

            // Get the accounts
            const accounts = await provider.request({ method: "eth_accounts" });

            if (accounts.length > 0) {
                const address = accounts[0];

                // Fetch login message from backend
                const message = await this.getWalletLoginMessage(address);

                // Sign the message
                const signature = await provider.request({
                    method: "personal_sign",
                    params: [message, address]
                });

                // Call login function (replace with your actual logic)
                await this.loginWithWallet(address, signature, message);
            }
        } catch (error) {
            console.error("WalletConnect error:", error);
            showFeedbackModal(
                "error",
                "WalletConnect Error",
                error.message || "Failed to connect with WalletConnect"
            );
        } finally {
            hideLoading();
        }
    }



    async loginWithWallet(address, signature, message) {
        try {
            const response = await fetch('https://backend.tokenated.com/api/auth/login/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, signature, message })
            });

            if (!response.ok) throw new Error('Wallet login failed');

            const data = await response.json();
            this.handleAuthSuccess(data);

            this.showFeedbackModal(
                'success',
                'Wallet Connected',
                'Successfully connected your wallet!',
                {
                    text: 'Continue',
                    handler: () => this.hideFeedbackModal()
                }
            );
        } catch (error) {
            console.error('Wallet login error:', error);
            this.showFeedbackModal(
                'error',
                'Login Error',
                error.message || 'Failed to login with wallet'
            );
        }
    }


    async handleGoogleAuth(response) {
        try {
            showLoading();
            const result = await fetch('https://backend.tokenated.com/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential })
            });

            const data = await result.json();

            if (!result.ok) throw new Error(data.message || 'Google authentication failed');

            this.handleAuthSuccess(data);
            this.showFeedbackModal(
                'success',
                'Login Successful',
                'Welcome back!',
                {
                    text: 'Continue',
                    handler: () => this.hideFeedbackModal()
                }
            );
        } catch (error) {
            console.error('Google auth error:', error);
            this.showFeedbackModal(
                'error',
                'Authentication Error',
                error.message || 'Failed to authenticate with Google'
            );
        } finally {
            hideLoading();
        }
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
                this.hideProfileDropdown();
            });
        }
    }




    hideProfileDropdown() {
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }


    showProfileDropdown() {
        const dropdown = document.getElementById('profile-dropdown');
        const profileContainer = document.getElementById('profile-pic-container');

        if (dropdown && profileContainer) {
            dropdown.classList.remove('hidden');

            // Position dropdown calculation with screen bounds
            const containerRect = profileContainer.getBoundingClientRect();
            const dropdownRect = dropdown.getBoundingClientRect();
            const windowWidth = window.innerWidth;

            // Calculate horizontal position
            let left = containerRect.right - dropdownRect.width;
            left = Math.max(10, Math.min(left, windowWidth - dropdownRect.width - 10));

            // Calculate vertical position
            let top = containerRect.bottom + 10;

            dropdown.style.position = 'fixed';
            dropdown.style.top = `${top}px`;
            dropdown.style.left = `${left}px`;
        }
    }

    updateUIState() {
        console.log('Updating UI State:', {
            isAuthenticated: this.isAuthenticated,
            userProfile: this.userProfile
        }); // Debug log



        document.querySelectorAll('.connect-wallet-btn').forEach(button => {
            console.log('Processing button:', button);
            if (this.isAuthenticated && this.userProfile) {
                button.innerHTML = `
                    <div id="profile-pic-container" class="relative group w-full">
                        <div class="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-4 py-2 rounded-full hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 cursor-pointer space-x-3">
                            <div class="flex items-center space-x-3">
                                <img src="${this.userProfile.profilePicture || '/default-profile.png'}" 
                                     alt="Profile" 
                                     class="w-8 h-8 rounded-full border-2 border-white/20">
                                <span class="font-medium text-sm truncate max-w-[120px]">
                                    ${this.userProfile.name || 'User'}
                                </span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white/70 md:block hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                            <div class="p-4 border-b border-gray-700 flex items-center space-x-4">
                                <img src="${this.userProfile.profilePicture || '/default-profile.png'}" 
                                     alt="Profile" 
                                     class="w-12 h-12 rounded-full border-2 border-purple-500">
                                <div>
                                    <div class="font-bold text-white">${this.userProfile.name || 'User'}</div>
                                    <div class="text-xs text-gray-400 truncate">${this.userProfile.email || ''}</div>
                                </div>
                            </div>
                            <div class="py-1">
                                <a id="viewProfile" class="block px-4 py-3 text-white hover:bg-gray-700 transition-colors flex items-center space-x-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>My Profile</span>
                                </a>
                                <button id="logout-btn" class="w-full text-left px-4 py-3 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors flex items-center space-x-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Logout</span>
                                </a>
                            </div>
                        </div>
                    </div>
                `;

                const profileContainer = document.getElementById('profile-pic-container');
                const dropdown = document.getElementById('profile-dropdown');

                // Prevent dropdown from disappearing when moving between profile pic and dropdown
                profileContainer.addEventListener('mouseenter', this.showProfileDropdown.bind(this));
                dropdown.addEventListener('mouseenter', () => {
                    dropdown.classList.remove('hidden');
                });

                profileContainer.addEventListener('mouseleave', (event) => {
                    // Only hide if mouse is not over the dropdown
                    setTimeout(() => {
                        if (!dropdown.matches(':hover')) {
                            dropdown.classList.add('hidden');
                        }
                    }, 100);
                });

                dropdown.addEventListener('mouseleave', () => {
                    dropdown.classList.add('hidden');
                });

                const viewProfileBtn = document.getElementById('viewProfile');
                //mobilebtn
                const viewProfile = document.getElementById('view-profile');
                if (viewProfileBtn) {
                    viewProfileBtn.addEventListener('click', () => this.viewProfile(this.userProfile._id));
                    viewProfile.addEventListener('click', () => this.viewProfile(this.userProfile._id));

                    // Add logout event listener
                    const logoutBtn = document.getElementById('logout-btn');
                    const logoutMobBtn = document.getElementById('logout-mobile-btn');


                    if (logoutBtn) {
                        logoutBtn.addEventListener('click', () => this.handleLogout());
                        logoutMobBtn.addEventListener('click', () => this.handleLogout());
                    }

                    const mobileAccOptions = document.getElementById('mobileAccOptions');
                    mobileAccOptions.classList.remove("hidden");
                    logoutMobBtn.classList.remove("hidden");
                }
            } else {
                button.innerHTML = `
                    <div class="w-full">
                        <div class="connect-wallet-inner-btn flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 space-x-3 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            <span class="font-medium">Connect Wallet</span>
                        </div>
                    </div>
                `;
                const mobileAccOptions = document.getElementById('mobileAccOptions');
                mobileAccOptions.classList = "hidden";
            }
        });
    }


    async handleLogout() {
        try {
            showLoading();
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                await fetch('https://backend.tokenated.com/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userId');
            this.isAuthenticated = false;
            this.updateUIState();
            hideLoading();
        }
    }

    async viewProfile(userId) {
        window.location.href = `./owncreatorpage.html?id=${userId}`;
    }




    validateEmail(email) {
        ``
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    validatePassword(password) {
        ``
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
    }


    handleAuthSuccess(data) {
        console.log('data', data);

        const accessToken = data.tokens.accessToken;
        const refreshToken = data.tokens.refreshToken;

        // Store tokens in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Store user profile information
        const userId = data.userId;
        localStorage.setItem('userId', userId); // Save userId to localStorage
        console.log(userId);

        this.userProfile = {
            id: userId,
            name: data.user?.username || '',
            email: data.user?.email || '',
            profilePicture: data.user?.profileImage || '/default-profile.png'
        };

        this.isAuthenticated = true;
        this.updateUIState();
        this.hideModal();

        // Reload the page
        window.location.reload();
    }




    showModal() {
        this.overlay.classList.remove('hidden');
    }

    hideModal() {
        this.overlay.classList.add('hidden');
    }

    showWalletList() {
        this.showFeedbackModal(
            'info',
            'Coming Soon',
            'Additional wallet options will be available soon.',
            {
                text: 'OK',
                handler: () => this.hideFeedbackModal()
            }
        );
    }


    handleButtonClick(event) {
        const button = event.currentTarget;

        // If already authenticated, toggle dropdown
        if (this.isAuthenticated && this.userProfile) {
            const dropdown = button.querySelector('#profile-dropdown');
            if (dropdown.classList.contains('hidden')) {
                this.showProfileDropdown();
            } else {
                this.hideProfileDropdown();
            }
        } else {
            // If not authenticated, show auth modal
            this.showModal();
        }
    }

    


}

function checkFallbackStorage() {
    console.log('fallbackkkiininginigni')
  const raw = localStorage.getItem("mv_auth_result");
  if (raw) {
    try {
      const message = JSON.parse(raw);
      if (message?.type === "marcedivault-auth-success") {
        console.log("📦 Retrieved auth message from localStorage fallback.");
        localStorage.removeItem("mv_auth_result"); // cleanup
        console.log("🎉 Auth success from fallback storage!");
        console.log("Access Token:", message.payload.mv_tokens);
        MarcediVault.marcediAuthFin({ mv_tokens: message.payload.mv_tokens });
        handleAuthSuccess({
          tokens: {
            accessToken: message.payload.accessToken,
            refreshToken: message.payload.refreshToken,
          },
          user: message.payload.user,
          userId: message.payload.userId,
        });
      }
    } catch (err) {
      console.error("Failed to parse fallback auth result:", err);
    }
  }
}

setInterval(checkFallbackStorage, 1000);


window.addEventListener("message", (event) => {
  console.log("📨 Received message from popup:", event);

  const expectedOrigin = "https://test.tokenated.com"; 

  if (
    event.origin === expectedOrigin &&
    event.data &&
    event.data.type === "marcedivault-auth-success"
  ) {
    const { accessToken, refreshToken, user, userId, mv_tokens } = event.data.payload;

    console.log("🎉 Auth success from popup!");
    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);
    console.log("User:", user);
    MarcediVault.marcediAuthFin(mv_tokens);
    handleAuthSuccess({ tokens: { accessToken, refreshToken }, user, userId });
  } else {
    if (event.origin !== expectedOrigin || !event.data?.type?.startsWith("marcedivault")) {
      return; // silently ignore noise
    }

    console.warn("⚠️ Unrecognized or malformed message:", event.data);
  }
});

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.authController = new AuthController();
});

// Initialize Google Sign-In
window.onload = function () {
    google.accounts.id.initialize({
        client_id: "914011867006-e3ff1i870n1e1drdjeij2s1hm4i7cncf.apps.googleusercontent.com",
        callback: window.authController.handleGoogleAuth.bind(window.authController)
    });
};




function googleSignIn() {
    const googleButton = document.querySelector('.g_id_signin div[role=button]');
    if (googleButton) {
        googleButton.click();
    } else {
        console.error('Google Sign-In button not found');
        window.authController.showFeedbackModal(
            'error',
            'Google Sign-In Error',
            'Failed to initialize Google Sign-In'
        );
    }

}





























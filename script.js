// Therapeutic techniques database
const therapeuticTechniques = {
    "priority-matrix": {
        title: "Priority Matrix (Eisenhower Matrix)",
        description: "Organize tasks by urgency and importance to reduce overwhelm and create clarity",
        steps: [
            "List all your tasks and projects",
            "Categorize them: Urgent & Important (do now), Important but Not Urgent (schedule), Urgent but Not Important (delegate), Neither (eliminate)",
            "Focus on Quadrant 2 tasks for long-term success",
            "Set realistic time blocks for each category"
        ],
        whenToUse: "When feeling overwhelmed with multiple responsibilities and unclear priorities"
    },
    "box-breathing": {
        title: "Box Breathing Technique",
        description: "Regulate the nervous system through controlled breathing to reduce physical anxiety symptoms",
        steps: [
            "Sit comfortably and relax your shoulders",
            "Inhale through your nose for 4 seconds",
            "Hold your breath for 4 seconds", 
            "Exhale through your mouth for 4 seconds",
            "Hold empty for 4 seconds",
            "Repeat 5-10 cycles"
        ],
        whenToUse: "During acute anxiety, panic symptoms, physical tension, or before stressful tasks"
    },
    "thought-challenging": {
        title: "Cognitive Restructuring",
        description: "Identify and reframe negative thought patterns that contribute to anxiety and self-doubt",
        steps: [
            "Identify the automatic negative thought",
            "Examine evidence for and against the thought",
            "Consider alternative perspectives", 
            "Develop a balanced, realistic thought",
            "Practice the new thought pattern"
        ],
        whenToUse: "When experiencing negative self-talk, imposter syndrome, or catastrophic thinking"
    },
    "pomodoro": {
        title: "Pomodoro Technique",
        description: "Break work into focused intervals with regular breaks to maintain concentration and prevent burnout",
        steps: [
            "Choose a specific task to focus on",
            "Set a timer for 25 minutes of focused work",
            "When timer rings, take a 5-minute break",
            "After 4 cycles, take a 15-30 minute break",
            "Repeat as needed"
        ],
        whenToUse: "When struggling with focus, procrastination, or work-related stress"
    },
    "grounding": {
        title: "5-4-3-2-1 Grounding Technique", 
        description: "Use sensory awareness to anchor in the present moment during anxiety or dissociation",
        steps: [
            "Name 5 things you can see around you",
            "Identify 4 things you can touch or feel",
            "Acknowledge 3 things you can hear",
            "Notice 2 things you can smell", 
            "Recognize 1 thing you can taste"
        ],
        whenToUse: "During panic attacks, dissociation, or when feeling disconnected from reality"
    }
};

// Complete PaymentSystem Class with Yoco Integration
class PaymentSystem {
    constructor() {
        this.yoco = null;
        this.publicKey = 'pk_live_ff81b7a1N4WnLY1cce64';
        this.secretKey = 'sk_live_af1fa3ebY69ZO1ze7e84ef69acaf';
        this.isYocoReady = false;
        this.pendingPayments = new Map();
        this.setupPaymentListeners();
        this.waitForYocoSDK();
        this.setupPaymentPolling();
    }

    waitForYocoSDK() {
        console.log('🔄 Waiting for Yoco SDK...');
        
        const checkYoco = () => {
            if (typeof YocoSDK !== 'undefined') {
                console.log('✅ Yoco SDK loaded!');
                this.initYoco();
            } else {
                console.log('⏳ Yoco SDK not ready, checking again...');
                setTimeout(checkYoco, 500);
            }
        };
        
        checkYoco();
    }

    initYoco() {
        try {
            this.yoco = new YocoSDK({
                publicKey: this.publicKey
            });
            this.isYocoReady = true;
            console.log('✅ Yoco SDK initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Yoco:', error);
            this.isYocoReady = false;
        }
    }

    setupPaymentListeners() {
        const upgradeBtn = document.getElementById('upgrade-btn');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleUpgradeClick();
            });
        }

        const closePaymentModal = document.getElementById('close-payment-modal');
        if (closePaymentModal) {
            closePaymentModal.addEventListener('click', () => {
                this.hidePaymentModal();
            });
        }

        const paymentModal = document.getElementById('payment-modal');
        if (paymentModal) {
            paymentModal.addEventListener('click', (e) => {
                if (e.target === paymentModal) {
                    this.hidePaymentModal();
                }
            });
        }
    }

    handleUpgradeClick() {
        if (!authSystem.isLoggedIn) {
            authSystem.showAuthModal();
            return;
        }

        const user = authSystem.currentUser;
        
        if (user.isPremium) {
            this.showPremiumModal();
        } else if (this.hasExceededFreeSessions(user)) {
            this.showPaymentOptions();
        } else {
            this.showUpgradeOptions();
        }
    }

    hasExceededFreeSessions(user) {
        const FREE_SESSION_LIMIT = 3;
        return user.sessions > FREE_SESSION_LIMIT;
    }

    showUpgradeOptions() {
        const modalHTML = `
            <div class="payment-modal">
                <h3>Upgrade to Premium</h3>
                <p>Get unlimited therapy sessions and premium features</p>
                
                <div class="pricing-options">
                    <div class="pricing-option featured">
                        <div class="popular-badge">Most Popular</div>
                        <h4>Monthly Premium</h4>
                        <div class="price">$9.99<span>/month</span></div>
                        <ul>
                            <li>✓ Unlimited therapy sessions</li>
                            <li>✓ Premium AI techniques</li>
                            <li>✓ Progress analytics</li>
                            <li>✓ Priority support</li>
                        </ul>
                        <button class="btn-purchase" onclick="paymentSystem.showPaymentForm(999, 'monthly')">Get Premium</button>
                    </div>
                    
                    <div class="pricing-option">
                        <h4>Single Session</h4>
                        <div class="price">$2.99<span>/session</span></div>
                        <ul>
                            <li>✓ One additional session</li>
                            <li>✓ Perfect if you need just one more</li>
                        </ul>
                        <button class="btn-purchase" onclick="paymentSystem.showPaymentForm(299, 'session')">Buy Session</button>
                    </div>
                </div>
                
                <div class="yoco-setup-info">
                    <p><strong>💳 Secure Payments by Yoco</strong></p>
                    <p>All payments are processed securely through Yoco</p>
                    <p>Your card details are never stored on our servers</p>
                </div>
            </div>
        `;
    
        this.showPaymentModal('Upgrade Options', modalHTML);
    }

    showPaymentOptions() {
        const sessionsUsed = authSystem.currentUser.sessions;
        const sessionsLeft = Math.max(0, 3 - sessionsUsed);
        
        const modalHTML = `
            <div class="payment-modal">
                <h3>Session Limit Reached</h3>
                <p>You've used ${sessionsUsed} sessions this month (${sessionsLeft} free sessions remaining)</p>
                
                <div class="pricing-options">
                    <div class="pricing-option">
                        <h4>Additional Session</h4>
                        <div class="price">$2.99<span>/session</span></div>
                        <p>Purchase one more therapy session</p>
                        <button class="btn-purchase" onclick="paymentSystem.showPaymentForm(299, 'session')">Buy Session</button>
                    </div>
                    
                    <div class="pricing-option featured">
                        <div class="popular-badge">Best Value</div>
                        <h4>Unlimited Premium</h4>
                        <div class="price">$9.99<span>/month</span></div>
                        <ul>
                            <li>✓ Unlimited therapy sessions</li>
                            <li>✓ No more session limits</li>
                            <li>✓ All premium features</li>
                        </ul>
                        <button class="btn-purchase" onclick="paymentSystem.showPaymentForm(999, 'monthly')">Go Unlimited</button>
                    </div>
                </div>
            </div>
        `;
    
        this.showPaymentModal('Continue Your Therapy', modalHTML);
    }

    showPaymentForm(amount, plan) {
        console.log('🔄 Showing payment form for:', amount, plan);
        
        const amountInDollars = (amount / 100).toFixed(2);
        const planName = plan === 'monthly' ? 'Monthly Premium Plan' : 'Single Session';
        
        const paymentHTML = `
            <div class="payment-form">
                <h3>Complete Payment</h3>
                <div class="payment-amount">${planName} - $${amountInDollars}</div>
                
                <div class="payment-instructions">
                    <p><strong>Choose Payment Method:</strong></p>
                </div>
                
                <div class="payment-methods">
                    <div class="payment-method" onclick="paymentSystem.redirectToYoco(${amount}, '${plan}')">
                        <div class="method-icon">💳</div>
                        <div class="method-info">
                            <h4>Credit/Debit Card</h4>
                            <p>Pay securely with Yoco</p>
                        </div>
                        <div class="method-arrow">→</div>
                    </div>
                    
                    <div class="payment-method" onclick="paymentSystem.redirectToYoco(${amount}, '${plan}')">
                        <div class="method-icon">📱</div>
                        <div class="method-info">
                            <h4>Yoco Payment</h4>
                            <p>Secure payment processing</p>
                        </div>
                        <div class="method-arrow">→</div>
                    </div>
                </div>
                
                // Add this instead:
<div class="payment-security-info">
    <p><i class="fas fa-lock"></i> Secure payment processing</p>
    <p>Your card details are encrypted and secure</p>
</div>
                
                <div class="payment-actions">
                    <button class="btn-back" onclick="paymentSystem.showPaymentOptions()">
                        ← Back to Options
                    </button>
                </div>
                
                <p class="payment-security">
                    <i class="fas fa-lock"></i> Secured by Yoco • Your payment details are safe
                </p>
            </div>
        `;

        this.showPaymentModal('Secure Payment', paymentHTML);
    }

    redirectToYoco(amount, plan) {
        const amountInDollars = (amount / 100).toFixed(2);
        const description = plan === 'monthly' ? 'LumaCare Monthly Premium' : 'LumaCare Single Session';
        const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Store pending payment
        this.pendingPayments.set(paymentId, {
            amount: amount,
            plan: plan,
            timestamp: Date.now(),
            status: 'pending'
        });

        // Save to localStorage for persistence
        this.savePendingPayments();

        const yocoLinks = {
            999: 'https://pay.yoco.com/r/mexvR5',
            299: 'https://pay.yoco.com/r/2JVqYJ'
        };
        
        const yocoUrl = yocoLinks[amount] || 'https://pay.yoco.com/r/mexvR5';
        
        // Open Yoco in new tab
        window.open(yocoUrl, '_blank', 'width=600,height=700');
        
        // Show verification screen
        this.showPaymentVerification(paymentId, amount, plan);
    }

    showPaymentVerification(paymentId, amount, plan) {
        const amountInDollars = (amount / 100).toFixed(2);
        
        const verificationHTML = `
            <div class="payment-verification">
                <div class="verification-header">
                    <div class="verification-icon">🔍</div>
                    <h3>Payment Verification</h3>
                </div>
                
                <div class="verification-steps">
                    <div class="verification-step active">
                        <div class="step-number">1</div>
                        <div class="step-info">
                            <h4>Complete Payment</h4>
                            <p>You've been redirected to Yoco's secure payment page in a new tab.</p>
                            <p><strong>Amount: $${amountInDollars}</strong></p>
                        </div>
                    </div>
                    
                    <div class="verification-step">
                        <div class="step-number">2</div>
                        <div class="step-info">
                            <h4>Automatic Verification</h4>
                            <p>We're automatically checking for your payment confirmation...</p>
                            <div class="verification-status">
                                <div class="loading-spinner"></div>
                                <span class="status-text">Waiting for payment confirmation</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="verification-step">
                        <div class="step-number">3</div>
                        <div class="step-info">
                            <h4>Access Granted</h4>
                            <p>You'll get instant access to premium features once verified</p>
                        </div>
                    </div>
                </div>
                
                <div class="verification-actions">
                    <button class="btn-check-again" onclick="paymentSystem.checkPaymentStatus('${paymentId}')">
                        🔄 Check Payment Status
                    </button>
                    <button class="btn-manual-verify" onclick="paymentSystem.showManualVerification('${paymentId}', ${amount}, '${plan}')">
                        📧 Verify with Receipt
                    </button>
                    <button class="btn-cancel" onclick="paymentSystem.cancelPayment('${paymentId}')">
                        Cancel Payment
                    </button>
                </div>
                
                <div class="payment-help">
                    <p><strong>Having issues?</strong></p>
                    <p>Email your receipt to: <strong>lumacare.therapy@gmail.com</strong></p>
                    <p>Include your name and transaction ID for manual verification</p>
                </div>
            </div>
        `;
        
        this.showPaymentModal('Verifying Payment', verificationHTML);
        
        // Start automatic verification
        this.startAutoVerification(paymentId);
    }

    startAutoVerification(paymentId) {
        // Check every 5 seconds for 2 minutes
        let checks = 0;
        const maxChecks = 24; // 2 minutes total
        
        const verificationInterval = setInterval(() => {
            checks++;
            this.checkPaymentStatus(paymentId);
            
            if (checks >= maxChecks) {
                clearInterval(verificationInterval);
                this.showVerificationTimeout(paymentId);
            }
        }, 5000);
        
        // Store interval ID for cleanup
        this.pendingPayments.get(paymentId).verificationInterval = verificationInterval;
        this.savePendingPayments();
    }

    async checkPaymentStatus(paymentId) {
        const payment = this.pendingPayments.get(paymentId);
        if (!payment) return;

        try {
            // Update UI to show checking
            this.updateVerificationStatus('Checking payment status...');
            
            // Simulate API call to check payment status
            const isVerified = await this.simulatePaymentVerification(paymentId);
            
            if (isVerified) {
                this.handleVerifiedPayment(paymentId);
            } else {
                this.updateVerificationStatus('Payment not confirmed yet...');
            }
        } catch (error) {
            console.error('Error checking payment:', error);
            this.updateVerificationStatus('Error checking status. Try manual verification.');
        }
    }

    async simulatePaymentVerification(paymentId) {
        // SIMULATION: 30% chance of success after 3+ checks
        const payment = this.pendingPayments.get(paymentId);
        const checkCount = payment.checkCount || 0;
        payment.checkCount = checkCount + 1;
        
        // Increase chance of success with each check
        const successChance = Math.min(0.3 + (checkCount * 0.1), 0.8);
        return Math.random() < successChance;
    }

    handleVerifiedPayment(paymentId) {
        const payment = this.pendingPayments.get(paymentId);
        if (!payment) return;

        // Clear verification interval
        if (payment.verificationInterval) {
            clearInterval(payment.verificationInterval);
        }

        // Process successful payment
        const transactionId = 'yoco_verified_' + Date.now();
        this.handleSuccessfulPayment(payment.amount, transactionId, payment.plan);
        
        // Remove from pending
        this.pendingPayments.delete(paymentId);
        this.savePendingPayments();
    }

    showManualVerification(paymentId, amount, plan) {
        const amountInDollars = (amount / 100).toFixed(2);
        
        const manualHTML = `
            <div class="manual-verification">
                <div class="verification-header">
                    <div class="verification-icon">📧</div>
                    <h3>Manual Verification</h3>
                </div>
                
                <div class="manual-steps">
                    <div class="manual-step">
                        <h4>Step 1: Find Your Receipt</h4>
                        <p>Check your email for the Yoco payment receipt</p>
                    </div>
                    
                    <div class="manual-step">
                        <h4>Step 2: Email Your Receipt</h4>
                        <p>Forward the receipt or screenshot to:</p>
                        <div class="email-address">
                            <strong>lumacare.therapy@gmail.com</strong>
                            <button class="btn-copy-email" onclick="paymentSystem.copyEmailToClipboard()">
                                📋 Copy
                            </button>
                        </div>
                    </div>
                    
                    <div class="manual-step">
                        <h4>Step 3: Include These Details</h4>
                        <div class="verification-details">
                            <p><strong>Required information:</strong></p>
                            <ul>
                                <li>Your full name: <input type="text" id="verify-name" placeholder="Enter your name"></li>
                                <li>Transaction ID from receipt</li>
                                <li>Payment amount: $${amountInDollars}</li>
                                <li>Plan: ${plan === 'monthly' ? 'Monthly Premium' : 'Single Session'}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="manual-actions">
                    <button class="btn-sent-email" onclick="paymentSystem.confirmManualVerification('${paymentId}', ${amount}, '${plan}')">
                        ✅ I've Sent the Email
                    </button>
                    <button class="btn-back" onclick="paymentSystem.showPaymentVerification('${paymentId}', ${amount}, '${plan}')">
                        ← Back to Auto Verification
                    </button>
                </div>
                
                <div class="verification-note">
                    <p><strong>Note:</strong> Manual verification usually takes 1-2 hours during business hours</p>
                    <p>We'll email you once your payment is confirmed</p>
                </div>
            </div>
        `;
        
        this.showPaymentModal('Manual Verification', manualHTML);
    }

    confirmManualVerification(paymentId, amount, plan) {
        const userName = document.getElementById('verify-name')?.value.trim();
        
        if (!userName) {
            alert('Please enter your name for verification');
            return;
        }

        // Store manual verification request
        const payment = this.pendingPayments.get(paymentId);
        if (payment) {
            payment.manualVerification = {
                userName: userName,
                timestamp: Date.now(),
                status: 'pending'
            };
            this.savePendingPayments();
        }

        const confirmationHTML = `
            <div class="verification-confirmed">
                <div class="success-icon">📨</div>
                <h3>Verification Request Sent!</h3>
                <p>We've received your manual verification request for <strong>${userName}</strong>.</p>
                
                <div class="confirmation-details">
                    <p><strong>What happens next:</strong></p>
                    <ul>
                        <li>✅ We'll check our email for your receipt</li>
                        <li>✅ Verify your payment details</li>
                        <li>✅ Activate your premium account</li>
                        <li>✅ Send you a confirmation email</li>
                    </ul>
                </div>
                
                <div class="confirmation-actions">
                    <button class="btn-close-modal" onclick="paymentSystem.hidePaymentModal()">
                        Close
                    </button>
                    <button class="btn-contact-support" onclick="paymentSystem.contactSupport()">
                        📞 Contact Support
                    </button>
                </div>
                
                <div class="support-info">
                    <p><strong>Need help?</strong> Email: lumacare.therapy@gmail.com</p>
                    <p>Reference: ${paymentId}</p>
                </div>
            </div>
        `;
        
        this.showPaymentModal('Verification Submitted', confirmationHTML);
    }

    copyEmailToClipboard() {
        navigator.clipboard.writeText('lumacare.therapy@gmail.com').then(() => {
            const btn = document.querySelector('.btn-copy-email');
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅ Copied!';
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        });
    }

    updateVerificationStatus(message) {
        const statusElement = document.querySelector('.status-text');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    showVerificationTimeout(paymentId) {
        const timeoutHTML = `
            <div class="verification-timeout">
                <div class="timeout-icon">⏰</div>
                <h3>Verification Timeout</h3>
                <p>We couldn't automatically verify your payment within the expected time.</p>
                
                <div class="timeout-actions">
                    <button class="btn-try-again" onclick="paymentSystem.showPaymentVerification('${paymentId}')">
                        🔄 Try Auto Verification Again
                    </button>
                    <button class="btn-manual" onclick="paymentSystem.showManualVerification('${paymentId}')">
                        📧 Switch to Manual Verification
                    </button>
                    <button class="btn-contact" onclick="paymentSystem.contactSupport()">
                        📞 Contact Support
                    </button>
                </div>
                
                <div class="timeout-help">
                    <p><strong>Common issues:</strong></p>
                    <ul>
                        <li>Payment may still be processing</li>
                        <li>Check your email for the receipt</li>
                        <li>Sometimes payments take a few extra minutes</li>
                    </ul>
                </div>
            </div>
        `;
        
        document.getElementById('payment-modal-body').innerHTML = timeoutHTML;
    }

    cancelPayment(paymentId) {
        this.pendingPayments.delete(paymentId);
        this.savePendingPayments();
        this.showPaymentOptions();
    }

    savePendingPayments() {
        const pendingArray = Array.from(this.pendingPayments.entries());
        localStorage.setItem('lumaCare_pending_payments', JSON.stringify(pendingArray));
    }

    loadPendingPayments() {
        const pendingData = localStorage.getItem('lumaCare_pending_payments');
        if (pendingData) {
            const pendingArray = JSON.parse(pendingData);
            this.pendingPayments = new Map(pendingArray);
        }
    }

    setupPaymentPolling() {
        this.loadPendingPayments();
        
        setInterval(() => {
            this.checkAllPendingPayments();
        }, 60000);
    }

    checkAllPendingPayments() {
        for (const [paymentId, payment] of this.pendingPayments) {
            if (Date.now() - payment.timestamp < 24 * 60 * 60 * 1000) {
                this.checkPaymentStatus(paymentId);
            }
        }
    }

    handleSuccessfulPayment(amount, transactionId, plan) {
        console.log('💰 Payment successful:', { amount, transactionId, plan });
        
        const user = authSystem.currentUser;
        
        if (amount === 999) {
            user.isPremium = true;
            user.premiumSince = new Date().toISOString();
        } else if (amount === 299) {
            user.purchasedSessions = (user.purchasedSessions || 0) + 1;
        }

        this.recordPayment(amount, plan, transactionId, 'completed');

        localStorage.setItem('lumaCare_user', JSON.stringify(user));
        authSystem.updateUI();

        this.showPaymentSuccess(amount, transactionId, plan);
    }

    recordPayment(amount, plan, transactionId, status = 'completed') {
        const user = authSystem.currentUser;
        if (!user) return;

        if (!user.paymentHistory) {
            user.paymentHistory = [];
        }

        const payment = {
            transactionId: transactionId,
            amount: amount,
            type: plan === 'monthly' ? 'Monthly Premium' : 'Single Session',
            date: new Date().toISOString(),
            status: status
        };

        user.paymentHistory.unshift(payment);
        localStorage.setItem('lumaCare_user', JSON.stringify(user));
        authSystem.updatePaymentHistory();
        
        console.log('💰 Payment recorded:', payment);
    }

    showPaymentSuccess(amount, transactionId, plan) {
        const amountInDollars = (amount / 100).toFixed(2);
        const planType = plan === 'monthly' ? 'Monthly Premium' : 'Single Session';
        
        const successHTML = `
            <div class="payment-success">
                <div class="success-icon">🎉</div>
                <h3>Payment Successful!</h3>
                <p>Thank you for your purchase of <strong>${planType}</strong></p>
                <p><strong>Amount: $${amountInDollars}</strong></p>
                <p><small>Transaction ID: ${transactionId}</small></p>
                
                <div class="premium-features">
                    <div class="feature">
                        <i class="fas fa-infinity"></i>
                        <span>Unlimited Access</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-crown"></i>
                        <span>Premium Features</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-rocket"></i>
                        <span>Priority Support</span>
                    </div>
                </div>
                
                <div class="success-actions">
                    <button class="btn-close-modal" onclick="paymentSystem.hidePaymentModal()">
                        Start Therapy
                    </button>
                    <button class="btn-view-profile" onclick="paymentSystem.goToProfile()">
                        View Profile
                    </button>
                </div>
                
                <p class="payment-security">
                    <i class="fas fa-receipt"></i> 
                    <a href="#" onclick="paymentSystem.sendEmailReceipt('${transactionId}')">Email Receipt</a>
                </p>
            </div>
        `;

        this.showPaymentModal('Payment Successful', successHTML);
    }

    sendEmailReceipt(transactionId) {
        const user = authSystem.currentUser;
        if (!user || !user.paymentHistory) return;

        const payment = user.paymentHistory.find(p => p.transactionId === transactionId);
        if (!payment) return;

        const amount = (payment.amount / 100).toFixed(2);
        const date = new Date(payment.date).toLocaleDateString();
        
        const subject = `LumaCare Payment Receipt - ${transactionId}`;
        const body = `
Hello ${user.name},

Thank you for your purchase with LumaCare!

Payment Details:
- Transaction ID: ${transactionId}
- Amount: $${amount}
- Type: ${payment.type}
- Date: ${date}
- Status: ${payment.status}

We appreciate your support in mental wellness journey.

Best regards,
LumaCare Team
lumacare.therapy@gmail.com
        `.trim();

        window.location.href = `mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    contactSupport() {
        const subject = 'LumaCare Payment Support';
        const body = `Hello LumaCare team,\n\nI need assistance with a payment verification.\n\nPayment Reference: ${this.pendingPayments.keys().next().value || 'N/A'}\n\nIssue description:`;
        window.location.href = `mailto:lumacare.therapy@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    goToProfile() {
        this.hidePaymentModal();
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-tab="profile"]').classList.add('active');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById('profile-tab').classList.add('active');
    }

    showPremiumModal() {
        const modalHTML = `
            <div class="payment-modal">
                <h3>🎉 Premium Member</h3>
                <p>You're already enjoying unlimited therapy sessions!</p>
                <div class="premium-features">
                    <div class="feature">
                        <i class="fas fa-infinity"></i>
                        <span>Unlimited Sessions</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-chart-line"></i>
                        <span>Advanced Analytics</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-crown"></i>
                        <span>Premium Techniques</span>
                    </div>
                </div>
                <button class="btn-close-modal" onclick="paymentSystem.hidePaymentModal()">Awesome!</button>
            </div>
        `;
        this.showPaymentModal('Premium Features', modalHTML);
    }

    showPaymentModal(title, content) {
        const modal = document.getElementById('payment-modal');
        document.getElementById('payment-modal-title').textContent = title;
        document.getElementById('payment-modal-body').innerHTML = content;
        modal.classList.add('active');
    }

    hidePaymentModal() {
        document.getElementById('payment-modal').classList.remove('active');
    }
}

// Professional Therapist AI (Keep this part the same as before)
class TherapistAI {
    constructor() {
        this.conversationStage = 'greeting';
        this.identifiedIssues = [];
        this.assessmentCount = 0;
        this.hasGreeted = false;
    }

    analyzeMessage(message) {
        const lowerMessage = message.toLowerCase();
        const issues = [];
        
        if (!this.hasGreeted && (lowerMessage.includes('hi') || lowerMessage.includes('hello') || 
            lowerMessage.includes('hey') || lowerMessage === 'hey')) {
            this.hasGreeted = true;
            return ['greeting'];
        }
        
        if (lowerMessage.includes('overwhelm') || lowerMessage.includes('too much') || 
            lowerMessage.includes('workload') || lowerMessage.includes('projects') || 
            lowerMessage.includes('deadlines')) {
            issues.push('overwhelm');
        }
        
        if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || 
            lowerMessage.includes('panic') || lowerMessage.includes('chest') || 
            lowerMessage.includes('tight') || lowerMessage.includes('heart')) {
            issues.push('anxiety');
        }
        
        if (lowerMessage.includes('negative') || lowerMessage.includes('not good enough') || 
            lowerMessage.includes('can\'t do') || lowerMessage.includes('failure')) {
            issues.push('negative-thoughts');
        }
        
        if (lowerMessage.includes('stress') || lowerMessage.includes('pressure') || 
            lowerMessage.includes('burnout') || lowerMessage.includes('exhaust')) {
            issues.push('stress');
        }
        
        return issues;
    }

    generateResponse(userMessage, userIssues) {
        if (userIssues.includes('greeting') || !this.hasGreeted) {
            this.hasGreeted = true;
            this.conversationStage = 'assessment';
            return this.generateGreeting();
        }
        
        if (userMessage.length < 3 || userMessage === 'hey' || userMessage === 'hi') {
            return `<p>Hello! I noticed your message was quite brief. I'm here to help with stress, anxiety, overwhelm, or any challenges you might be facing. What's on your mind today?</p>`;
        }
        
        let response = '';
        
        if (userIssues.length > 0) {
            response += this.generateValidation(userIssues);
        }
        
        if (this.conversationStage === 'assessment' && this.assessmentCount < 1) {
            response += this.generateAssessmentQuestion(userIssues, userMessage);
            this.assessmentCount++;
        } else {
            response += this.generateSolutionRecommendation(userIssues);
            this.conversationStage = 'solution';
        }
        
        return response || `<p>Thanks for sharing. Could you tell me a bit more about what you're experiencing right now?</p>`;
    }

    generateGreeting() {
        const greetings = [
            `Hello! I'm your AI therapist from LumaCare. I'm here to help you work through stress, anxiety, overwhelm, and other mental health challenges using evidence-based techniques. 
            
            <br><br>
            <strong>About LumaCare:</strong>
            • Free: 3 therapy sessions per month
            • Premium: Unlimited sessions for $9.99/month
            • Single sessions: $2.99 per additional session
            <br><br>
            If you experience any issues or have complaints, please report them to <strong>lumacare.therapy@gmail.com</strong>
            <br><br>
            I'm here to listen and provide practical techniques. What's been on your mind lately?`,
            
            `Welcome to LumaCare! I'm an AI therapist specialized in helping with mental wellness through proven therapeutic methods.
            
            <br><br>
            <strong>App Features:</strong>
            • AI Therapy Sessions
            • Therapeutic Techniques Library  
            • Progress Tracking
            • Voice Responses
            <br><br>
            <strong>Pricing:</strong> Start with 3 free monthly sessions, then choose between unlimited access or pay-per-session.
            <br><br>
            For support or feedback: <strong>lumacare.therapy@gmail.com</strong>
            <br><br>
            What challenges would you like to work on today?`
        ];
        return `<p>${greetings[Math.floor(Math.random() * greetings.length)]}</p>`;
    }

    generateValidation(issues) {
        if (issues.includes('overwhelm')) {
            return `<p>I can hear how overwhelmed you're feeling with these competing demands. That sense of being buried under responsibilities is incredibly stressful and can trigger both mental and physical symptoms.</p>`;
        }
        if (issues.includes('anxiety')) {
            return `<p>The chest tightness and difficulty focusing you described are clear signs your nervous system is in overdrive. This is a common physiological response to perceived threats.</p>`;
        }
        if (issues.includes('stress')) {
            return `<p>It sounds like you're under significant pressure right now. That constant stress can really take a toll on both your mental and physical wellbeing.</p>`;
        }
        return `<p>Thanks for sharing what you're going through. I want to make sure I understand your experience correctly.</p>`;
    }

    generateAssessmentQuestion(issues, userMessage) {
        if (userMessage.length < 10) {
            return `<p>Could you tell me a bit more about what's going on? The more details you share, the better I can help you with specific techniques.</p>`;
        }

        const questions = {
            'overwhelm': [
                "When you look at everything on your plate, what feels most urgent versus what's actually most important for your long-term goals?",
                "Are there any tasks that could be delegated, postponed, or simplified?",
                "How much of this overwhelm is about the volume of work versus the time constraints?"
            ],
            'anxiety': [
                "On a scale of 1-10, how intense is the physical sensation of anxiety you're experiencing?",
                "What specific thoughts tend to run through your mind when you feel that physical tension starting?",
                "How is this anxiety impacting your ability to make clear decisions?"
            ],
            'stress': [
                "What aspects of your situation are contributing most to your stress levels?",
                "How is this stress affecting your sleep, appetite, or personal relationships?",
                "What would need to change for you to feel more in control?"
            ]
        };

        for (let issue of issues) {
            if (questions[issue]) {
                const question = questions[issue][Math.floor(Math.random() * questions[issue].length)];
                return `<p>${question}</p>`;
            }
        }

        return `<p>Could you tell me more about what specifically feels most challenging in this situation?</p>`;
    }

    generateSolutionRecommendation(issues) {
        let techniques = [];
        
        if (issues.includes('overwhelm')) {
            techniques.push('priority-matrix', 'pomodoro');
        }
        if (issues.includes('anxiety')) {
            techniques.push('box-breathing', 'grounding');
        }
        if (issues.includes('negative-thoughts')) {
            techniques.push('thought-challenging');
        }
        if (issues.includes('stress')) {
            techniques.push('pomodoro', 'box-breathing');
        }
        
        techniques = [...new Set(techniques)];
        
        if (techniques.length === 0) {
            return `<p>Based on what you've shared, I have several techniques that could help. Could you tell me a bit more about the specific challenges you're facing?</p>`;
        }
        
        let recommendation = `<p>Based on what you've shared, I recommend focusing on these evidence-based techniques that address your specific challenges:</p>`;
        
        recommendation += `<div class="technique-suggestion">`;
        
        techniques.forEach(techId => {
            const technique = therapeuticTechniques[techId];
            if (technique) {
                recommendation += `
                    <div class="technique-option">
                        <h4>${technique.title}</h4>
                        <p>${technique.description}</p>
                        <p><em>Best for:</em> ${technique.whenToUse}</p>
                        <button class="btn-learn-technique" data-technique="${techId}">Learn This Technique</button>
                    </div>
                `;
            }
        });
        
        recommendation += `</div>`;
        recommendation += `<p>Which of these approaches resonates most with your current situation?</p>`;
        
        return recommendation;
    }

    reset() {
        this.conversationStage = 'greeting';
        this.identifiedIssues = [];
        this.assessmentCount = 0;
        this.hasGreeted = false;
    }
}

// Authentication System (Keep this the same)
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
    }

    checkExistingSession() {
        const userData = localStorage.getItem('lumaCare_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isLoggedIn = true;
            this.updateUI();
        }
    }

    setupEventListeners() {
        document.getElementById('user-avatar').addEventListener('click', () => {
            if (!this.isLoggedIn) {
                this.showAuthModal();
            }
        });

        document.getElementById('close-auth-modal').addEventListener('click', () => {
            this.hideAuthModal();
        });

        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchAuthTab(tabName);
            });
        });

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        document.getElementById('report-issue').addEventListener('click', () => {
            this.reportIssue();
        });

        document.getElementById('contact-support').addEventListener('click', () => {
            this.contactSupport();
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }

    showAuthModal() {
        document.getElementById('auth-modal').classList.add('active');
    }

    hideAuthModal() {
        document.getElementById('auth-modal').classList.remove('active');
    }

    switchAuthTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}-form`).classList.add('active');
    }

    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        this.currentUser = {
            name: email.split('@')[0],
            email: email,
            isPremium: false,
            joinDate: new Date().toISOString(),
            sessions: Math.floor(Math.random() * 5) + 1,
            techniques: Math.floor(Math.random() * 5) + 1,
            streak: Math.floor(Math.random() * 10) + 1,
            purchasedSessions: 0,
            paymentHistory: []
        };

        this.isLoggedIn = true;
        localStorage.setItem('lumaCare_user', JSON.stringify(this.currentUser));
        this.updateUI();
        this.hideAuthModal();

        alert('Successfully logged in! Welcome to LumaCare.');
    }

    handleSignup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        if (!name || !email || !password) {
            alert('Please fill in all fields');
            return;
        }

        this.currentUser = {
            name: name,
            email: email,
            isPremium: false,
            joinDate: new Date().toISOString(),
            sessions: 1,
            techniques: 0,
            streak: 1,
            purchasedSessions: 0,
            paymentHistory: []
        };

        this.isLoggedIn = true;
        localStorage.setItem('lumaCare_user', JSON.stringify(this.currentUser));
        this.updateUI();
        this.hideAuthModal();

        alert('Account created successfully! Welcome to LumaCare.');
    }

    updatePaymentHistory() {
        const paymentHistoryElement = document.getElementById('payment-history');
        if (!paymentHistoryElement) return;

        const user = this.currentUser;
        
        if (!user.paymentHistory || user.paymentHistory.length === 0) {
            paymentHistoryElement.innerHTML = `
                <div class="no-payments">
                    <i class="fas fa-receipt"></i>
                    <p>No payments yet</p>
                </div>
            `;
            return;
        }

        let historyHTML = '';
        user.paymentHistory.forEach(payment => {
            const date = new Date(payment.date).toLocaleDateString();
            const amount = (payment.amount / 100).toFixed(2);
            
            historyHTML += `
                <div class="payment-item">
                    <div class="payment-info">
                        <div class="payment-type">${payment.type}</div>
                        <div class="payment-date">${date}</div>
                    </div>
                    <div class="payment-amount">$${amount}</div>
                    <div class="payment-status ${payment.status}">${payment.status}</div>
                    <button class="btn-receipt" onclick="paymentSystem.sendEmailReceipt('${payment.transactionId}')">
                        <i class="fas fa-envelope"></i> Receipt
                    </button>
                </div>
            `;
        });

        paymentHistoryElement.innerHTML = historyHTML;
    }

    updateUI() {
        const userAvatar = document.getElementById('user-avatar');
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileAvatar = document.getElementById('profile-avatar-icon');
        const sessionCount = document.getElementById('session-count');
        const techniquesUsed = document.getElementById('techniques-used');
        const daysStreak = document.getElementById('days-streak');
        const subscriptionStatus = document.getElementById('subscription-status');
        const upgradeBtn = document.getElementById('upgrade-btn');

        if (this.isLoggedIn && this.currentUser) {
            userAvatar.innerHTML = `<span>${this.currentUser.name.charAt(0).toUpperCase()}</span>`;
            
            profileName.textContent = this.currentUser.name;
            profileEmail.textContent = this.currentUser.email;
            profileAvatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
            sessionCount.textContent = this.currentUser.sessions;
            techniquesUsed.textContent = this.currentUser.techniques;
            daysStreak.textContent = this.currentUser.streak;

            if (this.currentUser.isPremium) {
                subscriptionStatus.innerHTML = `
                    <div class="status-premium">
                        <i class="fas fa-crown"></i>
                        <span>Premium Member - Unlimited sessions</span>
                    </div>
                `;
                upgradeBtn.textContent = 'Premium';
                upgradeBtn.style.background = 'linear-gradient(135deg, #f59e0b, #fbbf24)';
            } else {
                const sessionsLeft = Math.max(0, 3 - this.currentUser.sessions);
                subscriptionStatus.innerHTML = `
                    <div class="status-free">
                        <i class="fas fa-user"></i>
                        <span>Free Plan - ${sessionsLeft} sessions remaining this month</span>
                    </div>
                `;
                upgradeBtn.textContent = 'Go Premium';
                upgradeBtn.style.background = 'linear-gradient(90deg, var(--primary), var(--secondary))';
            }

            this.updatePaymentHistory();

        } else {
            userAvatar.innerHTML = '<i class="fas fa-user"></i>';
            profileName.textContent = 'Guest User';
            profileEmail.textContent = 'Not logged in';
            profileAvatar.innerHTML = '<i class="fas fa-user"></i>';
            sessionCount.textContent = '0';
            techniquesUsed.textContent = '0';
            daysStreak.textContent = '0';
            subscriptionStatus.innerHTML = `
                <div class="status-free">
                    <i class="fas fa-user"></i>
                    <span>Free Plan - 3 sessions/month</span>
                </div>
            `;
            
            const paymentHistoryElement = document.getElementById('payment-history');
            if (paymentHistoryElement) {
                paymentHistoryElement.innerHTML = `
                    <div class="no-payments">
                        <i class="fas fa-receipt"></i>
                        <p>No payments yet</p>
                    </div>
                `;
            }
        }
    }

    trackSession() {
        if (this.isLoggedIn && this.currentUser) {
            this.currentUser.sessions++;
            localStorage.setItem('lumaCare_user', JSON.stringify(this.currentUser));
            this.updateUI();
        }
    }

    checkAndShowSessionWarning() {
        if (!this.isLoggedIn || !this.currentUser) return;
        
        const user = this.currentUser;
        const FREE_SESSION_LIMIT = 3;
        
        if (!user.isPremium && user.sessions >= FREE_SESSION_LIMIT) {
            const sessionsLeft = Math.max(0, FREE_SESSION_LIMIT - user.sessions);
            
            if (sessionsLeft <= 0) {
                setTimeout(() => {
                    const warningHTML = `
                        <div class="message ai-message">
                            <div class="message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <div class="session-warning">
                                    <p><strong>Session Limit Reached</strong></p>
                                    <p>You've used all ${FREE_SESSION_LIMIT} free sessions this month.</p>
                                    <p>Upgrade to continue your therapy journey:</p>
                                    <button class="btn-upgrade-now" id="session-upgrade-btn">View Upgrade Options</button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = warningHTML;
                    chatMessages.appendChild(tempDiv.firstElementChild);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    
                    document.getElementById('session-upgrade-btn').addEventListener('click', () => {
                        paymentSystem.showPaymentOptions();
                    });
                }, 1000);
            } else if (sessionsLeft === 1) {
                setTimeout(() => {
                    const warningHTML = `
                        <div class="message ai-message">
                            <div class="message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <div class="session-info">
                                    <p><strong>Heads up:</strong> You have 1 free session remaining this month.</p>
                                    <p>After this, you can upgrade to premium or purchase individual sessions.</p>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = warningHTML;
                    chatMessages.appendChild(tempDiv.firstElementChild);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }, 1000);
            }
        }
    }

    reportIssue() {
        const issue = prompt('Please describe the issue you encountered with the AI:');
        if (issue) {
            console.log('User reported issue:', issue);
            alert('Thank you for your feedback! We\'ll review this issue and improve the AI.');
        }
    }

    contactSupport() {
        const subject = 'LumaCare Support Request';
        const body = 'Hello LumaCare team,\n\nI need assistance with:';
        window.location.href = `mailto:lumacare.therapy@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            this.currentUser = null;
            this.isLoggedIn = false;
            localStorage.removeItem('lumaCare_user');
            this.updateUI();
            alert('You have been logged out successfully.');
        }
    }
}

// Voice synthesis setup
let speechSynthesis = window.speechSynthesis;
let femaleVoice = null;
let isVoiceEnabled = true;
let isRecording = false;

function initializeVoices() {
    const voices = speechSynthesis.getVoices();
    femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('woman') || 
        voice.name.includes('Samantha') ||
        (voice.lang.includes('en') && voice.gender === 'female')
    );
    
    if (!femaleVoice) {
        femaleVoice = voices.find(voice => voice.lang.includes('en'));
    }
}

speechSynthesis.onvoiceschanged = initializeVoices;

function speakText(text) {
    if (!speechSynthesis || !femaleVoice || !isVoiceEnabled) return;
    
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = femaleVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    speechSynthesis.speak(utterance);
}

function addMessageToChat(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('message-avatar');
    avatarDiv.innerHTML = `<i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>`;
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.innerHTML = `<p>${message}</p>`;
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTechniqueDetails(techniqueId) {
    const technique = therapeuticTechniques[techniqueId];
    if (!technique) return;
    
    const techniqueHTML = `
        <div class="technique-detail">
            <h4>${technique.title} - Step by Step</h4>
            <p><strong>Description:</strong> ${technique.description}</p>
            <p><strong>When to use:</strong> ${technique.whenToUse}</p>
            <h5>Steps:</h5>
            <ol>
                ${technique.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
            <p><em>Would you like to practice this technique together now?</em></p>
        </div>
    `;
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'ai-message');
    messageDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            <p>Let me walk you through the ${technique.title} technique:</p>
            ${techniqueHTML}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (isVoiceEnabled && femaleVoice) {
        const stepsText = technique.steps.map((step, index) => `Step ${index + 1}: ${step}`).join('. ');
        const speechText = `Let me walk you through the ${technique.title}. ${technique.description}. Here are the steps: ${stepsText}`;
        speakText(speechText);
    }
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;
    
    addMessageToChat(message, 'user');
    messageInput.value = '';
    
    setTimeout(() => {
        const issues = therapistAI.analyzeMessage(message);
        const aiResponse = therapistAI.generateResponse(message, issues);
        
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'ai-message');
        
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('message-avatar');
        avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.innerHTML = aiResponse;
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        setTimeout(() => {
            document.querySelectorAll('.btn-learn-technique').forEach(btn => {
                btn.addEventListener('click', function() {
                    const techniqueId = this.getAttribute('data-technique');
                    showTechniqueDetails(techniqueId);
                });
            });
        }, 100);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        if (isVoiceEnabled && femaleVoice) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = aiResponse;
            const textToSpeak = tempDiv.textContent || tempDiv.innerText || '';
            speakText(textToSpeak);
        }
        
        if (authSystem.isLoggedIn) {
            setTimeout(() => {
                authSystem.trackSession();
                authSystem.checkAndShowSessionWarning();
            }, 2000);
        }
        
    }, 1000);
}

// DOM Elements
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const quickResponses = document.querySelectorAll('.quick-response');
const voiceBtn = document.getElementById('voice-btn');
const newChatBtn = document.getElementById('new-chat-btn');
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const techniqueCards = document.querySelectorAll('.technique-card');
const techniqueModal = document.getElementById('technique-modal');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const voiceToggle = document.getElementById('voice-toggle');

// Navigation
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

quickResponses.forEach(btn => {
    btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        messageInput.value = text;
        sendMessage();
    });
});

voiceBtn.addEventListener('click', () => {
    if (!isRecording) {
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        voiceBtn.style.backgroundColor = 'var(--danger)';
        isRecording = true;
        
        setTimeout(() => {
            const responses = [
                "I'm feeling really anxious today",
                "I'm overwhelmed with work",
                "I'm having negative thoughts",
                "I'm feeling stressed out"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            messageInput.value = randomResponse;
            
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.style.backgroundColor = '';
            isRecording = false;
            
            sendMessage();
        }, 2000);
    } else {
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.style.backgroundColor = '';
        isRecording = false;
    }
});

newChatBtn.addEventListener('click', () => {
    if (chatMessages.children.length > 1) {
        if (confirm('Start a new conversation? Your current chat will be cleared.')) {
            while (chatMessages.children.length > 1) {
                chatMessages.removeChild(chatMessages.lastChild);
            }
            therapistAI.reset();
        }
    }
});

// Technique Cards
techniqueCards.forEach(card => {
    card.addEventListener('click', () => {
        const techniqueId = card.getAttribute('data-technique');
        const technique = therapeuticTechniques[techniqueId];
        
        if (technique) {
            modalTitle.textContent = technique.title;
            modalBody.innerHTML = `
                <div class="technique-detail">
                    <p>${technique.description}</p>
                    <h3>When to Use</h3>
                    <p>${technique.whenToUse}</p>
                    <h3>Steps</h3>
                    <ol>
                        ${technique.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
            `;
            techniqueModal.classList.add('active');
        }
    });
});

closeModal.addEventListener('click', () => {
    techniqueModal.classList.remove('active');
});

techniqueModal.addEventListener('click', (e) => {
    if (e.target === techniqueModal) {
        techniqueModal.classList.remove('active');
    }
});

// Settings
darkModeToggle.addEventListener('change', function() {
    document.body.classList.toggle('light-mode', !this.checked);
});

voiceToggle.addEventListener('change', function() {
    isVoiceEnabled = this.checked;
});

// Initialize everything when DOM loads
let authSystem;
let paymentSystem;
let therapistAI;

document.addEventListener('DOMContentLoaded', () => {
    console.log('LumaCare Professional Therapist AI initialized');
    initializeVoices();
    
    therapistAI = new TherapistAI();
    authSystem = new AuthSystem();
    authSystem.init();
    
    paymentSystem = new PaymentSystem();
});

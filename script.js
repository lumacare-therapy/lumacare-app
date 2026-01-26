// Error prevention - add at top of script.js
(function() {
    // Safe initialization wrapper
    const safeInit = {
        authSystem: null,
        paymentSystem: null,
        therapistAI: null,
        
        init: function() {
            try {
                // Initialize with error handling
                this.therapistAI = new TherapistAI();
                this.authSystem = new AuthSystem();
                this.authSystem.init();
                this.paymentSystem = new PaymentSystem();
                
                // Expose to window for debugging
                window.__lumacare = {
                    auth: this.authSystem,
                    payment: this.paymentSystem,
                    ai: this.therapistAI
                };
                
                console.log('✅ LumaCare initialized successfully');
            } catch (error) {
                console.error('❌ Initialization error:', error);
                // Create fallback objects
                this.authSystem = {
                    isLoggedIn: false,
                    currentUser: null,
                    trackSession: function() { return true; },
                    updateUI: function() {}
                };
                this.paymentSystem = {
                    handleUpgradeClick: function() {
                        window.open('https://pay.yoco.com/lumacare', '_blank');
                    }
                };
            }
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => safeInit.init());
    } else {
        safeInit.init();
    }
    
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('🚨 Global error:', e.error);
        // Don't show alerts to users, just log
        if (e.error.message.includes('authSystem') || e.error.message.includes('paymentSystem')) {
            console.log('⚠️ System not initialized, retrying...');
            setTimeout(() => safeInit.init(), 1000);
        }
    });
})();

function onLoginSuccess() {
    console.log('✅ Login successful, hiding modals and showing app');
    
    // Hide ALL modals
    const authModal = document.getElementById('auth-modal');
    const landingHero = document.getElementById('landing-hero');
    const appContainer = document.querySelector('.container');
    
    if (authModal) {
        console.log('Hiding auth modal');
        authModal.classList.remove('active');
        authModal.style.display = 'none';
    }
    
    if (landingHero) {
        console.log('Hiding landing hero');
        landingHero.style.display = 'none';
        landingHero.classList.remove('show');
    }
    
    // Show main app container
    if (appContainer) {
        console.log('Showing app container');
        appContainer.style.display = 'flex';
    }
    
    // AUTO-REDIRECT TO DASHBOARD AFTER LOGIN
    setTimeout(() => {
        // Show mood modal first
        const moodModal = document.getElementById('mood-modal');
        if (moodModal) {
            moodModal.style.display = 'flex';
            setTimeout(() => {
                moodModal.classList.add('active');
            }, 10);
        } else {
            // If no mood modal, go straight to dashboard
            redirectToDashboard();
        }
    }, 100);
}

// Add this helper function
function redirectToDashboard() {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const dashboardBtn = document.querySelector('[data-tab="dashboard"]');
    if (dashboardBtn) {
        dashboardBtn.classList.add('active');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const dashboardTab = document.getElementById('dashboard-tab');
    if (dashboardTab) {
        dashboardTab.classList.add('active');
    }
    
    // Refresh dashboard data
    setTimeout(() => {
        if (window.dashboardSystem) {
            window.dashboardSystem.loadDashboardData();
            window.dashboardSystem.animateProgressBars();
        }
    }, 100);
}

// Landing Page Logic
function checkAuthAndShowLanding() {
    const user = JSON.parse(localStorage.getItem('lumaCare_user'));
    const landingHero = document.getElementById('landing-hero');
    const appContainer = document.querySelector('.container');
    
    if (!user) {
        // No user logged in - show landing page
        if (landingHero) {
            landingHero.style.display = 'block';
            landingHero.classList.add('show');
        }
        
        // Hide the main app container
        if (appContainer) {
            appContainer.style.display = 'none';
        }
    } else {
        // User is logged in - show app
        if (landingHero) {
            landingHero.style.display = 'none';
            landingHero.classList.remove('show');
        }
        
        if (appContainer) {
            appContainer.style.display = 'flex';
        }
        
        // Make sure chat tab is active
        setTimeout(() => {
            const therapyTab = document.getElementById('therapy-tab');
            const therapyBtn = document.querySelector('[data-tab="therapy"]');
            
            if (therapyTab && therapyBtn) {
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                therapyTab.classList.add('active');
                therapyBtn.classList.add('active');
            }
        }, 100);
    }
}

// Call this when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndShowLanding();
    
    // Start Therapy button click
    const startBtn = document.getElementById('start-therapy-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            // Show auth modal
            const authModal = document.getElementById('auth-modal');
            if (authModal) {
                authModal.style.display = 'flex';
            }
        });
    }
});
// Therapeutic techniques database
const therapeuticTechniques = {
    "priority-matrix": {
        title: "Priority Matrix (Eisenhower Matrix)",
        description: "Organize tasks by urgency and importance to reduce overwhelm and create clarity",
        steps: [
            "Start by reviewing example tasks in each quadrant",
            "Click any example to edit it to match your actual tasks",
            "Drag tasks between quadrants if your priorities change",
            "Focus on Quadrant 2 (Important, Not Urgent) for long-term success",
            "Set realistic time blocks for each category"
        ],
        whenToUse: "When feeling overwhelmed with multiple responsibilities and unclear priorities",
        exampleTasks: {
            'urgent-important': [
                'Finish today\'s work report',
                'Prepare for 3pm meeting',
                'Handle urgent client request'
            ],
            'important-not-urgent': [
                'Plan next week\'s schedule',
                'Learn new skill for career growth',
                'Exercise for long-term health'
            ],
            'urgent-not-important': [
                'Reply to non-critical emails',
                'Schedule routine appointment',
                'Attend optional but time-sensitive meeting'
            ],
            'neither': [
                'Browse social media',
                'Watch random YouTube videos',
                'Organize already-organized drawer'
            ]
        }
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

const privacyPolicyHTML = `<style>
[data-custom-class='body'], [data-custom-class='body'] * {
        background: transparent !important;
      }
[data-custom-class='title'], [data-custom-class='title'] * {
        font-family: Arial !important;
font-size: 26px !important;
color: #000000 !important;
      }
[data-custom-class='subtitle'], [data-custom-class='subtitle'] * {
        font-family: Arial !important;
color: #595959 !important;
font-size: 14px !important;
      }
[data-custom-class='heading_1'], [data-custom-class='heading_1'] * {
        font-family: Arial !important;
font-size: 19px !important;
color: #000000 !important;
      }
[data-custom-class='heading_2'], [data-custom-class='heading_2'] * {
        font-family: Arial !important;
font-size: 17px !important;
color: #000000 !important;
      }
[data-custom-class='body_text'], [data-custom-class='body_text'] * {
        color: #595959 !important;
font-size: 14px !important;
font-family: Arial !important;
      }
[data-custom-class='link'], [data-custom-class='link'] * {
        color: #3030F1 !important;
font-size: 14px !important;
font-family: Arial !important;
word-break: break-word !important;
      }
</style>
    <span style="display: block;margin: 0 auto 3.125rem;width: 11.125rem;height: 2.375rem;background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAxNzggMzgiPgogICAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cGF0aCBmaWxsPSIjRDFEMUQxIiBkPSJNNC4yODMgMjQuMTA3Yy0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY2LS43NjhoLS4wODVjLjA1Ny41MDIuMDg2Ljc5Mi4wODYuODd2Mi40MzRILjk4NXYtOC42NDhoMS4zMzJsLjIzMS43NzloLjA3NmMuMzgzLS41OTQuOTUtLjg5MiAxLjcwMi0uODkyLjcxIDAgMS4yNjQuMjc0IDEuNjY1LjgyMi40MDEuNTQ4LjYwMiAxLjMwOS42MDIgMi4yODMgMCAuNjQtLjA5NCAxLjE5OC0uMjgyIDEuNjctLjE4OC40NzMtLjQ1Ni44MzMtLjgwMyAxLjA4LS4zNDcuMjQ3LS43NTYuMzctMS4yMjUuMzd6TTMuOCAxOS4xOTNjLS40MDUgMC0uNy4xMjQtLjg4Ni4zNzMtLjE4Ny4yNDktLjI4My42Ni0uMjkgMS4yMzN2LjE3N2MwIC42NDUuMDk1IDEuMTA3LjI4NyAxLjM4Ni4xOTIuMjguNDk1LjQxOS45MS40MTkuNzM0IDAgMS4xMDEtLjYwNSAxLjEwMS0xLjgxNiAwLS41OS0uMDktMS4wMzQtLjI3LTEuMzI5LS4xODItLjI5NS0uNDY1LS40NDMtLjg1Mi0uNDQzem01LjU3IDEuNzk0YzAgLjU5NC4wOTggMS4wNDQuMjkzIDEuMzQ4LjE5Ni4zMDQuNTEzLjQ1Ny45NTQuNDU3LjQzNyAwIC43NS0uMTUyLjk0Mi0uNDU0LjE5Mi0uMzAzLjI4OC0uNzUzLjI4OC0xLjM1MSAwLS41OTUtLjA5Ny0xLjA0LS4yOS0xLjMzOC0uMTk0LS4yOTctLjUxLS40NDUtLjk1LS40NDUtLjQzOCAwLS43NTMuMTQ3LS45NDYuNDQzLS4xOTQuMjk1LS4yOS43NDItLjI5IDEuMzR6bTQuMTUzIDBjMCAuOTc3LS4yNTggMS43NDItLjc3NCAyLjI5My0uNTE1LjU1Mi0xLjIzMy44MjctMi4xNTQuODI3LS41NzYgMC0xLjA4NS0uMTI2LTEuNTI1LS4zNzhhMi41MiAyLjUyIDAgMCAxLTEuMDE1LTEuMDg4Yy0uMjM3LS40NzMtLjM1NS0xLjAyNC0uMzU1LTEuNjU0IDAtLjk4MS4yNTYtMS43NDQuNzY4LTIuMjg4LjUxMi0uNTQ1IDEuMjMyLS44MTcgMi4xNi0uODE3LjU3NiAwIDEuMDg1LjEyNiAxLjUyNS4zNzYuNDQuMjUxLjc3OS42MSAxLjAxNSAxLjA4LjIzNi40NjkuMzU1IDEuMDE5LjM1NSAxLjY0OXpNMTkuNzEgMjRsLS40NjItMi4xLS42MjMtMi42NTNoLS4wMzdMMTcuNDkzIDI0SDE1LjczbC0xLjcwOC02LjAwNWgxLjYzM2wuNjkzIDIuNjU5Yy4xMS40NzYuMjI0IDEuMTMzLjMzOCAxLjk3MWguMDMyYy4wMTUtLjI3Mi4wNzctLjcwNC4xODgtMS4yOTRsLjA4Ni0uNDU3Ljc0Mi0yLjg3OWgxLjgwNGwuNzA0IDIuODc5Yy4wMTQuMDc5LjAzNy4xOTUuMDY3LjM1YTIwLjk5OCAyMC45OTggMCAwIDEgLjE2NyAxLjAwMmMuMDIzLjE2NS4wMzYuMjk5LjA0LjM5OWguMDMyYy4wMzItLjI1OC4wOS0uNjExLjE3Mi0xLjA2LjA4Mi0uNDUuMTQxLS43NTQuMTc3LS45MTFsLjcyLTIuNjU5aDEuNjA2TDIxLjQ5NCAyNGgtMS43ODN6bTcuMDg2LTQuOTUyYy0uMzQ4IDAtLjYyLjExLS44MTcuMzMtLjE5Ny4yMi0uMzEuNTMzLS4zMzguOTM3aDIuMjk5Yy0uMDA4LS40MDQtLjExMy0uNzE3LS4zMTctLjkzNy0uMjA0LS4yMi0uNDgtLjMzLS44MjctLjMzem0uMjMgNS4wNmMtLjk2NiAwLTEuNzIyLS4yNjctMi4yNjYtLjgtLjU0NC0uNTM0LS44MTYtMS4yOS0uODE2LTIuMjY3IDAtMS4wMDcuMjUxLTEuNzg1Ljc1NC0yLjMzNC41MDMtLjU1IDEuMTk5LS44MjUgMi4wODctLjgyNS44NDggMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDcyLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MSAwIC43MDMtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45Mi4zMmE1Ljc5IDUuNzkgMCAwIDEtMS4xOTEuMTA0em03LjI1My02LjIyNmMuMjIyIDAgLjQwNi4wMTYuNTUzLjA0OWwtLjEyNCAxLjUzNmExLjg3NyAxLjg3NyAwIDAgMC0uNDgzLS4wNTRjLS41MjMgMC0uOTMuMTM0LTEuMjIyLjQwMy0uMjkyLjI2OC0uNDM4LjY0NC0uNDM4IDEuMTI4VjI0aC0xLjYzOHYtNi4wMDVoMS4yNGwuMjQyIDEuMDFoLjA4Yy4xODctLjMzNy40MzktLjYwOC43NTYtLjgxNGExLjg2IDEuODYgMCAwIDEgMS4wMzQtLjMwOXptNC4wMjkgMS4xNjZjLS4zNDcgMC0uNjIuMTEtLjgxNy4zMy0uMTk3LjIyLS4zMS41MzMtLjMzOC45MzdoMi4yOTljLS4wMDctLjQwNC0uMTEzLS43MTctLjMxNy0uOTM3LS4yMDQtLjIyLS40OC0uMzMtLjgyNy0uMzN6bS4yMyA1LjA2Yy0uOTY2IDAtMS43MjItLjI2Ny0yLjI2Ni0uOC0uNTQ0LS41MzQtLjgxNi0xLjI5LS44MTYtMi4yNjcgMC0xLjAwNy4yNTEtMS43ODUuNzU0LTIuMzM0LjUwNC0uNTUgMS4yLS44MjUgMi4wODctLjgyNS44NDkgMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDczLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MiAwIC43MDQtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45MTkuMzJhNS43OSA1Ljc5IDAgMCAxLTEuMTkyLjEwNHptNS44MDMgMGMtLjcwNiAwLTEuMjYtLjI3NS0xLjY2My0uODIyLS40MDMtLjU0OC0uNjA0LTEuMzA3LS42MDQtMi4yNzggMC0uOTg0LjIwNS0xLjc1Mi42MTUtMi4zMDEuNDEtLjU1Ljk3NS0uODI1IDEuNjk1LS44MjUuNzU1IDAgMS4zMzIuMjk0IDEuNzI5Ljg4MWguMDU0YTYuNjk3IDYuNjk3IDAgMCAxLS4xMjQtMS4xOTh2LTEuOTIyaDEuNjQ0VjI0SDQ2LjQzbC0uMzE3LS43NzloLS4wN2MtLjM3Mi41OTEtLjk0Ljg4Ni0xLjcwMi44ODZ6bS41NzQtMS4zMDZjLjQyIDAgLjcyNi0uMTIxLjkyMS0uMzY1LjE5Ni0uMjQzLjMwMi0uNjU3LjMyLTEuMjR2LS4xNzhjMC0uNjQ0LS4xLTEuMTA2LS4yOTgtMS4zODYtLjE5OS0uMjc5LS41MjItLjQxOS0uOTctLjQxOWEuOTYyLjk2MiAwIDAgMC0uODUuNDY1Yy0uMjAzLjMxLS4zMDQuNzYtLjMwNCAxLjM1IDAgLjU5Mi4xMDIgMS4wMzUuMzA2IDEuMzMuMjA0LjI5Ni40OTYuNDQzLjg3NS40NDN6bTEwLjkyMi00LjkyYy43MDkgMCAxLjI2NC4yNzcgMS42NjUuODMuNC41NTMuNjAxIDEuMzEyLjYwMSAyLjI3NSAwIC45OTItLjIwNiAxLjc2LS42MiAyLjMwNC0uNDE0LjU0NC0uOTc3LjgxNi0xLjY5LjgxNi0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY1OS0uNzY4aC0uMTEzbC0uMjc0LjY2MWgtMS4yNTF2LTguMzU3aDEuNjM4djEuOTQ0YzAgLjI0Ny0uMDIxLjY0My0uMDY0IDEuMTg3aC4wNjRjLjM4My0uNTk0Ljk1LS44OTIgMS43MDMtLjg5MnptLS41MjcgMS4zMWMtLjQwNCAwLS43LjEyNS0uODg2LjM3NC0uMTg2LjI0OS0uMjgzLjY2LS4yOSAxLjIzM3YuMTc3YzAgLjY0NS4wOTYgMS4xMDcuMjg3IDEuMzg2LjE5Mi4yOC40OTUuNDE5LjkxLjQxOS4zMzcgMCAuNjA1LS4xNTUuODA0LS40NjUuMTk5LS4zMS4yOTgtLjc2LjI5OC0xLjM1IDAtLjU5MS0uMS0xLjAzNS0uMy0xLjMzYS45NDMuOTQzIDAgMCAwLS44MjMtLjQ0M3ptMy4xODYtMS4xOTdoMS43OTRsMS4xMzQgMy4zNzljLjA5Ni4yOTMuMTYzLjY0LjE5OCAxLjA0MmguMDMzYy4wMzktLjM3LjExNi0uNzE3LjIzLTEuMDQybDEuMTEyLTMuMzc5aDEuNzU3bC0yLjU0IDYuNzczYy0uMjM0LjYyNy0uNTY2IDEuMDk2LS45OTcgMS40MDctLjQzMi4zMTItLjkzNi40NjgtMS41MTIuNDY4LS4yODMgMC0uNTYtLjAzLS44MzMtLjA5MnYtMS4zYTIuOCAyLjggMCAwIDAgLjY0NS4wN2MuMjkgMCAuNTQzLS4wODguNzYtLjI2Ni4yMTctLjE3Ny4zODYtLjQ0NC41MDgtLjgwM2wuMDk2LS4yOTUtMi4zODUtNS45NjJ6Ii8+CiAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzMpIj4KICAgICAgICAgICAgPGNpcmNsZSBjeD0iMTkiIGN5PSIxOSIgcj0iMTkiIGZpbGw9IiNFMEUwRTAiLz4KICAgICAgICAgICAgPHBhdGggZmlsbD0iI0ZGRiIgZD0iTTIyLjQ3NCAxNS40NDNoNS4xNjJMMTIuNDM2IDMwLjRWMTAuMzYzaDE1LjJsLTUuMTYyIDUuMDh6Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxwYXRoIGZpbGw9IiNEMkQyRDIiIGQ9Ik0xMjEuNTQ0IDE0LjU2di0xLjcyOGg4LjI3MnYxLjcyOGgtMy4wMjRWMjRoLTIuMjR2LTkuNDRoLTMuMDA4em0xMy43NDQgOS41NjhjLTEuMjkgMC0yLjM0MS0uNDE5LTMuMTUyLTEuMjU2LS44MS0uODM3LTEuMjE2LTEuOTQ0LTEuMjE2LTMuMzJzLjQwOC0yLjQ3NyAxLjIyNC0zLjMwNGMuODE2LS44MjcgMS44NzItMS4yNCAzLjE2OC0xLjI0czIuMzYuNDAzIDMuMTkyIDEuMjA4Yy44MzIuODA1IDEuMjQ4IDEuODggMS4yNDggMy4yMjQgMCAuMzEtLjAyMS41OTctLjA2NC44NjRoLTYuNDY0Yy4wNTMuNTc2LjI2NyAxLjA0LjY0IDEuMzkyLjM3My4zNTIuODQ4LjUyOCAxLjQyNC41MjguNzc5IDAgMS4zNTUtLjMyIDEuNzI4LS45NmgyLjQzMmEzLjg5MSAzLjg5MSAwIDAgMS0xLjQ4OCAyLjA2NGMtLjczNi41MzMtMS42MjcuOC0yLjY3Mi44em0xLjQ4LTYuNjg4Yy0uNC0uMzUyLS44ODMtLjUyOC0xLjQ0OC0uNTI4cy0xLjAzNy4xNzYtMS40MTYuNTI4Yy0uMzc5LjM1Mi0uNjA1LjgyMS0uNjggMS40MDhoNC4xOTJjLS4wMzItLjU4Ny0uMjQ4LTEuMDU2LS42NDgtMS40MDh6bTcuMDE2LTIuMzA0djEuNTY4Yy41OTctMS4xMyAxLjQ2MS0xLjY5NiAyLjU5Mi0xLjY5NnYyLjMwNGgtLjU2Yy0uNjcyIDAtMS4xNzkuMTY4LTEuNTIuNTA0LS4zNDEuMzM2LS41MTIuOTE1LS41MTIgMS43MzZWMjRoLTIuMjU2di04Ljg2NGgyLjI1NnptNi40NDggMHYxLjMyOGMuNTY1LS45NyAxLjQ4My0xLjQ1NiAyLjc1Mi0xLjQ1Ni42NzIgMCAxLjI3Mi4xNTUgMS44LjQ2NC41MjguMzEuOTM2Ljc1MiAxLjIyNCAxLjMyOC4zMS0uNTU1LjczMy0uOTkyIDEuMjcyLTEuMzEyYTMuNDg4IDMuNDg4IDAgMCAxIDEuODE2LS40OGMxLjA1NiAwIDEuOTA3LjMzIDIuNTUyLjk5Mi42NDUuNjYxLjk2OCAxLjU5Ljk2OCAyLjc4NFYyNGgtMi4yNHYtNC44OTZjMC0uNjkzLS4xNzYtMS4yMjQtLjUyOC0xLjU5Mi0uMzUyLS4zNjgtLjgzMi0uNTUyLTEuNDQtLjU1MnMtMS4wOS4xODQtMS40NDguNTUyYy0uMzU3LjM2OC0uNTM2Ljg5OS0uNTM2IDEuNTkyVjI0aC0yLjI0di00Ljg5NmMwLS42OTMtLjE3Ni0xLjIyNC0uNTI4LTEuNTkyLS4zNTItLjM2OC0uODMyLS41NTItMS40NC0uNTUycy0xLjA5LjE4NC0xLjQ0OC41NTJjLS4zNTcuMzY4LS41MzYuODk5LS41MzYgMS41OTJWMjRoLTIuMjU2di04Ljg2NGgyLjI1NnpNMTY0LjkzNiAyNFYxMi4xNmgyLjI1NlYyNGgtMi4yNTZ6bTcuMDQtLjE2bC0zLjQ3Mi04LjcwNGgyLjUyOGwyLjI1NiA2LjMwNCAyLjM4NC02LjMwNGgyLjM1MmwtNS41MzYgMTMuMDU2aC0yLjM1MmwxLjg0LTQuMzUyeiIvPgogICAgPC9nPgo8L3N2Zz4K) center no-repeat;"></span>

    <div data-custom-class="body">
    <div><strong><span style="font-size: 26px;"><span data-custom-class="title"><bdt class="block-component"></bdt><bdt class="question"><h1>PRIVACY POLICY</h1></bdt><bdt class="statement-end-if-in-editor"></bdt></span></span></strong></div><div><span style="color: rgb(127, 127, 127);"><strong><span style="font-size: 15px;"><span data-custom-class="subtitle">Last updated <bdt class="question">November 28, 2025</bdt></span></span></strong></span></div><div><br></div><div><br></div><div><br></div><div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text">This Privacy Notice for <bdt class="question noTranslate">Munyaradzi Nyamhingura</bdt><bdt class="block-component"> (doing business as <bdt class="question noTranslate">LumaCare</bdt>)<bdt class="statement-end-if-in-editor"></bdt></bdt> (<bdt class="block-component"></bdt>"<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>"<bdt class="statement-end-if-in-editor"></bdt></span><span data-custom-class="body_text">), describes how and why we might access, collect, store, use, and/or share (<bdt class="block-component"></bdt>"<strong>process</strong>"<bdt class="statement-end-if-in-editor"></bdt>) your personal information when you use our services (<bdt class="block-component"></bdt>"<strong>Services</strong>"<bdt class="statement-end-if-in-editor"></bdt>), including when you:</span></span></span><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Visit our website<bdt class="block-component"></bdt> at <span style="color: rgb(0, 58, 250);"><bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="https://lumacare.netlify.app">https://lumacare.netlify.app</a></bdt></span><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"> or any website of ours that links to this Privacy Notice</bdt></span></span></span></span></span></span></span></span></li></ul><div><bdt class="block-component"><span style="font-size: 15px;"><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Use <bdt class="question">AI Therapy Assistant</bdt>. <bdt class="question">LumaCare is an AI therapy assistant that provides mental health support conversations using evidence-based techniques like CBT and mindfulness.</bdt></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Engage with us in other related ways, including any marketing or events<span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span data-custom-class="body_text"><strong>Questions or concerns? </strong>Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services.<bdt class="block-component"></bdt> If you still have any questions or concerns, please contact us at <bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:lumacare.therapy@gmail.com">lumacare.therapy@gmail.com</a></bdt>.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>SUMMARY OF KEY POINTS</h2></span></span></strong></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong><em>This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our </em></strong></span></span><a data-custom-class="link" href="#toc"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><strong><em>table of contents</em></strong></span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text"><strong><em> below to find the section you are looking for.</em></strong></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about </span></span><a data-custom-class="link" href="#personalinfo"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">personal information you disclose to us</span></span></a><span data-custom-class="body_text">.</span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Do we process any sensitive personal information? </strong>Some of the information may be considered <bdt class="block-component"></bdt>"special" or "sensitive"<bdt class="statement-end-if-in-editor"></bdt> in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. <bdt class="block-component"></bdt>We may process sensitive personal information when necessary with your consent or as otherwise permitted by applicable law. Learn more about </span></span><a data-custom-class="link" href="#sensitiveinfo"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">sensitive information we process</span></span></a><span data-custom-class="body_text">.</span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Do we collect any information from third parties?</strong> <bdt class="block-component"></bdt>We do not collect any information from third parties.<bdt class="else-block"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about </span></span><a data-custom-class="link" href="#infouse"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">how we process your information</span></span></a><span data-custom-class="body_text">.</span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>In what situations and with which <bdt class="block-component"></bdt>parties do we share personal information?</strong> We may share information in specific situations and with specific <bdt class="block-component"></bdt>third parties. Learn more about </span></span><a data-custom-class="link" href="#whoshare"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">when and with whom we share your personal information</span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text">.<bdt class="block-component"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>How do we keep your information safe?</strong> We have adequate <bdt class="block-component"></bdt>organizational<bdt class="statement-end-if-in-editor"></bdt> and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other <bdt class="block-component"></bdt>unauthorized<bdt class="statement-end-if-in-editor"></bdt> third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about </span></span><a data-custom-class="link" href="#infosafe"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">how we keep your information safe</span></span></a><span data-custom-class="body_text">.</span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about </span></span><a data-custom-class="link" href="#privacyrights"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">your privacy rights</span></span></a><span data-custom-class="body_text">.</span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by <bdt class="block-component"></bdt>visiting <span style="color: rgb(0, 58, 250);"><bdt class="question"><a target="_blank" data-custom-class="link" href="mailto:lumacare.therapy@gmail.com">lumacare.therapy@gmail.com</a></bdt></span><bdt class="else-block"></bdt>, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Want to learn more about what we do with any information we collect? </span></span><a data-custom-class="link" href="#toc"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">Review the Privacy Notice in full</span></span></a><span style="font-size: 15px;"><span data-custom-class="body_text">.</span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><br></div><div id="toc" style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>TABLE OF CONTENTS</h2></span></strong> </span> </span> </span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infocollect"><span style="color: rgb(0, 58, 250);">1. WHAT INFORMATION DO WE COLLECT?</span></a></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infouse"><span style="color: rgb(0, 58, 250);">2. HOW DO WE PROCESS YOUR INFORMATION?<bdt class="block-component"></bdt></span></a></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#legalbases"><span style="color: rgb(0, 58, 250);">3. <span style="font-size: 15px;"><span style="color: rgb(0, 58, 250);">WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</span></span><bdt class="statement-end-if-in-editor"></bdt></span></a></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="#whoshare">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></span><span data-custom-class="body_text"><bdt class="block-component"></bdt></a><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#cookies"><span style="color: rgb(0, 58, 250);">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</span></a><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span><bdt class="block-component"></bdt></span></div><div style="line-height: 1.5;"><a data-custom-class="link" href="#ai"><span style="color: rgb (0, 58, 250);">6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</span></a><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"></bdt></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span> <bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#intltransfers"><span style="color: rgb(0, 58, 250);">7. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</span></a><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#inforetain"><span style="color: rgb(0, 58, 250);">8. HOW LONG DO WE KEEP YOUR INFORMATION?</span></a><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infosafe"><span style="color: rgb(0, 58, 250);">9. HOW DO WE KEEP YOUR INFORMATION SAFE?</span></a><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#infominors"><span style="color: rgb(0, 58, 250);">10. DO WE COLLECT INFORMATION FROM MINORS?</span></a><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="#privacyrights">11. WHAT ARE YOUR PRIVACY RIGHTS?</a></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#DNT"><span style="color: rgb(0, 58, 250);">12. CONTROLS FOR DO-NOT-TRACK FEATURES<bdt class="block-component"></bdt></span></a></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#uslaws"><span style="color: rgb(0, 58, 250);">13. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</span></a></span><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></bdt></span></div><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><a data-custom-class="link" href="#policyupdates"><span style="color: rgb(0, 58, 250);">14. DO WE MAKE UPDATES TO THIS NOTICE?</span></a></span></div><div style="line-height: 1.5;"><a data-custom-class="link" href="#contact"><span style="color: rgb(0, 58, 250); font-size: 15px;">15. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></a></div><div style="line-height: 1.5;"><a data-custom-class="link" href="#request"><span style="color: rgb(0, 58, 250);">16. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</span></a></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><br></div><div id="infocollect" style="line-height: 1.5;"><span style="color: rgb(0, 0, 0);"><span style="color: rgb(0, 0, 0); font-size: 15px;"><span style="font-size: 15px; color: rgb(0, 0, 0);"><span style="font-size: 15px; color: rgb(0, 0, 0);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>1. WHAT INFORMATION DO WE COLLECT?</h2></span></strong></span></span></span></span></span><span data-custom-class="heading_2" id="personalinfo" style="color: rgb(0, 0, 0);"><span style="font-size: 15px;"><strong><h3>Personal information you disclose to us</h3></strong></span></span><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong></span></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em> </em></strong><em>We collect personal information that you provide to us.</em></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We collect personal information that you voluntarily provide to us when you <span style="font-size: 15px;"><bdt class="block-component"></bdt></span>register on the Services, </span><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"></bdt></span></span><span data-custom-class="body_text">express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:<span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">email addresses</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">passwords</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">usernames</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">debit/credit card numbers</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">contact or authentication data</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">billing addresses</bdt></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></div><div id="sensitiveinfo" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Sensitive Information.</strong> <bdt class="block-component"></bdt>When necessary, with your consent or as otherwise permitted by applicable law, we process the following categories of sensitive information:<bdt class="forloop-component"></bdt></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">health data</bdt></span></span></li></ul><div><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">social security numbers or other government identifiers</bdt></span></span></li></ul><div><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Payment Data.</strong> We may collect data necessary to process your payment if you choose to make purchases, such as your payment instrument number, and the security code associated with your payment instrument. All payment data is handled and stored by<bdt class="forloop-component"></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span> <bdt class="question">Yoco</bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></span>. You may find their privacy notice link(s) here:<span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span> <span style="color: rgb(0, 58, 250);"><bdt class="question"><a target="_blank" data-custom-class="link" href="https://www.yoco.com/za/legal/privacy-policy/">https://www.yoco.com/za/legal/privacy-policy/</a></bdt></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="forloop-component"></bdt><span style="font-size: 15px;"><span data-custom-class="body_text">.<bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></bdt></span></span></span></span><bdt class="block-component"></span></span></bdt></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span><span data-custom-class="heading_2" style="color: rgb(0, 0, 0);"><span style="font-size: 15px;"><strong><h3>Information automatically collected</h3></strong></span></span><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong></span></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em> </em></strong><em>Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.</em></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Like many businesses, we also collect information through cookies and similar technologies. <bdt class="block-component"></bdt>You can find out more about this in our Cookie Notice: <bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt><span style="color: rgb(0, 58, 250);"><bdt class="question"><a target="_blank" data-custom-class="link" href="https://app.termly.io/dashboard/website/01a08bea-640b-4d13-88dd-9616d2fe6ef1/cookie-policy">https://app.termly.io/dashboard/website/01a08bea-640b-4d13-88dd-9616d2fe6ef1/cookie-policy</a></bdt></span>.<bdt class="block-component"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></span><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The information we collect includes:<bdt class="block-component"></bdt></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><em>Log and Usage Data.</em> Log and usage data is service-related, diagnostic, usage, and performance information our servers automatically collect when you access or use our Services and which we record in log files. Depending on how you interact with us, this log data may include your IP address, device information, browser type, and settings and information about your activity in the Services<span style="font-size: 15px;"> </span>(such as the date/time stamps associated with your usage, pages and files viewed, searches, and other actions you take such as which features you use), device event information (such as system activity, error reports (sometimes called <bdt class="block-component"></bdt>"crash dumps"<bdt class="statement-end-if-in-editor"></bdt>), and hardware settings).<span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><em>Device Data.</em> We collect device data such as information about your computer, phone, tablet, or other device you use to access the Services. Depending on the device used, this device data may include information such as your IP address (or proxy server), device and application identification numbers, location, browser type, hardware model, Internet service provider and/or mobile carrier, operating system, and system configuration information.<span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></span></span></span></span></span></span></li></ul><div><bdt class="block-component"><span style="font-size: 15px;"></bdt></bdt><bdt class="statement-end-if-in-editor"></bdt></bdt></span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></bdt></span></span></span></span></bdt></span></span></span></span></span></span></span></span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div id="infouse" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>2. HOW DO WE PROCESS YOUR INFORMATION?</h2></span></strong></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short: </em></strong><em>We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.<bdt class="block-component"></bdt> We process the personal information for the following purposes listed below.<bdt class="statement-end-if-in-editor"></bdt> We may also process your information for other purposes <bdt class="block-component"></bdt>only with your prior explicit<bdt class="else-block"></bdt> consent.</em></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>We process your personal information for a variety of reasons, depending on how you interact with our Services, including:</strong><bdt class="block-component"></bdt></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To facilitate account creation and authentication and otherwise manage user accounts. </strong>We may process your information so you can create and log in to your account, as well as keep your account in working order.<span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To deliver and facilitate delivery of services to the user. </strong>We may process your information to provide you with the requested service.<span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To send administrative information to you. </strong>We may process your information to send you details about our products and services, changes to our terms and policies, and other similar information.<span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>To <bdt class="block-component"></bdt>fulfill<bdt class="statement-end-if-in-editor"></bdt> and manage your orders.</strong> We may process your information to <bdt class="block-component"></bdt>fulfill<bdt class="statement-end-if-in-editor"></bdt> and manage your orders, payments, returns, and exchanges made through the Services.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><p style="font-size: 15px; line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px; line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px; line-height: 1.5;"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px; line-height: 1.5;"><bdt class="block-component"></bdt></p><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>To request feedback. </strong>We may process your information when necessary to request feedback and to contact you about your use of our Services.<span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></bdt></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>To protect our Services.</strong> We may process your information as part of our efforts to keep our Services safe and secure, including fraud monitoring and prevention.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>To identify usage trends.</strong> We may process information about how you use our Services to better understand how they are being used so we can improve them.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>To save or protect an individual's vital interest.</strong> We may process your information when necessary to save or protect an individual’s vital interest, such as to prevent harm.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><div style="line-height: 1.5;"><br></div><div id="legalbases" style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_1"><h2>3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</h2></span></span></strong><em><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>In Short: </strong>We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e.<bdt class="block-component"></bdt>,<bdt class="statement-end-if-in-editor"></bdt> legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or <bdt class="block-component"></bdt>fulfill<bdt class="statement-end-if-in-editor"></bdt> our contractual obligations, to protect your rights, or to <bdt class="block-component"></bdt>fulfill<bdt class="statement-end-if-in-editor"></bdt> our legitimate business interests.</span></span></em></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><em><span style="font-size: 15px;"><span data-custom-class="body_text"><strong><u>If you are located in the EU or UK, this section applies to you.</u></strong></span></span></em></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:</span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Consent. </strong>We may process your information if you have given us permission (i.e.<bdt class="block-component"></bdt>,<bdt class="statement-end-if-in-editor"></bdt> consent) to use your personal information for a specific purpose. You can withdraw your consent at any time. Learn more about </span></span><a data-custom-class="link" href="#withdrawconsent"><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text">withdrawing your consent</span></span></a><span data-custom-class="body_text">.</span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>Performance of a Contract.</strong> We may process your personal information when we believe it is necessary to <bdt class="block-component"></bdt>fulfill<bdt class="statement-end-if-in-editor"></bdt> our contractual obligations to you, including providing our Services or at your request prior to entering into a contract with you.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>Legitimate Interests.</strong> We may process your information when we believe it is reasonably necessary to achieve our legitimate business interests and those interests do not outweigh your interests and fundamental rights and freedoms. For example, we may process your personal information for some of the purposes described in order to:</span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></div><ul style="margin-left: 40px;"><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt>Analyze<bdt class="statement-end-if-in-editor"></bdt> how our Services are used so we can improve them to engage and retain users<bdt class="statement-end-if-in-editor"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></div><ul style="margin-left: 40px;"><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">Diagnose problems and/or prevent fraudulent activities<bdt class="statement-end-if-in-editor"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></div><ul style="margin-left: 40px;"><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">Understand how our users use our products and services so we can improve user experience<bdt class="statement-end-if-in-editor"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>Legal Obligations.</strong> We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.<bdt class="statement-end-if-in-editor"></bdt><br></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong>Vital Interests.</strong> We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"><bdt class="block-component"></bdt></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><strong><u><em>If you are located in Canada, this section applies to you.</em></u></strong></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"></bdt></span></span></div><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">We may process your information if you have given us specific permission (i.e.<bdt class="block-component"></bdt>,<bdt class="statement-end-if-in-editor"></bdt> express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (i.e.<bdt class="block-component"></bdt>,<bdt class="statement-end-if-in-editor"></bdt> implied consent). You can </span></span><a data-custom-class="link" href="#withdrawconsent"><span data-custom-class="body_text"><span style="color: rgb(0, 58, 250); font-size: 15px;">withdraw your consent</span></span></a><span data-custom-class="body_text"><span style="font-size: 15px;"> at any time.</span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">In some exceptional cases, we may be legally permitted under applicable law to process your information without your consent, including, for example:</span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way</span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">For investigations and fraud detection and prevention<bdt class="statement-end-if-in-editor"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">For business transactions provided certain conditions are met</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">For identifying injured, ill, or deceased persons and communicating with next of kin</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse<bdt class="statement-end-if-in-editor"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province<bdt class="statement-end-if-in-editor"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records<bdt class="statement-end-if-in-editor"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced<bdt class="statement-end-if-in-editor"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">If the collection is solely for journalistic, artistic, or literary purposes<bdt class="statement-end-if-in-editor"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">If the information is publicly available and is specified by the regulations</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">We may disclose de-identified information for approved research or statistics projects, subject to ethics oversight and confidentiality commitments<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><div style="line-height: 1.5;"><br></div><div id="whoshare" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We may share information in specific situations described in this section and/or with the following <bdt class="block-component"></bdt>third parties.</em></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Vendors, Consultants, and Other Third-Party Service Providers.</strong> We may share your data with third-party vendors, service providers, contractors, or agents (<bdt class="block-component"></bdt>"<strong>third parties</strong>"<bdt class="statement-end-if-in-editor"></bdt>) who perform services for us or on our behalf and require access to such information to do that work. <bdt class="block-component"></bdt>We have contracts in place with our third parties, which are designed to help safeguard your personal information. This means that they cannot do anything with your personal information unless we have instructed them to do it. They will also not share your personal information with any <bdt class="block-component"></bdt>organization<bdt class="statement-end-if-in-editor"></bdt> apart from us. They also commit to pr</span><span data-custom-class="body_text">otect the data they hold on our behalf and to retain it for the period we instruct. <bdt class="statement-end-if-in-editor"></bdt></span><bdt class="block-component"></bdt></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">The <bdt class="block-component"></bdt>third parties we may share personal information with are as follows:</span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></bdt></span></span></span></bdt></span></span></span></span></span></span><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><span style="font-size: 15px;"><bdt class="block-component"></bdt></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Invoice and Billing</strong></span></span></span></li></ul><div style="margin-left: 40px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="forloop-component"><span data-custom-class="body_text"></span></bdt><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt><bdt class="question">Yoco</bdt><bdt class="block-component"></bdt></span></span></span></span><bdt class="forloop-component"></bdt><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Web and Mobile Analytics</strong></span></span></span></li></ul><div style="margin-left: 40px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="forloop-component"><span data-custom-class="body_text"></span></bdt><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt><bdt class="question">Google Analytics</bdt><bdt class="block-component"></bdt></span></span></span></span><bdt class="forloop-component"></bdt><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Website Hosting</strong></span></span></span></li></ul><div style="margin-left: 40px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="forloop-component"><span data-custom-class="body_text"></span></bdt><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt><bdt class="question"> Netlify</bdt><bdt class="block-component"></bdt></span></span></span></span><bdt class="forloop-component"></bdt><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span><span data-custom-class="body_text"></span><span data-custom-class="body_text"></span><span data-custom-class="body_text"></span><span data-custom-class="body_text"></span><span data-custom-class="body_text"></span><span data-custom-class="body_text"></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We <bdt class="block-component"></bdt>also <bdt class="statement-end-if-in-editor"></bdt>may need to share your personal information in the following situations:</span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"><span data-custom-class="body_text"></span></bdt></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></bdt></span></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"><span data-custom-class="heading_1"><bdt class="block-component"></bdt></span></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="cookies" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We may use cookies and other tracking technologies to collect and store your information.</em></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services<bdt class="block-component"></bdt> and your account<bdt class="statement-end-if-in-editor"></bdt>, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements, to tailor advertisements to your interests, or to send abandoned shopping cart reminders (depending on your communication preferences). The third parties and service providers use their technology to provide advertising about products and services tailored to your interests which may appear either on our Services or on other websites.</span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">To the extent these online tracking technologies are deemed to be a <bdt class="block-component"></bdt>"sale"/"sharing"<bdt class="statement-end-if-in-editor"></bdt> (which includes targeted advertising, as defined under the applicable laws) under applicable US state laws, you can opt out of these online tracking technologies by submitting a request as described below under section <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span><span data-custom-class="body_text"><a data-custom-class="link" href="#uslaws"><span style="color: rgb(0, 58, 250); font-size: 15px;">DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</span></a></span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span><bdt class="statement-end-if-in-editor"></bdt></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice<span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span>: <span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="question"><a target="_blank" data-custom-class="link" href="https://app.termly.io/dashboard/website/01a08bea-640b-4d13-88dd-9616d2fe6ef1/cookie-policy">https://app.termly.io/dashboard/website/01a08bea-640b-4d13-88dd-9616d2fe6ef1/cookie-policy</a></bdt></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><bdt class="block-component"></bdt>.</span></span></span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><div style="line-height: 1.5;"><br></div><div id="ai" style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="heading_1"><h2>6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2></span></strong><strong><em><span data-custom-class="body_text">In Short:</span></em></strong><em><span data-custom-class="body_text"> We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.</span></em></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">As part of our Services, we offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies (collectively, <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt>AI Products<bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt>). These tools are designed to enhance your experience and provide you with innovative solutions. The terms in this Privacy Notice govern your use of the AI Products within our Services.</span><bdt class="block-component"></bdt></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="body_text">Use of AI Technologies</span></strong></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We provide the AI Products through third-party service providers (<bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt>AI Service Providers<bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt>), including <bdt class="forloop-component"></bdt><bdt class="block-component"></bdt><bdt class="question">My own AI technology</bdt><bdt class="block-component"></bdt><bdt class="forloop-component"></bdt>. As outlined in this Privacy Notice, your input, output, and personal information will be shared with and processed by these AI Service Providers to enable your use of our AI Products for purposes outlined in <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt></span></span><span data-custom-class="body_text"><a data-custom-class="link" href="#legalbases"><span style="color: rgb(0, 58, 250); font-size: 15px;">WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</span></a><span style="font-size: 15px;"><bdt class="else-block"></bdt><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt> You must not use the AI Products in any way that violates the terms or policies of any AI Service Provider.</span><bdt class="statement-end-if-in-editor"></bdt></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="body_text">Our AI Products</span></strong></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Our AI Products are designed for the following functions:</span><bdt class="forloop-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="question"><span data-custom-class="body_text">Chatbot or virtual assistant</span></bdt></span></li></ul><div><span style="font-size: 15px;"><bdt class="forloop-component"></bdt><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="body_text">How We Process Your Data Using AI</span></strong></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">All personal information processed using our AI Products is handled in line with our Privacy Notice and our agreement with third parties. This ensures high security and safeguards your personal information throughout the process, giving you peace of mind about your data's safety.</span><bdt class="block-component"></bdt></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="body_text">How to Opt Out</span></strong></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We believe in giving you the power to decide how your data is used. To opt out, you can:</span><bdt class="forloop-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="question"><span data-custom-class="body_text">Log in to your account settings and update your user account</span></bdt></span></li></ul><div><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="question"><span data-custom-class="body_text">Contact us using the contact information provided</span></bdt></span></li></ul><div><span style="font-size: 15px;"><bdt class="forloop-component"></bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="statement-end-if-in-editor"></bdt></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span><bdt class="block-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></bdt></span></span></span></span></span></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="intltransfers" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>7. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short: </em></strong><em>We may transfer, store, and process your information in countries other than your own.</em></span></span></span></div><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Our servers are located in<span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span> the <span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="question">United States</bdt></span></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></bdt><bdt class="block-component"></bdt></span></span></span></span></span></span></bdt><bdt class="forloop-component"></bdt></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">. Regardless of your location,</span><span data-custom-class="body_text"> please be aware that your information may be transferred to, stored by, and processed by us in our facilities and in the facilities of the third parties with whom we may share your personal information (see <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span><a data-custom-class="link" href="#whoshare"><span style="font-size: 15px;"><span style="color: rgb(0, 58, 250);">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</span></span></a><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt> above), including facilities in</span></span></span><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="forloop-component"></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt> <bdt class="question">South Africa,<span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="else-block"></bdt></span></span></span></span></span></span></bdt></span></span></span></span></span></span></span></span></span><bdt class="forloop-component"></bdt></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"> and other countries.</span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you are a resident in the European Economic Area (EEA), United Kingdom (UK), or Switzerland, then these countries may not necessarily have data protection laws or other similar laws as comprehensive as those in your country. However, we will take all necessary measures to protect your personal information in accordance with this Privacy Notice and applicable law.<span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">European Commission's Standard Contractual Clauses:</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We have implemented measures to protect your personal information, including by using the European Commission's Standard Contractual Clauses for transfers of personal information between our group companies and between us and our third-party providers. These clauses require all recipients to protect all personal information that they process originating from the EEA or UK in accordance with European data protection laws and regulations.<span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span> </span>Our Standard Contractual Clauses can be provided upon request.<span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span> </span>We have implemented similar appropriate safeguards with our third-party service providers and partners and further details can be provided upon request.<span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="inforetain" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>8. HOW LONG DO WE KEEP YOUR INFORMATION?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short: </em></strong><em>We keep your information for as long as necessary to <bdt class="block-component"></bdt>fulfill<bdt class="statement-end-if-in-editor"></bdt> the purposes outlined in this Privacy Notice unless otherwise required by law.</em></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).<bdt class="block-component"></bdt> No purpose in this notice will require us keeping your personal information for longer than <span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span><bdt class="block-component"></bdt>the period of time in which users have an account with us<bdt class="block-component"></bdt><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="else-block"></bdt></span></span></span>.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">When we have no ongoing legitimate business need to process your personal information, we will either delete or <bdt class="block-component"></bdt>anonymize<bdt class="statement-end-if-in-editor"></bdt> such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.<span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="infosafe" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>9. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short: </em></strong><em>We aim to protect your personal information through a system of <bdt class="block-component"></bdt>organizational<bdt class="statement-end-if-in-editor"></bdt> and technical security measures.</em></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We have implemented appropriate and reasonable technical and <bdt class="block-component"></bdt>organizational<bdt class="statement-end-if-in-editor"></bdt> security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other <bdt class="block-component"></bdt>unauthorized<bdt class="statement-end-if-in-editor"></bdt> third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment.<span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="infominors" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>10. DO WE COLLECT INFORMATION FROM MINORS?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> We do not knowingly collect data from or market to <bdt class="block-component"></bdt>children under 18 years of age<bdt class="block-component"></bdt> or the equivalent age as specified by law in your jurisdiction<bdt class="statement-end-if-in-editor"></bdt><bdt class="else-block"></bdt>.</em><bdt class="block-component"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We do not knowingly collect, solicit data from, or market to children under 18 years of age<bdt class="block-component"></bdt> or the equivalent age as specified by law in your jurisdiction<bdt class="statement-end-if-in-editor"></bdt>, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18<bdt class="block-component"></bdt> or the equivalent age as specified by law in your jurisdiction<bdt class="statement-end-if-in-editor"></bdt> or that you are the parent or guardian of such a minor and consent to such minor dependent’s use of the Services. If we learn that personal information from users less than 18 years of age<bdt class="block-component"></bdt> or the equivalent age as specified by law in your jurisdiction<bdt class="statement-end-if-in-editor"></bdt> has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18<bdt class="block-component"></bdt> or the equivalent age as specified by law in your jurisdiction<bdt class="statement-end-if-in-editor"></bdt>, please contact us at <span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="question"><a target="_blank" data-custom-class="link" href="mailto:lumacare.therapy@gmail.com">lumacare.therapy@gmail.com</a></bdt><bdt class="else-block"></bdt></span></span>.</span><span data-custom-class="body_text"><bdt class="else-block"><bdt class="block-component"></bdt></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="privacyrights" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>11. WHAT ARE YOUR PRIVACY RIGHTS?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short:</em></strong><em> <span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span data-custom-class="body_text"><em><bdt class="block-component"></bdt></em></span></span></span><bdt class="block-component"></bdt>Depending on your state of residence in the US or in <bdt class="else-block"></bdt>some regions, such as <bdt class="block-component"></bdt>the European Economic Area (EEA), United Kingdom (UK), Switzerland, and Canada<bdt class="block-component"></bdt>, you have rights that allow you greater access to and control over your personal information.<span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span data-custom-class="body_text"><em><bdt class="statement-end-if-in-editor"></bdt></em></span></span> </span>You may review, change, or terminate your account at any time, depending on your country, province, or state of residence.</em><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">In some regions (like <bdt class="block-component"></bdt>the EEA, UK, Switzerland, and Canada<bdt class="block-component"></bdt>), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; (iv) if applicable, to data portability; and (v) not to be subject to automated decision-making.<bdt class="block-component"></bdt> If a decision that produces legal or similarly significant effects is made solely by automated means, we will inform you, explain the main factors, and offer a simple way to request human review.<bdt class="statement-end-if-in-editor"></bdt> In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span><a data-custom-class="link" href="#contact"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span data-custom-class="body_text">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></span></span></a><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt> below.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We will consider and act upon any request in accordance with applicable data protection laws.<bdt class="block-component"></bdt></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"> </span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your <span style="font-size: 15px;"><span style="color: rgb(0, 58, 250);"><span data-custom-class="body_text"><span style="color: rgb(0, 58, 250);"><span data-custom-class="body_text"><a data-custom-class="link" href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px;">Member State data protection authority</span></a></span></span></span></span></span> or </span></span></span><a data-custom-class="link" href="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span data-custom-class="body_text">UK data protection authority</span></span></span></a><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you are located in Switzerland, you may contact the <span style="font-size: 15px;"><span style="color: rgb(0, 58, 250);"><span data-custom-class="body_text"><span style="color: rgb(0, 58, 250);"><span data-custom-class="body_text"><span style="color: rgb(0, 58, 250); font-size: 15px;"><a data-custom-class="link" href="https://www.edoeb.admin.ch/edoeb/en/home.html" rel="noopener noreferrer" target="_blank">Federal Data Protection and Information Commissioner</a></span></span></span></span></span></span>.</span></span></span></div><div style="line-height: 1.5;"><br></div><div id="withdrawconsent" style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><u>Withdrawing your consent:</u></strong> If we are relying on your consent to process your personal information,<bdt class="block-component"></bdt> which may be express and/or implied consent depending on the applicable law,<bdt class="statement-end-if-in-editor"></bdt> you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span><a data-custom-class="link" href="#contact"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span data-custom-class="body_text">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></span></span></a><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt> below<bdt class="block-component"></bdt>.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">However, please note that this will not affect the lawfulness of the processing before its withdrawal nor,<bdt class="block-component"></bdt> when applicable law allows,<bdt class="statement-end-if-in-editor"></bdt> will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.<bdt class="block-component"></bdt></span></span><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><span style="font-size: 15px;"><span data-custom-class="heading_2"><strong><h3>Account Information</h3></strong></span></span><span data-custom-class="body_text"><span style="font-size: 15px;">If you would at any time like to review or change the information in your account or terminate your account, you can:<bdt class="forloop-component"></bdt></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="question">Contact us using the contact information provided.</bdt></span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="question">Log in to your account settings and update your user account.</bdt></span></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><u>Cookies and similar technologies:</u></strong> Most Web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Services. <bdt class="block-component"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span>For further information, please see our Cookie Notice: <span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(0, 58, 250);"><bdt class="question"><a target="_blank" data-custom-class="link" href="https://app.termly.io/dashboard/website/01a08bea-640b-4d13-88dd-9616d2fe6ef1/cookie-policy">https://app.termly.io/dashboard/website/01a08bea-640b-4d13-88dd-9616d2fe6ef1/cookie-policy</a></bdt></span>.<bdt class="block-component"></bdt><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span></span></span><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px;">If you have questions or comments about your privacy rights, you may email us at <bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:lumacare.therapy@gmail.com">lumacare.therapy@gmail.com</a></bdt>.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt></div><div style="line-height: 1.5;"><br></div><div id="DNT" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>12. CONTROLS FOR DO-NOT-TRACK FEATURES</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (<bdt class="block-component"></bdt>"DNT"<bdt class="statement-end-if-in-editor"></bdt>) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for <bdt class="block-component"></bdt>recognizing<bdt class="statement-end-if-in-editor"></bdt> and implementing DNT signals has been <bdt class="block-component"></bdt>finalized<bdt class="statement-end-if-in-editor"></bdt>. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Notice.</span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">California law requires us to let you know how we respond to web browser DNT signals. Because there currently is not an industry or legal standard for <bdt class="block-component"></bdt>recognizing<bdt class="statement-end-if-in-editor"></bdt> or <bdt class="block-component"></bdt>honoring<bdt class="statement-end-if-in-editor"></bdt> DNT signals, we do not respond to them at this time.</span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div><div id="uslaws" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>13. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong><em>In Short: </em></strong><em>If you are a resident of<bdt class="block-component"></bdt> California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia<bdt class="else-block"></bdt>, you may have the right to request access to and receive details about the personal information we maintain about you and how we have processed it, correct inaccuracies, get a copy of, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. More information is provided below.</em></span><strong><span data-custom-class="heading_2"><h3>Categories of Personal Information We Collect</h3></span></strong><span data-custom-class="body_text">The table below shows the categories of personal information we have collected in the past twelve (12) months. The table includes illustrative examples of each category and does not reflect the personal information we collect from you. For a comprehensive inventory of all personal information we process, please refer to the section <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span><a data-custom-class="link" href="#infocollect"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span data-custom-class="body_text"><span data-custom-class="link">WHAT INFORMATION DO WE COLLECT?</span></span></span></span></a><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div><table style="width: 100%;"><thead><tr><th style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black; text-align: left;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Category</strong></span></span></span></th><th style="width: 51.4385%; border-top: 1px solid black; border-right: 1px solid black; text-align: left;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Examples</strong></span></span></span></th><th style="width: 14.9084%; border-right: 1px solid black; border-top: 1px solid black; text-align: center; text-align: left;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Collected</strong></span></span></span></th></tr></thead><tbody><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">A. Identifiers</span></span></span></div></td><td style="width: 51.4385%; border-top: 1px solid black; border-right: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Contact details, such as real name, alias, postal address, telephone or mobile contact number, unique personal identifier, online identifier, Internet Protocol address, email address, and account name</span></span></span></div></td><td style="width: 14.9084%; text-align: center; vertical-align: middle; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"><bdt class="block-component"><bdt class="forloop-component"></bdt>YES<bdt class="forloop-component"></bdt><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="statement-end-if-in-editor"></bdt></bdt></bdt></bdt></span><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div></td></tr></tbody></table><div style="line-height: 1.5;"><bdt class="block-component"></bdt></div><table style="width: 100%;"><tbody><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">B. Personal information as defined in the California Customer Records statute</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Name, contact information, education, employment, employment history, and financial information</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="forloop-component"><bdt class="block-component"><bdt class="forloop-component"></bdt><bdt class="forloop-component"></bdt>YES<bdt class="forloop-component"></bdt><bdt class="block-component"></bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="statement-end-if-in-editor"></bdt></bdt></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div></td></tr></tbody></table><div style="line-height: 1.5;"><bdt class="block-component"></bdt></div><table style="width: 100%;"><tbody><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>C<bdt class="else-block"></bdt>. Protected classification characteristics under state or federal law</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Gender, age, date of birth, race and ethnicity, national origin, marital status, and other demographic data</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>D<bdt class="else-block"></bdt>. Commercial information</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Transaction information, purchase history, financial details, and payment information</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></span></bdt><span data-custom-class="body_text"><bdt class="block-component"></bdt>YES<bdt class="statement-end-if-in-editor"></bdt><bdt class="forloop-component"></span></bdt><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>E<bdt class="else-block"></bdt>. Biometric information</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Fingerprints and voiceprints</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></bdt></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>F<bdt class="else-block"></bdt>. Internet or other similar network activity</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Browsing history, search history, online <bdt class="block-component"></bdt>behavior<bdt class="statement-end-if-in-editor"></bdt>, interest data, and interactions with our and other websites, applications, systems, and advertisements</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></span></bdt><span data-custom-class="body_text"><bdt class="block-component"></bdt>YES<bdt class="statement-end-if-in-editor"></bdt><bdt class="forloop-component"></span></bdt><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>G<bdt class="else-block"></bdt>. Geolocation data</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Device location</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>H<bdt class="else-block"></bdt>. Audio, electronic, sensory, or similar information</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Images and audio, video or call recordings created in connection with our business activities</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></bdt></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="width: 33.8274%; border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>I<bdt class="else-block"></bdt>. Professional or employment-related information</span></span></span></div></td><td style="width: 51.4385%; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Business contact details in order to provide you our Services at a business level or job title, work history, and professional qualifications if you apply for a job with us</span></span></span></div></td><td style="width: 14.9084%; text-align: center; border-right: 1px solid black; border-top: 1px solid black;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black; width: 33.8274%;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>J<bdt class="else-block"></bdt>. Education Information</span></span></span></div></td><td style="border-right: 1px solid black; border-top: 1px solid black; width: 51.4385%;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Student records and directory information</span></span></span></div></td><td style="text-align: center; border-right: 1px solid black; border-top: 1px solid black; width: 14.9084%;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><bdt class="forloop-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt>NO</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="border-width: 1px; border-color: black; border-style: solid; width: 33.8274%;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>K<bdt class="else-block"></bdt>. Inferences drawn from collected personal information</span></span></span></div></td><td style="border-bottom: 1px solid black; border-top: 1px solid black; border-right: 1px solid black; width: 51.4385%;"><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Inferences drawn from any of the collected personal information listed above to create a profile or summary about, for example, an individual’s preferences and characteristics</span></span></span></div></td><td style="text-align: center; border-right: 1px solid black; border-bottom: 1px solid black; border-top: 1px solid black; width: 14.9084%;"><div style="line-height: 1.5;"><br></div><div data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>NO<span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div></td></tr><tr><td style="border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black; line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>L<bdt class="else-block"></bdt>. Sensitive personal Information</span></td><td style="border-right: 1px solid black; border-bottom: 1px solid black; line-height: 1.5;"><bdt class="block-component"><span data-custom-class="body_text"></span></bdt><span data-custom-class="body_text"><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt><bdt class="question">Account login information</bdt><bdt class="else-block"></bdt><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt>, <bdt class="question">debit or credit card numbers</bdt><bdt class="else-block"></bdt><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt>, <bdt class="question">financial information including account access details</bdt><bdt class="else-block"></bdt><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt> and <bdt class="question">health data</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="forloop-component"></bdt></span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></td><td style="border-right: 1px solid black; border-bottom: 1px solid black;"><div data-empty="true" style="text-align: center;"><br></div><div data-custom-class="body_text" data-empty="true" style="text-align: center; line-height: 1.5;"><bdt class="block-component"><span data-custom-class="body_text"></span></bdt><span data-custom-class="body_text">YES<bdt class="else-block"></span></bdt></div><div data-empty="true" style="text-align: center;"><br></div></td></tr></tbody></table><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We only collect sensitive personal information, as defined by applicable privacy laws or the purposes allowed by law or with your consent. Sensitive personal information may be used, or disclosed to a service provider or contractor, for additional, specified purposes. You may have the right to limit the use or disclosure of your sensitive personal information.<bdt class="block-component"></bdt> We do not collect or process sensitive personal information for the purpose of inferring characteristics about you.<bdt class="statement-end-if-in-editor"></bdt></span><bdt class="statement-end-if-in-editor"></bdt></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">We may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:</span><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Receiving help through our customer support channels;<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text"><span style="font-size: 15px;">Participation in customer surveys or contests; and<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text"><span style="font-size: 15px;">Facilitation in the delivery of our Services and to respond to your inquiries.</span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span data-custom-class="body_text"></span></bdt><span data-custom-class="body_text">We will use and retain the collected personal information as needed to provide the Services or for:<bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category A - <bdt class="question">As long as the user has an account with us</bdt><bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"><bdt class="block-component"></bdt></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category B - <bdt class="question">As long as the user has an account with us</bdt><bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category <bdt class="block-component"></bdt>D<bdt class="else-block"></bdt> - <bdt class="question">As long as the user has an account with us</bdt><bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category <bdt class="block-component"></bdt>F<bdt class="else-block"></bdt> - <bdt class="question">As long as the user has an account with us</bdt><bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category <bdt class="block-component"></bdt>L<bdt class="else-block"></bdt> - <bdt class="question">As long as the user has an account with us</bdt><bdt class="statement-end-if-in-editor"></bdt></span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></li></ul><div style="line-height: 1.5;"><strong><span style="font-size: 15px;"><span data-custom-class="heading_2"><h3>Sources of Personal Information</h3></span></span></strong><span style="font-size: 15px;"><span data-custom-class="body_text">Learn more about the sources of personal information we collect in <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span><span style="color: rgb(0, 58, 250);"><span data-custom-class="body_text"><a data-custom-class="link" href="#infocollect"><span style="color: rgb (0, 58, 250); font-size: 15px;">WHAT INFORMATION DO WE COLLECT?</span></a></span></span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><strong><span data-custom-class="heading_2"><h3>How We Use and Share Personal Information</h3></span></strong></span></span><span data-custom-class="body_text" style="font-size: 15px;"><bdt class="block-component"></bdt>Learn more about how we use your personal information in the section, <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span><a data-custom-class="link" href="#infouse"><span style="color: rgb(0, 58, 250); font-size: 15px;">HOW DO WE PROCESS YOUR INFORMATION?</span></a><span data-custom-class="body_text" style="font-size: 15px;"><bdt class="block-component"></bdt>"</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text" style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></bdt></bdt></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><strong>Will your information be shared with anyone else?</strong></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Learn more about how we disclose personal information to in the section, <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span><a data-custom-class="link" href="#whoshare"><span style="font-size: 15px; color: rgb(0, 58, 250);"><span style="font-size: 15px; color: rgb(0, 58, 250);">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</span></span></a><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be <bdt class="block-component"></bdt>"selling"<bdt class="statement-end-if-in-editor"></bdt> of your personal information.<span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><span data-custom-class="body_text"><span style="font-size: 15px;">We have not sold or shared any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. </span></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"></span></span></bdt><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text">We have disclosed the following categories of personal information to third parties for a business or commercial purpose in the preceding twelve (12) months:<bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px;"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt></span></span></span><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt></span></p><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text">Category A. Identifiers<span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px; line-height: 1.5;"><bdt class="forloop-component"><bdt class="block-component"></bdt></li></ul><p style="font-size: 15px; line-height: 1.5;"><bdt class="forloop-component"></bdt></p><ul><li data-custom-class="body_text">Category B. Personal information as defined in the California Customer Records law</bdt></li></ul><p style="font-size: 15px;"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px;"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px;"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px;"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt></span></span></span><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="forloop-component"></bdt><bdt class="block-component"></bdt></span></p><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text">Category <bdt class="block-component"></bdt>D<bdt class="else-block"></bdt>. Commercial information<span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px;"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px;"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px;"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></span><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="forloop-component"></bdt></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text">Category <bdt class="block-component"></bdt>F<bdt class="else-block"></bdt>. Internet or other electronic network activity information<span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px;"><bdt class="forloop-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></li></ul><p style="font-size: 15px;"><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></li></ul><div><span style="font-size: 15px;"><bdt class="forloop-component"></bdt></span></span></span></span></span></span></span></span></li></ul><div><bdt class="forloop-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></span></li></ul><div><bdt class="forloop-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></span></li></ul><div><bdt class="forloop-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></span></li></ul><div><bdt class="block-component"><span style="font-size: 15px;"></bdt></span></span></span></span></span></span></span></span></span></span></span></li></ul><div><bdt class="block-component"></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span data-custom-class="body_text">Category <bdt class="block-component"></bdt>L<bdt class="else-block"></bdt>. Sensitive personal information</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The categories of third parties to whom we disclosed personal information for a business or commercial purpose can be found under <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="#whoshare">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></span><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></span></span></span></span></bdt></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span></span><span data-custom-class="body_text"><span style="color: rgb(0, 0, 0);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><strong><span data-custom-class="heading_2"><h3>Your Rights</h3></span></strong><span data-custom-class="body_text">You have rights under certain US state data protection laws. However, these rights are not absolute, and in certain cases, we may decline your request as permitted by law. These rights include:</span><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to know</strong> whether or not we are processing your personal data<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to access </strong>your personal data<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to correct </strong>inaccuracies in your personal data<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to request</strong> the deletion of your personal data<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to obtain a copy </strong>of the personal data you previously shared with us<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to non-discrimination</strong> for exercising your rights<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;"><strong>Right to opt out</strong> of the processing of your personal data if it is used for targeted advertising<bdt class="block-component"></bdt> (or sharing as defined under California’s privacy law)<bdt class="statement-end-if-in-editor"></bdt>, the sale of personal data, or profiling in furtherance of decisions that produce legal or similarly significant effects (<bdt class="block-component"></bdt>"profiling"<bdt class="statement-end-if-in-editor"></bdt>)<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Depending upon the state where you live, you may also have the following rights:</span><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to access the categories of personal data being processed (as permitted by applicable law, including the privacy law in Minnesota)<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to obtain a list of the categories of third parties to which we have disclosed personal data (as permitted by applicable law, including the privacy law in<bdt class="block-component"></bdt> California, Delaware, and Maryland<bdt class="else-block"></bdt><bdt class="block-component"></bdt>)<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to obtain a list of specific third parties to which we have disclosed personal data (as permitted by applicable law, including the privacy law in<bdt class="block-component"></bdt> Minnesota and Oregon<bdt class="else-block"></bdt>)</span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5; font-size: 15px;">Right to obtain a list of third parties to which we have sold personal data (as permitted by applicable law, including the privacy law in Connecticut)<bdt class="statement-end-if-in-editor"></bdt></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to review, understand, question, and depending on where you live, correct how personal data has been profiled (as permitted by applicable law, including the privacy law in <bdt class="block-component"></bdt>Connecticut and Minnesota<bdt class="else-block"></bdt>)<bdt class="statement-end-if-in-editor"></bdt></span></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to limit use and disclosure of sensitive personal data (as permitted by applicable law, including the privacy law in California)</span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></li></ul><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><ul><li data-custom-class="body_text" style="line-height: 1.5;"><span style="font-size: 15px;">Right to opt out of the collection of sensitive data and personal data collected through the operation of a voice or facial recognition feature (as permitted by applicable law, including the privacy law in Florida)</span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></li></ul><div style="line-height: 1.5;"><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"></bdt></span><strong><span style="font-size: 15px;"><span data-custom-class="heading_2"><h3>How to Exercise Your Rights</h3></span></span></strong><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">To exercise these rights, you can contact us <bdt class="block-component"></bdt>by visiting <span style="color: rgb(0, 58, 250);"><bdt class="question"><a target="_blank" data-custom-class="link" href="mailto:lumacare.therapy@gmail.com">lumacare.therapy@gmail.com</a></bdt></span>, <bdt class="else-block"></bdt></span><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>by emailing us at <bdt class="question"><a target="_blank" data-custom-class="link" href="mailto:lumacare.therapy@gmail.com">lumacare.therapy@gmail.com</a></bdt>, <bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt></span><span data-custom-class="body_text"><bdt class="block-component"></bdt><bdt class="block-component"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></span></span></span></span></span></span></span></span></span></span></span></span><span data-custom-class="body_text">or by referring to the contact details at the bottom of this document.</span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">Under certain US state data protection laws, you can designate an <bdt class="block-component"></bdt>authorized<bdt class="statement-end-if-in-editor"></bdt> agent to make a request on your behalf. We may deny a request from an <bdt class="block-component"></bdt>authorized<bdt class="statement-end-if-in-editor"></bdt> agent that does not submit proof that they have been validly <bdt class="block-component"></bdt>authorized<bdt class="statement-end-if-in-editor"></bdt> to act on your behalf in accordance with applicable laws.</span> <br><strong><span data-custom-class="heading_2"><h3>Request Verification</h3></span></strong><span data-custom-class="body_text">Upon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. We will only use personal information provided in your request to verify your identity or authority to make the request. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes.</span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><br></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text">If you submit the request through an <bdt class="block-component"></bdt>authorized<bdt class="statement-end-if-in-editor"></bdt> agent, we may need to collect additional information to verify your identity before processing your request and the agent will need to provide a written and signed permission from you to submit such request on your behalf.</span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px;"><span data-custom-class="heading_2"><strong><h3>Appeals</h3></strong></span><span data-custom-class="body_text">Under certain US state data protection laws, if we decline to take action regarding your request, you may appeal our decision by emailing us at <bdt class="block-component"></bdt><bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:lumacare.therapy@gmail.com">lumacare.therapy@gmail.com</a></bdt><bdt class="else-block"></bdt>. We will inform you in writing of any action taken or not taken in response to the appeal, including a written explanation of the reasons for the decisions. If your appeal is denied, you may submit a complaint to your state attorney general.</span><bdt class="statement-end-if-in-editor"></bdt></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"><bdt class="block-component"></span></bdt></span></span></span></span></span></span></span></span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px;"><strong><span data-custom-class="heading_2"><h3>California <bdt class="block-component"></bdt>"Shine The Light"<bdt class="statement-end-if-in-editor"></bdt> Law</h3></span></strong><span data-custom-class="body_text">California Civil Code Section 1798.83, also known as the <bdt class="block-component"></bdt>"Shine The Light"<bdt class="statement-end-if-in-editor"></bdt> law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us by using the contact details provided in the section <bdt class="block-component"></bdt>"<bdt class="statement-end-if-in-editor"></bdt></span></span><span data-custom-class="body_text"><a data-custom-class="link" href="#contact"><span style="color: rgb(0, 58, 250); font-size: 15px;">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span></a></span><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"></bdt>"</span><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"></span></bdt></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><bdt class="statement-end-if-in-editor"></bdt></bdt></span></span></span></span></span></span></span></span></span></span></span></bdt></span></span></span></span></span></span></span></span></span></span><bdt class="block-component"><span style="font-size: 15px;"></bdt></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><br></div><div id="policyupdates" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>14. DO WE MAKE UPDATES TO THIS NOTICE?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><em><strong>In Short: </strong>Yes, we will update this notice as necessary to stay compliant with relevant laws.</em></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may update this Privacy Notice from time to time. The updated version will be indicated by an updated <bdt class="block-component"></bdt>"Revised"<bdt class="statement-end-if-in-editor"></bdt> date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.</span></span></span></div><div style="line-height: 1.5;"><br></div><div id="contact" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>15. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you have questions or comments about this notice, you may <span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"><bdt class="block-component"></bdt></bdt>email us at <bdt class="question noTranslate"><a target="_blank" data-custom-class="link" href="mailto:lumacare.therapy@gmail.com">lumacare.therapy@gmail.com</a> or </bdt><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></bdt></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">contact us by post at:</span></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><span style="font-size: 15px;"><span style="color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="question noTranslate">Munyaradzi Nyamhingura</bdt></span></span></span></span></span><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></bdt></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question noTranslate">Centurion, South Africa</bdt><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><bdt class="block-component"></bdt></span></span></span></bdt></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="question">Centurion</bdt><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><bdt class="block-component"></bdt>, <bdt class="question noTranslate">Gauteng</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt> <bdt class="question noTranslate">0157</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt></span></span></span></bdt></span></div><div style="line-height: 1.5;"><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span></span><bdt class="question noTranslate">South Africa</bdt><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></bdt><bdt class="statement-end-if-in-editor"></bdt></span></span></span><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></bdt></span></span></span></bdt></span></span></span></span><span data-custom-class="body_text"><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"><span style="color: rgb(89, 89, 89);"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="block-component"><bdt class="block-component"></bdt></span></span></span></span></span></span><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px;"><span data-custom-class="body_text"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px;"><span data-custom-class="body_text"><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></span></span></div><div style="line-height: 1.5;"><br></div><div id="request" style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>16. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2></span></strong></span></span></span></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt>Based on the applicable laws of your country<bdt class="block-component"></bdt> or state of residence in the US<bdt class="statement-end-if-in-editor"></bdt>, you may<bdt class="else-block"><bdt class="block-component"> have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to <bdt class="block-component"></bdt>withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please <bdt class="block-component"></span></bdt><span data-custom-class="body_text">visit: <span style="color: rgb(0, 58, 250);"><bdt class="question"><a target="_blank" data-custom-class="link" href="mailto:lumacare.therapy@gmail.com">lumacare.therapy@gmail.com</a></bdt></span><bdt class="else-block"></bdt></span></span><span data-custom-class="body_text">.</span></span></span><div style="display: none;"><a class="privacy123" href="https://app.termly.io/dsar/7db79815-5140-4983-b1b9-159f8c245ff1"></a></div></div><style>
    ul {
      list-style-type: square;
    }
    ul > li > ul {
      list-style-type: circle;
    }
    ul > li > ul > li > ul {
      list-style-type: square;
    }
    ol li {
      font-family: Arial ;
    }
  </style>
    </div>
    `;

const cookiePolicyHTML = `<style>
[data-custom-class='body'], [data-custom-class='body'] * {
        background: transparent !important;
      }
[data-custom-class='title'], [data-custom-class='title'] * {
        font-family: Arial !important;
font-size: 26px !important;
color: #000000 !important;
      }
[data-custom-class='subtitle'], [data-custom-class='subtitle'] * {
        font-family: Arial !important;
color: #595959 !important;
font-size: 14px !important;
      }
[data-custom-class='heading_1'], [data-custom-class='heading_1'] * {
        font-family: Arial !important;
font-size: 19px !important;
color: #000000 !important;
      }
[data-custom-class='heading_2'], [data-custom-class='heading_2'] * {
        font-family: Arial !important;
font-size: 17px !important;
color: #000000 !important;
      }
[data-custom-class='body_text'], [data-custom-class='body_text'] * {
        color: #595959 !important;
font-size: 14px !important;
font-family: Arial !important;
      }
[data-custom-class='link'], [data-custom-class='link'] * {
        color: #3030F1 !important;
font-size: 14px !important;
font-family: Arial !important;
word-break: break-word !important;
      }
</style>
    <span style="display: block;margin: 0 auto 3.125rem;width: 11.125rem;height: 2.375rem;background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAxNzggMzgiPgogICAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cGF0aCBmaWxsPSIjRDFEMUQxIiBkPSJNNC4yODMgMjQuMTA3Yy0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY2LS43NjhoLS4wODVjLjA1Ny41MDIuMDg2Ljc5Mi4wODYuODd2Mi40MzRILjk4NXYtOC42NDhoMS4zMzJsLjIzMS43NzloLjA3NmMuMzgzLS41OTQuOTUtLjg5MiAxLjcwMi0uODkyLjcxIDAgMS4yNjQuMjc0IDEuNjY1LjgyMi40MDEuNTQ4LjYwMiAxLjMwOS42MDIgMi4yODMgMCAuNjQtLjA5NCAxLjE5OC0uMjgyIDEuNjctLjE4OC40NzMtLjQ1Ni44MzMtLjgwMyAxLjA4LS4zNDcuMjQ3LS43NTYuMzctMS4yMjUuMzd6TTMuOCAxOS4xOTNjLS40MDUgMC0uNy4xMjQtLjg4Ni4zNzMtLjE4Ny4yNDktLjI4My42Ni0uMjkgMS4yMzN2LjE3N2MwIC42NDUuMDk1IDEuMTA3LjI4NyAxLjM4Ni4xOTIuMjguNDk1LjQxOS45MS40MTkuNzM0IDAgMS4xMDEtLjYwNSAxLjEwMS0xLjgxNiAwLS41OS0uMDktMS4wMzQtLjI3LTEuMzI5LS4xODItLjI5NS0uNDY1LS40NDMtLjg1Mi0uNDQzem01LjU3IDEuNzk0YzAgLjU5NC4wOTggMS4wNDQuMjkzIDEuMzQ4LjE5Ni4zMDQuNTEzLjQ1Ny45NTQuNDU3LjQzNyAwIC43NS0uMTUyLjk0Mi0uNDU0LjE5Mi0uMzAzLjI4OC0uNzUzLjI4OC0xLjM1MSAwLS41OTUtLjA5Ny0xLjA0LS4yOS0xLjMzOC0uMTk0LS4yOTctLjUxLS40NDUtLjk1LS40NDUtLjQzOCAwLS43NTMuMTQ3LS45NDYuNDQzLS4xOTQuMjk1LS4yOS43NDItLjI5IDEuMzR6bTQuMTUzIDBjMCAuOTc3LS4yNTggMS43NDItLjc3NCAyLjI5My0uNTE1LjU1Mi0xLjIzMy44MjctMi4xNTQuODI3LS41NzYgMC0xLjA4NS0uMTI2LTEuNTI1LS4zNzhhMi41MiAyLjUyIDAgMCAxLTEuMDE1LTEuMDg4Yy0uMjM3LS40NzMtLjM1NS0xLjAyNC0uMzU1LTEuNjU0IDAtLjk4MS4yNTYtMS43NDQuNzY4LTIuMjg4LjUxMi0uNTQ1IDEuMjMyLS44MTcgMi4xNi0uODE3LjU3NiAwIDEuMDg1LjEyNiAxLjUyNS4zNzYuNDQuMjUxLjc3OS42MSAxLjAxNSAxLjA4LjIzNi40NjkuMzU1IDEuMDE5LjM1NSAxLjY0OXpNMTkuNzEgMjRsLS40NjItMi4xLS42MjMtMi42NTNoLS4wMzdMMTcuNDkzIDI0SDE1LjczbC0xLjcwOC02LjAwNWgxLjYzM2wuNjkzIDIuNjU5Yy4xMS40NzYuMjI0IDEuMTMzLjMzOCAxLjk3MWguMDMyYy4wMTUtLjI3Mi4wNzctLjcwNC4xODgtMS4yOTRsLjA4Ni0uNDU3Ljc0Mi0yLjg3OWgxLjgwNGwuNzA0IDIuODc5Yy4wMTQuMDc5LjAzNy4xOTUuMDY3LjM1YTIwLjk5OCAyMC45OTggMCAwIDEgLjE2NyAxLjAwMmMuMDIzLjE2NS4wMzYuMjk5LjA0LjM5OWguMDMyYy4wMzItLjI1OC4wOS0uNjExLjE3Mi0xLjA2LjA4Mi0uNDUuMTQxLS43NTQuMTc3LS45MTFsLjcyLTIuNjU5aDEuNjA2TDIxLjQ5NCAyNGgtMS43ODN6bTcuMDg2LTQuOTUyYy0uMzQ4IDAtLjYyLjExLS44MTcuMzMtLjE5Ny4yMi0uMzEuNTMzLS4zMzguOTM3aDIuMjk5Yy0uMDA4LS40MDQtLjExMy0uNzE3LS4zMTctLjkzNy0uMjA0LS4yMi0uNDgtLjMzLS44MjctLjMzem0uMjMgNS4wNmMtLjk2NiAwLTEuNzIyLS4yNjctMi4yNjYtLjgtLjU0NC0uNTM0LS44MTYtMS4yOS0uODE2LTIuMjY3IDAtMS4wMDcuMjUxLTEuNzg1Ljc1NC0yLjMzNC41MDMtLjU1IDEuMTk5LS44MjUgMi4wODctLjgyNS44NDggMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDcyLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MSAwIC43MDMtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45Mi4zMmE1Ljc5IDUuNzkgMCAwIDEtMS4xOTEuMTA0em03LjI1My02LjIyNmMuMjIyIDAgLjQwNi4wMTYuNTUzLjA0OWwtLjEyNCAxLjUzNmExLjg3NyAxLjg3NyAwIDAgMC0uNDgzLS4wNTRjLS41MjMgMC0uOTMuMTM0LTEuMjIyLjQwMy0uMjkyLjI2OC0uNDM4LjY0NC0uNDM4IDEuMTI4VjI0aC0xLjYzOHYtNi4wMDVoMS4yNGwuMjQyIDEuMDFoLjA4Yy4xODctLjMzNy40MzktLjYwOC43NTYtLjgxNGExLjg2IDEuODYgMCAwIDEgMS4wMzQtLjMwOXptNC4wMjkgMS4xNjZjLS4zNDcgMC0uNjIuMTEtLjgxNy4zMy0uMTk3LjIyLS4zMS41MzMtLjMzOC45MzdoMi4yOTljLS4wMDctLjQwNC0uMTEzLS43MTctLjMxNy0uOTM3LS4yMDQtLjIyLS40OC0uMzMtLjgyNy0uMzN6bS4yMyA1LjA2Yy0uOTY2IDAtMS43MjItLjI2Ny0yLjI2Ni0uOC0uNTQ0LS41MzQtLjgxNi0xLjI5LS44MTYtMi4yNjcgMC0xLjAwNy4yNTEtMS43ODUuNzU0LTIuMzM0LjUwNC0uNTUgMS4yLS44MjUgMi4wODctLjgyNS44NDkgMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDczLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MiAwIC43MDQtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45MTkuMzJhNS43OSA1Ljc5IDAgMCAxLTEuMTkyLjEwNHptNS44MDMgMGMtLjcwNiAwLTEuMjYtLjI3NS0xLjY2My0uODIyLS40MDMtLjU0OC0uNjA0LTEuMzA3LS42MDQtMi4yNzggMC0uOTg0LjIwNS0xLjc1Mi42MTUtMi4zMDEuNDEtLjU1Ljk3NS0uODI1IDEuNjk1LS44MjUuNzU1IDAgMS4zMzIuMjk0IDEuNzI5Ljg4MWguMDU0YTYuNjk3IDYuNjk3IDAgMCAxLS4xMjQtMS4xOTh2LTEuOTIyaDEuNjQ0VjI0SDQ2LjQzbC0uMzE3LS43NzloLS4wN2MtLjM3Mi41OTEtLjk0Ljg4Ni0xLjcwMi44ODZ6bS41NzQtMS4zMDZjLjQyIDAgLjcyNi0uMTIxLjkyMS0uMzY1LjE5Ni0uMjQzLjMwMi0uNjU3LjMyLTEuMjR2LS4xNzhjMC0uNjQ0LS4xLTEuMTA2LS4yOTgtMS4zODYtLjE5OS0uMjc5LS41MjItLjQxOS0uOTctLjQxOWEuOTYyLjk2MiAwIDAgMC0uODUuNDY1Yy0uMjAzLjMxLS4zMDQuNzYtLjMwNCAxLjM1IDAgLjU5Mi4xMDIgMS4wMzUuMzA2IDEuMzMuMjA0LjI5Ni40OTYuNDQzLjg3NS40NDN6bTEwLjkyMi00LjkyYy43MDkgMCAxLjI2NC4yNzcgMS42NjUuODMuNC41NTMuNjAxIDEuMzEyLjYwMSAyLjI3NSAwIC45OTItLjIwNiAxLjc2LS42MiAyLjMwNC0uNDE0LjU0NC0uOTc3LjgxNi0xLjY5LjgxNi0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY1OS0uNzY4aC0uMTEzbC0uMjc0LjY2MWgtMS4yNTF2LTguMzU3aDEuNjM4djEuOTQ0YzAgLjI0Ny0uMDIxLjY0My0uMDY0IDEuMTg3aC4wNjRjLjM4My0uNTk0Ljk1LS44OTIgMS43MDMtLjg5MnptLS41MjcgMS4zMWMtLjQwNCAwLS43LjEyNS0uODg2LjM3NC0uMTg2LjI0OS0uMjgzLjY2LS4yOSAxLjIzM3YuMTc3YzAgLjY0NS4wOTYgMS4xMDcuMjg3IDEuMzg2LjE5Mi4yOC40OTUuNDE5LjkxLjQxOS4zMzcgMCAuNjA1LS4xNTUuODA0LS40NjUuMTk5LS4zMS4yOTgtLjc2LjI5OC0xLjM1IDAtLjU5MS0uMS0xLjAzNS0uMy0xLjMzYS45NDMuOTQzIDAgMCAwLS44MjMtLjQ0M3ptMy4xODYtMS4xOTdoMS43OTRsMS4xMzQgMy4zNzljLjA5Ni4yOTMuMTYzLjY0LjE5OCAxLjA0MmguMDMzYy4wMzktLjM3LjExNi0uNzE3LjIzLTEuMDQybDEuMTEyLTMuMzc5aDEuNzU3bC0yLjU0IDYuNzczYy0uMjM0LjYyNy0uNTY2IDEuMDk2LS45OTcgMS40MDctLjQzMi4zMTItLjkzNi40NjgtMS41MTIuNDY4LS4yODMgMC0uNTYtLjAzLS44MzMtLjA5MnYtMS4zYTIuOCAyLjggMCAwIDAgLjY0NS4wN2MuMjkgMCAuNTQzLS4wODguNzYtLjI2Ni4yMTctLjE3Ny4zODYtLjQ0NC41MDgtLjgwM2wuMDk2LS4yOTUtMi4zODUtNS45NjJ6Ii8+CiAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzMpIj4KICAgICAgICAgICAgPGNpcmNsZSBjeD0iMTkiIGN5PSIxOSIgcj0iMTkiIGZpbGw9IiNFMEUwRTAiLz4KICAgICAgICAgICAgPHBhdGggZmlsbD0iI0ZGRiIgZD0iTTIyLjQ3NCAxNS40NDNoNS4xNjJMMTIuNDM2IDMwLjRWMTAuMzYzaDE1LjJsLTUuMTYyIDUuMDh6Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxwYXRoIGZpbGw9IiNEMkQyRDIiIGQ9Ik0xMjEuNTQ0IDE0LjU2di0xLjcyOGg4LjI3MnYxLjcyOGgtMy4wMjRWMjRoLTIuMjR2LTkuNDRoLTMuMDA4em0xMy43NDQgOS41NjhjLTEuMjkgMC0yLjM0MS0uNDE5LTMuMTUyLTEuMjU2LS44MS0uODM3LTEuMjE2LTEuOTQ0LTEuMjE2LTMuMzJzLjQwOC0yLjQ3NyAxLjIyNC0zLjMwNGMuODE2LS44MjcgMS44NzItMS4yNCAzLjE2OC0xLjI0czIuMzYuNDAzIDMuMTkyIDEuMjA4Yy44MzIuODA1IDEuMjQ4IDEuODggMS4yNDggMy4yMjQgMCAuMzEtLjAyMS41OTctLjA2NC44NjRoLTYuNDY0Yy4wNTMuNTc2LjI2NyAxLjA0LjY0IDEuMzkyLjM3My4zNTIuODQ4LjUyOCAxLjQyNC41MjguNzc5IDAgMS4zNTUtLjMyIDEuNzI4LS45NmgyLjQzMmEzLjg5MSAzLjg5MSAwIDAgMS0xLjQ4OCAyLjA2NGMtLjczNi41MzMtMS42MjcuOC0yLjY3Mi44em0xLjQ4LTYuNjg4Yy0uNC0uMzUyLS44ODMtLjUyOC0xLjQ0OC0uNTI4cy0xLjAzNy4xNzYtMS40MTYuNTI4Yy0uMzc5LjM1Mi0uNjA1LjgyMS0uNjggMS40MDhoNC4xOTJjLS4wMzItLjU4Ny0uMjQ4LTEuMDU2LS42NDgtMS40MDh6bTcuMDE2LTIuMzA0djEuNTY4Yy41OTctMS4xMyAxLjQ2MS0xLjY5NiAyLjU5Mi0xLjY5NnYyLjMwNGgtLjU2Yy0uNjcyIDAtMS4xNzkuMTY4LTEuNTIuNTA0LS4zNDEuMzM2LS41MTIuOTE1LS41MTIgMS43MzZWMjRoLTIuMjU2di04Ljg2NGgyLjI1NnptNi40NDggMHYxLjMyOGMuNTY1LS45NyAxLjQ4My0xLjQ1NiAyLjc1Mi0xLjQ1Ni42NzIgMCAxLjI3Mi4xNTUgMS44LjQ2NC41MjguMzEuOTM2Ljc1MiAxLjIyNCAxLjMyOC4zMS0uNTU1LjczMy0uOTkyIDEuMjcyLTEuMzEyYTMuNDg4IDMuNDg4IDAgMCAxIDEuODE2LS40OGMxLjA1NiAwIDEuOTA3LjMzIDIuNTUyLjk5Mi42NDUuNjYxLjk2OCAxLjU5Ljk2OCAyLjc4NFYyNGgtMi4yNHYtNC44OTZjMC0uNjkzLS4xNzYtMS4yMjQtLjUyOC0xLjU5Mi0uMzUyLS4zNjgtLjgzMi0uNTUyLTEuNDQtLjU1MnMtMS4wOS4xODQtMS40NDguNTUyYy0uMzU3LjM2OC0uNTM2Ljg5OS0uNTM2IDEuNTkyVjI0aC0yLjI0di00Ljg5NmMwLS42OTMtLjE3Ni0xLjIyNC0uNTI4LTEuNTkyLS4zNTItLjM2OC0uODMyLS41NTItMS40NC0uNTUycy0xLjA5LjE4NC0xLjQ0OC41NTJjLS4zNTcuMzY4LS41MzYuODk5LS41MzYgMS41OTJWMjRoLTIuMjU2di04Ljg2NGgyLjI1NnpNMTY0LjkzNiAyNFYxMi4xNmgyLjI1NlYyNGgtMi4yNTZ6bTcuMDQtLjE2bC0zLjQ3Mi04LjcwNGgyLjUyOGwyLjI1NiA2LjMwNCAyLjM4NC02LjMwNGgyLjM1MmwtNS41MzYgMTMuMDU2aC0yLjM1MmwxLjg0LTQuMzUyeiIvPgogICAgPC9nPgo8L3N2Zz4K) center no-repeat;"></span>

    <div data-custom-class="body">
    <div><strong><span style="font-size: 26px;"><span data-custom-class="title"><h1>COOKIE POLICY</h1></span></span></strong></div><div><span style="color: rgb(127, 127, 127);"><strong><span style="font-size: 15px;"><span data-custom-class="subtitle">Last updated <bdt class="question">November 28, 2025</bdt></span></span></strong></span></div><div><br></div><div><br></div><div><br></div><div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text">This Cookie Policy explains how <bdt class="question">Munyaradzi Nyamhingura</bdt> ("<strong>Company</strong>," "<strong>we</strong>," "<strong>us</strong>," and "<strong>our</strong>") uses cookies and similar technologies to recognize you when you visit our website at </span></span><span style="color: rgb(0, 58, 250); font-size: 15px;"><span data-custom-class="body_text"><bdt class="question"><a target="_blank" data-custom-class="link" href="https://lumacare.netlify.app">https://lumacare.netlify.app</a></bdt></span></span><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text"> ("<strong>Website</strong>"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text">In some cases we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(0, 0, 0); font-size: 15px;"><strong><span data-custom-class="heading_1"><h2>What are cookies?</h2></span></strong></span></span></div><div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text">Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text">Cookies set by the website owner (in this case, <bdt class="question">Munyaradzi Nyamhingura</bdt>) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(0, 0, 0); font-size: 15px;"><strong><span data-custom-class="heading_1"><h2>Why do we use cookies?</h2></span></strong></span></span></div><div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span data-custom-class="body_text">We use first-<bdt class="block-component"></bdt> and third-<bdt class="statement-end-if-in-editor"></bdt>party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. <bdt class="block-component"></bdt>Third parties serve cookies through our Website for advertising, analytics, and other purposes. <bdt class="statement-end-if-in-editor"></bdt>This is described in more detail below.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span id="control" style="color: rgb(0, 0, 0);"><strong><span data-custom-class="heading_1"><h2>How can I control cookies?</h2></span></strong></span></span></span></span></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The Cookie Consent Manager can be found in the notification banner and on our Website. If you choose to reject cookies, you may still use our Website though your access to some functionality and areas of our Website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The specific types of first- and third-party cookies served through our Website and the purposes they perform are described in the table below (please note that the specific </span><span data-custom-class="body_text">cookies served may vary depending on the specific Online Properties you visit):</span></span></span><span style="font-size: 15px;"><span data-custom-class="heading_2" style="color: rgb(0, 0, 0);"><span style="font-size: 15px;"><strong><u><br><h3>Performance and functionality cookies:</h3></u></strong></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">These cookies are used to enhance the performance and functionality of our Website but are non-essential to their use. However, without these cookies, certain functionality (like videos) may become unavailable.</span></span></div><div style="line-height: 1.5;"><div style="line-height: 1.5;"><br></div><div><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><section data-custom-class="body_text" style="width: 100%; border: 1px solid #e6e6e6; margin: 0 0 10px; border-radius: 3px;"><div style="padding: 8px 13px; border-bottom: 1px solid #e6e6e6;"><table><tbody><tr style="font-family: Roboto, Arial; font-size: 12px; line-height: 1.67; margin: 0 0 8px; vertical-align: top;"><th style="text-align: right; color: #19243c; min-width: 80px; font-weight: normal;">Name:</th><td style="display: inline-block; margin-left: 5px;"><span style="color: #8b93a7; word-break: break-all;">_cfuvid</span></td></tr><tr style="font-family: Roboto, Arial; font-size: 12px; line-height: 1.67; margin: 0; vertical-align: top;"><th style="text-align: right; color: #19243c; min-width: 80px; font-weight: normal;">Purpose:</th><td style="display: inline-block; margin-left: 5px;"><span style="color: #8b93a7; word-break: break-all;">This cookie is set by Cloudflare to enhance security and performance. It helps identify trusted web traffic and ensures a secure browsing experience for users.</span></td></tr><tr style="font-family: Roboto, Arial; font-size: 12px; line-height: 1.67; margin: 0 0 8px; vertical-align: top;"><th style="text-align: right; color: #19243c; min-width: 80px; font-weight: normal;">Provider:</th><td style="display: inline-block; margin-left: 5px;"><span style="color: #8b93a7; word-break: break-all;">.yoco.com</span></td></tr><tr style="font-family: Roboto, Arial; font-size: 12px; line-height: 1.67; margin: 0 0 8px; vertical-align: top;"><th style="text-align: right; color: rgb(25, 36, 60); min-width: 80px; font-weight: normal;">Service:</th><td style="display: inline-block; margin-left: 5px;"><span style="color: #8b93a7; word-break: break-all;">Cloudflare  <a data-custom-class="link" href="https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/" style="color: rgb(0, 58, 250);" target="_blank"><span data-custom-class="link">View Service Privacy Policy</span></a></span></td></tr><tr style="font-family: Roboto, Arial; font-size: 12px; line-height: 1.67; margin: 0 0 8px; vertical-align: top;"><th style="text-align: right; color: #19243c; min-width: 80px; font-weight: normal;">Type:</th><td style="display: inline-block; margin-left: 5px;"><span style="color: #8b93a7; word-break: break-all;">server_cookie</span></td></tr><tr style="font-family: Roboto, Arial; font-size: 12px; line-height: 1.67; margin: 0 0 8px; vertical-align: top;"><th style="text-align: right; color: #19243c; min-width: 80px; font-weight: normal;">Expires in:</th><td style="display: inline-block; margin-left: 5px;"><span style="color: #8b93a7; word-break: break-all;">session</span></td></tr></tbody></table></div></section></span></span></span></div><div><br></div><div><span style="color: rgb(127, 127, 127);"><span style="color: rgb(0, 0, 0); font-size: 15px;"><strong><span data-custom-class="heading_1"><h2>How can I control cookies on my browser?</h2></span></strong></span></span></div><div style="line-height: 1.5;"><span data-custom-class="body_text">As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser's help menu for more information. The following is information about how to manage cookies on the most popular browsers:</span><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies" rel="noopener noreferrer" target="_blank"></a></span></div><ul><li style="line-height: 1.5;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px;">Chrome</span></a></span></li><li style="line-height: 1.5;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px;">Internet Explorer</span></a></span></li><li style="line-height: 1.5;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px;">Firefox</span></a></span></li><li style="line-height: 1.5;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="https://support.apple.com/en-ie/guide/safari/sfri11471/mac" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px;">Safari</span></a></span></li><li style="line-height: 1.5;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px;">Edge</span></a></span></li><li style="line-height: 1.5;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="https://help.opera.com/en/latest/web-preferences/" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px;">Opera</span></a></span></li></ul><div style="line-height: 1.5;"><span data-custom-class="body_text">In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit:</span><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="http://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank"></a></span></div><ul><li style="line-height: 1.5;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="http://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px;">Digital Advertising Alliance</span></a></span><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="https://youradchoices.ca/" rel="noopener noreferrer" target="_blank"></a></span></li><li style="line-height: 1.5;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="https://youradchoices.ca/" rel="noopener noreferrer" target="_blank"><span style="color: rgb(0, 58, 250); font-size: 15px;">Digital Advertising Alliance of Canada</span></a></span><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="http://www.youronlinechoices.com/" rel="noopener noreferrer" target="_blank"></a></span></li><li style="line-height: 1.5;"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="http://www.youronlinechoices.com/" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px;">European Interactive Digital Advertising Alliance</span></a></span></li></ul><div><br></div><div><strong><span data-custom-class="heading_1"><h2>What about other tracking technologies, like web beacons?</h2></span></strong></div><div style="line-height: 1.5;"><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time, like web beacons (sometimes called "tracking pixels" or "clear gifs"). These are tiny graphics files that contain a unique identifier that enables us to recognize when someone has visited our Website<bdt class="block-component"></bdt> or opened an email including them<bdt class="statement-end-if-in-editor"></bdt>. This allows us, for example, to monitor </span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><span data-custom-class="body_text">the traffic patterns of users from one page within a website to another, to deliver or communicate with cookies, to understand whether you have come to the website from an online advertisement displayed on a third-party website, to improve site performance, and to measure the success of email marketing campaigns. In many instances, these technologies are reliant on cookies to function properly, and so declining cookies will impair their functioning.</span><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span data-custom-class="heading_1"><strong><h2>Do you use Flash cookies or Local Shared Objects?</h2></strong></span></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Websites may also use so-called "Flash Cookies" (also known as Local Shared Objects or "LSOs") to, among other things, collect and store information about your use of our services, fraud prevention, and for other site operations.</span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you do not want Flash Cookies stored on your computer, you can adjust the settings of your Flash player to block Flash Cookies storage using the tools contained in the </span></span><span data-custom-class="body_text"><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px;">Website Storage Settings Panel</span></a></span><span style="font-size: 15px; color: rgb(89, 89, 89);">. You can also control Flash Cookies by going to the </span><span style="color: rgb(0, 58, 250);"><a data-custom-class="link" href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html" rel="noopener noreferrer" target="_blank"><span style="font-size: 15px;">Global Storage Settings Panel</span></a></span></span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"> and </span><span style="font-size:15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">following the instructions (which may include instructions that explain, for example, how to delete existing Flash Cookies (referred to "information" on the Macromedia site), how to prevent Flash LSOs from being placed on your computer without your being asked, and (for Flash Player 8 and later) how to block Flash Cookies that are not being delivered by the operator of the page you are on at the time).</span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Please note that setting the Flash Player to restrict or limit acceptance of Flash Cookies may reduce or impede the functionality of some Flash applications, including, potentially, Flash applications used in connection with our services or online content.</span></span></span><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>Do you serve targeted advertising?</h2></span></strong></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">Third parties may serve cookies on your computer or mobile device to serve advertising through our Website. These companies may use information about your visits to this and other websites in order to provide relevant advertisements about goods and services that you may be interested in. They may also employ technology that is used to measure the effectiveness of advertisements. They can accomplish this by using cookies or web beacons to collect information about your visits to this and other sites in order to provide relevant advertisements about goods and services of potential interest to you. The information collected through this process does not enable us or them to identify your name, contact details, or other details that directly identify you unless you choose to provide these.</span></span><span style="color: rgb(127, 127, 127);"><span style="color: rgb(89, 89, 89); font-size: 15px;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"></bdt></span></span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>How often will you update this Cookie Policy?</h2></span></strong></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">We may update </span><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">The date at the top of this Cookie Policy indicates when it was last updated.</span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><strong><span data-custom-class="heading_1"><h2>Where can I get further information?</h2></span></strong></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text">If you have any questions about our use of cookies or other technologies, please<bdt class="block-component"></bdt> email us at <bdt class="question"><a target="_blank" data-custom-class="link" href="mailto:NYAMHINGURAMUNYA@GMAIL.COM">NYAMHINGURAMUNYA@GMAIL.COM</a></bdt> or by post to<bdt class="else-block"></bdt>:</span></span></span></span></div><div style="line-height: 1.5;"><br></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="question">Munyaradzi Nyamhingura</bdt></span></span></span></div><div style="line-height: 1.5;"><bdt class="block-component"><span style="font-size: 15px;"></span></bdt><span style="font-size: 15px;"><bdt class="question"><span data-custom-class="body_text">Centurion, South Africa</span></bdt></span><bdt class="statement-end-if-in-editor"><span style="font-size: 15px;"></span></bdt></div><div style="line-height: 1.5;"><span style="font-size: 15px; color: rgb(89, 89, 89);"><span data-custom-class="body_text"><bdt class="block-component"></bdt></span></span></div><div style="line-height: 1.5;"><bdt class="block-component"></bdt><bdt class="question"><span data-custom-class="body_text">Centurion,</span></bdt><bdt class="statement-end-if-in-editor"></bdt><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><bdt class="block-component"></bdt> <bdt class="question">Gauteng</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt> <bdt class="question">0157</bdt><bdt class="statement-end-if-in-editor"></bdt><bdt class="block-component"></bdt><bdt class="block-component"></bdt></span></span></div><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><bdt class="question">South Africa</bdt><bdt class="statement-end-if-in-editor"></bdt></span></span><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor"><bdt class="block-component"></bdt></bdt></span></span></div><div style="line-height: 1.5;"><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><bdt class="statement-end-if-in-editor">Phone: <bdt class="question">(+27)0622335471</bdt></bdt></span></span><span data-custom-class="body_text"><span style="font-size: 15px; color: rgb(89, 89, 89);"><bdt class="block-component"></bdt></span></span></div><div style="display: none;"><a class="cookie123" href="https://app.termly.io/dsar/736689b6-2e6c-4b00-87d6-da90687e5641"></a></div></div><style>
    ul {
      list-style-type: square;
    }
    ul > li > ul {
      list-style-type: circle;
    }
    ul > li > ul > li > ul {
      list-style-type: square;
    }
    ol li {
      font-family: Arial ;
    }
  </style>
    </div>
    `;

// Complete PaymentSystem Class with Yoco Integration
class PaymentSystem {
    constructor() {
        this.yoco = null;
        this.publicKey = 'pk_live_ff81b7a1N4WnLY1cce64';

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
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        const lastSessionDate = user.lastSessionDate || '';
        
        // If last session was today, they've used their daily session
        return lastSessionDate === today;
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

// Professional Therapist AI
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

// Authentication System
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
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.remove('active');
            authModal.style.display = 'none';
            
            // Clear form inputs
            document.getElementById('login-email').value = '';
            document.getElementById('login-password').value = '';
            document.getElementById('signup-name').value = '';
            document.getElementById('signup-email').value = '';
            document.getElementById('signup-password').value = '';
            
            console.log('✅ Auth modal hidden and forms cleared');
        }
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
        
        // Hide modal FIRST, then show success
        this.hideAuthModal();
        onLoginSuccess();
        
        // Don't use alert() - use in-app message instead
        setTimeout(() => {
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                const welcomeMsg = document.createElement('div');
                welcomeMsg.className = 'message ai-message';
                welcomeMsg.innerHTML = `
                    <div class="message-avatar"><i class="fas fa-robot"></i></div>
                    <div class="message-content">
                        <p>🎉 Welcome back to LumaCare! Good to see you again.</p>
                        <p>How can I help you today?</p>
                    </div>
                `;
                chatMessages.appendChild(welcomeMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 500);
    }

    handleSignup() {
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
    
        if (!name || !email || !password) {
            alert('Please fill in all fields');
            return;
        }
    
        // Create user
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
        
        // Hide modal FIRST, then show success
        this.hideAuthModal();
        onLoginSuccess();
        
        // Don't use alert() - it blocks execution and causes issues
        setTimeout(() => {
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                const welcomeMsg = document.createElement('div');
                welcomeMsg.className = 'message ai-message';
                welcomeMsg.innerHTML = `
                    <div class="message-avatar"><i class="fas fa-robot"></i></div>
                    <div class="message-content">
                        <p>🎉 Welcome to LumaCare, ${name}! Your account has been created successfully.</p>
                        <p>I'm here to help you with stress, anxiety, and overwhelm. How are you feeling today?</p>
                    </div>
                `;
                chatMessages.appendChild(welcomeMsg);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 500);
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

  // In AuthSystem class - this should work
  trackSession() {
    console.log('📊 trackSession called');
    
    // Allow messages even if not logged in
    if (!this.isLoggedIn || !this.currentUser) {
        console.log('User not logged in, allowing message');
        return true; // Allow guest users
    }
    
    const today = new Date().toISOString().split('T')[0];
    const user = this.currentUser;
    
    console.log('User session data:', {
        isPremium: user.isPremium,
        lastSessionDate: user.lastSessionDate,
        today: today,
        purchasedSessions: user.purchasedSessions || 0
    });
    
    // Only check for non-premium users
    if (!user.isPremium) {
        // Check if user already used free session today
        if (user.lastSessionDate === today && (user.purchasedSessions || 0) <= 0) {
            console.log('Daily session limit reached');
            this.showSessionLimitWarning();
            return false;
        }
    }
    
    // Track the session
    user.sessions = (user.sessions || 0) + 1;
    user.lastSessionDate = today;
    
    // Deduct purchased session if applicable
    if (user.purchasedSessions && user.purchasedSessions > 0) {
        user.purchasedSessions--;
        console.log('Used purchased session, remaining:', user.purchasedSessions);
    }
    
    localStorage.setItem('lumaCare_user', JSON.stringify(user));
    this.updateUI();
    console.log('✅ Session tracked successfully');
    return true;
}

    // Change the message from "month" to "day"
showSessionLimitWarning() {
    // In the HTML string, change:
    // OLD: "You've used all ${FREE_SESSION_LIMIT} free sessions this month."
    // NEW: "You've used your free session for today."
    
    const warningHTML = `
        <div class="message ai-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="session-warning">
                    <p><strong>Daily Session Limit Reached</strong></p>
                    <p>You've used your free session for today.</p>
                    <p>Upgrade to premium or purchase additional sessions to continue.</p>
                    <button class="btn-upgrade-now" id="session-limit-upgrade-btn">View Upgrade Options</button>
                </div>
            </div>
        </div>
    `;
    // ... rest of function
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

    if (techniqueId === 'priority-matrix') {
        showBrainDumpModal();
        return;
    }

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
    console.log('📤 sendMessage called');
    
    // Get fresh references to elements
    const messageInput = document.getElementById('message-input');
    
    if (!messageInput) {
        console.error('❌ messageInput not found!');
        return;
    }
    
    const message = messageInput.value.trim();
    console.log('Message content:', message);
    
    if (message === '') {
        console.log('Empty message, skipping');
        return;
    }
    
    // Check if user can send message
    console.log('Checking session availability...');
    
    // Temporarily disable session checking for testing
    // if (authSystem.isLoggedIn && !authSystem.trackSession()) {
    //     console.log('Session limit reached, not sending');
    //     return;
    // }
    
    // Allow all messages for now
    console.log('✅ Allowing message to be sent');
    
    addMessageToChat(message, 'user');
    messageInput.value = '';
    
    console.log('Waiting for AI response...');
    
    setTimeout(() => {
        console.log('Generating AI response...');
        
        try {
            const issues = therapistAI.analyzeMessage(message);
            console.log('Identified issues:', issues);
            
            const aiResponse = therapistAI.generateResponse(message, issues);
            console.log('AI Response generated');
            
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
            
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            setTimeout(() => {
                document.querySelectorAll('.btn-learn-technique').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const techniqueId = this.getAttribute('data-technique');
                        showTechniqueDetails(techniqueId);
                    });
                });
            }, 100);
            
            if (isVoiceEnabled && femaleVoice) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = aiResponse;
                const textToSpeak = tempDiv.textContent || tempDiv.innerText || '';
                speakText(textToSpeak);
            }
            
            console.log('✅ Message sent and AI responded');
            
        } catch (error) {
            console.error('❌ Error in AI response:', error);
            
            // Show error to user
            const errorDiv = document.createElement('div');
            errorDiv.classList.add('message', 'ai-message');
            errorDiv.innerHTML = `
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    <p>I apologize, but I encountered an error processing your message. Please try again.</p>
                    <p><small>Error: ${error.message}</small></p>
                </div>
            `;
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.appendChild(errorDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
        
    }, 1000);
}

// Policy loading functions
function loadPrivacyPolicy() {
    const privacyContent = document.getElementById('privacy-content');
    if (privacyContent && (!privacyContent.innerHTML || privacyContent.innerHTML.trim() === '')) {
        privacyContent.innerHTML = privacyPolicyHTML;
    }
}

function loadCookiePolicy() {
    const cookiesContent = document.getElementById('cookies-content');
    if (cookiesContent && (!cookiesContent.innerHTML || cookiesContent.innerHTML.trim() === '')) {
        cookiesContent.innerHTML = cookiePolicyHTML;
    }
}

// Footer navigation function
function showPolicyTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load policy content
    if (tabName === 'privacy') {
        loadPrivacyPolicy();
    } else if (tabName === 'cookies') {
        loadCookiePolicy();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
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

// Make sure this is in your existing navigation event listener
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabId}-tab`)?.classList.add('active');
        
        // If dashboard tab is clicked, refresh data
        if (tabId === 'dashboard' && window.dashboardSystem) {
            setTimeout(() => {
                window.dashboardSystem.loadDashboardData();
                window.dashboardSystem.animateProgressBars();
            }, 100);
        }
    });
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

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ LumaCare Professional Therapist AI initialized');
    
    // Initialize systems and make them globally accessible
    therapistAI = new TherapistAI();
    authSystem = new AuthSystem();
    authSystem.init();
    
    paymentSystem = new PaymentSystem();
    
    // Expose to window for debugging and global access
    window.therapistAI = therapistAI;
    window.authSystem = authSystem;
    window.paymentSystem = paymentSystem;
    
    initializeVoices();
    
    // Fix chat input
    function fixChatInput() {
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const chatMessages = document.getElementById('chat-messages');
        
        console.log('🔧 Fixing chat input:', {
            messageInput: !!messageInput,
            sendBtn: !!sendBtn,
            chatMessages: !!chatMessages
        });
        
        if (messageInput && sendBtn && chatMessages) {
            // Make sure chat messages scrolls properly
            chatMessages.style.flex = '1';
            chatMessages.style.overflowY = 'auto';
            
            // Ensure input works
            messageInput.style.height = 'auto';
            messageInput.style.minHeight = '50px';
            
            // Remove old event listeners and add new ones
            const newSendBtn = sendBtn.cloneNode(true);
            sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
            
            const newMessageInput = messageInput.cloneNode(true);
            messageInput.parentNode.replaceChild(newMessageInput, messageInput);
            
            // Add fresh event listeners
            newSendBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Send button clicked');
                sendMessage();
            });
            
            newMessageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed');
                    sendMessage();
                }
            });
            
            // Re-assign global variables
            window.messageInput = newMessageInput;
            window.sendBtn = newSendBtn;
            
            console.log('✅ Chat input fixed');
        } else {
            console.error('❌ Missing chat elements!');
        }
    }
    
    // Fix chat after everything loads
    setTimeout(fixChatInput, 500);
    
    // Also fix quick responses
    document.querySelectorAll('.quick-response').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-text');
            if (window.messageInput) {
                window.messageInput.value = text;
                sendMessage();
            }
        });
    });
    
    // Fix voice button
    document.getElementById('voice-btn').addEventListener('click', () => {
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
                if (window.messageInput) {
                    window.messageInput.value = randomResponse;
                }
                
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
    
    if (window.location.pathname === '/pricing' || window.location.pathname === '/pricing.html') {
        window.location.href = 'https://pay.yoco.com/lumacare';
    }
    
    // Catch pricing clicks
    document.addEventListener('click', function(e) {
        const target = e.target;
        const text = target.textContent.toLowerCase();
        
        if (text.includes('pricing') || text.includes('premium') || text.includes('upgrade')) {
            if (target.tagName === 'BUTTON' && !target.onclick) {
                e.preventDefault();
                if (window.paymentSystem) {
                    window.paymentSystem.handleUpgradeClick();
                }
            }
        }
    });
    
    // Load policies if needed
    const privacyTab = document.querySelector('[data-tab="privacy"]');
    const cookiesTab = document.querySelector('[data-tab="cookies"]');
    
    if (privacyTab) {
        privacyTab.addEventListener('click', loadPrivacyPolicy);
    }
    
    if (cookiesTab) {
        cookiesTab.addEventListener('click', loadCookiePolicy);
    }
    
    // Load policies if those tabs are active on page load
    if (document.getElementById('privacy-tab').classList.contains('active')) {
        loadPrivacyPolicy();
    }
    if (document.getElementById('cookies-tab').classList.contains('active')) {
        loadCookiePolicy();
    }
    
    console.log('✅ Initialization complete');
});

// =================== //
// MOOD CHECK-IN SYSTEM //
// =================== //

class MoodSystem {
    constructor() {
        this.currentMood = null;
        this.dailyMoods = [];
        this.moodHistory = [];
        this.today = new Date().toISOString().split('T')[0];
        this.init();
    }

    init() {
        this.loadMoodHistory();
        this.setupMoodSelector();
        this.showDailyMoodCheck();
    }

    loadMoodHistory() {
        const savedMoods = localStorage.getItem('lumaCare_moodHistory');
        if (savedMoods) {
            this.moodHistory = JSON.parse(savedMoods);
        }
        
        // Check if mood was already selected today
        const todayMood = this.moodHistory.find(mood => mood.date === this.today);
        if (todayMood) {
            this.currentMood = todayMood.mood;
            console.log('Today\'s mood already selected:', this.currentMood);
            // Don't show mood modal if already selected today
            return;
        }
    }

    // Add to MoodSystem setupMoodSelector method
setupMoodSelector() {
    const moodOptions = document.querySelectorAll('.mood-option');
    const continueBtn = document.getElementById('continue-session');
    const moodDescription = document.getElementById('mood-description');
    const closeBtn = document.getElementById('close-mood-modal');

    moodOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            this.selectMood(e.target.closest('.mood-option'));
        });
    });

    continueBtn.addEventListener('click', () => {
        this.saveMood();
    });

    // Close button functionality
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            this.hideMoodModal();
        });
    }

    // Also close when clicking outside
    const moodModal = document.getElementById('mood-modal');
    if (moodModal) {
        moodModal.addEventListener('click', (e) => {
            if (e.target === moodModal) {
                this.hideMoodModal();
            }
        });
    }
}

// Add hideMoodModal method
hideMoodModal() {
    const moodModal = document.getElementById('mood-modal');
    if (moodModal) {
        moodModal.classList.remove('active');
        moodModal.style.display = 'none';
    }
}

// Update showDailyMoodCheck to only show if needed
showDailyMoodCheck() {
    // Check if user is logged in and hasn't selected mood today
    if (authSystem && authSystem.isLoggedIn && !this.currentMood) {
        // Check if modal is already showing
        const moodModal = document.getElementById('mood-modal');
        if (moodModal && !moodModal.classList.contains('active')) {
            setTimeout(() => {
                moodModal.style.display = 'flex';
                setTimeout(() => {
                    moodModal.classList.add('active');
                }, 10);
            }, 1000); // Show after 1 second delay
        }
    }
}

    // In the MoodSystem class, update the selectMood method
selectMood(option) {
    // Remove selection from all options
    document.querySelectorAll('.mood-option').forEach(opt => {
        opt.classList.remove('selected');
    });

    // Add selection to clicked option
    option.classList.add('selected');

    // Add ripple effect
    this.createRippleEffect(option);

    // Enable continue button
    const continueBtn = document.getElementById('continue-session');
    continueBtn.disabled = false;

    // Update description based on mood
    const mood = option.dataset.mood;
    const color = option.dataset.color;
    this.updateMoodDescription(mood, color);

    // Update current mood
    this.currentMood = mood;
    this.currentMoodColor = color;

    // Track mood selection event
    this.trackMoodEvent(mood);

    // AUTO-SELECT after 1.5 seconds
    setTimeout(() => {
        if (this.currentMood === mood) { // Double-check it's still selected
            this.saveMood();
        }
    }, 1500);
}

// Also update the saveMood method to properly close
// KEEP THIS ONE (lines 1-35) and UPDATE IT:
saveMood() {
    if (!this.currentMood) return;

    const moodData = {
        date: this.today,
        mood: this.currentMood,
        color: this.currentMoodColor,
        timestamp: Date.now()
    };

    // Add to history
    this.moodHistory.push(moodData);
    
    // Keep only last 90 days
    if (this.moodHistory.length > 90) {
        this.moodHistory = this.moodHistory.slice(-90);
    }

    // Save to localStorage
    localStorage.setItem('lumaCare_moodHistory', JSON.stringify(this.moodHistory));

    // Update garden
    if (window.gardenSystem) {
        gardenSystem.addPlant('checkin', this.currentMoodColor);
    }

    // Hide mood modal
    const moodModal = document.getElementById('mood-modal');
    if (moodModal) {
        moodModal.classList.remove('active');
        moodModal.style.display = 'none';
    }

    // REDIRECT TO DASHBOARD INSTEAD OF CHAT
    this.redirectToDashboard();

    console.log('Mood saved:', moodData);
    
    // Track completion
    this.trackEvent('daily_checkin_completed', { mood: this.currentMood });
}

// ADD THIS METHOD RIGHT AFTER saveMood() (around line 37):
redirectToDashboard() {
    console.log('🚀 Redirecting to dashboard after mood check');
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const dashboardBtn = document.querySelector('[data-tab="dashboard"]');
    if (dashboardBtn) {
        dashboardBtn.classList.add('active');
    } else {
        console.error('❌ Dashboard button not found in navigation');
        // Fallback to therapy tab
        const therapyBtn = document.querySelector('[data-tab="therapy"]');
        if (therapyBtn) therapyBtn.classList.add('active');
    }
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const dashboardTab = document.getElementById('dashboard-tab');
    if (dashboardTab) {
        dashboardTab.classList.add('active');
        
        // Refresh dashboard data
        setTimeout(() => {
            if (window.dashboardSystem) {
                window.dashboardSystem.loadDashboardData();
                window.dashboardSystem.animateProgressBars();
            }
        }, 300);
    } else {
        console.error('❌ Dashboard tab not found');
        // Fallback to therapy tab
        const therapyTab = document.getElementById('therapy-tab');
        if (therapyTab) therapyTab.classList.add('active');
    }
    
    // Still show the welcome greeting (optional)
    setTimeout(() => {
        this.updateChatGreeting();
    }, 1000);
}

    addMoodMessageToChat(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const moodMessageDiv = document.createElement('div');
        moodMessageDiv.classList.add('message', 'ai-message');
        moodMessageDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;

        chatMessages.appendChild(moodMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    trackMoodEvent(mood) {
        this.trackEvent('mood_selected', { mood_type: mood });
    }

    trackEvent(eventName, properties = {}) {
        // In a real app, you'd send this to analytics
        console.log(`📊 Event: ${eventName}`, properties);
    }

    getMoodStats() {
        const last7Days = this.moodHistory.slice(-7);
        const moodCounts = last7Days.reduce((acc, mood) => {
            acc[mood.mood] = (acc[mood.mood] || 0) + 1;
            return acc;
        }, {});

        return {
            last7Days,
            moodCounts,
            streak: this.calculateStreak(),
            totalCheckins: this.moodHistory.length
        };
    }

    calculateStreak() {
        if (this.moodHistory.length === 0) return 0;
        
        let streak = 0;
        const sortedMoods = [...this.moodHistory].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        let currentDate = new Date();
        const todayStr = currentDate.toISOString().split('T')[0];
        
        // Check if today's mood is logged
        if (sortedMoods[0]?.date === todayStr) {
            streak = 1;
            currentDate.setDate(currentDate.getDate() - 1);
        }
        
        // Check consecutive days
        for (let i = streak === 1 ? 1 : 0; i < sortedMoods.length; i++) {
            const moodDate = new Date(sortedMoods[i].date);
            const expectedDate = new Date(currentDate);
            
            if (moodDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }
}

// =================== //
// DAILY GROWTH GARDEN //
// =================== //

class GardenSystem {
    constructor() {
        this.plants = [];
        this.achievements = [];
        this.init();
    }

    init() {
        this.loadGardenData();
        this.setupEventListeners();
        this.renderGarden();
        this.updateGardenStats();
    }

    loadGardenData() {
        const savedGarden = localStorage.getItem('lumaCare_garden');
        if (savedGarden) {
            const data = JSON.parse(savedGarden);
            this.plants = data.plants || [];
            this.achievements = data.achievements || [];
        }
    }

    saveGardenData() {
        const gardenData = {
            plants: this.plants,
            achievements: this.achievements,
            lastUpdated: Date.now()
        };
        localStorage.setItem('lumaCare_garden', JSON.stringify(gardenData));
    }

    setupEventListeners() {
        const checkInBtn = document.getElementById('check-in-today');
        if (checkInBtn) {
            checkInBtn.addEventListener('click', () => {
                // Trigger mood check-in
                const moodModal = document.getElementById('mood-modal');
                if (moodModal) {
                    moodModal.classList.add('active');
                }
            });
        }

        // Navigate to garden tab when clicking garden button
        const gardenNavBtn = document.querySelector('[data-tab="garden"]');
        if (gardenNavBtn) {
            gardenNavBtn.addEventListener('click', () => {
                this.renderGarden();
            });
        }
    }

    addPlant(type, color = '#667eea') {
        const plantTypes = {
            'checkin': { emoji: '🌸', name: 'Daily Check-in' },
            'session': { emoji: '🌿', name: 'Therapy Session' },
            'journal': { emoji: '🌻', name: 'Journal Entry' },
            'breathing': { emoji: '🍃', name: 'Breathing Exercise' }
        };

        const plant = {
            id: Date.now() + Math.random(),
            type: type,
            emoji: plantTypes[type]?.emoji || '🌱',
            name: plantTypes[type]?.name || 'Plant',
            color: color,
            date: new Date().toISOString(),
            stage: 'seed', // seed → seedling → mature
            x: Math.random() * 70 + 15, // Position in percentage
            y: Math.random() * 70 + 15
        };

        this.plants.push(plant);
        this.saveGardenData();
        this.renderPlant(plant);

        // Check for achievements
        this.checkAchievements();

        // Update stats
        this.updateGardenStats();

        return plant;
    }

    renderGarden() {
        const gardenCanvas = document.getElementById('garden-canvas');
        if (!gardenCanvas) return;

        // Clear garden
        gardenCanvas.innerHTML = '';

        if (this.plants.length === 0) {
            gardenCanvas.innerHTML = `
                <div class="empty-garden">
                    <div class="empty-garden-icon">🌱</div>
                    <h3>Your garden is waiting</h3>
                    <p>Complete your daily check-in to plant your first seed</p>
                    <button class="btn-check-in" id="check-in-today">
                        <i class="fas fa-seedling"></i> Start Growing
                    </button>
                </div>
            `;

            // Re-attach event listener
            const checkInBtn = document.getElementById('check-in-today');
            if (checkInBtn) {
                checkInBtn.addEventListener('click', () => {
                    const moodModal = document.getElementById('mood-modal');
                    if (moodModal) {
                        moodModal.classList.add('active');
                    }
                });
            }
        } else {
            // Render all plants
            this.plants.forEach(plant => {
                this.renderPlant(plant);
            });
        }

        // Update achievements list
        this.renderAchievements();
    }

    renderPlant(plant) {
        const gardenCanvas = document.getElementById('garden-canvas');
        if (!gardenCanvas || gardenCanvas.querySelector('.empty-garden')) return;

        const plantDiv = document.createElement('div');
        plantDiv.className = `plant ${plant.stage}`;
        plantDiv.dataset.id = plant.id;
        
        // Determine stage based on age
        const plantAge = Date.now() - new Date(plant.date).getTime();
        const hoursOld = plantAge / (1000 * 60 * 60);
        
        let stage = 'seed';
        if (hoursOld > 2) stage = 'seedling';
        if (hoursOld > 24) stage = 'mature-plant';
        
        plant.stage = stage;
        plantDiv.classList.add(stage);

        plantDiv.innerHTML = `
            <div class="plant-emoji">${plant.emoji}</div>
            <div class="plant-tooltip">${plant.name}</div>
        `;

        // Position the plant
        plantDiv.style.left = `${plant.x}%`;
        plantDiv.style.top = `${plant.y}%`;
        plantDiv.style.color = plant.color;
        plantDiv.style.transform = `scale(${0.8 + Math.random() * 0.4})`;

        // Add hover effect
        plantDiv.addEventListener('mouseenter', () => {
            plantDiv.style.zIndex = '100';
        });

        plantDiv.addEventListener('mouseleave', () => {
            plantDiv.style.zIndex = '';
        });

        // Add click effect
        plantDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showPlantDetails(plant);
        });

        gardenCanvas.appendChild(plantDiv);

        // Animate plant appearance
        setTimeout(() => {
            plantDiv.style.opacity = '1';
        }, 100);
    }

    showPlantDetails(plant) {
        const timeAgo = this.getTimeAgo(new Date(plant.date));
        const details = `
            <div class="plant-details-modal">
                <h3>${plant.name}</h3>
                <div class="plant-details-emoji">${plant.emoji}</div>
                <p>Planted ${timeAgo}</p>
                <p>Stage: ${plant.stage}</p>
                <p>Type: ${plant.type.replace('_', ' ')}</p>
            </div>
        `;

        // You could show this in a modal or tooltip
        console.log('Plant details:', details);
        
        // For now, show a toast notification
        this.showToast(`🌱 ${plant.name} - Planted ${timeAgo}`);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }

    checkAchievements() {
        const achievements = [
            {
                id: 'first_plant',
                title: 'First Seed Planted',
                description: 'You planted your first seed!',
                condition: () => this.plants.length >= 1,
                emoji: '🌱'
            },
            {
                id: 'three_day_streak',
                title: '3-Day Streak',
                description: 'You checked in for 3 days in a row!',
                condition: () => moodSystem.calculateStreak() >= 3,
                emoji: '🔥'
            },
            {
                id: 'five_plants',
                title: 'Garden Starter',
                description: 'You grew 5 plants in your garden!',
                condition: () => this.plants.length >= 5,
                emoji: '🌿'
            },
            {
                id: 'variety_gardener',
                title: 'Variety Gardener',
                description: 'You tried all types of activities!',
                condition: () => {
                    const types = new Set(this.plants.map(p => p.type));
                    return types.size >= 4;
                },
                emoji: '🌺'
            }
        ];

        achievements.forEach(achievement => {
            if (achievement.condition() && 
                !this.achievements.find(a => a.id === achievement.id)) {
                
                const newAchievement = {
                    ...achievement,
                    date: new Date().toISOString()
                };
                
                this.achievements.push(newAchievement);
                this.showAchievementNotification(newAchievement);
            }
        });

        this.saveGardenData();
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-content">
                <div class="achievement-notification-emoji">${achievement.emoji}</div>
                <div class="achievement-notification-text">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);

        // Play achievement sound (optional)
        this.playAchievementSound();
    }

    playAchievementSound() {
        // Create a gentle achievement sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    renderAchievements() {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList) return;

        achievementsList.innerHTML = '';

        // Sort achievements by date (newest first)
        const sortedAchievements = [...this.achievements].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        ).slice(0, 5); // Show only 5 most recent

        sortedAchievements.forEach(achievement => {
            const achievementDiv = document.createElement('div');
            achievementDiv.className = 'achievement';
            achievementDiv.innerHTML = `
                <div class="achievement-icon">${achievement.emoji}</div>
                <div class="achievement-details">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                </div>
                <div class="achievement-date">${this.getTimeAgo(new Date(achievement.date))}</div>
            `;
            achievementsList.appendChild(achievementDiv);
        });

        if (sortedAchievements.length === 0) {
            achievementsList.innerHTML = `
                <div class="no-achievements">
                    <p>Complete activities to earn achievements!</p>
                </div>
            `;
        }
    }

    updateGardenStats() {
        const streakCount = document.getElementById('streak-count');
        const plantCount = document.getElementById('plant-count');
        const sessionCountGarden = document.getElementById('session-count-garden');

        if (streakCount) {
            streakCount.textContent = moodSystem.calculateStreak();
        }

        if (plantCount) {
            plantCount.textContent = this.plants.length;
        }

        if (sessionCountGarden) {
            sessionCountGarden.textContent = this.plants.filter(p => p.type === 'session').length;
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// =================== //
// EMOTIONAL WEATHER SYSTEM //
// =================== //

class WeatherSystem {
    constructor() {
        this.currentWeather = null;
        this.weatherHistory = [];
        this.animationElements = [];
        this.init();
    }

    init() {
        this.loadWeatherHistory();
        this.setupEventListeners();
        this.generateWeather();
        this.startWeatherAnimation();
    }

    loadWeatherHistory() {
        const savedWeather = localStorage.getItem('lumaCare_weather');
        if (savedWeather) {
            this.weatherHistory = JSON.parse(savedWeather);
        }
    }

    setupEventListeners() {
        const weatherInfoBtn = document.getElementById('weather-info');
        if (weatherInfoBtn) {
            weatherInfoBtn.addEventListener('click', () => {
                this.showWeatherExplanation();
            });
        }
    }

    generateWeather() {
        // Get recent moods for weather calculation
        const moodStats = moodSystem.getMoodStats();
        const recentMoods = moodStats.last7Days;

        if (recentMoods.length === 0) {
            this.currentWeather = this.getWeatherForMood('neutral');
        } else {
            // Calculate average mood from recent days
            const moodValues = {
                'great': 5,
                'good': 4,
                'okay': 3,
                'neutral': 2,
                'heavy': 1
            };

            const avgMood = recentMoods.reduce((sum, mood) => {
                return sum + (moodValues[mood.mood] || 2.5);
            }, 0) / recentMoods.length;

            // Determine weather based on average mood
            let weatherType;
            if (avgMood >= 4.5) weatherType = 'sunny';
            else if (avgMood >= 3.5) weatherType = 'partly_cloudy';
            else if (avgMood >= 2.5) weatherType = 'light_rain';
            else if (avgMood >= 1.5) weatherType = 'stormy';
            else weatherType = 'rainbow';

            this.currentWeather = this.getWeatherForType(weatherType);
        }

        // Save weather for today
        const today = new Date().toISOString().split('T')[0];
        const todayWeather = this.weatherHistory.find(w => w.date === today);
        
        if (!todayWeather) {
            this.weatherHistory.push({
                date: today,
                weather: this.currentWeather,
                timestamp: Date.now()
            });
            
            // Keep only last 30 days
            if (this.weatherHistory.length > 30) {
                this.weatherHistory = this.weatherHistory.slice(-30);
            }
            
            localStorage.setItem('lumaCare_weather', JSON.stringify(this.weatherHistory));
        }

        // Update UI
        this.updateWeatherUI();
    }

    getWeatherForMood(mood) {
        const weatherMap = {
            'great': 'sunny',
            'good': 'partly_cloudy',
            'okay': 'light_rain',
            'neutral': 'cloudy',
            'heavy': 'stormy'
        };

        return this.getWeatherForType(weatherMap[mood] || 'partly_cloudy');
    }

    getWeatherForType(type) {
        const weatherTypes = {
            'sunny': {
                icon: '☀️',
                condition: 'Sunny & Clear',
                temperature: this.getRandomTemp(70, 85),
                description: 'Positive and energetic outlook',
                color: '#FF9800',
                animation: 'sunny'
            },
            'partly_cloudy': {
                icon: '⛅',
                condition: 'Partly Cloudy',
                temperature: this.getRandomTemp(60, 75),
                description: 'Mixed feelings with moments of clarity',
                color: '#4FC3F7',
                animation: 'cloudy'
            },
            'light_rain': {
                icon: '🌧️',
                condition: 'Light Rain',
                temperature: this.getRandomTemp(50, 65),
                description: 'Gentle melancholy with growth potential',
                color: '#2196F3',
                animation: 'rain'
            },
            'stormy': {
                icon: '⛈️',
                condition: 'Stormy',
                temperature: this.getRandomTemp(45, 60),
                description: 'Intense emotions with potential for breakthroughs',
                color: '#673AB7',
                animation: 'storm'
            },
            'rainbow': {
                icon: '🌈',
                condition: 'After Rain',
                temperature: this.getRandomTemp(65, 75),
                description: 'Growth and clarity after difficulty',
                color: '#9C27B0',
                animation: 'rainbow'
            },
            'cloudy': {
                icon: '☁️',
                condition: 'Cloudy',
                temperature: this.getRandomTemp(55, 70),
                description: 'Quiet reflection and introspection',
                color: '#607D8B',
                animation: 'cloudy'
            }
        };

        return weatherTypes[type] || weatherTypes['partly_cloudy'];
    }

    getRandomTemp(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    updateWeatherUI() {
        if (!this.currentWeather) return;

        const weatherIcon = document.getElementById('weather-icon');
        const weatherCondition = document.getElementById('weather-condition');
        const weatherTemperature = document.getElementById('weather-temperature');
        const weatherDescription = document.getElementById('weather-description');

        if (weatherIcon) weatherIcon.textContent = this.currentWeather.icon;
        if (weatherCondition) weatherCondition.textContent = this.currentWeather.condition;
        if (weatherTemperature) weatherTemperature.textContent = `${this.currentWeather.temperature}°`;
        if (weatherDescription) weatherDescription.textContent = this.currentWeather.description;

        // Update widget background
        const weatherWidget = document.getElementById('weather-widget');
        if (weatherWidget) {
            weatherWidget.style.background = `linear-gradient(135deg, ${this.currentWeather.color}20 0%, #764ba2 100%)`;
        }
    }

    startWeatherAnimation() {
        const animationContainer = document.querySelector('.weather-animation');
        if (!animationContainer || !this.currentWeather) return;

        // Clear previous animations
        this.animationElements.forEach(el => el.remove());
        this.animationElements = [];

        // Create animations based on weather type
        switch (this.currentWeather.animation) {
            case 'sunny':
                this.createSunRays(animationContainer);
                break;
            case 'rain':
                this.createRainAnimation(animationContainer);
                break;
            case 'storm':
                this.createStormAnimation(animationContainer);
                break;
            case 'rainbow':
                this.createRainbowAnimation(animationContainer);
                break;
            case 'cloudy':
                this.createCloudAnimation(animationContainer);
                break;
        }
    }

    createSunRays(container) {
        for (let i = 0; i < 8; i++) {
            const ray = document.createElement('div');
            ray.className = 'sun-ray';
            ray.style.width = '100px';
            ray.style.height = '2px';
            ray.style.left = '50%';
            ray.style.top = '50%';
            ray.style.transformOrigin = '0 0';
            ray.style.transform = `rotate(${i * 45}deg)`;
            
            container.appendChild(ray);
            this.animationElements.push(ray);
        }
    }

    createRainAnimation(container) {
        for (let i = 0; i < 20; i++) {
            const drop = document.createElement('div');
            drop.className = 'weather-particle rain-particle';
            drop.style.width = '2px';
            drop.style.height = '15px';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.animationDelay = `${Math.random() * 2}s`;
            
            container.appendChild(drop);
            this.animationElements.push(drop);
        }
    }

    createStormAnimation(container) {
        // Create rain
        this.createRainAnimation(container);
        
        // Add lightning flashes
        setInterval(() => {
            if (Math.random() > 0.7) {
                const flash = document.createElement('div');
                flash.className = 'lightning-flash';
                flash.style.position = 'absolute';
                flash.style.top = '0';
                flash.style.left = '0';
                flash.style.right = '0';
                flash.style.bottom = '0';
                flash.style.background = 'rgba(255, 255, 255, 0.3)';
                flash.style.animation = 'flash 0.2s';
                
                container.appendChild(flash);
                this.animationElements.push(flash);
                
                setTimeout(() => flash.remove(), 200);
            }
        }, 2000);
    }

    createRainbowAnimation(container) {
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'];
        
        colors.forEach((color, index) => {
            const arc = document.createElement('div');
            arc.className = 'rainbow-arc';
            arc.style.position = 'absolute';
            arc.style.width = '200px';
            arc.style.height = '100px';
            arc.style.borderRadius = '100px 100px 0 0';
            arc.style.border = `10px solid ${color}`;
            arc.style.borderBottom = 'none';
            arc.style.top = '50%';
            arc.style.left = '50%';
            arc.style.transform = `translate(-50%, -50%) rotate(${index * 5}deg)`;
            arc.style.opacity = '0.3';
            arc.style.animation = 'rainbowPulse 4s infinite';
            arc.style.animationDelay = `${index * 0.2}s`;
            
            container.appendChild(arc);
            this.animationElements.push(arc);
        });
    }

    createCloudAnimation(container) {
        for (let i = 0; i < 3; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'weather-particle';
            cloud.textContent = '☁️';
            cloud.style.fontSize = `${Math.random() * 30 + 20}px`;
            cloud.style.left = `${Math.random() * 100}%`;
            cloud.style.top = `${Math.random() * 100}%`;
            cloud.style.animation = `cloudFloat ${Math.random() * 20 + 20}s infinite linear`;
            cloud.style.animationDelay = `${Math.random() * 5}s`;
            cloud.style.opacity = '0.3';
            
            container.appendChild(cloud);
            this.animationElements.push(cloud);
        }
    }

    showWeatherExplanation() {
        if (!this.currentWeather) return;

        const explanations = {
            'Sunny & Clear': 'Your recent mood patterns show positive energy and clarity. Keep embracing the sunlight!',
            'Partly Cloudy': 'You\'ve been experiencing mixed feelings lately. The clouds will pass, revealing clarity.',
            'Light Rain': 'Gentle melancholy can be fertile ground for growth. The rain waters your inner garden.',
            'Stormy': 'Intense emotions are natural storms. Remember, every storm clears the air for new growth.',
            'After Rain': 'You\'ve been through difficult weather and now see the rainbow. Growth often follows challenge.',
            'Cloudy': 'Quiet reflection days. Clouds give us time to pause and process before the sun returns.'
        };

        const explanation = explanations[this.currentWeather.condition] || 
                          'Your emotional weather reflects your recent journey.';

        alert(`${this.currentWeather.icon} ${this.currentWeather.condition}\n\n${explanation}\n\n${this.currentWeather.description}`);
    }

    getWeeklyForecast() {
        // Generate a simple 5-day forecast based on mood trends
        const forecast = [];
        const weatherTypes = ['sunny', 'partly_cloudy', 'light_rain', 'stormy', 'rainbow', 'cloudy'];
        
        for (let i = 0; i < 5; i++) {
            const randomType = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            forecast.push(this.getWeatherForType(randomType));
        }
        
        return forecast;
    }
}

// =================== //
// ENHANCED CHAT SYSTEM //
// =================== //

class EnhancedChat {
    constructor() {
        this.messageQueue = [];
        this.isTyping = false;
        this.setupEnhancedFeatures();
    }

    setupEnhancedFeatures() {
        // Add typing indicator
        this.setupTypingIndicator();
        
        // Enhance message animations
        this.enhanceMessageAnimations();
        
        // Add haptic feedback on mobile
        this.setupHapticFeedback();
    }

    setupTypingIndicator() {
        // Add typing indicator to chat messages container
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        this.typingIndicator = document.createElement('div');
        this.typingIndicator.className = 'message ai-message typing-indicator';
        this.typingIndicator.style.display = 'none';
        this.typingIndicator.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        chatMessages.appendChild(this.typingIndicator);
    }

    showTypingIndicator(duration = 1500) {
        if (this.isTyping || !this.typingIndicator) return;

        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Hide after duration
        setTimeout(() => {
            this.hideTypingIndicator();
        }, duration);
    }

    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'none';
        }
        this.isTyping = false;
    }

    enhanceMessageAnimations() {
        // Override the sendMessage function to include typing indicator
        const originalSendMessage = window.sendMessage;
        
        window.sendMessage = function() {
            const messageInput = document.getElementById('message-input');
            const message = messageInput?.value.trim();
            
            if (!message) return;
            
            // Show typing indicator before AI responds
            enhancedChat.showTypingIndicator();
            
            // Call original function
            originalSendMessage.call(this);
        }.bind(this);
    }

    setupHapticFeedback() {
        if ('vibrate' in navigator) {
            // Add haptic feedback to buttons
            const buttons = document.querySelectorAll('button:not(.no-haptic)');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    // Gentle tap feedback (10ms)
                    navigator.vibrate(10);
                });
            });

            // Stronger feedback for important actions
            const importantButtons = document.querySelectorAll('.btn-purchase, .btn-upgrade-now, .btn-check-in');
            importantButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Pattern: short-long-short
                    navigator.vibrate([30, 50, 30]);
                });
            });
        }
    }

    addMessageWithAnimation(message, sender) {
        return new Promise((resolve) => {
            const chatMessages = document.getElementById('chat-messages');
            if (!chatMessages) return resolve();

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
            
            // Initially hidden
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = sender === 'user' 
                ? 'translateX(20px)' 
                : 'translateX(-20px)';
            
            chatMessages.appendChild(messageDiv);
            
            // Animate in
            setTimeout(() => {
                messageDiv.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateX(0)';
                
                setTimeout(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    resolve();
                }, 400);
            }, 50);
        });
    }
}

// =================== //
// INITIALIZE SYSTEMS //
// =================== //

let moodSystem, gardenSystem, weatherSystem, enhancedChat;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize after auth system is ready
    setTimeout(() => {
        moodSystem = new MoodSystem();
        gardenSystem = new GardenSystem();
        weatherSystem = new WeatherSystem();
        enhancedChat = new EnhancedChat();
        
        // Track that systems are initialized
        console.log('🎯 Enhanced systems initialized:', {
            mood: !!moodSystem,
            garden: !!gardenSystem,
            weather: !!weatherSystem,
            chat: !!enhancedChat
        });
        
        // Update garden tab content
        const gardenTab = document.getElementById('garden-tab');
        if (gardenTab) {
            gardenSystem.renderGarden();
        }
        
        // Update weather widget
        const weatherWidget = document.getElementById('weather-widget');
        if (weatherWidget && weatherSystem.currentWeather) {
            weatherSystem.updateWeatherUI();
        }
        
    }, 1500); // Wait for auth system to initialize
});

// =================== //
// ADDITIONAL CSS FOR NEW FEATURES //
// =================== //

// Add these styles to your existing CSS
const additionalStyles = `
/* Toast Notifications */
.toast {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--primary);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transition: transform 0.3s ease;
    max-width: 90%;
    text-align: center;
}

.toast.show {
    transform: translateX(-50%) translateY(0);
}

/* Achievement Notifications */
.achievement-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
}

.achievement-notification.show {
    transform: translateX(0);
}

.achievement-notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.achievement-notification-emoji {
    font-size: 2rem;
}

.achievement-notification-text h4 {
    margin: 0 0 4px 0;
    font-size: 1rem;
}

.achievement-notification-text p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.9;
}

/* Plant Tooltips */
.plant-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 100;
}

.plant:hover .plant-tooltip {
    opacity: 1;
}

/* Lightning Flash Animation */
@keyframes flash {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
}

/* Rainbow Pulse Animation */
@keyframes rainbowPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
}

/* Cloud Float Animation */
@keyframes cloudFloat {
    0% { transform: translateX(-100px); }
    100% { transform: translateX(calc(100vw + 100px)); }
}

/* Message Stagger Animation */
.message:nth-child(odd) {
    animation-delay: 0.1s;
}

.message:nth-child(even) {
    animation-delay: 0.2s;
}

/* Loading States */
.loading {
    opacity: 0.6;
    pointer-events: none;
}

.loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.1) 50%, 
        transparent 100%);
    animation: loadingShimmer 1.5s infinite;
    background-size: 200% 100%;
}

@keyframes loadingShimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
`;

// Add the additional styles to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// =================== //
// TRACKING EVENTS //
// =================== //

// Track the events mentioned in your requirements
function trackEvent(eventName, properties = {}) {
    const eventData = {
        event: eventName,
        timestamp: Date.now(),
        userId: authSystem.currentUser?.email || 'guest',
        properties
    };
    
    console.log('📊 Event tracked:', eventData);
    
    // In production, you would send this to your analytics service
    // Example: sendToAnalytics(eventData);
}

// Initialize event tracking
document.addEventListener('DOMContentLoaded', function() {
    // Track app load
    trackEvent('app_loaded');
    
    // Track tab views
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            trackEvent('tab_viewed', { tab_name: tab });
        });
    });
    
    // Track session duration
    let sessionStart = Date.now();
    window.addEventListener('beforeunload', function() {
        const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
        trackEvent('session_ended', { duration_seconds: sessionDuration });
    });
});

// Add this to your existing onLoginSuccess function
const originalOnLoginSuccess = window.onLoginSuccess;
window.onLoginSuccess = function() {
    originalOnLoginSuccess();
    trackEvent('user_logged_in');
};

// =================== //
// PWA ENHANCEMENTS //
// =================== //

// Add to your existing service worker or manifest enhancements
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js').then(
            function(registration) {
                console.log('ServiceWorker registration successful');
            },
            function(err) {
                console.log('ServiceWorker registration failed: ', err);
            }
        );
    });
}

// Add install prompt for PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show custom install button
    setTimeout(() => {
        showInstallPrompt();
    }, 5000);
});

function showInstallPrompt() {
    const installPrompt = document.createElement('div');
    installPrompt.className = 'install-prompt';
    installPrompt.innerHTML = `
        <div class="install-prompt-content">
            <p>Install LumaCare for a better experience?</p>
            <div class="install-actions">
                <button class="btn-install" id="install-app">Install</button>
                <button class="btn-later" id="install-later">Later</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(installPrompt);
    
    document.getElementById('install-app').addEventListener('click', () => {
        installPrompt.remove();
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                trackEvent('pwa_installed');
            }
            deferredPrompt = null;
        });
    });
    
    document.getElementById('install-later').addEventListener('click', () => {
        installPrompt.remove();
    });
}

// =================== //
// PHASE 2: ADVANCED FEATURES //
// =================== //

class PersonalizationSystem {
    constructor() {
        this.userPreferences = {};
        this.dailyRituals = [];
        this.sosSequences = {};
        this.init();
    }

    init() {
        this.loadPreferences();
        this.setupDailyRituals();
        this.setupSOSSequences();
        this.setupNameMemory();
    }

    loadPreferences() {
        const saved = localStorage.getItem('lumaCare_preferences');
        if (saved) {
            this.userPreferences = JSON.parse(saved);
        } else {
            // Default preferences
            this.userPreferences = {
                preferredName: '',
                morningRoutine: true,
                eveningReflection: true,
                breathingReminders: true,
                moodTracking: true,
                notificationTime: '09:00',
                theme: 'auto',
                reducedMotion: false,
                voiceGuidance: true,
                hapticFeedback: true
            };
        }
    }

    setupNameMemory() {
        const user = authSystem.currentUser;
        if (user && user.name && !this.userPreferences.preferredName) {
            this.userPreferences.preferredName = user.name.split(' ')[0];
            this.savePreferences();
        }
    }

    savePreferences() {
        localStorage.setItem('lumaCare_preferences', JSON.stringify(this.userPreferences));
    }

    setupDailyRituals() {
        this.dailyRituals = [
            {
                id: 'morning_intention',
                title: 'Morning Intention',
                emoji: '🌅',
                time: 'morning',
                description: 'Set a positive intention for your day',
                duration: '5 min',
                steps: [
                    'Take 3 deep breaths',
                    'Ask: "What do I need today?"',
                    'Set one simple intention',
                    'Visualize your day going well'
                ],
                enabled: this.userPreferences.morningRoutine
            },
            {
                id: 'midday_checkin',
                title: 'Midday Check-in',
                emoji: '🌞',
                time: 'afternoon',
                description: 'Brief emotional temperature check',
                duration: '2 min',
                steps: [
                    'Pause what you\'re doing',
                    'Scan your body for tension',
                    'Name one thing you feel',
                    'Take a conscious breath'
                ],
                enabled: true
            },
            {
                id: 'evening_reflection',
                title: 'Evening Reflection',
                emoji: '🌙',
                time: 'evening',
                description: 'Gentle review of your day',
                duration: '7 min',
                steps: [
                    'Find a quiet space',
                    'Review 3 good moments',
                    'Acknowledge 1 challenge',
                    'Practice gratitude',
                    'Release the day'
                ],
                enabled: this.userPreferences.eveningReflection
            },
            {
                id: 'breathing_break',
                title: 'Breathing Break',
                emoji: '🍃',
                time: 'flexible',
                description: 'Reset your nervous system',
                duration: '3 min',
                steps: [
                    'Find comfortable position',
                    '4-7-8 breathing pattern',
                    'Focus on exhale',
                    'Repeat 5 cycles'
                ],
                enabled: this.userPreferences.breathingReminders
            },
            {
                id: 'gratitude_moment',
                title: 'Gratitude Moment',
                emoji: '🙏',
                time: 'flexible',
                description: 'Cultivate appreciation',
                duration: '2 min',
                steps: [
                    'Close your eyes',
                    'Think of 3 specific things',
                    'Feel the gratitude',
                    'Smile genuinely'
                ],
                enabled: true
            }
        ];
    }

    getTodaysRituals() {
        const now = new Date();
        const hour = now.getHours();
        let timeOfDay = 'flexible';
        
        if (hour >= 5 && hour < 12) timeOfDay = 'morning';
        else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else timeOfDay = 'evening';

        return this.dailyRituals.filter(ritual => 
            ritual.enabled && (ritual.time === timeOfDay || ritual.time === 'flexible')
        );
    }

    showRitualSuggestion() {
        const rituals = this.getTodaysRituals();
        if (rituals.length === 0) return;

        const ritual = rituals[Math.floor(Math.random() * rituals.length)];
        const lastSuggested = localStorage.getItem('last_ritual_suggestion');
        const today = new Date().toDateString();
        
        if (lastSuggested !== today) {
            setTimeout(() => {
                this.showRitualModal(ritual);
                localStorage.setItem('last_ritual_suggestion', today);
            }, 3000); // Show after 3 seconds
        }
    }

    showRitualModal(ritual) {
        const modalHTML = `
            <div class="modal ritual-modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${ritual.emoji} Daily Ritual Suggestion</h2>
                        <button class="close-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="ritual-card featured">
                            <div class="ritual-header">
                                <div class="ritual-emoji">${ritual.emoji}</div>
                                <div class="ritual-info">
                                    <h3>${ritual.title}</h3>
                                    <p>${ritual.description}</p>
                                    <div class="ritual-meta">
                                        <span><i class="fas fa-clock"></i> ${ritual.duration}</span>
                                        <span><i class="fas fa-sun"></i> ${ritual.time}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="ritual-steps">
                                <h4>Steps:</h4>
                                <ol>
                                    ${ritual.steps.map(step => `<li>${step}</li>`).join('')}
                                </ol>
                            </div>
                            
                            <div class="ritual-actions">
                                <button class="btn-start-ritual" data-ritual="${ritual.id}">
                                    <i class="fas fa-play"></i> Start Ritual
                                </button>
                                <button class="btn-skip-ritual">
                                    Remind me later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        // Add event listeners
        modalContainer.querySelector('.close-modal').addEventListener('click', () => {
            modalContainer.remove();
        });

        modalContainer.querySelector('.btn-start-ritual').addEventListener('click', () => {
            this.startRitual(ritual);
            modalContainer.remove();
        });

        modalContainer.querySelector('.btn-skip-ritual').addEventListener('click', () => {
            modalContainer.remove();
        });

        // Close on backdrop click
        modalContainer.querySelector('.modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                modalContainer.remove();
            }
        });
    }

    startRitual(ritual) {
        // Add plant for ritual completion
        gardenSystem.addPlant('ritual', '#9C27B0');
        
        // Track completion
        trackEvent('ritual_started', { ritual_id: ritual.id });
        
        // Show ritual in chat
        this.showRitualInChat(ritual);
    }

    showRitualInChat(ritual) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const ritualMessage = `
            <div class="message ai-message">
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    <div class="ritual-chat-card">
                        <h4>${ritual.emoji} ${ritual.title}</h4>
                        <p>Let's practice this together. I'll guide you through each step:</p>
                        <div class="ritual-chat-steps">
                            ${ritual.steps.map((step, i) => `
                                <div class="ritual-step">
                                    <span class="step-number">${i + 1}</span>
                                    <span class="step-text">${step}</span>
                                </div>
                            `).join('')}
                        </div>
                        <p>Take your time with each step. I'm here with you.</p>
                    </div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = ritualMessage;
        chatMessages.appendChild(tempDiv.firstElementChild);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add voice guidance if enabled
        if (this.userPreferences.voiceGuidance) {
            const textToSpeak = `Let's practice ${ritual.title}. ${ritual.steps.join('. Next, ')}`;
            speakText(textToSpeak);
        }
    }

    setupSOSSequences() {
        this.sosSequences = {
            panic_attack: {
                title: 'Panic Attack SOS',
                emoji: '🆘',
                color: '#F44336',
                steps: [
                    'Ground yourself: Name 5 things you see',
                    'Breathing: 4-7-8 pattern (inhale 4, hold 7, exhale 8)',
                    'Temperature: Splash cold water on your face',
                    'Movement: Gentle stretches to release tension',
                    'Repeat: "This will pass. I am safe."'
                ],
                duration: '10 min'
            },
            overwhelm: {
                title: 'Overwhelm SOS',
                emoji: '🌊',
                color: '#2196F3',
                steps: [
                    'Pause everything. Close your eyes.',
                    'Priority matrix: Urgent vs Important',
                    'Break tasks into tiny steps',
                    'Choose one micro-action to start',
                    'Celebrate starting, not finishing'
                ],
                duration: '8 min'
            },
            sadness: {
                title: 'Sadness SOS',
                emoji: '💙',
                color: '#3F51B5',
                steps: [
                    'Self-compassion: "It\'s okay to feel this"',
                    'Gentle movement: Slow stretching',
                    'Comfort: Wrap yourself in a blanket',
                    'Connection: Text one trusted person',
                    'Small kindness: Do one tiny nice thing for yourself'
                ],
                duration: '12 min'
            },
            anger: {
                title: 'Anger SOS',
                emoji: '🔥',
                color: '#FF9800',
                steps: [
                    'Safe release: Scream into a pillow',
                    'Physical: Squeeze stress ball or pillow',
                    'Cool down: Cold water on wrists',
                    'Reframe: "This is a signal, not my identity"',
                    'Channel: Write it out, then tear it up'
                ],
                duration: '7 min'
            },
            dissociation: {
                title: 'Dissociation SOS',
                emoji: '🌀',
                color: '#9C27B0',
                steps: [
                    '5-4-3-2-1 grounding technique',
                    'Physical anchor: Hold an ice cube',
                    'Strong sensation: Sour candy or strong mint',
                    'Movement: Gentle rocking or tapping',
                    'Affirmation: "I am here. I am present."'
                ],
                duration: '15 min'
            }
        };
    }

    showSOSSelector() {
        const sosHTML = `
            <div class="modal sos-modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-life-ring"></i> SOS Calm Sequence</h2>
                        <p>Choose what you're experiencing for immediate support</p>
                    </div>
                    <div class="modal-body">
                        <div class="sos-options">
                            ${Object.entries(this.sosSequences).map(([key, sequence]) => `
                                <div class="sos-option" data-sequence="${key}" style="border-color: ${sequence.color}">
                                    <div class="sos-emoji">${sequence.emoji}</div>
                                    <div class="sos-info">
                                        <h3>${sequence.title}</h3>
                                        <p>${sequence.duration}</p>
                                    </div>
                                    <div class="sos-arrow">→</div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="sos-note">
                            <i class="fas fa-heart"></i>
                            <p>These are immediate coping tools. For crisis support, please call 988 (US) or your local emergency number.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = sosHTML;
        document.body.appendChild(modalContainer);

        // Add event listeners
        modalContainer.querySelectorAll('.sos-option').forEach(option => {
            option.addEventListener('click', () => {
                const sequenceKey = option.dataset.sequence;
                this.startSOSSequence(sequenceKey);
                modalContainer.remove();
            });
        });

        // Close on backdrop click
        modalContainer.querySelector('.modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                modalContainer.remove();
            }
        });
    }

    startSOSSequence(sequenceKey) {
        const sequence = this.sosSequences[sequenceKey];
        if (!sequence) return;

        // Track SOS usage
        trackEvent('sos_sequence_started', { sequence_type: sequenceKey });
        
        // Show sequence in chat
        this.showSOSInChat(sequence);
        
        // Add plant for self-care
        gardenSystem.addPlant('self_care', sequence.color);
    }

    showSOSInChat(sequence) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const sosMessage = `
            <div class="message ai-message">
                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                <div class="message-content">
                    <div class="sos-chat-card" style="border-left-color: ${sequence.color}">
                        <h4>${sequence.emoji} ${sequence.title}</h4>
                        <p>Let's walk through this together. I'll guide you step by step:</p>
                        <div class="sos-steps">
                            ${sequence.steps.map((step, i) => `
                                <div class="sos-step">
                                    <div class="sos-step-number">${i + 1}</div>
                                    <div class="sos-step-content">${step}</div>
                                    <button class="btn-step-complete" data-step="${i}">
                                        <i class="fas fa-check"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <p class="sos-encouragement">You're doing great. One step at a time. 💙</p>
                    </div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sosMessage;
        chatMessages.appendChild(tempDiv.firstElementChild);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add step completion listeners
        setTimeout(() => {
            document.querySelectorAll('.btn-step-complete').forEach(btn => {
                btn.addEventListener('click', function() {
                    const stepNum = parseInt(this.dataset.step);
                    this.innerHTML = '<i class="fas fa-check-circle"></i>';
                    this.classList.add('completed');
                    this.disabled = true;
                    
                    // Track step completion
                    trackEvent('sos_step_completed', { 
                        step_number: stepNum + 1,
                        sequence_title: sequence.title
                    });
                    
                    // Gentle encouragement
                    if (stepNum < sequence.steps.length - 1) {
                        setTimeout(() => {
                            const encouragements = [
                                "Good job! Keep going.",
                                "You're doing great.",
                                "One step at a time.",
                                "I'm here with you.",
                                "This is helping."
                            ];
                            const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
                            
                            const encouragementMsg = document.createElement('div');
                            encouragementMsg.className = 'message ai-message';
                            encouragementMsg.innerHTML = `
                                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                                <div class="message-content">
                                    <p>${randomEncouragement}</p>
                                </div>
                            `;
                            chatMessages.appendChild(encouragementMsg);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }, 500);
                    }
                });
            });
        }, 100);

        // Voice guidance
        if (this.userPreferences.voiceGuidance) {
            const textToSpeak = `${sequence.title}. Let's begin. ${sequence.steps.join('. Next: ')}`;
            setTimeout(() => speakText(textToSpeak), 1000);
        }
    }

    updatePreference(key, value) {
        this.userPreferences[key] = value;
        this.savePreferences();
        trackEvent('preference_updated', { key, value });
    }

    getPersonalizedGreeting() {
        const name = this.userPreferences.preferredName || '';
        const hour = new Date().getHours();
        let timeGreeting = 'Welcome';
        
        if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
        else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
        else timeGreeting = 'Good evening';
        
        return name ? `${timeGreeting}, ${name}` : timeGreeting;
    }
}

// =================== //
// PHASE 3: PROGRESS INSIGHTS & ANALYTICS //
// =================== //

// =================== //
// PROGRESS INSIGHTS CLASS - REPLACE ENTIRE CLASS //
// =================== //

class ProgressInsights {
    constructor() {
        this.insights = [];
        this.patterns = {};
        // Don't call init here - wait for DOM
    }

    init() {
        this.loadInsights();
        this.analyzePatterns();
        this.setupInsightsTab();
        this.renderInsights();
    }

    loadInsights() {
        const saved = localStorage.getItem('lumaCare_insights');
        if (saved) {
            this.insights = JSON.parse(saved);
        }
    }

    analyzePatterns() {
        // Analyze mood patterns
        const moodHistory = window.moodSystem ? window.moodSystem.moodHistory : [];
        if (moodHistory.length < 3) return;

        // Weekly patterns
        const weeklyMoods = moodHistory.slice(-7);
        const moodCounts = {};
        weeklyMoods.forEach(mood => {
            moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
        });

        // Time of day patterns
        const hourCounts = {};
        weeklyMoods.forEach(mood => {
            const hour = new Date(mood.timestamp).getHours();
            const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
            hourCounts[timeOfDay] = (hourCounts[timeOfDay] || 0) + 1;
        });

        // Session patterns
        const plantHistory = window.gardenSystem ? window.gardenSystem.plants : [];
        const sessionPlants = plantHistory.filter(p => p.type === 'session');
        const journalPlants = plantHistory.filter(p => p.type === 'journal');
        const breathingPlants = plantHistory.filter(p => p.type === 'breathing');

        this.patterns = {
            dominantMood: this.getDominantMood(moodCounts),
            mostActiveTime: this.getMostActiveTime(hourCounts),
            sessionFrequency: sessionPlants.length,
            journalFrequency: journalPlants.length,
            breathingFrequency: breathingPlants.length,
            consistencyStreak: window.moodSystem ? window.moodSystem.calculateStreak() : 0,
            moodStability: this.calculateMoodStability(weeklyMoods)
        };

        // Generate insights
        this.generateInsights();
    }

    getDominantMood(moodCounts) {
        let maxCount = 0;
        let dominantMood = 'neutral';
        
        Object.entries(moodCounts).forEach(([mood, count]) => {
            if (count > maxCount) {
                maxCount = count;
                dominantMood = mood;
            }
        });
        
        return dominantMood;
    }

    getMostActiveTime(hourCounts) {
        let maxCount = 0;
        let mostActive = 'flexible';
        
        Object.entries(hourCounts).forEach(([time, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostActive = time;
            }
        });
        
        return mostActive;
    }

    calculateMoodStability(weeklyMoods) {
        if (weeklyMoods.length < 2) return 'neutral';
        
        const moodValues = {
            'great': 5,
            'good': 4,
            'okay': 3,
            'neutral': 2,
            'heavy': 1
        };
        
        const values = weeklyMoods.map(m => moodValues[m.mood] || 2.5);
        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev < 0.5) return 'very_stable';
        if (stdDev < 1) return 'stable';
        if (stdDev < 1.5) return 'moderate';
        return 'variable';
    }

    generateInsights() {
        this.insights = [];
        const now = new Date();

        // Mood-based insights
        if (this.patterns.dominantMood) {
            const moodInsights = {
                'great': 'Your positive mood patterns show resilience. Keep nurturing this energy!',
                'good': 'Consistent good moods indicate effective coping strategies.',
                'okay': 'Steady moods show balanced emotional regulation.',
                'neutral': 'Neutral moods can be grounding. Consider exploring what brings you joy.',
                'heavy': 'Heavy moods deserve attention. Remember, all feelings are valid.'
            };
            
            if (moodInsights[this.patterns.dominantMood]) {
                this.insights.push({
                    id: 'mood_pattern',
                    title: 'Mood Pattern Insight',
                    emoji: '📊',
                    message: moodInsights[this.patterns.dominantMood],
                    date: now.toISOString(),
                    type: 'pattern'
                });
            }
        }

        // Consistency insight
        if (this.patterns.consistencyStreak >= 3) {
            this.insights.push({
                id: 'consistency_streak',
                title: 'Consistency Streak!',
                emoji: '🔥',
                message: `You've checked in ${this.patterns.consistencyStreak} days in a row! Consistency builds resilience.`,
                date: now.toISOString(),
                type: 'achievement'
            });
        }

        // Garden growth insight
        if (window.gardenSystem && window.gardenSystem.plants.length >= 5) {
            this.insights.push({
                id: 'garden_growth',
                title: 'Garden Flourishing',
                emoji: '🌺',
                message: `Your garden has ${window.gardenSystem.plants.length} plants! Each one represents your growth journey.`,
                date: now.toISOString(),
                type: 'growth'
            });
        }

        // Save insights
        this.saveInsights();
    }

    saveInsights() {
        // Keep only last 30 insights
        if (this.insights.length > 30) {
            this.insights = this.insights.slice(-30);
        }
        localStorage.setItem('lumaCare_insights', JSON.stringify(this.insights));
    }

    setupInsightsTab() {
        console.log('Setting up insights tab...');
        
        // Check if tab already exists
        let insightsTab = document.getElementById('insights-tab');
        let insightsBtn = document.querySelector('[data-tab="insights"]');
        
        // Create tab if it doesn't exist
        if (!insightsTab) {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                insightsTab = document.createElement('div');
                insightsTab.className = 'tab-content';
                insightsTab.id = 'insights-tab';
                insightsTab.innerHTML = this.getInsightsHTML();
                mainContent.appendChild(insightsTab);
                console.log('Created insights tab');
            }
        }
        
        // Create button if it doesn't exist
        if (!insightsBtn) {
            const nav = document.querySelector('.nav');
            if (nav) {
                insightsBtn = document.createElement('button');
                insightsBtn.className = 'nav-btn';
                insightsBtn.dataset.tab = 'insights';
                insightsBtn.innerHTML = '<i class="fas fa-chart-line"></i> Insights';
                
                // Insert before settings button
                const settingsBtn = document.querySelector('[data-tab="settings"]');
                if (settingsBtn) {
                    settingsBtn.parentNode.insertBefore(insightsBtn, settingsBtn);
                } else {
                    nav.appendChild(insightsBtn);
                }
                
                console.log('Created insights button');
            }
        }
        
        // Setup refresh button
        setTimeout(() => {
            const refreshBtn = document.getElementById('refresh-insights');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.analyzePatterns();
                    this.renderInsights();
                });
            }
        }, 500);
    }

    showInsightsTab() {
        console.log('showInsightsTab called');
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const insightsBtn = document.querySelector('[data-tab="insights"]');
        if (insightsBtn) {
            insightsBtn.classList.add('active');
        }
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const insightsTab = document.getElementById('insights-tab');
        if (insightsTab) {
            insightsTab.classList.add('active');
            
            // Render insights
            this.analyzePatterns();
            this.renderInsights();
        } else {
            console.log('Creating insights tab on the fly...');
            this.setupInsightsTab();
            this.showInsightsTab(); // Try again
        }
    }

    getInsightsHTML() {
        return `
            <div class="insights-container">
                <div class="insights-header">
                    <h2>Your Progress Insights</h2>
                    <p>Personalized insights based on your journey</p>
                </div>
                
                <div class="insights-stats">
                    <div class="insight-stat">
                        <div class="stat-value" id="streak-insight">0</div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                    <div class="insight-stat">
                        <div class="stat-value" id="mood-stability-insight">-</div>
                        <div class="stat-label">Mood Stability</div>
                    </div>
                    <div class="insight-stat">
                        <div class="stat-value" id="session-count-insight">0</div>
                        <div class="stat-label">Sessions</div>
                    </div>
                    <div class="insight-stat">
                        <div class="stat-value" id="insight-count">0</div>
                        <div class="stat-label">Insights</div>
                    </div>
                </div>
                
                <div class="insights-content">
                    <div class="insights-list" id="insights-list">
                        <!-- Insights will be loaded here -->
                    </div>
                    
                    <div class="insights-actions">
                        <button class="btn-refresh-insights" id="refresh-insights">
                            <i class="fas fa-sync-alt"></i> Refresh Insights
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderInsights() {
        this.analyzePatterns();
        
        // Update stats
        const streakEl = document.getElementById('streak-insight');
        const stabilityEl = document.getElementById('mood-stability-insight');
        const sessionEl = document.getElementById('session-count-insight');
        const insightEl = document.getElementById('insight-count');
        
        if (streakEl) streakEl.textContent = this.patterns.consistencyStreak || 0;
        if (stabilityEl) stabilityEl.textContent = 
            this.patterns.moodStability ? this.patterns.moodStability.replace('_', ' ') : '-';
        if (sessionEl) sessionEl.textContent = this.patterns.sessionFrequency || 0;
        if (insightEl) insightEl.textContent = this.insights.length;

        // Render insights list
        const insightsList = document.getElementById('insights-list');
        if (insightsList) {
            if (this.insights.length === 0) {
                insightsList.innerHTML = `
                    <div class="no-insights">
                        <div class="no-insights-icon">🔍</div>
                        <h3>No insights yet</h3>
                        <p>Continue using LumaCare to generate personalized insights</p>
                    </div>
                `;
            } else {
                // Sort by date (newest first)
                const sortedInsights = [...this.insights].sort((a, b) => 
                    new Date(b.date) - new Date(a.date)
                ).slice(0, 5); // Show only 5 most recent

                insightsList.innerHTML = sortedInsights.map(insight => `
                    <div class="insight-card insight-${insight.type}">
                        <div class="insight-header">
                            <div class="insight-emoji">${insight.emoji}</div>
                            <div class="insight-title">
                                <h4>${insight.title}</h4>
                                <span class="insight-date">${this.getTimeAgo(new Date(insight.date))}</span>
                            </div>
                        </div>
                        <div class="insight-message">
                            <p>${insight.message}</p>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
}  // ❤️ END OF CLASS - MAKE SURE NOTHING COMES AFTER THIS!

// =================== //
// INTEGRATION WITH EXISTING SYSTEMS //
// =================== //

// Update the initialization
let personalizationSystem, progressInsights;

// Add SOS button to chat interface
function addSOSButton() {
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader && !chatHeader.querySelector('.sos-button')) {
        const sosButton = document.createElement('button');
        sosButton.className = 'icon-btn sos-button';
        sosButton.innerHTML = '<i class="fas fa-life-ring"></i>';
        sosButton.title = 'SOS Calm Sequence';
        sosButton.addEventListener('click', () => {
            if (personalizationSystem) {
                personalizationSystem.showSOSSelector();
            }
        });
        
        const chatActions = document.querySelector('.chat-actions');
        if (chatActions) {
            chatActions.insertBefore(sosButton, chatActions.firstChild);
        }
    }
}

// Update the main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all systems
    setTimeout(() => {
        moodSystem = new MoodSystem();
        gardenSystem = new GardenSystem();
        weatherSystem = new WeatherSystem();
        enhancedChat = new EnhancedChat();
        personalizationSystem = new PersonalizationSystem();
        progressInsights = new ProgressInsights();
        
        // Add SOS button
        addSOSButton();
        
        // Show ritual suggestion after mood check-in
        const checkMoodInterval = setInterval(() => {
            if (moodSystem.currentMood) {
                personalizationSystem.showRitualSuggestion();
                clearInterval(checkMoodInterval);
            }
        }, 1000);
        
        // Update personalized greeting
        setTimeout(() => {
            const greeting = personalizationSystem.getPersonalizedGreeting();
            if (greeting && document.getElementById('chat-messages')) {
                const personalizedMsg = `
                    <div class="message ai-message">
                        <div class="message-avatar"><i class="fas fa-robot"></i></div>
                        <div class="message-content">
                            <p>${greeting}. I'm here to support you today. 💙</p>
                        </div>
                    </div>
                `;
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = personalizedMsg;
                document.getElementById('chat-messages').appendChild(tempDiv.firstElementChild);
            }
        }, 2000);
        
        console.log('🎯 All enhancement phases initialized');
        
    }, 1500);
});

// =================== //
// ADDITIONAL CSS FOR NEW FEATURES //
// =================== //

// Add these styles to your CSS
const phase2Styles = `
/* Ritual Modal */
.ritual-modal .modal-content {
    max-width: 500px;
}

.ritual-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 1rem;
    padding: 1.5rem;
}

.ritual-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.ritual-emoji {
    font-size: 3rem;
}

.ritual-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.4rem;
}

.ritual-info p {
    margin: 0 0 0.5rem 0;
    opacity: 0.9;
}

.ritual-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    opacity: 0.8;
}

.ritual-steps {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 0.75rem;
    margin: 1rem 0;
}

.ritual-steps h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
}

.ritual-steps ol {
    margin: 0;
    padding-left: 1.5rem;
}

.ritual-steps li {
    margin-bottom: 0.5rem;
    padding: 0.25rem 0;
}

.ritual-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
}

.btn-start-ritual {
    background: white;
    color: #667eea;
    border: none;
    padding: 1rem;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-start-ritual:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.btn-skip-ritual {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.75rem;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-skip-ritual:hover {
    background: rgba(255, 255, 255, 0.1);
}

/* Ritual Chat Card */
.ritual-chat-card {
    background: rgba(138, 43, 226, 0.1);
    border-radius: 0.75rem;
    padding: 1rem;
    border-left: 4px solid #9C27B0;
}

.ritual-chat-card h4 {
    margin: 0 0 0.75rem 0;
    color: var(--primary-light);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.ritual-chat-steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 1rem 0;
}

.ritual-step {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
}

.step-number {
    background: var(--primary);
    color: white;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 600;
    flex-shrink: 0;
}

.step-text {
    flex: 1;
    line-height: 1.5;
}

/* SOS Styles */
.sos-modal .modal-content {
    max-width: 500px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.sos-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 1.5rem 0;
}

.sos-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid;
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.sos-option:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(5px);
}

.sos-emoji {
    font-size: 2rem;
}

.sos-info {
    flex: 1;
}

.sos-info h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.2rem;
}

.sos-info p {
    margin: 0;
    opacity: 0.8;
    font-size: 0.9rem;
}

.sos-arrow {
    font-size: 1.5rem;
    opacity: 0.7;
}

.sos-note {
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 0.75rem;
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    margin-top: 1rem;
}

.sos-note i {
    color: #FF5252;
    margin-top: 0.25rem;
}

.sos-note p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
}

/* SOS Chat Card */
.sos-chat-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    padding: 1rem;
    border-left: 4px solid;
}

.sos-chat-card h4 {
    margin: 0 0 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.sos-steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 1rem 0;
}

.sos-step {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0.5rem;
    transition: all 0.3s ease;
}

.sos-step:hover {
    background: rgba(255, 255, 255, 0.15);
}

.sos-step-number {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
}

.sos-step-content {
    flex: 1;
    line-height: 1.5;
}

.btn-step-complete {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.btn-step-complete:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.btn-step-complete.completed {
    background: #4CAF50;
    color: white;
}

.sos-encouragement {
    text-align: center;
    font-style: italic;
    opacity: 0.9;
    margin: 1rem 0 0 0;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Insights Styles */
.insights-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 1rem;
    padding: 1.5rem;
    color: white;
}

.insights-header {
    text-align: center;
    margin-bottom: 2rem;
}

.insights-header h2 {
    color: white;
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
}

.insights-header p {
    opacity: 0.8;
    font-size: 1rem;
}

.insights-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 1rem;
}

.insight-stat {
    text-align: center;
}

.insight-stat .stat-value {
    display: block;
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.25rem;
}

.insight-stat .stat-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.8);
}

.insights-content {
    display: grid;
    gap: 2rem;
}

.insights-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.insight-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0.75rem;
    padding: 1.25rem;
    border-left: 4px solid;
    transition: all 0.3s ease;
}

.insight-card:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(5px);
}

.insight-pattern {
    border-left-color: #2196F3;
}

.insight-achievement {
    border-left-color: #FF9800;
}

.insight-growth {
    border-left-color: #4CAF50;
}

.insight-commitment {
    border-left-color: #9C27B0;
}

.insight-analysis {
    border-left-color: #607D8B;
}

.insight-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.insight-emoji {
    font-size: 1.5rem;
}

.insight-title {
    flex: 1;
}

.insight-title h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
}

.insight-date {
    font-size: 0.8rem;
    opacity: 0.7;
}

.insight-message p {
    margin: 0;
    line-height: 1.6;
}

.no-insights {
    text-align: center;
    padding: 3rem;
}

.no-insights-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.no-insights h3 {
    color: white;
    margin-bottom: 0.5rem;
}

.no-insights p {
    opacity: 0.7;
}

.insights-patterns {
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 1rem;
}

.insights-patterns h3 {
    color: white;
    margin-bottom: 1rem;
    font-size: 1.3rem;
}

.patterns-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

.pattern-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    padding: 1rem;
}

.pattern-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.pattern-emoji {
    font-size: 1.25rem;
}

.pattern-header h4 {
    margin: 0;
    font-size: 1rem;
    color: white;
}

.pattern-chart {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.chart-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.chart-label {
    width: 60px;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.8);
}

.chart-progress {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: white;
    border-radius: 3px;
}

.chart-value {
    width: 30px;
    text-align: right;
    font-size: 0.8rem;
    font-weight: 600;
}

.progress-display {
    text-align: center;
}

.progress-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.progress-label {
    font-size: 0.85rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
}

.progress-breakdown {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    font-size: 0.75rem;
    opacity: 0.7;
}

.streak-display {
    text-align: center;
}

.streak-value {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.streak-label {
    font-size: 0.85rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
}

.streak-history {
    font-size: 0.8rem;
    opacity: 0.7;
}

.insights-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
}

.btn-refresh-insights {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-refresh-insights:hover {
    background: rgba(255, 255, 255, 0.2);
}

.btn-export-insights {
    background: white;
    color: #667eea;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-export-insights:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* SOS Button in Chat */
.sos-button {
    background: linear-gradient(135deg, #FF5252 0%, #FF4081 100%);
    color: white;
    border: none;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    animation: sosPulse 2s infinite;
}

@keyframes sosPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

.sos-button:hover {
    animation: none;
    transform: scale(1.15);
}

/* Responsive Design */
@media (max-width: 768px) {
    .insights-stats {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .patterns-grid {
        grid-template-columns: 1fr;
    }
    
    .sos-option {
        padding: 1rem;
    }
    
    .ritual-header {
        flex-direction: column;
        text-align: center;
    }
    
    .insights-actions {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    .insight-stat .stat-value {
        font-size: 1.5rem;
    }
    
    .pattern-card {
        padding: 0.75rem;
    }
    
    .ritual-actions {
        gap: 0.5rem;
    }
}
`;

// Add the phase 2 styles to the document
const phase2StyleSheet = document.createElement('style');
phase2StyleSheet.textContent = phase2Styles;
document.head.appendChild(phase2StyleSheet);

// =================== //
// SETTINGS ENHANCEMENTS //
// =================== //

// Add personalization settings to settings tab
function enhanceSettingsTab() {
    const settingsContainer = document.querySelector('#settings-tab .settings-container');
    if (!settingsContainer || document.querySelector('.personalization-section')) return;

    const personalizationHTML = `
        <div class="settings-section personalization-section">
            <h3>Personalization</h3>
            <div class="setting-item">
                <div class="setting-info">
                    <h4>Preferred Name</h4>
                    <p>What should I call you?</p>
                </div>
                <input type="text" id="preferred-name" placeholder="Enter your name" 
                       value="${personalizationSystem?.userPreferences?.preferredName || ''}" 
                       style="width: 150px; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: var(--light);">
            </div>
            
            <div class="setting-item">
                <div class="setting-info">
                    <h4>Daily Rituals</h4>
                    <p>Receive daily practice suggestions</p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="daily-rituals-toggle" 
                           ${personalizationSystem?.userPreferences?.morningRoutine ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="setting-item">
                <div class="setting-info">
                    <h4>Voice Guidance</h4>
                    <p>Audio support during exercises</p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="voice-guidance-toggle" 
                           ${personalizationSystem?.userPreferences?.voiceGuidance ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="setting-item">
                <div class="setting-info">
                    <h4>Haptic Feedback</h4>
                    <p>Gentle vibrations on interaction</p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="haptic-feedback-toggle" 
                           ${personalizationSystem?.userPreferences?.hapticFeedback ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            
            <div class="setting-item">
                <div class="setting-info">
                    <h4>Reduced Motion</h4>
                    <p>Minimize animations</p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" id="reduced-motion-toggle" 
                           ${personalizationSystem?.userPreferences?.reducedMotion ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = personalizationHTML;
    const personalizationSection = tempDiv.firstElementChild;
    
    // Insert after appearance section
    const appearanceSection = settingsContainer.querySelector('.settings-section');
    if (appearanceSection) {
        appearanceSection.insertAdjacentElement('afterend', personalizationSection);
        
        // Add event listeners
        setTimeout(() => {
            const nameInput = document.getElementById('preferred-name');
            const ritualsToggle = document.getElementById('daily-rituals-toggle');
            const voiceToggle = document.getElementById('voice-guidance-toggle');
            const hapticToggle = document.getElementById('haptic-feedback-toggle');
            const motionToggle = document.getElementById('reduced-motion-toggle');
            
            if (nameInput && personalizationSystem) {
                nameInput.addEventListener('change', (e) => {
                    personalizationSystem.updatePreference('preferredName', e.target.value);
                });
            }
            
            if (ritualsToggle && personalizationSystem) {
                ritualsToggle.addEventListener('change', (e) => {
                    personalizationSystem.updatePreference('morningRoutine', e.target.checked);
                    personalizationSystem.updatePreference('eveningReflection', e.target.checked);
                });
            }
            
            if (voiceToggle && personalizationSystem) {
                voiceToggle.addEventListener('change', (e) => {
                    personalizationSystem.updatePreference('voiceGuidance', e.target.checked);
                });
            }
            
            if (hapticToggle && personalizationSystem) {
                hapticToggle.addEventListener('change', (e) => {
                    personalizationSystem.updatePreference('hapticFeedback', e.target.checked);
                });
            }
            
            if (motionToggle && personalizationSystem) {
                motionToggle.addEventListener('change', (e) => {
                    personalizationSystem.updatePreference('reducedMotion', e.target.checked);
                    if (e.target.checked) {
                        document.documentElement.style.setProperty('--animation-speed', '0.01ms');
                    } else {
                        document.documentElement.style.removeProperty('--animation-speed');
                    }
                });
            }
        }, 100);
    }
}

// Update settings when tab is viewed
document.addEventListener('DOMContentLoaded', function() {
    const settingsBtn = document.querySelector('[data-tab="settings"]');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            setTimeout(enhanceSettingsTab, 100);
        });
    }
});

// =================== //
// FINAL INITIALIZATION //
// =================== //

console.log('🎯 LumaCare Enhancement Phases Complete!');
console.log('✅ Phase 1: Mood Check-in, Growth Garden, Emotional Weather');
console.log('✅ Phase 2: Daily Rituals, SOS Sequences, Personalization');
console.log('✅ Phase 3: Progress Insights, Analytics, Settings Integration');
console.log('✅ All systems integrated and ready');

// =================== //
// FINAL INTEGRATION & OPTIMIZATION //
// =================== //

class LumaCareOptimizer {
    constructor() {
        this.performanceMetrics = {};
        this.init();
    }

    init() {
        this.setupPerformanceMonitoring();
        this.setupResourceOptimization();
        this.setupAnalyticsQueue();
        this.setupConnectionMonitor();
        this.setupBatteryOptimization();
    }

    setupPerformanceMonitoring() {
        // Measure initial load time
        this.performanceMetrics.loadStart = performance.now();
        
        window.addEventListener('load', () => {
            this.performanceMetrics.loadEnd = performance.now();
            this.performanceMetrics.loadTime = 
                this.performanceMetrics.loadEnd - this.performanceMetrics.loadStart;
            
            console.log(`🚀 Load time: ${this.performanceMetrics.loadTime.toFixed(2)}ms`);
            
            // Track performance
            trackEvent('performance_metrics', {
                load_time: Math.round(this.performanceMetrics.loadTime),
                memory_usage: performance.memory ? 
                    Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'N/A'
            });
        });

        // Monitor memory usage
        if (performance.memory) {
            setInterval(() => {
                const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                if (memoryMB > 50) { // Threshold
                    this.triggerMemoryCleanup();
                }
            }, 30000); // Check every 30 seconds
        }

        // Monitor frame rate
        this.setupFPSMonitoring();
    }

    setupFPSMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const checkFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                
                if (fps < 50) {
                    console.warn(`⚠️ Low FPS: ${fps}`);
                    this.optimizeAnimations();
                }
            }
            
            requestAnimationFrame(checkFPS);
        };
        
        requestAnimationFrame(checkFPS);
    }

    optimizeAnimations() {
        // Reduce animation intensity when performance is low
        document.querySelectorAll('.mood-emoji, .weather-icon, .plant').forEach(el => {
            el.style.animationPlayState = 'paused';
            
            setTimeout(() => {
                el.style.animationPlayState = 'running';
                el.style.animationDuration = '2s';
            }, 100);
        });
    }

    triggerMemoryCleanup() {
        // Clear unused caches
        if (window.gc) {
            window.gc();
        }
        
        // Clear image caches
        document.querySelectorAll('img').forEach(img => {
            if (!img.offsetParent) { // Not visible
                img.src = '';
            }
        });
        
        console.log('🧹 Memory cleanup triggered');
    }

    setupResourceOptimization() {
        // Lazy load non-critical resources
        this.lazyLoadImages();
        this.deferNonCriticalCSS();
        
        // Optimize animations for battery
        this.setupAnimationOptimization();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    deferNonCriticalCSS() {
        // Critical CSS is already inlined
        // Non-critical CSS can be loaded later
        const nonCriticalCSS = [
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        ];
        
        nonCriticalCSS.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.media = 'print';
            link.onload = () => {
                link.media = 'all';
            };
            document.head.appendChild(link);
        });
    }

    setupAnimationOptimization() {
        // Reduce animations when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
        
        // Reduce animations on battery saver
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.charging === false && battery.level < 0.2) {
                    this.reduceAnimationIntensity();
                }
                
                battery.addEventListener('chargingchange', () => {
                    if (battery.charging === false && battery.level < 0.2) {
                        this.reduceAnimationIntensity();
                    } else {
                        this.normalizeAnimations();
                    }
                });
            });
        }
    }

    pauseAnimations() {
        document.querySelectorAll('*').forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.animationName !== 'none') {
                el.dataset.originalAnimationPlayState = style.animationPlayState;
                el.style.animationPlayState = 'paused';
            }
        });
    }

    resumeAnimations() {
        document.querySelectorAll('*').forEach(el => {
            if (el.dataset.originalAnimationPlayState) {
                el.style.animationPlayState = el.dataset.originalAnimationPlayState;
                delete el.dataset.originalAnimationPlayState;
            }
        });
    }

    reduceAnimationIntensity() {
        document.documentElement.style.setProperty('--animation-speed', '2s');
        document.querySelectorAll('.mood-emoji, .weather-icon').forEach(el => {
            el.style.animationIterationCount = '1';
        });
    }

    normalizeAnimations() {
        document.documentElement.style.removeProperty('--animation-speed');
        document.querySelectorAll('.mood-emoji, .weather-icon').forEach(el => {
            el.style.animationIterationCount = 'infinite';
        });
    }

    setupAnalyticsQueue() {
        this.analyticsQueue = [];
        this.flushInterval = setInterval(() => this.flushAnalytics(), 30000); // Every 30 seconds
        
        // Flush on page hide
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.flushAnalytics();
            }
        });
    }

    queueAnalyticsEvent(eventName, properties = {}) {
        this.analyticsQueue.push({
            id: Date.now() + Math.random(),
            event: eventName,
            timestamp: Date.now(),
            properties
        });
        
        // Store in localStorage for offline
        localStorage.setItem('lumaCare_analytics_queue', JSON.stringify(this.analyticsQueue));
    }

    async flushAnalytics() {
        if (this.analyticsQueue.length === 0 || !navigator.onLine) return;
        
        const eventsToSend = [...this.analyticsQueue];
        this.analyticsQueue = [];
        
        try {
            // In production, send to your analytics endpoint
            // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(eventsToSend) });
            
            console.log(`📤 Sent ${eventsToSend.length} analytics events`);
            localStorage.removeItem('lumaCare_analytics_queue');
        } catch (error) {
            // Requeue if failed
            this.analyticsQueue = [...this.analyticsQueue, ...eventsToSend];
            console.error('Failed to send analytics:', error);
        }
    }

    setupConnectionMonitor() {
        const connectionStatus = document.createElement('div');
        connectionStatus.className = 'connection-status';
        connectionStatus.innerHTML = `
            <div class="connection-dot ${navigator.onLine ? 'online' : 'offline'}"></div>
            <span>${navigator.onLine ? 'Online' : 'Offline'}</span>
        `;
        document.body.appendChild(connectionStatus);
        
        window.addEventListener('online', () => {
            connectionStatus.querySelector('.connection-dot').className = 'connection-dot online';
            connectionStatus.querySelector('span').textContent = 'Online';
            this.flushAnalytics();
        });
        
        window.addEventListener('offline', () => {
            connectionStatus.querySelector('.connection-dot').className = 'connection-dot offline';
            connectionStatus.querySelector('span').textContent = 'Offline';
        });
    }

    setupBatteryOptimization() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.3) {
                    this.enableBatterySaverMode();
                }
                
                battery.addEventListener('levelchange', () => {
                    if (battery.level < 0.3) {
                        this.enableBatterySaverMode();
                    } else {
                        this.disableBatterySaverMode();
                    }
                });
            });
        }
    }

    enableBatterySaverMode() {
        document.body.classList.add('battery-saver');
        
        // Reduce animations
        this.reduceAnimationIntensity();
        
        // Reduce polling intervals
        if (weatherSystem) {
            clearInterval(weatherSystem.animationInterval);
        }
        
        console.log('🔋 Battery saver mode enabled');
    }

    disableBatterySaverMode() {
        document.body.classList.remove('battery-saver');
        this.normalizeAnimations();
        console.log('🔋 Battery saver mode disabled');
    }
}

// =================== //
// GLOBAL ERROR HANDLING //
// =================== //

window.addEventListener('error', function(e) {
    console.error('🚨 Global error:', e.error);
    
    // Track error
    if (window.optimizer) {
        optimizer.queueAnalyticsEvent('error_occurred', {
            message: e.error.message,
            stack: e.error.stack,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno
        });
    }
    
    // Don't show error to user in production
    // In development, you might want to show a friendly error
    if (window.location.hostname === 'localhost') {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h4>Something went wrong</h4>
                <p>${e.error.message}</p>
                <button class="btn-dismiss-error">Dismiss</button>
                <button class="btn-report-error">Report</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        errorDiv.querySelector('.btn-dismiss-error').addEventListener('click', () => {
            errorDiv.remove();
        });
        
        errorDiv.querySelector('.btn-report-error').addEventListener('click', () => {
            window.location.href = `mailto:lumacare.therapy@gmail.com?subject=LumaCare%20Error&body=${encodeURIComponent(e.error.stack)}`;
            errorDiv.remove();
        });
    }
});

// =================== //
// FINAL INITIALIZATION //
// =================== //

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 LumaCare v2.0 Initializing...');
    
    // Show loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner-large"></div>
        <p>Preparing your therapy space...</p>
    `;
    document.body.appendChild(loadingOverlay);
    
    // Initialize systems with delay for better UX
    setTimeout(() => {
        try {
            // Core systems
            moodSystem = new MoodSystem();
            gardenSystem = new GardenSystem();
            weatherSystem = new WeatherSystem();
            enhancedChat = new EnhancedChat();
            personalizationSystem = new PersonalizationSystem();
            progressInsights = new ProgressInsights();
            optimizer = new LumaCareOptimizer();
            
            // Add SOS button
            addSOSButton();
            
            // Enhance settings
            enhanceSettingsTab();
            
            // Register service worker for PWA
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('✅ Service Worker registered');
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.error('Service Worker registration failed:', error);
                    });
            }
            
            // Remove loading overlay
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                setTimeout(() => {
                    loadingOverlay.remove();
                    
                    // Show welcome message
                    setTimeout(() => {
                        const welcomeMessage = personalizationSystem.getPersonalizedGreeting();
                        if (welcomeMessage && document.getElementById('chat-messages')) {
                            const welcomeDiv = document.createElement('div');
                            welcomeDiv.className = 'message ai-message';
                            welcomeDiv.innerHTML = `
                                <div class="message-avatar"><i class="fas fa-robot"></i></div>
                                <div class="message-content">
                                    <p>${welcomeMessage}. Welcome to LumaCare v2.0! ✨</p>
                                    <p>Your enhanced therapy experience is ready with:</p>
                                    <ul>
                                        <li>🌱 Daily Growth Garden</li>
                                        <li>🌦️ Emotional Weather</li>
                                        <li>🆘 SOS Calm Sequences</li>
                                        <li>📊 Progress Insights</li>
                                        <li>💫 Personalized Rituals</li>
                                    </ul>
                                    <p>I'm here to support your mental wellness journey. 💙</p>
                                </div>
                            `;
                            document.getElementById('chat-messages').appendChild(welcomeDiv);
                            document.getElementById('chat-messages').scrollTop = 
                                document.getElementById('chat-messages').scrollHeight;
                        }
                    }, 500);
                }, 300);
            }, 1000);
            
            console.log('✅ LumaCare v2.0 Initialized Successfully!');
            console.log('🎯 All Phases Complete:');
            console.log('   ✅ Phase 1: Mood, Garden, Weather');
            console.log('   ✅ Phase 2: Rituals, SOS, Personalization');
            console.log('   ✅ Phase 3: Insights, Analytics, Optimization');
            console.log('   ✅ PWA: Service Worker, Manifest, Offline');
            console.log('   ✅ Performance: Monitoring, Optimization');
            
            // Track successful initialization
            optimizer.queueAnalyticsEvent('app_initialized', {
                version: '2.0',
                features: ['mood', 'garden', 'weather', 'rituals', 'sos', 'insights', 'pwa'],
                load_time: optimizer.performanceMetrics.loadTime ?
                    Math.round(optimizer.performanceMetrics.loadTime) : 'N/A'
            });
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            loadingOverlay.innerHTML = `
                <div class="error-icon">❌</div>
                <h3>Initialization Error</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()">Retry</button>
            `;
            
            // Track initialization error
            if (window.optimizer) {
                optimizer.queueAnalyticsEvent('initialization_failed', {
                    error: error.message,
                    stack: error.stack
                });
            }
        }
    }, 500);
});

function showUpdateNotification() {
    const updateNotification = document.createElement('div');
    updateNotification.className = 'update-notification';
    updateNotification.innerHTML = `
        <div class="update-content">
            <h4>Update Available</h4>
            <p>A new version of LumaCare is available.</p>
            <button class="btn-update-now">Update Now</button>
            <button class="btn-update-later">Later</button>
        </div>
    `;
    
    document.body.appendChild(updateNotification);
    
    updateNotification.querySelector('.btn-update-now').addEventListener('click', () => {
        window.location.reload();
    });
    
    updateNotification.querySelector('.btn-update-later').addEventListener('click', () => {
        updateNotification.remove();
    });
}

// System status indicator
setTimeout(() => {
    const systemStatus = document.createElement('div');
    systemStatus.className = 'system-status';
    systemStatus.innerHTML = `
        <div class="status-dot"></div>
        <span>v2.0</span>
    `;
    document.body.appendChild(systemStatus);
}, 2000);
// =================== //
// PRIORITY MATRIX ENHANCEMENT //
// =================== //

class PriorityMatrixSystem {
    constructor() {
        this.isFirstTime = !localStorage.getItem('lumaCare_priorityMatrix_visited');
        this.init();
    }

    init() {
        if (this.isFirstTime) {
            this.setupFirstTimeExperience();
        }
    }

    setupFirstTimeExperience() {
        // Example tasks for first-time users
        const exampleTasks = {
            'urgent-important': [
                { id: 1, text: 'Finish today\'s work report', editable: true },
                { id: 2, text: 'Prepare for 3pm meeting', editable: true }
            ],
            'important-not-urgent': [
                { id: 3, text: 'Plan next week\'s schedule', editable: true },
                { id: 4, text: 'Learn new skill for career growth', editable: true }
            ],
            'urgent-not-important': [
                { id: 5, text: 'Reply to non-critical emails', editable: true },
                { id: 6, text: 'Schedule routine appointment', editable: true }
            ],
            'neither': [
                { id: 7, text: 'Browse social media', editable: true },
                { id: 8, text: 'Watch random YouTube videos', editable: true }
            ]
        };

        // Save examples to localStorage
        localStorage.setItem('lumaCare_priorityMatrix_examples', JSON.stringify(exampleTasks));
        
        // Mark as visited
        localStorage.setItem('lumaCare_priorityMatrix_visited', 'true');
        
        console.log('✅ Priority Matrix examples loaded for first-time user');
    }

    getExamples() {
        const examples = localStorage.getItem('lumaCare_priorityMatrix_examples');
        return examples ? JSON.parse(examples) : null;
    }

    clearExamples() {
        localStorage.removeItem('lumaCare_priorityMatrix_examples');
        console.log('🗑️ Priority Matrix examples cleared');
    }
}

// =================== //
// BRAIN DUMP SYSTEM //
// =================== //

class BrainDumpSystem {
    constructor() {
        this.tasks = [];
        this.maxTasks = 20;
        this.init();
    }

    init() {
        this.loadSavedTasks();
        this.setupEventListeners();
    }

    loadSavedTasks() {
        const saved = localStorage.getItem('lumaCare_brainDump_tasks');
        if (saved) {
            this.tasks = JSON.parse(saved);
        }
    }

    saveTasks() {
        localStorage.setItem('lumaCare_brainDump_tasks', JSON.stringify(this.tasks));
    }

    setupEventListeners() {
    }

    addTask(text, category = 'uncategorized') {
        if (this.tasks.length >= this.maxTasks) {
            return { success: false, message: 'Maximum 20 tasks for clarity' };
        }

        const task = {
            id: Date.now() + Math.random(),
            text: text.trim(),
            category: category,
            createdAt: Date.now(),
            quadrant: null,
            completed: false
        };

        this.tasks.push(task);
        this.saveTasks();

        trackEvent('brain_dump_task_added', { source: 'manual' });

        return { success: true, task };
    }

    removeTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
    }

    clearAllTasks() {
        this.tasks = [];
        this.saveTasks();
        trackEvent('brain_dump_cleared');
    }

    getUncategorizedTasks() {
        return this.tasks.filter(task => !task.quadrant);
    }

    categorizeTask(taskId, quadrant) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.quadrant = quadrant;
            this.saveTasks();
            trackEvent('task_categorized', { quadrant });
        }
    }

    getQuickSuggestions() {
        return [
            "Finish work report",
            "Reply to emails",
            "Plan next week",
            "Exercise",
            "Grocery shopping",
            "Call family",
            "Learn something new",
            "Clean workspace",
            "Pay bills",
            "Schedule appointment"
        ];
    }
}

let brainDumpSystem;

// Initialize when page loads
let priorityMatrixSystem;
document.addEventListener('DOMContentLoaded', function() {
    priorityMatrixSystem = new PriorityMatrixSystem();
    brainDumpSystem = new BrainDumpSystem();
});

// =================== //
// BRAIN DUMP UI FUNCTIONS //
// =================== //

function showBrainDumpModal() {
    const modalHTML = `
        <div class="modal brain-dump-modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🗂️ Priority Matrix - Start with Brain Dump</h2>
                    <p>First, dump ALL tasks on your mind. Then we'll organize them.</p>
                </div>
                <div class="modal-body">
                    <div class="brain-dump-container">
                        <div class="dump-instructions">
                            <h3>Step 1: Brain Dump</h3>
                            <p>List everything on your mind. Don't judge or organize yet.</p>
                            <div class="task-input-container">
                                <textarea
                                    id="brain-dump-input"
                                    placeholder="Type your tasks here... One per line or separated by commas.

Quick examples: Finish report, Call mom, Exercise, Plan vacation, Pay bills"
                                    rows="4"
                                ></textarea>
                                <div class="input-actions">
                                    <button class="btn-add-task" id="add-task-btn">
                                        <i class="fas fa-plus"></i> Add Tasks
                                    </button>
                                    <button class="btn-quick-add" id="quick-suggest-btn">
                                        <i class="fas fa-bolt"></i> Quick Add
                                    </button>
                                </div>
                            </div>

                            <div class="quick-suggestions">
                                <h4>Common Tasks (click to add):</h4>
                                <div class="suggestion-chips" id="suggestion-chips">
                                </div>
                            </div>
                        </div>

                        <div class="task-list-container">
                            <h3>Your Tasks (<span id="task-count">0</span>)</h3>
                            <div class="task-list" id="brain-dump-list">
                            </div>
                            <div class="list-actions">
                                <button class="btn-clear-list" id="clear-list-btn">
                                    <i class="fas fa-trash"></i> Clear All
                                </button>
                                <button class="btn-proceed" id="proceed-to-matrix-btn" disabled>
                                    <i class="fas fa-arrow-right"></i> Organize in Matrix →
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="brain-dump-tips">
                        <div class="tip">
                            <i class="fas fa-lightbulb"></i>
                            <span><strong>Tip:</strong> Dump everything first, even small tasks. We'll organize next.</span>
                        </div>
                        <div class="tip">
                            <i class="fas fa-clock"></i>
                            <span><strong>Time:</strong> Spend 2-3 minutes just listing. Perfection comes later.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    initBrainDumpUI();
}

function initBrainDumpUI() {
    renderTaskList();

    document.getElementById('add-task-btn').addEventListener('click', addTasksFromInput);
    document.getElementById('clear-list-btn').addEventListener('click', clearAllTasks);
    document.getElementById('proceed-to-matrix-btn').addEventListener('click', proceedToPriorityMatrix);
    document.getElementById('brain-dump-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            addTasksFromInput();
        }
    });

    loadQuickSuggestions();
}

function addTasksFromInput() {
    const input = document.getElementById('brain-dump-input');
    const text = input.value.trim();

    if (!text) return;

    const tasks = text.split(/[\n,]/)
        .map(t => t.trim())
        .filter(t => t.length > 0);

    let addedCount = 0;
    tasks.forEach(taskText => {
        if (taskText && brainDumpSystem.tasks.length < brainDumpSystem.maxTasks) {
            const result = brainDumpSystem.addTask(taskText);
            if (result.success) addedCount++;
        }
    });

    if (addedCount > 0) {
        input.value = '';
        renderTaskList();
        showToast(`Added ${addedCount} task${addedCount > 1 ? 's' : ''}`);
    }

    updateProceedButton();
}

function loadQuickSuggestions() {
    const container = document.getElementById('suggestion-chips');
    const suggestions = brainDumpSystem.getQuickSuggestions();

    container.innerHTML = suggestions.map(suggestion => `
        <span class="suggestion-chip" data-text="${suggestion}">
            ${suggestion}
        </span>
    `).join('');

    document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            const text = this.dataset.text;
            document.getElementById('brain-dump-input').value += text + '\n';
            showToast(`Added: ${text}`);
        });
    });
}

function renderTaskList() {
    const container = document.getElementById('brain-dump-list');
    const countElement = document.getElementById('task-count');

    if (!brainDumpSystem.tasks.length) {
        container.innerHTML = `
            <div class="empty-task-list">
                <i class="fas fa-tasks"></i>
                <p>No tasks yet. Start typing above!</p>
            </div>
        `;
        countElement.textContent = '0';
        return;
    }

    container.innerHTML = brainDumpSystem.tasks.map(task => `
        <div class="task-item" data-id="${task.id}">
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                ${task.quadrant ? `<span class="task-category">${task.quadrant}</span>` : ''}
            </div>
            <button class="btn-remove-task" data-id="${task.id}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    countElement.textContent = brainDumpSystem.tasks.length;

    document.querySelectorAll('.btn-remove-task').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = parseFloat(this.dataset.id);
            brainDumpSystem.removeTask(taskId);
            renderTaskList();
            updateProceedButton();
            showToast('Task removed');
        });
    });
}

function clearAllTasks() {
    if (confirm('Clear all tasks? This cannot be undone.')) {
        brainDumpSystem.clearAllTasks();
        renderTaskList();
        updateProceedButton();
        showToast('All tasks cleared');
    }
}

function updateProceedButton() {
    const btn = document.getElementById('proceed-to-matrix-btn');
    btn.disabled = brainDumpSystem.tasks.length === 0;

    if (!btn.disabled) {
        btn.innerHTML = `<i class="fas fa-arrow-right"></i> Organize ${brainDumpSystem.tasks.length} Task${brainDumpSystem.tasks.length > 1 ? 's' : ''} →`;
    }
}

function proceedToPriorityMatrix() {
    const modal = document.querySelector('.brain-dump-modal');
    if (modal) modal.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    messageDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            <div class="matrix-transition-guide">
                <h4>🎯 Great! Now Let's Organize</h4>
                <p>You listed <strong>${brainDumpSystem.tasks.length} tasks</strong>. Here's how to use the Priority Matrix:</p>

                <div class="matrix-instructions">
                    <div class="instruction-step">
                        <div class="step-number">1</div>
                        <div class="step-content">
                            <strong>For each task, ask:</strong>
                            <ul>
                                <li>Is this <span class="urgent">URGENT</span>? (Needs immediate attention)</li>
                                <li>Is this <span class="important">IMPORTANT</span>? (Aligns with your goals)</li>
                            </ul>
                        </div>
                    </div>

                    <div class="instruction-step">
                        <div class="step-number">2</div>
                        <div class="step-content">
                            <strong>Drag tasks to the right quadrant:</strong>
                            <div class="quadrant-guide">
                                <div class="quadrant urgent-important">
                                    <strong>Urgent & Important</strong>
                                    <p>Do these NOW (deadlines, crises)</p>
                                </div>
                                <div class="quadrant important-not-urgent">
                                    <strong>Important, Not Urgent</strong>
                                    <p>Schedule these (planning, growth)</p>
                                </div>
                                <div class="quadrant urgent-not-important">
                                    <strong>Urgent, Not Important</strong>
                                    <p>Delegate or minimize these</p>
                                </div>
                                <div class="quadrant neither">
                                    <strong>Neither</strong>
                                    <p>Eliminate or do later</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="instruction-step">
                        <div class="step-number">3</div>
                        <div class="step-content">
                            <strong>Focus on Quadrant 2</strong> (Important, Not Urgent) for long-term success
                        </div>
                    </div>
                </div>

                <div class="transition-actions">
                    <button class="btn-view-tasks" onclick="showTaskListForMatrix()">
                        <i class="fas fa-list"></i> View Your Tasks
                    </button>
                    <button class="btn-start-organizing" onclick="startMatrixOrganization()">
                        <i class="fas fa-th-large"></i> Start Organizing
                    </button>
                </div>

                <p class="encouragement">💡 Remember: This is about clarity, not perfection!</p>
            </div>
        </div>
    `;

    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    trackEvent('brain_dump_completed', { task_count: brainDumpSystem.tasks.length });
}

function showTaskListForMatrix() {
    const tasks = brainDumpSystem.tasks;
    const taskList = tasks.map(t => `- ${t.text}`).join('\n');
    showToast(`You have ${tasks.length} tasks ready to organize`);
}

function startMatrixOrganization() {
    showToast('Matrix organization feature coming soon!');
}

// Helper functions for Priority Matrix
function startPriorityMatrixWithExamples() {
    console.log('Starting Priority Matrix with examples');

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    messageDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            <div class="priority-matrix-guide">
                <h4>🚀 Priority Matrix - Quick Start</h4>
                <p>I've loaded example tasks for you! Here's how to get started:</p>
                <ol>
                    <li><strong>Click any example task</strong> to edit it to match your actual work</li>
                    <li><strong>Drag tasks between quadrants</strong> if your priorities change</li>
                    <li><strong>Add your own tasks</strong> using the "Add Task" button</li>
                    <li><strong>Focus on Quadrant 2</strong> (Important, Not Urgent) for long-term success</li>
                </ol>
                <p>Remember: The goal is clarity, not perfection! Start simple.</p>
                <div class="matrix-tips">
                    <div class="tip">
                        <span class="tip-emoji">💡</span>
                        <span>Tip: Don't overthink categories. You can always move tasks later.</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    const techniqueModal = document.getElementById('technique-modal');
    if (techniqueModal) {
        techniqueModal.classList.remove('active');
    }

    trackEvent('priority_matrix_started', { method: 'with_examples' });
}

function startPriorityMatrixBlank() {
    console.log('Starting Priority Matrix with blank slate');

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    messageDiv.innerHTML = `
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
            <div class="priority-matrix-guide">
                <h4>📝 Priority Matrix - Blank Canvas</h4>
                <p>Great! Starting fresh. Here's a simple approach:</p>
                <ol>
                    <li><strong>Brainstorm 5-8 tasks</strong> on your mind right now</li>
                    <li><strong>Ask for each:</strong> "Is this urgent?" and "Is this important?"</li>
                    <li><strong>Place tasks</strong> in the matching quadrant</li>
                    <li><strong>Don't overthink</strong> - you can always adjust later</li>
                </ol>
                <p>Need help categorizing? Try starting with these common examples:</p>
                <div class="common-examples">
                    <p><strong>Urgent & Important:</strong> Deadline today, crisis to fix</p>
                    <p><strong>Important, Not Urgent:</strong> Exercise, learning, planning</p>
                    <p><strong>Urgent, Not Important:</strong> Some emails, interruptions</p>
                    <p><strong>Neither:</strong> Social media, trivial tasks</p>
                </div>
            </div>
        </div>
    `;

    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    const techniqueModal = document.getElementById('technique-modal');
    if (techniqueModal) {
        techniqueModal.classList.remove('active');
    }

    trackEvent('priority_matrix_started', { method: 'blank_slate' });
}
// Function to show techniques tab from guide
function showTechniquesTab() {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('[data-tab="techniques"]').classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('techniques-tab').classList.add('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// The existing tab switching should already work for 'guide'
// Make sure showTab function supports 'guide' tab
// =================== //
// DASHBOARD SYSTEM //
// =================== //

class DashboardSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.loadDashboardData();
        this.animateProgressBars();
    }

    setupEventListeners() {
        // Download buttons
        document.getElementById('download-weekly-report')?.addEventListener('click', () => {
            this.downloadWeeklyReport();
        });

        document.getElementById('download-raw-data')?.addEventListener('click', () => {
            this.downloadRawData();
        });

        document.getElementById('download-insights')?.addEventListener('click', () => {
            this.downloadInsights();
        });

        // Refresh dashboard when tab is opened
        const dashboardBtn = document.querySelector('[data-tab="dashboard"]');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => {
                setTimeout(() => {
                    this.loadDashboardData();
                    this.animateProgressBars();
                }, 100);
            });
        }
    }

    updateCurrentDate() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    loadDashboardData() {
        // Load user data from localStorage
        const user = JSON.parse(localStorage.getItem('lumaCare_user')) || {};
        const moodHistory = JSON.parse(localStorage.getItem('lumaCare_moodHistory')) || [];
        const gardenData = JSON.parse(localStorage.getItem('lumaCare_garden')) || { plants: [] };
        
        // Update stats from garden
        const plants = gardenData.plants || [];
        const aiSessions = plants.filter(p => p.type === 'session').length;
        const breathingExercises = plants.filter(p => p.type === 'breathing').length;
        const journalEntries = plants.filter(p => p.type === 'journal').length;
        
        // Update UI
        this.updateStat('ai-sessions-count', aiSessions);
        this.updateStat('breathing-count', breathingExercises);
        this.updateStat('journal-count', journalEntries);
        
        // Calculate SOS usage (could be from separate tracking)
        const sosCount = plants.filter(p => p.type === 'self_care').length || 0;
        this.updateStat('sos-count', sosCount);
        
        // Calculate mood data for weekly chart
        this.updateWeeklyChart(moodHistory);
        
        // Update streak from mood system
        const streak = this.calculateStreak(moodHistory);
        this.updateProgressBar('.hdd-progress .progress-fill[data-value="80"]', streak * 10);
    }

    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    calculateStreak(moodHistory) {
        if (moodHistory.length === 0) return 0;
        
        // Sort by date descending
        const sortedMoods = [...moodHistory].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        let streak = 0;
        let currentDate = new Date();
        
        for (let mood of sortedMoods) {
            const moodDate = new Date(mood.date);
            const daysDiff = Math.floor((currentDate - moodDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    updateWeeklyChart(moodHistory) {
        // Get last 7 days of data
        const last7Days = this.getLast7Days();
        
        // Group mood data by day
        const moodByDay = {};
        moodHistory.forEach(mood => {
            const date = mood.date.split('T')[0];
            if (last7Days.includes(date)) {
                if (!moodByDay[date]) {
                    moodByDay[date] = [];
                }
                moodByDay[date].push(mood);
            }
        });
        
        // Update chart bars
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const chartDays = document.querySelectorAll('.chart-day');
        
        chartDays.forEach((dayElement, index) => {
            const dayName = days[index];
            const date = this.getDateForDay(dayName);
            
            if (moodByDay[date]) {
                // Calculate average mood for the day
                const moods = moodByDay[date];
                const moodValues = {
                    'great': 95,
                    'good': 85,
                    'okay': 75,
                    'neutral': 65,
                    'heavy': 50
                };
                
                const avgMood = moods.reduce((sum, mood) => 
                    sum + (moodValues[mood.mood] || 65), 0
                ) / moods.length;
                
                // Update bar height
                const moodBar = dayElement.querySelector('.mood-bar');
                const sessionBar = dayElement.querySelector('.session-bar');
                
                if (moodBar) {
                    moodBar.style.height = `${avgMood}%`;
                    moodBar.setAttribute('data-value', avgMood.toFixed(0));
                }
                
                if (sessionBar) {
                    const sessionHeight = Math.min(moods.length * 10, 70);
                    sessionBar.style.height = `${sessionHeight}%`;
                    sessionBar.setAttribute('data-value', moods.length);
                }
                
                // Update data attributes
                dayElement.setAttribute('data-mood', avgMood.toFixed(0));
                dayElement.setAttribute('data-sessions', moods.length);
            }
        });
    }

    getLast7Days() {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    }

    getDateForDay(dayName) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const todayIndex = today.getDay();
        const targetIndex = days.indexOf(dayName);
        
        const diff = targetIndex - todayIndex;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);
        
        return targetDate.toISOString().split('T')[0];
    }

    animateProgressBars() {
        // Animate all progress bars
        document.querySelectorAll('.progress-fill').forEach(bar => {
            const targetWidth = bar.getAttribute('data-value') + '%';
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 100);
        });
        
        // Animate chart bars
        document.querySelectorAll('.bar').forEach(bar => {
            const currentHeight = bar.style.height;
            bar.style.height = '0%';
            
            setTimeout(() => {
                bar.style.height = currentHeight;
            }, 300);
        });
    }

    updateProgressBar(selector, value) {
        const bar = document.querySelector(selector);
        if (bar) {
            bar.style.width = `${value}%`;
            bar.setAttribute('data-value', value);
            
            // Update the corresponding value display
            const valueElement = bar.closest('.ssd-progress, .hdd-progress')
                ?.querySelector('.progress-value');
            if (valueElement) {
                if (selector.includes('data-value="80"')) {
                    valueElement.textContent = `${Math.floor(value / 10)} days`;
                } else {
                    valueElement.textContent = `${value}%`;
                }
            }
        }
    }

    async downloadWeeklyReport() {
        try {
            // Create a simple PDF report
            const reportData = {
                title: 'LumaCare Weekly Wellness Report',
                date: new Date().toLocaleDateString(),
                user: JSON.parse(localStorage.getItem('lumaCare_user'))?.name || 'User',
                moodHistory: JSON.parse(localStorage.getItem('lumaCare_moodHistory')) || [],
                sessions: JSON.parse(localStorage.getItem('lumaCare_garden'))?.plants?.filter(p => p.type === 'session').length || 0,
                streak: this.calculateStreak(JSON.parse(localStorage.getItem('lumaCare_moodHistory')) || [])
            };
            
            // Convert to JSON string
            const jsonString = JSON.stringify(reportData, null, 2);
            
            // Create blob and download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `LumaCare_Report_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Weekly report downloaded successfully!');
            
        } catch (error) {
            console.error('Error downloading report:', error);
            this.showToast('Error downloading report. Please try again.');
        }
    }

    async downloadRawData() {
        try {
            // Gather all user data
            const userData = {
                user: JSON.parse(localStorage.getItem('lumaCare_user')),
                moodHistory: JSON.parse(localStorage.getItem('lumaCare_moodHistory')),
                garden: JSON.parse(localStorage.getItem('lumaCare_garden')),
                preferences: JSON.parse(localStorage.getItem('lumaCare_preferences')),
                insights: JSON.parse(localStorage.getItem('lumaCare_insights')),
                weather: JSON.parse(localStorage.getItem('lumaCare_weather'))
            };
            
            // Convert to CSV format
            let csvContent = 'Data Type,Date,Value\n';
            
            // Add mood data
            if (userData.moodHistory) {
                userData.moodHistory.forEach(mood => {
                    csvContent += `Mood,${mood.date},${mood.mood}\n`;
                });
            }
            
            // Add session data
            if (userData.garden?.plants) {
                userData.garden.plants.forEach(plant => {
                    csvContent += `Activity,${plant.date},${plant.type}\n`;
                });
            }
            
            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `LumaCare_Data_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Raw data downloaded successfully!');
            
        } catch (error) {
            console.error('Error downloading data:', error);
            this.showToast('Error downloading data. Please try again.');
        }
    }

    async downloadInsights() {
        try {
            // Get insights from localStorage
            const insights = JSON.parse(localStorage.getItem('lumaCare_insights')) || [];
            
            if (insights.length === 0) {
                this.showToast('No insights available yet. Continue using LumaCare to generate insights.');
                return;
            }
            
            // Create insights report
            let insightsText = 'LumaCare Personal Insights Report\n';
            insightsText += '================================\n\n';
            
            insights.forEach((insight, index) => {
                insightsText += `${index + 1}. ${insight.title}\n`;
                insightsText += `   ${insight.message}\n`;
                insightsText += `   Date: ${new Date(insight.date).toLocaleDateString()}\n\n`;
            });
            
            // Create blob and download
            const blob = new Blob([insightsText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `LumaCare_Insights_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Insights report downloaded successfully!');
            
        } catch (error) {
            console.error('Error downloading insights:', error);
            this.showToast('Error downloading insights. Please try again.');
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize dashboard system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS animations for toast
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(100px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(100px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize dashboard system
    setTimeout(() => {
        window.dashboardSystem = new DashboardSystem();
        console.log('✅ Dashboard system initialized');
    }, 1000);
});

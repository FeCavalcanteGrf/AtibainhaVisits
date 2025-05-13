/**
 * Logout functionality for Atibainha Visits application
 * This script handles the logout process by clearing session data and redirecting to login page
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Logout script loaded');
    
    // Find the logout button
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        console.log('✅ Logout button found');
        
        // Add click event listener to the logout button
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('🖱️ Logout button clicked');
            
            // Clear any session data (localStorage, sessionStorage, etc.)
            localStorage.clear();
            // sessionStorage.clear();
            
            console.log('🗑️ Session data cleared');
            
            // Redirect to login page
            console.log('🔄 Redirecting to login page');
            window.location.href = 'login.html';
        });
    } else {
        console.error('❌ Logout button not found');
    }
});

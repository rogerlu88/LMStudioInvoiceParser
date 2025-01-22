document.addEventListener('DOMContentLoaded', function() {
    // Get all necessary elements
    const hamburger = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const closeBtn = document.querySelector('.close-btn');
    const menuContent = document.querySelector('.menu-content');
    const deploymentContent = document.querySelector('.deployment-content');
    const chatgptContent = document.querySelector('.chatgpt-content');
    const aboutContent = document.querySelector('.about-content');
    const menuLink = document.querySelector('.menu-link');
    const deploymentLink = document.querySelector('.deployment-link');
    const chatgptLink = document.querySelector('.chatgpt-link');
    const aboutLink = document.querySelector('.about-link');

    // Toggle sidebar when clicking hamburger menu
    hamburger.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('active');
        // Reset content visibility when opening sidebar
        menuContent.classList.remove('active');
        deploymentContent.classList.remove('active');
        chatgptContent.classList.remove('active');
        aboutContent.classList.remove('active');
    });

    // Close sidebar when clicking close button
    closeBtn.addEventListener('click', function() {
        sidebar.classList.remove('active');
        menuContent.classList.remove('active');
        deploymentContent.classList.remove('active');
        chatgptContent.classList.remove('active');
        aboutContent.classList.remove('active');
    });

    // Handle menu link click
    menuLink.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        menuContent.classList.add('active');
        deploymentContent.classList.remove('active');
        chatgptContent.classList.remove('active');
        aboutContent.classList.remove('active');
    });

    // Handle deployment link click
    deploymentLink.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        deploymentContent.classList.add('active');
        menuContent.classList.remove('active');
        chatgptContent.classList.remove('active');
        aboutContent.classList.remove('active');
    });

    // Handle chatgpt link click
    chatgptLink.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        chatgptContent.classList.add('active');
        menuContent.classList.remove('active');
        deploymentContent.classList.remove('active');
        aboutContent.classList.remove('active');
    });

    // Handle about link click
    aboutLink.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        aboutContent.classList.add('active');
        menuContent.classList.remove('active');
        deploymentContent.classList.remove('active');
        chatgptContent.classList.remove('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
            sidebar.classList.remove('active');
            menuContent.classList.remove('active');
            deploymentContent.classList.remove('active');
            chatgptContent.classList.remove('active');
            aboutContent.classList.remove('active');
        }
    });

    // Prevent clicks inside sidebar from closing it
    sidebar.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});

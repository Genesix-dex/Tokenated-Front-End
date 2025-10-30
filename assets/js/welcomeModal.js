document.addEventListener('DOMContentLoaded', function() {
    if (!sessionStorage.getItem('modalShown')) {

      document.getElementById('welcomeModal').style.display = 'flex';
  
      sessionStorage.setItem('modalShown', 'true');
    }
  
    document.getElementById('closeModal').addEventListener('click', function() {
      document.getElementById('welcomeModal').style.display = 'none';
    });
  
    document.getElementById('getStarted').addEventListener('click', function() {
      document.getElementById('welcomeModal').style.display = 'none';
    });
  });
  
export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
  
  * {
    font-family: 'Nunito', sans-serif;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  @keyframes bounce-in {
    0% { transform: translate(-50%, -100px); opacity: 0; }
    50% { transform: translate(-50%, 10px); }
    100% { transform: translate(-50%, 0); opacity: 1; }
  }
  
  @keyframes slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes scale-in {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes gradient-x {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes fly-away {
    0% { transform: scale(1) translateX(0); opacity: 1; }
    50% { transform: scale(0.8) translateX(50px); opacity: 0.5; }
    100% { transform: scale(0.5) translateX(100px) translateY(100px); opacity: 0; }
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.5s ease-out;
  }
  
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
  
  .animate-scale-in {
    animation: scale-in 0.3s ease-out;
  }
  
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 3s ease infinite;
  }
  
  .animate-bounce-slow {
    animation: bounce-slow 2s ease-in-out infinite;
  }
  
  .animate-fly-away {
    animation: fly-away 0.8s ease-in forwards;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #FB923C, #F59E0B);
    border-radius: 10px;
  }
`;

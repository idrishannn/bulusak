export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
  
  * {
    font-family: 'Nunito', sans-serif;
  }
  
  body {
    background: radial-gradient(circle at center, #1f1f1f 0%, #0f0f0f 100%);
  }
  
  /* ============================================
     GLASSMORPHISM STYLES
     ============================================ */
  
  .glass-panel {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }
  
  .glass-panel-hover {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease;
  }
  
  .glass-panel-hover:hover {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  .glass-nav {
    background: rgba(31, 31, 31, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .glass-input-group {
    position: relative;
  }
  
  .glass-input {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    color: white;
    outline: none;
    transition: all 0.3s ease;
  }
  
  .glass-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  .glass-input:focus {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(249, 115, 22, 0.5);
    box-shadow: 0 0 20px rgba(249, 115, 22, 0.2);
  }
  
  .glass-button {
    padding: 1rem;
    background: linear-gradient(to right, #f97316, #fbbf24, #f59e0b);
    border: none;
    border-radius: 1rem;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
  }
  
  .glass-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.6);
  }
  
  .glass-button:active {
    transform: translateY(0);
  }
  
  .glass-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Card hover effect */
  .glass-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.5rem;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }
  
  .glass-card:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(249, 115, 22, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
  
  /* ============================================
     ANIMATIONS
     ============================================ */
  
  @keyframes float-1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(100px, -50px) scale(1.2); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
  }
  
  @keyframes float-2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-80px, 80px) scale(1.3); }
  }
  
  @keyframes float-3 {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(60px, 60px); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0px rgba(249, 115, 22, 0.4); }
    50% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
  }
  
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-down {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes bounce-in {
    0% { transform: translate(-50%, -100px); opacity: 0; }
    50% { transform: translate(-50%, 10px); }
    100% { transform: translate(-50%, 0); opacity: 1; }
  }
  
  @keyframes gradient-x {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  .animate-float-1 { animation: float-1 20s infinite linear; }
  .animate-float-2 { animation: float-2 15s infinite linear; }
  .animate-float-3 { animation: float-3 18s infinite linear; }
  .animate-pulse-glow { animation: pulse-glow 2s infinite; }
  .animate-scale-in { animation: scale-in 0.5s ease-out; }
  .animate-fade-in { animation: fade-in 0.6s ease-out; }
  .animate-slide-up { animation: slide-up 0.6s ease-out; }
  .animate-slide-down { animation: slide-down 0.3s ease-out; }
  .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
  .animate-gradient-x {
    background-size: 200% 200%;
    animation: gradient-x 3s ease infinite;
  }
  
  /* ============================================
     SCROLLBAR
     ============================================ */
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(249, 115, 22, 0.5);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(249, 115, 22, 0.8);
  }
  
  /* ============================================
     PARTICIPATION BUTTON COLORS
     ============================================ */
  
  .btn-varim {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: 2px solid rgba(16, 185, 129, 0.5);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }
  
  .btn-varim:hover {
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
    transform: translateY(-2px);
  }
  
  .btn-bakariz {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    border: 2px solid rgba(245, 158, 11, 0.5);
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  }
  
  .btn-bakariz:hover {
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
    transform: translateY(-2px);
  }
  
  .btn-yokum {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    border: 2px solid rgba(239, 68, 68, 0.5);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
  }
  
  .btn-yokum:hover {
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
    transform: translateY(-2px);
  }
  
  /* Badge colors */
  .badge-varim {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.4);
  }
  
  .badge-bakariz {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.4);
  }
  
  .badge-yokum {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.4);
  }
  
  /* ============================================
     UTILITIES
     ============================================ */
  
  .glow-orange {
    box-shadow: 0 0 20px rgba(249, 115, 22, 0.4);
  }
  
  .glow-green {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
  }
  
  .text-glow {
    text-shadow: 0 0 10px rgba(249, 115, 22, 0.5);
  }
  
  .gradient-text {
    background: linear-gradient(to right, #f97316, #fbbf24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

"use client";
import React, { useState, useEffect } from "react";

const base64Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const emojiAlphabet = [
    "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊",
    "😋","😎","😍","😘","😗","😙","😚","🙂","🤗","🤩",
    "🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮",
    "🤐","😯","😪","😫","😴","😌","😛","😜","😝","🤤",
    "😒","😓","😔","😕","🙃","🤑","😲","😖","😞","😤",
    "😢","😭","😦","😧","😨","😩","🤯","😬","😰","😱",
    "🥵","🥶","😳","🤪","😵","🥳","💫","😇","😈"
  ];
  

function utf8ToBase64(str: string) {
    try {
      const bytes = new TextEncoder().encode(str);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch {
      return window.btoa(unescape(encodeURIComponent(str)));
    }
  }
  
  function base64ToUtf8(b64: string) {
    try {
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    } catch {
      return decodeURIComponent(escape(window.atob(b64)));
    }
  }
  
  

export default function EmojiCipher() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [user, setUser] = useState<"Abhii" | "Ashuu" | null>(null);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(true);
  const [copied, setCopied] = useState(false);

  // Helper functions for session storage
  function savePasswordToSession(user: string|null, password: string) {
      if (typeof window !== "undefined") {
          sessionStorage.setItem(`emojiCipherPassword_${user}`, password);
        }
    }
    
    function getPasswordFromSession(user: string|null): string {
        if (typeof window !== "undefined") {
            return sessionStorage.getItem(`emojiCipherPassword_${user}`) || "";
        }
        return "";
    }
    
    useEffect(() => {
    const saved = getPasswordFromSession(user);
    if (saved) setPassword(saved);
  }, [user]);
  // Load user from localStorage on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("secretMessagesUser");
    if (savedUser === "Abhii" || savedUser === "Ashuu") {
        setUser(savedUser);
        setShowUserModal(false);
    }
}, []);


function encrypt(text: string) {
    try {
      setError(null);
      const b64 = utf8ToBase64(text);
  
      let emojiText = "";
      for (const ch of b64) {
        const idx = base64Alphabet.indexOf(ch);
        emojiText += idx >= 0 ? emojiAlphabet[idx] : "";
      }
  
      return emojiText;
    } catch (e: any) {
      setError(e.message);
      return "";
    }
  }
  
  function decrypt(emojiText: string) {
    try {
      setError(null);
  
      const correctPassword = user === "Abhii" ? "Ashuu my love" : "Abhii my love";
      if (password !== correctPassword) {
        setError("Incorrect password! 💔 Please enter the correct password to decode the message.");
        return "";
      }
  
      savePasswordToSession(user, password);
  
      const emojis = Array.from(emojiText);
      let b64 = "";
      for (const em of emojis) {
        const idx = emojiAlphabet.indexOf(em);
        b64 += idx >= 0 ? base64Alphabet[idx] : "";
      }
  
      if (!b64 || b64.length % 4 !== 0) {
        throw new Error("Invalid emoji sequence or corrupted data 💔");
      }
  
      return base64ToUtf8(b64);
    } catch (e: any) {
      setError(e.message);
      return "";
    }
  }
  
  

  function handleRun() {
    if (mode === "decrypt") {
      setShowPasswordModal(true);
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setOutput(encrypt(input));
        setIsAnimating(false);
      }, 600);
    }
  }

  function handleDecryptWithPassword() {
    setIsAnimating(true);
    setShowPasswordModal(false);
    setTimeout(() => {
      setOutput(decrypt(input));
      setIsAnimating(false);
      setPassword(""); // Clear password after use
    }, 600);
  }

  function handleUserSelect(selectedUser: "Abhii" | "Ashuu") {
    setUser(selectedUser);
    localStorage.setItem("secretMessagesUser", selectedUser);
    setShowUserModal(false);
  }

  function handleChangeUser() {
    setUser(null);
    setShowUserModal(true);
    localStorage.removeItem("secretMessagesUser");
    setInput("");
    setOutput("");
    setPassword("");
  }

  const heartEmojis = ["💖", "💕", "💗", "💓", "💞", "💘", "❤️", "🧡", "💛", "💚", "💙", "💜"];
  const [floatingHearts, setFloatingHearts] = useState<Array<{id: number, emoji: string, style: any}>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (floatingHearts.length < 15) {
        const newHeart = {
          id: Date.now(),
          emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
          style: {
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            fontSize: `${Math.random() * 20 + 20}px`,
            opacity: Math.random() * 0.5 + 0.3
          }
        };
        setFloatingHearts(prev => [...prev.slice(-14), newHeart]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [floatingHearts.length]);

  // User Selection Modal
  if (showUserModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 relative overflow-hidden flex items-center justify-center">
        {/* Floating Hearts Background */}
        {floatingHearts.map(heart => (
          <div
            key={heart.id}
            className="absolute animate-float opacity-70"
            style={heart.style}
            onAnimationEnd={() => setFloatingHearts(prev => prev.filter(h => h.id !== heart.id))}
          >
            {heart.emoji}
          </div>
        ))}

        <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-pink-200 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-6">💌</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Welcome to Secret Messages
            </h1>
            <p className="text-gray-600 mb-8">Who are you? 💕</p>
            
            <div className="space-y-4">
              <button
                onClick={() => handleUserSelect("Abhii")}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">👨</span>
                  <span>I'm Abhii</span>
                </div>
              </button>
              
              <button
                onClick={() => handleUserSelect("Ashuu")}
                className="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
              >
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">👩</span>
                  <span>I'm Ashuu</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0.7; }
            50% { transform: translateY(50vh) rotate(180deg); opacity: 1; }
            100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
          }
          .animate-float {
            animation: float 8s ease-in-out forwards;
          }
        `}</style>
      </div>
    );
  }

  // Password Modal for Decryption
  if (showPasswordModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 relative overflow-hidden flex items-center justify-center">
        {/* Floating Hearts Background */}
        {floatingHearts.map(heart => (
          <div
            key={heart.id}
            className="absolute animate-float opacity-70"
            style={heart.style}
            onAnimationEnd={() => setFloatingHearts(prev => prev.filter(h => h.id !== heart.id))}
          >
            {heart.emoji}
          </div>
        ))}

        <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-pink-200 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Secret Password Required
            </h1>
            <p className="text-gray-600 mb-6">
              {user === "Abhii" 
                ? "Abhii, enter your password to decode Ashuu's message" 
                : "Ashuu, enter your password to decode Abhii's message"}
            </p>
            
            <div className="mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your secret password..."
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-2xl focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300 text-center text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleDecryptWithPassword()}
              />
              <p className="text-sm text-gray-500 mt-2">
                Hint: {user === "Abhii" ? "Think of your love's name" : "Think of your love's name"}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-600 rounded-2xl font-semibold transition-all duration-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDecryptWithPassword}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
              >
                Decode Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 relative overflow-hidden">
      {/* Floating Hearts Background */}
      {floatingHearts.map(heart => (
        <div
          key={heart.id}
          className="absolute animate-float opacity-70"
          style={heart.style}
          onAnimationEnd={() => setFloatingHearts(prev => prev.filter(h => h.id !== heart.id))}
        >
          {heart.emoji}
        </div>
      ))}

      <div className="relative z-10 max-w-4xl mx-auto p-4 pt-8">
        {/* Header with User Info */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4">
            <div className="text-4xl">💌</div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mx-3">
              {user === "Abhii" ? "Abhii & Ashuu" : "Ashuu & Abhii"}'s Secret Messages
            </h1>
            <div className="text-4xl">💌</div>
          </div>
          <div className="flex justify-center items-center space-x-4">
            <p className="text-gray-600 text-sm md:text-base">
              {mode === "encrypt" 
                ? `${user}, turn your sweet messages into romantic emoji code 💕` 
                : `${user}, decode the special emoji messages back to text 💖`}
            </p>
            <button
              onClick={handleChangeUser}
              className="px-3 py-1 text-xs bg-white/80 backdrop-blur-sm rounded-full border border-pink-300 text-pink-600 hover:bg-white transition-all duration-300"
            >
              Change User
            </button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-pink-200">
            <div className="flex">
              <button
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  mode === "encrypt" 
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-200 transform scale-105" 
                    : "text-gray-600 hover:text-rose-600"
                }`}
                onClick={() => setMode("encrypt")}
              >
                <div className="flex items-center space-x-2">
                  <span>💝</span>
                  <span>{user === "Abhii" ? "Abhii's Encode" : "Ashuu's Encode"}</span>
                </div>
              </button>
              <button
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  mode === "decrypt" 
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-pink-200 transform scale-105" 
                    : "text-gray-600 hover:text-rose-600"
                }`}
                onClick={() => setMode("decrypt")}
              >
                <div className="flex items-center space-x-2">
                  <span>🔍</span>
                  <span>{user === "Abhii" ? "Abhii's Decode" : "Ashuu's Decode"}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Input Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-pink-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-gray-700">
                {mode === "encrypt" 
                  ? `💝 From ${user} to ${user === "Abhii" ? "Ashuu" : "Abhii"}` 
                  : "🔐 Encoded Message to Decode"}
              </label>
              <div className="text-2xl">
                {mode === "encrypt" ? "✍️" : "📜"}
              </div>
            </div>
            
            <textarea
              className="w-full min-h-[180px] md:min-h-[200px] border-2 border-pink-200 rounded-2xl p-4 resize-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-300 bg-white/50 text-gray-700 placeholder-pink-300"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encrypt" 
                  ? `Type your romantic message for ${user === "Abhii" ? "Ashuu" : "Abhii"} here... 💕` 
                  : "Paste the emoji message here... 🔐"
              }
            />
            
            <button
              className={`w-full mt-4 px-6 py-4 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                isAnimating 
                  ? "bg-gradient-to-r from-purple-400 to-pink-400" 
                  : "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-pink-200"
              }`}
              onClick={handleRun}
              disabled={isAnimating}
            >
              <div className="flex items-center justify-center space-x-2">
                {isAnimating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Creating Magic...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === "encrypt" 
                      ? `💖 Encode for ${user === "Abhii" ? "Ashuu" : "Abhii"}` 
                      : "🔍 Decode Message"}</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-pink-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-gray-700">
                {mode === "encrypt" 
                  ? `🔐 For ${user === "Abhii" ? "Ashuu" : "Abhii"}` 
                  : `💌 From ${user === "Abhii" ? "Ashuu" : "Abhii"}`}
              </label>
              <div className="text-2xl">
                {mode === "encrypt" ? "🎭" : "💖"}
              </div>
            </div>
            
            <div className="relative">
              <textarea
                className="w-full min-h-[180px] md:min-h-[200px] border-2 border-pink-200 rounded-2xl p-4 resize-none bg-gradient-to-br from-pink-50 to-rose-50 text-gray-700 font-mono break-all"
                readOnly
                value={output}
                placeholder={mode === "encrypt" 
                  ? `${user === "Abhii" ? "Ashuu's" : "Abhii's"} secret emoji code will appear here... ✨` 
                  : `${user === "Abhii" ? "Ashuu's" : "Abhii's"} sweet message will appear here... 💫`}
              />
              
              {output && (
                <div className="absolute top-3 right-3 animate-pulse">✨</div>
              )}
            </div>
            
            <button
              className="w-full mt-4 px-6 py-4 rounded-2xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (!output) return;
                navigator.clipboard.writeText(output).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000); 
                });
              }}              disabled={!output}
            >
              <div className="flex items-center justify-center space-x-2">
              {copied ? "✅ Copied!" : "📋 Copy"}
              </div>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 animate-shake">
            <div className="flex items-center space-x-2 text-red-700">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium">Oops! Something went wrong</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Tips */}
        <div className="text-center text-sm text-gray-600 mb-8">
          <p className="flex items-center justify-center space-x-2">
            <span>💡</span>
            <span>
              {mode === "encrypt" 
                ? `${user}: Perfect for surprising your love with secret messages!` 
                : `${user}: Enter the password to decode the special message!`}
            </span>
          </p>
        </div>

        {/* Romantic Signature */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-pink-200">
            <span className="text-pink-600">💘</span>
            <span className="text-sm text-gray-600 font-medium">
              Made with love for <span className="text-rose-600 font-bold">Abhii</span> and <span className="text-pink-600 font-bold">Ashuu</span>
            </span>
            <span className="text-pink-600">💘</span>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0.7; }
          50% { transform: translateY(50vh) rotate(180deg); opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 8s ease-in-out forwards;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
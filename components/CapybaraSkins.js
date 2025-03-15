'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const SKINS = [
  {
    id: 'default',
    name: 'Default',
    price: 0,
    preview: '/Capybara_sleep_left.gif',
    description: 'The classic capybara look',
    animations: {
      sleep_left: '/Capybara_sleep_left.gif',
      walk_left: '/Capybara_walk_left.gif',
      walk_right: '/Capybara_walk_right.gif',
      idle_relax: '/Capybara_idle_relax.gif'
    }
  },
  {
    id: 'pumpkin',
    name: 'Pumpkin',
    price: 1,
    preview: '/Capybara_sleep_left_pumpkin.gif',
    description: 'Spooky pumpkin hat for Halloween vibes',
    animations: {
      sleep_left: '/Capybara_sleep_left_pumpkin.gif',
      walk_left: '/Capybara_walk_left_pumpkin.gif',
      walk_right: '/Capybara_walk_right_pumpkin.gif',
      idle_relax: '/Capybara_idle_relax_pumpkin.gif'
    }
  },
  {
    id: 'chicken',
    name: 'Chicken',
    price: 5,
    preview: '/Capybara_sleep_left_chicken.gif',
    description: 'Cute chicken hat for a farmyard look',
    animations: {
      sleep_left: '/Capybara_sleep_left_chicken.gif',
      walk_left: '/Capybara_walk_left_chicken.gif',
      walk_right: '/Capybara_walk_right_chicken.gif',
      idle_relax: '/Capybara_idle_relax_chicken.gif'
    }
  },
  {
    id: 'hair',
    name: 'Fancy Hair',
    price: 10,
    preview: '/Capybara_sleep_left_hair.gif',
    description: 'Stylish hairdo for the fashion-forward capybara',
    animations: {
      sleep_left: '/Capybara_sleep_left_hair.gif',
      walk_left: '/Capybara_walk_left_hair.gif',
      walk_right: '/Capybara_walk_right_hair.gif',
      idle_relax: '/Capybara_idle_relax_hair.gif'
    }
  }
];

export default function CapybaraSkins() {
  const [userCoins, setUserCoins] = useState(0);
  const [unlockedSkins, setUnlockedSkins] = useState(['default']);
  const [selectedSkin, setSelectedSkin] = useState('default');
  const [previewSkin, setPreviewSkin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Fetch user coins and unlocked skins on component mount
  useEffect(() => {
    fetchUserData();
    
    // Load selected skin from localStorage
    const savedSkin = localStorage.getItem('selectedCapybaraSkin');
    if (savedSkin) {
      setSelectedSkin(savedSkin);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user coins
      const loginResponse = await fetch('/api/login-tracker');
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        setUserCoins(loginData.coins);
      }
      
      // Fetch unlocked skins from localStorage
      const savedUnlockedSkins = localStorage.getItem('unlockedCapybaraSkins');
      if (savedUnlockedSkins) {
        const parsedSkins = JSON.parse(savedUnlockedSkins);
        setUnlockedSkins(Array.isArray(parsedSkins) ? parsedSkins : ['default']);
        
        // Make sure the selected skin is in the unlocked skins
        const currentSkin = localStorage.getItem('selectedCapybaraSkin');
        if (currentSkin && !parsedSkins.includes(currentSkin) && currentSkin !== 'default') {
          // If the selected skin isn't unlocked, add it to the unlocked skins
          const updatedSkins = [...parsedSkins, currentSkin];
          localStorage.setItem('unlockedCapybaraSkins', JSON.stringify(updatedSkins));
          setUnlockedSkins(updatedSkins);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const unlockSkin = async (skinId) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (!skin) return;
    
    if (unlockedSkins.includes(skinId)) {
      showMessage('You already own this skin!', 'info');
      return;
    }
    
    if (userCoins < skin.price) {
      showMessage(`Not enough coins! You need ${skin.price} coins.`, 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call API to update user's coin balance
      const response = await fetch('/api/coins/spend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: skin.price,
          item: `Skin: ${skin.name}`,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to purchase skin');
      }
      
      const data = await response.json();
      
      // Update local coin count
      setUserCoins(data.newBalance);
      
      // Update unlocked skins
      const newUnlockedSkins = [...unlockedSkins, skinId];
      setUnlockedSkins(newUnlockedSkins);
      
      // Save to localStorage
      localStorage.setItem('unlockedCapybaraSkins', JSON.stringify(newUnlockedSkins));
      
      showMessage(`Successfully unlocked ${skin.name} skin!`, 'success');
      
      // Set as preview skin after unlocking
      setPreviewSkin(skinId);
    } catch (error) {
      console.error('Error unlocking skin:', error);
      showMessage(error.message || 'Failed to unlock skin. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const previewSkinSelect = (skinId) => {
    if (!unlockedSkins.includes(skinId) && skinId !== 'default') {
      showMessage('You need to unlock this skin first!', 'error');
      return;
    }
    
    // Only set preview if it's different from current selection
    if (skinId !== selectedSkin) {
      setPreviewSkin(skinId);
    } else {
      setPreviewSkin(null);
    }
  };

  const applySelectedSkin = () => {
    if (previewSkin) {
      setSelectedSkin(previewSkin);
      localStorage.setItem('selectedCapybaraSkin', previewSkin);
      showMessage(`${SKINS.find(s => s.id === previewSkin).name} skin applied!`, 'success');
      setPreviewSkin(null);
      
      // Reload the page to apply the new skin
      setTimeout(() => {
        window.location.reload();
      }, 500); // Short delay to show the success message before reload
    }
  };

  const cancelPreview = () => {
    setPreviewSkin(null);
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg">
      <h2 className="text-xl text-[#E6C86E] font-bold mb-4" style={{
        fontFamily: "'Press Start 2P', monospace",
        letterSpacing: "0.5px",
        textShadow: "2px 2px 0 #000"
      }}>Capybara Skins</h2>
      
      <div className="flex items-center justify-between mb-4">
        <p className="font-medium font-pixel">Your Coins:</p>
        <p className="font-bold text-yellow-500 flex items-center">
          <span className="text-xl">{userCoins}</span>
          <span className="ml-1 text-lg">🪙</span>
        </p>
      </div>
      
      {message && (
        <div className={`mb-4 p-2 rounded text-sm ${
          messageType === 'success' ? 'bg-green-100 text-green-800' :
          messageType === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}
      
      {/* Preview and Apply Section */}
      {previewSkin && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image 
                src={SKINS.find(s => s.id === previewSkin)?.preview || '/Capybara_sleep_left.gif'}
                alt="Preview Skin"
                width={48}
                height={48}
                className="mr-3"
              />
              <div>
                <p className="font-medium">{SKINS.find(s => s.id === previewSkin)?.name}</p>
                <p className="text-sm text-gray-600">Preview mode</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={cancelPreview}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={applySelectedSkin}
                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
              >
                Apply Skin
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {SKINS.map((skin) => {
          const isUnlocked = unlockedSkins.includes(skin.id) || skin.id === 'default';
          const isCurrentlySelected = selectedSkin === skin.id;
          const isBeingPreviewed = previewSkin === skin.id;
          
          // Determine border color based on state
          let borderClass = 'border-gray-300';
          if (isBeingPreviewed) {
            borderClass = 'border-blue-500 shadow-lg';
          } else if (isCurrentlySelected) {
            borderClass = 'border-green-500';
          }
          
          return (
            <div 
              key={skin.id}
              className={`
                relative rounded-lg overflow-hidden border-2 transition-all
                ${borderClass}
              `}
            >
              <div 
                className="relative h-24 bg-gray-100 cursor-pointer"
                onClick={() => isUnlocked && previewSkinSelect(skin.id)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image 
                    src={skin.preview}
                    alt={skin.name}
                    width={64}
                    height={64}
                    className={isUnlocked ? '' : 'opacity-50 grayscale'}
                  />
                </div>
                
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="flex items-center bg-black/70 px-2 py-1 rounded text-white text-xs">
                      <span className="mr-1">{skin.price}</span>
                      <span>🪙</span>
                    </div>
                  </div>
                )}
                
                {isCurrentlySelected && !isBeingPreviewed && (
                  <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full">
                    Current
                  </div>
                )}
                
                {isBeingPreviewed && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full">
                    Preview
                  </div>
                )}
              </div>
              
              <div className="p-2 bg-white">
                <h3 className="text-xs font-semibold">{skin.name}</h3>
                <p className="text-xs text-gray-500 truncate">{skin.description}</p>
                
                <div className="mt-2">
                  {isUnlocked ? (
                    <button
                      onClick={() => previewSkinSelect(skin.id)}
                      className={`w-full text-xs px-2 py-1 rounded ${
                        isCurrentlySelected && !isBeingPreviewed
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isCurrentlySelected && !isBeingPreviewed ? 'Current' : 'Preview'}
                    </button>
                  ) : (
                    <button
                      onClick={() => unlockSkin(skin.id)}
                      disabled={loading || userCoins < skin.price}
                      className={`w-full text-xs px-2 py-1 rounded ${
                        loading || userCoins < skin.price
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {loading ? 'Processing...' : `Unlock (${skin.price} 🪙)`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 
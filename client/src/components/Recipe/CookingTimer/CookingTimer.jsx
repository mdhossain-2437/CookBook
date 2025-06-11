import { useState, useEffect, useRef } from 'react';
import { FaClock, FaPlay, FaPause, FaStop, FaPlus } from 'react-icons/fa';

const CookingTimer = ({ instructions }) => {
  const [timers, setTimers] = useState([]);
  const [activeTimers, setActiveTimers] = useState([]);
  const [showAddTimer, setShowAddTimer] = useState(false);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerDuration, setNewTimerDuration] = useState(5);
  const [kitchenMode, setKitchenMode] = useState(false);
  const audioRef = useRef(null);

  // Extract potential timers from instructions
  useEffect(() => {
    if (instructions && instructions.length > 0) {
      const extractedTimers = [];
      const timeRegex = /(\d+)\s*(minute|minutes|min|mins|hour|hours|hr|hrs|second|seconds|sec|secs)/gi;
      
      instructions.forEach((instruction, index) => {
        let match;
        while ((match = timeRegex.exec(instruction)) !== null) {
          const duration = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          let durationInSeconds = duration;
          
          if (unit.startsWith('min')) {
            durationInSeconds = duration * 60;
          } else if (unit.startsWith('hour') || unit.startsWith('hr')) {
            durationInSeconds = duration * 60 * 60;
          }
          
          extractedTimers.push({
            id: `timer-${index}-${extractedTimers.length}`,
            name: `Step ${index + 1}: ${instruction.substring(0, 30)}${instruction.length > 30 ? '...' : ''}`,
            duration: durationInSeconds,
            remaining: durationInSeconds,
            isRunning: false,
            stepIndex: index
          });
        }
      });
      
      setTimers(extractedTimers);
    }
  }, [instructions]);

  // Timer tick function
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prevTimers => {
        const updatedTimers = prevTimers.map(timer => {
          if (timer.isRunning) {
            const newRemaining = timer.remaining - 1;
            if (newRemaining <= 0) {
              // Play sound when timer completes
              if (audioRef.current) {
                audioRef.current.play();
              }
              
              return { ...timer, remaining: 0, isRunning: false };
            }
            return { ...timer, remaining: newRemaining };
          }
          return timer;
        });
        
        return updatedTimers;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Add a timer from the suggested list
  const addSuggestedTimer = (timer) => {
    const newTimer = {
      ...timer,
      id: `active-${Date.now()}`,
      remaining: timer.duration,
      isRunning: false
    };
    
    setActiveTimers(prev => [...prev, newTimer]);
  };

  // Add a custom timer
  const addCustomTimer = () => {
    if (!newTimerName.trim()) return;
    
    const durationInSeconds = newTimerDuration * 60; // Convert minutes to seconds
    
    const newTimer = {
      id: `custom-${Date.now()}`,
      name: newTimerName,
      duration: durationInSeconds,
      remaining: durationInSeconds,
      isRunning: false,
      isCustom: true
    };
    
    setActiveTimers(prev => [...prev, newTimer]);
    setNewTimerName('');
    setNewTimerDuration(5);
    setShowAddTimer(false);
  };

  // Start a timer
  const startTimer = (id) => {
    setActiveTimers(prev => 
      prev.map(timer => 
        timer.id === id ? { ...timer, isRunning: true } : timer
      )
    );
  };

  // Pause a timer
  const pauseTimer = (id) => {
    setActiveTimers(prev => 
      prev.map(timer => 
        timer.id === id ? { ...timer, isRunning: false } : timer
      )
    );
  };

  // Reset a timer
  const resetTimer = (id) => {
    setActiveTimers(prev => 
      prev.map(timer => 
        timer.id === id ? { ...timer, remaining: timer.duration, isRunning: false } : timer
      )
    );
  };

  // Remove a timer
  const removeTimer = (id) => {
    setActiveTimers(prev => prev.filter(timer => timer.id !== id));
  };

  // Toggle kitchen mode
  const toggleKitchenMode = () => {
    setKitchenMode(prev => !prev);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${kitchenMode ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      <audio ref={audioRef} src="/sounds/timer-complete.mp3" />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          <FaClock className="mr-2 text-primary" />
          Cooking Timers
        </h3>
        <div className="flex space-x-2">
          <button 
            onClick={toggleKitchenMode}
            className={`px-3 py-1 rounded-md text-sm ${kitchenMode ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}
          >
            {kitchenMode ? 'Exit Kitchen Mode' : 'Kitchen Mode'}
          </button>
        </div>
      </div>
      
      {/* Active Timers */}
      <div className={`grid gap-4 ${kitchenMode ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}`}>
        {activeTimers.length > 0 ? (
          activeTimers.map(timer => (
            <div 
              key={timer.id} 
              className={`border rounded-lg p-4 ${timer.remaining === 0 ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-700'} ${kitchenMode ? 'text-xl' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className={`font-medium ${timer.remaining === 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {timer.name}
                </h4>
                <button 
                  onClick={() => removeTimer(timer.id)}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                >
                  &times;
                </button>
              </div>
              
              <div className={`text-center py-3 ${kitchenMode ? 'text-4xl' : 'text-2xl'} font-bold ${timer.remaining === 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                {formatTime(timer.remaining)}
              </div>
              
              <div className="flex justify-center space-x-2 mt-2">
                {timer.isRunning ? (
                  <button 
                    onClick={() => pauseTimer(timer.id)}
                    className={`flex items-center justify-center ${kitchenMode ? 'w-14 h-14' : 'w-10 h-10'} rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50`}
                  >
                    <FaPause />
                  </button>
                ) : (
                  <button 
                    onClick={() => startTimer(timer.id)}
                    disabled={timer.remaining === 0}
                    className={`flex items-center justify-center ${kitchenMode ? 'w-14 h-14' : 'w-10 h-10'} rounded-full ${timer.remaining === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'}`}
                  >
                    <FaPlay />
                  </button>
                )}
                
                <button 
                  onClick={() => resetTimer(timer.id)}
                  className={`flex items-center justify-center ${kitchenMode ? 'w-14 h-14' : 'w-10 h-10'} rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50`}
                >
                  <FaStop />
                </button>
              </div>
              
              {timer.remaining === 0 && (
                <div className="mt-2 text-center text-red-600 dark:text-red-400 font-medium animate-pulse">
                  Time's up!
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No active timers. Add a timer to get started.
          </div>
        )}
      </div>
      
      {!kitchenMode && (
        <>
          {/* Add Timer Button */}
          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => setShowAddTimer(!showAddTimer)}
              className="flex items-center px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-md"
            >
              <FaPlus className="mr-2" />
              {showAddTimer ? 'Cancel' : 'Add Custom Timer'}
            </button>
          </div>
          
          {/* Add Custom Timer Form */}
          {showAddTimer && (
            <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Add Custom Timer</h4>
              <div className="flex flex-col space-y-3">
                <input
                  type="text"
                  placeholder="Timer name"
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                />
                <div className="flex items-center">
                  <span className="mr-2 text-gray-700 dark:text-gray-300">Duration:</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newTimerDuration}
                    onChange={(e) => setNewTimerDuration(parseInt(e.target.value) || 1)}
                    className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">minutes</span>
                </div>
                <button
                  onClick={addCustomTimer}
                  disabled={!newTimerName.trim()}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
                >
                  Add Timer
                </button>
              </div>
            </div>
          )}
          
          {/* Suggested Timers */}
          {timers.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Suggested Timers from Recipe</h4>
              <div className="space-y-2">
                {timers.map(timer => (
                  <div 
                    key={timer.id}
                    className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div>
                      <div className="text-gray-800 dark:text-white font-medium">{timer.name}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">{formatTime(timer.duration)}</div>
                    </div>
                    <button
                      onClick={() => addSuggestedTimer(timer)}
                      className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {kitchenMode && (
        <div className="fixed bottom-6 right-6">
          <button 
            onClick={toggleKitchenMode}
            className="px-4 py-2 bg-red-500 text-white rounded-md shadow-lg hover:bg-red-600"
          >
            Exit Kitchen Mode
          </button>
        </div>
      )}
    </div>
  );
};

export default CookingTimer;
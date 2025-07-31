import React from 'react';

interface KeyboardControlsProps {
  className?: string;
  isActive?: boolean;
}

/**
 * KeyboardControls component displays keyboard control instructions
 * Shows key mappings and current active status
 */
export const KeyboardControls: React.FC<KeyboardControlsProps> = ({
  className = '',
  isActive = false
}) => {
  const keyGroups = [
    {
      title: 'Movement',
      color: 'bg-blue-500',
      keys: [
        { key: 'W', action: 'Forward', icon: '↑' },
        { key: 'S', action: 'Backward', icon: '↓' },
        { key: 'A', action: 'Left', icon: '←' },
        { key: 'D', action: 'Right', icon: '→' },
      ]
    },
    {
      title: 'Altitude & Rotation',
      color: 'bg-green-500',
      keys: [
        { key: '↑', action: 'Up', icon: '▲' },
        { key: '↓', action: 'Down', icon: '▼' },
        { key: '←', action: 'Turn Left', icon: '↺' },
        { key: '→', action: 'Turn Right', icon: '↻' },
      ]
    },
    {
      title: 'Actions',
      color: 'bg-purple-500',
      keys: [
        { key: 'Space', action: 'Takeoff/Land', icon: '⚡' },
        { key: 'E', action: 'Emergency Stop', icon: '🛑' },
        { key: 'C', action: 'Switch Camera', icon: '📷' },
      ]
    }
  ];

  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Keyboard Controls</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-sm text-gray-400">
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {keyGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="flex items-center space-x-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${group.color}`} />
              <h4 className="text-white font-medium">{group.title}</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {group.keys.map((keyInfo, keyIndex) => (
                <div key={keyIndex} className="flex items-center space-x-3 bg-gray-800 rounded p-2">
                  <div className="flex items-center space-x-2">
                    <kbd className="bg-gray-700 text-white px-2 py-1 rounded text-xs font-mono min-w-[2rem] text-center">
                      {keyInfo.key}
                    </kbd>
                    <span className="text-gray-300 text-lg">{keyInfo.icon}</span>
                  </div>
                  <span className="text-gray-300 text-sm">{keyInfo.action}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 bg-yellow-900 bg-opacity-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-yellow-300 text-sm font-medium">💡 Tips</span>
        </div>
        <ul className="text-yellow-300 text-xs space-y-1">
          <li>• Hold keys for continuous movement</li>
          <li>• Release all keys to hover</li>
          <li>• Use gentle inputs for precise control</li>
          <li>• Emergency Stop (E) works anytime</li>
        </ul>
      </div>
    </div>
  );
};

export default KeyboardControls;
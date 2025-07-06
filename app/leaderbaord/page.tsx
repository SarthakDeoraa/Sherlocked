'use client';

import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  totalScore: number;
  currentLevel: number;
  lastAnswerAt: string | null;
  responseTime?: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
      
      // Request initial leaderboard data
      ws.send(JSON.stringify({ type: 'GET_LEADERBOARD' }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'LEADERBOARD_UPDATE') {
          setLeaderboard(message.data);
          setLastUpdate(message.timestamp);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    if (diffMins > 0) {
      return `${diffMins}m ${diffSecs}s ago`;
    }
    return `${diffSecs}s ago`;
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 2:
        return 'bg-gray-100 border-gray-400 text-gray-800';
      case 3:
        return 'bg-orange-100 border-orange-400 text-orange-800';
      default:
        return 'bg-white border-gray-200 text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
              {lastUpdate && (
                <span className="text-sm text-gray-500">
                  Last updated: {new Date(lastUpdate).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No teams found</div>
              <div className="text-gray-400 text-sm mt-2">Teams will appear here once they start playing</div>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <div
                  key={entry.teamId}
                  className={`border rounded-lg p-4 flex items-center justify-between ${getRankColor(entry.rank)}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 font-bold text-gray-700">
                      {entry.rank}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{entry.teamName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Level {entry.currentLevel}</span>
                        <span>•</span>
                        <span>{entry.totalScore} points</span>
                        <span>•</span>
                        <span>Last answer: {formatTime(entry.lastAnswerAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {entry.totalScore}
                    </div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

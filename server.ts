import './lib/websocket-server';

console.log('Starting WebSocket server for leaderboard...');

// The WebSocket server will be automatically started when the module is imported
// This file can be run with: npx tsx server.ts

process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down WebSocket server...');
  process.exit(0);
}); 
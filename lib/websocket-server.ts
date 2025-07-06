import { WebSocketServer, WebSocket } from 'ws';
import { prisma } from './prisma';

interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  totalScore: number;
  currentLevel: number;
  lastAnswerAt: string | null;
  responseTime?: number; // in milliseconds
  rank: number;
}

// Global variables for WebSocket server state
let wss: WebSocketServer;
let clients: Set<WebSocket> = new Set();

// Initialize WebSocket server
export function initializeWebSocketServer(port: number = 3001) {
  wss = new WebSocketServer({ port });
  setupWebSocketServer();
  console.log(`WebSocket server running on port ${port}`);
}

function setupWebSocketServer() {
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    clients.add(ws);

    // Send initial leaderboard data
    sendLeaderboardToClient(ws);

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(ws, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  });
}

async function handleMessage(ws: WebSocket, message: any) {
  switch (message.type) {
    case 'GET_LEADERBOARD':
      await sendLeaderboardToClient(ws);
      break;
    case 'ANSWER_SUBMITTED':
      await handleAnswerSubmitted(message.data);
      break;
    default:
      console.log('Unknown message type:', message.type);
  }
}

async function handleAnswerSubmitted(data: { teamId: string; isCorrect: boolean; responseTime: number }) {
  if (data.isCorrect) {
    // Update the team's last answer time
    await prisma.teamProgress.update({
      where: { teamId: data.teamId },
      data: { lastAnswerAt: new Date() },
    });

    // Broadcast updated leaderboard to all clients
    await broadcastLeaderboard();
  }
}

async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const teams = await prisma.teamProgress.findMany({
    include: {
      team: {
        select: {
          name: true,
        },
      },
    },
    orderBy: [
      { totalScore: 'desc' },
      { lastAnswerAt: 'asc' }, // Earlier answers rank higher
    ],
  });

  return teams.map((team, index) => ({
    teamId: team.teamId,
    teamName: team.team.name,
    totalScore: team.totalScore,
    currentLevel: team.currentLevel,
    lastAnswerAt: team.lastAnswerAt?.toISOString() || null,
    rank: index + 1,
  }));
}

async function sendLeaderboardToClient(ws: WebSocket) {
  try {
    const leaderboard = await getLeaderboardData();
    ws.send(JSON.stringify({
      type: 'LEADERBOARD_UPDATE',
      data: leaderboard,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error sending leaderboard to client:', error);
  }
}

async function broadcastLeaderboard() {
  const leaderboard = await getLeaderboardData();
  const message = JSON.stringify({
    type: 'LEADERBOARD_UPDATE',
    data: leaderboard,
    timestamp: new Date().toISOString(),
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Public functions to interact with the WebSocket server
export async function updateLeaderboard() {
  await broadcastLeaderboard();
}

export async function handleAnswer(teamId: string, isCorrect: boolean, responseTime: number) {
  await handleAnswerSubmitted({ teamId, isCorrect, responseTime });
}

// Initialize the server when this module is imported
initializeWebSocketServer(); 
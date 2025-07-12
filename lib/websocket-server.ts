import { WebSocketServer, WebSocket } from 'ws';
import { prisma } from './prisma';

interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  totalScore: number;
  currentLevel: number;
  lastAnswerAt: string | null;
  rank: number;
}

interface WebSocketMessage {
  type: 'GET_LEADERBOARD' | 'ANSWER_SUBMITTED';
  data?: {
    teamId: string;
    isCorrect: boolean;
    responseTime: number;
  };
}

let wss: WebSocketServer;
const clients: Set<WebSocket> = new Set();

export function initializeWebSocketServer(port: number = 3001) {
  wss = new WebSocketServer({ port });
  setupWebSocketServer();
  console.log(`WebSocket server running on port ${port}`);
}

function setupWebSocketServer() {
  wss.on('connection', async (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    clients.add(ws);
    await sendLeaderboardToClient(ws);

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
        const message: WebSocketMessage = JSON.parse(data.toString());
        handleMessage(ws, message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  });
}

async function handleMessage(ws: WebSocket, message: WebSocketMessage) {
  switch (message.type) {
    case 'GET_LEADERBOARD':
      await sendLeaderboardToClient(ws);
      break;
    case 'ANSWER_SUBMITTED':
      if (message.data) {
        await handleAnswerSubmitted(message.data);
      }
      break;
    default:
      console.log('Unknown message type:', message.type);
  }
}

async function handleAnswerSubmitted(data: { teamId: string; isCorrect: boolean; responseTime: number }) {
  if (data.isCorrect) {
    await prisma.teamProgress.update({
      where: { teamId: data.teamId },
      data: { lastAnswerAt: new Date() },
    });

    await broadcastLeaderboard();
  }
}

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
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
      { lastAnswerAt: 'asc' },
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

export async function updateLeaderboard() {
  await broadcastLeaderboard();
}

export async function handleAnswer(teamId: string, isCorrect: boolean, responseTime: number) {
  await handleAnswerSubmitted({ teamId, isCorrect, responseTime });
}

initializeWebSocketServer(); 
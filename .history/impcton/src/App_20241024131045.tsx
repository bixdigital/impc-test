import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // Ensure ethers is installed and imported
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SpinWheel from './components/SpinWheel';
import ClickerGame from './components/ClickerGame';
import WalletConnection from './components/WalletConnection';
import ReferralSystem from './components/ReferralSystem';
import TaskSection from './components/TaskSection';

export default function App() {
  const [balance, setBalance] = useState(1000); // Initial balance from Telegram account age reward
  const [walletConnected, setWalletConnected] = useState(false);

  // Function to check wallet connection
  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
        }
      } catch (error) {
        console.error("User denied account access:", error);
      }
    } else {
      console.error("No wallet found. Please install MetaMask.");
    }
  };

  // Function to check existing wallet connection
  const checkExistingConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      setWalletConnected(accounts.length > 0);
    }
  };

  useEffect(() => {
    checkExistingConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 text-white p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Impcton</h1>
        <WalletConnection connected={walletConnected} onConnect={checkWalletConnection} />
      </header>

      <Card className="bg-white/10 backdrop-blur-lg border-none text-white p-6">
        <Tabs defaultValue="spin" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="spin">Spin Wheel</TabsTrigger>
            <TabsTrigger value="clicker">Clicker Game</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="referral">Referral</TabsTrigger>
          </TabsList>
          <TabsContent value="spin">
            <SpinWheel balance={balance} setBalance={setBalance} />
          </TabsContent>
          <TabsContent value="clicker">
            <ClickerGame balance={balance} setBalance={setBalance} />
          </TabsContent>
          <TabsContent value="tasks">
            <TaskSection balance={balance} setBalance={setBalance} />
          </TabsContent>
          <TabsContent value="referral">
            <ReferralSystem />
          </TabsContent>
        </Tabs>
      </Card>

      <footer className="mt-6 text-center">
        <p>Your Balance: {balance.toLocaleString()} tokens</p>
      </footer>
    </div>
  );
}

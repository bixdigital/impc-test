import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SpinWheelProps {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ balance, setBalance }) => {
  const [canSpin, setCanSpin] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reward, setReward] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const segments = useMemo(() => [
    { label: "10", value: 10 },
    { label: "20", value: 20 },
    { label: "30", value: 30 },
    { label: "40", value: 40 },
    { label: "50", value: 50 },
    { label: "100", value: 100 },
    { label: "200", value: 200 },
    { label: "500", value: 500 },
  ], []);

  useEffect(() => {
    const lastSpinData = JSON.parse(localStorage.getItem('lastSpinData') || '{}');
    const { lastSpinTime } = lastSpinData;

    if (lastSpinTime) {
      const timeDiff = Date.now() - lastSpinTime;
      if (timeDiff < 3600000) { // 1-hour cooldown
        setCanSpin(false);
        setTimeLeft(3600000 - timeDiff);
      }
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          setCanSpin(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const drawWheel = useCallback((ctx: CanvasRenderingContext2D, rotationAngle: number) => {
    const width = canvasRef.current?.width || 0;
    const height = canvasRef.current?.height || 0;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const segmentAngle = (2 * Math.PI) / segments.length;

    segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle + rotationAngle;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = index % 2 === 0 ? '#f39c12' : '#f1c40f';
      ctx.fill();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.fillStyle = 'black';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(segment.label, radius / 2, 0);
      ctx.restore();
    });
  }, [segments]);

  const handleSpin = () => {
    if (!canSpin) return;

    setIsSpinning(true);
    const spinDuration = 3000;
    const spins = Math.floor(Math.random() * 5) + 5;
    const totalRotation = spins * 360 + Math.floor(Math.random() * 360);

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / spinDuration, 1);
      const easing = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const currentRotation = totalRotation * easing;

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.save();
          ctx.translate(canvasRef.current.width / 2, canvasRef.current.height / 2);
          ctx.rotate((currentRotation * Math.PI) / 180);
          ctx.translate(-canvasRef.current.width / 2, -canvasRef.current.height / 2);
          drawWheel(ctx, currentRotation);
          ctx.restore();
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const rewardIndex = Math.floor(((currentRotation % 360) / 360) * segments.length);
        const rewardAmount = segments[rewardIndex % segments.length].value;
        setReward(rewardAmount);
        setBalance(prevBalance => prevBalance + rewardAmount);

        localStorage.setItem('lastSpinData', JSON.stringify({ lastSpinTime: Date.now() }));
        setCanSpin(false);
        setTimeLeft(3600000); // 1-hour cooldown
        setIsSpinning(false);
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        drawWheel(ctx, 0);
      }
    }
  }, [drawWheel]);

  return (
    <Card className="p-6 text-center bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-4 text-white drop-shadow-md">Spin the Wheel!</h2>
      <p className="text-xl text-white mb-4">Current Balance: {balance}</p>
      <div className="relative w-64 h-64 mx-auto mb-4">
        <canvas ref={canvasRef} width={256} height={256} className="rounded-full border-4 border-yellow-400" />
      </div>
      <Button
        onClick={handleSpin}
        disabled={!canSpin || isSpinning}
        className={`mt-4 ${canSpin ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
      </Button>
      {reward > 0 && (
        <p className="mt-4 text-lg font-bold text-green-500">
          You won: {reward} tokens!
        </p>
      )}
      {!canSpin && (
        <p className="mt-4 text-red-500">
          You need to wait {Math.ceil(timeLeft / 1000)} seconds to spin again.
        </p>
      )}
    </Card>
  );
};

export default SpinWheel;
import { useState, useEffect } from "react";

type CountdownTimerProps = {
  targetDate: Date;
  destination: string;
  launchPad: string;
  status: string;
  weather: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  destination,
  launchPad,
  status,
  weather
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className="bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
      <h2 className="text-xl font-['Orbitron'] font-bold mb-4 text-amber-400 flex items-center">
        <i className="ri-rocket-2-line mr-2"></i> Next Launch
      </h2>
      <div className="text-center py-6">
        <div className="flex justify-center space-x-4 mb-5">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-['Space_Mono'] text-slate-100">{formatTime(timeLeft.days)}</div>
            <div className="text-xs text-slate-300/50 uppercase">Days</div>
          </div>
          <div className="text-2xl font-['Space_Mono'] text-slate-300/30">:</div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-['Space_Mono'] text-slate-100">{formatTime(timeLeft.hours)}</div>
            <div className="text-xs text-slate-300/50 uppercase">Hours</div>
          </div>
          <div className="text-2xl font-['Space_Mono'] text-slate-300/30">:</div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-['Space_Mono'] text-slate-100">{formatTime(timeLeft.minutes)}</div>
            <div className="text-xs text-slate-300/50 uppercase">Minutes</div>
          </div>
          <div className="text-2xl font-['Space_Mono'] text-slate-300/30">:</div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-['Space_Mono'] text-slate-100">{formatTime(timeLeft.seconds)}</div>
            <div className="text-xs text-slate-300/50 uppercase">Seconds</div>
          </div>
        </div>
        <div>
          <div className="font-bold text-sm">{destination}</div>
          <div className="text-sm text-slate-300/70">Launch Pad: {launchPad}</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="text-sm">Launch Status</div>
          <div className="text-sm text-green-500 flex items-center">
            <i className="ri-checkbox-circle-line mr-1"></i> {status}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm">Weather Conditions</div>
          <div className="text-sm text-amber-400 flex items-center">
            <i className="ri-sun-line mr-1"></i> {weather}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;

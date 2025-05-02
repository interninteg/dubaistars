import { useEffect, useState } from "react";
import { Link } from "wouter";
import CountdownTimer from "@/components/CountdownTimer";
import BookingTable from "@/components/BookingTable";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard: React.FC = () => {
  // Six months from now for the Mars expedition launch date
  const launchDate = new Date();
  launchDate.setMonth(launchDate.getMonth() + 6);
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-['Orbitron'] font-bold text-center mb-2">
          <span className="text-amber-400">Welcome</span> <span className="text-slate-100">to your Space Travel Dashboard</span>
        </h1>
        <p className="text-center text-slate-300/70 max-w-2xl mx-auto">
          Manage your interplanetary journeys, track upcoming launches, and get personalized recommendations.
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Countdown Timer */}
        <div className="lg:col-span-1">
          <CountdownTimer 
            targetDate={launchDate}
            destination="Mars Expedition"
            launchPad="Dubai Space Port"
            status="On Schedule"
            weather="Clear Skies"
          />
        </div>

        {/* Trip Summary */}
        <div className="lg:col-span-2">
          <BookingTable />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
          <h2 className="text-xl font-['Orbitron'] font-bold mb-4 text-amber-400 flex items-center">
            <i className="ri-history-line mr-2"></i> Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 mt-1">
                <i className="ri-rocket-line"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Mars Expedition Booking Confirmed</h3>
                  <span className="text-xs text-slate-300/50">2 days ago</span>
                </div>
                <p className="text-sm text-slate-300/70 mt-1">Your booking for the Mars Expedition (June 15, 2025) has been confirmed. Check your email for details.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-700/20 flex items-center justify-center text-purple-300 mt-1">
                <i className="ri-file-list-3-line"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Medical Clearance Approved</h3>
                  <span className="text-xs text-slate-300/50">1 week ago</span>
                </div>
                <p className="text-sm text-slate-300/70 mt-1">Your medical clearance for zero-gravity environments has been approved. Valid for one year.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 mt-1">
                <i className="ri-coupon-line"></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Loyalty Points Added</h3>
                  <span className="text-xs text-slate-300/50">2 weeks ago</span>
                </div>
                <p className="text-sm text-slate-300/70 mt-1">You've earned 5,000 Star Points from your last booking. Current balance: 12,500 points.</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Travel Assistant */}
        <div className="lg:col-span-1 bg-black/50 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
          <h2 className="text-xl font-['Orbitron'] font-bold mb-4 text-amber-400 flex items-center">
            <i className="ri-robot-line mr-2"></i> AI Travel Insights
          </h2>
          <div className="mb-4">
            <p className="text-sm text-slate-300/70 mb-3">Get personalized travel tips based on your upcoming trips:</p>
            <div className="bg-purple-700/20 p-3 rounded-lg">
              <p className="text-sm"><span className="text-amber-400 font-bold">Tip:</span> For your Mars trip, pack lightweight, moisture-wicking clothing as temperatures can vary dramatically between day and night.</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-slate-300/50">For more personalized advice, visit the AI Advisor section.</p>
            <Link href="/advisor" className="mt-4 inline-block text-sm text-amber-400 hover:text-amber-300 transition-colors">
              <i className="ri-arrow-right-line mr-1"></i> Go to AI Advisor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

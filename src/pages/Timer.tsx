import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

export default function Timer() {
  const { data: user } = useUser();
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    let interval: any;
    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds((s) => s - 1);
      }, 1000);
    } else if (totalSeconds === 0 && isRunning) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, totalSeconds]);

  const handleSessionComplete = async () => {
    if (sound) {
      new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj==").play().catch(() => {});
    }

    if (isWorkSession) {
      setSessionsCompleted((s) => s + 1);
      if (user) {
        await supabase.from("users").update({ total_study_hours: (user.total_study_hours || 0) + (workMinutes / 60) }).eq("id", user.id);
      }
      toast.success("Work session complete! Time for a break.");
      setIsWorkSession(false);
      setTotalSeconds(breakMinutes * 60);
    } else {
      toast.success("Break over! Ready for another session?");
      setIsWorkSession(true);
      setTotalSeconds(workMinutes * 60);
    }
    setIsRunning(false);
  };

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const handleReset = () => {
    setIsRunning(false);
    setTotalSeconds(isWorkSession ? workMinutes * 60 : breakMinutes * 60);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pomodoro Timer</h1>
          <p className="text-muted-foreground">Stay focused with the Pomodoro technique</p>
        </div>

        {/* Timer Display */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
          <CardContent className="p-12 text-center">
            <p className="text-lg text-muted-foreground mb-4 font-semibold">
              {isWorkSession ? "🎯 Focus Session" : "☕ Break Time"}
            </p>
            <div className="text-8xl font-bold text-foreground mb-4 font-mono">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setIsRunning(!isRunning)}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setSound(!sound)}
              >
                {sound ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Timer Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={workMinutes}
                  onChange={(e) => {
                    setWorkMinutes(Number(e.target.value));
                    if (!isRunning) setTotalSeconds(Number(e.target.value) * 60);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground"
                  disabled={isRunning}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Sessions Completed</p>
                <p className="text-4xl font-bold text-foreground">{sessionsCompleted}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Focus Time</p>
                <p className="text-4xl font-bold text-foreground">
                  {Math.round((sessionsCompleted * workMinutes) / 60)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Pomodoro Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Eliminate distractions during focus sessions</li>
              <li>✓ Use breaks to stretch and hydrate</li>
              <li>✓ Track your sessions to build consistency</li>
              <li>✓ After 4 sessions, take a longer break (15-30 min)</li>
              <li>✓ Adjust durations based on your needs</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

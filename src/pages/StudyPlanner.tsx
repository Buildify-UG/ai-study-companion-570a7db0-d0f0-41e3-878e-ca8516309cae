import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Zap, Calendar, Clock, Coffee, Plus } from "lucide-react";

export default function StudyPlanner() {
  const { data: user } = useUser();
  const [sessions, setSessions] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    available_hours: "3",
  });

  const generateStudyPlan = async () => {
    if (!user) return;

    try {
      const hours = parseInt(formData.available_hours);
      const generatedSessions: any[] = [];
      let currentTime = new Date();
      currentTime.setHours(14, 0, 0, 0);

      const sessionDuration = 50;
      const breakDuration = 10;
      let remainingMinutes = hours * 60;

      while (remainingMinutes > 0) {
        if (remainingMinutes >= sessionDuration) {
          generatedSessions.push({
            id: Date.now() + Math.random(),
            startTime: new Date(currentTime),
            endTime: new Date(currentTime.getTime() + sessionDuration * 60000),
            duration: sessionDuration,
            breaks: 1,
          });

          currentTime = new Date(currentTime.getTime() + (sessionDuration + breakDuration) * 60000);
          remainingMinutes -= sessionDuration + breakDuration;
        } else {
          break;
        }
      }

      setSessions(generatedSessions);
      toast.success(`Generated ${generatedSessions.length} study sessions!`);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error generating plan");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Study Planner</h1>
            <p className="text-muted-foreground">Generate optimized study schedules</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Zap className="w-5 h-5 mr-2" />
                Generate Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Study Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hours">Available Hours Today</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.available_hours}
                    onChange={(e) =>
                      setFormData({ ...formData, available_hours: e.target.value })
                    }
                  />
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    📊 <strong>Smart Planning:</strong> AI will create an optimized study schedule with built-in breaks.
                  </p>
                </div>
                <Button onClick={generateStudyPlan} className="w-full">
                  Generate Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {sessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Today's Study Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session, idx) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Session {idx + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.startTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {session.endTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {sessions.length === 0 && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-12 text-center">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No study plan yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Generate an AI-powered study schedule tailored to your time
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Study Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { LogOut, User, Bell, Target, Award } from "lucide-react";

export default function Profile() {
  const { data: user, refetch } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    semester: user?.semester || "",
    academic_goal: user?.academic_goal || "",
    gpa: user?.gpa?.toString() || "",
  });

  const { data: notificationSettings } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) return null;
      return data;
    },
  });

  const [notifications, setNotifications] = useState({
    study_reminders: notificationSettings?.study_reminders ?? true,
    exam_alerts: notificationSettings?.exam_alerts ?? true,
    task_notifications: notificationSettings?.task_notifications ?? true,
    streak_notifications: notificationSettings?.streak_notifications ?? true,
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from("users").update(formData).eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated!");
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating profile");
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("notification_settings")
        .update(notifications)
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Notification settings updated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating settings");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = "/login";
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? "Save" : "Edit"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={formData.email} disabled />
              </div>
              <div>
                <Label htmlFor="semester">Current Semester</Label>
                <Input
                  id="semester"
                  placeholder="e.g., Fall 2024"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="gpa">Current GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  placeholder="3.5"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="goal">Academic Goal</Label>
                <Input
                  id="goal"
                  placeholder="e.g., Maintain 3.5+ GPA"
                  value={formData.academic_goal}
                  onChange={(e) => setFormData({ ...formData, academic_goal: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Study Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Study Streak</p>
                <p className="text-3xl font-bold text-foreground">{user.study_streak}</p>
                <p className="text-xs text-muted-foreground mt-1">days</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Total Study Hours</p>
                <p className="text-3xl font-bold text-foreground">{user.total_study_hours}</p>
                <p className="text-xs text-muted-foreground mt-1">hours</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Current GPA</p>
                <p className="text-3xl font-bold text-foreground">{user.gpa || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Academic Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground font-semibold mb-2">{user.academic_goal || "No goal set"}</p>
            <p className="text-sm text-muted-foreground">Keep this goal in mind as you plan your studies</p>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleSaveNotifications}>
              Save
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Study Reminders</p>
                <p className="text-sm text-muted-foreground">Get reminded to study</p>
              </div>
              <Switch
                checked={notifications.study_reminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, study_reminders: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Exam Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified about upcoming exams</p>
              </div>
              <Switch
                checked={notifications.exam_alerts}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, exam_alerts: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Task Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified about due tasks</p>
              </div>
              <Switch
                checked={notifications.task_notifications}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, task_notifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Streak Notifications</p>
                <p className="text-sm text-muted-foreground">Get motivated by your streaks</p>
              </div>
              <Switch
                checked={notifications.streak_notifications}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, streak_notifications: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </Layout>
  );
}

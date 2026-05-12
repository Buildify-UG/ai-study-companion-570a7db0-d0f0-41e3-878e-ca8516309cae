import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/hooks/useUser";
import { useExams } from "@/hooks/useExams";
import { useSubjects } from "@/hooks/useSubjects";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, AlertCircle, Calendar } from "lucide-react";
import { formatDistanceToNow, formatDate } from "date-fns";

export default function Exams() {
  const { data: user } = useUser();
  const { data: exams = [], refetch } = useExams(user?.id);
  const { data: subjects = [] } = useSubjects(user?.id);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject_id: "",
    title: "",
    exam_type: "midterm",
    exam_date: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingId) {
        const { error } = await supabase.from("exams").update(formData).eq("id", editingId);
        if (error) throw error;
        toast.success("Exam updated!");
      } else {
        const { error } = await supabase.from("exams").insert([{ ...formData, user_id: user.id }]);
        if (error) throw error;
        toast.success("Exam added!");
      }

      setFormData({ subject_id: "", title: "", exam_type: "midterm", exam_date: "", priority: "medium" });
      setEditingId(null);
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error saving exam");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exam?")) return;
    try {
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;
      toast.success("Exam deleted!");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error deleting exam");
    }
  };

  const handleEdit = (exam: any) => {
    setFormData({
      subject_id: exam.subject_id,
      title: exam.title,
      exam_type: exam.exam_type,
      exam_date: exam.exam_date.split("T")[0],
      priority: exam.priority,
    });
    setEditingId(exam.id);
    setOpen(true);
  };

  const upcomingExams = exams.filter((e) => new Date(e.exam_date) > new Date()).sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
  const pastExams = exams.filter((e) => new Date(e.exam_date) <= new Date());

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Exams</h1>
            <p className="text-muted-foreground">Manage your exam schedule</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setFormData({ subject_id: "", title: "", exam_type: "midterm", exam_date: "", priority: "medium" }); }}>
                <Plus className="w-5 h-5 mr-2" />
                Add Exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Exam" : "Add New Exam"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={formData.subject_id} onValueChange={(value) => setFormData({ ...formData, subject_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Exam Title</Label>
                  <Input id="title" placeholder="e.g., Final Exam" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="exam_type">Exam Type</Label>
                  <Select value={formData.exam_type} onValueChange={(value) => setFormData({ ...formData, exam_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midterm">Midterm</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="exam_date">Exam Date</Label>
                  <Input id="exam_date" type="date" value={formData.exam_date} onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Add"} Exam
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {upcomingExams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingExams.map((exam) => {
                  const subject = subjects.find((s) => s.id === exam.subject_id);
                  const daysUntil = Math.ceil((new Date(exam.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={exam.id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{exam.title}</p>
                        <p className="text-sm text-muted-foreground">{subject?.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(new Date(exam.exam_date), "MMM dd, yyyy")} ({daysUntil} days away)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          exam.priority === "high" ? "bg-red-100 text-red-700" : exam.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {exam.priority}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(exam)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(exam.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {pastExams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Past Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastExams.map((exam) => {
                  const subject = subjects.find((s) => s.id === exam.subject_id);
                  return (
                    <div key={exam.id} className="flex items-center justify-between p-4 bg-muted rounded-lg opacity-60">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground line-through">{exam.title}</p>
                        <p className="text-sm text-muted-foreground">{subject?.name}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(exam.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {exams.length === 0 && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No exams scheduled</h3>
              <p className="text-muted-foreground">Add your upcoming exams to stay organized</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

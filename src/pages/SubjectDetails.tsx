import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, CheckCircle2, Circle, FileText, ArrowLeft, Download, Zap } from "lucide-react";

export default function SubjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    priority: "medium" as "low" | "medium" | "high",
    pdf_url: "",
  });

  const { data: subject } = useQuery({
    queryKey: ["subject", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("subjects").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: lectures = [], refetch: refetchLectures } = useQuery({
    queryKey: ["lectures", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("lectures")
        .select("*")
        .eq("subject_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      if (editingId) {
        const { error } = await supabase.from("lectures").update(formData).eq("id", editingId);
        if (error) throw error;
        toast.success("Lecture updated!");
      } else {
        const { error } = await supabase.from("lectures").insert([
          { ...formData, subject_id: id, completed: false },
        ]);
        if (error) throw error;
        toast.success("Lecture added!");
      }

      setFormData({ title: "", priority: "medium", pdf_url: "" });
      setEditingId(null);
      setOpen(false);
      refetchLectures();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error saving lecture");
    }
  };

  const handleDelete = async (lectureId: string) => {
    if (!confirm("Delete this lecture?")) return;
    try {
      const { error } = await supabase.from("lectures").delete().eq("id", lectureId);
      if (error) throw error;
      toast.success("Lecture deleted!");
      refetchLectures();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error deleting lecture");
    }
  };

  const handleToggleComplete = async (lectureId: string, completed: boolean) => {
    try {
      const { error } = await supabase.from("lectures").update({ completed: !completed }).eq("id", lectureId);
      if (error) throw error;
      refetchLectures();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating lecture");
    }
  };

  const handleEdit = (lecture: any) => {
    setFormData({
      title: lecture.title,
      priority: lecture.priority,
      pdf_url: lecture.pdf_url || "",
    });
    setEditingId(lecture.id);
    setOpen(true);
  };

  const completedCount = lectures.filter((l) => l.completed).length;
  const totalCount = lectures.length;

  if (!subject) {
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/subjects")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{subject.name}</h1>
            <p className="text-muted-foreground">{subject.semester}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subject.progress}%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${subject.progress}%`, backgroundColor: subject.color }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lectures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedCount}/{totalCount}</div>
              <p className="text-sm text-muted-foreground mt-1">completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Target Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{subject.grade || "N/A"}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lectures & Materials</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingId(null); setFormData({ title: "", priority: "medium", pdf_url: "" }); }}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Lecture
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Lecture" : "Add New Lecture"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Lecture Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Calculus Chapter 5"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
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
                  <div>
                    <Label htmlFor="pdf_url">PDF URL (Optional)</Label>
                    <Input
                      id="pdf_url"
                      placeholder="https://example.com/lecture.pdf"
                      value={formData.pdf_url}
                      onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingId ? "Update" : "Add"} Lecture
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {lectures.length > 0 ? (
              <div className="space-y-3">
                {lectures.map((lecture) => (
                  <div key={lecture.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <button onClick={() => handleToggleComplete(lecture.id, lecture.completed)} className="flex-shrink-0">
                      {lecture.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p className={`font-semibold ${lecture.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {lecture.title}
                      </p>
                      {lecture.pdf_url && <p className="text-sm text-muted-foreground">PDF attached</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      lecture.priority === "high" ? "bg-red-100 text-red-700" : lecture.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {lecture.priority}
                    </span>
                    {lecture.pdf_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={lecture.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(lecture)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(lecture.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No lectures yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Study Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => navigate("/ai-tutor")}>
                <Zap className="w-6 h-6" />
                <span className="text-sm">Generate Summary</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => navigate("/ai-tutor")}>
                <Zap className="w-6 h-6" />
                <span className="text-sm">Create Quiz</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => navigate("/ai-tutor")}>
                <Zap className="w-6 h-6" />
                <span className="text-sm">Flashcards</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => navigate("/ai-tutor")}>
                <Zap className="w-6 h-6" />
                <span className="text-sm">Ask Tutor</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

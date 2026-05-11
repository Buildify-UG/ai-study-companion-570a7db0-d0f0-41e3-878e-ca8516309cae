import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@/hooks/useUser";
import { useSubjects } from "@/hooks/useSubjects";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, BookOpen, Zap } from "lucide-react";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
];

export default function Subjects() {
  const navigate = useNavigate();
  const { data: user } = useUser();
  const { data: subjects = [], refetch } = useSubjects(user?.id);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: COLORS[0],
    semester: "",
    grade: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingId) {
        const { error } = await supabase
          .from("subjects")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Subject updated!");
      } else {
        const { error } = await supabase.from("subjects").insert([
          {
            ...formData,
            user_id: user.id,
            progress: 0,
          },
        ]);
        if (error) throw error;
        toast.success("Subject added!");
      }

      setFormData({ name: "", color: COLORS[0], semester: "", grade: "" });
      setEditingId(null);
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error saving subject");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject?")) return;

    try {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;
      toast.success("Subject deleted!");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error deleting subject");
    }
  };

  const handleEdit = (subject: any) => {
    setFormData({
      name: subject.name,
      color: subject.color,
      semester: subject.semester || "",
      grade: subject.grade || "",
    });
    setEditingId(subject.id);
    setOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Subjects</h1>
            <p className="text-muted-foreground">Manage your study subjects</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: "",
                    color: COLORS[0],
                    semester: "",
                    grade: "",
                  });
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Subject" : "Add New Subject"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mathematics"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    placeholder="e.g., Spring 2024"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="grade">Target Grade</Label>
                  <Input
                    id="grade"
                    placeholder="e.g., A"
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-lg transition-transform ${
                          formData.color === color ? "ring-2 ring-offset-2" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() =>
                          setFormData({ ...formData, color })
                        }
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Create"} Subject
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subjects Grid */}
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card
                key={subject.id}
                className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
              >
                <div
                  className="h-2"
                  style={{ backgroundColor: subject.color }}
                />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground">
                        {subject.name}
                      </h3>
                      {subject.semester && (
                        <p className="text-sm text-muted-foreground">
                          {subject.semester}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(subject)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subject.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {subject.grade && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">
                        Target Grade
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {subject.grade}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-sm font-semibold">
                        {subject.progress}%
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${subject.progress}%`,
                          backgroundColor: subject.color,
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/subjects/${subject.id}`)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No subjects yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first subject to get started with your study plan
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: "",
                      color: COLORS[0],
                      semester: "",
                      grade: "",
                    });
                  }}>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Subject Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Mathematics"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="semester">Semester</Label>
                      <Input
                        id="semester"
                        placeholder="e.g., Spring 2024"
                        value={formData.semester}
                        onChange={(e) =>
                          setFormData({ ...formData, semester: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="grade">Target Grade</Label>
                      <Input
                        id="grade"
                        placeholder="e.g., A"
                        value={formData.grade}
                        onChange={(e) =>
                          setFormData({ ...formData, grade: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>Color</Label>
                      <div className="grid grid-cols-6 gap-2 mt-2">
                        {COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-lg transition-transform ${
                              formData.color === color ? "ring-2 ring-offset-2" : ""
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() =>
                              setFormData({ ...formData, color })
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      Create Subject
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

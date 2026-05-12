import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/hooks/useUser";
import { useTasks } from "@/hooks/useTasks";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, CheckCircle2, Circle, ListTodo } from "lucide-react";

export default function Tasks() {
  const { data: user } = useUser();
  const { data: tasks = [], refetch } = useTasks(user?.id);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    due_date: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingId) {
        const { error } = await supabase.from("tasks").update(formData).eq("id", editingId);
        if (error) throw error;
        toast.success("Task updated!");
      } else {
        const { error } = await supabase.from("tasks").insert([{ ...formData, user_id: user.id, completed: false }]);
        if (error) throw error;
        toast.success("Task added!");
      }

      setFormData({ title: "", description: "", priority: "medium", due_date: "" });
      setEditingId(null);
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error saving task");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      toast.success("Task deleted!");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error deleting task");
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase.from("tasks").update({ completed: !completed }).eq("id", id);
      if (error) throw error;
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating task");
    }
  };

  const handleEdit = (task: any) => {
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
    });
    setEditingId(task.id);
    setOpen(true);
  };

  const completedTasks = tasks.filter((t) => t.completed);
  const activeTasks = tasks.filter((t) => !t.completed);
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground">Keep track of your study tasks</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); setFormData({ title: "", description: "", priority: "medium", due_date: "" }); }}>
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Task" : "Add New Task"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input id="title" placeholder="e.g., Study Chapter 3" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Add details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
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
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input id="due_date" type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Add"} Task
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedTasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(completionRate)}%</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${completionRate}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Tasks */}
        {activeTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                    <button onClick={() => handleToggleComplete(task.id, task.completed)} className="flex-shrink-0 mt-1">
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    </button>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{task.title}</p>
                      {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                      {task.due_date && <p className="text-xs text-muted-foreground mt-2">Due: {new Date(task.due_date).toLocaleDateString()}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                      task.priority === "high" ? "bg-red-100 text-red-700" : task.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {task.priority}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-4 p-4 bg-muted rounded-lg opacity-60">
                    <button onClick={() => handleToggleComplete(task.id, task.completed)} className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </button>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground line-through">{task.title}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tasks.length === 0 && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-12 text-center">
              <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No tasks yet</h3>
              <p className="text-muted-foreground">Create your first task to get organized</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

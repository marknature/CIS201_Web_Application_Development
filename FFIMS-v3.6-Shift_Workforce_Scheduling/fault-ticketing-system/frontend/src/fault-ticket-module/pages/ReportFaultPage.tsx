import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AssetDropdown } from "../components/AssetDropdown";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, Send, X, ImageIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemoData } from "../context/DemoDataContext";
import { useRole } from "../context/RoleContext";
import { EmptyState } from "../components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { type TicketPriority } from "../data/mockData";

interface FormErrors {
  title?: string;
  assetId?: string;
  category?: string;
  priority?: string;
  description?: string;
}

export default function ReportFaultPage() {
  const navigate = useNavigate();
  const { createTicket } = useDemoData();
  const { currentUser, hasPermission } = useRole();
  const isAllowed = hasPermission("report_fault");

  const [form, setForm] = useState({ title: "", description: "", assetId: "", category: "", priority: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title = "Fault title is required";
    else if (form.title.trim().length < 5) newErrors.title = "Title must be at least 5 characters";
    if (!form.assetId) newErrors.assetId = "Please select an asset";
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.priority) newErrors.priority = "Please select a priority level";
    if (form.description && form.description.length > 1000) newErrors.description = "Description must be under 1000 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const ticket = createTicket({
      title: form.title,
      description: form.description.trim() || "No additional description provided.",
      assetId: form.assetId,
      category: form.category,
      priority: form.priority as TicketPriority,
      reportedBy: currentUser.name,
      images: files.map((file) => file.name),
    });

    if (!ticket) {
      toast.error("Ticket creation failed");
      return;
    }

    toast.success(`${ticket.id} created successfully`);
    navigate(`/tickets/${ticket.id}`);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
    );
    setFiles((prev) => [...prev, ...droppedFiles].slice(0, 5));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(
        (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
      );
      setFiles((prev) => [...prev, ...selected].slice(0, 5));
    }
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isAllowed) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Access denied"
        description="You don't have permission to report faults."
        actionLabel="Back to Dashboard"
        onAction={() => navigate("/")}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Report a Fault</h1>
        <p className="text-muted-foreground text-sm mt-1">Submit a new fault report linked to a specific asset.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Fault Details</CardTitle>
              <CardDescription>Provide a clear and concise description of the issue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Fault Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  placeholder="e.g., Generator is producing excessive smoke"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className={cn(errors.title && "border-destructive focus-visible:ring-destructive")}
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  maxLength={200}
                />
                {errors.title && <p id="title-error" className="text-xs text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  placeholder="Describe the fault in detail, including any error messages, unusual noises, or other relevant information..."
                  rows={6}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className={cn(errors.description && "border-destructive")}
                  maxLength={1000}
                />
                <div className="flex justify-between">
                  {errors.description ? (
                    <p className="text-xs text-destructive">{errors.description}</p>
                  ) : <span />}
                  <span className="text-xs text-muted-foreground">{form.description.length}/1000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
              <CardDescription>Categorize and prioritize the fault.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Asset <span className="text-destructive">*</span></Label>
                <AssetDropdown value={form.assetId} onChange={(v) => updateField("assetId", v)} />
                {errors.assetId && <p className="text-xs text-destructive">{errors.assetId}</p>}
              </div>

              <div className="space-y-2">
                <Label>Category <span className="text-destructive">*</span></Label>
                <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                  <SelectTrigger className={cn(errors.category && "border-destructive")}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
              </div>
              <div className="space-y-2">
                <Label>Priority <span className="text-destructive">*</span></Label>
                <Select value={form.priority} onValueChange={(v) => updateField("priority", v)}>
                  <SelectTrigger className={cn(errors.priority && "border-destructive")}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && <p className="text-xs text-destructive">{errors.priority}</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>Add up to 5 images.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors relative",
                  isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload images by clicking or dragging"
              >
                <input id="file-input" type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-muted-foreground">
                  {isDragging ? "Drop images here" : "Click or drag images"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
              </div>

              {files.length > 0 && (
                <div className="flex flex-col gap-2 mt-3">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted/70 rounded-md px-3 py-2 text-sm">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        <Button type="submit" className="gap-2">
          <Send className="h-4 w-4" /> Submit Report
        </Button>
      </div>
    </form>
  );
}

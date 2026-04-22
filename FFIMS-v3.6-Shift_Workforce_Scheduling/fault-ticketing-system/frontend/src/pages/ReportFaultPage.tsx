import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, Info, MapPin, Package, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FieldMessage } from "@/components/ffims/FieldMessage";
import { LoadingPanel } from "@/components/ffims/LoadingPanel";
import { PageHeader } from "@/components/ffims/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError, type AssetRecord } from "@/lib/api";

type FormErrors = Record<string, string>;

export function ReportFaultPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState({
    title: "",
    description: "",
    asset_id: "",
    category: "",
    location: "",
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    let active = true;

    api
      .getAssets(token)
      .then((assetData) => {
        if (active) {
          setAssets(assetData);
        }
      })
      .catch((reason) => {
        if (active) {
          toast.error(reason instanceof Error ? reason.message : "Unable to load assets.");
        }
      })
      .finally(() => {
        if (active) {
          setLoadingAssets(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const selectedAsset = useMemo(
    () => assets.find((asset) => String(asset.id) === String(form.asset_id)) || null,
    [assets, form.asset_id],
  );

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) nextErrors.title = "Fault title is required.";
    if (!form.description.trim()) nextErrors.description = "Fault description is required.";
    if (!form.asset_id) nextErrors.asset_id = "Select an asset from the FFIMS register.";
    if (!form.location.trim()) nextErrors.location = "Location is required for technician routing.";
    if (files.length > 3) nextErrors.images = "A maximum of 3 images can be attached.";

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title.trim());
    payload.append("description", form.description.trim());
    payload.append("asset_id", form.asset_id);
    payload.append("category", form.category.trim());
    payload.append("location", form.location.trim());
    files.forEach((file) => payload.append("images", file));

    setSubmitting(true);
    try {
      const result = await api.createFault(payload, token);
      toast.success("Fault reported successfully.");
      navigate(`/fault-ticketing/${result.ticket.id}`);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Fault reporting failed.";
      toast.error(message);
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAssets) {
    return <LoadingPanel label="Loading registered assets..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Button type="button" variant="outline" onClick={() => navigate("/fault-ticketing/tickets")}>
              View Existing Tickets
            </Button>
            <Button type="submit" form="report-fault-form">
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Submitting..." : "Submit Fault Report"}
            </Button>
          </>
        }
        description="Submit a fault against a registered asset with validation, context, and attachment support."
        eyebrow="Fault Intake Form"
        title="Report Fault"
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Fault Information</CardTitle>
            <CardDescription>
              Complete the form carefully so technicians receive actionable, location-specific information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" id="report-fault-form" onSubmit={handleSubmit}>
              <section className="space-y-4 rounded-[24px] border border-[#edf0f4] bg-[#fafafb] p-5">
                <div className="space-y-2">
                  <Label htmlFor="fault-title">Fault Title</Label>
                  <Input
                    aria-invalid={Boolean(errors.title)}
                    id="fault-title"
                    placeholder="Air conditioner leaking in office 12"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  />
                  <FieldMessage message={errors.title} />
                </div>

                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label>Asset</Label>
                    <Select
                      value={form.asset_id}
                      onValueChange={(value) => {
                        const asset = assets.find((item) => String(item.id) === value);
                        setForm((current) => ({
                          ...current,
                          asset_id: value,
                          category: asset?.category || current.category,
                          location: asset?.location || current.location,
                        }));
                      }}
                    >
                      <SelectTrigger aria-invalid={Boolean(errors.asset_id)}>
                        <SelectValue placeholder="Select registered asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={String(asset.id)}>
                            {asset.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldMessage message={errors.asset_id} />
                  </div>
                </div>
                <div className="rounded-[20px] border border-[#edf0f4] bg-white p-4 text-[13px] leading-6 text-muted-foreground">
                  Ticket priority is assigned by the workflow after submission. Reporters only provide the fault context.
                </div>
              </section>

              <section className="space-y-4 rounded-[24px] border border-[#edf0f4] bg-white p-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="text-[14px] font-semibold text-foreground">Location and category</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fault-location">Location</Label>
                    <Input
                      aria-invalid={Boolean(errors.location)}
                      id="fault-location"
                      placeholder="Administration Block"
                      value={form.location}
                      onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                    />
                    <FieldMessage message={errors.location} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fault-category">Category</Label>
                    <Input
                      id="fault-category"
                      placeholder="Mechanical"
                      value={form.category}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4 rounded-[24px] border border-[#edf0f4] bg-white p-5">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <p className="text-[14px] font-semibold text-foreground">Describe the issue clearly</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fault-description">Description</Label>
                  <Textarea
                    aria-invalid={Boolean(errors.description)}
                    id="fault-description"
                    placeholder="Provide a concise description of the fault, impact, and any immediate risks."
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  />
                  <FieldMessage message={errors.description} />
                </div>
              </section>

              <section className="space-y-4 rounded-[24px] border border-dashed border-[#d8dde6] bg-[#fafafb] p-5">
                <div className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-primary" />
                  <p className="text-[14px] font-semibold text-foreground">Image upload</p>
                </div>

                <div className="rounded-[20px] border border-dashed border-[#d8dde6] bg-white p-4">
                  <Label className="sr-only" htmlFor="fault-images">
                    Upload images
                  </Label>
                  <Input
                    accept="image/*"
                    id="fault-images"
                    multiple
                    type="file"
                    onChange={(event) => setFiles(Array.from(event.target.files || []))}
                  />
                  <p className="mt-3 text-[12px] text-muted-foreground">
                    Attach up to 3 supporting images for faster diagnosis.
                  </p>
                </div>

                {files.length ? (
                  <div className="flex flex-wrap gap-2">
                    {files.map((file) => (
                      <span
                        key={`${file.name}-${file.size}`}
                        className="rounded-full bg-[#f5f6f8] px-3 py-1.5 text-[12px] font-medium text-muted-foreground"
                      >
                        {file.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                <FieldMessage message={errors.images} />
                <FieldMessage message={errors.form} />
              </section>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selected Asset Context</CardTitle>
              <CardDescription>Asset metadata from the FFIMS register.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-[14px]">
              {selectedAsset ? (
                <>
                  <div className="rounded-[20px] bg-[#f5f6f8] p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <p className="font-semibold text-foreground">{selectedAsset.name}</p>
                    </div>
                    <p className="mt-3 text-muted-foreground">Asset ID: {selectedAsset.id}</p>
                    <p className="mt-1 text-muted-foreground">Location: {selectedAsset.location || "Not supplied"}</p>
                    <p className="mt-1 text-muted-foreground">Category: {selectedAsset.category || "Not supplied"}</p>
                  </div>
                  {selectedAsset.maintenance_link ? (
                    <div className="rounded-[20px] border border-blue-100 bg-blue-50 p-4">
                      <p className="font-semibold text-foreground">Maintenance linkage available</p>
                      <p className="mt-2 leading-6 text-muted-foreground">
                        This asset exposes a maintenance handoff reference for downstream integration.
                      </p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="rounded-[20px] border border-dashed border-[#d8dde6] bg-white p-5">
                  <p className="font-semibold text-foreground">No asset selected yet</p>
                  <p className="mt-2 leading-6 text-muted-foreground">
                    Choose an asset to preview its FFIMS registry information here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

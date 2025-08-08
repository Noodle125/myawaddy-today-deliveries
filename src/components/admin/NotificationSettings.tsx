import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { NotificationSoundSetting, playNotificationPreset, playNotificationSoundFromFile } from "@/utils/notificationSound";

interface SoundOptionBase {
  id: string;
  label: string;
}

type FileOption = SoundOptionBase & { mode: "file"; src: string };

type PresetOption = SoundOptionBase & { mode: "preset"; preset: 'bell' | 'chime' | 'pop' | 'ding' | 'digital' };

const SOUND_OPTIONS: Array<FileOption | PresetOption> = [
  { id: "classic", label: "Classic (file)", mode: "file", src: "/notification.mp3" },
  { id: "bell", label: "Bell", mode: "preset", preset: "bell" },
  { id: "chime", label: "Chime", mode: "preset", preset: "chime" },
  { id: "pop", label: "Pop", mode: "preset", preset: "pop" },
  { id: "ding", label: "Ding", mode: "preset", preset: "ding" },
];

export function NotificationSettings() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string>(SOUND_OPTIONS[0].id);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const selectedOption = useMemo(() => SOUND_OPTIONS.find(o => o.id === selectedId)!, [selectedId]);

  useEffect(() => {
    const loadSetting = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("app_settings")
          .select("value")
          .eq("key", "notification_sound")
          .maybeSingle();

        if (error) {
          console.error("Error loading notification sound setting:", error);
        }

        const val = data?.value as NotificationSoundSetting | undefined;
        if (val) {
          // Map existing setting to one of the options
          if (val.mode === "file") {
            const match = SOUND_OPTIONS.find(o => o.mode === "file" && (o as FileOption).src === val.src);
            setSelectedId(match ? match.id : SOUND_OPTIONS[0].id);
          } else if (val.mode === "preset") {
            const match = SOUND_OPTIONS.find(o => o.mode === "preset" && (o as PresetOption).preset === val.preset);
            setSelectedId(match ? match.id : SOUND_OPTIONS[1].id);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadSetting();
  }, []);

  const handlePreview = async () => {
    try {
      if (selectedOption.mode === "file") {
        await playNotificationSoundFromFile(selectedOption.src);
      } else {
        await playNotificationPreset((selectedOption as PresetOption).preset);
      }
    } catch (e) {
      console.error("Preview error", e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const value =
        selectedOption.mode === "file"
          ? { mode: "file", src: (selectedOption as FileOption).src }
          : { mode: "preset", preset: (selectedOption as PresetOption).preset };

      // Upsert-like behavior (since app_settings may not have a unique key)
      const { data: existing } = await (supabase as any)
        .from("app_settings")
        .select("key")
        .eq("key", "notification_sound")
        .maybeSingle();

      if (existing) {
        const { error } = await (supabase as any)
          .from("app_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", "notification_sound");
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("app_settings")
          .insert({ key: "notification_sound", value });
        if (error) throw error;
      }

      toast({ title: "Saved", description: "Notification sound updated." });
    } catch (error: any) {
      console.error("Save setting error:", error);
      toast({ title: "Error", description: "Could not save setting.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Sound</CardTitle>
        <CardDescription>Select and preview the sound for new order alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          className="grid gap-4 md:grid-cols-2"
          value={selectedId}
          onValueChange={setSelectedId}
          disabled={loading}
        >
          {SOUND_OPTIONS.map((opt) => (
            <div key={opt.id} className="flex items-center space-x-3 rounded-md border p-4">
              <RadioGroupItem value={opt.id} id={`sound-${opt.id}`} />
              <Label htmlFor={`sound-${opt.id}`} className="flex-1 cursor-pointer">
                {opt.label}
              </Label>
              <Button variant="secondary" size="sm" type="button" onClick={async () => {
                setSelectedId(opt.id);
                // Small delay to ensure radio state update
                setTimeout(() => handlePreview(), 10);
              }}>
                Preview
              </Button>
            </div>
          ))}
        </RadioGroup>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" type="button" onClick={handlePreview} disabled={loading}>
            Preview Selected
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

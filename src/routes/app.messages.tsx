import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  Clock,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeading } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStore, ref, specialtyName } from "@/lib/store";
import type { Doctor } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/messages")({
  head: () => ({
    meta: [
      { title: "Messages — MediBook" },
      {
        name: "description",
        content: "Secure messaging with the doctors you have consulted on MediBook.",
      },
      { property: "og:title", content: "Messages — MediBook" },
      {
        property: "og:description",
        content: "Secure messaging with the doctors you have consulted on MediBook.",
      },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { user, messages = [], appointments = [], sendMessage } = useStore();

  const [q, setQ] = useState("");
  const [activeDoctorId, setActiveDoctorId] = useState<string | null>(null);
  const [inputBody, setInputBody] = useState("");
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const patientId = user?.linkedId ?? "pat-1";

  // Eligible Doctors (Doctors the patient has booked/consulted with)
  const eligibleDoctors = useMemo(() => {
    const userApts = (appointments || []).filter((a) => a && a.patientId === patientId);
    const docIds = Array.from(
      new Set([
        ...userApts.map((a) => a.doctorId),
        "doc-3", // Default seed consulted doctor
        "doc-1",
        "doc-7",
      ]),
    );
    return docIds
      .map((id) => (ref.doctors || []).find((d) => d && d.id === id))
      .filter((d): d is Doctor => d !== undefined);
  }, [appointments, patientId]);

  // Set default active doctor if none selected
  const activeDoctor = useMemo(() => {
    if (activeDoctorId) {
      return (
        eligibleDoctors.find((d) => d && d.id === activeDoctorId) ?? eligibleDoctors[0] ?? null
      );
    }
    return eligibleDoctors[0] ?? null;
  }, [activeDoctorId, eligibleDoctors]);

  // Messages for active thread
  const activeThreadMessages = useMemo(() => {
    if (!activeDoctor) return [];
    const threadId = `${activeDoctor.id}-${patientId}`;
    return (messages || []).filter(
      (m) =>
        m &&
        (m.threadId === threadId || (m.doctorId === activeDoctor.id && m.patientId === patientId)),
    );
  }, [activeDoctor, messages, patientId]);

  // Filtered doctor conversation list
  const filteredDoctors = useMemo(() => {
    const query = q.trim().toLowerCase();
    return eligibleDoctors.filter((doc) => {
      if (!doc) return false;
      if (!query) return true;
      const specName = specialtyName(doc.specialtyId);
      return (
        (doc.name || "").toLowerCase().includes(query) ||
        (specName || "").toLowerCase().includes(query)
      );
    });
  }, [eligibleDoctors, q]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDoctor) return;
    if (!inputBody.trim() && !attachedFile) {
      toast.error("Please enter a message.");
      return;
    }

    const messageText = attachedFile
      ? `${inputBody.trim()} [Attachment: ${attachedFile}]`
      : inputBody.trim();

    sendMessage(activeDoctor.id, patientId, "patient", messageText);
    setInputBody("");
    setAttachedFile(null);
    toast.success(
      "Message sent to Dr. " +
        (activeDoctor.name ? (activeDoctor.name.split(" ")[1] ?? activeDoctor.name) : "Doctor"),
    );
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <PageHeading
        eyebrow="MediBook"
        title="Messages"
        subtitle="Secure messaging with the doctors you have consulted on MediBook."
      />

      {/* Main Messaging Interface Container */}
      <div className="surface-panel rounded-3xl border border-border overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] h-[calc(100vh-280px)]">
        {/* CONVERSATION LIST (Left 4 cols desktop, full width mobile when active) */}
        <div
          className={cn(
            "lg:col-span-4 border-r border-border bg-card flex flex-col justify-between",
            showMobileChat ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="p-4 space-y-3 border-b border-border">
            <h3 className="font-bold text-sm text-foreground">Doctor Consultations</h3>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search doctors..."
                className="h-9 pl-9 pr-7 text-xs rounded-xl border-border bg-card"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversation Item Cards */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => {
                const threadId = `${doc.id}-${patientId}`;
                const threadMsgs = (messages || []).filter(
                  (m) =>
                    m &&
                    (m.threadId === threadId ||
                      (m.doctorId === doc.id && m.patientId === patientId)),
                );
                const lastMsg = threadMsgs[threadMsgs.length - 1];
                const isSelected = activeDoctor?.id === doc.id;
                const msgTime = lastMsg?.at
                  ? lastMsg.at.length >= 16
                    ? lastMsg.at.slice(11, 16)
                    : lastMsg.at
                  : "";

                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setActiveDoctorId(doc.id);
                      setShowMobileChat(true);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 p-3.5 text-left transition-colors",
                      isSelected
                        ? "bg-primary-soft/40 border-l-4 border-primary"
                        : "hover:bg-secondary/50",
                    )}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={doc.photo}
                        alt={doc.name}
                        className="h-11 w-11 rounded-2xl object-cover"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-foreground truncate">{doc.name}</h4>
                        {msgTime && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {msgTime}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-primary">
                        {specialtyName(doc.specialtyId)}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {lastMsg ? lastMsg.body : "Click to start conversation"}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <p className="font-semibold">No doctors found</p>
              </div>
            )}
          </div>
        </div>

        {/* CHAT CONVERSATION WINDOW (Right 8 cols desktop, full width mobile when active) */}
        <div
          className={cn(
            "lg:col-span-8 flex flex-col justify-between bg-card/60",
            !showMobileChat ? "hidden lg:flex" : "flex",
          )}
        >
          {activeDoctor ? (
            <>
              {/* Chat Doctor Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMobileChat(false)}
                    className="lg:hidden p-1.5 rounded-xl hover:bg-secondary text-muted-foreground"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <img
                    src={activeDoctor.photo}
                    alt={activeDoctor.name}
                    className="h-10 w-10 rounded-2xl object-cover"
                  />

                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <span>{activeDoctor.name}</span>
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {specialtyName(activeDoctor.specialtyId)} · {activeDoctor.city}
                    </p>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] font-semibold">
                  Consulted Specialist
                </Badge>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                <div className="text-center text-[11px] text-muted-foreground">
                  <span className="bg-secondary/80 px-3 py-1 rounded-full font-semibold">
                    End-to-End Encrypted Consultation Channel
                  </span>
                </div>

                {activeThreadMessages.length > 0 ? (
                  activeThreadMessages.map((msg) => {
                    const isFromMe = msg.from === "patient";
                    const formattedTime = msg.at
                      ? msg.at.length >= 16
                        ? msg.at.slice(11, 16)
                        : msg.at
                      : "";
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col space-y-1 max-w-[80%]",
                          isFromMe ? "ml-auto items-end" : "mr-auto items-start",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs",
                            isFromMe
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-secondary text-secondary-foreground border border-border/80 rounded-bl-none",
                          )}
                        >
                          <p>{msg.body}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium px-1">
                          <span>{formattedTime}</span>
                          {isFromMe && <CheckCheck className="h-3 w-3 text-primary" />}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-xs text-muted-foreground py-10 space-y-2">
                    <MessageSquare className="h-8 w-8 mx-auto text-primary" />
                    <p className="font-bold text-foreground">
                      Start a conversation with {activeDoctor.name}
                    </p>
                    <p className="max-w-xs mx-auto">
                      Ask follow-up questions regarding your medical visit or prescription.
                    </p>
                  </div>
                )}
              </div>

              {/* Chat Composer Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-border bg-card space-y-2"
              >
                {attachedFile && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-primary-soft/50 px-3 py-1 text-xs font-semibold text-primary">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>Attached: {attachedFile}</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    id="chatFileInput"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setAttachedFile(file.name);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("chatFileInput")?.click()}
                    className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <Input
                    type="text"
                    value={inputBody}
                    onChange={(e) => setInputBody(e.target.value)}
                    placeholder={`Message ${activeDoctor.name}...`}
                    className="h-11 rounded-2xl border-border bg-card text-xs flex-1"
                  />

                  <Button
                    type="submit"
                    className="h-11 rounded-2xl px-4 text-xs font-bold bg-primary text-primary-foreground"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-xs text-muted-foreground space-y-2">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
              <p className="font-bold text-foreground text-sm">
                Select a doctor to view conversation
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

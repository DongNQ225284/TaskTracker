import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import api from "../services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleAccept = async () => {
    if (!user) {
      toast.error("Please log in before accepting the invitation");
      navigate("/");
      return;
    }

    setStatus("processing");
    try {
      const response = await api.post("/invitations/accept", { token });
      console.log("Check response:", response.data);
      setStatus("success");
      toast.success("Successfully joined the project!");

      setTimeout(() => {
        const newProjectId = response.data.projectId;
        navigate(`/project/${newProjectId}`);
      }, 1500);
    } catch (error) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Invalid or expired token");
    }
  };

  if (!token) {
    return (
      <div className="p-10 text-center">Invalid link (Missing token).</div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        {status === "idle" && (
          <>
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-blue-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Project Invitation
            </h2>
            <p className="text-gray-500 mb-6">
              You have received an invitation to join a project on Task Tracker.
            </p>
            <Button onClick={handleAccept} className="w-full text-lg py-6">
              Accept Invitation
            </Button>
          </>
        )}

        {status === "processing" && (
          <div className="py-10">
            <Loader2 className="animate-spin w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p>Processing...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-700">Success!</h3>
            <p className="text-gray-500 mt-2">Redirecting to Project...</p>
          </div>
        )}

        {status === "error" && (
          <div className="py-6">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-700">Error</h3>
            <p className="text-gray-500 mt-2">{message}</p>
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="mt-6"
            >
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InviteMemberDialog } from "../InviteMemberDialog";

import {
  MoreHorizontal,
  UserX,
  Shield,
  LogOut,
  Search,
  Filter,
} from "lucide-react";

import { toast } from "sonner";

export default function ProjectMembers({ project, onUpdate }) {
  const { user } = useAuth();
  const isOwner =
    project.ownerId?._id === user._id || project.ownerId === user._id;

  // --- STATES CHO BỘ LỌC ---
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // --- LOGIC LỌC MEMBER ---
  const filteredMembers = project.members.filter((member) => {
    // 1. Tìm theo tên hoặc email
    const nameMatch = member.userId.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const emailMatch = member.userId.email
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const searchMatch = nameMatch || emailMatch;

    // 2. Lọc theo Role
    const roleMatch = roleFilter === "ALL" || member.role === roleFilter;
    return searchMatch && roleMatch;
  });

  // --- Handlers ---
  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === "MEMBER" ? "LEADER" : "MEMBER";
    try {
      await api.patch(`/projects/${project._id}/members/${userId}`, {
        role: newRole,
      });
      toast.success(`Role updated to ${newRole}`);
      onUpdate();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (member) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${member.userId.name} from the project?`
      )
    )
      return;
    try {
      await api.delete(`/projects/${project._id}/members/${member.userId._id}`);
      toast.success("Member removed successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handleLeaveProject = async () => {
    if (!window.confirm("Are you sure you want to leave this project?")) return;
    try {
      await api.post(`/projects/${project._id}/leave`);
      toast.success("You have left the project");
      window.location.href = "/projects";
    } catch (error) {
      toast.error("Failed to leave project");
    }
  };

  return (
    <div className="space-y-4">
      {/* HEADER: Tiêu đề + Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border">
        <div>
          <h3 className="text-lg font-medium">Project Team</h3>
          <p className="text-sm text-gray-500">
            Manage who has access to this project.
          </p>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <InviteMemberDialog
              projectId={project._id}
              projectName={project.name}
            />
          )}
          {!isOwner && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLeaveProject}
            >
              <LogOut className="mr-2 h-4 w-4" /> Leave Project
            </Button>
          )}
        </div>
      </div>

      {/* TOOLBAR: Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px] bg-white">
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3" />
              <SelectValue placeholder="Role" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="OWNER">Owner</SelectItem>
            <SelectItem value="LEADER">Leader</SelectItem>
            <SelectItem value="MEMBER">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead>Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-gray-500"
                >
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => {
                const memberId = member.userId._id;
                const isMe = memberId === user._id;

                return (
                  <TableRow key={memberId}>
                    {/* Avatar + Name */}
                    <TableCell className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.userId.avatarUrl} />
                        <AvatarFallback>
                          {member.userId.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {member.userId.name}{" "}
                        {isMe && (
                          <span className="text-gray-400 font-normal">
                            (You)
                          </span>
                        )}
                      </span>
                    </TableCell>

                    <TableCell className="text-gray-500">
                      {member.userId.email}
                    </TableCell>

                    {/* Role Badge */}
                    <TableCell>
                      <Badge
                        variant={
                          member.role === "OWNER"
                            ? "default"
                            : member.role === "LEADER"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {member.role}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-gray-500">
                      {format(new Date(member.joinedAt), "MMM dd, yyyy")}
                    </TableCell>

                    {/* Actions (Chỉ hiện khi user hiện tại là OWNER và không thao tác lên chính mình) */}
                    <TableCell className="text-right">
                      {isOwner && !isMe ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(memberId, member.role)
                              }
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {member.role === "MEMBER"
                                ? "Promote to Leader"
                                : "Demote to Member"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleRemoveMember(member)}
                            >
                              <UserX className="mr-2 h-4 w-4" /> Remove from
                              Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-gray-300 text-xs italic">
                          No actions
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

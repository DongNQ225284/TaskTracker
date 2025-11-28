import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

// Components
import { CreateProjectDialog } from "../components/CreateProjectDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import { Search, MoreHorizontal, Pencil, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- States cho bộ lọc ---
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  // --- States cho phân trang ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Số dòng mỗi trang

  // Hàm gọi API lấy danh sách
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- Xử lý Logic Lọc (Client-side Filtering) ---
  const filteredProjects = projects.filter((project) => {
    // 1. Lọc theo tên (Search)
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // 2. Lọc theo Role
    let matchesRole = true;
    if (roleFilter === "OWNER") {
      matchesRole = project.ownerId === user._id;
    } else if (roleFilter === "MEMBER") {
      matchesRole = project.ownerId !== user._id;
    }

    // 3. Lọc theo Ngày tạo (Date Range)
    let matchesDate = true;
    const createdDate = new Date(project.createdAt);
    if (dateStart) {
      matchesDate = matchesDate && createdDate >= new Date(dateStart);
    }
    if (dateEnd) {
      // Set giờ là cuối ngày để bao gồm cả ngày đó
      const end = new Date(dateEnd);
      end.setHours(23, 59, 59);
      matchesDate = matchesDate && createdDate <= end;
    }

    return matchesSearch && matchesRole && matchesDate;
  });

  // --- Xử lý Logic Phân trang ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  // Hàm xử lý xóa dự án (Sơ bộ)
  const handleDelete = async (project) => {
    const confirmName = window.prompt(
      `Type "${project.name}" to confirm deletion:`
    );
    if (confirmName !== project.name) {
      return toast.error("Project name does not match.");
    }

    try {
      await api.delete(`/projects/${project._id}`, {
        data: { confirmationName: project.name }, //
      });
      toast.success("Project deleted successfully");
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Projects
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and track your team projects.
          </p>
        </div>
        <CreateProjectDialog onProjectCreated={fetchProjects} />
      </div>

      {/* --- TOOLBAR (Filter & Search) --- */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3" />
                <SelectValue placeholder="Role" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
              <SelectItem value="MEMBER">Member</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Inputs (Dùng HTML native cho đơn giản) */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-auto"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
            <span className="text-gray-400">-</span>
            <Input
              type="date"
              className="w-auto"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>

          {/* Reset Button */}
          {(searchTerm || roleFilter !== "ALL" || dateStart || dateEnd) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("ALL");
                setDateStart("");
                setDateEnd("");
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="w-[300px]">Project Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-gray-500"
                >
                  Loading projects...
                </TableCell>
              </TableRow>
            ) : currentProjects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-32 text-gray-500"
                >
                  No projects found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              currentProjects.map((project) => {
                const isOwner = project.ownerId === user._id;
                return (
                  <TableRow
                    key={project._id}
                    className="group hover:bg-gray-50"
                  >
                    {/* Project Name */}
                    <TableCell className="font-medium">
                      <div
                        className="flex flex-col cursor-pointer hover:underline decoration-indigo-500 underline-offset-4"
                        onClick={() => navigate(`/project/${project._id}`)}
                      >
                        <span className="text-base text-gray-900">
                          {project.name}
                        </span>
                        <span className="text-xs text-gray-400 font-normal line-clamp-1">
                          {project.description || "No description"}
                        </span>
                      </div>
                    </TableCell>

                    {/* Role Badge */}
                    <TableCell>
                      <Badge
                        variant={isOwner ? "default" : "secondary"}
                        className={
                          isOwner
                            ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                            : ""
                        }
                      >
                        {isOwner ? "OWNER" : "MEMBER"}
                      </Badge>
                    </TableCell>

                    {/* Members Avatar Stack */}
                    <TableCell>
                      <div className="flex -space-x-2 overflow-hidden">
                        {project.members.slice(0, 4).map((m, i) => (
                          <Avatar
                            key={i}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white border border-gray-200 bg-white"
                          >
                            <AvatarImage src={m.userId.avatarUrl} />
                            <AvatarFallback className="text-[10px] bg-gray-100 text-gray-500">
                              {m.userId.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.members.length > 4 && (
                          <div className="h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 z-10">
                            +{project.members.length - 4}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-gray-500">
                      {format(new Date(project.createdAt), "MMM dd, yyyy")}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="text-right">
                      {isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                toast.info("Edit feature coming soon!")
                              }
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDelete(project)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- PAGINATION --- */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 items-center">
          <span className="text-sm text-gray-500 mr-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Projects;

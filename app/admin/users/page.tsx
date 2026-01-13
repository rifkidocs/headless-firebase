"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Users as UsersIcon,
  MoreVertical,
  Trash2,
  Loader2,
  UserPlus,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { UserProfile, Role } from "@/lib/types";
import clsx from "clsx";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    user: UserProfile | null;
  }>({
    open: false,
    user: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Fetch users
  useEffect(() => {
    const q = query(collection(db, "_users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLogin: doc.data().lastLogin?.toDate() || new Date(),
      })) as UserProfile[];
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch roles
  useEffect(() => {
    const q = query(collection(db, "_roles"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Role[];
      setRoles(data);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (user: UserProfile) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "_users", user.id));
      toast.success("User removed from CMS access");
      setDeleteDialog({ open: false, user: null });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleChange = async (userId: string, roleId: string) => {
    try {
      await updateDoc(doc(db, "_users", userId), { roleId });
      toast.success("User role updated");
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
            Users
          </h1>
          <p className='text-gray-500 mt-1 text-sm'>
            Manage user access and roles for the CMS.
          </p>
        </div>
        <button
          className='inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20'
          onClick={() => toast.info("User invitation coming soon!")}>
          <UserPlus className='w-4 h-4' />
          Invite User
        </button>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        {users.length === 0 ? (
          <div className='p-16 flex flex-col items-center justify-center text-center'>
            <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4'>
              <UsersIcon className='w-8 h-8 text-gray-300' />
            </div>
            <h3 className='text-lg font-semibold text-gray-900 mb-1'>
              No users yet
            </h3>
            <p className='text-gray-500 max-w-xs mb-6'>
              Users will appear here after they log in to the CMS.
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    User
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Role
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Last Login
                  </th>
                  <th className='px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold'>
                          {user.displayName?.charAt(0) ||
                            user.email?.charAt(0) ||
                            "?"}
                        </div>
                        <div>
                          <p className='font-medium text-gray-900'>
                            {user.displayName || "Unnamed User"}
                          </p>
                          <p className='text-sm text-gray-500'>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <Select
                        onValueChange={(val) => handleRoleChange(user.id, val)}
                        value={user.roleId || "none"}>
                        <SelectTrigger className="w-[180px] h-9">
                          <SelectValue placeholder="No Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Role</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={clsx(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          user.isActive !== false
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        )}>
                        {user.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500'>
                      {user.lastLogin?.toLocaleDateString() || "Never"}
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg'>
                            <MoreVertical className='w-4 h-4' />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className='min-w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50'
                            sideOffset={5}>
                            <DropdownMenu.Item
                              className='flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer outline-none'
                              onClick={() =>
                                setDeleteDialog({ open: true, user })
                              }>
                              <Trash2 className='w-4 h-4' />
                              Remove Access
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, user: open ? deleteDialog.user : null })
        }
        title='Remove User Access'
        description={`Are you sure you want to remove "${
          deleteDialog.user?.displayName || deleteDialog.user?.email
        }" from the CMS? They will no longer be able to access the admin panel.`}
        confirmText='Remove'
        variant='danger'
        onConfirm={() => {
          if (deleteDialog.user) {
            handleDelete(deleteDialog.user);
          }
        }}
        loading={deleting}
      />
    </div>
  );
}
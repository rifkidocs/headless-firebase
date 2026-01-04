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
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Shield,
  Plus,
  Trash2,
  Loader2,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Role, CollectionConfig } from "@/lib/types";
import clsx from "clsx";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [collections, setCollections] = useState<CollectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    role: Role | null;
  }>({
    open: false,
    role: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [initialized, setInitialized] = useState(false);
  const [expandedCollections, setExpandedCollections] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const q = query(collection(db, "_roles"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Role[];
      setRoles(data);
      if (data.length > 0 && !initialized) {
        setSelectedRole(data[0]);
        setInitialized(true);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [initialized]);

  // Fetch collections for permissions
  useEffect(() => {
    const q = query(collection(db, "_collections"), orderBy("label"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        slug: doc.id,
        ...doc.data(),
      })) as CollectionConfig[];
      setCollections(data);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      await addDoc(collection(db, "_roles"), {
        name: newRole.name,
        description: newRole.description,
        permissions: {},
        isDefault: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Role created successfully");
      setShowNewRole(false);
      setNewRole({ name: "", description: "" });
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("Failed to create role");
    }
  };

  const handleDeleteRole = async (role: Role) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "_roles", role.id));
      toast.success("Role deleted successfully");
      setDeleteDialog({ open: false, role: null });
      if (selectedRole?.id === role.id) {
        setSelectedRole(roles.find((r) => r.id !== role.id) || null);
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast.error("Failed to delete role");
    } finally {
      setDeleting(false);
    }
  };

  const handlePermissionChange = async (
    roleId: string,
    contentType: string,
    permission: string,
    value: boolean
  ) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;

    const updatedPermissions = {
      ...role.permissions,
      [contentType]: {
        ...role.permissions[contentType],
        [permission]: value,
      },
    };

    try {
      await updateDoc(doc(db, "_roles", roleId), {
        permissions: updatedPermissions,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating permission:", error);
      toast.error("Failed to update permission");
    }
  };

  const handleRenameRole = async (roleId: string) => {
    if (!newRoleName.trim()) {
      setEditingRole(null);
      return;
    }

    try {
      await updateDoc(doc(db, "_roles", roleId), {
        name: newRoleName,
        updatedAt: serverTimestamp(),
      });
      toast.success("Role renamed successfully");
      setEditingRole(null);
    } catch (error) {
      console.error("Error renaming role:", error);
      toast.error("Failed to rename role");
    }
  };

  const toggleCollection = (slug: string) => {
    setExpandedCollections((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
            Roles & Permissions
          </h1>
          <p className='text-gray-500 mt-1 text-sm'>
            Configure access levels and permissions for different user roles.
          </p>
        </div>
        <button
          onClick={() => setShowNewRole(true)}
          className='inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm shadow-blue-600/20'>
          <Plus className='w-4 h-4' />
          Create Role
        </button>
      </div>

      <div className='flex gap-6'>
        {/* Roles List */}
        <div className='w-72 shrink-0'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='p-4 border-b border-gray-200 bg-gray-50/50'>
              <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                Roles
              </p>
            </div>
            <div className='divide-y divide-gray-100'>
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={clsx(
                    "flex items-center justify-between p-4 cursor-pointer transition-colors group",
                    selectedRole?.id === role.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  )}>
                  <div className='flex items-center gap-3'>
                    <Shield
                      className={clsx(
                        "w-5 h-5",
                        selectedRole?.id === role.id
                          ? "text-blue-600"
                          : "text-gray-400"
                      )}
                    />
                    {editingRole === role.id ? (
                      <input
                        type='text'
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        onBlur={() => handleRenameRole(role.id)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleRenameRole(role.id)
                        }
                        className='px-2 py-1 text-sm border border-gray-300 rounded'
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className={clsx(
                          "font-medium",
                          selectedRole?.id === role.id
                            ? "text-blue-700"
                            : "text-gray-900"
                        )}>
                        {role.name}
                      </span>
                    )}
                  </div>
                  {!role.isDefault && (
                    <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100'>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRole(role.id);
                          setNewRoleName(role.name);
                        }}
                        className='p-1 text-gray-400 hover:text-gray-600'>
                        <Edit2 className='w-3 h-3' />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDialog({ open: true, role });
                        }}
                        className='p-1 text-gray-400 hover:text-red-500'>
                        <Trash2 className='w-3 h-3' />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* New Role Form */}
              {showNewRole && (
                <div className='p-4 bg-blue-50 border-t border-blue-100'>
                  <input
                    type='text'
                    value={newRole.name}
                    onChange={(e) =>
                      setNewRole({ ...newRole, name: e.target.value })
                    }
                    placeholder='Role name'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-2'
                    autoFocus
                  />
                  <input
                    type='text'
                    value={newRole.description}
                    onChange={(e) =>
                      setNewRole({ ...newRole, description: e.target.value })
                    }
                    placeholder='Description (optional)'
                    className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-3'
                  />
                  <div className='flex gap-2'>
                    <button
                      onClick={handleCreateRole}
                      className='flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg'>
                      <Check className='w-4 h-4' />
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewRole(false);
                        setNewRole({ name: "", description: "" });
                      }}
                      className='px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50'>
                      <X className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Permissions Panel */}
        <div className='flex-1'>
          {selectedRole ? (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
              <div className='p-6 border-b border-gray-200'>
                <h2 className='text-lg font-semibold text-gray-900'>
                  {selectedRole.name}
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                  {selectedRole.description ||
                    "Configure permissions for this role"}
                </p>
              </div>

              <div className='divide-y divide-gray-100'>
                {collections.map((col) => {
                  const isExpanded = expandedCollections[col.slug];
                  const permissions = selectedRole.permissions[col.slug] || {};

                  return (
                    <div key={col.slug}>
                      <button
                        onClick={() => toggleCollection(col.slug)}
                        className='w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors'>
                        <div className='flex items-center gap-3'>
                          {isExpanded ? (
                            <ChevronDown className='w-4 h-4 text-gray-400' />
                          ) : (
                            <ChevronRight className='w-4 h-4 text-gray-400' />
                          )}
                          <span className='font-medium text-gray-900'>
                            {col.label}
                          </span>
                          <span className='text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded'>
                            {col.slug}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className='px-6 pb-4 pl-12'>
                          <div className='grid grid-cols-5 gap-4'>
                            {[
                              "create",
                              "read",
                              "update",
                              "delete",
                              "publish",
                            ].map((perm) => (
                              <label
                                key={perm}
                                className='flex items-center gap-2 cursor-pointer'>
                                <input
                                  type='checkbox'
                                  checked={
                                    !!(permissions as Record<string, boolean>)[
                                      perm
                                    ]
                                  }
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      selectedRole.id,
                                      col.slug,
                                      perm,
                                      e.target.checked
                                    )
                                  }
                                  className='w-4 h-4 text-blue-600 rounded border-gray-300'
                                />
                                <span className='text-sm text-gray-700 capitalize'>
                                  {perm}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {collections.length === 0 && (
                  <div className='p-12 text-center text-gray-500'>
                    <p>No content types defined yet.</p>
                    <p className='text-sm mt-1'>
                      Create content types to configure permissions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center'>
              <Shield className='w-12 h-12 mx-auto mb-3 text-gray-300' />
              <p className='text-gray-500'>
                Select a role to configure permissions
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, role: open ? deleteDialog.role : null })
        }
        title='Delete Role'
        description={`Are you sure you want to delete "${deleteDialog.role?.name}"? Users with this role will lose their permissions.`}
        confirmText='Delete'
        variant='danger'
        onConfirm={() => {
          if (deleteDialog.role) {
            handleDeleteRole(deleteDialog.role);
          }
        }}
        loading={deleting}
      />
    </div>
  );
}

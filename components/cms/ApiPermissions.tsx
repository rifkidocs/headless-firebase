"use client";

import { useState, useEffect } from "react";
import { CollectionConfig } from "@/lib/types";
import {
  PublicPermissions,
  getPublicPermissions,
  updatePublicPermissions,
} from "@/lib/permissions";
import { Loader2, Save, ChevronDown, ChevronRight, Shield } from "lucide-react";
import { toast } from "@/components/ui/Toast";
import clsx from "clsx";

interface ApiPermissionsProps {
  collections: CollectionConfig[];
}

export default function ApiPermissions({ collections }: ApiPermissionsProps) {
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, PublicPermissions>>({});
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadPermissions() {
      setLoading(true);
      const perms: Record<string, PublicPermissions> = {};
      for (const col of collections) {
        perms[col.slug] = await getPublicPermissions(col.slug);
      }
      setPermissions(perms);
      setLoading(false);
    }
    loadPermissions();
  }, [collections]);

  const toggleCollection = (slug: string) => {
    setExpandedCollections((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const handlePermissionChange = (
    slug: string,
    action: keyof PublicPermissions,
    value: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        [action]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const slug in permissions) {
        await updatePublicPermissions(slug, permissions[slug]);
      }
      toast.success("Permissions updated successfully");
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-12' role="status">
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900'>Public API Access</h2>
          <p className='text-sm text-gray-500'>
            Configure which actions are available to unauthenticated users.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className='inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors'>
          {saving ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Save className='w-4 h-4' />
          )}
          Save Permissions
        </button>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <div className='divide-y divide-gray-100'>
          {collections.map((col) => {
            const isExpanded = expandedCollections[col.slug];
            const colPermissions = permissions[col.slug] || {
              find: false,
              findOne: false,
              create: false,
              update: false,
              delete: false,
            };

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
                    <span className='font-medium text-gray-900'>{col.label}</span>
                    <span className='text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded'>
                      {col.slug}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className='px-6 pb-4 pl-12'>
                    <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                      {(Object.keys(colPermissions) as Array<keyof PublicPermissions>).map(
                        (action) => (
                          <label
                            key={action}
                            className='flex items-center gap-2 cursor-pointer'>
                            <input
                              type='checkbox'
                              checked={colPermissions[action]}
                              onChange={(e) =>
                                handlePermissionChange(col.slug, action, e.target.checked)
                              }
                              className='w-4 h-4 text-blue-600 rounded border-gray-300'
                            />
                            <span className='text-sm text-gray-700 capitalize'>
                              {action}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {collections.length === 0 && (
            <div className='p-12 text-center text-gray-500'>
              <p>No content types defined yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import Link from "next/link";
import {
  Database,
  Image,
  Users,
  FileText,
  Plus,
  ArrowRight,
  Loader2,
  Clock,
  TrendingUp,
  Box,
  Component,
} from "lucide-react";
import clsx from "clsx";

interface CollectionConfig {
  id: string;
  slug: string;
  label: string;
  kind: string;
}

interface ContentStat {
  slug: string;
  label: string;
  count: number;
}

interface RecentEntry {
  id: string;
  collection: string;
  collectionLabel: string;
  title: string;
  updatedAt: Date;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionConfig[]>([]);
  const [contentStats, setContentStats] = useState<ContentStat[]>([]);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [mediaCount, setMediaCount] = useState(0);
  const [componentCount, setComponentCount] = useState(0);

  useEffect(() => {
    // Fetch collections
    const colQuery = query(collection(db, "_collections"), orderBy("label"));
    const unsubscribeCols = onSnapshot(colQuery, async (snapshot) => {
      const cols = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CollectionConfig[];
      setCollections(cols);

      // Fetch stats for each collection
      const stats: ContentStat[] = [];
      for (const col of cols.filter((c) => c.kind !== "singleType")) {
        try {
          const colDocs = await getDocs(collection(db, col.slug));
          stats.push({
            slug: col.slug,
            label: col.label,
            count: colDocs.size,
          });
        } catch {
          stats.push({ slug: col.slug, label: col.label, count: 0 });
        }
      }
      setContentStats(stats);
      setLoading(false);
    });

    // Fetch media count
    const mediaQuery = query(collection(db, "_media"));
    const unsubscribeMedia = onSnapshot(mediaQuery, (snapshot) => {
      setMediaCount(snapshot.size);
    });

    // Fetch component count
    const compQuery = query(collection(db, "_components"));
    const unsubscribeComps = onSnapshot(compQuery, (snapshot) => {
      setComponentCount(snapshot.size);
    });

    return () => {
      unsubscribeCols();
      unsubscribeMedia();
      unsubscribeComps();
    };
  }, []);

  // Fetch recent entries from all collections
  useEffect(() => {
    if (collections.length === 0) return;

    const fetchRecent = async () => {
      const entries: RecentEntry[] = [];
      for (const col of collections
        .filter((c) => c.kind !== "singleType")
        .slice(0, 5)) {
        try {
          const recentQuery = query(
            collection(db, col.slug),
            orderBy("updatedAt", "desc"),
            limit(2)
          );
          const snapshot = await getDocs(recentQuery);
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            entries.push({
              id: doc.id,
              collection: col.slug,
              collectionLabel: col.label,
              title: data.title || data.name || doc.id,
              updatedAt: data.updatedAt?.toDate() || new Date(),
            });
          });
        } catch {
          // Skip if collection doesn't exist or has no updatedAt field
        }
      }
      entries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      setRecentEntries(entries.slice(0, 5));
    };

    fetchRecent();
  }, [collections]);

  const totalEntries = contentStats.reduce((sum, stat) => sum + stat.count, 0);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto'>
      {/* Welcome Section */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>
          Dashboard
        </h1>
        <p className='text-gray-500 mt-1'>
          Welcome back,{" "}
          {auth.currentUser?.displayName || auth.currentUser?.email || "Admin"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8'>
        <StatCard
          icon={Database}
          label='Total Entries'
          value={totalEntries}
          color='blue'
          href='/admin/schema'
        />
        <StatCard
          icon={Box}
          label='Content Types'
          value={collections.filter((c) => c.kind !== "singleType").length}
          color='indigo'
          href='/admin/schema'
        />
        <StatCard
          icon={Image}
          label='Media Files'
          value={mediaCount}
          color='emerald'
          href='/admin/media'
        />
        <StatCard
          icon={Component}
          label='Components'
          value={componentCount}
          color='amber'
          href='/admin/components'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Content Stats */}
        <div className='lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-5 border-b border-gray-200 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-blue-50'>
                <TrendingUp className='w-5 h-5 text-blue-600' />
              </div>
              <h2 className='text-base font-semibold text-gray-900'>
                Content Overview
              </h2>
            </div>
            <Link
              href='/admin/schema'
              className='text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1'>
              Manage Types
              <ArrowRight className='w-4 h-4' />
            </Link>
          </div>
          <div className='p-5'>
            {contentStats.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <Database className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                <p className='mb-2'>No content types defined yet</p>
                <Link
                  href='/admin/schema/new'
                  className='text-blue-600 hover:text-blue-700 text-sm font-medium'>
                  Create your first content type →
                </Link>
              </div>
            ) : (
              <div className='space-y-3'>
                {contentStats.map((stat) => (
                  <Link
                    key={stat.slug}
                    href={`/admin/${stat.slug}`}
                    className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center'>
                        <FileText className='w-5 h-5 text-gray-500' />
                      </div>
                      <span className='font-medium text-gray-900'>
                        {stat.label}
                      </span>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='text-sm text-gray-500'>
                        {stat.count} entries
                      </span>
                      <ArrowRight className='w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity' />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-5 border-b border-gray-200 flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-indigo-50'>
              <Clock className='w-5 h-5 text-indigo-600' />
            </div>
            <h2 className='text-base font-semibold text-gray-900'>
              Recent Activity
            </h2>
          </div>
          <div className='p-5'>
            {recentEntries.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <Clock className='w-10 h-10 mx-auto mb-2 text-gray-300' />
                <p className='text-sm'>No recent activity</p>
              </div>
            ) : (
              <div className='space-y-4'>
                {recentEntries.map((entry) => (
                  <Link
                    key={`${entry.collection}-${entry.id}`}
                    href={`/admin/${entry.collection}/${entry.id}`}
                    className='block group'>
                    <div className='flex items-start gap-3'>
                      <div className='w-2 h-2 rounded-full bg-blue-500 mt-2' />
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors'>
                          {entry.title}
                        </p>
                        <p className='text-xs text-gray-500 mt-0.5'>
                          {entry.collectionLabel} •{" "}
                          {formatRelativeTime(entry.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-4'>
        <QuickAction
          icon={Plus}
          title='Create Content Type'
          description='Define a new content structure'
          href='/admin/schema/new'
          color='blue'
        />
        <QuickAction
          icon={Image}
          title='Upload Media'
          description='Add images, videos, or files'
          href='/admin/media'
          color='emerald'
        />
        <QuickAction
          icon={Users}
          title='Manage Users'
          description='Add or edit user accounts'
          href='/admin/users'
          color='indigo'
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "blue" | "indigo" | "emerald" | "amber";
  href: string;
}

function StatCard({ icon: Icon, label, value, color, href }: StatCardProps) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <Link
      href={href}
      className='bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group'>
      <div className='flex items-center gap-4'>
        <div className={clsx("p-3 rounded-xl", colorMap[color])}>
          <Icon className='w-6 h-6' />
        </div>
        <div>
          <p className='text-2xl font-bold text-gray-900'>{value}</p>
          <p className='text-sm text-gray-500'>{label}</p>
        </div>
      </div>
    </Link>
  );
}

interface QuickActionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  color: "blue" | "indigo" | "emerald";
}

function QuickAction({
  icon: Icon,
  title,
  description,
  href,
  color,
}: QuickActionProps) {
  const colorMap = {
    blue: "group-hover:bg-blue-50 group-hover:text-blue-600",
    indigo: "group-hover:bg-indigo-50 group-hover:text-indigo-600",
    emerald: "group-hover:bg-emerald-50 group-hover:text-emerald-600",
  };

  return (
    <Link
      href={href}
      className='group flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all'>
      <div
        className={clsx(
          "p-3 rounded-xl bg-gray-100 text-gray-600 transition-colors",
          colorMap[color]
        )}>
        <Icon className='w-5 h-5' />
      </div>
      <div>
        <p className='font-semibold text-gray-900'>{title}</p>
        <p className='text-sm text-gray-500'>{description}</p>
      </div>
    </Link>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

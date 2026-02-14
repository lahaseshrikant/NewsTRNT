"use client";

import React from "react";
import Link from "next/link";
import Breadcrumb from "@/components/layout/Breadcrumb";
import UnifiedAdminGuard from "@/components/auth/UnifiedAdminGuard";

const ContentHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
        <Breadcrumb 
          items={[
            { label: "Admin Dashboard", href: "/admin" },
            { label: "Content Management" }
          ]} 
          className="mb-6" 
        />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">📚 Content Management</h1>
          <p className="text-xl text-muted-foreground">
            Manage all your content from articles and stories to categories and media
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Link
            href="/content/new"
            className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
          >
            <span className="text-2xl mb-2">✨</span>
            <span className="font-medium text-center text-sm">Create Article</span>
          </Link>
          
          <Link
            href="/content/articles"
            className="flex flex-col items-center p-4 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all transform hover:scale-105"
          >
            <span className="text-2xl mb-2">📰</span>
            <span className="font-medium text-center text-sm">Articles</span>
          </Link>
          
          <Link
            href="/content/web-stories"
            className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105"
          >
            <span className="text-2xl mb-2">📱</span>
            <span className="font-medium text-center text-sm">Web Stories</span>
          </Link>
          
          <Link
            href="/content/categories"
            className="flex flex-col items-center p-4 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105"
          >
            <span className="text-2xl mb-2">📁</span>
            <span className="font-medium text-center text-sm">Categories</span>
          </Link>
          
          <Link
            href="/media"
            className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105"
          >
            <span className="text-2xl mb-2">🖼️</span>
            <span className="font-medium text-center text-sm">Media</span>
          </Link>
          
          <Link
            href="/content/trash"
            className="flex flex-col items-center p-4 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105"
          >
            <span className="text-2xl mb-2">🗑️</span>
            <span className="font-medium text-center text-sm">Trash</span>
          </Link>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/content/articles"
            className="bg-card border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl"></span>
              <h3 className="text-xl font-bold">Articles Management</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Create, edit, and manage all your news articles and blog posts
            </p>
            <div className="bg-indigo-500 text-white px-4 py-2 rounded text-center">
              Manage Articles
            </div>
          </Link>

          <Link
            href="/content/web-stories"
            className="bg-card border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl"></span>
              <h3 className="text-xl font-bold">Web Stories</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Create and manage immersive visual stories for mobile users
            </p>
            <div className="bg-purple-500 text-white px-4 py-2 rounded text-center">
              Manage Stories
            </div>
          </Link>

          <Link
            href="/content/categories"
            className="bg-card border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl"></span>
              <h3 className="text-xl font-bold">Categories</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Organize your content with categories and tags
            </p>
            <div className="bg-green-500 text-white px-4 py-2 rounded text-center">
              Manage Categories
            </div>
          </Link>

          <Link
            href="/media"
            className="bg-card border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl"></span>
              <h3 className="text-xl font-bold">Media Library</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Upload and manage images, videos, and other media assets
            </p>
            <div className="bg-orange-500 text-white px-4 py-2 rounded text-center">
              Open Media Library
            </div>
          </Link>

          <Link
            href="/content/trash"
            className="bg-card border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl"></span>
              <h3 className="text-xl font-bold">Trash</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              View and restore deleted content
            </p>
            <div className="bg-red-500 text-white px-4 py-2 rounded text-center">
              View Trash
            </div>
          </Link>

          <Link
            href="/analytics/content"
            className="bg-card border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl"></span>
              <h3 className="text-xl font-bold">Analytics</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Monitor content performance and engagement metrics
            </p>
            <div className="bg-indigo-500 text-white px-4 py-2 rounded text-center">
              View Analytics
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function AdminContentPage() {
  return (
    <UnifiedAdminGuard>
      <ContentHub />
    </UnifiedAdminGuard>
  );
}


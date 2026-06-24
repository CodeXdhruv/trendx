"use client";
import ResearchProgress from "@/components/ResearchProgress";

export default function ResearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Research Progress</h1>
      <ResearchProgress />
    </div>
  );
}

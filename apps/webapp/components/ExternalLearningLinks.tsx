"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getStudentExternalLearningLinks, type ExternalLearningLink } from "@/lib/externalLearningLinks";

export function ExternalLearningLinks() {
  const [links, setLinks] = useState<ExternalLearningLink[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { session } = await getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { links: fetched } = await getStudentExternalLearningLinks(session.user.id);
      setLinks(fetched);
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !links || links.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-3">External Learning Platforms</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
          >
            <span className="text-sm font-medium text-gray-900">{link.label}</span>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </a>
        ))}
      </div>
    </div>
  );
}

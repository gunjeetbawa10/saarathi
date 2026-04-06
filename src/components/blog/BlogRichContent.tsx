"use client";

import { RichText } from "@graphcms/rich-text-react-renderer";
import type { RichTextContent } from "@graphcms/rich-text-types";

export function BlogRichContent({ content }: { content: RichTextContent }) {
  return (
    <div className="blog-rich-text max-w-none">
      <RichText content={content} />
    </div>
  );
}

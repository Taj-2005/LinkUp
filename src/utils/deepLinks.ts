export function generateDeepLink(
  linkId: string,
  type: "comment" | "reply" | "like" | "save",
  commentId?: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _replyId?: string
): string {
  if (type === "comment" && commentId) {
    return `/livelinks?link=${encodeURIComponent(linkId)}#comment-${encodeURIComponent(commentId)}`;
  }
  if (type === "reply" && commentId) {
    return `/livelinks?link=${encodeURIComponent(linkId)}#comment-${encodeURIComponent(commentId)}`;
  }

  return `/livelinks?link=${encodeURIComponent(linkId)}`;
}

export function normalizeDeepLink(deepLink: string): string {
  if (deepLink.startsWith('http://') || deepLink.startsWith('https://')) {
    try {
      const url = new URL(deepLink);
      return url.pathname + url.search + url.hash;
    } catch {
    }
  }

  if (!deepLink.startsWith('/')) {
    return '/' + deepLink;
  }

  return deepLink;
}

export function toAbsoluteDeepLink(deepLink: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  
  if (deepLink.startsWith('http://') || deepLink.startsWith('https://')) {
    return deepLink;
  }

  const normalized = deepLink.startsWith('/') ? deepLink : '/' + deepLink;
  
  return base + normalized;
}

export function parseDeepLink(url: string): {
  linkId?: string;
  commentId?: string;
  replyId?: string;
} {
  try {
    const urlObj = typeof window !== 'undefined' 
      ? new URL(url, window.location.origin)
      : new URL(url.startsWith('http') ? url : `https://example.com${url}`);
    
    const linkId = urlObj.searchParams.get("link") || undefined;
    const hash = urlObj.hash;

    let commentId: string | undefined;
    let replyId: string | undefined;

    if (hash) {
      const commentMatch = hash.match(/^#comment-(.+)$/);
      if (commentMatch) {
        commentId = decodeURIComponent(commentMatch[1]);
      }

      const replyMatch = hash.match(/^#reply-(.+)$/);
      if (replyMatch) {
        replyId = decodeURIComponent(replyMatch[1]);
      }
    }

    return { 
      linkId: linkId ? decodeURIComponent(linkId) : undefined, 
      commentId, 
      replyId 
    };
  } catch {
    return {};
  }
}

export function scrollToComment(commentId: string, highlightDuration = 2000): boolean {
  const element = document.querySelector(`[data-comment-id="${commentId}"]`) as HTMLElement;
  if (element) {

    requestAnimationFrame(() => {

      const scrollContainer = element.closest('.overflow-y-auto, .overflow-auto, [style*="overflow"]') as HTMLElement;

      if (scrollContainer) {

        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop + (elementRect.top - containerRect.top) - (containerRect.height / 2) + (elementRect.height / 2);

        scrollContainer.scrollTo({
          top: scrollTop,
          behavior: "smooth"
        });
      } else {

        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      element.classList.add("comment-highlight");

      setTimeout(() => {
        element.classList.remove("comment-highlight");
      }, highlightDuration);
    });

    return true;
  }

  return false;
}

export function scrollToReply(replyId: string, highlightDuration = 2000): boolean {
  const element = document.querySelector(`[data-reply-id="${replyId}"]`) as HTMLElement;
  if (element) {

    requestAnimationFrame(() => {

      const scrollContainer = element.closest('.overflow-y-auto, .overflow-auto, [style*="overflow"]') as HTMLElement;

      if (scrollContainer) {

        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop + (elementRect.top - containerRect.top) - (containerRect.height / 2) + (elementRect.height / 2);

        scrollContainer.scrollTo({
          top: scrollTop,
          behavior: "smooth"
        });
      } else {

        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      element.classList.add("reply-highlight");

      setTimeout(() => {
        element.classList.remove("reply-highlight");
      }, highlightDuration);
    });

    return true;
  }

  return false;
}

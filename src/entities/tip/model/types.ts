export type DailyTipWithBookmark = {
  id: string;
  category: string;
  title: string;
  content: string;
  codeSnippet: string | null;
  referenceUrl: string | null;
  tipDate: string;
  isBookmarked: boolean;
};

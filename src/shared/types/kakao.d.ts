interface KakaoShareFeedContent {
  title: string;
  description?: string;
  imageUrl?: string;
  link: {
    mobileWebUrl: string;
    webUrl: string;
  };
}

interface KakaoShareButton {
  title: string;
  link: {
    mobileWebUrl: string;
    webUrl: string;
  };
}

interface KakaoShareFeedOptions {
  objectType: "feed";
  content: KakaoShareFeedContent;
  buttons?: KakaoShareButton[];
}

interface KakaoShareCustomOptions {
  templateId: number;
  templateArgs?: Record<string, string>;
}

interface KakaoShare {
  sendDefault(options: KakaoShareFeedOptions): void;
  sendCustom(options: KakaoShareCustomOptions): void;
}

interface KakaoStatic {
  init(key: string): void;
  isInitialized(): boolean;
  Share: KakaoShare;
}

declare global {
  interface Window {
    Kakao: KakaoStatic;
  }
}

export {};

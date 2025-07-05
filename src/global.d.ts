declare global {
  interface Window {
    _navigate_slide: (index: number) => void;
    _total_slides: {
      count: number;
      title: string;
    };
  }
}

export {};

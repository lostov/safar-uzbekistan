// Chiziqli ikonkalar (24×24, stroke). Kanvasdagi dizayn bilan bir xil to‘plam.
const P: Record<string, string> = {
  "home": "<path d=\"M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z\"/>",
  "grad": "<path d=\"M22 9 12 4 2 9l10 5 10-5z\"/><path d=\"M6 11v5c3 2 9 2 12 0v-5\"/>",
  "shield": "<path d=\"M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z\"/><path d=\"m9 12 2 2 4-4\"/>",
  "user": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6\"/>",
  "phone": "<path d=\"M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z\"/>",
  "pin": "<path d=\"M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/>",
  "search": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-3.5-3.5\"/>",
  "brief": "<rect x=\"3\" y=\"7\" width=\"18\" height=\"13\" rx=\"2\"/><path d=\"M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18\"/>",
  "scale": "<path d=\"M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z\"/>",
  "alert": "<path d=\"M12 3 2 20h20z\"/><path d=\"M12 10v4M12 17h.01\"/>",
  "check": "<path d=\"m5 12 5 5 9-10\"/>",
  "chev": "<path d=\"m9 6 6 6-6 6\"/>",
  "globe": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18\"/>",
  "bank": "<path d=\"M3 21h18M5 21V10M19 21V10M9 21v-6h6v6M2 10l10-6 10 6z\"/>",
  "doc": "<rect x=\"5\" y=\"3\" width=\"14\" height=\"18\" rx=\"2\"/><path d=\"M9 8h6M9 12h6M9 16h4\"/>",
  "qr": "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/><path d=\"M14 14h3v3h-3zM20 14v1M14 20h1M17 20h4v-3\"/>",
  "cloud": "<circle cx=\"8\" cy=\"8\" r=\"3\"/><path d=\"M8 2v1M2 8h1M3.8 3.8l.7.7M17 19H8a4 4 0 1 1 1.5-7.7A5 5 0 0 1 19 13a3 3 0 0 1-2 6z\"/>",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>",
  "users": "<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2 20c1-3.5 3.8-5 7-5s6 1.5 7 5\"/><path d=\"M16 4.5a3.5 3.5 0 0 1 0 7M18 15c2 .7 3.3 2.3 4 5\"/>",
  "heart": "<path d=\"M12 20s-8-4.5-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 10-8 10z\"/>",
  "bell": "<path d=\"M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z\"/><path d=\"M10 21h4\"/>",
  "lang": "<path d=\"M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M11 5c0 4-3 7-6 8M13 21l4-9 4 9M14.5 18h5\"/>",
  "flag": "<path d=\"M5 21V4h11l-2 4 2 4H5\"/>",
  "award": "<circle cx=\"12\" cy=\"9\" r=\"6\"/><path d=\"M8.5 14 7 22l5-3 5 3-1.5-8\"/>",
  "plane": "<path d=\"M2 16l20-8-7 13-3-6z\"/><path d=\"M12 15 22 8\"/>",
  "offline": "<path d=\"M4 12a8 8 0 0 1 16 0\"/><path d=\"M8 12a4 4 0 0 1 8 0\"/><circle cx=\"12\" cy=\"16\" r=\"1.5\"/><path d=\"M12 20v1\"/>",
  "map": "<path d=\"M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z\"/><path d=\"M9 4v14M15 6v14\"/>",
  "home2": "<path d=\"M3 12 12 4l9 8\"/><path d=\"M5 10v10h14V10\"/><path d=\"M10 20v-5h4v5\"/>",
  "coin": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2\"/>",
  "chart": "<path d=\"M4 20V10M10 20V4M16 20v-7M22 20H2\"/>",
  "dots": "<circle cx=\"5\" cy=\"12\" r=\"1.6\"/><circle cx=\"12\" cy=\"12\" r=\"1.6\"/><circle cx=\"19\" cy=\"12\" r=\"1.6\"/>",
  "back": "<path d=\"m15 6-6 6 6 6\"/>",
  "copy": "<rect x=\"8\" y=\"8\" width=\"12\" height=\"12\" rx=\"2\"/><path d=\"M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2\"/>",
  "ext": "<path d=\"M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5\"/>",
  "share": "<circle cx=\"18\" cy=\"5\" r=\"2.5\"/><circle cx=\"6\" cy=\"12\" r=\"2.5\"/><circle cx=\"18\" cy=\"19\" r=\"2.5\"/><path d=\"m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6\"/>",
  "gift": "<rect x=\"3\" y=\"9\" width=\"18\" height=\"12\" rx=\"1.5\"/><path d=\"M3 13h18M12 9v12M12 9c-1.5-3-6-4-6-1.5S10 9 12 9zM12 9c1.5-3 6-4 6-1.5S14 9 12 9z\"/>",
  "sun": "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4\"/>",
  "cloud2": "<path d=\"M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z\"/>",
  "rain": "<path d=\"M7 15h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 6.5 4.3 4.3 0 0 0 7 15z\"/><path d=\"M9 18l-1 3M13 18l-1 3M17 18l-1 3\"/>",
  "moon": "<path d=\"M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z\"/>",
  "sunrise": "<path d=\"M12 3v5M8 6l4-4 4 4M4 18a8 8 0 0 1 16 0M2 21h20\"/>",
  "sunset": "<path d=\"M12 9V4M8 6l4 4 4-4M4 18a8 8 0 0 1 16 0M2 21h20\"/>",
  "compass": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m15.5 8.5-2 5-5 2 2-5z\"/>",
  "info": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v6M12 7.5h.01\"/>",
  "refresh": "<path d=\"M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4\"/>",
  "video": "<rect x=\"3\" y=\"6\" width=\"13\" height=\"12\" rx=\"2\"/><path d=\"m16 10 5-3v10l-5-3z\"/>",
  "download": "<path d=\"M12 4v11M7 10l5 5 5-5M5 20h14\"/>",
  "pdf": "<path d=\"M6 3h8l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z\"/><path d=\"M14 3v5h5M9 14h6M9 17h4\"/>",
  "send": "<path d=\"m22 2-7 20-4-9-9-4z\"/><path d=\"M22 2 11 13\"/>",
  "stop": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"m5.6 5.6 12.8 12.8\"/>",
  "wifi": "<path d=\"M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0\"/><circle cx=\"12\" cy=\"19.5\" r=\"1\"/>",
  "tg": "<path d=\"m21 4-18 7 6 2 2 6 3-4 5 4z\"/><path d=\"m9 13 9-6\"/>",
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 22, color = 'currentColor', sw = 2, label }: { name: string; size?: number; color?: string; sw?: number; label?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} stroke-width={sw} stroke-linecap="round" stroke-linejoin="round"
      aria-hidden={label ? undefined : 'true'} role={label ? 'img' : undefined} aria-label={label}
      dangerouslySetInnerHTML={{ __html: P[name] || '' }} />
  );
}
